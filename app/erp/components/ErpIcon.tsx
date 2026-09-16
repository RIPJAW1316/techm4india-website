import type { ErpModuleId } from "@/lib/erp/modules";

/**
 * Stroke icons for the workspace sidebar.
 *
 * These are drawn as SVG paths rather than emoji on purpose: emoji render as
 * colour glyphs on Windows and as text elsewhere, which is what made the old
 * navigation look inconsistent between machines.
 */
const PATHS: Record<ErpModuleId, string[]> = {
  dashboard: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M14 14h7v7h-7z", "M3 14h7v7H3z"],
  work: ["M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", "M9 11.5l2.5 2.5L21 4.5"],
  analytics: ["M6 20v-5", "M12 20V8", "M18 20V4", "M3 20h18"],
  employees: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  recruitment: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M19 8v6",
    "M22 11h-6",
  ],
  attendance: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6.5V12l3.5 2"],
  leave: [
    "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z",
    "M16 2v4",
    "M8 2v4",
    "M3 10h18",
  ],
  payroll: ["M3 6a2 2 0 0 1 2-2h14v4", "M3 6v12a2 2 0 0 0 2 2h16v-6", "M21 10h-4a2 2 0 0 0 0 4h4z"],
  performance: ["M22 6l-8.5 8.5-4-4L2 18", "M16 6h6v6"],
  finance: [
    "M5 2v20l2.5-1.5L10 22l2.5-1.5L15 22l2.5-1.5L20 22V2l-2.5 1.5L15 2l-2.5 1.5L10 2 7.5 3.5z",
    "M9 7h7",
    "M9 11h7",
    "M9 15h4",
  ],
  crm: [
    "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z",
    "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  ],
  institutions: [
    "M3 21h18",
    "M5 21V7.5L12 3l7 4.5V21",
    "M9.5 10h1",
    "M13.5 10h1",
    "M9.5 14h1",
    "M13.5 14h1",
    "M10 21v-3.5h4V21",
  ],
  delivery: ["M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z", "M4 22v-7"],
  programs: [
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20",
    "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  ],
  "supply-chain": [
    "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
    "M3.3 7L12 12l8.7-5",
    "M12 22V12",
  ],
  support: [
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
    "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    "M4.9 4.9l4.3 4.3",
    "M14.8 14.8l4.3 4.3",
    "M14.8 9.2l4.3-4.3",
    "M4.9 19.1l4.3-4.3",
  ],
  cms: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M9 13h6",
    "M9 17h6",
  ],
  compliance: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4.5-4.5"],
  organization: ["M10 3h4v4h-4z", "M4 17h4v4H4z", "M16 17h4v4h-4z", "M12 7v4", "M6 17v-3h12v3"],
  users: [
    "M12.5 11.5a4.5 4.5 0 1 1-6.4 6.3 4.5 4.5 0 0 1 6.4-6.3z",
    "M12.5 11.5L19 5",
    "M16.5 8l2.5 2.5L22 7.5 19.5 5",
  ],
};

export function ErpIcon({ module }: { module: ErpModuleId }) {
  return (
    <svg
      aria-hidden="true"
      className="erp-icon"
      fill="none"
      focusable="false"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      {PATHS[module].map((d) => (
        <path d={d} key={d} stroke="currentColor" />
      ))}
    </svg>
  );
}
