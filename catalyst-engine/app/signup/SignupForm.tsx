"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupForm() {
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
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
          className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-fg-dim">Password (8+ characters)</span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-sm border border-line rounded px-3 py-2 bg-bg-raised"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded bg-accent text-on-accent hover:bg-accent-soft transition-colors disabled:opacity-50 w-fit"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      {error && <p className="text-crit text-sm">{error}</p>}
      <p className="text-sm text-fg-dim">
        Already have an account? <Link href="/login" className="text-accent hover:underline">Log in</Link>
      </p>
    </form>
  );
}
