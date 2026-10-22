---
name: genai-evaluation
description: "Output is generated text, summarization, QA, agent traces or structured responses. Specialised Generative AI workflow for the RMIT Hackathon with verifiable outputs."
---

# Genai Evaluation

**Category:** Generative AI  
**Trigger:** Output is generated text, summarization, QA, agent traces or structured responses.

## Required inputs
- Prompt set, model endpoints and target behavior
- Rubric and permitted judge providers

## Workflow
1. Turn the task into observable criteria: correctness, groundedness, language quality, schema, refusal and latency.
2. Build a balanced test set with normal, boundary, adversarial, negative and multilingual cases.
3. Prefer deterministic assertions for format, IDs, JSON schema and forbidden actions; use human/model judges only for semantic quality.
4. Calibrate rubrics on known-good and intentionally-wrong examples; store judged evidence and disagreements.
5. Separate development and held-out evaluation; prevent training on hidden test questions.
6. Report score with sample size, uncertainty, failure examples and cost.

## Outputs
- Versioned eval suite and reproducible report
- Per-category error taxonomy and acceptance gate

## Acceptance gate
A real failing example must fail an assertion; a trivial always-pass grader is rejected.

## Upstream references (not embedded/executed)
- https://github.com/promptfoo/promptfoo
- https://github.com/langchain-ai/langchain-skills
