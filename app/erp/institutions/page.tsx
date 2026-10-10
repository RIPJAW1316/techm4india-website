"use client";

import { useState } from "react";
import { Building2, Calendar, GraduationCap, MapPin, Users } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import {
  Avatar,
  EmptyState,
  formatDate,
  PageHeader,
  Panel,
  SearchField,
  SlideOverDrawer,
  StatusBadge,
  ToastMessage,
} from "../components/erp-ui";
import { useInstitutionsData } from "@/lib/erp/replit-store";
import type { Institution } from "@/lib/erp/replit-data";

export default function Institutions() {
  const [search, setSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [toast, setToast] = useState("");
  const { institutions } = useInstitutionsData({ search: search || undefined });

  const totalLearners = institutions.reduce((acc, i) => acc + (i.learners || 0), 0);
  const avgHealth = institutions.length > 0
    ? Math.round(institutions.reduce((acc, i) => acc + (i.health || 0), 0) / institutions.length)
    : 0;

  return (
    <ErpShell>
      <div className="page-enter">
        <PageHeader
          eyebrow="Partner Ecosystem"
          title="Institutional Partners"
          description="Enterprise monitoring of university and collegiate relationships, program penetration, and renewal timelines."
          action={
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-xs sm:flex">
              <Building2 className="h-4 w-4 text-teal-600" />
              <span className="font-mono-ui text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                {institutions.length} partner institutions
              </span>
            </div>
          }
        />

        {/* Institution Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Active Institutional Partners
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {institutions.length} Campuses
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Enrolled Student Beneficiaries
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-teal-700 font-mono-ui tabular-nums">
              {totalLearners.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Mean Portfolio Health
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 font-mono-ui">
              {avgHealth}% Operational
            </div>
          </div>
        </div>

        <Panel>
          <div className="border-b border-slate-100 bg-slate-50/40 p-4">
            <SearchField value={search} onChange={setSearch} placeholder="Search institutions, locations, or account owners" />
          </div>
          {institutions.length === 0 ? (
            <EmptyState
              title="No institutions found"
              description="Try searching by a partner name, city, or relationship owner."
            />
          ) : (
            <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
              {institutions.map((institution) => {
                const isHealthy = institution.health >= 80;
                const isWarning = institution.health >= 60 && institution.health < 80;

                return (
                  <div
                    key={institution.id}
                    data-testid={`card-institution-${institution.id}`}
                    onClick={() => setSelectedInstitution(institution)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedInstitution(institution);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-teal-600/40 hover:shadow-md cursor-pointer"
                  >
                    <div>
                      {/* Top bar with initials, name, and badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar initials={institution.initials} className="h-11 w-11 rounded-xl shadow-xs" />
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {institution.name}
                            </h3>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                              <span className="truncate">{institution.location}</span>
                              <span>·</span>
                              <span className="truncate text-slate-400">{institution.type}</span>
                            </div>
                          </div>
                        </div>
                        <StatusBadge value={institution.healthLabel} />
                      </div>

                      {/* Health Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Relationship Health
                          </span>
                          <span className="font-mono-ui text-xs font-bold text-slate-800">
                            {institution.health}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isHealthy ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${institution.health}%` }}
                          />
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                        <div>
                          <div className="flex items-center gap-1 font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <GraduationCap className="h-3 w-3 text-slate-400" />
                            Programs
                          </div>
                          <div className="mt-1 text-base font-bold text-slate-900">
                            {institution.activePrograms} <span className="text-xs font-normal text-slate-400">active</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            <Users className="h-3 w-3 text-slate-400" />
                            Learners
                          </div>
                          <div className="mt-1 text-base font-bold text-slate-900">
                            {institution.learners.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Renewal: <strong className="font-semibold text-slate-800">{formatDate(institution.renewalDate)}</strong>
                      </span>
                      <span className="font-semibold text-teal-700">{institution.owner}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <SlideOverDrawer
          isOpen={!!selectedInstitution}
          onClose={() => setSelectedInstitution(null)}
          title={selectedInstitution?.name ?? "Institution Profile"}
          subtitle={`${selectedInstitution?.type ?? ""} · ${selectedInstitution?.location ?? ""}`}
          footer={
            <div className="flex items-center justify-between">
              <span className="font-mono-ui text-xs text-slate-500">INST-00{selectedInstitution?.id}</span>
              <button
                type="button"
                onClick={() => {
                  setToast(`Relationship record for ${selectedInstitution?.name} synchronized.`);
                  setSelectedInstitution(null);
                }}
                className="rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          }
        >
          {selectedInstitution && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <Avatar initials={selectedInstitution.initials} className="h-14 w-14 text-base rounded-2xl shadow-xs" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedInstitution.name}</h3>
                  <p className="text-xs text-slate-500">{selectedInstitution.location} · {selectedInstitution.type}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge value={selectedInstitution.healthLabel} />
                    <span className="rounded bg-slate-200/70 px-2 py-0.5 font-mono-ui text-[10px] font-semibold text-slate-700">
                      Managed by {selectedInstitution.owner}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Score Overview */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Operational Health Score
                  </span>
                  <span className="font-mono-ui text-base font-bold text-slate-900">
                    {selectedInstitution.health} / 100
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedInstitution.health >= 80 ? "bg-emerald-500" : selectedInstitution.health >= 60 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${selectedInstitution.health}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Calculated based on attendance synchronisation, SLA fulfillment, and student learning outcomes.
                </div>
              </div>

              {/* Programs and Learners Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Programs</span>
                  <div className="mt-1 text-lg font-bold text-slate-900">{selectedInstitution.activePrograms} Curricula</div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Active Learners</span>
                  <div className="mt-1 font-mono-ui text-lg font-bold text-teal-700 tabular-nums">
                    {selectedInstitution.learners.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">Renewal Horizon</span>
                  <div className="mt-1 font-mono-ui text-sm font-semibold text-slate-900">
                    {formatDate(selectedInstitution.renewalDate)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
                  <span className="font-mono-ui text-[10px] font-semibold uppercase tracking-wider text-slate-400">MoU Status</span>
                  <div className="mt-1 text-sm font-semibold text-emerald-600">Enterprise Active</div>
                </div>
              </div>

              {/* Engagement Controls */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono-ui mb-3">
                  Partner Governance Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setToast(`Governance audit scheduled with ${selectedInstitution.name}.`);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    Schedule Audit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setToast(`Contract renewal packet prepared for ${selectedInstitution.owner}.`);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100/70 transition-colors shadow-xs"
                  >
                    Prepare Renewal
                  </button>
                </div>
              </div>
            </div>
          )}
        </SlideOverDrawer>
        {toast && <ToastMessage message={toast} onDismiss={() => setToast("")} />}
      </div>
    </ErpShell>
  );
}
