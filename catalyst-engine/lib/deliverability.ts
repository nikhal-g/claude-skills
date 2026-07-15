// Deliverability Guard — ported from .claude/skills/deliverability-guard/scripts/scan.py
// Deterministic rule engine, no model call. Same ban lists and patterns as the source script.

export type Severity = "HIGH" | "MEDIUM";

export interface Flag {
  severity: Severity;
  type: string;
  detail: string;
  line: string;
}

const BANNED_WORDS = new Set([
  "guarantee", "guaranteed", "instant", "instantly",
  "limited", "urgent", "exclusive", "risk-free", "riskfree",
  "obligation", "cash", "bonus", "discount", "free", "credit",
  "investment", "profit", "earn", "income", "amazing", "incredible",
  "unbelievable", "fantastic", "winner", "congratulations",
  "miracle", "cure", "supplement",
]);

const BANNED_PHRASES = [
  "act now", "limited time offer", "while supplies last", "today only",
  "don't miss out", "last chance", "final notice", "100% free",
  "100% guaranteed", "double your money", "no cost or obligation",
  "cash bonus", "extra income", "you have been selected",
  "congratulations winner", "secret formula", "lose weight fast",
  "verify your account", "click here now", "update your payment",
  "confirm your details", "password reset", "i hope this email finds you",
  "hope you're having a great week", "i came across your profile",
  "just wanted to reach out", "increase revenue", "amazing opportunity",
];

const HIGH_RISK_PATTERNS: [RegExp, string][] = [
  [/\b[A-Z]{3,}\b/, "ALL CAPS word"],
  [/!{2,}/, "Multiple exclamation marks"],
  [/\${1,}/, "Dollar sign (financial spam signal)"],
  [/\d+\s*%\s*off/i, "Percentage off (discount spam)"],
  [/save\s+\$\d+/i, "Save $X pattern"],
  [/reply\s+stop/i, "Unsubscribe instruction"],
  [/http[s]?:\/\/bit\.ly|tinyurl|t\.co|goo\.gl/i, "Short link / link masker"],
  [/--/, "Em dash"],
];

const BANNED_SUBJECT_PATTERNS: [RegExp, string][] = [
  [/^re:\s*\S/i, "Fake reply thread (Re: ...)"],
  [/^fw:\s*\S/i, "Fake forward (Fw: ...)"],
  [/\bfree\b/i, "'Free' in subject"],
  [/\d+\s*%/, "Percentage in subject"],
  [/\$\d+/, "Dollar amount in subject"],
  [/[A-Z]{3,}/, "ALL CAPS in subject"],
  [/!{1,}/, "Exclamation in subject"],
];

const BANNED_UNSUBSCRIBE = [
  "i'll take silence as a no",
  "if i don't hear back, i'll leave you alone",
  "no reply means no interest",
  "i'll assume this isn't a fit",
];

export function scanText(text: string): Flag[] {
  const flags: Flag[] = [];
  const lines = text.split(/\r\n|\r|\n/);

  let subjectLine: string | null = null;
  for (const line of lines) {
    if (subjectLine === null && line.toLowerCase().startsWith("subject:")) {
      subjectLine = line.slice("subject:".length).trim();
    }
  }

  if (subjectLine) {
    for (const [pattern, label] of BANNED_SUBJECT_PATTERNS) {
      if (pattern.test(subjectLine)) {
        flags.push({ severity: "HIGH", type: "subject_pattern", detail: label, line: `Subject: ${subjectLine}` });
      }
    }
  }

  for (const line of lines) {
    const cleanLine = line.toLowerCase().replace(/[-_]/g, " ");
    const words = cleanLine.match(/\b\w+\b/g) || [];
    for (const word of words) {
      if (BANNED_WORDS.has(word)) {
        flags.push({ severity: "HIGH", type: "banned_word", detail: `banned word: '${word}'`, line: line.trim() });
        break;
      }
    }
  }

  const textLower = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (textLower.includes(phrase)) {
      flags.push({ severity: "HIGH", type: "banned_phrase", detail: `banned phrase: '${phrase}'`, line: phrase });
    }
  }

  for (const line of lines) {
    for (const [pattern, label] of HIGH_RISK_PATTERNS) {
      if (pattern.test(line)) {
        flags.push({ severity: "MEDIUM", type: "high_risk_pattern", detail: label, line: line.trim() });
      }
    }
  }

  for (const banned of BANNED_UNSUBSCRIBE) {
    if (textLower.includes(banned)) {
      flags.push({ severity: "HIGH", type: "unsubscribe_violation", detail: `silence-conditional unsubscribe: '${banned}'`, line: banned });
    }
  }

  const seen = new Set<string>();
  const unique: Flag[] = [];
  for (const f of flags) {
    const key = `${f.detail}|${f.line.slice(0, 60)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(f);
    }
  }

  return unique;
}
