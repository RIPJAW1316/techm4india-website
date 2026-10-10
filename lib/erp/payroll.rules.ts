/**
 * TechM4India ERP - Commercial Engine
 * Module: Payroll Statutory & Arithmetic Rules (FY 2026-27)
 *
 * Compliant with:
 * - Employees' Provident Funds and Miscellaneous Provisions Act, 1952 (EPFO)
 * - Employees' State Insurance Act, 1948 (ESIC)
 * - Telangana Professional Tax Act, 1987
 * - Income Tax Act, 1961 - Section 192 (New Tax Regime u/s 115BAC)
 * - Loss of Pay (LOP) proration principles
 */

export interface StatutoryConfig {
  pfWageCeiling: number; // Statutory ceiling: ₹15,000/month
  epsWageCeiling: number; // ₹15,000/month
  employeePfRate: number; // 12%
  employerPfRate: number; // 12%
  epsRate: number; // 8.33%
  epsMaxCap: number; // ₹1,250/month
  edliRate: number; // 0.50%
  adminRate: number; // 0.50%
  esiWageCeiling: number; // ₹21,000/month (gross)
  esiEmployeeRate: number; // 0.75%
  esiEmployerRate: number; // 3.25%
  standardDeduction: number; // ₹75,000
  rebate87aThreshold: number; // ₹12,00,000
  rebate87aMax: number; // ₹60,000
  cessRate: number; // 4%
}

export const DEFAULT_STATUTORY_CONFIG: StatutoryConfig = {
  pfWageCeiling: 15000,
  epsWageCeiling: 15000,
  employeePfRate: 0.12,
  employerPfRate: 0.12,
  epsRate: 0.0833,
  epsMaxCap: 1250,
  edliRate: 0.005,
  adminRate: 0.005,
  esiWageCeiling: 21000,
  esiEmployeeRate: 0.0075,
  esiEmployerRate: 0.0325,
  standardDeduction: 75000,
  rebate87aThreshold: 1200000,
  rebate87aMax: 60000,
  cessRate: 0.04,
};

export const NEW_TAX_REGIME_SLABS_2026 = [
  { min: 0, max: 400000, rate: 0.0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.10 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.20 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.30 },
];

export interface EmployeePayrollInput {
  employeeId?: string;
  name?: string;
  designation?: string;
  basic: number;
  hra: number;
  specialAllowance: number;
  conveyance?: number;
  otherEarnings?: number;
  workingDays: number;
  lopDays: number;
  stateCode?: string; // Default: 'TG' (Telangana)
  isEsiCoveredPeriod?: boolean; // True if covered at start of contribution period
  priorTdsPaidInFY?: number;
  monthsRemainingInFY?: number; // 1 to 12
  regime?: "NEW" | "OLD";
  declaredInvestmentsOldRegime?: number; // 80C, etc.
}

export interface EpfBreakdown {
  wageBase: number;
  employeePf: number;
  eps: number;
  employerEpf: number;
  edli: number;
  adminCharges: number;
  totalEmployerCost: number;
}

export interface EsiBreakdown {
  grossWage: number;
  isCovered: boolean;
  employeeEsi: number;
  employerEsi: number;
}

export interface TdsBreakdown {
  annualEstimatedGross: number;
  standardDeduction: number;
  professionalTaxAnnual: number;
  taxableIncome: number;
  grossTax: number;
  rebate87A: number;
  taxAfterRebate: number;
  cess: number;
  totalAnnualTax: number;
  priorTdsPaid: number;
  remainingTax: number;
  monthlyTds: number;
}

export interface PayrollCalculationResult {
  workingDays: number;
  payableDays: number;
  lopDays: number;
  prorationFactor: number;

  // Earnings (Prorated)
  unproratedGross: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  otherEarnings: number;
  grossEarnings: number;

  // Deductions
  epf: EpfBreakdown;
  esi: EsiBreakdown;
  professionalTax: number;
  tds: TdsBreakdown;
  totalDeductions: number;

