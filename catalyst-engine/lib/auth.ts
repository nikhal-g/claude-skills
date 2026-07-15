import { cookies } from "next/headers";
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  insertUser,
  getUserByEmail,
  getUserById,
  insertSession,
  getSession,
  deleteSession,
  type DbUser,
} from "./db";

const SESSION_COOKIE = "session_id";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionUser {
  id: string;
  email: string;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export class AuthError extends Error {}

export function createUser(email: string, password: string): DbUser {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) throw new AuthError("Enter a valid email address.");
  if (password.length < 8) throw new AuthError("Password must be at least 8 characters.");
  if (getUserByEmail(normalized)) throw new AuthError("An account with that email already exists.");

  const user: DbUser = {
    id: randomUUID(),
    email: normalized,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  };
  insertUser(user);
  return user;
}

export function authenticateUser(email: string, password: string): DbUser {
  const normalized = email.trim().toLowerCase();
  const user = getUserByEmail(normalized);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new AuthError("Incorrect email or password.");
  }
  return user;
}

export async function startSession(userId: string): Promise<void> {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  insertSession(sessionId, userId, expiresAt.toISOString());

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (sessionId) deleteSession(sessionId);
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = getSession(sessionId);
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) {
    deleteSession(sessionId);
    return null;
  }

  const user = getUserById(session.user_id);
  if (!user) return null;
  return { id: user.id, email: user.email };
}
