/**
 * Advanced CRM Engine for TechM4India ERP
 *
 * Implements:
 * 1. Two-Axis Lead Scoring (Fit vs. Engagement) with explainable factors & recency decay.
 * 2. Lead Quadrant Classification (HOT_LEAD, NURTURE, EVALUATE, COLD).
 * 3. Weighted Pipeline Forecasting and Sales Velocity Diagnostic.
 * 4. Closed-Won to Commercial Delivery & Billing Milestone Generator.
 *
 * Completely zero-dependency and runnable in browser, node, and backend.
 */

export type InstitutionCategory =
  | "UNIVERSITY"
  | "ENGINEERING_COLLEGE"
  | "DEGREE_COLLEGE"
  | "POLYTECHNIC_SKILL"
  | "CORPORATE_ENTERPRISE"
  | "K12_SCHOOL"
  | "OTHER";

export type DecisionMakerLevel =
  | "EXECUTIVE_CXO" // Chancellor, Vice Chancellor, Chairman, CEO, Director
  | "DEAN_PRINCIPAL" // Dean, Principal, Head of Department
  | "COORDINATOR_FACULTY" // TPO (Training & Placement Officer), Professor, Coordinator
  | "OPERATIONAL_STAFF"
  | "STUDENT_LEARNER";

export type GeographicTier =
  | "HOME_STATE" // Telangana, Andhra Pradesh (HQ Hubs)
  | "TIER_1_METRO" // Bengaluru, Mumbai, Delhi-NCR, Chennai, Pune
  | "TIER_2_CITY" // Tier-2 hubs (Warangal, Vizag, Coimbatore, etc.)
  | "OTHER";

export type ActivityType =
  | "DEMO_COMPLETED"
  | "MEETING_HELD"
  | "PROPOSAL_REQUESTED"
  | "CALL_CONNECTED"
  | "FORM_SUBMITTED"
  | "BROCHURE_DOWNLOADED"
  | "EMAIL_REPLIED"
  | "EMAIL_OPENED"
  | "WEBSITE_VISIT";

export type LeadQuadrant = "HOT_LEAD" | "NURTURE" | "EVALUATE" | "COLD";

export type OpportunityStage =
  | "PROSPECTING"
  | "QUALIFICATION"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type ForecastCategory = "PIPELINE" | "BEST_CASE" | "COMMIT" | "CLOSED" | "OMITTED";

export interface ScoreCriterionResult {
  category: "FIT" | "ENGAGEMENT";
  name: string;
  pointsAwarded: number;
  maxPoints: number;
  reason: string;
}

export interface LeadScoreResult {
  fitScore: number; // 0 to 100
  engagementScore: number; // 0 to 100
  blendedScore: number; // 0 to 100 (for quick reference)
  quadrant: LeadQuadrant;
  recommendation: string;
  breakdown: ScoreCriterionResult[];
}

export interface LeadScoringInput {
  institutionCategory?: InstitutionCategory | string | null;
  studentStrength?: number | null;
  decisionMakerRole?: DecisionMakerLevel | string | null;
  geographicTier?: GeographicTier | string | null;
  estimatedValue?: number | null;
  activities?: Array<{
    type: ActivityType | string;
    occurredAt: Date | string;
  }>;
}

/**
 * Standard calibrated stage probabilities for TechM4India sales pipeline.
 */
export const STAGE_PROBABILITIES: Record<OpportunityStage, number> = {
  PROSPECTING: 0.1, // 10%
  QUALIFICATION: 0.25, // 25%
  PROPOSAL: 0.5, // 50%
  NEGOTIATION: 0.75, // 75%
  WON: 1.0, // 100%
  LOST: 0.0, // 0%
};

export const STAGE_TO_FORECAST_CATEGORY: Record<OpportunityStage, ForecastCategory> = {
  PROSPECTING: "PIPELINE",
  QUALIFICATION: "PIPELINE",
  PROPOSAL: "BEST_CASE",
  NEGOTIATION: "COMMIT",
  WON: "CLOSED",
  LOST: "OMITTED",
};

/**
 * Computes Two-Axis Lead Score (Fit vs Engagement) with full explainability.
 */