  // Net Pay & Employer Cost
  netPay: number;
  totalEmployerContribution: number;
  totalCtcCost: number;
}

export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * 1. LOP Proration
 */
export function calculateProration(monthlyAmount: number, workingDays: number, lopDays: number): number {
  if (workingDays <= 0) return 0;
  const safeLop = Math.min(Math.max(0, lopDays), workingDays);
  const payableDays = workingDays - safeLop;
  return round((monthlyAmount * payableDays) / workingDays);
}

/**
 * 2. Employees' Provident Fund (EPF) Engine
 *
 * Strict compliance with EPFO rules:
 * - Wage Base = Basic + DA
 * - Statutory Wage Ceiling = ₹15,000/month
 * - Employee Contribution = 12% of Wage Base
 * - EPS = 8.33% of min(Wage Base, ₹15,000), capped at ₹1,250
 * - Employer EPF = 12% total - EPS
 * - EDLI = 0.50% of min(Wage Base, ₹15,000)
 * - Admin Charges = 0.50% of Wage Base (minimum ₹500/month overall)
 */
export function calculateEpf(wageBase: number, config: StatutoryConfig = DEFAULT_STATUTORY_CONFIG): EpfBreakdown {
  if (wageBase <= 0) {
    return {
      wageBase: 0,
      employeePf: 0,
      eps: 0,
      employerEpf: 0,
      edli: 0,
      adminCharges: 0,
      totalEmployerCost: 0,
    };
  }

  const roundedWage = round(wageBase);
  const employeePf = round(roundedWage * config.employeePfRate);
  const employerTotal = round(roundedWage * config.employerPfRate);

  // EPS is calculated on min(wageBase, ceiling) and capped at ₹1,250
  const epsWage = Math.min(roundedWage, config.epsWageCeiling);
  const epsRaw = epsWage >= config.epsWageCeiling ? config.epsMaxCap : round(epsWage * (8.33333333 / 100));
  const eps = Math.min(epsRaw, config.epsMaxCap);

  // Employer EPF gets the exact balance of the 12% total!
  const employerEpf = round(employerTotal - eps);

  // EDLI is 0.5% of min(wageBase, ceiling)
  const edli = round(Math.min(roundedWage, config.pfWageCeiling) * config.edliRate);

  // Admin charge is 0.5% of wage base
  const adminCharges = round(roundedWage * config.adminRate);

  const totalEmployerCost = round(employerEpf + eps + edli + adminCharges);

  return {
    wageBase: roundedWage,
    employeePf,
    eps,
    employerEpf,
    edli,
    adminCharges,
    totalEmployerCost,
  };
}

/**
 * 3. Employees' State Insurance (ESI) Engine
 *
 * - Threshold: Gross wage <= ₹21,000/month
 * - Employee Share: 0.75% of Gross
 * - Employer Share: 3.25% of Gross
 * - Continuation Rule: If an employee was covered at the start of a contribution
 *   period (April-Sept or Oct-March), they remain covered until the end of that period.
 */
export function calculateEsi(
  grossWage: number,
  isCoveredPeriod: boolean,
  config: StatutoryConfig = DEFAULT_STATUTORY_CONFIG
): EsiBreakdown {
  const isEligible = grossWage <= config.esiWageCeiling || isCoveredPeriod;
  if (!isEligible || grossWage <= 0) {
    return { grossWage: round(grossWage), isCovered: false, employeeEsi: 0, employerEsi: 0 };
  }

  const employeeEsi = Math.ceil(grossWage * config.esiEmployeeRate); // ESI rounded to next higher rupee per rule
  const employerEsi = round(grossWage * config.esiEmployerRate);

  return {
    grossWage: round(grossWage),
    isCovered: true,
    employeeEsi,
    employerEsi,
  };
}

/**
 * 4. Professional Tax (PT) - Telangana Slabs
 *
 * - Up to ₹15,000: Nil
 * - ₹15,001 to ₹20,000: ₹150
 * - Above ₹20,000: ₹200
 * - Annual Cap: ₹2,400 (constitutional limit ₹2,500)
 */
