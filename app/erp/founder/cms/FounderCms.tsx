"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { FounderModuleNavigation } from "@/app/erp/components/FounderModuleNavigation";
import { ProtectedErp } from "@/app/erp/components/ProtectedErp";
import { useErpAuth } from "@/app/erp/components/AuthProvider";
import { ApiError, apiFetchV2 } from "@/lib/api/client";
import type { ApiResponse, CmsPage } from "@/lib/api/types";

type ApiList<T> = { success: true; data: T[]; meta?: { total: number } };

const pretty = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const emptyPage = { slug: "", title: "", type: "ARTICLE", summary: "", body: "" };

function FounderCmsContent() {
  const { context } = useErpAuth();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [selected, setSelected] = useState<CmsPage | null>(null);
  const [pageForm, setPageForm] = useState(emptyPage);
  const [revisionForm, setRevisionForm] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canManage = Boolean(context?.permissions.includes("cms.content.manage"));
  const canPublish = Boolean(context?.permissions.includes("cms.content.publish"));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchV2<ApiList<CmsPage>>("/cms/pages?limit=100");
      setPages(response.data);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Content workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openPage(id: string) {
    setError(null);
    try {
      const response = await apiFetchV2<ApiResponse<CmsPage>>(`/cms/pages/${id}`);
      setSelected(response.data);
      setRevisionForm({ title: response.data.title, body: "" });
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Page details could not load.");
    }
  }

  async function runAction(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      await load();
      if (selected) await openPage(selected.id);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      () => apiFetchV2("/cms/pages", { method: "POST", body: JSON.stringify(pageForm) }),
      "Draft content page created.",
    );
    setPageForm(emptyPage);
  }

  async function addRevision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    await runAction(
      () =>
        apiFetchV2(`/cms/pages/${selected.id}/revisions`, {
          method: "POST",
          body: JSON.stringify(revisionForm),
        }),
      "New revision saved.",
    );
    setRevisionForm((current) => ({ ...current, body: "" }));
  }

  return (
    <main className="erp-main">
      <div className="erp-content">
        <FounderModuleNavigation active="cms" />

        <section className="erp-welcome">
          <div>
            <p className="erp-kicker">Content · review controlled</p>
            <h1>
              Content <em>studio</em>
            </h1>
            <p>
              Author pages, articles and announcements with versioned revisions and a
              draft → review → publish workflow, so only approved content goes live.
            </p>
          </div>
          <div className="erp-welcome-code">
            <span>Published</span>
            <strong>{pages.filter((item) => item.status === "PUBLISHED").length}</strong>
          </div>
        </section>

        {error ? <div className="erp-error" role="alert">{error}</div> : null}
        {notice ? <div className="erp-success" role="status">{notice}</div> : null}

        {canManage ? (
          <section className="erp-section">
            <div className="erp-section-heading"><div><p className="erp-kicker">New content</p><h2>Create page</h2></div></div>
            <form className="founder-form" onSubmit={(event) => void createPage(event)}>
              <div className="founder-form-grid">
                <label><span>Slug</span><input required value={pageForm.slug} onChange={(event) => setPageForm({ ...pageForm, slug: event.target.value })} /></label>
                <label><span>Type</span><select value={pageForm.type} onChange={(event) => setPageForm({ ...pageForm, type: event.target.value })}>{["PAGE", "ARTICLE", "ANNOUNCEMENT", "FAQ"].map((item) => <option key={item} value={item}>{pretty(item)}</option>)}</select></label>
                <label className="founder-form-wide"><span>Title</span><input required value={pageForm.title} onChange={(event) => setPageForm({ ...pageForm, title: event.target.value })} /></label>
                <label className="founder-form-wide"><span>Summary</span><input value={pageForm.summary} onChange={(event) => setPageForm({ ...pageForm, summary: event.target.value })} /></label>
                <label className="founder-form-wide"><span>Body</span><textarea required minLength={2} value={pageForm.body} onChange={(event) => setPageForm({ ...pageForm, body: event.target.value })} /></label>
              </div>
              <button className="erp-button erp-button-primary" disabled={busy}>Create page ↗</button>
            </form>
          </section>
        ) : null}

        {loading ? (
          <div className="erp-state" role="status"><span className="erp-loader" aria-hidden="true" /><p>Loading content</p></div>
        ) : null}

        {!loading ? (
          <section className="erp-section">
            <div className="erp-section-heading"><div><p className="erp-kicker">Library</p><h2>Content pages</h2></div></div>
            {pages.length === 0 ? <div className="erp-empty"><strong>No content yet.</strong><span>Create a page to begin the publishing workflow.</span></div> : (
              <div className="erp-notification-list">
                {pages.map((item) => (
                  <article className="erp-notification" key={item.id}>
                    <div><span className="founder-org-code">{item.slug}</span><h3>{item.title}</h3><p>{pretty(item.type)} · {item._count?.revisions ?? 0} revision{(item._count?.revisions ?? 0) === 1 ? "" : "s"}</p></div>
                    <div className="founder-org-row-actions">
                      <strong className="founder-status">{pretty(item.status)}</strong>
                      <button type="button" className="erp-text-button" onClick={() => void openPage(item.id)}>Open</button>
                      {canManage && item.status === "DRAFT" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/cms/pages/${item.id}/submit`, { method: "POST" }), "Submitted for review.")}>Submit for review</button> : null}
                      {canPublish && item.status === "IN_REVIEW" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/cms/pages/${item.id}/publish`, { method: "POST" }), "Content published.")}>Publish</button> : null}
                      {canPublish && item.status === "PUBLISHED" ? <button type="button" className="erp-text-button" disabled={busy} onClick={() => void runAction(() => apiFetchV2(`/cms/pages/${item.id}/archive`, { method: "POST" }), "Content archived.")}>Archive</button> : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {selected ? (
          <section className="erp-section">
            <div className="erp-section-heading"><div><p className="erp-kicker">{pretty(selected.status)} · {pretty(selected.type)}</p><h2>{selected.title}</h2><p>{selected.slug}</p></div></div>
            <div className="erp-notification-list">
              {(selected.revisions ?? []).map((item) => (
                <article className="erp-notification" key={item.id}>
                  <div><span className="founder-org-code">v{item.version}</span><h3>{item.title}</h3><p>{item.summary ?? item.body.slice(0, 120)}</p></div>
                  {selected.publishedRevisionId === item.id ? <strong className="founder-status">Live</strong> : null}
                </article>
              ))}
            </div>
            {canManage && (selected.status === "DRAFT" || selected.status === "IN_REVIEW") ? (
              <form className="founder-form" onSubmit={(event) => void addRevision(event)}>
                <div className="founder-form-grid">
                  <label className="founder-form-wide"><span>Revision title</span><input required value={revisionForm.title} onChange={(event) => setRevisionForm({ ...revisionForm, title: event.target.value })} /></label>
                  <label className="founder-form-wide"><span>Revision body</span><textarea required value={revisionForm.body} onChange={(event) => setRevisionForm({ ...revisionForm, body: event.target.value })} /></label>
                </div>
                <button className="erp-button erp-button-primary" disabled={busy}>Add revision ↗</button>
              </form>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

export function FounderCms() {
  return (
    <ProtectedErp requiredCms>
      <FounderCmsContent />
    </ProtectedErp>
  );
}
