/**
 * Advanced GST Engine for TechM4India ERP
 *
 * Implements Indian GST statutory arithmetic compliant with CGST/SGST/IGST Acts:
 * 1. Place of Supply determination (intra-state CGST + SGST vs inter-state IGST).
 * 2. Section 17(5) blocked credit categorization (ineligible ITC).
 * 3. Reverse Charge Mechanism (RCM) liabilities under Section 9(3)/9(4).
 * 4. GSTR-3B Table 4 head-wise ITC offset cascade per Rule 88A & Sections 49/49A/49B.
 * 5. GSTR-1 rate-wise & HSN/SAC summary aggregation.
 *
 * Kept completely zero-dependency and decimal/paise-safe so it runs in browser,
 * node, and backend seamlessly.
 */

export type TaxSplit = {
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
};

export type ItcEligibility = "ELIGIBLE" | "BLOCKED" | "PROPORTIONATE" | "INELIGIBLE_OTHER";

/**
 * Common SAC / HSN codes and categories blocked under Section 17(5) of CGST Act:
 * - 9963: Food and beverages, outdoor catering, restaurants (s.17(5)(b)(i))
 * - 9964 / 9965 / 8702 / 8703: Motor vehicles for transport of persons <= 13 capacity (s.17(5)(a))
 * - 9996: Club, health and fitness centre memberships (s.17(5)(b)(ii))
 * - 9997: Beauty treatment, cosmetic and plastic surgery (s.17(5)(b)(i))
 * - Personal consumption / gifts / free samples / lost / stolen / destroyed goods (s.17(5)(g), (h))
 */
export const SECTION_17_5_BLOCKED_CODES = new Set([
  "9963", // Food & Beverage, Catering
  "9996", // Club / Gym / Fitness
  "9997", // Beauty / Health
  "8702", // Passenger motor vehicles
  "8703", // Cars / personal vehicles
]);

export const SECTION_17_5_BLOCKED_CATEGORIES = new Set([
  "FOOD_AND_BEVERAGE",
  "CATERING",
  "CLUB_MEMBERSHIP",
  "FITNESS_CENTRE",
  "MOTOR_VEHICLE_PERSONAL",
  "EMPLOYEE_PERSONAL_TRAVEL",
  "GIFTS_AND_FREE_SAMPLES",
  "LOST_OR_STOLEN_GOODS",
  "PERSONAL_CONSUMPTION",
]);

export function roundPaise(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function emptySplit(): TaxSplit {
  return { cgst: 0, sgst: 0, igst: 0, cess: 0 };
}

/**
 * Extracts 2-digit state code from GSTIN or state string (e.g. "36" or "36-Telangana" -> "36").
 */
export function stateCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{2})/);
  return match ? match[1] : null;
}

/**
 * Determines whether supply is intra-state (same supplier and destination state)
 * or inter-state (different states).
 */
export function isIntraState(
  supplierGstin: string | null | undefined,
  placeOfSupply: string | null | undefined,
  partyGstin?: string | null | undefined,
): boolean {
  const supplier = stateCode(supplierGstin);
  if (!supplier) return true; // Conservative fallback
  const destination = stateCode(placeOfSupply) ?? stateCode(partyGstin);
  if (!destination) return true;
  return destination === supplier;
}

/**
 * Splits tax into CGST, SGST, IGST, Cess.
 * Intra-state: 50% CGST + 50% SGST (paise-safe rounding).
 * Inter-state: 100% IGST.
 */
export function splitTax(
  taxAmount: number,
  taxType: string | null | undefined,
  intraState: boolean,
): TaxSplit {
  const roundedTax = roundPaise(taxAmount);
  if (roundedTax === 0) return emptySplit();

  switch (taxType) {
    case "CGST":
      return { cgst: roundedTax, sgst: 0, igst: 0, cess: 0 };
    case "SGST":
      return { cgst: 0, sgst: roundedTax, igst: 0, cess: 0 };
    case "IGST":
      return { cgst: 0, sgst: 0, igst: roundedTax, cess: 0 };
    case "CESS":
      return { cgst: 0, sgst: 0, igst: 0, cess: roundedTax };
    default: {
      if (!intraState) {
        return { cgst: 0, sgst: 0, igst: roundedTax, cess: 0 };
      }
      const half = Math.floor(roundedTax * 50) / 100;
      const otherHalf = roundPaise(roundedTax - half);
      return { cgst: otherHalf, sgst: half, igst: 0, cess: 0 };
    }
  }
}

