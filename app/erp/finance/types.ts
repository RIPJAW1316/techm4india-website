export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export type DivisionCode =
  | 'ALL'
  | 'TECHM4_SCHOOLS'
  | 'TECHM4_ENGINEERING'
  | 'TECHM4_SOLUTIONS'
  | 'TECHM4_SPACE'
  | 'HORIZON_INSTITUTES'
  | 'GENERAL_OVERHEAD';

export type VoucherType =
  | 'JOURNAL'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'CONTRA'
  | 'SALES_INVOICE'
  | 'PURCHASE_BILL';

export type JournalStatus = 'DRAFT' | 'POSTED' | 'REVERSED';

export type InvoiceType = 'B2B' | 'B2C' | 'B2G';

export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PAID' | 'REJECTED';

export type TdsSection =
  | 'NONE'
  | 'SEC_194C'
  | 'SEC_194J_TECH'
  | 'SEC_194J_PROF'
  | 'SEC_194H';

export interface AccountItem {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: string;
  subCategory?: string;
  currency: string;
  balance: number;
  isActive: boolean;
  description?: string;
}

export interface JournalLineItem {
  id?: string;
  accountId: string;
  accountName?: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  division?: DivisionCode;
}

export interface JournalEntryItem {
  id: string;
  entryNumber: string;
  date: string;
  voucherType: VoucherType;
  reference?: string;
  narration: string;
  status: JournalStatus;
  division: DivisionCode;
  totalDebit: number;
  totalCredit: number;
  isReversed?: boolean;
  lineItems: JournalLineItem[];
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  hsnSacCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  stateCode: string;
  placeOfSupply: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms: string;
  division: DivisionCode;
  irn?: string;
  razorpayPaymentLink?: string;
  items: InvoiceLineItem[];
}

export interface VendorItem {
  id: string;
  code: string;
  name: string;
  contactPerson?: string;
  gstin?: string;
  pan?: string;
  msmeType: string;
  email?: string;
  phone?: string;
  bankAccount?: string;
  ifsc?: string;
  bankName?: string;
  tdsSection: TdsSection;
  paymentTermsDays: number;
}

export interface ExpenseItem {
  id: string;
  expenseNumber: string;
  vendorId?: string;
  vendorName: string;
  category: string;
  division: DivisionCode;
  description: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate: string;
  grossAmount: number;
  tdsSection: TdsSection;
  tdsRate: number;
  tdsAmount: number;
  netPayable: number;
  status: ExpenseStatus;
  approvalLevel: number;
  poNumber?: string;
}
