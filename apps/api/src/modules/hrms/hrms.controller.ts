import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { HrmsService } from './hrms.service';
import {
  AddDiscussionReplyDto,
  ApplyLeaveDto,
  ClockInOutDto,
  CreateAnnouncementDto,
  CreateDiscussionTopicDto,
  CreateEmployeeDto,
  CreateIncidentReportDto,
  PaginationQueryDto,
  ProcessPayrollDto,
  RegularizeAttendanceDto,
  ReviewClaimDto,
  ReviewLeaveDto,
  SalaryStructureDto,
  SubmitExpenseClaimDto,
  UpdateEmployeeDto,
} from './dto/hrms.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('HRMS Module')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('hrms')
export class HrmsController {
  constructor(private readonly hrmsService: HrmsService) {}

  // ---------------------------------------------------------------------------
  // Dashboard & Overview
  // ---------------------------------------------------------------------------
  @Get('dashboard/summary')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'HRMS Dashboard KPI & Self-Service Summary' })
  async getDashboardSummary(
    @CurrentUser('userId') userId: string,
    @CurrentUser('roles') roles: string[],
  ) {
    return this.hrmsService.getDashboardSummary(userId, roles || []);
  }

  @Get('me')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'Current Employee Profile' })
  async getMyEmployeeProfile(@CurrentUser('userId') userId: string) {
    return this.hrmsService.getEmployeeByUserId(userId);
  }

  // ---------------------------------------------------------------------------
  // Employees
  // ---------------------------------------------------------------------------
  @Get('employees')
  @Permissions('hrms:employees:read')
  @ApiOperation({ summary: 'List Employees (Directory)' })
  async listEmployees(@Query() query: PaginationQueryDto) {
    return this.hrmsService.listEmployees(query);
  }

  @Get('employees/:id')
  @Permissions('hrms:employees:read')
  @ApiOperation({ summary: 'Get Employee Detail' })
  async getEmployeeById(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('roles') roles: string[],
  ) {
    return this.hrmsService.getEmployeeById(id, userId, roles || []);
  }

  @Post('employees')
  @Permissions('hrms:employees:manage')
  @ApiOperation({ summary: 'Create Employee Record' })
  async createEmployee(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.hrmsService.createEmployee(dto, orgId || 'TECHM4INDIA');
  }

  @Patch('employees/:id')
  @Permissions('hrms:employees:manage')
  @ApiOperation({ summary: 'Update Employee Record' })
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.hrmsService.updateEmployee(id, dto);
  }

  // ---------------------------------------------------------------------------
  // Leave Management (e-Leave)
  // ---------------------------------------------------------------------------
  @Get('leave/types')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Leave Types & Policies' })
  async listLeaveTypes() {
    return this.hrmsService.listLeaveTypes();
  }

  @Get('leave/balances')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'Get Leave Balances' })
  async getLeaveBalances(
    @CurrentUser('userId') userId: string,
    @Query('employeeId') employeeId?: string,
    @Query('year') year?: number,
  ) {
    let targetEmpId = employeeId;
    if (!targetEmpId) {
      const emp = await this.hrmsService.getEmployeeByUserId(userId);
      targetEmpId = emp.id;
    }
    return this.hrmsService.getLeaveBalances(targetEmpId, year);
  }

  @Get('leave/applications')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Leave Applications' })
  async listLeaveApplications(
    @CurrentUser('userId') userId: string,
    @CurrentUser('roles') roles: string[],
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    const isHrOrAdmin =
      roles?.includes('SUPER_ADMIN') ||
      roles?.includes('HRMS_ADMIN') ||
      roles?.includes('HR_MANAGER');

    let targetEmpId = employeeId;
    if (!isHrOrAdmin && !targetEmpId) {
      const emp = await this.hrmsService.getEmployeeByUserId(userId);
      targetEmpId = emp.id;
    }

    return this.hrmsService.listLeaveApplications({ employeeId: targetEmpId, status });
  }

  @Post('leave/apply')
  @Permissions('hrms:leave:apply')
  @ApiOperation({ summary: 'Submit Leave Application' })
  async applyLeave(
    @CurrentUser('userId') userId: string,
    @Body() dto: ApplyLeaveDto,
  ) {
    const emp = await this.hrmsService.getEmployeeByUserId(userId);
    return this.hrmsService.applyLeave(emp.id, dto);
  }

  @Patch('leave/applications/:id/review')
  @Permissions('hrms:leave:approve')
  @ApiOperation({ summary: 'Approve or Reject Leave Application' })
  async reviewLeave(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: ReviewLeaveDto,
  ) {
    return this.hrmsService.reviewLeave(id, userId, dto);
  }

  // ---------------------------------------------------------------------------
  // Time Clock & Attendance
  // ---------------------------------------------------------------------------
  @Get('attendance/today')
  @Permissions('hrms:attendance:clock')
  @ApiOperation({ summary: 'Today Clock Status' })
  async getTodayAttendance(@CurrentUser('userId') userId: string) {
    const emp = await this.hrmsService.getEmployeeByUserId(userId);
    return this.hrmsService.getTodayAttendance(emp.id);
  }

  @Post('attendance/clock-in')
  @Permissions('hrms:attendance:clock')
  @ApiOperation({ summary: 'Clock In' })
  async clockIn(
    @CurrentUser('userId') userId: string,
    @Req() req: Request,
    @Body() dto: ClockInOutDto,
  ) {
    const emp = await this.hrmsService.getEmployeeByUserId(userId);
    const ip = (req.ip || req.socket.remoteAddress) as string;
    return this.hrmsService.clockIn(emp.id, ip, dto);
  }

  @Post('attendance/clock-out')
  @Permissions('hrms:attendance:clock')
  @ApiOperation({ summary: 'Clock Out' })
  async clockOut(
    @CurrentUser('userId') userId: string,
    @Req() req: Request,
    @Body() dto: ClockInOutDto,
  ) {
    const emp = await this.hrmsService.getEmployeeByUserId(userId);
    const ip = (req.ip || req.socket.remoteAddress) as string;
    return this.hrmsService.clockOut(emp.id, ip, dto);
  }

  @Get('attendance/records')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'Attendance Timesheet Records' })
  async listAttendanceRecords(
    @CurrentUser('userId') userId: string,
    @CurrentUser('roles') roles: string[],
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const isHrOrAdmin =
      roles?.includes('SUPER_ADMIN') ||
      roles?.includes('HRMS_ADMIN') ||
      roles?.includes('HR_MANAGER');

    let targetEmpId = employeeId;
    if (!isHrOrAdmin && !targetEmpId) {
      const emp = await this.hrmsService.getEmployeeByUserId(userId);
      targetEmpId = emp.id;
    }

    return this.hrmsService.listAttendanceRecords(targetEmpId, month, year);
  }

  @Post('attendance/regularize')
  @Permissions('hrms:attendance:clock')
  @ApiOperation({ summary: 'Request Attendance Regularization' })
  async regularizeAttendance(
    @CurrentUser('userId') userId: string,
    @Body() dto: RegularizeAttendanceDto,
  ) {
    const emp = await this.hrmsService.getEmployeeByUserId(userId);
    return this.hrmsService.regularizeAttendance(emp.id, dto);
  }

  // ---------------------------------------------------------------------------
  // Expense Claims (e-Claim)
  // ---------------------------------------------------------------------------
  @Get('claims/categories')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Claim Categories & Limits' })
  async listClaimCategories() {
    return this.hrmsService.listClaimCategories();
  }

  @Get('claims')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Expense Claims' })
  async listClaims(
    @CurrentUser('userId') userId: string,
    @CurrentUser('roles') roles: string[],
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    const isHrOrAdmin =
      roles?.includes('SUPER_ADMIN') ||
      roles?.includes('HRMS_ADMIN') ||
      roles?.includes('FINANCE_ADMIN');

    let targetEmpId = employeeId;
    if (!isHrOrAdmin && !targetEmpId) {
      const emp = await this.hrmsService.getEmployeeByUserId(userId);
      targetEmpId = emp.id;
    }

    return this.hrmsService.listClaims({ employeeId: targetEmpId, status });
  }

  @Post('claims')
  @Permissions('hrms:claims:submit')
  @ApiOperation({ summary: 'Submit Expense Claim' })
  async submitExpenseClaim(
    @CurrentUser('userId') userId: string,
    @Body() dto: SubmitExpenseClaimDto,
  ) {
    const emp = await this.hrmsService.getEmployeeByUserId(userId);
    return this.hrmsService.submitExpenseClaim(emp.id, dto);
  }

  @Patch('claims/:id/review')
  @Permissions('hrms:claims:approve')
  @ApiOperation({ summary: 'Review Expense Claim' })
  async reviewClaim(
    @Param('id') id: string,
    @CurrentUser('userId') reviewerId: string,
    @Body() dto: ReviewClaimDto,
  ) {
    return this.hrmsService.reviewClaim(id, reviewerId, dto);
  }

  // ---------------------------------------------------------------------------
  // Indian Payroll & Payslips
  // ---------------------------------------------------------------------------
  @Get('payroll/structure/:employeeId')
  @Permissions('hrms:payroll:manage')
  @ApiOperation({ summary: 'Get Employee Salary Structure' })
  async getSalaryStructure(@Param('employeeId') employeeId: string) {
    return this.hrmsService.getSalaryStructure(employeeId);
  }

  @Put('payroll/structure/:employeeId')
  @Permissions('hrms:payroll:manage')
  @ApiOperation({ summary: 'Update Employee Salary Structure' })
  async upsertSalaryStructure(
    @Param('employeeId') employeeId: string,
    @Body() dto: SalaryStructureDto,
  ) {
    return this.hrmsService.upsertSalaryStructure(employeeId, dto);
  }

  @Post('payroll/process')
  @Permissions('hrms:payroll:manage')
  @ApiOperation({ summary: 'Process Monthly Payroll Run' })
  async processPayroll(@Body() dto: ProcessPayrollDto) {
    return this.hrmsService.processPayroll(dto);
  }

  @Get('payroll/payslips')
  @Permissions('hrms:payroll:read')
  @ApiOperation({ summary: 'List Payslips' })
  async listPayslips(
    @CurrentUser('userId') userId: string,
    @CurrentUser('roles') roles: string[],
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const isHrOrAdmin =
      roles?.includes('SUPER_ADMIN') ||
      roles?.includes('HRMS_ADMIN') ||
      roles?.includes('FINANCE_ADMIN');

    let targetEmpId = employeeId;
    if (!isHrOrAdmin && !targetEmpId) {
      const emp = await this.hrmsService.getEmployeeByUserId(userId);
      targetEmpId = emp.id;
    }

    return this.hrmsService.listPayslips({ employeeId: targetEmpId, month, year });
  }

  // ---------------------------------------------------------------------------
  // Incidents & Safety
  // ---------------------------------------------------------------------------
  @Get('incidents')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Workplace Incidents' })
  async listIncidents() {
    return this.hrmsService.listIncidents();
  }

  @Post('incidents')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'Report Workplace Incident' })
  async reportIncident(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateIncidentReportDto,
  ) {
    let reporterId: string | null = null;
    if (!dto.isAnonymous) {
      try {
        const emp = await this.hrmsService.getEmployeeByUserId(userId);
        reporterId = emp.id;
      } catch {
        reporterId = null;
      }
    }
    return this.hrmsService.reportIncident(reporterId, dto);
  }

  // ---------------------------------------------------------------------------
  // Communications & Documents
  // ---------------------------------------------------------------------------
  @Get('announcements')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Announcements' })
  async listAnnouncements() {
    return this.hrmsService.listAnnouncements();
  }

  @Post('announcements')
  @Permissions('hrms:manage')
  @ApiOperation({ summary: 'Publish Company Announcement' })
  async createAnnouncement(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('firstName') firstName: string,
    @CurrentUser('lastName') lastName: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    const authorName = `${firstName || ''} ${lastName || ''}`.trim() || 'HR Admin';
    return this.hrmsService.createAnnouncement(orgId || 'TECHM4INDIA', authorName, dto);
  }

  @Get('discussions')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Discussion Topics' })
  async listDiscussionTopics() {
    return this.hrmsService.listDiscussionTopics();
  }

  @Post('discussions')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'Create Discussion Topic' })
  async createDiscussionTopic(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateDiscussionTopicDto,
  ) {
    const emp = await this.hrmsService.getEmployeeByUserId(userId);
    return this.hrmsService.createDiscussionTopic(emp.id, dto);
  }

  @Post('discussions/:topicId/replies')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'Add Discussion Reply' })
  async addDiscussionReply(
    @Param('topicId') topicId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: AddDiscussionReplyDto,
  ) {
    const emp = await this.hrmsService.getEmployeeByUserId(userId);
    return this.hrmsService.addDiscussionReply(topicId, emp.id, dto);
  }

  @Get('documents/company')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Company Policies & Documents' })
  async listCompanyDocuments() {
    return this.hrmsService.listCompanyDocuments();
  }

  // ---------------------------------------------------------------------------
  // Master Metadata & Analytics
  // ---------------------------------------------------------------------------
  @Get('meta/departments')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Departments' })
  async getDepartments() {
    return this.hrmsService.getDepartments();
  }

  @Get('meta/branches')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Branches' })
  async getBranches() {
    return this.hrmsService.getBranches();
  }

  @Get('meta/designations')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Designations' })
  async getDesignations() {
    return this.hrmsService.getDesignations();
  }

  @Get('meta/holidays')
  @Permissions('hrms:access')
  @ApiOperation({ summary: 'List Holidays' })
  async getHolidays(@Query('year') year?: number) {
    return this.hrmsService.getHolidays(year);
  }

  @Get('reports/headcount')
  @Permissions('hrms:employees:read')
  @ApiOperation({ summary: 'Headcount Distribution Report' })
  async getHeadcountReport() {
    return this.hrmsService.getHeadcountReport();
  }
}
