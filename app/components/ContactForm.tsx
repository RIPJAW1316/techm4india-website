"use client";

import { FormEvent, useState } from "react";

const supabaseUrl = "https://usmupsydbpzpqepfztdn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzbXVwc3lkYnB6cHFlcGZ6dGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NjA3NzUsImV4cCI6MjA5OTMzNjc3NX0.pjrQPCg0uO8Wi85HRtFwlssqNPIrvizi-ZZIUaK3Zwg";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

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
      "*New Contact Form Submission*\\n\\n" +
      "*Name:* " + payload.first_name + " " + payload.last_name + "\\n" +
      "*Email:* " + payload.email + "\\n" +
      "*Organisation:* " + payload.organisation + "\\n" +
      "*Role:* " + payload.role + "\\n" +
      "*Message:* " + payload.message;
    const whatsappUrl = "https://wa.me/916301814246?text=" + encodeURIComponent(message);

    try {
      const response = await fetch(supabaseUrl + "/rest/v1/contact_submissions", {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: "Bearer " + supabaseAnonKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Submission failed");
      setStatus("sent");
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      form.reset();
    } catch {
      setStatus("error");
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          <span>First name</span>
          <input name="firstName" type="text" autoComplete="given-name" placeholder="Arjun" required />
        </label>
        <label>
          <span>Last name</span>
          <input name="lastName" type="text" autoComplete="family-name" placeholder="Reddy" required />
        </label>
      </div>
      <label>
        <span>Email address</span>
        <input name="email" type="email" autoComplete="email" placeholder="arjun@institution.ac.in" required />
      </label>
      <label>
        <span>Organisation / institution</span>
        <input name="organisation" type="text" autoComplete="organization" placeholder="Your institution or company" />
      </label>
      <label>
        <span>I am reaching out as a</span>
        <select name="role" defaultValue="">
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
        <textarea name="message" rows={5} placeholder="Tell us what you are looking to achieve and how we can help." />
      </label>
      <button className="button button-primary form-submit" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : status === "sent" ? "Message sent" : "Send message"}
        <span aria-hidden="true">{status === "sent" ? "✓" : "↗"}</span>
      </button>
      <p className="form-status" aria-live="polite">
        {status === "sent" && "Thank you. Your message has been recorded and WhatsApp has opened for a direct follow-up."}
        {status === "error" && "WhatsApp has opened so you can send the message directly."}
      </p>
    </form>
  );
}