export function calculateLeadScore(input: LeadScoringInput): LeadScoreResult {
  const breakdown: ScoreCriterionResult[] = [];

  // --- 1. FIT SCORING (Max 100 pts) ---
  let fitScore = 0;

  // 1a. Institution Category (Max 30 pts)
  const categoryStr = (input.institutionCategory || "").toUpperCase();
  let catPoints = 10;
  let catReason = "Standard institutional inquiry";
  if (categoryStr.includes("UNIVERSITY")) {
    catPoints = 30;
    catReason = "University tier — High institutional seat potential";
  } else if (categoryStr.includes("ENGINEERING") || categoryStr.includes("COLLEGE")) {
    catPoints = 25;
    catReason = "Engineering / Higher Education Degree College";
  } else if (categoryStr.includes("ENTERPRISE") || categoryStr.includes("CORPORATE")) {
    catPoints = 25;
    catReason = "Corporate enterprise skilling contract";
  } else if (categoryStr.includes("POLYTECHNIC") || categoryStr.includes("SKILL")) {
    catPoints = 20;
    catReason = "Polytechnic / Vocational skill academy";
  } else if (categoryStr.includes("SCHOOL") || categoryStr.includes("K12")) {
    catPoints = 15;
    catReason = "K-12 School STEM program";
  }
  fitScore += catPoints;
  breakdown.push({
    category: "FIT",
    name: "Institution Category",
    pointsAwarded: catPoints,
    maxPoints: 30,
    reason: catReason,
  });

  // 1b. Learner / Student Strength (Max 25 pts)
  const strength = input.studentStrength ?? 0;
  let strengthPoints = 5;
  let strengthReason = "< 200 learners";
  if (strength >= 5000) {
    strengthPoints = 25;
    strengthReason = "High-scale institution (> 5,000 learners)";
  } else if (strength >= 1000) {
    strengthPoints = 20;
    strengthReason = "Substantial scale (1,000 - 5,000 learners)";
  } else if (strength >= 200) {
    strengthPoints = 15;
    strengthReason = "Medium scale (200 - 1,000 learners)";
  }
  fitScore += strengthPoints;
  breakdown.push({
    category: "FIT",
    name: "Student / Learner Volume",
    pointsAwarded: strengthPoints,
    maxPoints: 25,
    reason: strengthReason,
  });

  // 1c. Decision Maker Authority (Max 25 pts)
  const roleStr = (input.decisionMakerRole || "").toUpperCase();
  let rolePoints = 10;
  let roleReason = "General stakeholder";
  if (
    roleStr.includes("CHANCELLOR") ||
    roleStr.includes("CHAIRMAN") ||
    roleStr.includes("FOUNDER") ||
    roleStr.includes("DIRECTOR") ||
    roleStr.includes("CXO") ||
    roleStr.includes("CEO") ||
    roleStr.includes("EXECUTIVE")
  ) {
    rolePoints = 25;
    roleReason = "Executive / C-Level / Chairman authority";
  } else if (roleStr.includes("DEAN") || roleStr.includes("PRINCIPAL") || roleStr.includes("HOD")) {
    rolePoints = 20;
    roleReason = "Academic leadership (Dean / Principal / HOD)";
  } else if (
    roleStr.includes("TPO") ||
    roleStr.includes("PLACEMENT") ||
    roleStr.includes("PROFESSOR") ||
    roleStr.includes("COORDINATOR")
  ) {
    rolePoints = 15;
    roleReason = "Operational decision influencer (TPO / Coordinator)";
  }
  fitScore += rolePoints;
  breakdown.push({
    category: "FIT",
    name: "Decision-Maker Role",
    pointsAwarded: rolePoints,
    maxPoints: 25,
    reason: roleReason,
  });

  // 1d. Geographic Alignment (Max 10 pts)
  const geoStr = (input.geographicTier || "").toUpperCase();
  let geoPoints = 5;
  let geoReason = "Other region";
  if (
    geoStr.includes("TELANGANA") ||
    geoStr.includes("HYDERABAD") ||
    geoStr.includes("ANDHRA") ||
    geoStr.includes("HOME")
  ) {
    geoPoints = 10;
    geoReason = "Home Territory (Telangana / AP) — Full operational delivery coverage";
  } else if (
    geoStr.includes("METRO") ||
    geoStr.includes("BANGALORE") ||
    geoStr.includes("BENGALURU") ||
    geoStr.includes("MUMBAI") ||
    geoStr.includes("DELHI") ||
    geoStr.includes("CHENNAI")
  ) {
    geoPoints = 8;
    geoReason = "Tier-1 Metro Hub";
  } else if (geoStr.includes("TIER_2") || geoStr.includes("WARANGAL") || geoStr.includes("VIZAG")) {
    geoPoints = 6;
    geoReason = "Tier-2 Regional Center";
  }
  fitScore += geoPoints;
  breakdown.push({
    category: "FIT",
    name: "Geographic Alignment",
    pointsAwarded: geoPoints,
    maxPoints: 10,
    reason: geoReason,
  });

  // 1e. Budget / Estimated Deal Size (Max 10 pts)
  const val = input.estimatedValue ?? 0;
  let valPoints = 3;
  let valReason = "< ₹2,00,000 deal size";
  if (val >= 1000000) {
    valPoints = 10;
    valReason = "Strategic Deal size (≥ ₹10,00,000)";
  } else if (val >= 200000) {
    valPoints = 7;
    valReason = "Standard Institutional Package (₹2,00,000 - ₹10,00,000)";
  }
  fitScore += valPoints;
  breakdown.push({
    category: "FIT",
    name: "Budget Potential",
    pointsAwarded: valPoints,
    maxPoints: 10,
    reason: valReason,
  });

  // --- 2. ENGAGEMENT SCORING WITH RECENCY DECAY (Max 100 pts) ---
  let rawEngagementScore = 0;
  const now = Date.now();

  const activities = input.activities || [];
  for (const act of activities) {
    const actDate = new Date(act.occurredAt).getTime();
    const daysAgo = Math.max(0, (now - actDate) / (1000 * 60 * 60 * 24));

    // Time-decay multiplier
    let recencyFactor = 0.2;
    if (daysAgo <= 7) recencyFactor = 1.0;
    else if (daysAgo <= 14) recencyFactor = 0.85;
    else if (daysAgo <= 30) recencyFactor = 0.6;
    else if (daysAgo <= 60) recencyFactor = 0.35;

    let basePoints = 10;
    let actName = "Inquiry Activity";
    const typeUpper = (act.type || "").toUpperCase();

    if (typeUpper.includes("DEMO")) {
      basePoints = 30;
      actName = "Platform Demo Completed";
    } else if (typeUpper.includes("MEETING")) {
      basePoints = 25;
      actName = "Direct Stakeholder Meeting Held";
    } else if (typeUpper.includes("PROPOSAL")) {
      basePoints = 25;
      actName = "Proposal / Quotation Requested";
    } else if (typeUpper.includes("CALL")) {
      basePoints = 15;
      actName = "Phone Call Connected";
    } else if (typeUpper.includes("FORM") || typeUpper.includes("WEBSITE")) {
      basePoints = 15;
      actName = "Web Form / Direct Inquiry";
    } else if (typeUpper.includes("BROCHURE") || typeUpper.includes("DOWNLOAD")) {
      basePoints = 10;
      actName = "Curriculum Brochure Downloaded";
    } else if (typeUpper.includes("EMAIL")) {
      basePoints = 10;
      actName = "Email Interaction";
    }

    const earned = Math.round(basePoints * recencyFactor);
    rawEngagementScore += earned;

    breakdown.push({
      category: "ENGAGEMENT",
      name: actName,
      pointsAwarded: earned,
      maxPoints: basePoints,
      reason: `${Math.round(daysAgo)} days ago (decay multiplier: ${(recencyFactor * 100).toFixed(0)}%)`,
    });
  }

  // Base bonus for any inbound lead creation
  if (activities.length === 0) {
    const baseNew = 15;
    rawEngagementScore = baseNew;
    breakdown.push({
      category: "ENGAGEMENT",
      name: "Initial Inbound Capture",
      pointsAwarded: baseNew,
      maxPoints: 30,
      reason: "Initial lead logged; waiting for first outreach interaction",
    });
  }

  const engagementScore = Math.min(100, rawEngagementScore);

  // --- 3. QUADRANT CLASSIFICATION ---
  let quadrant: LeadQuadrant;
  let recommendation: string;

  if (fitScore >= 60 && engagementScore >= 50) {
    quadrant = "HOT_LEAD";
    recommendation =
      "High Fit, High Engagement: Sales Ready. Assign senior account executive for immediate proposal and demo.";
  } else if (fitScore >= 60 && engagementScore < 50) {
    quadrant = "NURTURE";
    recommendation =
      "High Fit, Low Engagement: Strategic Target. Enroll in personalized executive email sequence & invite to campus workshop.";
  } else if (fitScore < 60 && engagementScore >= 50) {
    quadrant = "EVALUATE";
    recommendation =
      "Low Fit, High Engagement: Product-Led / Self-Serve. Direct to standard online modules or junior representative review.";
  } else {
    quadrant = "COLD";
    recommendation =
      "Low Fit, Low Engagement: Unqualified / Dormant. Place on newsletter list; archive active follow-up cadence.";
  }

  const blendedScore = Math.round(fitScore * 0.5 + engagementScore * 0.5);

  return {
    fitScore,
    engagementScore,
    blendedScore,
    quadrant,
    recommendation,
    breakdown,
  };
}

