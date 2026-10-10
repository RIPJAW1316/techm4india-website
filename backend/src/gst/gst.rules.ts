import { Prisma } from "@prisma/client";

/**
 * GST arithmetic, kept free of Nest and Prisma plumbing so the rules can be read
 * and tested on their own.
 *
 * Nothing here talks to the GST portal. Every figure is computed from records
 * the organization entered, which is why the UI labels these as workings for
 * review rather than as filed returns.
 */

export type TaxSplit = {
  cgst: Prisma.Decimal;
  sgst: Prisma.Decimal;
  igst: Prisma.Decimal;
  cess: Prisma.Decimal;
};

export type ItcEligibility = "ELIGIBLE" | "BLOCKED" | "PROPORTIONATE" | "INELIGIBLE_OTHER";

export const ZERO = new Prisma.Decimal(0);

export function decimal(value: Prisma.Decimal.Value): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

export function emptySplit(): TaxSplit {
  return { cgst: ZERO, sgst: ZERO, igst: ZERO, cess: ZERO };
}

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
 * The first two characters of a GSTIN are the state code (29 = Karnataka).
 * A place of supply may be entered as "29" or "29-Karnataka"; both yield "29".
 */
export function stateCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{2})/);
  return match ? match[1] : null;
}

/**
 * A supply is intra-state when the place of supply is in the supplier's own
 * state, which is what decides CGST + SGST against IGST. When the place of
 * supply was not recorded, fall back to the customer's own GSTIN, and failing
 * that treat the supply as intra-state — the conservative reading for a
 * business supplying mostly within its home state.
 */
export function isIntraState(
  supplierGstin: string | null | undefined,
  placeOfSupply: string | null | undefined,
  partyGstin: string | null | undefined,
): boolean {
  const supplier = stateCode(supplierGstin);
  if (!supplier) return true;
  const destination = stateCode(placeOfSupply) ?? stateCode(partyGstin);
  if (!destination) return true;
  return destination === supplier;
}

/**
 * Splits a computed tax amount into the heads that must be reported.
 *
 * A single intra-state GST charge is levied half as central and half as state
 * tax; an inter-state charge is levied wholly as integrated tax. Rates already
 * captured as CGST/SGST/IGST/CESS are reported under that head as entered.
 */
export function splitTax(
  taxAmount: Prisma.Decimal,
  taxType: string | null | undefined,
  intraState: boolean,
): TaxSplit {
  const split = emptySplit();
  if (taxAmount.isZero()) return split;

  switch (taxType) {
    case "CGST":
      return { ...split, cgst: taxAmount };
    case "SGST":
      return { ...split, sgst: taxAmount };
    case "IGST":
      return { ...split, igst: taxAmount };
    case "CESS":
      return { ...split, cess: taxAmount };
    default: {
      if (!intraState) return { ...split, igst: taxAmount };
      // Halve to the paise, then give any remainder to the central head so the
      // two halves always add back to the charged amount.
      const half = taxAmount.dividedBy(2).toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
      return { ...split, cgst: taxAmount.minus(half), sgst: half };
    }
  }
}

export function addSplit(target: TaxSplit, addition: TaxSplit): TaxSplit {
  return {
    cgst: target.cgst.plus(addition.cgst),
    sgst: target.sgst.plus(addition.sgst),
    igst: target.igst.plus(addition.igst),
    cess: target.cess.plus(addition.cess),
  };
}

export function splitTotal(split: TaxSplit): Prisma.Decimal {
  return split.cgst.plus(split.sgst).plus(split.igst).plus(split.cess);
}

/**
 * Input tax credit is set off head-wise, and a head can never go below zero:
 * unused credit carries forward rather than becoming a refund on the summary.
 */
