import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LmsService } from './lms.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { DifficultyLevel } from '@prisma/client';

@ApiTags('LMS & Course Delivery')
@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  // =========================================================================
  // Courses
  // =========================================================================

  @Get('courses')
  @ApiOperation({ summary: 'List LMS courses with filtering' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'difficultyLevel', required: false, enum: DifficultyLevel })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getCourses(
    @Query('category') category?: string,
    @Query('difficultyLevel') difficultyLevel?: DifficultyLevel,
    @Query('isPublished') isPublished?: string,
    @Query('search') search?: string,
  ) {
    const pubBool = isPublished !== undefined ? isPublished === 'true' : undefined;
    return this.lmsService.findAllCourses({
      category,
      difficultyLevel,
      isPublished: pubBool,
      search,
    });
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course details with sequential lessons and assignments' })
  async getCourseById(@Param('id') id: string) {
    return this.lmsService.findCourseById(id);
  }

  @Post('courses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new LMS course' })
  @ApiResponse({ status: 201, description: 'LMS course created successfully' })
  async createCourse(@Body() dto: CreateCourseDto) {
    return this.lmsService.createCourse(dto);
  }

  // =========================================================================
  // Lessons
  // =========================================================================

  @Post('courses/:courseId/lessons')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add video, lab guide, or quiz lesson to course' })
  async addLesson(
    @Param('courseId') courseId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lmsService.addLesson(courseId, dto);
  }

  // =========================================================================
  // Assignments & Grading
  // =========================================================================

  @Post('courses/:courseId/assignments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create assignment or mini-project for course' })
  async addAssignment(
    @Param('courseId') courseId: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.lmsService.addAssignment(courseId, dto);
  }

  @Post('assignments/:assignmentId/submissions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Student submits assignment code repo or attachment' })
  async submitAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.lmsService.submitAssignment(assignmentId, dto);
  }

  @Patch('submissions/:submissionId/grade')
  @ApiOperation({ summary: 'Instructor grades assignment submission with score and feedback' })
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.lmsService.gradeSubmission(submissionId, dto);
  }

  // =========================================================================
  // Cryptographic Certificates
  // =========================================================================

  @Post('certificates/issue')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Issue tamper-proof cryptographic certificate to student' })
  @ApiResponse({ status: 201, description: 'Certificate issued with verification token and QR URL' })
  async issueCertificate(@Body() dto: IssueCertificateDto) {
    return this.lmsService.issueCertificate(dto);
  }

  @Get('certificates/verify/:token')
  @ApiOperation({ summary: 'Public employer verification endpoint for digital certificates' })
  async verifyCertificate(@Param('token') token: string) {
    return this.lmsService.verifyCertificate(token);
  }
}
