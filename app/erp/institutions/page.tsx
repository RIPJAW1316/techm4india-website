"use client";

import { useState } from "react";
import { Building2, Calendar, ChevronRight, GraduationCap, MapPin, Users } from "lucide-react";
import { ErpShell } from "../components/erp-shell";
import {
  Avatar,
  EmptyState,
  formatDate,
  PageHeader,
  Panel,
  SearchField,
  StatusBadge,
} from "../components/erp-ui";
import { useInstitutionsData } from "@/lib/erp/replit-store";

export default function Institutions() {
  const [search, setSearch] = useState("");
  const { institutions } = useInstitutionsData({ search: search || undefined });

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
                    className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md"
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
      </div>
    </ErpShell>
  );
}
