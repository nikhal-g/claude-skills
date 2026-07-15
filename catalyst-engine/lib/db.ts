// Persistence layer — Node's built-in node:sqlite, no native deps, no ORM.
//
// This is a development/demo datastore: the .db file lives on local disk, which
// does not persist across invocations on serverless platforms (Vercel/Netlify
// functions have ephemeral filesystems). Swapping to a hosted Postgres (Neon,
// Supabase) or libSQL/Turso for production means replacing this file's guts —
// every caller goes through the functions below, not raw SQL, to keep that swap
// contained to one file.

import { DatabaseSync } from "node:sqlite";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "catalyst.db");

if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

const globalForDb = globalThis as unknown as { catalystDb?: DatabaseSync };

export const db = globalForDb.catalystDb ?? new DatabaseSync(DB_PATH);
if (!globalForDb.catalystDb) globalForDb.catalystDb = db;

// WAL + a busy timeout let Next's parallel build workers (each importing this
// module independently) wait for the schema-creation lock instead of erroring
// out with SQLITE_BUSY the instant two of them touch the file at once.
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA busy_timeout = 5000");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS grade_runs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    filename TEXT,
    overall_grade TEXT NOT NULL,
    total_leads INTEGER NOT NULL,
    ready_to_send INTEGER NOT NULL,
    report_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scan_runs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    pass INTEGER NOT NULL,
    flag_count INTEGER NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sequence_runs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    lead_count INTEGER NOT NULL,
    ok_count INTEGER NOT NULL,
    results_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS offer_runs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    icp TEXT NOT NULL,
    recommended_primary TEXT NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS competitor_runs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    competitor_name TEXT NOT NULL,
    url TEXT NOT NULL,
    result_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leadmagnet_runs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    topic TEXT NOT NULL,
    title TEXT NOT NULL,
    step_count INTEGER NOT NULL,
    markdown TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_grade_runs_user ON grade_runs(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_scan_runs_user ON scan_runs(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_sequence_runs_user ON sequence_runs(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_offer_runs_user ON offer_runs(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_competitor_runs_user ON competitor_runs(user_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_leadmagnet_runs_user ON leadmagnet_runs(user_id, created_at DESC);
`);

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export function insertUser(user: DbUser): void {
  db.prepare(
    "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)"
  ).run(user.id, user.email, user.password_hash, user.created_at);
}

export function getUserByEmail(email: string): DbUser | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as DbUser | undefined;
}

export function getUserById(id: string): DbUser | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as DbUser | undefined;
}

export function insertSession(id: string, userId: string, expiresAt: string): void {
  db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
  ).run(id, userId, expiresAt, new Date().toISOString());
}

export function getSession(id: string): { user_id: string; expires_at: string } | undefined {
  return db.prepare("SELECT user_id, expires_at FROM sessions WHERE id = ?").get(id) as
    | { user_id: string; expires_at: string }
    | undefined;
}

export function deleteSession(id: string): void {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
}

export function insertGradeRun(row: {
  id: string;
  userId: string;
  filename: string | null;
  overallGrade: string;
  totalLeads: number;
  readyToSend: boolean;
  reportJson: string;
}): void {
  db.prepare(
    `INSERT INTO grade_runs (id, user_id, filename, overall_grade, total_leads, ready_to_send, report_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    row.id,
    row.userId,
    row.filename,
    row.overallGrade,
    row.totalLeads,
    row.readyToSend ? 1 : 0,
    row.reportJson,
    new Date().toISOString()
  );
}

export function listGradeRuns(userId: string, limit = 10) {
  return db
    .prepare(
      `SELECT id, filename, overall_grade, total_leads, ready_to_send, created_at
       FROM grade_runs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(userId, limit);
}

export function insertScanRun(row: {
  id: string;
  userId: string;
  pass: boolean;
  flagCount: number;
  resultJson: string;
}): void {
  db.prepare(
    `INSERT INTO scan_runs (id, user_id, pass, flag_count, result_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(row.id, row.userId, row.pass ? 1 : 0, row.flagCount, row.resultJson, new Date().toISOString());
}

export function listScanRuns(userId: string, limit = 10) {
  return db
    .prepare(
      `SELECT id, pass, flag_count, created_at FROM scan_runs
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(userId, limit);
}

export function insertSequenceRun(row: {
  id: string;
  userId: string;
  leadCount: number;
  okCount: number;
  resultsJson: string;
}): void {
  db.prepare(
    `INSERT INTO sequence_runs (id, user_id, lead_count, ok_count, results_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(row.id, row.userId, row.leadCount, row.okCount, row.resultsJson, new Date().toISOString());
}

export function listSequenceRuns(userId: string, limit = 10) {
  return db
    .prepare(
      `SELECT id, lead_count, ok_count, created_at FROM sequence_runs
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(userId, limit);
}

export function insertOfferRun(row: {
  id: string;
  userId: string;
  icp: string;
  recommendedPrimary: string;
  resultJson: string;
}): void {
  db.prepare(
    `INSERT INTO offer_runs (id, user_id, icp, recommended_primary, result_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(row.id, row.userId, row.icp, row.recommendedPrimary, row.resultJson, new Date().toISOString());
}

export function listOfferRuns(userId: string, limit = 10) {
  return db
    .prepare(
      `SELECT id, icp, recommended_primary, created_at FROM offer_runs
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(userId, limit);
}

export function insertCompetitorRun(row: {
  id: string;
  userId: string;
  competitorName: string;
  url: string;
  resultJson: string;
}): void {
  db.prepare(
    `INSERT INTO competitor_runs (id, user_id, competitor_name, url, result_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(row.id, row.userId, row.competitorName, row.url, row.resultJson, new Date().toISOString());
}

export function listCompetitorRuns(userId: string, limit = 10) {
  return db
    .prepare(
      `SELECT id, competitor_name, url, created_at FROM competitor_runs
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(userId, limit);
}

export function insertLeadMagnetRun(row: {
  id: string;
  userId: string;
  topic: string;
  title: string;
  stepCount: number;
  markdown: string;
}): void {
  db.prepare(
    `INSERT INTO leadmagnet_runs (id, user_id, topic, title, step_count, markdown, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(row.id, row.userId, row.topic, row.title, row.stepCount, row.markdown, new Date().toISOString());
}

export function listLeadMagnetRuns(userId: string, limit = 10) {
  return db
    .prepare(
      `SELECT id, topic, title, step_count, created_at FROM leadmagnet_runs
       WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .all(userId, limit);
}

export interface OverviewStats {
  gradeRuns: number;
  scanRuns: number;
  sequenceRuns: number;
  offerRuns: number;
  competitorRuns: number;
  leadMagnetRuns: number;
  lastActivity: string | null;
}

export function getOverviewStats(userId: string): OverviewStats {
  const count = (table: string): number => {
    const row = db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE user_id = ?`).get(userId) as
      | { c: number }
      | undefined;
    return row?.c ?? 0;
  };
  const tables = ["grade_runs", "scan_runs", "sequence_runs", "offer_runs", "competitor_runs", "leadmagnet_runs"];
  let lastActivity: string | null = null;
  for (const t of tables) {
    const row = db.prepare(`SELECT MAX(created_at) as m FROM ${t} WHERE user_id = ?`).get(userId) as
      | { m: string | null }
      | undefined;
    if (row?.m && (!lastActivity || row.m > lastActivity)) lastActivity = row.m;
  }
  return {
    gradeRuns: count("grade_runs"),
    scanRuns: count("scan_runs"),
    sequenceRuns: count("sequence_runs"),
    offerRuns: count("offer_runs"),
    competitorRuns: count("competitor_runs"),
    leadMagnetRuns: count("leadmagnet_runs"),
    lastActivity,
  };
}