export function calculateProfessionalTax(grossWage: number, stateCode = "TG"): number {
  if (stateCode.toUpperCase() === "TG" || stateCode.toUpperCase() === "TELANGANA") {
    if (grossWage <= 15000) return 0;
    if (grossWage <= 20000) return 150;
    return 200;
  }
  // Generic fallback if outside Telangana
  if (grossWage <= 15000) return 0;
  return 200;
}

/**
 * 5. Income Tax TDS Section 192 (New Tax Regime Default FY 2026-27)
 *
 * Step-by-step:
 * 1. Annualize estimated Gross
 * 2. Less: Standard Deduction (₹75,000)
 * 3. Less: Professional Tax (Section 16(iii))
 * 4. = Taxable Income
 * 5. Apply Slabs
 * 6. Section 87A Rebate: if taxable <= ₹12,00,000, rebate up to ₹60,000
 * 7. Plus: 4% Health & Education Cess
 * 8. Less: Prior TDS already deducted in this FY
 * 9. Divide by remaining months in FY = this month's TDS
 */
export function calculateTds(
  annualEstimatedGross: number,
  annualPt: number,
  priorTdsPaid = 0,
  monthsRemaining = 12,
  config: StatutoryConfig = DEFAULT_STATUTORY_CONFIG
): TdsBreakdown {
  const safeMonths = Math.max(1, Math.min(12, monthsRemaining));
  const standardDeduction = config.standardDeduction;
  const taxableIncome = Math.max(0, round(annualEstimatedGross - standardDeduction - annualPt));

  let grossTax = 0;
  for (const slab of NEW_TAX_REGIME_SLABS_2026) {
    if (taxableIncome > slab.min) {
      const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
      grossTax += taxableInSlab * slab.rate;
    }
  }
  grossTax = round(grossTax);

  // Section 87A Rebate
  let rebate87A = 0;
  if (taxableIncome <= config.rebate87aThreshold) {
    rebate87A = Math.min(grossTax, config.rebate87aMax);
  }

  const taxAfterRebate = Math.max(0, round(grossTax - rebate87A));
  const cess = round(taxAfterRebate * config.cessRate);
  const totalAnnualTax = round(taxAfterRebate + cess);

  const remainingTax = Math.max(0, round(totalAnnualTax - priorTdsPaid));
  const monthlyTds = round(remainingTax / safeMonths);

  return {
    annualEstimatedGross: round(annualEstimatedGross),
    standardDeduction,
    professionalTaxAnnual: round(annualPt),
    taxableIncome,
    grossTax,
    rebate87A,
    taxAfterRebate,
    cess,
    totalAnnualTax,
    priorTdsPaid: round(priorTdsPaid),
    remainingTax,
    monthlyTds,
  };
}

/**
 * Master Payroll Calculator: orchestrates proration, statutory deductions, TDS, and CTC
 */
