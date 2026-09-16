import { Injectable, NotFoundException } from "@nestjs/common";
import { FinanceInvoiceStatus, Prisma } from "@prisma/client";

import { AuditService } from "../audit/audit.service";
import { Principal } from "../auth/auth.types";
import { RequestMetadata } from "../auth/interfaces/request-metadata";
import { V2ServiceBase } from "../common/v2-service.base";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateHsnSacCodeDto,
  GstPeriodDto,
  GstRegisterQueryDto,
  HsnSacQueryDto,
  UpdateHsnSacCodeDto,
} from "./dto/gst.dto";
import {
  addSplit,
  decimal,
  effectiveRate,
  emptySplit,
  isIntraState,
  netPayable,
  serialiseSplit,
  splitTax,
  splitTotal,
  stateCode,
  ZERO,
  type TaxSplit,
} from "./gst.rules";

/** Invoice states that represent a supply actually made. */
const OUTWARD_STATES: FinanceInvoiceStatus[] = ["ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE"];

type Accumulator = {
  taxableValue: Prisma.Decimal;
  split: TaxSplit;
  invoices: Set<string>;
};

function bucket(): Accumulator {
  return { taxableValue: ZERO, split: emptySplit(), invoices: new Set() };
}

@Injectable()
export class GstService extends V2ServiceBase {
  constructor(prisma: PrismaService, audit: AuditService) {
    super(prisma, audit);
  }

  // -- HSN / SAC master ----------------------------------------------------

