"use client";

import { useState } from "react";
import { Building2, ChevronRight } from "lucide-react";
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
          eyebrow="Partner network"
          title="Institutions"
          description="See relationship health, program footprint, and the next renewal in one pass."
          action={
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="font-mono-ui text-[11px] uppercase tracking-wider text-muted-foreground">
                {institutions.length} partners
              </span>
            </div>
          }
        />
        <Panel>
          <div className="border-b border-border p-4">
            <SearchField value={search} onChange={setSearch} placeholder="Search institutions, locations, or owners" />
          </div>
          {institutions.length === 0 ? (
            <EmptyState
              title="No institutions found"
              description="Try searching by a partner name, city, or relationship owner."
            />
          ) : (
            <div className="grid gap-px bg-border/60 md:grid-cols-2 lg:grid-cols-3">
              {institutions.map((institution) => (
                <div
                  key={institution.id}
                  data-testid={`card-institution-${institution.id}`}
                  className="group bg-card p-5 hover:bg-background/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar initials={institution.initials} className="h-10 w-10 rounded-xl" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold text-foreground">{institution.name}</h3>
                          <StatusBadge value={institution.healthLabel} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {institution.type} · {institution.location}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="mt-5 grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-background/55 py-3">
                    <div className="px-3">
                      <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                        Health
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-bold">{institution.health}</span>
                        <span className="text-[11px] font-medium text-muted-foreground">/100</span>
                      </div>
                    </div>
                    <div className="px-3">
                      <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                        Programs
                      </div>
                      <div className="mt-1 text-lg font-bold">{institution.activePrograms}</div>
                    </div>
                    <div className="px-3">
                      <div className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                        Learners
                      </div>
                      <div className="mt-1 text-lg font-bold">{institution.learners.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Renewal <strong className="font-medium text-foreground">{formatDate(institution.renewalDate)}</strong>
                    </span>
                    <span className="font-medium text-primary">{institution.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </ErpShell>
  );
}
