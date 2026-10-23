"use client";

/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */

import { useMemo, useState, useSyncExternalStore } from "react";
import type { Activity } from "@/lib/content/home";
import { SmartLink } from "../Primitives";

type Bucket = "upcoming" | "ongoing" | "past";
type Filter = "all" | Bucket;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ongoing", label: "Open now" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

const BUCKET_LABEL: Record<Bucket, string> = {
  upcoming: "Upcoming",
  ongoing: "Open now",
  past: "Past",
};

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// The visitor's local date. The server render uses the build date, then the
// client snapshot takes over, so dated events re-bucket without an effect.
const noSubscribe = () => () => {};
function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function bucketOf(activity: Activity, today: string): Bucket {
  if (!activity.date) return activity.undated ?? "ongoing";
  const end = activity.endDate ?? activity.date;
  if (end < today) return "past";
  if (activity.date > today) return "upcoming";
  return "ongoing";
}

function whenLabel(activity: Activity) {
  if (!activity.date) return activity.when;
  const start = dateFormat.format(new Date(activity.date + "T00:00:00Z"));
  if (!activity.endDate || activity.endDate === activity.date) return start;
  return start + " to " + dateFormat.format(new Date(activity.endDate + "T00:00:00Z"));
}

/**
 * Events and activities. Dated entries are bucketed against the visitor's
 * current date on the client, so the static export cannot go stale; undated
 * entries carry an explicit status and are never shown as upcoming.
 */
export function ActivityBoard({ activities, buildDate }: { activities: Activity[]; buildDate: string }) {
  const today = useSyncExternalStore(noSubscribe, localToday, () => buildDate);
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(
    () => activities.map((activity) => ({ activity, bucket: bucketOf(activity, today) })),
    [activities, today],
  );
  const counts = useMemo(() => {
    const tally: Record<Filter, number> = { all: rows.length, upcoming: 0, ongoing: 0, past: 0 };
    rows.forEach((row) => (tally[row.bucket] += 1));
    return tally;
  }, [rows]);
  const visible = filter === "all" ? rows : rows.filter((row) => row.bucket === filter);

  return (
    <div className="xh-board">
      <div className="xh-board-filters" role="group" aria-label="Filter events and activities">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            <span aria-hidden="true">{String(counts[item.id]).padStart(2, "0")}</span>
            <span className="sr-only">, {counts[item.id]} listed</span>
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {visible.length === 0 ? (
          <div className="xh-board-empty">
            <p className="xp-subtitle">
              {filter === "upcoming"
                ? "The next dates are being set with partner campuses."
                : "Nothing is listed here yet."}
            </p>
            <p className="xp-body">
              Dates appear on this board as soon as they are confirmed. Bootcamps and sessions
              are also scheduled on request: tell us your campus and the dates that suit you.
            </p>
            <SmartLink className="xp-link" href="/institutes#bootcamps">
              <span>Host a bootcamp at your campus</span>
              <i aria-hidden="true">↗</i>
            </SmartLink>
          </div>
        ) : (
          <ol className="xh-board-list">
            {visible.map(({ activity, bucket }) => (
              <li key={activity.id} className={"xh-board-row is-" + bucket} data-home-reveal>
                <div className="xh-board-when">
                  <span className={"xp-tag xp-tag--dot is-" + bucket}>{BUCKET_LABEL[bucket]}</span>
                  <span className="xp-meta">{whenLabel(activity)}</span>
                </div>
                <div className="xh-board-what">
                  <p className="xp-meta">
                    {activity.kind}
                    {activity.place ? " · " + activity.place : ""}
                  </p>
                  <h3 className="xp-subtitle">{activity.title}</h3>
                  <p className="xp-body">{activity.summary}</p>
                  {activity.facts && (
                    <ul className="xh-board-facts" aria-label={"Key facts: " + activity.title}>
                      {activity.facts.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>
                  )}
                  <SmartLink className="xp-link" href={activity.href}>
                    <span>{activity.cta}</span>
                    <i aria-hidden="true">↗</i>
                  </SmartLink>
                </div>
                <div className="xh-board-image">
                  <img
                    src={activity.image}
                    alt={activity.imageAlt}
                    loading="lazy"
                    decoding="async"
                    style={activity.imagePosition ? { objectPosition: activity.imagePosition } : undefined}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
