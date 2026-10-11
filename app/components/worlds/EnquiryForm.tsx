"use client";

import { useState, type FormEvent } from "react";

/**
 * Enquiry form for the division worlds.
 *
 * Same delivery as the site's contact form: the enquiry is composed into a
 * WhatsApp message to TechM4India and opened in a new tab. Nothing is stored,
 * so the status line says exactly that.
 *
 * `theme` picks the class prefix ("tm" for Solutions, "sc" for Schools), so
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
}: {
  /** Stable, unique prefix for field ids (useId() differs between server and client here). */
  formId: string;
  theme: "tm" | "sc";
  /** First line of the WhatsApp message, e.g. "New TechM4Solutions enquiry". */
  title: string;
  fields: Field[];
  submitLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "ready" | "blocked">("idle");

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
    <form className={theme + "-form"} onSubmit={submit}>
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