/**
 * Weighted Pipeline Forecast & Sales Velocity Analysis:
 */
export interface PipelineDeal {
  id: string;
  name: string;
  stage: OpportunityStage | string;
  value: number;
  closeDate?: Date | string | null;
  daysInPipeline?: number;
}

export interface PipelineForecastResult {
  totalOpportunities: number;
  totalUnweightedValue: number;
  totalWeightedValue: number;
  stageBreakdown: Record<
    string,
    {
      count: number;
      probabilityPercent: number;
      unweightedValue: number;
      weightedValue: number;
    }
  >;
  forecastCategoryBreakdown: Record<
    ForecastCategory,
    {
      count: number;
      value: number;
    }
  >;
  salesVelocity: {
    activeOpportunitiesCount: number;
    averageDealValue: number;
    winRatePercent: number;
    averageSalesCycleDays: number;
    velocityPerDay: number;
    expectedRevenuePerMonth: number;
  };
}

export function calculatePipelineForecast(
  activeDeals: PipelineDeal[],
  historicalWonCount: number = 10,
  historicalLostCount: number = 25,
  historicalAvgCycleDays: number = 45,
): PipelineForecastResult {
  let totalUnweighted = 0;
  let totalWeighted = 0;

  const stageBreakdown: PipelineForecastResult["stageBreakdown"] = {};
  const forecastCategoryBreakdown: Record<ForecastCategory, { count: number; value: number }> = {
    PIPELINE: { count: 0, value: 0 },
    BEST_CASE: { count: 0, value: 0 },
    COMMIT: { count: 0, value: 0 },
    CLOSED: { count: 0, value: 0 },
    OMITTED: { count: 0, value: 0 },
  };

  for (const deal of activeDeals) {
    const stage = (deal.stage as OpportunityStage) || "PROSPECTING";
    const prob = STAGE_PROBABILITIES[stage] ?? 0.1;
    const cat = STAGE_TO_FORECAST_CATEGORY[stage] ?? "PIPELINE";
    const val = Number(deal.value) || 0;
    const weighted = val * prob;

    totalUnweighted += val;
    totalWeighted += weighted;

    if (!stageBreakdown[stage]) {
      stageBreakdown[stage] = {
        count: 0,
        probabilityPercent: Math.round(prob * 100),
        unweightedValue: 0,
        weightedValue: 0,
      };
    }
    stageBreakdown[stage].count += 1;
    stageBreakdown[stage].unweightedValue += val;
    stageBreakdown[stage].weightedValue += weighted;

    forecastCategoryBreakdown[cat].count += 1;
    forecastCategoryBreakdown[cat].value += val;
  }

  // Velocity = (Active Deals * Avg Deal Value * Win Rate) / Avg Sales Cycle Days
  const activeCount = activeDeals.length;
  const avgDealValue = activeCount > 0 ? totalUnweighted / activeCount : 0;
  const totalHistoricalClosed = historicalWonCount + historicalLostCount;
  const winRate = totalHistoricalClosed > 0 ? historicalWonCount / totalHistoricalClosed : 0.25;
  const avgCycleDays = Math.max(1, historicalAvgCycleDays);

  const velocityPerDay = (activeCount * avgDealValue * winRate) / avgCycleDays;
  const expectedRevenuePerMonth = velocityPerDay * 30;

  return {
    totalOpportunities: activeCount,
    totalUnweightedValue: Math.round(totalUnweighted * 100) / 100,
    totalWeightedValue: Math.round(totalWeighted * 100) / 100,
    stageBreakdown,
    forecastCategoryBreakdown,
    salesVelocity: {
      activeOpportunitiesCount: activeCount,
      averageDealValue: Math.round(avgDealValue * 100) / 100,
      winRatePercent: Math.round(winRate * 1000) / 10,
      averageSalesCycleDays: avgCycleDays,
      velocityPerDay: Math.round(velocityPerDay * 100) / 100,
      expectedRevenuePerMonth: Math.round(expectedRevenuePerMonth * 100) / 100,
    },
  };
}

