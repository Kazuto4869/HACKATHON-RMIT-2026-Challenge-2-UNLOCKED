# RMIT 2026 live brief — VERIFIED C1 user-supplied competition text (2026-10-22)

## C1: Multilingual Prompt-Attack Classification
- Only three labels: `BENIGN`, `JAILBREAK`, `PROMPT_INJECTION`.
- Languages: Portuguese, French, Italian and English. AI safety is relatively low-resource in the first three languages.
- Train: **14,000** rows (`id,text,language,label`). Test: **6,000** rows.
- **Fine-tune exactly one approved pretrained backbone** from the official ten-model whitelist; no other pretrained backbone allowed. Model must be declared at TOP of notebook.
- **Evaluation: macro-F1**, equally weighting all three classes; class imbalance reported: benign 62%, jailbreak 31%, prompt injection 7%.
- Submit `id,label` CSV exactly 6,000 rows, original test ID order, exactly one of three uppercase class names. **6 total submissions**.
- First valid submission earns full C1 completion marks; then leaderboard optimization is optional.
- Competition page: https://www.kaggle.com/competitions/rmit-hackathon-2026
- Kaggle model source: https://www.kaggle.com/models/aisuko/xlm-roberta-base/Transformers/default
- Kaggle demo notebook: https://www.kaggle.com/code/aisuko/rmit-sgs-demo-c1
- Team notebook convention: `<university>_<campus>_<team>_C1`.
- Deadline on organizer slides: 22 Oct 2026 at 18:00 Vietnam time.

## Required correction to older toolkit
**DO NOT submit standalone TF-IDF/LogisticRegression as C1 final model.** It does not fine-tune an approved backbone. Existing `tools/lrl_multiclass_baseline.py` is diagnostic experimentation **only**, not a rule-compliant submission model.
The Kaggle deliverable is `submission.csv`. A Kaggle Notebook can be used to train/create it and can be named using the prescribed convention.

## C2 (separate)
TideClock MCP integration / app challenge; handle separately after explicit request.
