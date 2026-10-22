---
name: language-resource-triage
description: "Profile language, script, labels, coverage, and compute before choosing a model. Trigger: New language or ambiguous low-resource task; always before LRL branch."
---

# Language Resource Triage

**Purpose:** Profile language, script, labels, coverage, and compute before choosing a model.  
**When:** New language or ambiguous low-resource task; always before LRL branch.  
**Owner:** Codex + Lead  
**Priority:** P0

## Inputs and prerequisites
- Organizer brief, train/test schema, language inventory, metric
- Allowed model/API/internet/GPU and language identity evidence

## Execution procedure
1. Write a language × script × domain × task table. Resolve ISO 639-3 plus script (e.g. vie_Latn) only when justified; unknown stays TBD.
2. Separate low-label data, low-pretraining coverage, and low-parallel-text availability. Report train examples and label counts per language; avoid claiming a universal threshold.
3. Check text is actually in claimed language on a stratified sample; note code-mixing, romanization, nonstandard orthography, dialect, OCR noise and short strings.
4. Inspect official metric, hidden evaluation language distribution if disclosed, model licenses and hardware. Do not assume online translation/API access.
5. Pick CPU/offline baseline, optional transfer model, data strategy and held-out evaluation. Save the decision in docs/LRL_DECISION.md.

## Deliverables
- docs/LRL_DECISION.md with assumptions and selected scenarios
- A model/resource shortlist with go/no-go checks

## Quality gate
No model selected merely from task title; output language/script, resources and split type recorded.

## Do not
Do not infer the language solely from the Unicode script or assume Vietnamese is low-resource for every task.

## References (human review; not auto-installed)
- https://www.nature.com/articles/s41586-024-07335-x
- https://aclanthology.org/2023.acl-long.61/
