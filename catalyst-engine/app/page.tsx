import Link from "next/link";

const modules = [
  {
    href: "/dashboard/list-grader",
    tag: "deterministic",
    title: "List Grader",
    body: "Upload a CSV. Get scored on duplicate rate, title diversity, catch-all density, and verification coverage — weighted into a letter grade before you send a thing.",
  },
  {
    href: "/dashboard/deliverability",
    tag: "deterministic",
    title: "Deliverability Guard",
    body: "Paste a draft. A rules engine checks banned words, subject-line patterns, and opt-out wording, and returns a hard pass or fail.",
  },
  {
    href: "/dashboard/sequences",
    tag: "reasoning",
    title: "Sequence Generator",
    body: "Upload leads. Each one gets its own opener and 3-touch follow-up sequence, written from the pattern-interrupt formula, not a mail-merge template.",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <span className="font-mono text-sm tracking-tight">catalyst&nbsp;engine</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-mono text-xs uppercase tracking-wider px-3.5 py-2 rounded hover:text-accent transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="font-mono text-xs uppercase tracking-wider px-3.5 py-2 rounded border border-line-strong hover:border-accent hover:text-accent transition-colors"
            >
              Sign up →
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-14">
        <span className="eyebrow block mb-4">The outbound engine, as software</span>
        <h1 className="font-serif font-medium text-4xl sm:text-5xl leading-[1.08] max-w-2xl text-balance">
          The same outbound engine — run yourself, not booked as a service.
        </h1>
        <p className="text-fg-dim text-lg max-w-xl mt-5 text-balance">
          List grading, deliverability checks, and per-lead personalization, wired up as three
          tools your team logs into directly. No agency retainer between you and the result.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex flex-col gap-3 rounded border border-line bg-bg-raised p-5 hover:border-accent-soft transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-medium">{m.title}</h2>
                <span
                  className={`font-mono text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    m.tag === "deterministic" ? "bg-ok/15 text-ok" : "bg-fg-dim/15 text-fg-dim"
                  }`}
                >
                  {m.tag}
                </span>
              </div>
              <p className="text-sm text-fg-dim leading-relaxed">{m.body}</p>
              <span className="mt-auto font-mono text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line-strong">
        <div className="max-w-5xl mx-auto px-6 py-10 text-center">
          <p className="font-serif text-xl sm:text-2xl text-balance max-w-2xl mx-auto">
            &ldquo;Instantly is <span className="text-accent">the road</span>. This is{" "}
            <span className="text-accent">the driver</span>.&rdquo;
          </p>
          <p className="text-fg-dim text-sm mt-3">
            We don&rsquo;t replace your sending platform — we replace the agency sitting between you and it.
          </p>
        </div>
      </section>

      <footer className="mt-auto border-t border-line">
        <div className="max-w-5xl mx-auto px-6 py-6 font-mono text-xs text-fg-dim flex justify-between flex-wrap gap-2">
          <span>Catalyst Engine — MVP build</span>
          <span>Reasoning layer + deterministic layer, in one app</span>
        </div>
      </footer>
    </div>
  );
}
