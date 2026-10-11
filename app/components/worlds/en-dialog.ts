/**
 * Modal `<dialog>` helpers for the Engineering world.
 *
 * Closing animates. Chrome and Edge transition `display` and `overlay`
 * natively (see en.css). Firefox and Safari cannot keep a dialog in the top
 * layer while it fades, so there the dialog gets `data-closing`, its exit
 * transition runs, and only then is it closed. Escape, the backdrop and every
 * close button go through `closeDialog`, so they all animate the same way.
 */

let displayTransition: boolean | undefined;

/** Whether `display` really transitions (Firefox parses allow-discrete but does not animate it). */
function canTransitionDisplay() {
  if (displayTransition !== undefined) return displayTransition;
  if (!window.CSS?.supports?.("transition-behavior", "allow-discrete") || !document.body) return (displayTransition = false);
  const probe = document.createElement("div");
  probe.style.cssText = "transition: display 1s allow-discrete !important; display: block;";
  document.body.appendChild(probe);
  void getComputedStyle(probe).display;
  probe.style.display = "none";
  displayTransition = getComputedStyle(probe).display === "block";
  probe.remove();
  return displayTransition;
}

function supportsTopLayerExit() {
  return Boolean(window.CSS?.supports?.("overlay", "auto")) && canTransitionDisplay();
}

export async function closeDialog(node: HTMLDialogElement | null) {
  if (!node?.open || node.hasAttribute("data-closing")) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && !supportsTopLayerExit()) {
    node.setAttribute("data-closing", "");
    const animations = node.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((animation) => animation.finished)),
        new Promise((resolve) => window.setTimeout(resolve, 600)),
      ]);
    }
    if (!node.hasAttribute("data-closing")) return;
    node.removeAttribute("data-closing");
  }
  node.close();
}

/**
 * Backdrop click and Escape for a modal `<dialog>`, both routed through the
 * animated close. `closedby="any"` is set for browsers that support it.
 */
export function bindDialogDismiss(node: HTMLDialogElement) {
  node.setAttribute("closedby", "any");

  const onClick = (event: MouseEvent) => {
    if (event.target !== node || !node.open) return;
    const rect = node.getBoundingClientRect();
    const inside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (inside) return;
    void closeDialog(node);
  };

  // A native close request (Escape, light dismiss) is cancelled and replayed
  // through closeDialog so it animates too.
  const onCancel = (event: Event) => {
    event.preventDefault();
    void closeDialog(node);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !node.open) return;
    event.preventDefault();
    void closeDialog(node);
  };

  node.addEventListener("click", onClick);
  node.addEventListener("cancel", onCancel);
  node.addEventListener("keydown", onKey);
  return () => {
    node.removeEventListener("click", onClick);
    node.removeEventListener("cancel", onCancel);
    node.removeEventListener("keydown", onKey);
  };
}
