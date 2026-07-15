import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getOverviewStats } from "@/lib/db";

const tools = [
  {
    href: "/dashboard/list-grader",
    title: "List Grader",
    tag: "deterministic",
    statKey: "gradeRuns" as const,
    desc: "Score a lead CSV on 5 weighted dimensions before it goes anywhere near a sending platform.",
  },
  {
    href: "/dashboard/deliverability",
    title: "Deliverability Guard",
    tag: "deterministic",
    statKey: "scanRuns" as const,
    desc: "Scan a draft for spam-trigger words, patterns, and opt-out phrasing. Hard pass/fail.",
  },
  {
    href: "/dashboard/sequences",
    title: "Sequence Generator",
    tag: "reasoning",
    statKey: "sequenceRuns" as const,
    desc: "Turn a lead list into researched, per-lead opener + 3-touch sequences.",
  },
  {
    href: "/dashboard/offers",
    title: "Offer Generator",
    tag: "reasoning",
    statKey: "offerRuns" as const,
    desc: "One offer angle per friction level, tailored to your ICP and pain point.",
  },
  {
    href: "/dashboard/competitor",
    title: "Competitor Profiler",
    tag: "reasoning",
    statKey: "competitorRuns" as const,
    desc: "Fetch a competitor's pages and build a positioning profile from what's actually there.",
  },
  {
    href: "/dashboard/leadmagnet",
    title: "Lead Magnet Builder",
    tag: "reasoning",
    statKey: "leadMagnetRuns" as const,
    desc: "Generate a full 4-6 step lead magnet page as markdown, ready to publish.",
  },
];

export default async function DashboardHome() {
  const user = await getCurrentUser();
  const stats = user ? getOverviewStats(user.id) : null;
  const totalRuns = stats
    ? stats.gradeRuns + stats.scanRuns + stats.sequenceRuns + stats.offerRuns + stats.competitorRuns + stats.leadMagnetRuns
    : 0;

  return (
    <div>
      <span className="eyebrow block mb-3">Overview</span>
      <h1 className="font-serif text-2xl font-medium mb-8">
        {totalRuns > 0 ? `${totalRuns} run${totalRuns === 1 ? "" : "s"} so far` : "Pick a tool to get started"}
      </h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {tools.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="surface surface-interactive px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-serif text-2xl tabular">{stats[t.statKey]}</span>
                <span
                  className={`font-mono text-[0.6rem] uppercase tracking-wider ${
                    t.tag === "deterministic" ? "text-ok" : "text-fg-dim"
                  }`}
                >
                  {t.tag}
                </span>
              </div>
              <p className="text-xs text-fg-dim mt-1 truncate">{t.title}</p>
            </Link>
          ))}
          <div className="surface px-4 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-serif text-2xl tabular">{stats.instantlyPushes}</span>
              <span className="font-mono text-[0.6rem] uppercase tracking-wider text-fg-dim">sending</span>
            </div>
            <p className="text-xs text-fg-dim mt-1 truncate">Instantly pushes</p>
          </div>
        </div>
      )}
      <p className="text-xs text-fg-dim mb-10">Push leads to Instantly from the Sequence Generator once you&rsquo;ve generated copy.</p>

      {stats?.lastActivity && (
        <p className="font-mono text-xs text-fg-dim mb-10">
          Last activity {new Date(stats.lastActivity).toLocaleString()}
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="flex flex-col gap-2 surface surface-interactive p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium">{t.title}</h2>
              <span
                className={`font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  t.tag === "deterministic" ? "bg-ok/15 text-ok" : "bg-fg-dim/15 text-fg-dim"
                }`}
              >
                {t.tag}
              </span>
            </div>
            <p className="text-sm text-fg-dim leading-relaxed">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
