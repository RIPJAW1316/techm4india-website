-- CreateEnum
CREATE TYPE "FinancePartyType" AS ENUM ('CUSTOMER', 'VENDOR', 'BOTH');

-- CreateEnum
CREATE TYPE "FinanceTaxType" AS ENUM ('GST', 'CGST', 'SGST', 'IGST', 'CESS', 'OTHER');

-- CreateEnum
CREATE TYPE "FinanceInvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinancePaymentDirection" AS ENUM ('RECEIVED', 'PAID');

-- CreateEnum
CREATE TYPE "FinancePaymentMethod" AS ENUM ('BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "FinancePaymentStatus" AS ENUM ('RECORDED', 'VOIDED');

-- CreateEnum
CREATE TYPE "FinanceExpenseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FinanceExpensePaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID');

-- CreateEnum
CREATE TYPE "LedgerAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "JournalStatus" AS ENUM ('DRAFT', 'POSTED', 'VOIDED');

-- CreateTable
CREATE TABLE "FinanceParty" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" "FinancePartyType" NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "billingAddressLine1" TEXT,
    "billingAddressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "crmAccountId" UUID,
    "institutionId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceTaxRate" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(7,4) NOT NULL,
    "taxType" "FinanceTaxType" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" DATE,
    "effectiveTo" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceTaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceInvoice" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "partyId" UUID NOT NULL,
    "invoiceDate" DATE NOT NULL,
    "dueDate" DATE,
    "status" "FinanceInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "roundingAdjustment" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "terms" TEXT,
    "placeOfSupply" TEXT,
    "partyNameSnapshot" TEXT,
    "partyAddressSnapshot" TEXT,
    "partyGstinSnapshot" TEXT,
    "createdByUserId" UUID NOT NULL,
    "finalizedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceInvoiceLine" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "discountAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hsnSacCode" TEXT,
    "taxRateId" UUID,
    "taxableValue" DECIMAL(14,2) NOT NULL,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(14,2) NOT NULL,
    "taxCodeSnapshot" TEXT,
    "taxNameSnapshot" TEXT,
    "taxRateSnapshot" DECIMAL(7,4),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceInvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceExpense" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "expenseNumber" TEXT NOT NULL,
    "vendorPartyId" UUID,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "expenseDate" DATE NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "FinanceExpenseStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "FinanceExpensePaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "reference" TEXT,
    "createdByUserId" UUID NOT NULL,
    "approvedByUserId" UUID,
    "approvedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceExpenseLine" (
    "id" UUID NOT NULL,
    "expenseId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "taxRateId" UUID,
    "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hsnSacCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceExpenseLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancePayment" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "direction" "FinancePaymentDirection" NOT NULL,
    "partyId" UUID,
    "invoiceId" UUID,
    "expenseId" UUID,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "method" "FinancePaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "reference" TEXT,
    "paymentDate" DATE NOT NULL,
    "notes" TEXT,
    "status" "FinancePaymentStatus" NOT NULL DEFAULT 'RECORDED',
    "voidReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerAccount" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LedgerAccountType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "entryDate" DATE NOT NULL,
    "referenceType" TEXT,
    "referenceId" UUID,
    "description" TEXT NOT NULL,
    "status" "JournalStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" UUID NOT NULL,
    "postedAt" TIMESTAMP(3),
    "voidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalLine" (
    "id" UUID NOT NULL,
    "journalEntryId" UUID NOT NULL,
    "ledgerAccountId" UUID NOT NULL,
    "debit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinanceParty_organizationId_type_isActive_idx" ON "FinanceParty"("organizationId", "type", "isActive");

-- CreateIndex
CREATE INDEX "FinanceParty_organizationId_archivedAt_idx" ON "FinanceParty"("organizationId", "archivedAt");

-- CreateIndex
CREATE INDEX "FinanceParty_organizationId_crmAccountId_idx" ON "FinanceParty"("organizationId", "crmAccountId");

-- CreateIndex
CREATE INDEX "FinanceParty_organizationId_institutionId_idx" ON "FinanceParty"("organizationId", "institutionId");

-- CreateIndex
CREATE INDEX "FinanceTaxRate_organizationId_taxType_isActive_idx" ON "FinanceTaxRate"("organizationId", "taxType", "isActive");

-- CreateIndex
CREATE INDEX "FinanceTaxRate_organizationId_effectiveFrom_effectiveTo_idx" ON "FinanceTaxRate"("organizationId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceTaxRate_organizationId_code_key" ON "FinanceTaxRate"("organizationId", "code");

-- CreateIndex
CREATE INDEX "FinanceInvoice_organizationId_status_invoiceDate_idx" ON "FinanceInvoice"("organizationId", "status", "invoiceDate");

-- CreateIndex
CREATE INDEX "FinanceInvoice_organizationId_dueDate_idx" ON "FinanceInvoice"("organizationId", "dueDate");

-- CreateIndex
CREATE INDEX "FinanceInvoice_organizationId_partyId_idx" ON "FinanceInvoice"("organizationId", "partyId");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceInvoice_organizationId_invoiceNumber_key" ON "FinanceInvoice"("organizationId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "FinanceInvoiceLine_invoiceId_idx" ON "FinanceInvoiceLine"("invoiceId");

-- CreateIndex
CREATE INDEX "FinanceInvoiceLine_taxRateId_idx" ON "FinanceInvoiceLine"("taxRateId");

-- CreateIndex
CREATE INDEX "FinanceExpense_organizationId_status_expenseDate_idx" ON "FinanceExpense"("organizationId", "status", "expenseDate");

-- CreateIndex
CREATE INDEX "FinanceExpense_organizationId_vendorPartyId_idx" ON "FinanceExpense"("organizationId", "vendorPartyId");

-- CreateIndex
CREATE INDEX "FinanceExpense_organizationId_paymentStatus_idx" ON "FinanceExpense"("organizationId", "paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "FinanceExpense_organizationId_expenseNumber_key" ON "FinanceExpense"("organizationId", "expenseNumber");

-- CreateIndex
CREATE INDEX "FinanceExpenseLine_expenseId_idx" ON "FinanceExpenseLine"("expenseId");

-- CreateIndex
CREATE INDEX "FinanceExpenseLine_taxRateId_idx" ON "FinanceExpenseLine"("taxRateId");

-- CreateIndex
CREATE INDEX "FinancePayment_organizationId_direction_paymentDate_idx" ON "FinancePayment"("organizationId", "direction", "paymentDate");

-- CreateIndex
CREATE INDEX "FinancePayment_organizationId_status_idx" ON "FinancePayment"("organizationId", "status");

-- CreateIndex
CREATE INDEX "FinancePayment_invoiceId_idx" ON "FinancePayment"("invoiceId");

-- CreateIndex
CREATE INDEX "FinancePayment_expenseId_idx" ON "FinancePayment"("expenseId");

-- CreateIndex
CREATE INDEX "FinancePayment_partyId_idx" ON "FinancePayment"("partyId");

-- CreateIndex
CREATE INDEX "LedgerAccount_organizationId_type_isActive_idx" ON "LedgerAccount"("organizationId", "type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerAccount_organizationId_code_key" ON "LedgerAccount"("organizationId", "code");

-- CreateIndex
CREATE INDEX "JournalEntry_organizationId_entryDate_status_idx" ON "JournalEntry"("organizationId", "entryDate", "status");

-- CreateIndex
CREATE INDEX "JournalEntry_organizationId_referenceType_referenceId_idx" ON "JournalEntry"("organizationId", "referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "JournalLine_journalEntryId_idx" ON "JournalLine"("journalEntryId");

-- CreateIndex
CREATE INDEX "JournalLine_ledgerAccountId_idx" ON "JournalLine"("ledgerAccountId");

-- AddForeignKey
ALTER TABLE "FinanceParty" ADD CONSTRAINT "FinanceParty_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceParty" ADD CONSTRAINT "FinanceParty_crmAccountId_fkey" FOREIGN KEY ("crmAccountId") REFERENCES "CrmAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceParty" ADD CONSTRAINT "FinanceParty_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceTaxRate" ADD CONSTRAINT "FinanceTaxRate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceInvoice" ADD CONSTRAINT "FinanceInvoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceInvoice" ADD CONSTRAINT "FinanceInvoice_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "FinanceParty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceInvoice" ADD CONSTRAINT "FinanceInvoice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceInvoiceLine" ADD CONSTRAINT "FinanceInvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "FinanceInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceInvoiceLine" ADD CONSTRAINT "FinanceInvoiceLine_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "FinanceTaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_vendorPartyId_fkey" FOREIGN KEY ("vendorPartyId") REFERENCES "FinanceParty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpense" ADD CONSTRAINT "FinanceExpense_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpenseLine" ADD CONSTRAINT "FinanceExpenseLine_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "FinanceExpense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceExpenseLine" ADD CONSTRAINT "FinanceExpenseLine_taxRateId_fkey" FOREIGN KEY ("taxRateId") REFERENCES "FinanceTaxRate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancePayment" ADD CONSTRAINT "FinancePayment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancePayment" ADD CONSTRAINT "FinancePayment_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "FinanceParty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancePayment" ADD CONSTRAINT "FinancePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "FinanceInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancePayment" ADD CONSTRAINT "FinancePayment_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "FinanceExpense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancePayment" ADD CONSTRAINT "FinancePayment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerAccount" ADD CONSTRAINT "LedgerAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_ledgerAccountId_fkey" FOREIGN KEY ("ledgerAccountId") REFERENCES "LedgerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
