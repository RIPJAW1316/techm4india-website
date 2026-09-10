import type { Metadata } from "next";
import { FounderPayroll } from "./FounderPayroll";

export const metadata: Metadata = { title: "Founder Payroll | TechM4India ERP", description: "Configurable payroll operations and finalized payslip control for TechM4India." };
export default function FounderPayrollPage() { return <FounderPayroll />; }
