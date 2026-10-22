---
name: build-baseline
description: Implement the first reproducible Kaggle ML or API baseline, validate it locally and create a compliant candidate output.
---

# Build baseline with evidence

1. Require actual official brief, train/test and sample output; if missing, build only a generic template and label it unverified.
2. Run exploratory checks; optionally `python tools/inspect_data.py --train ... --test ...`.
3. Choose the simplest method from `docs/SCENARIOS.md` matching the output and metric.
4. Use validation design from `docs/EVALUATION.md`; prevent fit-on-validation and duplicate leakage.
5. Implement a single deterministic pipeline; no exotic dependencies absent justification.
6. Run it on available data, record metric, split seed and actual runtime; don't invent benchmark numbers.
7. Produce candidate output matching the official sample. Run validator (specifying only probability columns as such).
8. Record exact reproduction commands and a known-good result before iterative improvements.
