"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A trigger button plus a native modal <dialog>.
 *
 * The native element gives us the focus trap, Escape to close, the inert
 * background and focus return to the trigger without any extra code. Clicking
 * the backdrop also closes it.
 */
export function ProfileDialog({
  id,
  trigger,
  triggerClassName,
  triggerLabel,
  title,
  children,
}: {
  /**
   * Stable, unique id for the dialog. Passed in rather than taken from useId():
   * under this RSC renderer useId() differs between server and client, which
   * caused a hydration mismatch on the title's id.
   */
  id: string;
  trigger: ReactNode;
  triggerClassName?: string;
  /** Accessible name for the trigger, e.g. "Open profile: Dr. K. Sudheer Reddy". */
  triggerLabel: string;
  /** Rendered as the dialog's heading and used as its accessible name. */
  title: ReactNode;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = id + "-title";

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    const onClick = (event: MouseEvent) => {
      if (event.target === node) node.close();
    };
    node.addEventListener("click", onClick);
    return () => node.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-label={triggerLabel}
        aria-haspopup="dialog"
        aria-controls={id}
        onClick={() => dialog.current?.showModal()}
      >
        {trigger}
      </button>
      <dialog ref={dialog} id={id} className="xp-dialog" aria-labelledby={titleId}>
        <div className="xp-dialog-close">
          <button type="button" onClick={() => dialog.current?.close()}>
            Close <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="xp-dialog-body">
          <h3 className="xp-dialog-title" id={titleId}>
            {title}
          </h3>
          {children}
        </div>
      </dialog>
    </>
  );
}
