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

export const ZERO = new Prisma.Decimal(0);

export function decimal(value: Prisma.Decimal.Value): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

export function emptySplit(): TaxSplit {
  return { cgst: ZERO, sgst: ZERO, igst: ZERO, cess: ZERO };
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
