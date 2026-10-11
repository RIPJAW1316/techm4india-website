"use client";
/* eslint-disable @next/next/no-img-element -- Direct image URLs support the static Vinext deployment. */

import { Check, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { campusDrive, path } from "@/lib/content/engineering";
import { bindDialogDismiss, closeDialog } from "./en-dialog";

/**
 * The five-phase TechM4 path as tabs, in the manner of gitam.edu's tabbed
 * sections. Every panel is in the HTML; only the active one is shown. Phases
 * before the active one read as done, and a bar tracks progress through them.
 */
export function PathTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Change phase and keep focus on a visible control (the new tab).
  const go = (next: number) => {
    setActive(next);
    tabs.current[next]?.focus();
  };

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: path.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (keys[event.key] + path.length) % path.length;
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="en-path" data-en-reveal="">
      <div className="en-path-tabs" role="tablist" aria-label="The TechM4 path" aria-orientation="vertical">
        {path.map((phase, index) => (
          <button
            key={phase.code}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            id={"en-path-tab-" + index}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls={"en-path-panel-" + index}
            tabIndex={index === active ? 0 : -1}
            data-state={index < active ? "done" : index === active ? "active" : "next"}
            onClick={() => setActive(index)}
            onKeyDown={onKeyDown}
          >
            <span className="en-path-code">
              {index < active ? <Check aria-hidden="true" /> : phase.code}
            </span>
            <span className="en-path-name">{phase.name}</span>
            <span className="en-path-stage">{phase.stage}</span>
          </button>
        ))}
      </div>
      <div className="en-path-stagewrap">
        <div className="en-path-progress" aria-hidden="true">
          <span style={{ "--p": (active + 1) / path.length } as CSSProperties} />
        </div>
        {path.map((phase, index) => (
          <div
            key={phase.code}
            id={"en-path-panel-" + index}
            className="en-path-panel"
            role="tabpanel"
            aria-labelledby={"en-path-tab-" + index}
            hidden={index !== active}
          >
            <figure className="en-path-media">
              <img src={phase.image} alt={phase.imageAlt} loading="lazy" width={1200} height={800} />
              <figcaption aria-hidden="true">{phase.code}</figcaption>
            </figure>
            <div className="en-path-copy">
              <p className="en-path-step">
                Phase {index + 1} of {path.length} · {phase.stage}
              </p>
              <h3>{phase.name}</h3>
              <p>{phase.text}</p>
              <p className="en-path-example">
                <strong>For example</strong>
                {phase.example}
              </p>
              <div className="en-path-nav">
                <button
                  type="button"
                  className="en-round"
                  aria-label="Previous phase"
                  disabled={index === 0}
                  onClick={() => go(index - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="en-round"
                  aria-label="Next phase"
                  disabled={index === path.length - 1}
                  onClick={() => go(index + 1)}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
                {index < path.length - 1 && (
                  <button type="button" className="en-path-next" onClick={() => go(index + 1)}>
                    Next: {path[index + 1].name}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The campus-drive photographs, with a lightbox for a closer look. */
export function DriveGallery() {
  const photos = campusDrive.photos;
  // The last photo stays rendered while the lightbox fades out.
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const box = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const unbindDismiss = bindDialogDismiss(node);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      setDirection(delta);
      setIndex((current) => (current + delta + photos.length) % photos.length);
    };
    node.addEventListener("keydown", onKey);
    return () => {
      unbindDismiss();
      node.removeEventListener("keydown", onKey);
    };
  }, [photos.length]);

  const open = (i: number) => {
    setDirection(1);
    setIndex(i);
    const node = box.current;
    if (node && !node.open) node.showModal();
  };

  const step = (delta: 1 | -1) => {
    setDirection(delta);
    setIndex((current) => (current + delta + photos.length) % photos.length);
  };

  const current = photos[index];

  return (
    <>
      <ul className="en-gallery">
        {photos.map((photo, i) => (
          <li key={photo.src} className={"en-gallery-item is-" + (i + 1)} data-en-reveal="wipe" style={{ "--i": i } as CSSProperties}>
            <button type="button" onClick={() => open(i)} aria-label={"Enlarge photo: " + photo.caption}>
              <img src={photo.src} alt={photo.alt} loading="lazy" width={1200} height={900} />
              <span className="en-gallery-cap">
                {photo.caption}
                <Expand aria-hidden="true" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={box} className="en-lightbox" aria-label="Campus drive photos">
        <figure key={index} data-direction={direction === 1 ? "next" : "prev"}>
          <img src={current.src} alt={current.alt} loading="lazy" />
          <figcaption>
            <span>{current.caption}</span>
            <span>
              {index + 1} / {photos.length}
            </span>
          </figcaption>
        </figure>
        <button type="button" className="en-lightbox-close" aria-label="Close photo" onClick={() => void closeDialog(box.current)}>
          <X aria-hidden="true" />
        </button>
        <button type="button" className="en-lightbox-arrow is-prev" aria-label="Previous photo" onClick={() => step(-1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <button type="button" className="en-lightbox-arrow is-next" aria-label="Next photo" onClick={() => step(1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </dialog>
    </>
  );
}