  async listHsnCodes(principal: Principal, query: HsnSacQueryDto) {
    return this.prisma.hsnSacCode.findMany({
      where: {
        organizationId: this.organizationId(principal),
        kind: query.kind,
        ...(query.search
          ? {
              OR: [
                { code: { contains: query.search, mode: "insensitive" as const } },
                { description: { contains: query.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
      orderBy: { code: "asc" },
    });
  }

  async createHsnCode(principal: Principal, dto: CreateHsnSacCodeDto, request?: RequestMetadata) {
    let row;
    try {
      row = await this.prisma.hsnSacCode.create({
        data: {
          organizationId: this.organizationId(principal),
          code: dto.code.trim(),
          kind: dto.kind,
          description: dto.description.trim(),
          defaultRatePercent: decimal(dto.defaultRatePercent),
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      this.duplicate(error, "This HSN/SAC code is already registered in the organization");
    }
    await this.record("GST_HSN_CODE_CREATED", principal, "HsnSacCode", row.id, request, {
      code: row.code,
      kind: row.kind,
    });
    return row;
  }

  async updateHsnCode(
    principal: Principal,
    id: string,
    dto: UpdateHsnSacCodeDto,
    request?: RequestMetadata,
  ) {
    const existing = await this.prisma.hsnSacCode.findFirst({
      where: { id, organizationId: this.organizationId(principal) },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException("HSN/SAC code not found");

    const row = await this.prisma.hsnSacCode.update({
      where: { id },
      data: {
        description: dto.description?.trim(),
        defaultRatePercent:
          dto.defaultRatePercent === undefined ? undefined : decimal(dto.defaultRatePercent),
        isActive: dto.isActive,
      },
    });
    await this.record("GST_HSN_CODE_UPDATED", principal, "HsnSacCode", row.id, request);
    return row;
  }

  // -- Shared reads --------------------------------------------------------

  /** The supplier's own registration, which decides intra- against inter-state. */
  private async supplier(principal: Principal) {
    const organizationId = this.organizationId(principal);
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { gstin: true, legalName: true, registeredState: true },
    });
    return { organizationId, ...organization };
  }

  private periodWhere(range: GstPeriodDto, field: "invoiceDate" | "expenseDate") {
    if (!range.from && !range.to) return {};
    return {
      [field]: {
        gte: range.from ? new Date(range.from) : undefined,
        lte: range.to ? new Date(range.to) : undefined,
      },
    };
  }

  private async outwardLines(principal: Principal, range: GstPeriodDto) {
    const { organizationId, gstin } = await this.supplier(principal);
    const invoices = await this.prisma.financeInvoice.findMany({
      where: {
        organizationId,
        status: { in: OUTWARD_STATES },
        ...this.periodWhere(range, "invoiceDate"),
      },
      include: {
        party: { select: { name: true, gstin: true } },
        lines: { include: { taxRate: { select: { taxType: true, rate: true } } } },
      },
      orderBy: { invoiceDate: "asc" },
    });

    return invoices.flatMap((invoice) => {
      const partyGstin = invoice.partyGstinSnapshot ?? invoice.party?.gstin ?? null;
      const intraState = isIntraState(gstin, invoice.placeOfSupply, partyGstin);
      const place =
        stateCode(invoice.placeOfSupply) ?? stateCode(partyGstin) ?? stateCode(gstin) ?? "—";
      return invoice.lines.map((line) => ({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        partyName: invoice.partyNameSnapshot ?? invoice.party?.name ?? "—",
        partyGstin,
        placeOfSupply: place,
        intraState,
        hsnSacCode: line.hsnSacCode ?? "—",
        description: line.description,
        taxableValue: line.taxableValue,
        ratePercent: effectiveRate(line.taxRateSnapshot, line.taxRate?.rate),
        split: splitTax(line.taxAmount, line.taxRate?.taxType, intraState),
      }));
    });
  }

  // -- GSTR-1: outward supplies -------------------------------------------

  /**
   * Rate-wise outward supply working. Registered counterparties are reported
   * individually (B2B); unregistered ones are aggregated by place of supply and
   * rate (B2C), because GSTR-1 does not name consumers.
   */
  async gstr1(principal: Principal, range: GstPeriodDto) {
    const { organizationId, gstin, legalName } = await this.supplier(principal);
    const lines = await this.outwardLines(principal, range);

    const b2b = new Map<string, Accumulator & { meta: Record<string, unknown> }>();
    const b2c = new Map<string, Accumulator & { meta: Record<string, unknown> }>();
    const hsn = new Map<string, Accumulator & { meta: Record<string, unknown> }>();
    let totalTaxable = ZERO;
    let totals = emptySplit();

    for (const line of lines) {
      const rate = line.ratePercent.toFixed(2);
      const registered = Boolean(line.partyGstin);
      const target = registered ? b2b : b2c;
      const key = registered
        ? `${line.partyGstin}|${line.placeOfSupply}|${rate}`
        : `${line.placeOfSupply}|${rate}`;

      const row =
        target.get(key) ??
        ({
          ...bucket(),
          meta: registered
            ? {
                partyName: line.partyName,
                partyGstin: line.partyGstin,
                placeOfSupply: line.placeOfSupply,
                ratePercent: rate,
              }
            : { placeOfSupply: line.placeOfSupply, ratePercent: rate },
        } as Accumulator & { meta: Record<string, unknown> });
      row.taxableValue = row.taxableValue.plus(line.taxableValue);
      row.split = addSplit(row.split, line.split);
      row.invoices.add(line.invoiceId);
      target.set(key, row);

      const hsnKey = `${line.hsnSacCode}|${rate}`;
      const hsnRow =
        hsn.get(hsnKey) ??
        ({
          ...bucket(),
          meta: { hsnSacCode: line.hsnSacCode, ratePercent: rate },
        } as Accumulator & { meta: Record<string, unknown> });
      hsnRow.taxableValue = hsnRow.taxableValue.plus(line.taxableValue);
      hsnRow.split = addSplit(hsnRow.split, line.split);
      hsnRow.invoices.add(line.invoiceId);
      hsn.set(hsnKey, hsnRow);

      totalTaxable = totalTaxable.plus(line.taxableValue);
      totals = addSplit(totals, line.split);
    }

    const serialise = (map: Map<string, Accumulator & { meta: Record<string, unknown> }>) =>
      [...map.values()]
        .map((row) => ({
          ...row.meta,
          taxableValue: row.taxableValue.toFixed(2),
          ...serialiseSplit(row.split),
          totalTax: splitTotal(row.split).toFixed(2),
          invoiceCount: row.invoices.size,
        }))
        .sort((a, b) => Number(b.taxableValue) - Number(a.taxableValue));

    const [issued, cancelled] = await Promise.all([
      this.prisma.financeInvoice.count({
        where: {
          organizationId,
          status: { in: OUTWARD_STATES },
          ...this.periodWhere(range, "invoiceDate"),
        },
      }),
      this.prisma.financeInvoice.count({
        where: {
          organizationId,
          status: "CANCELLED",
          ...this.periodWhere(range, "invoiceDate"),
        },
      }),
    ]);

    return {
      period: { from: range.from ?? null, to: range.to ?? null },
      supplier: { legalName: legalName ?? null, gstin: gstin ?? null },
      b2b: serialise(b2b),
      b2c: serialise(b2c),
      hsnSummary: serialise(hsn),
      documentSummary: { issued, cancelled },
      totals: {
        taxableValue: totalTaxable.toFixed(2),
        ...serialiseSplit(totals),
        totalTax: splitTotal(totals).toFixed(2),
      },
    };
  }

  // -- Input tax credit ----------------------------------------------------

  /** Approved purchases carrying tax, which is what credit may be claimed on. */
  private async inwardLines(principal: Principal, range: GstPeriodDto) {
    const { organizationId, gstin } = await this.supplier(principal);
    const expenses = await this.prisma.financeExpense.findMany({
      where: {
        organizationId,
        status: "APPROVED",
        ...this.periodWhere(range, "expenseDate"),
      },
      include: {
        vendor: { select: { name: true, gstin: true } },
        lines: { include: { taxRate: { select: { taxType: true, rate: true } } } },
      },
      orderBy: { expenseDate: "asc" },
    });

    return expenses.flatMap((expense) => {
      const vendorGstin = expense.vendor?.gstin ?? null;
      const intraState = isIntraState(gstin, vendorGstin, vendorGstin);
      return expense.lines
        .filter((line) => !line.taxAmount.isZero())
        .map((line) => ({
          expenseId: expense.id,
          expenseNumber: expense.expenseNumber,
          expenseDate: expense.expenseDate,
          vendorName: expense.vendor?.name ?? "—",
          vendorGstin,
          hsnSacCode: line.hsnSacCode ?? "—",
          description: line.description,
          taxableValue: line.amount,
          ratePercent: line.taxRate?.rate ?? ZERO,
          split: splitTax(line.taxAmount, line.taxRate?.taxType, intraState),
        }));
    });
  }

  async itcRegister(principal: Principal, query: GstRegisterQueryDto) {
    const { page, limit } = this.page({ page: query.page, limit: query.limit });
    const lines = await this.inwardLines(principal, query);
    const start = (page - 1) * limit;

    return {
      data: lines.slice(start, start + limit).map((line) => ({
        expenseNumber: line.expenseNumber,
        expenseDate: line.expenseDate,
        vendorName: line.vendorName,
        vendorGstin: line.vendorGstin,
        hsnSacCode: line.hsnSacCode,
        description: line.description,
        taxableValue: line.taxableValue.toFixed(2),
        ratePercent: line.ratePercent.toFixed(2),
        ...serialiseSplit(line.split),
      })),
      meta: { page, limit, total: lines.length },
    };
  }

  // -- GSTR-3B: summary and set-off ---------------------------------------

  /**
   * Summary return: output tax on outward supplies, credit on inward supplies,
   * and the tax actually payable after head-wise set-off.
   */
  async gstr3b(principal: Principal, range: GstPeriodDto) {
    const [outward, inward] = await Promise.all([
      this.outwardLines(principal, range),
      this.inwardLines(principal, range),
    ]);

    let outwardTaxable = ZERO;
    let outputTax = emptySplit();
    for (const line of outward) {
      outwardTaxable = outwardTaxable.plus(line.taxableValue);
      outputTax = addSplit(outputTax, line.split);
    }

    let inwardTaxable = ZERO;
    let credit = emptySplit();
    for (const line of inward) {
      inwardTaxable = inwardTaxable.plus(line.taxableValue);
      credit = addSplit(credit, line.split);
    }

    const payable = netPayable(outputTax, credit);
    return {
      period: { from: range.from ?? null, to: range.to ?? null },
      outwardTaxableSupplies: {
        taxableValue: outwardTaxable.toFixed(2),
        ...serialiseSplit(outputTax),
      },
      eligibleItc: {
        taxableValue: inwardTaxable.toFixed(2),
        ...serialiseSplit(credit),
      },
      netTaxPayable: serialiseSplit(payable),
    };
  }
}