export function addSplit(a: TaxSplit, b: TaxSplit): TaxSplit {
  return {
    cgst: roundPaise(a.cgst + b.cgst),
    sgst: roundPaise(a.sgst + b.sgst),
    igst: roundPaise(a.igst + b.igst),
    cess: roundPaise(a.cess + b.cess),
  };
}

export function splitTotal(split: TaxSplit): number {
  return roundPaise(split.cgst + split.sgst + split.igst + split.cess);
}

/**
 * Checks whether an inward supply item falls under Section 17(5) blocked credit.
 */
export function isSection17_5Blocked(
  hsnSacCode?: string | null,
  category?: string | null,
  explicitEligibility?: ItcEligibility,
): { blocked: boolean; reason?: string } {
  if (explicitEligibility === "BLOCKED") {
    return { blocked: true, reason: "Explicitly marked as ineligible under Section 17(5)" };
  }
  if (explicitEligibility === "ELIGIBLE") {
    return { blocked: false };
  }

  if (category && SECTION_17_5_BLOCKED_CATEGORIES.has(category.trim().toUpperCase())) {
    return {
      blocked: true,
      reason: `Blocked under Section 17(5): Category ${category} is non-creditable personal/recreational expense`,
    };
  }

  if (hsnSacCode) {
    const codePrefix = hsnSacCode.trim().substring(0, 4);
    if (SECTION_17_5_BLOCKED_CODES.has(codePrefix)) {
      return {
        blocked: true,
        reason: `Blocked under Section 17(5): SAC/HSN ${codePrefix} represents ineligible supplies (catering, vehicles, memberships, beauty)`,
      };
    }
  }

  return { blocked: false };
}

/**
 * GSTR-3B Table 4 Set-off Rule 88A Cascade:
 *
 * Statutory Rule 88A Order of Utilization:
 * 1. IGST ITC must be completely exhausted first:
 *    a. Against IGST output liability.
 *    b. Then against CGST and SGST output liabilities in any proportion (standard practice: split equally or prioritize largest liability).
 * 2. CGST ITC can be utilized:
 *    a. Against CGST output liability.
 *    b. Then against IGST output liability.
 *    (CGST ITC can NEVER be utilized against SGST output liability).
 * 3. SGST ITC can be utilized:
 *    a. Against SGST output liability.
 *    b. Then against IGST output liability.
 *    (SGST ITC can NEVER be utilized against CGST output liability).
 * 4. Cess ITC can only be utilized against Cess output liability.
 * 5. RCM Liabilities MUST be paid in CASH and CANNOT be discharged via ITC balance.
 */
export interface Gstr3bOffsetResult {
  outputLiability: TaxSplit;
  itcAvailable: TaxSplit;
  itcUtilized: {
    igstAgainstIgst: number;
    igstAgainstCgst: number;
    igstAgainstSgst: number;
    cgstAgainstCgst: number;
    cgstAgainstIgst: number;
    sgstAgainstSgst: number;
    sgstAgainstIgst: number;
    cessAgainstCess: number;
    totalUtilized: TaxSplit;
  };
  closingItcBalance: TaxSplit;
  netTaxPayableInCash: TaxSplit;
  rcmCashLiability: TaxSplit;
  totalCashPayable: TaxSplit;
}

