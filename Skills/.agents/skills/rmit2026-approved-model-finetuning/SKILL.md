---
name: rmit2026-approved-model-finetuning
description: Fine-tune a single competition-approved multilingual encoder for RMIT Hackathon 2026 C1, evaluate macro-F1, and generate validated id,label CSV.
---
# Approved Backbone Fine-Tuning for RMIT 2026 C1

## Trigger
Use on the official Challenge 1 prompt attack classification, Portuguese/French/Italian/English, exactly three labels.

## Required source
`docs/RMIT_2026_LIVE_BRIEF.md`, `config/rmit_2026_c1_official_rules.json`, competition model attachment and actual CSV. Official competition rules override stale examples.

## Hard constraints
1. Declare exact backbone at TOP of notebook. Must be from approved ten-model list and mount Kaggle-provided weights. Do **not** use TF-IDF-only or non-approved pretrained models as final submission.
2. Fine-tune the chosen backbone on labeled train.csv. One approved model per final solution. Avoid ensemble ambiguity.
3. Evaluate macro-averaged F1 (three equal-weight classes), report per-class and per-language and leakage caveats.
4. Class distribution approx BENIGN 62%, JAILBREAK 31%, PROMPT_INJECTION 7%; test if inverse-sqrt or other weighted CE improves local macro-F1.
5. Output strict CSV with `id,label`, 6000 rows, exact IDs/order and uppercase labels. Only six submission attempts.
6. Use approved local Kaggle model path with `local_files_only=True`; record environment versions and GPU.

## Workflow
- Audit language x class and duplicate/near-duplicate candidates. Verify actual paths and schema.
- Split stratified by language x label if feasible; check translated/template families are not split.
- Build an encoder classifier with `AutoModelForSequenceClassification` and `num_labels=3`; local path only.
- Train with fixed seed and safe GPU settings; preserve best validation macro-F1 checkpoint.
- Measure per-language macro-F1, class confusion and low-frequency class recall.
- Predict 6000 test rows; run `tools/c1_submission_validator.py` before any Kaggle submission.
- Write `experiment_log.md` with current model, config, local metric and submission counter.

## Deliverables
Kaggle Notebook + `submission.csv` + evaluation report + reproducible model declaration + QA confirmation.
