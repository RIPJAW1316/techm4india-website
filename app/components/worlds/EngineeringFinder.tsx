"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FolderKanban,
  GraduationCap,
  Layers,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { glance, programmeCounts, trackById, tracks, type TrackId } from "@/lib/content/engineering";
import { programmes, type Programme } from "@/lib/content/engineering-programmes";
import { bindDialogDismiss, closeDialog } from "./en-dialog";

/** Programmes shown before "Show all", two rows on desktop. */
const PREVIEW = 6;

type TransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown };

/**
 * Apply a catalogue change inside a view transition, so cards glide to their
 * new places instead of jumping. Falls back to a plain update where view
 * transitions are unsupported or motion is reduced.
 */
function withTransition(update: () => void) {
  const doc = document as TransitionDocument;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  doc.startViewTransition(() => {
    flushSync(update);
  });
}

/**
 * The programme finder for the TechM4Engineering world. The hero search, the
 * discipline explorer and the footer links all speak to one catalogue through
 * a window event.
 */

const FIND_EVENT = "en:find";

type FindDetail = { track?: TrackId | "all"; duration?: string; query?: string };

/** Filter the catalogue and bring it into view. */
export function findProgrammes(detail: FindDetail) {
  window.dispatchEvent(new CustomEvent<FindDetail>(FIND_EVENT, { detail }));
  const target = document.getElementById("programmes");
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/** The "find your programme" bar under the hero. */
export function HeroFinder() {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    findProgrammes({
      track: (String(data.get("track") || "all") as TrackId | "all") || "all",
      duration: String(data.get("duration") || ""),
      query: String(data.get("query") || "").trim(),
    });
  }

  return (
    <search>
    <form className="en-finder" onSubmit={submit} aria-label="Find a programme">
      <div className="en-finder-head">
        <strong>Find your programme</strong>
        <span>
          {glance.programmes} programmes across {glance.disciplines} disciplines
        </span>
      </div>
      <label className="en-finder-field" htmlFor="en-finder-track">
        <span>Discipline</span>
        <select id="en-finder-track" name="track" defaultValue="all">
          <option value="all">All disciplines</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.name}
            </option>
          ))}
        </select>
      </label>
      <label className="en-finder-field" htmlFor="en-finder-duration">
        <span>Duration</span>
        <select id="en-finder-duration" name="duration" defaultValue="">
          <option value="">Any duration</option>
          {glance.durations.map((duration) => (
            <option key={duration} value={duration}>
              {duration.toLowerCase()}
            </option>
          ))}
        </select>
      </label>
      <label className="en-finder-field is-grow" htmlFor="en-finder-query">
        <span>Tool or topic</span>
        <input id="en-finder-query" name="query" type="search" placeholder="e.g. Revit, VLSI, AWS" autoComplete="off" />
      </label>
      <button className="en-btn" type="submit">
        <Search aria-hidden="true" />
        Find programmes
      </button>
    </form>
    </search>
  );
}

/** A button that filters the catalogue to one discipline. */
export function TrackButton({ track, className, children }: { track: TrackId; className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => findProgrammes({ track })}>
      {children}
    </button>
  );
}

