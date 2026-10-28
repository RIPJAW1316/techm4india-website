export type LeadType =
  | 'B2C_STUDENT'
  | 'B2B_SCHOOL'
  | 'B2B_COLLEGE'
  | 'B2B_UNIVERSITY'
  | 'GOVERNMENT'
  | 'CORPORATE_CSR'
  | 'INTERNATIONAL'
  | 'PARTNER_FRANCHISE';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'MEETING_SCHEDULED'
  | 'DEMO_GIVEN'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'DORMANT';

export type DealStage =
  | 'QUALIFICATION'
  | 'NEEDS_ANALYSIS'
  | 'PROPOSAL_QUOTATION'
  | 'NEGOTIATION_REVIEW'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type DivisionCode =
  | 'ALL'
  | 'TECHM4_SCHOOLS'
  | 'TECHM4_ENGINEERING'
  | 'TECHM4_SOLUTIONS'
  | 'TECHM4_SPACE'
  | 'HORIZON_INSTITUTES';

export type CrmViewTab =
  | 'home'
  | 'leads'
  | 'accounts'
  | 'contacts'
  | 'deals'
  | 'activities'
  | 'meetings'
  | 'call_logs'
  | 'campaigns'
  | 'quotes'
  | 'invoices'
  | 'reports';

export interface LeadItem {
  id: string;
  leadNumber: string;
  type: LeadType;
  status: LeadStatus;
  firstName: string;
  lastName: string;
  organization: string;
  designation?: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  source: string; // Website, WhatsApp, Campus Outreach, Tender, LinkedIn
  division: DivisionCode;
  assignedTo: string;
  leadScore: number; // AI score 0-100
  estimatedValue: number;
  notes?: string;
  createdAt: string;
  isConverted?: boolean;
}

export interface AccountItem {
  id: string;
  accountNumber: string;
  name: string;
  type: LeadType;
  website?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  naacGrade?: string; // A++, A+, A, B, NA
  aisheCode?: string;
  udiseCode?: string;
  studentStrength?: number;
  relationshipScore: number; // AI Health Score 0-100
  annualRevenue?: number;
  activeMoU?: boolean;
  mouValidTill?: string;
  division: DivisionCode;
  ownerName: string;
  createdAt: string;
}

export interface ContactItem {
  id: string;
  accountId: string;
  accountName: string;
  firstName: string;
  lastName: string;
  title: string; // Principal, Dean R&D, HOD CSE, TPO, Trustee
  department?: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface DealItem {
  id: string;
  dealNumber: string;
  title: string;
  accountId: string;
  accountName: string;
  contactName: string;
  contactEmail: string;
  stage: DealStage;
  division: DivisionCode;
  amount: number;
  closingDate: string;
  probability: number; // 0 to 100%
  ownerName: string;
  notes?: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  subject: string;
  dueDate: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED';
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  relatedTo: string;
  relatedType: 'LEAD' | 'DEAL' | 'ACCOUNT';
  assignedTo: string;
}

export interface MeetingItem {
  id: string;
  title: string;
  fromTime: string;
  toTime: string;
  relatedTo: string;
  relatedType: 'LEAD' | 'DEAL' | 'ACCOUNT';
  location: string; // "Google Meet", "On Campus", "Phone"
  meetLink?: string;
  host: string;
}

export interface CallLogItem {
  id: string;
  subject: string;
  callTime: string;
  durationMinutes: number;
  contactName: string;
  organization: string;
  outcome: 'INTERESTED' | 'CALLBACK_REQUESTED' | 'DEMO_FIXED' | 'NO_ANSWER' | 'NOT_INTERESTED';
  notes: string;
}

export interface QuoteItem {
  id: string;
  quoteNumber: string;
  dealId?: string;
  dealTitle?: string;
  accountName: string;
  date: string;
  validUntil: string;
  subtotal: number;
  taxGst: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED_TO_INVOICE' | 'INVOICED';
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  hsnSacCode?: string;
  quantity: number;
  unitPrice: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerGstin?: string;
  stateCode?: string;
  placeOfSupply?: string;
  dealTitle?: string;
  quoteNumber?: string;
  type?: 'B2B' | 'B2C' | 'B2G';
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  currency?: string;
  subtotal: number;
  taxableAmount?: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxGst?: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentTerms?: string;
  division: DivisionCode;
  razorpayPaymentLink?: string;
  irn?: string;
  items?: InvoiceLineItem[];
}

export interface CampaignItem {
  id: string;
  name: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS' | 'LINKEDIN';
  targetAudience: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  sentCount: number;
  openedCount: number;
  repliedCount: number;
  leadsGenerated: number;
  startDate: string;
}
