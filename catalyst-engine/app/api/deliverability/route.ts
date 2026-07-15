import { scanText } from "@/lib/deliverability";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ error: "Request body must include a non-empty 'text' field." }, { status: 400 });
  }

  const flags = scanText(body.text);
  const high = flags.filter((f) => f.severity === "HIGH").length;
  const medium = flags.filter((f) => f.severity === "MEDIUM").length;

  return Response.json({
    pass: flags.length === 0,
    flagCount: flags.length,
    highCount: high,
    mediumCount: medium,
    flags,
  });
}
