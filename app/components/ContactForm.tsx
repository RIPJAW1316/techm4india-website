"use client";

import { FormEvent, useState } from "react";
import { contact } from "@/lib/site-data";

type Status = "idle" | "ready" | "blocked";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      first_name: String(data.get("firstName") || ""),
      last_name: String(data.get("lastName") || ""),
      email: String(data.get("email") || ""),
      organisation: String(data.get("organisation") || ""),
      role: String(data.get("role") || ""),
      message: String(data.get("message") || ""),
    };

    const message =
      "*New TechM4India enquiry*\n\n" +
      "*Name:* " + payload.first_name + " " + payload.last_name + "\n" +
      "*Email:* " + payload.email + "\n" +
      "*Organisation:* " + payload.organisation + "\n" +
      "*Role:* " + payload.role + "\n" +
      "*Message:* " + payload.message;
    const whatsappUrl = "https://wa.me/916301814246?text=" + encodeURIComponent(message);

    const conversation = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (conversation) {
      setStatus("ready");
      form.reset();
    } else {
      setStatus("blocked");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          <span>First name</span>
      <input name="firstName" type="text" autoComplete="given-name" placeholder="Arjun" maxLength={80} required />
        </label>
        <label>
          <span>Last name</span>
      <input name="lastName" type="text" autoComplete="family-name" placeholder="Reddy" maxLength={80} required />
        </label>
      </div>
      <label>
        <span>Email address</span>
        <input name="email" type="email" autoComplete="email" placeholder="arjun@institution.ac.in" maxLength={254} required />
      </label>
      <label>
        <span>Organisation / institution</span>
        <input name="organisation" type="text" autoComplete="organization" placeholder="Your institution or company" maxLength={160} />
      </label>
      <label>
        <span>I am reaching out as a</span>
        <select name="role" defaultValue="" required>
          <option value="" disabled>Select your role</option>
          <option>University / College Administrator</option>
          <option>School Principal / Director</option>
          <option>Corporate / CSR Head</option>
          <option>Startup Founder</option>
          <option>Student / Recent Graduate</option>
          <option>Researcher / Faculty</option>
          <option>Investor / VC</option>
          <option>Government / Policy</option>
          <option>Media / Press</option>
          <option>Other</option>
        </select>
      </label>
      <label>
        <span>What would you like to discuss?</span>
        <textarea name="message" rows={5} minLength={20} maxLength={2000} placeholder="Tell us what you are looking to achieve and how we can help." required />
      </label>
      <p className="form-privacy">Continuing opens a pre-filled WhatsApp message. Review it there before choosing to send. Prefer email? <a href={contact.partnershipsHref}>Write to partnerships</a>.</p>
      <button className="button button-primary form-submit" type="submit">
        {status === "ready" ? "WhatsApp ready" : "Continue in WhatsApp"}
        <span aria-hidden="true">{status === "ready" ? "✓" : "↗"}</span>
      </button>
      <p className="form-status" aria-live="polite">
        {status === "ready" && "Your draft is ready in WhatsApp. It is not sent until you confirm it there."}
        {status === "blocked" && "Your browser blocked the new tab. Allow pop-ups for this site, then try again."}
      </p>
    </form>
  );
}
