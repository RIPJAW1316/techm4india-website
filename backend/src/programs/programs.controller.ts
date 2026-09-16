import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { CurrentPrincipal } from "../auth/decorators/current-principal.decorator";
import { RequirePermissions } from "../auth/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { Principal } from "../auth/auth.types";
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
import { ProgramsService } from "./programs.service";

@ApiTags("programs-v2")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ version: "2" })
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  private ok<T>(value: Promise<T> | T) {
    return Promise.resolve(value).then((data) => ({ success: true, data }));
  }

  private list<T extends { data: unknown; meta: unknown }>(value: Promise<T>) {
    return value.then((result) => ({ success: true, ...result }));
  }

  private metadata(request: Request) {
    return {
      ipAddress: request.ip,
      userAgent: request.get("user-agent") ?? undefined,
    };
  }

  @Get("programs")
  @RequirePermissions("programs.read")
  @ApiOperation({ summary: "List programs in the organization" })
  listPrograms(@CurrentPrincipal() principal: Principal, @Query() query: ProgramQueryDto) {
    return this.list(this.programs.listPrograms(principal, query));
  }

  @Get("programs/:id")
  @RequirePermissions("programs.read")
  getProgram(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.programs.getProgram(principal, id));
  }

  @Post("programs")
  @RequirePermissions("programs.manage")
  @ApiOperation({ summary: "Create a program in draft status" })
  createProgram(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateProgramDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.createProgram(principal, dto, this.metadata(request)));
  }

  @Post("programs/:id/modules")
  @RequirePermissions("programs.content.manage")
  createModule(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateProgramModuleDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.createModule(principal, id, dto, this.metadata(request)));
  }

  @Post("program-modules/:id/lessons")
  @RequirePermissions("programs.content.manage")
  createLesson(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateProgramLessonDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.createLesson(principal, id, dto, this.metadata(request)));
  }

  @Post("programs/:id/submit")
  @RequirePermissions("programs.content.manage")
  @ApiOperation({ summary: "Submit a draft program for review" })
  submitProgram(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.submitProgram(principal, id, this.metadata(request)));
  }

  @Post("programs/:id/publish")
  @RequirePermissions("programs.publish")
  @ApiOperation({ summary: "Publish a program that is in review" })
  publishProgram(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.publishProgram(principal, id, this.metadata(request)));
  }

  @Get("students")
  @RequirePermissions("students.read")
  listStudents(@CurrentPrincipal() principal: Principal, @Query() query: StudentQueryDto) {
    return this.list(this.programs.listStudents(principal, query));
  }

  @Post("students")
  @RequirePermissions("students.manage")
  @ApiOperation({ summary: "Register a student with recorded consent" })
  createStudent(
    @CurrentPrincipal() principal: Principal,
    @Body() dto: CreateStudentDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.createStudent(principal, dto, this.metadata(request)));
  }

  @Get("programs/:id/batches")
  @RequirePermissions("programs.batches.read")
  listBatches(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: ProgramBatchQueryDto,
  ) {
    return this.list(this.programs.listBatches(principal, id, query));
  }

  @Get("program-batches/:id")
  @RequirePermissions("programs.batches.read")
  getBatch(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.programs.getBatch(principal, id));
  }

  @Post("programs/:id/batches")
  @RequirePermissions("programs.batches.manage")
  createBatch(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateProgramBatchDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.createBatch(principal, id, dto, this.metadata(request)));
  }

  @Post("program-batches/:id/open")
  @RequirePermissions("programs.batches.manage")
  openBatch(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.openBatch(principal, id, this.metadata(request)));
  }

  @Post("program-batches/:id/enrollments")
  @RequirePermissions("programs.enrollments.manage")
  createEnrollment(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateEnrollmentDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.createEnrollment(principal, id, dto, this.metadata(request)));
  }

  @Get("program-enrollments/:id")
  @RequirePermissions("programs.batches.read")
  getEnrollment(@CurrentPrincipal() principal: Principal, @Param("id", ParseUUIDPipe) id: string) {
    return this.ok(this.programs.getEnrollment(principal, id));
  }

  @Put("program-enrollments/:id/lessons/:lessonId/progress")
  @RequirePermissions("programs.enrollments.manage")
  @ApiOperation({ summary: "Record lesson progress and recalculate completion" })
  updateLessonProgress(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lessonId", ParseUUIDPipe) lessonId: string,
    @Body() dto: UpdateLessonProgressDto,
    @Req() request: Request,
  ) {
    return this.ok(
      this.programs.updateLessonProgress(principal, id, lessonId, dto, this.metadata(request)),
    );
  }

  @Get("programs/:id/assignments")
  @RequirePermissions("programs.read")
  listAssignments(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: ProgramsPagingDto,
  ) {
    return this.list(this.programs.listAssignments(principal, id, query));
  }

  @Post("programs/:id/assignments")
  @RequirePermissions("programs.content.manage")
  @ApiOperation({ summary: "Create a graded assignment for a program" })
  createAssignment(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateAssignmentDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.createAssignment(principal, id, dto, this.metadata(request)));
  }

  @Post("program-enrollments/:id/submissions")
  @RequirePermissions("programs.enrollments.manage")
  createSubmission(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateSubmissionDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.createSubmission(principal, id, dto, this.metadata(request)));
  }

  @Post("assignment-submissions/:id/grade")
  @RequirePermissions("programs.content.manage")
  @ApiOperation({ summary: "Grade a submission against the assignment maximum" })
  gradeSubmission(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GradeSubmissionDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.gradeSubmission(principal, id, dto, this.metadata(request)));
  }

  @Post("program-enrollments/:id/certificate")
  @RequirePermissions("programs.content.manage")
  @ApiOperation({ summary: "Issue a completion certificate for a finished enrollment" })
  issueCertificate(
    @CurrentPrincipal() principal: Principal,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: IssueCertificateDto,
    @Req() request: Request,
  ) {
    return this.ok(this.programs.issueCertificate(principal, id, dto, this.metadata(request)));
  }
}
