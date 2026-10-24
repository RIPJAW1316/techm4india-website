import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
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

@Injectable()
export class HrmsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Helper: Resolve Employee from Central User ID
  // ---------------------------------------------------------------------------
  async getEmployeeByUserId(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        department: true,
        designation: true,
        branch: true,
        manager: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
      },
    });
    if (!employee) {
      throw new NotFoundException(
        'No HRMS employee profile is linked to your central user identity.',
      );
    }
    return employee;
  }

  // ---------------------------------------------------------------------------
  // 1. Dashboard Summary
  // ---------------------------------------------------------------------------
  async getDashboardSummary(userId?: string, roles: string[] = []) {
    const isHrOrAdmin =
      roles.includes('SUPER_ADMIN') ||
      roles.includes('HRMS_ADMIN') ||
      roles.includes('HR_MANAGER');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [
      totalEmployees,
      activeLeavesToday,
      todayAttendanceCount,
      pendingLeaveCount,
      pendingClaimsCount,
      upcomingHolidays,
      latestAnnouncements,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
      this.prisma.leaveApplication.count({
        where: {
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
      this.prisma.attendanceRecord.count({
        where: {
          date: today,
          status: { in: ['PRESENT', 'HALF_DAY'] },
        },
      }),
      this.prisma.leaveApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.expenseClaim.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.holiday.findMany({
        where: { date: { gte: today } },
        orderBy: { date: 'asc' },
        take: 5,
      }),
      this.prisma.announcement.findMany({
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 5,
      }),
    ]);

    let myProfile: any = null;
    let myLeaveBalances: any[] = [];
    let myRecentAttendance: any = null;

    if (userId) {
      const emp = await this.prisma.employee.findUnique({
        where: { userId },
        include: { department: true, designation: true },
      });
      if (emp) {
        myProfile = emp;
        const currentYear = new Date().getFullYear();
        myLeaveBalances = await this.prisma.leaveBalance.findMany({
          where: { employeeId: emp.id, year: currentYear },
          include: { leaveType: true },
        });
        myRecentAttendance = await this.prisma.attendanceRecord.findUnique({
          where: { employeeId_date: { employeeId: emp.id, date: today } },
        });
      }
    }

    return {
      overview: {
        totalEmployees,
        onLeaveToday: activeLeavesToday,
        presentToday: todayAttendanceCount,
        pendingApprovals: {
          leaves: pendingLeaveCount,
          claims: pendingClaimsCount,
        },
      },
      holidays: upcomingHolidays,
      announcements: latestAnnouncements,
      selfService: {
        profile: myProfile,
        leaveBalances: myLeaveBalances,
        todayAttendance: myRecentAttendance,
      },
      isPrivileged: isHrOrAdmin,
    };
  }

  // ---------------------------------------------------------------------------
  // 2. Employee Directory & Profiles
  // ---------------------------------------------------------------------------
  async listEmployees(query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.branchId) where.branchId = query.branchId;
    if (query.status) where.employmentStatus = query.status;

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { firstName: { contains: s, mode: 'insensitive' } },
        { lastName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { employeeNumber: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { employeeNumber: 'asc' },
        include: {
          department: true,
          designation: true,
          branch: true,
          manager: {
            select: { id: true, firstName: true, lastName: true, employeeNumber: true },
          },
        },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id: string, requesterUserId?: string, requesterRoles: string[] = []) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        branch: true,
        manager: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
        directReports: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
        salaryStructure: true,
        documents: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }

    const currentYear = new Date().getFullYear();
    const leaveBalances = await this.prisma.leaveBalance.findMany({
      where: { employeeId: id, year: currentYear },
      include: { leaveType: true },
    });

    // Sensitive field authorization check:
    // Only SUPER_ADMIN, HRMS_ADMIN, or the employee themselves can see sensitive statutory & bank info
    const isSelf = requesterUserId && employee.userId === requesterUserId;
    const isHrOrAdmin =
      requesterRoles.includes('SUPER_ADMIN') ||
      requesterRoles.includes('HRMS_ADMIN') ||
      requesterRoles.includes('HR_MANAGER');

    const sanitizedEmployee = { ...employee };
    if (!isSelf && !isHrOrAdmin) {
      sanitizedEmployee.panNumber = null;
      sanitizedEmployee.aadhaarNumber = null;
      sanitizedEmployee.pfUanNumber = null;
      sanitizedEmployee.esiNumber = null;
      sanitizedEmployee.bankAccountNumber = null;
      sanitizedEmployee.bankIfsc = null;
      sanitizedEmployee.bankName = null;
      (sanitizedEmployee as any).salaryStructure = null;
    }

    return {
      ...sanitizedEmployee,
      leaveBalances,
    };
  }

  async createEmployee(dto: CreateEmployeeDto, organizationId: string) {
    const existing = await this.prisma.employee.findFirst({
      where: {
        OR: [{ employeeNumber: dto.employeeNumber }, { email: dto.email.toLowerCase() }],
      },
    });
    if (existing) {
      throw new BadRequestException(
        'An employee with this Employee Number or Email already exists.',
      );
    }

    const employee = await this.prisma.employee.create({
      data: {
        organizationId,
        employeeNumber: dto.employeeNumber.trim().toUpperCase(),
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone,
        dateOfJoining: new Date(dto.dateOfJoining),
        employmentType: dto.employmentType || 'FULL_TIME',
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        branchId: dto.branchId,
        managerId: dto.managerId,
        panNumber: dto.panNumber,
        bankAccountNumber: dto.bankAccountNumber,
        bankIfsc: dto.bankIfsc,
        bankName: dto.bankName,
      },
    });

    // Seed default leave balances for current year
    const currentYear = new Date().getFullYear();
    const leaveTypes = await this.prisma.leaveType.findMany();
    for (const lt of leaveTypes) {
      await this.prisma.leaveBalance.create({
        data: {
          employeeId: employee.id,
          leaveTypeId: lt.id,
          year: currentYear,
          entitledDays: lt.defaultDaysPerYear,
          takenDays: 0,
          pendingDays: 0,
        },
      });
    }

    return this.getEmployeeById(employee.id);
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    await this.getEmployeeById(id);

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        phone: dto.phone,
        employmentStatus: dto.employmentStatus,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        branchId: dto.branchId,
        managerId: dto.managerId,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        address: dto.address,
      },
    });

    return this.getEmployeeById(updated.id);
  }

  // ---------------------------------------------------------------------------
  // 3. Leave Management (e-Leave)
  // ---------------------------------------------------------------------------
  async listLeaveTypes() {
    return this.prisma.leaveType.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async getLeaveBalances(employeeId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    return this.prisma.leaveBalance.findMany({
      where: { employeeId, year: targetYear },
      include: { leaveType: true },
      orderBy: { leaveType: { code: 'asc' } },
    });
  }

  async applyLeave(employeeId: string, dto: ApplyLeaveDto) {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { code: dto.leaveTypeCode },
    });
    if (!leaveType) {
      throw new NotFoundException(`Leave type "${dto.leaveTypeCode}" not found.`);
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end < start) {
      throw new BadRequestException('Leave end date cannot be earlier than start date.');
    }

    // Calculate business days
    let totalDays = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
      // Exclude weekends (Sunday = 0, Saturday = 6)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays += 1;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (totalDays === 0) {
      throw new BadRequestException('Selected leave period contains only non-working weekend days.');
    }

    if (dto.isHalfDay) {
      totalDays = 0.5;
    }

    // Check balance for paid leaves
    const currentYear = start.getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId: leaveType.id,
          year: currentYear,
        },
      },
    });

    if (balance && leaveType.isPaid) {
      const remaining = balance.entitledDays + balance.carriedForwardDays - balance.takenDays;
      if (remaining < totalDays) {
        throw new BadRequestException(
          `Insufficient leave balance. Requested: ${totalDays} day(s), Available: ${remaining} day(s).`,
        );
      }
    }

    const application = await this.prisma.leaveApplication.create({
      data: {
        employeeId,
        leaveTypeId: leaveType.id,
        startDate: start,
        endDate: end,
        totalDays,
        isHalfDay: dto.isHalfDay || false,
        halfDayType: dto.halfDayType,
        reason: dto.reason.trim(),
        attachmentUrl: dto.attachmentUrl,
        status: 'PENDING',
      },
      include: {
        leaveType: true,
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
      },
    });

    return application;
  }

  async reviewLeave(applicationId: string, reviewerId: string, dto: ReviewLeaveDto) {
    const application = await this.prisma.leaveApplication.findUnique({
      where: { id: applicationId },
      include: { leaveType: true },
    });
    if (!application) {
      throw new NotFoundException('Leave application not found.');
    }
    if (application.status !== 'PENDING') {
      throw new BadRequestException(`Cannot review application that is already ${application.status}.`);
    }

    const updated = await this.prisma.leaveApplication.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: dto.notes,
      },
    });

    // If approved, update LeaveBalance.takenDays
    if (dto.status === 'APPROVED') {
      const year = application.startDate.getFullYear();
      await this.prisma.leaveBalance.updateMany({
        where: {
          employeeId: application.employeeId,
          leaveTypeId: application.leaveTypeId,
          year,
        },
        data: {
          takenDays: { increment: application.totalDays },
        },
      });
    }

    return updated;
  }

  async listLeaveApplications(filter: { employeeId?: string; status?: string }) {
    const where: any = {};
    if (filter.employeeId) where.employeeId = filter.employeeId;
    if (filter.status) where.status = filter.status;

    return this.prisma.leaveApplication.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            department: true,
          },
        },
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Time Clock & Attendance
  // ---------------------------------------------------------------------------
  async getTodayAttendance(employeeId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return this.prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });
  }

  async clockIn(employeeId: string, ip?: string, dto?: ClockInOutDto) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const now = new Date();

    const existing = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (existing && existing.clockInTime) {
      throw new BadRequestException('You have already clocked in for today.');
    }

    // Late threshold: 09:30 AM
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);

    return this.prisma.attendanceRecord.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      update: {
        clockInTime: now,
        clockInIp: ip,
        isLate,
        notes: dto?.notes,
        status: 'PRESENT',
      },
      create: {
        employeeId,
        date: today,
        clockInTime: now,
        clockInIp: ip,
        isLate,
        notes: dto?.notes,
        status: 'PRESENT',
      },
    });
  }

  async clockOut(employeeId: string, ip?: string, dto?: ClockInOutDto) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const now = new Date();

    const record = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (!record || !record.clockInTime) {
      throw new BadRequestException('Cannot clock out without an active clock-in for today.');
    }

    const diffMs = now.getTime() - record.clockInTime.getTime();
    const workMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    // Standard workday: 8 hours (480 minutes). Overtime if > 480.
    const overtimeMinutes = workMinutes > 480 ? workMinutes - 480 : 0;
    // Early departure if clocked out before 17:30
    const isEarlyDeparture = now.getHours() < 17 || (now.getHours() === 17 && now.getMinutes() < 30);

    return this.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        clockOutTime: now,
        clockOutIp: ip,
        workMinutes,
        overtimeMinutes,
        isEarlyDeparture,
        notes: dto?.notes ? `${record.notes || ''} | Out: ${dto.notes}` : record.notes,
      },
    });
  }

  async listAttendanceRecords(employeeId?: string, month?: number, year?: number) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    if (month && year) {
      const start = new Date(Date.UTC(year, month - 1, 1));
      const end = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      where.date = { gte: start, lte: end };
    }

    return this.prisma.attendanceRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
        regularization: true,
      },
    });
  }

  async regularizeAttendance(employeeId: string, dto: RegularizeAttendanceDto) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: dto.attendanceId },
    });
    if (!record) {
      throw new NotFoundException('Attendance record not found.');
    }
    if (record.employeeId !== employeeId) {
      throw new ForbiddenException('Cannot regularize attendance of another employee.');
    }

    return this.prisma.attendanceRegularization.upsert({
      where: { attendanceId: dto.attendanceId },
      update: {
        requestedClockIn: new Date(dto.requestedClockIn),
        requestedClockOut: new Date(dto.requestedClockOut),
        reason: dto.reason,
        status: 'PENDING',
      },
      create: {
        attendanceId: dto.attendanceId,
        employeeId,
        requestedClockIn: new Date(dto.requestedClockIn),
        requestedClockOut: new Date(dto.requestedClockOut),
        reason: dto.reason,
        status: 'PENDING',
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Expense Claims (e-Claim)
  // ---------------------------------------------------------------------------
  async listClaimCategories() {
    return this.prisma.claimCategory.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async submitExpenseClaim(employeeId: string, dto: SubmitExpenseClaimDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Expense claim must include at least one item.');
    }

    const categories = await this.prisma.claimCategory.findMany();
    const catMap = new Map(categories.map((c) => [c.code, c]));

    let totalAmount = 0;
    const itemsToCreate = [];

    for (const item of dto.items) {
      const cat = catMap.get(item.categoryCode);
      if (!cat) {
        throw new NotFoundException(`Claim category "${item.categoryCode}" not found.`);
      }
      if (cat.maxAmountLimit && item.amount > cat.maxAmountLimit) {
        throw new BadRequestException(
          `Amount ₹${item.amount} exceeds category limit of ₹${cat.maxAmountLimit} for ${cat.name}.`,
        );
      }
      totalAmount += item.amount;
      itemsToCreate.push({
        claimCategoryId: cat.id,
        expenseDate: new Date(item.expenseDate),
        amount: item.amount,
        merchantName: item.merchantName,
        description: item.description,
        receiptUrl: item.receiptUrl,
      });
    }

    const count = await this.prisma.expenseClaim.count();
    const claimNumber = `CLM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.expenseClaim.create({
      data: {
        claimNumber,
        employeeId,
        title: dto.title.trim(),
        totalAmount,
        status: 'SUBMITTED',
        notes: dto.notes,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        items: { include: { category: true } },
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
      },
    });
  }

  async listClaims(filter: { employeeId?: string; status?: string }) {
    const where: any = {};
    if (filter.employeeId) where.employeeId = filter.employeeId;
    if (filter.status) where.status = filter.status;

    return this.prisma.expenseClaim.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        items: { include: { category: true } },
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
      },
    });
  }

  async reviewClaim(claimId: string, reviewerId: string, dto: ReviewClaimDto) {
    const claim = await this.prisma.expenseClaim.findUnique({
      where: { id: claimId },
    });
    if (!claim) throw new NotFoundException('Expense claim not found.');
    if (claim.status !== 'SUBMITTED') {
      throw new BadRequestException(`Cannot review claim that is already ${claim.status}.`);
    }

    return this.prisma.expenseClaim.update({
      where: { id: claimId },
      data: {
        status: dto.status,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        notes: dto.notes ? `${claim.notes || ''} | Review: ${dto.notes}` : claim.notes,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Indian Payroll & Payslips
  // ---------------------------------------------------------------------------
  async getSalaryStructure(employeeId: string) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { employeeId },
    });
    if (!structure) {
      throw new NotFoundException('Salary structure has not been configured for this employee.');
    }
    return structure;
  }

  async upsertSalaryStructure(employeeId: string, dto: SalaryStructureDto) {
    await this.getEmployeeById(employeeId);

    // Indian Statutory Calculations
    // 1. PF: 12% of Basic, capped at ₹1,800/mo statutory ceiling unless customized
    const pfEmployee = dto.providentFundEmployee !== undefined ? dto.providentFundEmployee : 1800;
    const pfEmployer = pfEmployee;

    // 2. Professional Tax (PT): ₹200/mo (standard in Telangana & Karnataka)
    const pt = dto.professionalTax !== undefined ? dto.professionalTax : 200;

    // 3. ESI: Applicable if gross <= ₹21,000/mo. Rate: 0.75% employee, 3.25% employer
    let esiEmployee = dto.esiEmployee || 0;
    let esiEmployer = 0;
    const grossEarnings =
      dto.basicSalary +
      dto.hra +
      dto.specialAllowance +
      (dto.conveyanceAllowance || 0) +
      (dto.medicalAllowance || 0);

    if (grossEarnings <= 21000 && !dto.esiEmployee) {
      esiEmployee = Math.round(grossEarnings * 0.0075);
      esiEmployer = Math.round(grossEarnings * 0.0325);
    }

    const totalDeductions = pfEmployee + pt + esiEmployee + (dto.tdsEstimate || 0);
    const netSalary = Math.max(0, grossEarnings - totalDeductions);

    return this.prisma.salaryStructure.upsert({
      where: { employeeId },
      update: {
        monthlyCtc: dto.monthlyCtc,
        basicSalary: dto.basicSalary,
        hra: dto.hra,
        specialAllowance: dto.specialAllowance,
        conveyanceAllowance: dto.conveyanceAllowance || 0,
        medicalAllowance: dto.medicalAllowance || 0,
        providentFundEmployee: pfEmployee,
        providentFundEmployer: pfEmployer,
        professionalTax: pt,
        esiEmployee,
        esiEmployer,
        tdsEstimate: dto.tdsEstimate || 0,
        netSalary,
        isActive: true,
      },
      create: {
        employeeId,
        monthlyCtc: dto.monthlyCtc,
        basicSalary: dto.basicSalary,
        hra: dto.hra,
        specialAllowance: dto.specialAllowance,
        conveyanceAllowance: dto.conveyanceAllowance || 0,
        medicalAllowance: dto.medicalAllowance || 0,
        providentFundEmployee: pfEmployee,
        providentFundEmployer: pfEmployer,
        professionalTax: pt,
        esiEmployee,
        esiEmployer,
        tdsEstimate: dto.tdsEstimate || 0,
        netSalary,
        isActive: true,
      },
    });
  }

  async processPayroll(dto: ProcessPayrollDto) {
    const period = await this.prisma.payrollPeriod.upsert({
      where: { month_year: { month: dto.month, year: dto.year } },
      update: { status: 'FINALIZED', finalizedAt: new Date() },
      create: {
        month: dto.month,
        year: dto.year,
        status: 'FINALIZED',
        finalizedAt: new Date(),
      },
    });

    const employees = await this.prisma.employee.findMany({
      where: { employmentStatus: 'ACTIVE' },
      include: { salaryStructure: true },
    });

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    for (const emp of employees) {
      if (!emp.salaryStructure) continue;

      const ss = emp.salaryStructure;
      const allowancesTotal =
        ss.specialAllowance + ss.conveyanceAllowance + ss.medicalAllowance;
      const gross = ss.basicSalary + ss.hra + allowancesTotal;
      const deductions =
        ss.providentFundEmployee + ss.professionalTax + ss.esiEmployee + ss.tdsEstimate;
      const netPay = gross - deductions;

      totalGross += gross;
      totalDeductions += deductions;
      totalNet += netPay;

      const payslipNumber = `PS-${dto.year}-${String(dto.month).padStart(2, '0')}-${emp.employeeNumber}`;

      await this.prisma.payslip.upsert({
        where: {
          payrollPeriodId_employeeId: {
            payrollPeriodId: period.id,
            employeeId: emp.id,
          },
        },
        update: {
          grossEarnings: gross,
          totalDeductions: deductions,
          netPay,
          isPublished: true,
        },
        create: {
          payrollPeriodId: period.id,
          employeeId: emp.id,
          payslipNumber,
          basicSalary: ss.basicSalary,
          hra: ss.hra,
          allowancesTotal,
          grossEarnings: gross,
          pfDeduction: ss.providentFundEmployee,
          ptDeduction: ss.professionalTax,
          esiDeduction: ss.esiEmployee,
          taxDeduction: ss.tdsEstimate,
          totalDeductions: deductions,
          netPay,
          isPublished: true,
        },
      });
    }

    return this.prisma.payrollPeriod.update({
      where: { id: period.id },
      data: { totalGross, totalDeductions, totalNet },
      include: { payslips: true },
    });
  }

  async listPayslips(filter: { employeeId?: string; month?: number; year?: number }) {
    const where: any = {};
    if (filter.employeeId) where.employeeId = filter.employeeId;
    if (filter.month || filter.year) {
      where.payrollPeriod = {};
      if (filter.month) where.payrollPeriod.month = filter.month;
      if (filter.year) where.payrollPeriod.year = filter.year;
    }

    return this.prisma.payslip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        payrollPeriod: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            department: true,
            designation: true,
            panNumber: true,
            bankAccountNumber: true,
          },
        },
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 7. Workplace Incidents & Safety
  // ---------------------------------------------------------------------------
  async reportIncident(reporterEmployeeId: string | null, dto: CreateIncidentReportDto) {
    const count = await this.prisma.incidentReport.count();
    const reportNumber = `INC-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.incidentReport.create({
      data: {
        reportNumber,
        reporterId: dto.isAnonymous ? null : reporterEmployeeId,
        isAnonymous: dto.isAnonymous || false,
        category: dto.category,
        severity: dto.severity || 'MEDIUM',
        title: dto.title.trim(),
        description: dto.description.trim(),
        incidentDate: new Date(dto.incidentDate),
        location: dto.location,
        status: 'REPORTED',
      },
    });
  }

  async listIncidents() {
    const incidents = await this.prisma.incidentReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
      },
    });

    // Enforce privacy: If an incident is marked isAnonymous, completely scrub reporter relation
    return incidents.map((inc) => {
      if (inc.isAnonymous) {
        return {
          ...inc,
          reporterId: null,
          reporter: null,
        };
      }
      return inc;
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Communications & Documents
  // ---------------------------------------------------------------------------
  async listAnnouncements() {
    return this.prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });
  }

  async createAnnouncement(orgId: string, authorName: string, dto: CreateAnnouncementDto) {
    return this.prisma.announcement.create({
      data: {
        organizationId: orgId,
        title: dto.title.trim(),
        content: dto.content.trim(),
        category: dto.category || 'GENERAL',
        targetScope: dto.targetScope || 'ALL',
        priority: dto.priority || 'NORMAL',
        isPinned: dto.isPinned || false,
        authorName,
      },
    });
  }

  async listDiscussionTopics() {
    return this.prisma.discussionTopic.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, employeeNumber: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createDiscussionTopic(authorEmployeeId: string, dto: CreateDiscussionTopicDto) {
    return this.prisma.discussionTopic.create({
      data: {
        authorId: authorEmployeeId,
        title: dto.title.trim(),
        content: dto.content.trim(),
        category: dto.category || 'GENERAL',
      },
    });
  }

  async addDiscussionReply(topicId: string, authorEmployeeId: string, dto: AddDiscussionReplyDto) {
    return this.prisma.discussionReply.create({
      data: {
        topicId,
        authorId: authorEmployeeId,
        content: dto.content.trim(),
      },
    });
  }

  async listCompanyDocuments() {
    return this.prisma.companyDocument.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------------------------------------------------------------------
  // 9. Master Metadata & Reporting
  // ---------------------------------------------------------------------------
  async getDepartments() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { employees: true } } },
    });
  }

  async getBranches() {
    return this.prisma.branch.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { employees: true } } },
    });
  }

  async getDesignations() {
    return this.prisma.designation.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getHolidays(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const start = new Date(Date.UTC(targetYear, 0, 1));
    const end = new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59));

    return this.prisma.holiday.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });
  }

  async getHeadcountReport() {
    const [byDept, byBranch, byStatus] = await Promise.all([
      this.prisma.department.findMany({
        select: {
          name: true,
          code: true,
          _count: { select: { employees: true } },
        },
      }),
      this.prisma.branch.findMany({
        select: {
          name: true,
          code: true,
          city: true,
          _count: { select: { employees: true } },
        },
      }),
      this.prisma.employee.groupBy({
        by: ['employmentStatus'],
        _count: { id: true },
      }),
    ]);

    return {
      byDepartment: byDept.map((d) => ({ name: d.name, count: d._count.employees })),
      byBranch: byBranch.map((b) => ({ name: b.name, city: b.city, count: b._count.employees })),
      byStatus: byStatus.map((s) => ({ status: s.employmentStatus, count: s._count.id })),
    };
  }
}
