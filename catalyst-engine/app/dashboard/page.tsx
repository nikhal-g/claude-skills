import Link from "next/link";

const tools = [
  {
    href: "/dashboard/list-grader",
    title: "List Grader",
    desc: "Score a lead CSV on 5 weighted dimensions before it goes anywhere near a sending platform.",
  },
  {
    href: "/dashboard/deliverability",
    title: "Deliverability Guard",
    desc: "Scan a draft for spam-trigger words, patterns, and opt-out phrasing. Hard pass/fail.",
  },
  {
    href: "/dashboard/sequences",
    title: "Sequence Generator",
    desc: "Turn a lead list into researched, per-lead opener + 3-touch sequences.",
  },
];

export default function DashboardHome() {
  return (
    <div>
      <span className="eyebrow block mb-3">Overview</span>
      <h1 className="font-serif text-2xl font-medium mb-8">Pick a tool</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex flex-col gap-2 rounded border border-line bg-bg-raised p-5 hover:border-accent-soft transition-colors"
          >
            <h2 className="font-serif text-lg font-medium">{t.title}</h2>
            <p className="text-sm text-fg-dim leading-relaxed">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