export function computePayrollResult(
  input: EmployeePayrollInput,
  config: StatutoryConfig = DEFAULT_STATUTORY_CONFIG
): PayrollCalculationResult {
  const workingDays = input.workingDays > 0 ? input.workingDays : 30;
  const safeLop = Math.min(Math.max(0, input.lopDays), workingDays);
  const payableDays = workingDays - safeLop;
  const prorationFactor = workingDays > 0 ? payableDays / workingDays : 0;

  // Unprorated gross for reference
  const unproratedGross = round(
    input.basic +
    input.hra +
    input.specialAllowance +
    (input.conveyance || 0) +
    (input.otherEarnings || 0)
  );

  // 1. Prorate earnings
  const basic = calculateProration(input.basic, workingDays, safeLop);
  const hra = calculateProration(input.hra, workingDays, safeLop);
  const specialAllowance = calculateProration(input.specialAllowance, workingDays, safeLop);
  const conveyance = calculateProration(input.conveyance || 0, workingDays, safeLop);
  const otherEarnings = calculateProration(input.otherEarnings || 0, workingDays, safeLop);
  const grossEarnings = round(basic + hra + specialAllowance + conveyance + otherEarnings);

  // 2. EPF on prorated Basic (assuming DA is included in Basic)
  const epf = calculateEpf(basic, config);

  // 3. ESI on prorated Gross
  const esi = calculateEsi(grossEarnings, !!input.isEsiCoveredPeriod, config);

  // 4. Professional Tax
  const professionalTax = calculateProfessionalTax(grossEarnings, input.stateCode || "TG");
  const annualPt = professionalTax * 12;

  // 5. TDS Section 192 (annualized estimated gross)
  const annualEstimatedGross = grossEarnings * 12;
  const tds = calculateTds(
    annualEstimatedGross,
    annualPt,
    input.priorTdsPaidInFY || 0,
    input.monthsRemainingInFY || 12,
    config
  );

  // Totals
  const totalDeductions = round(
    epf.employeePf + esi.employeeEsi + professionalTax + tds.monthlyTds
  );
  const netPay = round(grossEarnings - totalDeductions);
  const totalEmployerContribution = round(epf.totalEmployerCost + esi.employerEsi);
  const totalCtcCost = round(grossEarnings + totalEmployerContribution);

  return {
    workingDays,
    payableDays,
    lopDays: safeLop,
    prorationFactor: round(prorationFactor, 4),
    unproratedGross,
    basic,
    hra,
    specialAllowance,
    conveyance,
    otherEarnings,
    grossEarnings,
    epf,
    esi,
    professionalTax,
    tds,
    totalDeductions,
    netPay,
    totalEmployerContribution,
    totalCtcCost,
  };
}

/** Convenience statutory helpers for unit testing and domain callers */
export function calculateEpfEpsSplit(
  basic: number,
  _wageBase: number = basic,
  uncappedPfElection = false,
  config: StatutoryConfig = DEFAULT_STATUTORY_CONFIG,
) {
  void _wageBase; // Retain the positional API for existing callers.
  const pfWage = uncappedPfElection ? round(basic) : Math.min(round(basic), config.pfWageCeiling);
  const employeeEpf = round(pfWage * config.employeePfRate);
  const employerTotal = round(pfWage * config.employerPfRate);
  const epsWage = Math.min(pfWage, config.epsWageCeiling);
  const epsRaw = epsWage >= config.epsWageCeiling ? config.epsMaxCap : round(epsWage * (8.33333333 / 100));
  const employerEps = Math.min(epsRaw, config.epsMaxCap);
  const employerEpf = round(employerTotal - employerEps);
  const totalPfRemitted = round(employeeEpf + employerTotal);

  return {
    pfWage,
    employeeEpf,
    employerEps,
    employerEpf,
    totalPfRemitted,
  };
}

export function calculateEsiContribution(
  grossWage: number,
  _startWage: number = grossWage,
  isCoveredPeriod = false,
  config: StatutoryConfig = DEFAULT_STATUTORY_CONFIG,
) {
  void _startWage; // Retain the positional API for existing callers.
  const esi = calculateEsi(grossWage, isCoveredPeriod, config);
  return {
    isCovered: esi.isCovered,
    employeeEsi: esi.employeeEsi,
    employerEsi: esi.employerEsi,
    totalEsiRemitted: round(esi.employeeEsi + esi.employerEsi),
  };
}

export function calculateProfessionalTaxTelangana(grossWage: number) {
  return calculateProfessionalTax(grossWage, "TG");
}

export function calculateSection192TdsAnnual(params: {
  annualGrossSalary: number;
  annualPt?: number;
  priorTdsPaid?: number;
  monthsRemaining?: number;
  config?: StatutoryConfig;
}) {
  const pt = params.annualPt ?? (params.annualGrossSalary > 240000 ? 2400 : 0);
  const res = calculateTds(
    params.annualGrossSalary,
    pt,
    params.priorTdsPaid ?? 0,
    params.monthsRemaining ?? 12,
    params.config ?? DEFAULT_STATUTORY_CONFIG,
  );
  return {
    standardDeduction: res.standardDeduction,
    netTaxableIncome: res.taxableIncome,
    isEligibleFor87ARebate: res.taxableIncome <= (params.config ?? DEFAULT_STATUTORY_CONFIG).rebate87aThreshold,
    section87ARebate: res.rebate87A,
    healthAndEducationCess: res.cess,
    netAnnualTaxPayable: res.totalAnnualTax,
    monthlyTds: res.monthlyTds,
  };
}

