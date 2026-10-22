# FIRST 30 MINUTES — RMIT 2026 C1 (official requirements now known)

1. **00–05m (Lead):** Announce approved-model-only rule, macro-F1, 6 submissions, 14k train / 6k test. Confirm names and Kaggle team access.
2. **00–10m (Data):** Inspect real local `train.csv`, `test.csv`, language × label matrix, duplicate IDs, near-duplicates and exact class strings; report paths.
3. **00–10m (Trainer):** Create new Kaggle Notebook, attach competition data and Kaggle Model `aisuko/xlm-roberta-base` from **Models**. Enable GPU if available. Run imports and path-discovery cells.
4. **10–20m (Trainer):** Train approved XLM-R base with weighted cross-entropy, 2 epochs, 0.2 stratified validation. Track **macro-F1**, confusion matrix and per-language scores. Adjust only after seeing results.
5. **10–20m (QA):** Prepare submission validator: `python tools/c1_submission_validator.py --test test.csv --submission submission.csv`.
6. **20–30m (Release):** Generate `submission.csv`, verify 6k IDs + labels, save notebook version, submit **once** only after validation. Preserve remaining five submissions for verified improvements.

If GPU model training takes longer than planned, keep this ordering but change ETA; never submit fake labels as a supposed model result.
