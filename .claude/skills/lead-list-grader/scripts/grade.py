#!/usr/bin/env python3
"""
Lead List Grader — skill script entry point.
Delegates to catalyst-pipeline/scripts/list_grader.py.

Usage (from workspace root):
    python .claude/skills/lead-list-grader/scripts/grade.py --input inputs/apollo_export.csv

Exit codes:
    0 — A or B (safe to send)
    1 — C, D, or F (do not send)
"""

import sys
from pathlib import Path

# Point at the pipeline implementation — one source of truth
pipeline_root = Path(__file__).parent.parent.parent.parent.parent / "catalyst-pipeline"
sys.path.insert(0, str(pipeline_root))

try:
    from scripts.list_grader import main  # type: ignore[import]
except ImportError as e:
    print(f"Error: catalyst-pipeline not found. Expected at: {pipeline_root}")
    print(f"  {e}")
    sys.exit(1)

if __name__ == "__main__":
    main()
