---
name: low-resource-jailbreak-detection
description: "Build multilingual jailbreak classifiers and benign-overblocking checks inside authorized scope. Trigger: Challenge labels prompts by jailbreak, malicious override, or another security class across languages."
---

# Low Resource Jailbreak Detection

**Purpose:** Build multilingual jailbreak classifiers and benign-overblocking checks inside authorized scope.  
**When:** Challenge labels prompts by jailbreak, malicious override, or another security class across languages.  
**Owner:** Codex + AGY  
**Priority:** P0

## Inputs and prerequisites
- Exact definition of positive class and permitted test set
- Language/script labels, tokenizer and evaluation metric

## Execution procedure
1. Disambiguate jailbreak intent label vs successful jailbreak outcome vs prompt injection source. They need different datasets and targets.
2. Start character-TF-IDF + supervised linear classifier when training labels exist; compare multilingual encoder only if licensed and feasible.
3. For no labels, define an authorized evaluation plan, uncertainty/abstain and qualitative threat categories; do not report accuracy.
4. Split by template/conversation/translation family to prevent identical attacks appearing in train and validation in other languages.
5. Evaluate benign quotes, news, discussion of attacks and authorized security research as false-positive controls; check mixed-script and transliteration variants.
6. Keep evaluation confined to organizer-provided or explicit authorized sandbox; do not send harmful payloads to unrelated live services.

## Deliverables
- Baseline detection score and per-language false-positive/false-negative report
- Input/output label contract and safe evaluation evidence

## Quality gate
Positive class direction and label definition correct, robustness and benign controls measured.

## Do not
Do not claim classifier detects actual compromise; judge success requires evidence of target outcome.

## References (human review; not auto-installed)
- https://github.com/OWASP/secure-agent-playbook
- https://github.com/mukul975/Anthropic-Cybersecurity-Skills
