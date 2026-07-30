import { createUser, startSession, AuthError } from "@/lib/auth";
import { checkRateLimit, rateLimitResponse, getClientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const limit = checkRateLimit(`signup:${getClientIp(request)}`, 5, 60 * 60_000);
  if (!limit.allowed) return rateLimitResponse(limit);

  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const user = createUser(body.email, body.password);
    await startSession(user.id);
    return Response.json({ ok: true, email: user.email });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ error: err.message }, { status: 400 });
    return Response.json({ error: "Signup failed." }, { status: 500 });
  }
}
