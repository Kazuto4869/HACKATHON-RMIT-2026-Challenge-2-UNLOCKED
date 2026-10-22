---
name: low-resource-evaluation
description: "Design honest evaluation across language/strata with sample-size warnings and exact metric. Trigger: Any multilingual/LRL task before model promotion or submission."
---

# Low Resource Evaluation

**Purpose:** Design honest evaluation across language/strata with sample-size warnings and exact metric.  
**When:** Any multilingual/LRL task before model promotion or submission.  
**Owner:** AGY  
**Priority:** P0

## Inputs and prerequisites
- Task metric/rubric, predicted outputs and gold labels/references if available
- Language/script metadata for slices

## Execution procedure
1. Respect organizer primary metric and score direction; pick supplemental metrics, such as macro-F1 for classification, span F1 for NER, chrF/BLEU for MT.
2. Report total N and N per language; small-N slices flagged, and missing labels explicitly marked unscorable.
3. Provide macro average across languages alongside pooled micro result; explain sampling imbalance and excluded languages.
4. For security tasks report false-positive and false-negative counts, attack/benign controls, cross-lingual slice metrics.
5. For generation use human adequacy/grounding checks; LLM-as-judge scores need calibration to human gold examples, not sole basis for claims.
6. Check train/test duplicates and translation siblings before accepting a reported improvement.

## Deliverables
- Machine-readable per-language table and narrative error audit
- Release decision with verified score and known uncertainty

## Quality gate
Score reproducible, denominators explicit, leakage checked, fairness claims not overstated.

## Do not
Do not rank models from tiny language slices without uncertainty or silently omit unsupported language groups.

## References (human review; not auto-installed)
- https://huggingface.co/datasets/openlanguagedata/flores_plus
- https://huggingface.co/docs/hub/agents-skills
