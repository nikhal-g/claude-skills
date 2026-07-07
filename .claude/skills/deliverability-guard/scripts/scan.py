#!/usr/bin/env python3
"""
Deliverability Guard — scans cold email copy for spam signals.

Usage:
    python .claude/skills/deliverability-guard/scripts/scan.py --file draft.txt
    echo "Subject: Free offer inside!" | python .claude/skills/deliverability-guard/scripts/scan.py --stdin

Exit codes:
    0 — PASS (no flags)
    1 — FAIL (flags found)
"""

import sys
import re
import argparse
from pathlib import Path

# ── Ban lists (from SKILL.md) ─────────────────────────────────────────────────

BANNED_WORDS = {
    "guarantee", "guaranteed", "instant", "instantly",
    "limited", "urgent", "exclusive", "risk-free", "riskfree",
    "obligation", "cash", "bonus", "discount", "free", "credit",
    "investment", "profit", "earn", "income", "amazing", "incredible",
    "unbelievable", "fantastic", "winner", "congratulations",
    "miracle", "cure", "supplement",
}

BANNED_PHRASES = [
    "act now",
    "limited time offer",
    "while supplies last",
    "today only",
    "don't miss out",
    "last chance",
    "final notice",
    "100% free",
    "100% guaranteed",
    "double your money",
    "no cost or obligation",
    "cash bonus",
    "extra income",
    "you have been selected",
    "congratulations winner",
    "secret formula",
    "lose weight fast",
    "verify your account",
    "click here now",
    "update your payment",
    "confirm your details",
    "password reset",
    "i hope this email finds you",
    "hope you're having a great week",
    "i came across your profile",
    "just wanted to reach out",
    "increase revenue",
    "amazing opportunity",
]

HIGH_RISK_PATTERNS = [
    (r"\b[A-Z]{3,}\b", "ALL CAPS word"),
    (r"!{2,}", "Multiple exclamation marks"),
    (r"\${1,}", "Dollar sign (financial spam signal)"),
    (r"\d+\s*%\s*off", "Percentage off (discount spam)"),
    (r"save\s+\$\d+", "Save $X pattern"),
    (r"reply\s+stop", "Unsubscribe instruction"),
    (r"http[s]?://bit\.ly|tinyurl|t\.co|goo\.gl", "Short link / link masker"),
    (r"--", "Em dash"),
]

BANNED_SUBJECT_PATTERNS = [
    (r"^re:\s*\S", "Fake reply thread (Re: ...)"),
    (r"^fw:\s*\S", "Fake forward (Fw: ...)"),
    (r"\bfree\b", "'Free' in subject"),
    (r"\d+\s*%", "Percentage in subject"),
    (r"\$\d+", "Dollar amount in subject"),
    (r"[A-Z]{3,}", "ALL CAPS in subject"),
    (r"!{1,}", "Exclamation in subject"),
]

BANNED_UNSUBSCRIBE = [
    "i'll take silence as a no",
    "if i don't hear back, i'll leave you alone",
    "no reply means no interest",
    "i'll assume this isn't a fit",
]


# ── Scanner ──────────────────────────────────────────────────────────────────

def scan_text(text: str) -> list[dict]:
    flags = []
    lines = text.splitlines()

    # Detect subject line (first non-blank line starting with "Subject:")
    subject_line = None
    body_lines = []
    for line in lines:
        if line.lower().startswith("subject:") and subject_line is None:
            subject_line = line[len("subject:"):].strip()
        else:
            body_lines.append(line)

    # Subject-line checks
    if subject_line:
        for pattern, label in BANNED_SUBJECT_PATTERNS:
            if re.search(pattern, subject_line, re.IGNORECASE):
                flags.append({"severity": "HIGH", "type": "subject_pattern", "detail": label, "line": f"Subject: {subject_line}"})

    # Banned single words (with hyphen-split detection)
    for i, line in enumerate(lines, 1):
        clean_line = re.sub(r"[-_]", " ", line.lower())
        words = re.findall(r"\b\w+\b", clean_line)
        for word in words:
            if word in BANNED_WORDS:
                flags.append({"severity": "HIGH", "type": "banned_word", "detail": f"banned word: '{word}'", "line": line.strip()})
                break  # one flag per line for words

    # Banned phrases
    text_lower = text.lower()
    for phrase in BANNED_PHRASES:
        if phrase in text_lower:
            flags.append({"severity": "HIGH", "type": "banned_phrase", "detail": f"banned phrase: '{phrase}'", "line": phrase})

    # High-risk patterns
    for i, line in enumerate(lines, 1):
        for pattern, label in HIGH_RISK_PATTERNS:
            if re.search(pattern, line):
                flags.append({"severity": "MEDIUM", "type": "high_risk_pattern", "detail": label, "line": line.strip()})

    # Unsubscribe line violations
    for banned in BANNED_UNSUBSCRIBE:
        if banned in text_lower:
            flags.append({"severity": "HIGH", "type": "unsubscribe_violation", "detail": f"silence-conditional unsubscribe: '{banned}'", "line": banned})

    # Deduplicate — same detail + line
    seen = set()
    unique_flags = []
    for f in flags:
        key = (f["detail"], f["line"][:60])
        if key not in seen:
            seen.add(key)
            unique_flags.append(f)

    return unique_flags


def print_report(flags: list[dict], source: str) -> None:
    print()
    print("DELIVERABILITY SCAN REPORT")
    print("=" * 40)
    print(f"Source: {source}")
    print()
    if not flags:
        print("RESULT: PASS — no deliverability flags found.")
        print()
        return

    high = [f for f in flags if f["severity"] == "HIGH"]
    medium = [f for f in flags if f["severity"] == "MEDIUM"]

    print(f"RESULT: FAIL — {len(flags)} flag(s) found ({len(high)} HIGH, {len(medium)} MEDIUM)")
    print()

    if high:
        print("HIGH SEVERITY:")
        for f in high:
            print(f"  [{f['type']}] {f['detail']}")
            print(f"    → \"{f['line'][:80]}\"")
        print()
    if medium:
        print("MEDIUM SEVERITY:")
        for f in medium:
            print(f"  [{f['type']}] {f['detail']}")
            print(f"    → \"{f['line'][:80]}\"")
        print()

    print("ACTION: Rewrite flagged lines before sending.")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(description="Scan cold email copy for deliverability flags")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--file", help="Path to email draft (.txt)")
    group.add_argument("--stdin", action="store_true", help="Read from stdin")
    args = parser.parse_args()

    if args.stdin:
        text = sys.stdin.read()
        source = "stdin"
    else:
        path = Path(args.file)
        if not path.exists():
            print(f"Error: {path} not found")
            sys.exit(1)
        text = path.read_text(encoding="utf-8")
        source = path.name

    flags = scan_text(text)
    print_report(flags, source)
    sys.exit(0 if not flags else 1)


if __name__ == "__main__":
    main()
