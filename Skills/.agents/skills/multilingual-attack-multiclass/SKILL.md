---
name: multilingual-attack-multiclass
description: "Build, evaluate and package a multi-class multilingual prompt-attack classifier with exact organizer label and Kaggle Code requirements. Trigger: RMIT 2026 Challenge 1 or another multilingual multiclass attack classification task."
---

# Multilingual Prompt-Attack MULTICLASS Classification

**Use first for RMIT Hackathon 2026 Challenge 1**, based on the organizer slides shown on 22 Oct 2026. This is distinct from the previous binary benign/jailbreak exercise.

## Inputs (verify in official Kaggle competition before implementation)
- Evaluation tab: official metric, averaging, class definitions and valid output shape.
- Data files: exact text, language (if any), label, ID, group/translation-family columns.
- Starter Kaggle Code notebook and its required entry points, output artifact, filename and runtime environment.
- Approved pretrained model list, use of external datasets/API/Internet, GPU budget and fine-tuning rules.

## Procedure (Codex owner)
1. Stop if label taxonomy, metric or submission mechanism is unknown; record unknowns in `docs/CHALLENGE_BRIEF.md`. Inspect files; never assume 2025 binary formats.
2. Run `tools/lrl_data_audit.py` on train/test after identifying column names. Count samples per language × class, check missing, near/translated duplicates, code-switching, character script and imbalance.
3. Decide grouped validation if shared attack templates/conversations/translation families exist. Otherwise stratify by label with seed=42; avoid leaked prompt variants crossing folds.
4. Train baseline using `tools/lrl_multiclass_baseline.py` (char 2–5 gram TF-IDF + multinomial logistic regression as handled by scikit-learn). Optionally compare word-level TF-IDF; no model downloads by default.
5. Evaluate official metric separately once known. Additionally report per-class precision/recall/F1, confusion matrix, worst-language macro F1 and false positives on benign prompts. Report counts and missing-slice uncertainty.
6. Only fine-tune an explicitly approved multilingual transformer if the rules allow it, the data justify it and runtime feasibility is checked. Compare on the same validation folds. Save checkpoints reproducibly.
7. Inspect official Kaggle Code example before packaging. The provided CLI optionally exports a local CSV for debugging; this is NOT proof of a valid Kaggle Code submission. Run the exact competition notebook, validate outputs and make a human-reviewed final submission.

## AGY independent QA
- Challenge is **multiclass**; reject any two-class-only pipeline or binary ROC-AUC report used as official metric.
- Verify label mapping, class counts and alignment; ensure no class drops in training/validation.
- Check language slice support, macro F1, class imbalance, code mixing and benign false positives.
- Check approved models, licenses, local runtime, security boundaries and Kaggle Code requirements.

## Default profile
- Local CPU baseline, `seed=42`, `char_ngrams=(2,5)`, `max_features=120000`, group-aware split when groups exist, validation fraction 0.2 only when sensible.
- Mode `labels` initially; use `probabilities` only when sample columns truly represent class probabilities.
- Never infer label mapping from arbitrary column order, and do not submit automatically.

## Deliverables
- `docs/CHALLENGE_BRIEF.md` with verified facts, audit report, training script, holdout metrics by class and language, actual notebook code submission (if required), and final QA checklist.

## Quality gate
- Exact official metric + label schema verified, acceptable runtime, reproducible validation without known leakage, Kaggle Code submission structure tested.
