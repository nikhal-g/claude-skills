import { randomUUID } from "node:crypto";
import { scanText } from "@/lib/deliverability";
import { getCurrentUser } from "@/lib/auth";
import { insertScanRun, listScanRuns } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to use the deliverability guard." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ error: "Request body must include a non-empty 'text' field." }, { status: 400 });
  }

  const flags = scanText(body.text);
  const high = flags.filter((f) => f.severity === "HIGH").length;
  const medium = flags.filter((f) => f.severity === "MEDIUM").length;
  const result = {
    pass: flags.length === 0,
    flagCount: flags.length,
    highCount: high,
    mediumCount: medium,
    flags,
  };

  insertScanRun({
    id: randomUUID(),
    userId: user.id,
    pass: result.pass,
    flagCount: result.flagCount,
    resultJson: JSON.stringify(result),
  });

  return Response.json(result);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Log in to view history." }, { status: 401 });
  return Response.json({ runs: listScanRuns(user.id) });
}
