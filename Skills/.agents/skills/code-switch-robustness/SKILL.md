---
name: code-switch-robustness
description: "Evaluate code-switched, mixed-script, transliterated and dialectal text. Trigger: Users blend languages, spelling standards or scripts."
---

# Code Switch Robustness

**Purpose:** Evaluate code-switched, mixed-script, transliterated and dialectal text.  
**When:** Users blend languages, spelling standards or scripts.  
**Owner:** AGY + Codex  
**Priority:** P1

## Inputs and prerequisites
- Human-labeled mixed-language examples and clean matched controls
- Defined dialect/orthography transformations

## Execution procedure
1. Create a controlled fixture with switches inside a sentence, names, digits and script changes. Avoid interpreting synthetic data as natural prevalence.
2. For each transformed item keep its source ID and whether semantics/label should remain invariant.
3. Check model outputs on original and transformed pair; compute consistency and class-specific error rate.
4. Report false positives and false negatives by language pair and switch type, with denominators.
5. When transformations change meaning or social context, mark label invariant as unknown and require human review.
6. Include benign academic/quoted safety text to check security detector overblocking.

## Deliverables
- Regression fixture and consistency report
- Top failure examples and recommended fixes

## Quality gate
At least one held-out mixed-script slice evaluated, with limitations explicit.

## Do not
Do not remove code-switched spans, force single-language ID or claim synthetic stress-test prevalence reflects deployment.

## References (human review; not auto-installed)
- https://github.com/IndoNLP/nusax
- https://aclanthology.org/2023.acl-long.61/
