"use client";

import { useState } from "react";

const services = [
  ["Computer Sales & Service", "computer-sales-service"],
  ["CCTV & Security", "cctv-installation"],
  ["Home Automation", "home-automation"],
  ["Gate Automation", "gate-automation"],
  ["Solar Solutions", "solar-solutions"],
  ["Inverter Solutions", "inverter-solutions"],
  ["Business ERP Software", "erp-software"],
  ["Website Development", "website-development"],
] as const;

export default function LeadForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const selected = services.find(([label]) => label === form.get("service"));
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          location: form.get("location"),
          serviceSlug: selected?.[1] ?? "other",
          requirement: form.get("requirement"),
          source: "WEBSITE",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send enquiry");
      setState("success");
      setMessage(`Enquiry received. Reference: ${data.publicLeadId}`);
      event.currentTarget.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to send enquiry");
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Name<input name="name" required placeholder="Your name" /></label>
      <label>Phone<input name="phone" required placeholder="+91" inputMode="tel" /></label>
      <label>Email<input name="email" type="email" placeholder="you@example.com" /></label>
      <label>Location<input name="location" placeholder="Trivandrum / Kerala" /></label>
      <label>Service<select name="service" defaultValue="" required><option value="" disabled>Select a service</option>{services.map(([label]) => <option key={label}>{label}</option>)}</select></label>
      <label>Requirement<textarea name="requirement" rows={4} placeholder="Tell us briefly what you need" /></label>
      <button className="primary" type="submit" disabled={state === "loading"}>{state === "loading" ? "Sending…" : "Send enquiry"} <span>→</span></button>
      {message && <p role="status" aria-live="polite" className={state === "error" ? "formError" : "formSuccess"}>{message}</p>}
    </form>
  );
}
