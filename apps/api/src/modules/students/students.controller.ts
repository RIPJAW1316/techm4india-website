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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { CreateStudentFeeDto } from './dto/create-fee.dto';
import { RecordFeePaymentDto } from './dto/record-payment.dto';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { UpdateGrievanceDto } from './dto/update-grievance.dto';

@ApiTags('Students & Admissions')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter student directory' })
  @ApiQuery({ name: 'batchId', required: false, type: String })
  @ApiQuery({ name: 'institutionId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getStudents(
    @Query('batchId') batchId?: string,
    @Query('institutionId') institutionId?: string,
    @Query('search') search?: string,
  ) {
    return this.studentsService.findAllStudents({
      batchId,
      institutionId,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get 360° student profile with batch, fees, submissions, and certificates' })
  async getStudentById(@Param('id') id: string) {
    return this.studentsService.findStudentById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new student profile with KYC data' })
  @ApiResponse({ status: 201, description: 'Student registered successfully' })
  async createStudent(@Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(dto);
  }

  @Post(':id/enroll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atomically enroll student into an academic batch with capacity checks' })
  async enrollStudent(
    @Param('id') id: string,
    @Body() dto: EnrollStudentDto,
  ) {
    return this.studentsService.enrollStudentInBatch(id, dto.batchId);
  }

  @Post(':id/fees')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Issue fee demand (tuition/lab/exam) with automated net balance calculation' })
  async createFee(
    @Param('id') id: string,
    @Body() dto: CreateStudentFeeDto,
  ) {
    return this.studentsService.createFee(id, dto);
  }

  @Post('fees/:feeId/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record fee payment with real-time balance reconciliation' })
  async recordFeePayment(
    @Param('feeId') feeId: string,
    @Body() dto: RecordFeePaymentDto,
  ) {
    return this.studentsService.recordFeePayment(feeId, dto);
  }

  @Post(':id/grievances')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit student grievance or ticket with SLA tracking' })
  async createGrievance(
    @Param('id') id: string,
    @Body() dto: CreateGrievanceDto,
  ) {
    return this.studentsService.createGrievance(id, dto);
  }

  @Patch('grievances/:ticketNumber')
  @ApiOperation({ summary: 'Update or resolve student grievance ticket' })
  async updateGrievance(
    @Param('ticketNumber') ticketNumber: string,
    @Body() dto: UpdateGrievanceDto,
  ) {
    return this.studentsService.updateGrievance(ticketNumber, dto);
  }
}
