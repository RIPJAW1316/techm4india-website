import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  ProgramBatchStatus,
  ProgramContentType,
  ProgramEnrollmentStatus,
  ProgramLessonStatus,
  ProgramStatus,
} from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateAssignmentDto,
  CreateEnrollmentDto,
  CreateProgramBatchDto,
  CreateProgramDto,
  CreateProgramLessonDto,
  CreateProgramModuleDto,
  CreateStudentDto,
  CreateSubmissionDto,
  GradeSubmissionDto,
  IssueCertificateDto,
  ProgramBatchQueryDto,
  ProgramQueryDto,
  ProgramsPagingDto,
  StudentQueryDto,
  UpdateLessonProgressDto,
} from "./dto/programs.dto";

const programInclude = {
  division: { select: { id: true, name: true, slug: true } },
  department: { select: { id: true, name: true, slug: true } },
  _count: { select: { modules: true, batches: true } },
} satisfies Prisma.ProgramInclude;

const batchInclude = {
  program: { select: { id: true, code: true, name: true, status: true } },
  trainer: {
    select: { id: true, firstName: true, lastName: true, designation: true },
  },
  _count: { select: { enrollments: true } },
} satisfies Prisma.ProgramBatchInclude;

@Injectable()
export class ProgramsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private organizationId(principal: Principal): string {
    if (!principal.organizationId) {
      throw new ForbiddenException("Organization context required");
    }
    return principal.organizationId;
  }

  private page(query: { page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return { page, limit, skip: (page - 1) * limit, take: limit };
  }

  private async record(
    action: string,
    principal: Principal,
    entityType: string,
    entityId: string,
    request?: RequestMetadata,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.audit.record({
      action,
      actorUserId: principal.userId,
      entityType,
      entityId,
      request,
      metadata,
    });
  }

  private duplicate(error: unknown, message: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictException(message);
    }
    throw error;
  }

  private async validateOrganizationReferences(
    principal: Principal,
    references: { divisionId?: string; departmentId?: string },
  ): Promise<void> {
    const organizationId = this.organizationId(principal);
    if (references.divisionId) {
      const division = await this.prisma.division.findFirst({
        where: { id: references.divisionId, organizationId },
        select: { id: true },
      });
      if (!division) throw new NotFoundException("Division not found in organization");
    }
    if (references.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: {
          id: references.departmentId,
          division: { organizationId },
          ...(references.divisionId ? { divisionId: references.divisionId } : {}),
        },
        select: { id: true },
      });
      if (!department) {
        throw new NotFoundException("Department not found in organization or division");
      }
    }
  }

  private async employeeInOrganization(
    principal: Principal,
    employeeId: string,
    label = "Employee",
  ): Promise<void> {
    const row = await this.prisma.employee.findFirst({
      where: {
        id: employeeId,
        division: { organizationId: this.organizationId(principal) },
        employmentStatus: { notIn: ["EXITED", "TERMINATED", "RESIGNED"] },
      },
      select: { id: true },
    });
    if (!row) throw new NotFoundException(`${label} not found in organization`);
  }

  private async institutionInOrganization(
    principal: Principal,
    institutionId: string,
  ): Promise<void> {
    const row = await this.prisma.institution.findFirst({
      where: { id: institutionId, organizationId: this.organizationId(principal) },
      select: { id: true },
    });
    if (!row) throw new NotFoundException("Institution not found in organization");
  }

  private consentTimestamp(value: string): Date {
    const consentAt = new Date(value);
    if (consentAt.getTime() > Date.now() + 5 * 60_000) {
      throw new BadRequestException("Consent timestamp cannot be in the future");
    }
    return consentAt;
  }

  private async program(principal: Principal, id: string) {
    const row = await this.prisma.program.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: programInclude,
    });
    if (!row) throw new NotFoundException("Program not found");
    return row;
  }

  private async batch(principal: Principal, id: string) {
    const row = await this.prisma.programBatch.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      include: batchInclude,
    });
    if (!row) throw new NotFoundException("Batch not found");
    return row;
  }

  // ----- Programs ----------------------------------------------------------

  async listPrograms(principal: Principal, query: ProgramQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.ProgramWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.program.findMany({
        where,
        include: programInclude,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.program.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  getProgram(principal: Principal, id: string) {
    return this.prisma.program
      .findFirst({
        where: { id, organizationId: this.organizationId(principal) },
        include: {
          ...programInclude,
          modules: {
            orderBy: { position: "asc" },
            include: { lessons: { orderBy: { position: "asc" } } },
          },
        },
      })
      .then((row) => {
        if (!row) throw new NotFoundException("Program not found");
        return row;
      });
  }

  async createProgram(
    principal: Principal,
    dto: CreateProgramDto,
    request?: RequestMetadata,
  ) {
    await this.validateOrganizationReferences(principal, dto);
    let row;
    try {
      row = await this.prisma.program.create({
        data: {
          organizationId: this.organizationId(principal),
          divisionId: dto.divisionId,
          departmentId: dto.departmentId,
          code: dto.code.trim().toUpperCase(),
          name: dto.name.trim(),
          slug: dto.slug.trim().toLowerCase(),
          version: dto.version?.trim() ?? "1.0",
          category: dto.category.trim(),
          subCategory: dto.subCategory?.trim(),
          shortDescription: dto.shortDescription.trim(),
          longDescription: dto.longDescription?.trim(),
          outcomes: dto.outcomes?.trim(),
          eligibility: dto.eligibility?.trim(),
          durationHours: new Prisma.Decimal(dto.durationHours),
          deliveryMode: dto.deliveryMode,
          assessmentMethod: dto.assessmentMethod.trim(),
          capacity: dto.capacity,
          certificateType: dto.certificateType?.trim(),
          createdByUserId: principal.userId,
        },
        include: programInclude,
      });
    } catch (error) {
      this.duplicate(error, "A program with this code or slug and version already exists");
    }
    await this.record(
      "PROGRAM_CREATED",
      principal,
      "Program",
      row.id,
      request,
      { code: row.code, version: row.version },
    );
    return row;
  }

  async submitProgram(
    principal: Principal,
    id: string,
    request?: RequestMetadata,
  ) {
    const current = await this.program(principal, id);
    if (current.status !== ProgramStatus.DRAFT) {
      throw new ConflictException("Only draft programs can be submitted for review");
    }
    const lessonCount = await this.prisma.programLesson.count({
      where: { module: { programId: id } },
    });
    if (current._count.modules < 1 || lessonCount < 1) {
      throw new ConflictException(
        "A program needs at least one module and one lesson before review",
      );
    }
    const row = await this.prisma.program.update({
      where: { id },
      data: { status: ProgramStatus.IN_REVIEW },
      include: programInclude,
    });
    await this.record("PROGRAM_SUBMITTED", principal, "Program", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }

  async publishProgram(
    principal: Principal,
    id: string,
    request?: RequestMetadata,
  ) {
    const current = await this.program(principal, id);
    if (current.status !== ProgramStatus.IN_REVIEW) {
      throw new ConflictException("Only programs in review can be published");
    }
    const now = new Date();
    const row = await this.prisma.$transaction(async (tx) => {
      const published = await tx.program.update({
        where: { id },
        data: {
          status: ProgramStatus.PUBLISHED,
          reviewedByUserId: principal.userId,
          reviewedAt: now,
          publishedByUserId: principal.userId,
          publishedAt: now,
        },
        include: programInclude,
      });
      await tx.programLesson.updateMany({
        where: { module: { programId: id } },
        data: { status: ProgramLessonStatus.PUBLISHED },
      });
      return published;
    });
    await this.record("PROGRAM_PUBLISHED", principal, "Program", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }

  // ----- Curriculum --------------------------------------------------------

  async createModule(
    principal: Principal,
    programId: string,
    dto: CreateProgramModuleDto,
    request?: RequestMetadata,
  ) {
    const program = await this.program(principal, programId);
    this.assertContentEditable(program.status);
    let row;
    try {
      row = await this.prisma.programModule.create({
        data: {
          programId,
          title: dto.title.trim(),
          description: dto.description?.trim(),
          position: dto.position,
        },
      });
    } catch (error) {
      this.duplicate(error, "A module already exists at this position");
    }
    await this.record(
      "PROGRAM_MODULE_CREATED",
      principal,
      "ProgramModule",
      row.id,
      request,
      { programId },
    );
    return row;
  }

  async createLesson(
    principal: Principal,
    moduleId: string,
    dto: CreateProgramLessonDto,
    request?: RequestMetadata,
  ) {
    const module = await this.prisma.programModule.findFirst({
      where: {
        id: moduleId,
        program: { organizationId: this.organizationId(principal) },
      },
      include: { program: { select: { id: true, status: true } } },
    });
    if (!module) throw new NotFoundException("Module not found");
    this.assertContentEditable(module.program.status);
    if (dto.contentType === ProgramContentType.TEXT) {
      if (!dto.contentBody?.trim()) {
        throw new BadRequestException("Text lessons require a content body");
      }
    } else if (!dto.contentUrl?.trim()) {
      throw new BadRequestException(
        "Video, PDF and live lessons require an HTTPS content URL",
      );
    }
    let row;
    try {
      row = await this.prisma.programLesson.create({
        data: {
          moduleId,
          title: dto.title.trim(),
          description: dto.description?.trim(),
          contentType: dto.contentType,
          contentBody: dto.contentBody?.trim(),
          contentUrl: dto.contentUrl?.trim(),
          durationMinutes: dto.durationMinutes ?? 0,
          position: dto.position,
        },
      });
    } catch (error) {
      this.duplicate(error, "A lesson already exists at this position");
    }
    await this.record(
      "PROGRAM_LESSON_CREATED",
      principal,
      "ProgramLesson",
      row.id,
      request,
      { moduleId, programId: module.program.id },
    );
    return row;
  }

  private assertContentEditable(status: ProgramStatus): void {
    if (status !== ProgramStatus.DRAFT && status !== ProgramStatus.IN_REVIEW) {
      throw new ConflictException(
        "Curriculum can only be edited while a program is in draft or review",
      );
    }
  }

  // ----- Students ----------------------------------------------------------

  async listStudents(principal: Principal, query: StudentQueryDto) {
    const organizationId = this.organizationId(principal);
    const { page, limit, skip, take } = this.page(query);
    const search = query.search?.trim();
    const where: Prisma.StudentWhereInput = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { studentCode: { contains: search, mode: "insensitive" } },
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.student.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createStudent(
    principal: Principal,
    dto: CreateStudentDto,
    request?: RequestMetadata,
  ) {
    const consentAt = this.consentTimestamp(dto.consentAt);
    if (dto.institutionId) {
      await this.institutionInOrganization(principal, dto.institutionId);
    }
    let row;
    try {
      row = await this.prisma.student.create({
        data: {
          organizationId: this.organizationId(principal),
          institutionId: dto.institutionId,
          studentCode: dto.studentCode.trim().toUpperCase(),
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: dto.email?.trim().toLowerCase(),
          phone: dto.phone?.trim(),
          guardianName: dto.guardianName?.trim(),
          guardianPhone: dto.guardianPhone?.trim(),
          consentAt,
        },
      });
    } catch (error) {
      this.duplicate(error, "Student code already exists in this organization");
    }
    await this.record("STUDENT_CREATED", principal, "Student", row.id, request, {
      studentCode: row.studentCode,
    });
    return row;
  }

  // ----- Batches -----------------------------------------------------------

  async createBatch(
    principal: Principal,
    programId: string,
    dto: CreateProgramBatchDto,
    request?: RequestMetadata,
  ) {
    const program = await this.program(principal, programId);
    if (program.status !== ProgramStatus.PUBLISHED) {
      throw new ConflictException("Batches require a published program");
    }
    if (dto.trainerEmployeeId) {
      await this.employeeInOrganization(principal, dto.trainerEmployeeId, "Trainer");
    }
    if (dto.institutionId) {
      await this.institutionInOrganization(principal, dto.institutionId);
    }
    const startsOn = new Date(dto.startsOn);
    const endsOn = new Date(dto.endsOn);
    if (endsOn.getTime() < startsOn.getTime()) {
      throw new BadRequestException("Batch end date must be on or after the start date");
    }
    let row;
    try {
      row = await this.prisma.programBatch.create({
        data: {
          organizationId: this.organizationId(principal),
          programId,
          institutionId: dto.institutionId,
          trainerEmployeeId: dto.trainerEmployeeId,
          code: dto.code.trim().toUpperCase(),
          name: dto.name.trim(),
          startsOn,
          endsOn,
          capacity: dto.capacity,
        },
        include: batchInclude,
      });
    } catch (error) {
      this.duplicate(error, "Batch code already exists in this organization");
    }
    await this.record(
      "PROGRAM_BATCH_CREATED",
      principal,
      "ProgramBatch",
      row.id,
      request,
      { programId, code: row.code },
    );
    return row;
  }

  async listBatches(
    principal: Principal,
    programId: string,
    query: ProgramBatchQueryDto,
  ) {
    await this.program(principal, programId);
    const { page, limit, skip, take } = this.page(query);
    const where: Prisma.ProgramBatchWhereInput = {
      organizationId: this.organizationId(principal),
      programId,
      ...(query.status ? { status: query.status } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.programBatch.findMany({
        where,
        include: batchInclude,
        orderBy: [{ startsOn: "desc" }],
        skip,
        take,
      }),
      this.prisma.programBatch.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  getBatch(principal: Principal, id: string) {
    return this.prisma.programBatch
      .findFirst({
        where: { id, organizationId: this.organizationId(principal) },
        include: {
          program: { select: { id: true, code: true, name: true, status: true } },
          trainer: {
            select: { id: true, firstName: true, lastName: true, designation: true },
          },
          enrollments: {
            orderBy: { enrolledAt: "desc" },
            include: {
              student: {
                select: {
                  id: true,
                  studentCode: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      })
      .then((row) => {
        if (!row) throw new NotFoundException("Batch not found");
        return row;
      });
  }

  async openBatch(principal: Principal, id: string, request?: RequestMetadata) {
    const current = await this.batch(principal, id);
    if (current.status !== ProgramBatchStatus.PLANNED) {
      throw new ConflictException("Only planned batches can be opened");
    }
    const row = await this.prisma.programBatch.update({
      where: { id },
      data: { status: ProgramBatchStatus.OPEN },
      include: batchInclude,
    });
    await this.record("PROGRAM_BATCH_OPENED", principal, "ProgramBatch", id, request, {
      from: current.status,
      to: row.status,
    });
    return row;
  }

  async createEnrollment(
    principal: Principal,
    batchId: string,
    dto: CreateEnrollmentDto,
    request?: RequestMetadata,
  ) {
    const batch = await this.batch(principal, batchId);
    if (
      batch.status !== ProgramBatchStatus.OPEN &&
      batch.status !== ProgramBatchStatus.ACTIVE
    ) {
      throw new ConflictException("Enrollments require an open or active batch");
    }
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, organizationId: this.organizationId(principal) },
      select: { id: true, status: true },
    });
    if (!student) throw new NotFoundException("Student not found");
    if (student.status !== "ACTIVE") {
      throw new ConflictException("Only active students can be enrolled");
    }
    const activeEnrollments = await this.prisma.programEnrollment.count({
      where: {
        batchId,
        status: {
          in: [ProgramEnrollmentStatus.ACTIVE, ProgramEnrollmentStatus.COMPLETED],
        },
      },
    });
    if (activeEnrollments >= batch.capacity) {
      throw new ConflictException("Batch capacity has been reached");
    }
    let row;
    try {
      row = await this.prisma.programEnrollment.create({
        data: {
          organizationId: this.organizationId(principal),
          batchId,
          studentId: dto.studentId,
        },
      });
    } catch (error) {
      this.duplicate(error, "Student is already enrolled in this batch");
    }
    await this.record(
      "PROGRAM_ENROLLMENT_CREATED",
      principal,
      "ProgramEnrollment",
      row.id,
      request,
      { batchId, studentId: dto.studentId },
    );
    return row;
  }

  getEnrollment(principal: Principal, id: string) {
    return this.prisma.programEnrollment
      .findFirst({
        where: { id, organizationId: this.organizationId(principal) },
        include: {
          student: {
            select: { id: true, studentCode: true, firstName: true, lastName: true },
          },
          batch: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true,
              program: { select: { id: true, code: true, name: true } },
            },
          },
          progress: {
            include: {
              lesson: { select: { id: true, title: true, position: true } },
            },
          },
        },
      })
      .then((row) => {
        if (!row) throw new NotFoundException("Enrollment not found");
        return row;
      });
  }

  async updateLessonProgress(
    principal: Principal,
    enrollmentId: string,
    lessonId: string,
    dto: UpdateLessonProgressDto,
    request?: RequestMetadata,
  ) {
    const enrollment = await this.prisma.programEnrollment.findFirst({
      where: { id: enrollmentId, organizationId: this.organizationId(principal) },
      include: { batch: { select: { programId: true } } },
    });
    if (!enrollment) throw new NotFoundException("Enrollment not found");
    if (enrollment.status === ProgramEnrollmentStatus.CANCELLED) {
      throw new ConflictException("Cancelled enrollments cannot record progress");
    }
    const lesson = await this.prisma.programLesson.findFirst({
      where: { id: lessonId, module: { programId: enrollment.batch.programId } },
      select: { id: true },
    });
    if (!lesson) throw new NotFoundException("Lesson not found for this enrollment");

    const lessonCompleted = dto.progressPercent >= 100;
    const row = await this.prisma.$transaction(async (tx) => {
      await tx.lessonProgress.upsert({
        where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
        create: {
          enrollmentId,
          lessonId,
          progressPercent: new Prisma.Decimal(dto.progressPercent),
          completedAt: lessonCompleted ? new Date() : null,
        },
        update: {
          progressPercent: new Prisma.Decimal(dto.progressPercent),
          completedAt: lessonCompleted ? new Date() : null,
        },
      });
      const totalLessons = await tx.programLesson.count({
        where: { module: { programId: enrollment.batch.programId } },
      });
      const aggregate = await tx.lessonProgress.aggregate({
        where: { enrollmentId },
        _sum: { progressPercent: true },
      });
      const completedSum = Number(aggregate._sum.progressPercent ?? 0);
      const percent =
        totalLessons > 0
          ? Math.min(100, Math.round((completedSum / totalLessons) * 100) / 100)
          : 0;
      const enrollmentCompleted = totalLessons > 0 && percent >= 100;
      return tx.programEnrollment.update({
        where: { id: enrollmentId },
        data: {
          progressPercent: new Prisma.Decimal(percent.toFixed(2)),
          status: enrollmentCompleted
            ? ProgramEnrollmentStatus.COMPLETED
            : ProgramEnrollmentStatus.ACTIVE,
          completedAt: enrollmentCompleted ? new Date() : null,
        },
      });
    });
    await this.record(
      "PROGRAM_LESSON_PROGRESS_UPDATED",
      principal,
      "ProgramEnrollment",
      enrollmentId,
      request,
      { lessonId, progressPercent: dto.progressPercent },
    );
    return row;
  }

  // ----- Assignments, grading & certificates -------------------------------

  async listAssignments(principal: Principal, programId: string, query: ProgramsPagingDto) {
    await this.program(principal, programId);
    const { page, limit, skip, take } = this.page(query);
    const where: Prisma.ProgramAssignmentWhereInput = {
      organizationId: this.organizationId(principal),
      programId,
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.programAssignment.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take,
      }),
      this.prisma.programAssignment.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
  }

  async createAssignment(
    principal: Principal,
    programId: string,
    dto: CreateAssignmentDto,
    request?: RequestMetadata,
  ) {
    await this.program(principal, programId);
    const row = await this.prisma.programAssignment.create({
      data: {
        organizationId: this.organizationId(principal),
        programId,
        title: dto.title.trim(),
        instructions: dto.instructions?.trim(),
        maxScore: new Prisma.Decimal(dto.maxScore ?? 100),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        createdByUserId: principal.userId,
      },
    });
    await this.record("PROGRAM_ASSIGNMENT_CREATED", principal, "ProgramAssignment", row.id, request, {
      programId,
    });
    return row;
  }

  async createSubmission(
    principal: Principal,
    enrollmentId: string,
    dto: CreateSubmissionDto,
    request?: RequestMetadata,
  ) {
    const organizationId = this.organizationId(principal);
    const enrollment = await this.prisma.programEnrollment.findFirst({
      where: { id: enrollmentId, organizationId },
      include: { batch: { select: { programId: true } } },
    });
    if (!enrollment) throw new NotFoundException("Enrollment not found");
    const assignment = await this.prisma.programAssignment.findFirst({
      where: { id: dto.assignmentId, organizationId, programId: enrollment.batch.programId },
      select: { id: true },
    });
    if (!assignment) {
      throw new NotFoundException("Assignment not found for this enrollment's program");
    }
    let row;
    try {
      row = await this.prisma.assignmentSubmission.create({
        data: {
          assignmentId: dto.assignmentId,
          enrollmentId,
          submissionUrl: dto.submissionUrl?.trim(),
          note: dto.note?.trim(),
        },
      });
    } catch (error) {
      this.duplicate(error, "A submission already exists for this assignment and enrollment");
    }
    await this.record("PROGRAM_ASSIGNMENT_SUBMITTED", principal, "AssignmentSubmission", row.id, request, {
      enrollmentId,
      assignmentId: dto.assignmentId,
    });
    return row;
  }

  async gradeSubmission(
    principal: Principal,
    id: string,
    dto: GradeSubmissionDto,
    request?: RequestMetadata,
  ) {
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: { id, assignment: { organizationId: this.organizationId(principal) } },
      include: { assignment: { select: { maxScore: true } } },
    });
    if (!submission) throw new NotFoundException("Submission not found");
    if (dto.score > Number(submission.assignment.maxScore)) {
      throw new BadRequestException(
        `Score cannot exceed the assignment maximum of ${submission.assignment.maxScore}`,
      );
    }
    const row = await this.prisma.assignmentSubmission.update({
      where: { id },
      data: {
        status: "GRADED",
        score: new Prisma.Decimal(dto.score),
        feedback: dto.feedback?.trim(),
        gradedByUserId: principal.userId,
        gradedAt: new Date(),
      },
    });
    await this.record("PROGRAM_ASSIGNMENT_GRADED", principal, "AssignmentSubmission", id, request, {
      score: dto.score,
    });
    return row;
  }

  async issueCertificate(
    principal: Principal,
    enrollmentId: string,
    dto: IssueCertificateDto,
    request?: RequestMetadata,
  ) {
    const enrollment = await this.prisma.programEnrollment.findFirst({
      where: { id: enrollmentId, organizationId: this.organizationId(principal) },
      include: {
        certificate: { select: { id: true } },
        batch: { select: { program: { select: { name: true } } } },
      },
    });
    if (!enrollment) throw new NotFoundException("Enrollment not found");
    if (enrollment.status !== ProgramEnrollmentStatus.COMPLETED) {
      throw new ConflictException("Certificates can only be issued for completed enrollments");
    }
    if (enrollment.certificate) {
      throw new ConflictException("A certificate has already been issued for this enrollment");
    }
    const certificateNumber = `CERT-${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;
    const row = await this.prisma.programCertificate.create({
      data: {
        organizationId: this.organizationId(principal),
        enrollmentId,
        certificateNumber,
        title: dto.title?.trim() ?? `Certificate of Completion — ${enrollment.batch.program.name}`,
        issuedByUserId: principal.userId,
      },
    });
    await this.record("PROGRAM_CERTIFICATE_ISSUED", principal, "ProgramCertificate", row.id, request, {
      enrollmentId,
    });
    return row;
  }
}
