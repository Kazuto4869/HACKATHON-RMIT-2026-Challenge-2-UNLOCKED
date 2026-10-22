---
name: validate-submission
description: Check Kaggle submission CSV headers, order, row count, ID alignment, numeric/probability values and official contract before upload.
---

# Validate output

1. Read official brief, actual `sample_submission.csv` and prediction file.
2. Check headers exactly, order, duplicate columns, row count, missing values; align ID values in exact order when required.
3. Run `python tools/validate_submission.py --sample <sample> --prediction <candidate> [--id-column id] [--prob-columns target]`.
4. Probability range [0,1] and finite values apply **only** to columns verified to be probabilities; do not reject valid unrestricted regression scores.
5. Manually check class semantics, metric and organizer-specific restrictions that a generic CSV validator cannot determine.
6. Report GO/NO-GO, explicit failures and verification evidence. Do not submit automatically.
