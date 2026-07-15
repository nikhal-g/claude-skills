import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <span className="eyebrow block mb-3">Catalyst Engine</span>
        <h1 className="font-serif text-2xl font-medium mb-6">Log in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
