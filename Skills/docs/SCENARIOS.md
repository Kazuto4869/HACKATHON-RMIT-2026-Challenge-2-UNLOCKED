# Decision tree & scenario playbooks

Only choose a scenario after reading the organizer's *actual* input/output/evaluation requirements.

## 0. Scenario selector

1. Is required output a CSV of predictions? → A/B/D depending on data type.
2. Is required output generated text / grounded answers / API responses? → C.
3. Is objective to detect risky prompts or improve defense? → E.
4. Is objective to *evaluate* adversarial robustness on organizers' permitted model? → F.
5. Is output a usable application, URL, or demo? → G.
6. Mixed tasks? Identify required deliverables and score weighting, get a minimal artifact for **each** before specialized optimization.

## A. Tabular or text binary/multiclass classification
- Inspect train/test/sample and target distribution; stratified split if IID and feasible. Group split if duplicated conversations/users; temporal split when future data is evaluated.
- CPU baseline: majority class / simple constant sanity check, then TF-IDF word + character n-grams + Logistic Regression for text; imputation + simple linear/tree model for tabular.
- Metric: use stated competition metric *only*. ROC-AUC uses probabilities and requires correct positive class; F1 needs labels/threshold; log loss requires probabilities and class mapping; accuracy depends on class balance.
- Improvements: language stratification, char n-grams, class weighting (when useful), hyperparameter search on local validation, calibration, multilingual encoder if compute permitted.
- Tests: shape, duplicates, exact sample schema, finite predictions, correct class probabilities, no train/test label leaks.
- Stop: valid baseline + reliable validation + one targeted improvement outperforming baseline across relevant slices.

## B. Multilingual / low-resource classification
- Start with EDA per language: count, script, lengths, missing labels, transliteration, imbalance, code-switching. Avoid language-agnostic normalization that deletes diacritics or non-Latin text.
- Fast baseline: Unicode-safe char n-grams 2–5 + linear classifier (small data); simple multilingual pretrained encoder only if available and rules permit.
- Validation: keep language proportions representative; if target is unseen language, hold out an entire language instead of random samples. Also report worst-language and macro metrics.
- Improvements: multilingual embeddings, language-adapted prompt templates, carefully validated augmentation, threshold tuning per language only if permitted and justified.
- Failure modes: tokenization, diacritics, script, translation artifacts, label drift, data leakage across translated duplicates.

## C. RAG / grounded generative QA
- Contract: exact question and response schema, allowed documents, citations, expected sources, language, latency, model/APIs.
- Fast baseline: searchable chunks (BM25 or local TF-IDF retrieval) + top-k evidence + conservative grounded prompt. If API disallowed, use extractive answer/evidence ranking with explicit limitations.
- Eval: answer correctness and retrieval recall; cite support; measure hallucinations/refusal appropriately, separately per language.
- Upgrades: hybrid retrieval, reranking, chunk sizes, multilingual query rewrite, evidence verification. Never assume ground truth exists without checking.
- Defend against instructions embedded in retrieved documents; treat retrieved text as untrusted data; run injection regression tests.
- No external model/API? Use permitted local model or extractive baseline; disclose capability gap.

## D. Translation, normalization, or language generation
- Establish expected output language/script, exact-match vs semantic metric, allowed reference data, tolerance for paraphrases.
- Fast baseline: supplied pretrained multilingual model or organizers' starter; no access → simple rules or candidate retrieval, only if suitable.
- Evaluate semantic adequacy, terminology, rare names, numbers, safety instructions and hallucinations. Report per-language slices.
- Never silently translate test labels or call external services against the rules.

## E. Prompt-injection / jailbreak detection or defense
- Determine what is labeled: malicious intent, attack technique, successful override, unsafe *output* or a broader risk class. These are different targets.
- Baseline: exact input boundary/role handling, simple lexical risk signals + supervised classifier if labels exist. If defending an app, system instructions and strict retrieval/tool trust boundaries with allowlisted actions.
- Eval: false positives on benign quotes/academic samples; false negatives on multilingual, indirect, obfuscated attempts. Precision/recall by language and attack category.
- Do not evaluate a detector solely using hand-picked attacks designed by its builder; keep a held-out attack set.

## F. Authorized adversarial robustness evaluation
- Verify organizers explicitly authorize target models and scope. Limit tests to competition sandbox and documented API limits.
- Build test matrix: attack family × language × prompt context × defense version. Use benign controls.
- Log exact input hashes, model version, judge rubric and outputs when permitted. Human-review borderline success cases; never claim attack success using model self-grading alone.
- Metric: ASR = successful authorized attempts / valid attempts, provided a reliable success rubric exists. Report sample size and confidence limits when feasible.
- Defensive iteration: propose boundary handling, input filtering, output checks, tests; do not expose credentials or real targets.

## G. Vibe coding / web-app challenge
- First 30–60 min: map rubric to MVP, user journey, one vertical slice, working build, fallback demo. Avoid premature animation and component proliferation.
- Codex: core logic and API contracts; AGY: UI and browser-level QA in own branch/worktree.
- Eval: rubric criteria, accessibility basics, responsive layout, loading/error/empty states, keyboard if relevant, deterministic demo, no hardcoded secrets.
- Deliverables: running app, README with local run commands, screenshots/video only if requested, architecture, known issues and provenance of dependencies.
- If browser/network blocked: use a static local HTML/CSS/JS MVP with no external CDNs or build dependencies.

## Common emergency branches

| Condition | Action in first 10 minutes | Do not do |
|---|---|---|
| No GPU / small RAM | CPU TF-IDF / compact sklearn model / retrieval baseline; estimate memory on sample | Download 7B+ model blindly |
| No Internet | Use installed packages and permitted local resources; vendor only allowed assets | Depend on remote CDN/API |
| No labeled training set | Study scoring; use rule baseline / zero-shot only if model and API permitted; build tests from organizer examples | Make up labels as verified truth |
| Few samples | Group-aware cross-validation where appropriate; use confidence intervals and conservative models | Overfit hundreds of experiments |
| Very imbalanced labels | Stratified split; PR-AUC/F1 as applicable; threshold only with validation | Treat accuracy as sufficient |
| Multilingual unseen language | Language-held-out evaluation; Unicode-safe character models | Use random split across near-duplicates |
| Kaggle runtime timeout | Cache approved representations, shrink features, keep last valid version | Rebuild entire pipeline at deadline |
| API failure / rate limits | Retry with bounded backoff if rules permit; offline fallback; save logs without keys | Share tokens in Git/issues |
| Low leaderboard score | Verify metric, labels, submission orientation, validation drift | Submit random tweaks repeatedly |
| Conflicting requirements | Quote exact conflict and escalate to organizer/mentor; implement most conservative valid baseline | Invent a rule to resolve it |


## H. Low-Resource Languages branch (v4)

Follow `docs/LRL_SCENARIOS.md`. Seven dedicated lrl_* scenarios. Do not treat sparse labeled examples as equivalent to unsupported languages.