export function calculateMonthlyTdsDeduction(
  netAnnualTax: number,
  priorTdsPaid = 0,
  monthsRemaining = 12,
) {
  const safeMonths = Math.max(1, monthsRemaining);
  const remaining = Math.max(0, netAnnualTax - priorTdsPaid);
  return round(remaining / safeMonths);
}

export function calculateLossOfPayProration(params: {
  daysInMonth: number;
  lossOfPayDays: number;
  monthlyBasic: number;
  monthlyHra: number;
  monthlyAllowances: number;
}) {
  const payableDays = Math.max(0, params.daysInMonth - params.lossOfPayDays);
  const prorationFactor = params.daysInMonth > 0 ? payableDays / params.daysInMonth : 0;
  const earnedBasic = calculateProration(params.monthlyBasic, params.daysInMonth, params.lossOfPayDays);
  const earnedHra = calculateProration(params.monthlyHra, params.daysInMonth, params.lossOfPayDays);
  const earnedAllowances = calculateProration(params.monthlyAllowances, params.daysInMonth, params.lossOfPayDays);
  const earnedGrossEarnings = round(earnedBasic + earnedHra + earnedAllowances);

  return {
    payableDays,
    prorationFactor: round(prorationFactor, 4),
    earnedBasic,
    earnedHra,
    earnedAllowances,
    earnedGrossEarnings,
  };
}

export function generatePayslipSnapshot(params: {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  pan?: string;
  uan?: string;
  daysInMonth: number;
  lossOfPayDays: number;
  monthlyBasic: number;
  monthlyHra: number;
  monthlyAllowances: number;
  annualCtc: number;
  priorTdsPaidInFY?: number;
  tdsDeductedTillDate?: number;
  remainingMonthsInFy?: number;
}) {
  const proration = calculateLossOfPayProration({
    daysInMonth: params.daysInMonth,
    lossOfPayDays: params.lossOfPayDays,
    monthlyBasic: params.monthlyBasic,
    monthlyHra: params.monthlyHra,
    monthlyAllowances: params.monthlyAllowances,
  });

  const epf = calculateEpfEpsSplit(proration.earnedBasic);
  const esi = calculateEsiContribution(proration.earnedGrossEarnings);
  const pt = calculateProfessionalTaxTelangana(proration.earnedGrossEarnings);
  const tds = calculateSection192TdsAnnual({
    annualGrossSalary: proration.earnedGrossEarnings * 12,
    annualPt: pt * 12,
    priorTdsPaid: params.priorTdsPaidInFY ?? params.tdsDeductedTillDate ?? 0,
    monthsRemaining: params.remainingMonthsInFy ?? 12,
  });

  const totalDeductions = round(epf.employeeEpf + esi.employeeEsi + pt + tds.monthlyTds);
  const netPayableSalary = round(proration.earnedGrossEarnings - totalDeductions);

  return {
    employeeId: params.employeeId,
    employeeCode: params.employeeCode,
    employeeName: params.employeeName,
    designation: params.designation,
    pan: params.pan,
    uan: params.uan,
    payableDays: proration.payableDays,
    grossEarnings: proration.earnedGrossEarnings,
    statutoryDeductions: {
      employeeEpf: epf.employeeEpf,
      employeeEsi: esi.employeeEsi,
      professionalTax: pt,
      tds: tds.monthlyTds,
    },
    employerContributions: {
      employerPf: epf.employerEpf + epf.employerEps,
      employerEsi: esi.employerEsi,
    },
    totalDeductions,
    netPayableSalary,
  };
}
