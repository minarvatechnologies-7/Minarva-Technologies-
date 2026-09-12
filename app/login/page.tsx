"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload: Record<string, string> = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };
    if (mode === "register") {
      payload.name = String(form.get("name") || "");
      payload.phone = String(form.get("phone") || "");
    }
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to continue");
      router.push(data.user?.role === "CUSTOMER" ? "/customer" : "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authCard">
        <a className="brand" href="/">MINARVA<span>TECHNOLOGIES</span></a>
        <p className="eyebrow">CUSTOMER PLATFORM</p>
        <h1>{mode === "login" ? "Welcome back." : "Create your account."}</h1>
        <p>Track service requests, quotations, invoices and warranty information from one place.</p>
        <form onSubmit={submit}>
          {mode === "register" && <><label>Name<input name="name" required autoComplete="name" /></label><label>Phone<input name="phone" required autoComplete="tel" inputMode="tel" /></label></>}
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></label>
          <button className="primary" type="submit" disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
          {error && <p className="formError" role="alert">{error}</p>}
        </form>
        <button className="textButton" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "New customer? Create an account" : "Already have an account? Sign in"}
        </button>
        <a className="backLink" href="/">← Back to website</a>
      </section>
    </main>
  );
}
