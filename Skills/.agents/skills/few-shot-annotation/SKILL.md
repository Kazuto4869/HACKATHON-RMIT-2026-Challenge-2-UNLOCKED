---
name: few-shot-annotation
description: "Plan minimal human annotation and active-learning iteration without label fabrication. Trigger: Few or no trustworthy target-language labels and rules permit annotation."
---

# Few Shot Annotation

**Purpose:** Plan minimal human annotation and active-learning iteration without label fabrication.  
**When:** Few or no trustworthy target-language labels and rules permit annotation.  
**Owner:** Codex + Lead  
**Priority:** P1

## Inputs and prerequisites
- Existing labeled and unlabeled pools, task label definitions
- Human reviewer availability and annotation consent

## Execution procedure
1. Write a one-page annotation manual with positive/negative examples, ambiguous cases and abstain policy.
2. Select a diverse seed set across language, script, domain and class; avoid purely high-confidence samples.
3. Create a stratified gold evaluation set first and freeze it. Never query its labels during training selection.
4. For active learning, sample uncertainty/diversity **only from the remaining unlabeled pool** and record each round.
5. Require human checks for all labels; synthetic/pseudo labels are separately tagged and never described as gold.
6. If only one annotator exists, manually review disagreement-risk examples; report label uncertainty.

## Deliverables
- Annotation guide and sampling plan
- Versioned gold/pseudo-label provenance log

## Quality gate
Gold holdout segregated; annotation provenance and class definitions stable.

## Do not
Do not fabricate gold labels with LLM-generated guesses or report pseudo labels as ground truth.

## References (human review; not auto-installed)
- https://www.masakhane.io/
- https://github.com/IndoNLP/nusax
