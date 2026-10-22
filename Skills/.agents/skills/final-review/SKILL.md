---
name: final-review
description: Independent release check of Kaggle predictions, ML validity, security/rules compliance, web demo and reproducibility before deadline.
---

# Independent review

1. Read actual brief, AGENTS.md, experiment log and output contract.
2. Audit changes and verify commands or reproducing tests. Do not report unrun commands as passed.
3. Recheck scoring implementation, positive class direction, dataset leakage and language slices.
4. Inspect sample vs submission exactly, run `tools/validate_submission.py` where applicable.
5. For apps, smoke test browser flow, build and error states if tooling available.
6. Report severity-ranked blockers, warnings, evidence and GO/NO-GO.
7. Do not change core files or submit without explicit human approval.
