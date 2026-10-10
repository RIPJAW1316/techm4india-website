"use client";

import { useState } from "react";
import type { Update, UpdateKind } from "@/lib/content/home";
import { SmartLink } from "../Primitives";

type Filter = { id: string; label: string; kinds: UpdateKind[] | null };

const FILTERS: Filter[] = [
  { id: "all", label: "All updates", kinds: null },
  { id: "internships", label: "Internships", kinds: ["Internship", "Fellowship"] },
  { id: "placements", label: "Placements", kinds: ["Placement"] },
  { id: "careers", label: "Roles and programmes", kinds: ["Role", "Programme"] },
  { id: "announcements", label: "Announcements", kinds: ["Announcement"] },
];

/** How many updates show before "Show all". */
const PREVIEW = 5;

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatDate = (iso: string) => dateFormat.format(new Date(iso + "T00:00:00Z"));

/** Newest first; undated entries keep their listed order after dated ones. */
function sortUpdates(updates: Update[]) {
  return updates
    .map((update, index) => ({ update, index }))
    .sort((a, b) => {
      const ad = a.update.postedOn ?? "";
      const bd = b.update.postedOn ?? "";
      if (ad !== bd) return bd.localeCompare(ad);
      return a.index - b.index;
    })
    .map((row) => row.update);
}

/**
 * Internship and placement updates. Entries come from lib/content/home.ts;
 * posting a new one there is the whole publishing step.
 */
export function UpdatesFeed({ updates, reviewedOn }: { updates: Update[]; reviewedOn: string }) {
  const [filter, setFilter] = useState(FILTERS[0]);
  const [expanded, setExpanded] = useState(false);
  const sorted = sortUpdates(updates);
  const count = (item: Filter) =>
    item.kinds ? sorted.filter((update) => item.kinds!.includes(update.kind)).length : sorted.length;
  const matching = filter.kinds ? sorted.filter((update) => filter.kinds!.includes(update.kind)) : sorted;
  const visible = expanded ? matching : matching.slice(0, PREVIEW);
  const hiddenCount = matching.length - visible.length;

  return (
    <div className="xh-feed">
      <div className="xh-feed-bar">
        <p className="xh-feed-live">
          <span aria-hidden="true" />
          Last reviewed {formatDate(reviewedOn)}
        </p>
        <div className="xh-feed-filters" role="group" aria-label="Filter updates">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter.id === item.id}
              onClick={() => {
                setFilter(item);
                setExpanded(false);
              }}
            >
              {item.label}
              <span aria-hidden="true">{String(count(item)).padStart(2, "0")}</span>
              <span className="sr-only">, {count(item)} listed</span>
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite">
        {visible.length === 0 ? (
          <div className="xh-feed-empty">
            <p className="xp-subtitle">
              {filter.id === "placements"
                ? "No placement announcements yet."
                : "Nothing is listed here right now."}
            </p>
            <p className="xp-body">
              {filter.id === "placements"
                ? "Placements are announced here once they are confirmed with the students and employers involved."
                : "New updates are posted here as they open."}
            </p>
          </div>
        ) : (
          <ol className="xh-feed-list">
            {visible.map((update) => (
              <li key={update.id} className={"xh-feed-item is-" + update.kind.toLowerCase()}>
                <div className="xh-feed-when">
                  <span className="xp-tag xp-tag--solid">{update.kind}</span>
                  <span className="xp-meta">{update.postedOn ? formatDate(update.postedOn) : "Open listing"}</span>
                </div>
                <div className="xh-feed-what">
                  <p className="xp-meta">{update.division}</p>
                  <h3 className="xp-subtitle">{update.title}</h3>
                  <p className="xh-feed-meta">{update.meta.join(" · ")}</p>
                  <p className="xp-body">{update.summary}</p>
                  {update.skills && (
                    <p className="xh-feed-skills">
                      <span className="sr-only">Skills: </span>
                      {update.skills.join(" · ")}
                    </p>
                  )}
                </div>
                <SmartLink
                  className="xp-link xh-feed-cta"
                  href={update.href}
                  aria-label={update.cta + ": " + update.title}
                >
                  <span>{update.cta}</span>
                  <i aria-hidden="true">↗</i>
                </SmartLink>
              </li>
            ))}
          </ol>
        )}
        {hiddenCount > 0 && (
          <button type="button" className="xh-feed-more" onClick={() => setExpanded(true)}>
            Show all {matching.length} updates
            <span aria-hidden="true">+{hiddenCount}</span>
          </button>
        )}
      </div>
    </div>
  );
}
