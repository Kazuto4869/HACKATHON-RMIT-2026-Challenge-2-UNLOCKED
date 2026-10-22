---
name: model-experiment
description: "Need to improve a measured baseline or compare multiple solutions. Specialised GenAI & ML workflow for the RMIT Hackathon with verifiable outputs."
---

# Model Experiment

**Category:** GenAI & ML  
**Trigger:** Need to improve a measured baseline or compare multiple solutions.

## Required inputs
- Baseline run, metric, split hash and budget
- Candidate hypothesis

## Workflow
1. State exactly one hypothesis and the expected metric impact; keep baseline untouched.
2. Run the same validation split, random seed and scoring implementation for all comparable candidates.
3. Track parameters, data version, library versions, runtime, sample counts and exceptions.
4. Use ablation or targeted comparison to identify whether the gain came from preprocessing, representation or model choice.
5. Inspect regressions by language, class, prompt length and security attack family.
6. Promote the change only with evidence; archive the previous valid submission.

## Outputs
- docs/EXPERIMENT_LOG.md entry and artifacts
- Keep/revert recommendation with metric and limitations

## Acceptance gate
Never promote a candidate based only on one public leaderboard result.

## Upstream references (not embedded/executed)
- https://github.com/huggingface/skills