export function netPayable(output: TaxSplit, credit: TaxSplit): TaxSplit {
  const offset = (out: Prisma.Decimal, itc: Prisma.Decimal) =>
    out.minus(itc).isNegative() ? ZERO : out.minus(itc);
  return {
    cgst: offset(output.cgst, credit.cgst),
    sgst: offset(output.sgst, credit.sgst),
    igst: offset(output.igst, credit.igst),
    cess: offset(output.cess, credit.cess),
  };
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
export interface Gstr3bOffsetResultDecimal {
  outputLiability: TaxSplit;
  itcAvailable: TaxSplit;
  itcUtilized: {
    igstAgainstIgst: Prisma.Decimal;
    igstAgainstCgst: Prisma.Decimal;
    igstAgainstSgst: Prisma.Decimal;
    cgstAgainstCgst: Prisma.Decimal;
    cgstAgainstIgst: Prisma.Decimal;
    sgstAgainstSgst: Prisma.Decimal;
    sgstAgainstIgst: Prisma.Decimal;
    cessAgainstCess: Prisma.Decimal;
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
): Gstr3bOffsetResultDecimal {
  const minDec = (a: Prisma.Decimal, b: Prisma.Decimal) => (a.lessThan(b) ? a : b);

  let remLiabIgst = outputLiability.igst;
  let remLiabCgst = outputLiability.cgst;
  let remLiabSgst = outputLiability.sgst;
  let remLiabCess = outputLiability.cess;

  let remItcIgst = availableItc.igst;
  let remItcCgst = availableItc.cgst;
  let remItcSgst = availableItc.sgst;
  let remItcCess = availableItc.cess;

  // 1. Step 1: IGST ITC against IGST liability
  const igstAgainstIgst = minDec(remItcIgst, remLiabIgst);
  remItcIgst = remItcIgst.minus(igstAgainstIgst);
  remLiabIgst = remLiabIgst.minus(igstAgainstIgst);

  // 1b. Remaining IGST ITC against CGST liability
  const igstAgainstCgst = minDec(remItcIgst, remLiabCgst);
  remItcIgst = remItcIgst.minus(igstAgainstCgst);
  remLiabCgst = remLiabCgst.minus(igstAgainstCgst);

  // 1c. Remaining IGST ITC against SGST liability
  const igstAgainstSgst = minDec(remItcIgst, remLiabSgst);
  remItcIgst = remItcIgst.minus(igstAgainstSgst);
  remLiabSgst = remLiabSgst.minus(igstAgainstSgst);

  // 2. Step 2: CGST ITC against remaining CGST liability
  const cgstAgainstCgst = minDec(remItcCgst, remLiabCgst);
  remItcCgst = remItcCgst.minus(cgstAgainstCgst);
  remLiabCgst = remLiabCgst.minus(cgstAgainstCgst);

  // 2b. Remaining CGST ITC against remaining IGST liability
  const cgstAgainstIgst = minDec(remItcCgst, remLiabIgst);
  remItcCgst = remItcCgst.minus(cgstAgainstIgst);
  remLiabIgst = remLiabIgst.minus(cgstAgainstIgst);

  // 3. Step 3: SGST ITC against remaining SGST liability
  const sgstAgainstSgst = minDec(remItcSgst, remLiabSgst);
  remItcSgst = remItcSgst.minus(sgstAgainstSgst);
  remLiabSgst = remLiabSgst.minus(sgstAgainstSgst);

  // 3b. Remaining SGST ITC against remaining IGST liability
  const sgstAgainstIgst = minDec(remItcSgst, remLiabIgst);
  remItcSgst = remItcSgst.minus(sgstAgainstIgst);
  remLiabIgst = remLiabIgst.minus(sgstAgainstIgst);

  // 4. Step 4: Cess ITC against Cess liability
  const cessAgainstCess = minDec(remItcCess, remLiabCess);
  remItcCess = remItcCess.minus(cessAgainstCess);
  remLiabCess = remLiabCess.minus(cessAgainstCess);

  const totalUtilized: TaxSplit = {
    cgst: cgstAgainstCgst.plus(igstAgainstCgst),
    sgst: sgstAgainstSgst.plus(igstAgainstSgst),
    igst: igstAgainstIgst.plus(cgstAgainstIgst).plus(sgstAgainstIgst),
    cess: cessAgainstCess,
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

  const totalCashPayable: TaxSplit = {
    cgst: netTaxPayableInCash.cgst.plus(rcmLiability.cgst),
    sgst: netTaxPayableInCash.sgst.plus(rcmLiability.sgst),
    igst: netTaxPayableInCash.igst.plus(rcmLiability.igst),
    cess: netTaxPayableInCash.cess.plus(rcmLiability.cess),
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
 * The effective rate for a line, preferring the rate captured on the invoice at
 * issue time over the rate master, which may have changed since.
 */
export function effectiveRate(
  snapshot: Prisma.Decimal | null | undefined,
  current: Prisma.Decimal | null | undefined,
): Prisma.Decimal {
  return snapshot ?? current ?? ZERO;
}

/** Serialises a split for the API, where money is carried as fixed-point text. */
export function serialiseSplit(split: TaxSplit) {
  return {
    cgst: split.cgst.toFixed(2),
    sgst: split.sgst.toFixed(2),
    igst: split.igst.toFixed(2),
    cess: split.cess.toFixed(2),
    total: splitTotal(split).toFixed(2),
  };
}