/**
 * Closed-Won Commercial Milestones Generator:
 * Generates delivery and billing milestones when an opportunity is Won.
 */
export interface ContractMilestone {
  milestoneNumber: number;
  title: string;
  percentage: number;
  amount: number;
  triggerEvent: string;
  expectedDaysFromSign: number;
  hsnSacCode: string;
  serviceDescription: string;
}

export function generateContractMilestones(
  dealValue: number,
  contractType: "ACADEMIC_TRAINING" | "SOFTWARE_CONSULTING" | "CUSTOM" = "ACADEMIC_TRAINING",
): ContractMilestone[] {
  const roundedTotal = Math.round(dealValue * 100) / 100;

  if (contractType === "SOFTWARE_CONSULTING") {
    const sac = "998311"; // IT & technical consulting services
    const m1 = Math.round(roundedTotal * 0.4 * 100) / 100;
    const m2 = Math.round(roundedTotal * 0.4 * 100) / 100;
    const m3 = Math.round((roundedTotal - m1 - m2) * 100) / 100;

    return [
      {
        milestoneNumber: 1,
        title: "Milestone 1: Project Inception & Architecture Signoff",
        percentage: 40,
        amount: m1,
        triggerEvent: "Contract execution & technical specifications approval",
        expectedDaysFromSign: 0,
        hsnSacCode: sac,
        serviceDescription: "Advance mobilization & solution architecture design",
      },
      {
        milestoneNumber: 2,
        title: "Milestone 2: Core Platform Deployment & UAT",
        percentage: 40,
        amount: m2,
        triggerEvent: "User Acceptance Testing (UAT) signoff",
        expectedDaysFromSign: 45,
        hsnSacCode: sac,
        serviceDescription: "System development, integration and staging deployment",
      },
      {
        milestoneNumber: 3,
        title: "Milestone 3: Final Acceptance & Handover",
        percentage: 20,
        amount: m3,
        triggerEvent: "Production go-live & final acceptance certificate",
        expectedDaysFromSign: 90,
        hsnSacCode: sac,
        serviceDescription: "Production release, training and warranty support handover",
      },
    ];
  }

  // Default: ACADEMIC_TRAINING (Curriculum & Institutional Skilling)
  const sac = "999293"; // Commercial training and coaching services
  const m1 = Math.round(roundedTotal * 0.3 * 100) / 100;
  const m2 = Math.round(roundedTotal * 0.4 * 100) / 100;
  const m3 = Math.round((roundedTotal - m1 - m2) * 100) / 100;

  return [
    {
      milestoneNumber: 1,
      title: "Milestone 1: Advance Mobilization & Course Onboarding",
      percentage: 30,
      amount: m1,
      triggerEvent: "MoU / Institutional agreement execution and student enrollment",
      expectedDaysFromSign: 0,
      hsnSacCode: sac,
      serviceDescription: "Institutional training mobilization, LMS onboarding and course materials",
    },
    {
      milestoneNumber: 2,
      title: "Milestone 2: Mid-Term Labs & Milestone Assessment",
      percentage: 40,
      amount: m2,
      triggerEvent: "Completion of 50% classroom lectures and mid-term practical evaluation",
      expectedDaysFromSign: 60,
      hsnSacCode: sac,
      serviceDescription: "Technical skill modules, hands-on lab sessions, and interim assessments",
    },
    {
      milestoneNumber: 3,
      title: "Milestone 3: Final Hackathon, Certification & Placement Support",
      percentage: 30,
      amount: m3,
      triggerEvent: "Final project evaluation, course completion certificates and placement drives",
      expectedDaysFromSign: 120,
      hsnSacCode: sac,
      serviceDescription:
        "Final industrial project signoff, certification issuance and recruitment drive execution",
    },
  ];
}
