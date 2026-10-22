# Low-Resource Language / LRL — Master Skills Guide (v4)

> This file governs low-resource NLP branches of the Hackathon toolkit. **Official challenge metric, data licenses, allowed hardware and submission instructions always take precedence**. These are engineering defaults, never announced RMIT specifications.

## What is low-resource?

Relative to a **language-task-domain combination**: scarce supervised examples, poor pretraining coverage, missing parallel corpora, few benchmarks, limited script/tokenizer support, low annotation capacity or insufficient compute. A language can be well-resourced for one task and scarce for another. Treat dialects, code-switching and input scripts as distinct sources of distribution shift.

## OFFICIAL RMIT 2026 Challenge 1 — multi-class prompt attack

The organizer slide on **22 October 2026** explicitly names `Multilingual Prompt-Attack Classification`, and the submission slide says `Classify multilingual multi-class prompt-attack` via **Kaggle Code** by 18:00 VN time that day. Exact labels, model allowlist, scoring metric and Kaggle Code interface **must be read from the actual competition**.

**Critical distinction:** `tools/lrl_classification_baseline.py` remains a binary-only *legacy exercise*; use the new `tools/lrl_multiclass_baseline.py` when C1 has 3+ labels. Neither command establishes an accepted Kaggle Code submission.

Recommended command after inspecting columns:

```bash
python tools/skill_plan.py --scenario rmit2026_c1_multiclass
python tools/lrl_multiclass_baseline.py \
  --train train.csv --test test.csv --sample sample_submission.csv \
  --text-column ACTUAL_TEXT_COL --target-column ACTUAL_LABEL_COL \
  --id-column ACTUAL_ID_COL --language-column ACTUAL_LANGUAGE_COL \
  --submission-mode labels --output local_submission.csv
```

Remove `--language-column` if absent, and use `--group-column ACTUAL_GROUP_COL` if translation/template families exist. Only use `--submission-mode probabilities` when explicitly required. The `--sample` parameter assumes a downloadable example CSV exists; **if the organizer only supplies a starter Kaggle Code notebook, adapt the notebook instead of inventing files**.

## Select by requested deliverable

| Challenge / deliverable | Primary scenario | Core local skills | Codex output | AGY QA |
|---|---|---|---|---|
| Sentiment / intent / jailbreak CSV | `lrl_classification` or `lrl_jailbreak` | `language-resource-triage`, `cross-lingual-transfer`, `low-resource-evaluation` | Reproducible char TF-IDF baseline, CSV | Minority-language recall/F1, benign FP, schema |
| NER / spans / slots | `lrl_ner` | `script-language-id`, `low-resource-ner`, `low-resource-evaluation` | Span/BIO conversion and predictor | Span alignment and exact F1 |
| MT / translate | `lrl_mt` | `parallel-corpus-mt`, `low-resource-translation` | Translation direction, model feasibility, inference | chrF/human spot-check, code/script correctness |
| Cross-lingual RAG / QA | `lrl_rag` | `multilingual-retrieval`, `rag-build`, `low-resource-evaluation` | Retrieval + grounded answer | Per-language recall and prompt injection isolation |
| Unlabeled or extremely small corpus | `lrl_no_labels` | `few-shot-annotation`, `cross-lingual-transfer` | Annotation spec and honest baseline | Gold vs pseudo labels, sample size uncertainty |
| Code mixing / orthography | `lrl_code_switch` | `script-language-id`, `code-switch-robustness` | Paired test fixtures | Label preservation and consistency |

## 13 added local skills — precise activation

