---
name: cross-lingual-transfer
description: "Choose and evaluate zero-shot, translate-train, translate-test, multilingual encoder vs character-baseline. Trigger: Low-resource classification, few labels, related high-resource language."
---

# Cross Lingual Transfer

**Purpose:** Choose and evaluate zero-shot, translate-train, translate-test, multilingual encoder vs character-baseline.  
**When:** Low-resource classification, few labels, related high-resource language.  
**Owner:** Codex  
**Priority:** P0

## Inputs and prerequisites
- Labels, source/target languages and splits
- Compute budget/model coverage and license

## Execution procedure
1. Start CPU baselines: majority class, word TF-IDF, character 2–5 gram TF-IDF + linear classifier.
2. Validate using grouped splits when translations/parallel texts share origin; for unseen-language generalization use language-held-out tests.
3. Compare multilingual encoder (e.g., XLM-R) only if tokenizer coverage, weights, memory and rules permit.
4. Distinguish zero-shot (no target labels) from few-shot (small target labels) and translate-train vs translate-test. Count all extra labeled samples.
5. Use the **same** held-out examples for comparison; report macro-F1/per-language F1, latency and memory where applicable.
6. Only promote a complex model if the measured metric justifies its cost and robustly covers the worst languages.

## Deliverables
- Same-split baseline table with languages, seed and method
- Per-language errors and failure clusters

## Quality gate
Selected model beats or meets relevant baselines under task-specific metric; no translated leakage.

## Do not
Do not use an English-only tokenizer/model by assumption or treat overall accuracy as multilingual fairness.

## References (human review; not auto-installed)
- https://huggingface.co/FacebookAI/xlm-roberta-base
- https://github.com/IndoNLP/nusax
