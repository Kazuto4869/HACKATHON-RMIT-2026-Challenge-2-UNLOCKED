---
name: backtranslation-augmentation
description: "Use synthetic data and back-translation with quality filters and held-out protection. Trigger: Low labeled/parallel data AND permitted model inference and budget."
---

# Backtranslation Augmentation

**Purpose:** Use synthetic data and back-translation with quality filters and held-out protection.  
**When:** Low labeled/parallel data AND permitted model inference and budget.  
**Owner:** Codex  
**Priority:** P2

## Inputs and prerequisites
- Clean train data, **separate** raw monolingual corpus
- Licensed translation checkpoint and compute budget

## Execution procedure
1. Confirm dataset terms and exclude validation/test texts from synthetic generation and retrieval.
2. Generate synthetic training pairs from train-only monolingual data using translation direction appropriate for back-translation.
3. Filter invalid pairs by length ratio, language-ID checks, numeric/entity agreement and near-duplicate matching.
4. Keep metadata fields: synthetic=true, generator/model version, source provenance, quality filter reason.
5. Train an augmented candidate and compare **on identical untouched holdout** to an unaugmented baseline.
6. Reject augmentation if validation falls, domain drift grows or synthetic contamination is suspected.

## Deliverables
- Augmentation manifest with counts before/after each filter
- Ablation table baseline vs augmented

## Quality gate
Reported gain is measured on a clean untouched holdout, provenance recorded.

## Do not
Do not treat synthetic parallel pairs as human-verified references, or use undisclosed test text for data generation.

## References (human review; not auto-installed)
- https://www.nature.com/articles/s41586-024-07335-x
- https://github.com/AI4Bharat/IndicTrans2