| Skill | When | Default choice | Escalate only if |
|---|---|---|---|
| `multilingual-attack-multiclass` | RMIT C1 or any multilingual prompt-attack task with 3+ labels. | Verify real metric/classes + Kaggle Code; char n-gram linear baseline | Official score or approved model improves on fixed holdout |
| `language-resource-triage` | New language or ambiguous low-resource task; always before LRL branch. | No model until language/script/task inventory is verified | Standard baseline blocked or measured gap |
| `low-resource-corpus-curation` | Before training or augmenting with unlabeled/parallel data. | Immutable raw CSV, duplicate + license checks | Standard baseline blocked or measured gap |
| `script-language-id` | Multiple languages or scripts, OCR/transliteration, or code-switched data. | Derived NFC copy; preserve source + diacritics | Standard baseline blocked or measured gap |
| `cross-lingual-transfer` | Low-resource classification, few labels, related high-resource language. | CPU char TF-IDF (2–5) + linear model | Standard baseline blocked or measured gap |
| `few-shot-annotation` | Few or no trustworthy target-language labels and rules permit annotation. | Gold holdout frozen; 20 candidate items per batch (provisional) | Standard baseline blocked or measured gap |
| `low-resource-ner` | Output requires entity spans, BIO/BILOU tags or slot extraction. | Official entity span/label schema; no assumed metric | Standard baseline blocked or measured gap |
| `parallel-corpus-mt` | Machine translation or instruction translating between LRL pairs. | No auto-download; chrF is supplementary | Standard baseline blocked or measured gap |
| `backtranslation-augmentation` | Low labeled/parallel data AND permitted model inference and budget. | Disabled until evidence and permission | Standard baseline blocked or measured gap |
| `multilingual-retrieval` | Questions/documents are different languages, including LRL RAG. | Top-k=5 lexical first; embeddings optional | Standard baseline blocked or measured gap |
| `code-switch-robustness` | Users blend languages, spelling standards or scripts. | 10 paired fixtures per language pair to start | Standard baseline blocked or measured gap |
| `low-resource-evaluation` | Any multilingual/LRL task before model promotion or submission. | Primary official metric + macro-by-language; n<20 warning | Standard baseline blocked or measured gap |
| `low-resource-jailbreak-detection` | Challenge labels prompts by jailbreak, malicious override, or another security class across languages. | Verify positive label; benign controls and approved scope | Standard baseline blocked or measured gap |

## Operational defaults and why

- **Model first:** no default external model; start with character 2–5 gram TF-IDF + linear classifier for text labels. It is a reproducible CPU baseline, not a guaranteed winner.
- **Text:** keep original immutable; optional derived NFC column (reversible via original copy); preserve accents and joiners. Do not conflate dialect, script and language.
- **Data:** group translation siblings or related templates before splitting; for unseen-language generalization use language-held-out validation when consistent with the rubric.
- **Metrics:** primary organizer metric first; supplement with macro-by-language, per-language N and false positive/negative counts. Less than 20 labeled examples per slice is a **warning threshold**, not a formal significance test.
- **Machine translation:** do not default to NLLB download (large and non-commercial licensed). Check exact direction/language codes, task domain and benchmark rights. chrF is an auxiliary metric where suitable.
- **RAG:** start lexical and citations; optional cross-lingual embeddings only after language support, local availability and measured retrieval gain.
- **Synthetic augmentation:** disabled by default; train-only and provenance-tagged if turned on.
- **LLM security:** tests only against explicitly permitted scope; hold benign controls and code-switched adversarial examples apart.

## First 20 minutes after receiving the task

1. Read `docs/CHALLENGE_BRIEF.md`, inspect input columns and example outputs.
2. Build language × script × label × domain counts; run `python tools/lrl_data_audit.py --help`.
3. Freeze holdout strategy and test for duplicate/translation leakage.
4. Select scenario: `python tools/skill_plan.py --scenario lrl_classification`.
5. Codex builds CPU baseline, AGY checks per-language errors on the same fixed split.
6. Save a valid candidate **before** loading large models or optional APIs.

## Practical traps

- Overall accuracy can conceal a 0% minority-language recall.
- Machine-translated copies can leak across a random train/test split.
- Removing diacritics or lowercasing can change word identity and invalidate offsets.
- `FLORES+` is benchmark data; no using evaluation split for training or tuning.
- An LLM translating into a language does not establish native-level quality; manually check negation, quantities, names and cultural tone.
- Never claim LLM-as-judge outcomes are gold without a validated rubric and human checks.

See `LRL_RESOURCE_CATALOG.csv`, `LRL_SCENARIOS.md`, and `LRL_DATA_CARD_TEMPLATE.md`.

## Runnable baseline (optional dependencies pandas + scikit-learn)

If your real released challenge is **binary text classification** with a one-probability-column sample_submission, use:

```bash
python tools/lrl_classification_baseline.py \
  --train train.csv --test test.csv --sample sample_submission.csv \
  --text-column text --target-column label --language-column language \
  --positive-label jailbreak --group-column conversation_id \
  --output submission.csv --report language_validation.json
```

`text`, `label`, `language`, `conversation_id` and `jailbreak` are **examples**, not asserted challenge fields. Remove `--group-column` only if no suitable group field exists and leakage checks support IID splitting. The script prints per-language diagnostics, with the official metric still requiring separate implementation.

Audit first:

```bash
python tools/lrl_data_audit.py --csv train.csv --text-column text \
  --language-column language --label-column label \
  --other-split valid.csv --output data_audit.json
```

Re-score held-out predictions that have gold labels:

```bash
python tools/lrl_eval.py --gold heldout_gold.csv --predictions heldout_predictions.csv \
  --id-column id --gold-column label --pred-column prediction \
  --language-column language --output language_metrics.json
```
