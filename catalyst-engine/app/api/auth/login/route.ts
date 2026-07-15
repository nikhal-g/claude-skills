import { authenticateUser, startSession, AuthError } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return Response.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const user = authenticateUser(body.email, body.password);
    await startSession(user.id);
    return Response.json({ ok: true, email: user.email });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ error: err.message }, { status: 401 });
    return Response.json({ error: "Login failed." }, { status: 500 });
  }
}
