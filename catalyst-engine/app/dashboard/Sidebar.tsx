"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const groups: { label: string; tag: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Deterministic",
    tag: "rules, not judgment",
    items: [
      { href: "/dashboard/list-grader", label: "List Grader" },
      { href: "/dashboard/deliverability", label: "Deliverability Guard" },
    ],
  },
  {
    label: "Reasoning",
    tag: "calls Claude",
    items: [
      { href: "/dashboard/sequences", label: "Sequence Generator" },
      { href: "/dashboard/offers", label: "Offer Generator" },
      { href: "/dashboard/competitor", label: "Competitor Profiler" },
      { href: "/dashboard/leadmagnet", label: "Lead Magnet Builder" },
    ],
  },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-56 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-line flex lg:flex-col">
      <div className="flex lg:flex-col w-full">
        <div className="px-6 py-5 border-b border-line hidden lg:block">
          <Link href="/" className="font-mono text-sm tracking-tight">
            catalyst&nbsp;engine
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg btn-focus font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-colors ${
              pathname === "/dashboard" ? "bg-accent text-on-accent" : "hover:bg-bg-raised hover:text-accent"
            }`}
          >
            Overview
          </Link>

          {groups.map((group) => (
            <div key={group.label} className="lg:mt-3 flex lg:flex-col gap-1 lg:gap-0.5">
              <span className="hidden lg:block px-3 pt-2 pb-1 eyebrow text-[0.62rem]">{group.label}</span>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg btn-focus text-sm whitespace-nowrap transition-colors ${
                      active ? "bg-accent text-on-accent" : "hover:bg-bg-raised hover:text-accent text-fg-dim"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex flex-col gap-2 px-3 py-4 border-t border-line">
          <span className="px-3 text-xs text-fg-dim truncate">{email}</span>
          <div className="px-3">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
