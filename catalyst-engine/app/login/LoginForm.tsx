"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input text-sm"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="btn-focus font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>
      {error && <p className="text-crit text-sm">{error}</p>}
      <p className="text-sm text-fg-dim">
        No account? <Link href="/signup" className="text-accent hover:underline">Sign up</Link>
      </p>
    </form>
  );
}
