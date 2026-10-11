"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

/**
 * Enquiry form for the division worlds.
 *
 * Same delivery as the site's contact form: the enquiry is composed into a
 * WhatsApp message to TechM4India and opened in a new tab. Nothing is stored,
 * so the status line says exactly that.
 *
 * `theme` picks the class prefix ("tm" Solutions, "sc" Schools, "en" Engineering), so
 * each world styles the same working form in its own language.
 */

type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "select" | "textarea";
  options?: string[];
  required?: boolean;
  autoComplete?: string;
  wide?: boolean;
};

const WHATSAPP = "https://wa.me/916301814246?text=";

export function EnquiryForm({
  formId,
  theme,
  title,
  fields,
  submitLabel,
  prefillEvent,
}: {
  /** Stable, unique prefix for field ids (useId() differs between server and client here). */
  formId: string;
  theme: "tm" | "sc" | "en";
  /** First line of the WhatsApp message, e.g. "New TechM4Solutions enquiry". */
  title: string;
  fields: Field[];
  submitLabel: string;
  /** Optional window event that fills interest and message. Engineering uses "en:enquire". */
  prefillEvent?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "blocked">("idle");

  useEffect(() => {
    if (!prefillEvent) return;
    const onPrefill = (event: Event) => {
      const form = formRef.current;
      if (!form) return;
      const detail = (event as CustomEvent<{ interest?: string; message?: string }>).detail ?? {};
      if (detail.interest) {
        const interest = form.elements.namedItem("interest");
        if (interest instanceof HTMLSelectElement && [...interest.options].some((option) => option.value === detail.interest)) {
          interest.value = detail.interest;
        }
      }
      if (detail.message) {
        const message = form.elements.namedItem("message");
        // Replace the message if it is empty or still the one we filled in last
        // time, so a second programme's enquiry never keeps the first's text.
        if (
          message instanceof HTMLTextAreaElement &&
          (message.value.trim() === "" || message.value === message.dataset.prefill)
        ) {
          message.value = detail.message;
          message.dataset.prefill = detail.message;
        }
      }
    };
    window.addEventListener(prefillEvent, onPrefill);
    return () => window.removeEventListener(prefillEvent, onPrefill);
  }, [prefillEvent]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const lines = fields
      .map((field) => [field.label, String(data.get(field.name) || "").trim()] as const)
      .filter(([, value]) => value)
      .map(([label, value]) => "*" + label + ":* " + value);
    const message = "*" + title + "*\n\n" + lines.join("\n");
    const opened = window.open(WHATSAPP + encodeURIComponent(message), "_blank", "noopener,noreferrer");
    if (opened) {
      setStatus("ready");
      form.reset();
    } else {
      setStatus("blocked");
    }
  }

  return (
    <form ref={formRef} className={theme + "-form"} onSubmit={submit}>
      <div className={theme + "-form-grid"}>
        {fields.map((field) => {
          const fieldId = formId + "-" + field.name;
          return (
            <label
              key={field.name}
              htmlFor={fieldId}
              className={theme + "-field" + (field.wide || field.type === "textarea" ? " is-wide" : "")}
            >
              <span>
                {field.label}
                {field.required && <b aria-hidden="true"> *</b>}
              </span>
              {field.type === "select" ? (
                <select id={fieldId} name={field.name} required={field.required} defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {field.options?.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea id={fieldId} name={field.name} required={field.required} rows={4} />
              ) : (
                <input
                  id={fieldId}
                  name={field.name}
                  type={field.type ?? "text"}
                  required={field.required}
                  autoComplete={field.autoComplete}
                />
              )}
            </label>
          );
        })}
      </div>
      <div className={theme + "-form-foot"}>
        <button className={theme + "-btn"} type="submit">
          {submitLabel}
        </button>
        <p className={theme + "-form-note"}>Opens WhatsApp with your message ready to send.</p>
      </div>
      <p className={theme + "-form-status" + (status === "idle" ? "" : " is-" + status)} role="status" aria-live="polite">
        {status === "ready" && "WhatsApp is open in a new tab. Press send there and the team will reply."}
        {status === "blocked" &&
          "Your browser blocked the new tab. Allow pop-ups for this site, or message +91 63018 14246 on WhatsApp."}
      </p>
    </form>
  );
}
