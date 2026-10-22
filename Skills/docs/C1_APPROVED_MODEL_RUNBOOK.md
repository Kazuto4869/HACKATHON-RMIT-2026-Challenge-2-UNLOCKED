# C1 Approved-Model Runbook — 2026-10-22

## Official constraints
See `config/rmit_2026_c1_official_rules.json`. The official text supplied by the participant explicitly requires fine-tuning ONE approved model. The previous generic TF-IDF baseline is no longer valid as a C1 submission.

## Model choice
- **Primary:** `FacebookAI/xlm-roberta-base`; pretrained weights MUST come from the competition Kaggle Models tab.
- **Fast fallback:** `distilbert/distilbert-base-multilingual-cased` only when the primary model fails on time/resources. Update the model declaration, mount path and notebook accordingly; do not relabel a DistilBERT run as XLM-R.
- Do not assume safety-tuned English-oriented backbones outperform multilingual encoders on Portuguese/French/Italian. Measure macro-F1 locally.
- Do not ensemble backbones without clarification from organizers; wording says ONE approved model.

## Team of four
- A: data + split + label/language breakdown + near-duplicate audit.
- B: approved XLM-R training owner, owns `notebooks/C1_XLMR_Approved_Finetune.ipynb`.
- C: experiment owner: class weighting / hyperparameter search and error analysis **without editing B's notebook**.
- D: QA + Kaggle account/team, versioned save, `submission.csv` validation, owns submission button.

## Order of execution
1. Add competition dataset and XLM-R approved Kaggle Model into Kaggle Notebook (internet not needed).
2. Notebook must declare chosen model at the very top.
3. Execute import/path audit, inspect labels + languages and grouped duplication risk.
4. Stratified holdout by `language × label` where possible; otherwise `label` with warning.
5. Fine-tune sequence classifier with 3 outputs. Suggested starting settings: max_length 256, LR 2e-5, train batch 16 (reduce to 8 if out of memory), 2 epochs, seed 42, sqrt-inverse-frequency class weights. These are **tuning hypotheses**, not guaranteed optimal.
6. Evaluate exact macro-F1, per-class F1 and per-language F1. Inspect rare `PROMPT_INJECTION` recall and false positives from benign samples.
7. Predict test classes and output only `id,label`; run validator and notebook full clean run.
8. Submit only when validator passes. Record local score, Kaggle score, model/config/seed and submission number.

## Six-submission budget (proposal)
1. First compliant XLM-R trained baseline.
2. Improved class weights / selected checkpoint.
3. Controlled threshold adjustment only if validation shows benefit (still same backbone).
4. Better model from whitelist **only if treated as independent single-backbone submission**.
5. Best re-trained single approved model.
6. Emergency final bugfix or best backup.

This is a plan, not a requirement to spend all six submissions. A valid first submission already achieves completion marks.

## Evidence and limitations
User's downloaded CSVs were **not attached** to this conversation. Dataset schema and row counts are known from copied official rules, not programmatically inspected. Notebook is syntactically validated but not GPU-trained or Kaggle-submitted in this environment.
