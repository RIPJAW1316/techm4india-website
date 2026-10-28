import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { DifficultyLevel, Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class LmsService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // Courses
  // =========================================================================

  async findAllCourses(filters?: {
    category?: string;
    difficultyLevel?: DifficultyLevel;
    isPublished?: boolean;
    search?: string;
  }) {
    const where: Prisma.CourseWhereInput = {};

    if (filters?.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }
    if (filters?.difficultyLevel) {
      where.difficultyLevel = filters.difficultyLevel;
    }
    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }
    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: { id: true, employeeNumber: true, firstName: true, lastName: true },
        },
        _count: {
          select: { lessons: true, assignments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { id: true, employeeNumber: true, firstName: true, lastName: true },
        },
        program: {
          select: { id: true, code: true, title: true, division: true },
        },
        lessons: {
          orderBy: { lessonNumber: 'asc' },
        },
        assignments: {
          include: {
            _count: {
              select: { submissions: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return course;
  }

  async createCourse(dto: CreateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Course with code "${dto.code}" already exists`);
    }

    return this.prisma.course.create({
      data: {
        code: dto.code,
        title: dto.title,
        category: dto.category,
        programId: dto.programId,
        instructorEmployeeId: dto.instructorEmployeeId,
        thumbnailUrl: dto.thumbnailUrl,
        difficultyLevel: dto.difficultyLevel ?? DifficultyLevel.BEGINNER,
        isPublished: dto.isPublished ?? true,
      },
      include: {
        program: { select: { id: true, title: true } },
      },
    });
  }

  // =========================================================================
  // Lessons
  // =========================================================================

  async addLesson(courseId: string, dto: CreateLessonDto) {
    await this.findCourseById(courseId);

    const existing = await this.prisma.lesson.findUnique({
      where: {
        courseId_lessonNumber: {
          courseId,
          lessonNumber: dto.lessonNumber,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `Lesson number ${dto.lessonNumber} already exists in this course`,
      );
    }

    return this.prisma.lesson.create({
      data: {
        courseId,
        lessonNumber: dto.lessonNumber,
        title: dto.title,
        contentType: dto.contentType,
        contentUrl: dto.contentUrl,
        durationMinutes: dto.durationMinutes ?? 30,
      },
    });
  }

  // =========================================================================
  // Assignments & Submissions
  // =========================================================================

  async addAssignment(courseId: string, dto: CreateAssignmentDto) {
    await this.findCourseById(courseId);

    return this.prisma.assignment.create({
      data: {
        courseId,
        title: dto.title,
        problemStatement: dto.problemStatement,
        maxScore: dto.maxScore ?? 100,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async submitAssignment(assignmentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID "${assignmentId}" not found`);
    }

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${dto.studentId}" not found`);
    }

    return this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: dto.studentId,
        },
      },
      update: {
        repoUrl: dto.repoUrl,
        attachmentUrl: dto.attachmentUrl,
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId: dto.studentId,
        repoUrl: dto.repoUrl,
        attachmentUrl: dto.attachmentUrl,
      },
      include: {
        assignment: { select: { title: true, maxScore: true } },
        student: { select: { studentId: true, firstName: true, lastName: true } },
      },
    });
  }

  async gradeSubmission(submissionId: string, dto: GradeSubmissionDto) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID "${submissionId}" not found`);
    }

    if (dto.scoreAwarded > submission.assignment.maxScore) {
      throw new BadRequestException(
        `Awarded score (${dto.scoreAwarded}) cannot exceed assignment maximum (${submission.assignment.maxScore})`,
      );
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        scoreAwarded: dto.scoreAwarded,
        feedback: dto.feedback,
        gradedById: dto.gradedById,
      },
    });
  }

  // =========================================================================
  // Anti-Fraud Cryptographic Certificates
  // =========================================================================

  async issueCertificate(dto: IssueCertificateDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID "${dto.studentId}" not found`);
    }

    const program = await this.prisma.program.findUnique({
      where: { id: dto.programId },
    });
    if (!program) {
      throw new NotFoundException(`Program with ID "${dto.programId}" not found`);
    }

    // Check for existing certificate for this student and program
    const existing = await this.prisma.certificate.findFirst({
      where: {
        studentId: dto.studentId,
        programId: dto.programId,
        isRevoked: false,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Certificate already issued to this student for program "${program.title}" (${existing.certificateNumber})`,
      );
    }

    const year = new Date().getFullYear();
    const hexSerial = crypto.randomBytes(4).toString('hex').toUpperCase();
    const certificateNumber = `TECHM4-${year}-CERT-${hexSerial}`;
    const verificationToken = `cert_${crypto.randomBytes(16).toString('hex')}`;
    const qrVerificationUrl = `https://techm4india.com/verify-certificate?token=${verificationToken}`;

    return this.prisma.certificate.create({
      data: {
        certificateNumber,
        studentId: dto.studentId,
        programId: dto.programId,
        verificationToken,
        qrVerificationUrl,
        pdfUrl: dto.pdfUrl,
      },
      include: {
        student: {
          select: { studentId: true, firstName: true, lastName: true, email: true },
        },
        program: {
          select: { code: true, title: true, division: true, credits: true },
        },
      },
    });
  }

  async verifyCertificate(token: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { verificationToken: token },
      include: {
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            institution: { select: { name: true, city: true } },
          },
        },
        program: {
          select: {
            code: true,
            title: true,
            division: true,
            credits: true,
            certificationType: true,
          },
        },
      },
    });

    if (!cert) {
      throw new NotFoundException('Certificate verification token is invalid or expired');
    }

    return {
      isValid: !cert.isRevoked,
      certificateNumber: cert.certificateNumber,
      issuedTo: `${cert.student.firstName} ${cert.student.lastName}`,
      studentId: cert.student.studentId,
      institution: cert.student.institution?.name ?? 'Independent Enrollment',
      programTitle: cert.program.title,
      division: cert.program.division,
      credits: cert.program.credits,
      certificationType: cert.program.certificationType,
      issueDate: cert.issueDate,
      isRevoked: cert.isRevoked,
      pdfUrl: cert.pdfUrl,
    };
  }
}
