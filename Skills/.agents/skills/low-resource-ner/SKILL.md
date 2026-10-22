---
name: low-resource-ner
description: "Build token classification/NER without span misalignment in diverse scripts. Trigger: Output requires entity spans, BIO/BILOU tags or slot extraction."
---

# Low Resource Ner

**Purpose:** Build token classification/NER without span misalignment in diverse scripts.  
**When:** Output requires entity spans, BIO/BILOU tags or slot extraction.  
**Owner:** Codex  
**Priority:** P1

## Inputs and prerequisites
- Token/span annotation format, exact evaluation granularity
- Language and script mix, tokenization format

## Execution procedure
1. Inspect provided annotation format and label schema: PER/ORG/LOC/DATE or organizer-specific tags.
2. Run zero-rule sanity baseline and dictionary/gazetteer match only if allowed; keep surface forms and offsets.
3. Check IOB2/BIO invariants, exact token-to-character mapping, subword alignment and multiword named entities.
4. Compare multilingual token classifier if available; mask special tokens and subword continuations correctly.
5. Use **entity-level exact span F1** if metric specifies it, not token accuracy; report per-language and entity-type breakdown.
6. Test accents, mixed scripts, punctuation, apostrophes, transliteration and Unicode normalization against offsets.

## Deliverables
- Entity-format validation and error slices
- Trained candidate plus example predictions

## Quality gate
Valid output spans, correct tag ordering, exact scoring definition honored.

## Do not
Do not treat all entity tags as English word-boundaries or change text after offsets are defined.

## References (human review; not auto-installed)
- https://github.com/masakhane-io/masakhane-ner
- https://huggingface.co/datasets/masakhane/masakhaner2
