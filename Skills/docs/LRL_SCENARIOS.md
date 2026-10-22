## LIVE UPDATE — C1 officially MULTICLASS on 22/10/2026

For this year's Kaggle C1, use `rmit2026_c1_multiclass`, read `docs/RMIT_2026_LIVE_BRIEF.md` and use `tools/lrl_multiclass_baseline.py` after verifying official schemas. The previous binary-only script does NOT solve this year's multiclass task. Kaggle **Code submission**, rather than local CSV alone, is required by slides.

# LRL Scenario Workflows — Codex and AGY

These are potential problem types, NOT published RMIT 2026 challenge formats. Select based on actual deliverable, rules and data.

## A. Low-resource multilingual classification (Kaggle CSV)

**Intake:** confirm labels/positive class, metric, sample_submission columns and language labels. Freeze group-aware or language-held-out validation if necessary.
**Codex:** use `language-resource-triage` → `script-language-id` → `cross-lingual-transfer`; first majority baseline and char TF-IDF; evaluate by target language. Export actual schema through `validate-submission`.
**AGY:** `low-resource-evaluation` + `code-switch-robustness`; inspect minority recall, class imbalance and translated duplicate contamination.
**Stop condition:** valid CSV and measured improvement on held-out set; unknown language limitations documented.

## B. Low-resource translation / MT

**Intake:** source and target script/codes, direction, metric and human-reference permissions.
**Codex:** verify alignment and model support; start with provided checkpoint, optional NLLB/IndicTrans2 only when permitted; preserve normalizations and save predictions.
**AGY:** chrF/official metric, manual spot checks on negation/numbers/names, language correctness.
**Do not:** train on public benchmark evaluation split, assume external internet, or silently invoke paid APIs.

## C. NER and slot extraction

**Intake:** BIO vs spans, exact-match conditions.
**Codex:** keep original text/offsets; BIO format validation; small dictionary baseline; optional XLM-R if supported.
**AGY:** compare exact entity-span F1 and per-entity/per-language errors, flag Unicode offset shifts.

## D. Cross-lingual RAG / grounded QA

**Codex:** lexical retrieval first with source IDs → optional LaBSE for relevant paired languages → grounded generation or extractive answer depending on rules.
**AGY:** per-language retrieval recall (if gold), unsupported-claim review, prompt-injection isolation.
**Critical test:** question in one language, document in another, answer requested in a third; citations must still resolve.

## E. No labels / tiny gold set

**Codex:** define annotation labels, holdout, pseudo-label provenance; try zero-shot only if allowed.
**AGY:** do not accept generated labels as gold; report uncertainty and minimum sample count.

## F. Multilingual jailbreak detection

**Codex:** define positive class and whether expected label means *attack attempt* or *successful compromise*; char ngram baseline and transfer.
**AGY:** benign security quotes, code-switched prompts, false positive and false negative slices; test only in sandbox.

## AI handoff prompts

**Codex builder:**
```text
Read AGENTS.md, docs/CHALLENGE_BRIEF.md, docs/LRL_MASTER_GUIDE.md, and config/default_skill_profiles.json. Identify language-task resource gaps, scripts, labels, official metric, groups/parallel pairs, constraints and delivery format. Choose one named lrl_* scenario. Load at most 4 phase-relevant skills, build a CPU baseline and reproducible validation, then hand off actual command output and paths. Never install models or external skills without approval.
```

**AGY reviewer:**
```text
Read the current brief, Codex commit, docs/LRL_MASTER_GUIDE.md and fixed holdout report. In read-only mode verify per-language sample counts, macro scores, translated duplicate leakage, script/diacritics, benign false positives and exact submission format. Report file/line-level defects, reproduction commands and release/no-release verdict. Do not change the Codex worktree.
```
