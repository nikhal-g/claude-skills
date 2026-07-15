import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/list-grader", label: "List Grader" },
  { href: "/dashboard/deliverability", label: "Deliverability" },
  { href: "/dashboard/sequences", label: "Sequences" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
          <Link href="/" className="font-mono text-sm tracking-tight">
            catalyst&nbsp;engine
          </Link>
          <nav className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded hover:bg-bg-raised hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <span className="w-px h-4 bg-line-strong mx-1" />
            <span className="px-3 py-1.5 text-fg-dim normal-case tracking-normal">{user.email}</span>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">{children}</main>
    </div>
  );
}
