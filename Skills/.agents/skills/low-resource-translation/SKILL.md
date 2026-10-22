---
name: low-resource-translation
description: "Translation, normalization or transcreation involving limited-data languages. Specialised GenAI & ML workflow for the RMIT Hackathon with verifiable outputs."
---

# Low Resource Translation

**Category:** GenAI & ML  
**Trigger:** Translation, normalization or transcreation involving limited-data languages.

## Required inputs
- Source/target languages, domain, permitted corpora
- Metric and evaluation pairs

## Workflow
1. Audit language tags, scripts, code-switching and data provenance; validate normalization choices.
2. Create a trivial baseline and, when allowed, evaluate a pretrained multilingual model without fine-tuning.
3. Assess chrF/BLEU only where appropriate; supplement automated metrics with human review of meaning and terminology.
4. Check named entities, numerals, negation, dialect and harmful misinformation in translations.
5. Separate adaptation set from held-out test; document pretraining contamination uncertainty.

## Outputs
- Evaluation table by direction and language
- Failure examples and realistic improvement plan

## Acceptance gate
No silent use of unrelated translation APIs or unseen benchmark answer files.

## Upstream references (not embedded/executed)
- https://github.com/huggingface/skills
