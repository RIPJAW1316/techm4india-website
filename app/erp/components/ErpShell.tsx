"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useErpAuth } from "./AuthProvider";
import { ErpIcon } from "./ErpIcon";
import {
  ERP_MODULE_GROUPS,
  erpModule,
  visibleModuleGroups,
  type ErpModuleId,
} from "@/lib/erp/modules";

/**
 * The workspace chrome shared by every ERP page: identity rail on the left,
 * context bar across the top.
 *
 * Both are rendered as fixed-position landmarks, so a page mounts the shell
 * once and lays its own content out inside `.erp-main` without having to
 * reproduce the navigation. Before this existed five pages carried a
 * hand-copied sidebar and fifteen carried a scrolling pill bar, which is why
 * the workspace looked half-built as you moved between modules.
 */
export function ErpShell({ active }: { active: ErpModuleId }) {
  const router = useRouter();
  const { context, logout } = useErpAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const current = erpModule(active);
  const permissions = context?.permissions ?? [];

  const groups = useMemo(() => {
    const visible = visibleModuleGroups(permissions);
    const needle = query.trim().toLowerCase();
    if (!needle) return visible;
    return visible
      .map((group) => ({
        ...group,
        modules: group.modules.filter((module) => module.label.toLowerCase().includes(needle)),
      }))
      .filter((group) => group.modules.length > 0);
  }, [permissions, query]);

  const employee = context?.employee ?? null;
  const displayName = employee ? `${employee.firstName} ${employee.lastName}` : "Signed in";
  const initials = employee
    ? `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`.toUpperCase()
    : "TM";
  const groupLabel =
    ERP_MODULE_GROUPS.find((group) => group.id === current.group)?.label ?? "Workspace";

  async function signOut() {
    await logout();
    router.replace("/login");
  }

  return (
    <>
      <a className="erp-skip-link" href="#erp-page-top">
        Skip to content
      </a>

      <aside
        aria-label="Workspace navigation"
        className={`erp-rail${menuOpen ? " is-open" : ""}`}
        id="erp-workspace-nav"
      >
        <div className="erp-rail-brand">
          <span aria-hidden="true" className="erp-rail-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="erp-rail-wordmark">
            TECHM4<b>INDIA</b>
          </span>
        </div>

        <div className="erp-rail-identity">
          <span>{employee?.designation ?? "Workspace"}</span>
          <strong>{displayName}</strong>
          <small>{context?.user.roles.join(" · ") || "No role assigned"}</small>
        </div>

        <div className="erp-rail-search">
          <label className="erp-visually-hidden" htmlFor="erp-module-filter">
            Filter modules
          </label>
          <input
            autoComplete="off"
            id="erp-module-filter"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter modules"
            type="search"
            value={query}
          />
        </div>

        <nav className="erp-rail-nav">
          {groups.map((group) => (
            <div className="erp-rail-group" key={group.id}>
              <p className="erp-rail-group-label">{group.label}</p>
              {group.modules.map((module) => (
                <a
                  aria-current={module.id === active ? "page" : undefined}
                  className={module.id === active ? "is-active" : undefined}
                  href={module.href}
                  key={module.id}
                  onClick={() => setMenuOpen(false)}
                >
                  <ErpIcon module={module.id} />
                  <span>{module.label}</span>
                </a>
              ))}
            </div>
          ))}
          {groups.length === 0 ? (
            <p className="erp-rail-empty">No modules match “{query}”.</p>
          ) : null}
        </nav>

        <button className="erp-rail-signout" onClick={() => void signOut()} type="button">
          Sign out
        </button>
      </aside>

      <header className="erp-topbar-shell">
        <button
          aria-controls="erp-workspace-nav"
          aria-expanded={menuOpen}
          className="erp-topbar-menu"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" />
          {menuOpen ? "Close" : "Menu"}
        </button>

        <nav aria-label="Breadcrumb" className="erp-breadcrumb">
          <ol>
            <li>TechM4India Innovations Pvt. Ltd.</li>
            <li>{groupLabel}</li>
            <li aria-current="page">{current.title}</li>
          </ol>
        </nav>

        <div className="erp-topbar-user">
          <span aria-hidden="true" className="erp-avatar">
            {initials}
          </span>
          <span className="erp-topbar-user-text">
            <strong>{displayName}</strong>
            <small>{context?.user.email}</small>
          </span>
        </div>
      </header>

      {menuOpen ? (
        <button
          aria-label="Close navigation"
          className="erp-rail-scrim"
          onClick={() => setMenuOpen(false)}
          type="button"
        />
      ) : null}
    </>
  );
}