function matches(programme: Programme, query: string) {
  if (!query) return true;
  const haystack = [
    programme.title,
    programme.description,
    programme.tools.join(" "),
    programme.careers.join(" "),
    trackById[programme.track].name,
    programme.phases.map((phase) => phase.name + " " + phase.topics.join(" ")).join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function ProgrammeCatalogue() {
  const [track, setTrack] = useState<TrackId | "all">("all");
  const [duration, setDuration] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  // The last programme opened stays rendered while the sheet slides out.
  const [shownId, setShownId] = useState<string | null>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const catalogue = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFind = (event: Event) => {
      const detail = (event as CustomEvent<FindDetail>).detail ?? {};
      setTrack(detail.track ?? "all");
      setDuration(detail.duration ?? "");
      setQuery(detail.query ?? "");
      setExpanded(false);
    };
    window.addEventListener(FIND_EVENT, onFind);
    return () => window.removeEventListener(FIND_EVENT, onFind);
  }, []);

  useEffect(() => {
    const node = sheet.current;
    if (!node) return;
    return bindDialogDismiss(node);
  }, []);

  function openSheet(id: string) {
    // Render the programme first, so the dialog opens with its content and title.
    flushSync(() => setShownId(id));
    const node = sheet.current;
    if (!node) return;
    if (!node.open) node.showModal();
    node.scrollTop = 0;
  }

  async function enquire(programme: Programme) {
    window.dispatchEvent(
      new CustomEvent("en:enquire", {
        detail: {
          interest: trackById[programme.track].name,
          message: "I would like to know more about " + programme.title + ".",
        },
      }),
    );
    await closeDialog(sheet.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("contact")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    document.getElementById("en-enquiry-name")?.focus({ preventScroll: true });
  }

  const results = useMemo(
    () =>
      programmes.filter(
        (programme) =>
          (track === "all" || programme.track === track) &&
          (!duration || programme.duration === duration) &&
          matches(programme, query.trim()),
      ),
    [track, duration, query],
  );

  const open = programmes.find((programme) => programme.id === shownId) ?? null;
  const filtered = track !== "all" || duration !== "" || query.trim() !== "";
  const visible = expanded ? results : results.slice(0, PREVIEW);
  const hidden = results.length - visible.length;

  function chooseTrack(next: TrackId | "all") {
    withTransition(() => {
      setTrack(next);
      setExpanded(false);
    });
  }

  function chooseDuration(next: string) {
    withTransition(() => {
      setDuration(next);
      setExpanded(false);
    });
  }

  function reset() {
    withTransition(() => {
      setTrack("all");
      setDuration("");
      setQuery("");
      setExpanded(false);
    });
  }

  function toggleExpanded() {
    const collapsing = expanded;
    withTransition(() => setExpanded(!collapsing));
    if (collapsing) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      catalogue.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  return (
    <div className="en-cat" ref={catalogue}>
      <div className="en-cat-bar">
        <div className="en-cat-tracks" role="group" aria-label="Filter by discipline">
          <button type="button" aria-pressed={track === "all"} onClick={() => chooseTrack("all")}>
            All <span>{programmes.length}</span>
          </button>
          {tracks.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={track === item.id}
              data-track={item.id}
              onClick={() => chooseTrack(item.id)}
            >
              {item.short} <span>{programmeCounts[item.id]}</span>
            </button>
          ))}
        </div>
        <div className="en-cat-tools">
          <label className="en-cat-search" htmlFor="en-cat-query">
            <Search aria-hidden="true" />
            <span className="en-sr">Search programmes</span>
            <input
              id="en-cat-query"
              type="search"
              value={query}
              placeholder="Search by tool, topic or career"
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value);
                setExpanded(false);
              }}
            />
          </label>
          <label className="en-cat-select" htmlFor="en-cat-duration">
            <span className="en-sr">Duration</span>
            <select id="en-cat-duration" value={duration} onChange={(event) => chooseDuration(event.target.value)}>
              <option value="">Any duration</option>
              {glance.durations.map((value) => (
                <option key={value} value={value}>
                  {value.toLowerCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="en-cat-status">
        <p aria-live="polite">
          Showing <strong>{results.length}</strong> of {programmes.length} programmes
          {track !== "all" && <> in {trackById[track].name}</>}
          {duration && <> · {duration.toLowerCase()}</>}
          {query.trim() && <> · matching “{query.trim()}”</>}
        </p>
        {filtered && (
          <button type="button" className="en-link" onClick={reset}>
            Clear filters
          </button>
        )}
      </div>

      {results.length ? (
        <ul className="en-cat-grid">
          {visible.map((programme, index) => (
            <li
              key={programme.id}
              data-en-reveal=""
              style={{ "--i": index % 3, viewTransitionName: "en-prog-" + programme.id } as CSSProperties}
            >
              <article className="en-prog" data-track={programme.track} data-en-spot="">
                <div className="en-prog-top">
                  <span className="en-prog-track">{trackById[programme.track].short}</span>
                  <span className="en-prog-badge">{programme.badge}</span>
                </div>
                <h3>{programme.title}</h3>
                <p>{programme.description}</p>
                <ul className="en-prog-tools" aria-label="Tools">
                  {programme.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
                <dl className="en-prog-meta">
                  <div>
                    <dt>Duration</dt>
                    <dd>{programme.duration}</dd>
                  </div>
                  <div>
                    <dt>Sessions</dt>
                    <dd>{parseInt(programme.sessions)}</dd>
                  </div>
                  <div>
                    <dt>Credits</dt>
                    <dd>{parseInt(programme.credits)}</dd>
                  </div>
                </dl>
                <button type="button" className="en-prog-open" onClick={() => openSheet(programme.id)}>
                  View curriculum
                  <span className="en-sr">: {programme.title}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
              </article>
            </li>
          ))}
        </ul>
      ) : null}

      {results.length > PREVIEW && (
        <div className="en-cat-more">
          <button type="button" className="en-btn en-btn--outline" aria-expanded={expanded} onClick={toggleExpanded}>
            {expanded ? "Show fewer programmes" : "Show all " + results.length + " programmes"}
            <ChevronDown aria-hidden="true" />
          </button>
          {!expanded && <span>{hidden} more to explore</span>}
        </div>
      )}

      {results.length ? null : (
        <div className="en-cat-empty">
          <p>
            <strong>No programme matches those filters.</strong> Try another tool or discipline, or ask us
            about a custom programme for your institution.
          </p>
          <button type="button" className="en-btn en-btn--outline" onClick={reset}>
            Show all programmes
          </button>
        </div>
      )}

      <dialog ref={sheet} className="en-sheet" aria-labelledby="en-sheet-title" data-track={open?.track}>
        {open && (
          <div className="en-sheet-inner">
            <header className="en-sheet-head">
              <div>
                <p className="en-sheet-kicker">
                  <span className="en-prog-track">{trackById[open.track].name}</span>
                  <span className="en-prog-badge">{open.badge} programme</span>
                </p>
                <h2 id="en-sheet-title">{open.title}</h2>
              </div>
              <button type="button" className="en-sheet-close" aria-label="Close curriculum" onClick={() => void closeDialog(sheet.current)}>
                <X aria-hidden="true" />
              </button>
            </header>

            <dl className="en-sheet-meta">
              <div>
                <Clock3 aria-hidden="true" />
                <dt>Duration</dt>
                <dd>{open.duration}</dd>
              </div>
              <div>
                <Layers aria-hidden="true" />
                <dt>Sessions</dt>
                <dd>{parseInt(open.sessions)}</dd>
              </div>
              <div>
                <GraduationCap aria-hidden="true" />
                <dt>Credits</dt>
                <dd>{parseInt(open.credits)}</dd>
              </div>
            </dl>

            <p className="en-sheet-lead">{open.description}</p>

            <ol className="en-sheet-flow" aria-label="Programme flow">
              {open.flow.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <h3 className="en-sheet-h">Curriculum</h3>
            <ol className="en-sheet-phases">
              {open.phases.map((phase, index) => (
                <li key={phase.name}>
                  <span className="en-sheet-num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="en-sheet-phase-label">{phase.label}</p>
                    <h4>{phase.name}</h4>
                    <ul>
                      {phase.topics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                    {phase.projects.length > 0 && (
                      <div className="en-sheet-projects">
                        <p>
                          <FolderKanban aria-hidden="true" />
                          Projects
                        </p>
                        <ul>
                          {phase.projects.map((project) => (
                            <li key={project}>{project}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <h3 className="en-sheet-h">What you will be able to do</h3>
            <ul className="en-sheet-outcomes">
              {open.outcomes.map((outcome) => (
                <li key={outcome.title}>
                  <CheckCircle2 aria-hidden="true" />
                  <div>
                    <strong>{outcome.title}</strong>
                    <p>{outcome.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <h3 className="en-sheet-h">
              <BriefcaseBusiness aria-hidden="true" />
              Career paths
            </h3>
            <ul className="en-sheet-careers">
              {open.careers.map((career) => (
                <li key={career}>{career}</li>
              ))}
            </ul>

            <div className="en-sheet-foot">
              <a
                className="en-btn"
                href="#contact"
                onClick={(event) => {
                  event.preventDefault();
                  void enquire(open);
                }}
              >
                Enquire about this programme
              </a>
              <button type="button" className="en-btn en-btn--outline" onClick={() => void closeDialog(sheet.current)}>
                Back to programmes
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