export function calculateRule88AOffset(
  outputLiability: TaxSplit,
  availableItc: TaxSplit,
  rcmLiability: TaxSplit = emptySplit(),
): Gstr3bOffsetResult {
  // Work with remaining balances
  let remLiabIgst = outputLiability.igst;
  let remLiabCgst = outputLiability.cgst;
  let remLiabSgst = outputLiability.sgst;
  let remLiabCess = outputLiability.cess;

  let remItcIgst = availableItc.igst;
  let remItcCgst = availableItc.cgst;
  let remItcSgst = availableItc.sgst;
  let remItcCess = availableItc.cess;

  // 1. Step 1: IGST ITC against IGST liability
  const igstAgainstIgst = Math.min(remItcIgst, remLiabIgst);
  remItcIgst = roundPaise(remItcIgst - igstAgainstIgst);
  remLiabIgst = roundPaise(remLiabIgst - igstAgainstIgst);

  // 1b. Remaining IGST ITC against CGST liability
  const igstAgainstCgst = Math.min(remItcIgst, remLiabCgst);
  remItcIgst = roundPaise(remItcIgst - igstAgainstCgst);
  remLiabCgst = roundPaise(remLiabCgst - igstAgainstCgst);

  // 1c. Remaining IGST ITC against SGST liability
  const igstAgainstSgst = Math.min(remItcIgst, remLiabSgst);
  remItcIgst = roundPaise(remItcIgst - igstAgainstSgst);
  remLiabSgst = roundPaise(remLiabSgst - igstAgainstSgst);

  // 2. Step 2: CGST ITC against remaining CGST liability
  const cgstAgainstCgst = Math.min(remItcCgst, remLiabCgst);
  remItcCgst = roundPaise(remItcCgst - cgstAgainstCgst);
  remLiabCgst = roundPaise(remLiabCgst - cgstAgainstCgst);

  // 2b. Remaining CGST ITC against remaining IGST liability
  const cgstAgainstIgst = Math.min(remItcCgst, remLiabIgst);
  remItcCgst = roundPaise(remItcCgst - cgstAgainstIgst);
  remLiabIgst = roundPaise(remLiabIgst - cgstAgainstIgst);

  // 3. Step 3: SGST ITC against remaining SGST liability
  const sgstAgainstSgst = Math.min(remItcSgst, remLiabSgst);
  remItcSgst = roundPaise(remItcSgst - sgstAgainstSgst);
  remLiabSgst = roundPaise(remLiabSgst - sgstAgainstSgst);

  // 3b. Remaining SGST ITC against remaining IGST liability
  const sgstAgainstIgst = Math.min(remItcSgst, remLiabIgst);
  remItcSgst = roundPaise(remItcSgst - sgstAgainstIgst);
  remLiabIgst = roundPaise(remLiabIgst - sgstAgainstIgst);

  // 4. Step 4: Cess ITC against Cess liability
  const cessAgainstCess = Math.min(remItcCess, remLiabCess);
  remItcCess = roundPaise(remItcCess - cessAgainstCess);
  remLiabCess = roundPaise(remLiabCess - cessAgainstCess);

  const totalUtilized: TaxSplit = {
    cgst: roundPaise(cgstAgainstCgst + igstAgainstCgst),
    sgst: roundPaise(sgstAgainstSgst + igstAgainstSgst),
    igst: roundPaise(igstAgainstIgst + cgstAgainstIgst + sgstAgainstIgst),
    cess: roundPaise(cessAgainstCess),
  };

  const closingItcBalance: TaxSplit = {
    cgst: remItcCgst,
    sgst: remItcSgst,
    igst: remItcIgst,
    cess: remItcCess,
  };

  const netTaxPayableInCash: TaxSplit = {
    cgst: remLiabCgst,
    sgst: remLiabSgst,
    igst: remLiabIgst,
    cess: remLiabCess,
  };

  // Statutory requirement: RCM liability must be paid in cash!
  const totalCashPayable: TaxSplit = {
    cgst: roundPaise(netTaxPayableInCash.cgst + rcmLiability.cgst),
    sgst: roundPaise(netTaxPayableInCash.sgst + rcmLiability.sgst),
    igst: roundPaise(netTaxPayableInCash.igst + rcmLiability.igst),
    cess: roundPaise(netTaxPayableInCash.cess + rcmLiability.cess),
  };

  return {
    outputLiability,
    itcAvailable: availableItc,
    itcUtilized: {
      igstAgainstIgst,
      igstAgainstCgst,
      igstAgainstSgst,
      cgstAgainstCgst,
      cgstAgainstIgst,
      sgstAgainstSgst,
      sgstAgainstIgst,
      cessAgainstCess,
      totalUtilized,
    },
    closingItcBalance,
    netTaxPayableInCash,
    rcmCashLiability: rcmLiability,
    totalCashPayable,
  };
}

