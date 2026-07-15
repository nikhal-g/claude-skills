import { getCurrentUser } from "@/lib/auth";
import { getOverviewStats } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to view your overview." }, { status: 401 });
  return Response.json(getOverviewStats(user.id));
}
