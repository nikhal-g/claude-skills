import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Sidebar from "./Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <Sidebar email={user.email} />
      <main className="flex-1 px-6 py-10 max-w-4xl w-full mx-auto lg:mx-0">{children}</main>
    </div>
  );
}