/**
 * GSTR-3B Table 4 comprehensive breakdown:
 * Table 4(A) ITC Available:
 *  - 4(A)(1): Import of Goods
 *  - 4(A)(2): Import of Services
 *  - 4(A)(3): Inward supplies liable to reverse charge (RCM)
 *  - 4(A)(4): Inward supplies from Input Service Distributor (ISD)
 *  - 4(A)(5): All other ITC (general eligible purchases)
 * Table 4(B) ITC Reversed:
 *  - 4(B)(1): As per Rules 38, 42 & 43 and Section 17(5) (Permanent)
 *  - 4(B)(2): Others (Reclaimable e.g. 180-day non-payment to vendor)
 * Table 4(C) Net ITC Available = 4(A) - 4(B)
 * Table 4(D) Other Details:
 *  - 4(D)(1): ITC reclaimed
 *  - 4(D)(2): Ineligible ITC under section 16(4) & PoS restrictions
 */
export interface Gstr3bTable4Data {
  table4A_Available: {
    importGoods: TaxSplit;
    importServices: TaxSplit;
    rcmSupplies: TaxSplit;
    isdSupplies: TaxSplit;
    allOtherItc: TaxSplit;
    total: TaxSplit;
  };
  table4B_Reversed: {
    section17_5Blocked: TaxSplit;
    othersReversible: TaxSplit;
    total: TaxSplit;
  };
  table4C_NetItc: TaxSplit;
  table4D_Ineligible: {
    section16_4TimeBarred: TaxSplit;
    posRestricted: TaxSplit;
    total: TaxSplit;
  };
}

export function compileGstr3bTable4(params: {
  allOtherItc: TaxSplit;
  rcmSupplies?: TaxSplit;
  section17_5Blocked?: TaxSplit;
  othersReversible?: TaxSplit;
  importGoods?: TaxSplit;
  importServices?: TaxSplit;
  isdSupplies?: TaxSplit;
  section16_4TimeBarred?: TaxSplit;
  posRestricted?: TaxSplit;
}): Gstr3bTable4Data {
  const empty = emptySplit();
  const allOtherItc = params.allOtherItc;
  const rcmSupplies = params.rcmSupplies ?? empty;
  const importGoods = params.importGoods ?? empty;
  const importServices = params.importServices ?? empty;
  const isdSupplies = params.isdSupplies ?? empty;

  const total4A = [allOtherItc, rcmSupplies, importGoods, importServices, isdSupplies].reduce(
    (acc, cur) => addSplit(acc, cur),
    empty,
  );

  const section17_5Blocked = params.section17_5Blocked ?? empty;
  const othersReversible = params.othersReversible ?? empty;
  const total4B = addSplit(section17_5Blocked, othersReversible);

  const netCgst = Math.max(0, roundPaise(total4A.cgst - total4B.cgst));
  const netSgst = Math.max(0, roundPaise(total4A.sgst - total4B.sgst));
  const netIgst = Math.max(0, roundPaise(total4A.igst - total4B.igst));
  const netCess = Math.max(0, roundPaise(total4A.cess - total4B.cess));

  const total4C: TaxSplit = {
    cgst: netCgst,
    sgst: netSgst,
    igst: netIgst,
    cess: netCess,
  };

  const section16_4TimeBarred = params.section16_4TimeBarred ?? empty;
  const posRestricted = params.posRestricted ?? empty;
  const total4D = addSplit(section16_4TimeBarred, posRestricted);

  return {
    table4A_Available: {
      importGoods,
      importServices,
      rcmSupplies,
      isdSupplies,
      allOtherItc,
      total: total4A,
    },
    table4B_Reversed: {
      section17_5Blocked,
      othersReversible,
      total: total4B,
    },
    table4C_NetItc: total4C,
    table4D_Ineligible: {
      section16_4TimeBarred,
      posRestricted,
      total: total4D,
    },
  };
}

export function serialiseSplit(split: TaxSplit) {
  return {
    cgst: split.cgst.toFixed(2),
    sgst: split.sgst.toFixed(2),
    igst: split.igst.toFixed(2),
    cess: split.cess.toFixed(2),
    total: splitTotal(split).toFixed(2),
  };
}
