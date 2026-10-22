---
name: dataset-audit
description: "A dataset, train/test split, evaluation set, CSV or JSONL is supplied. Specialised GenAI & ML workflow for the RMIT Hackathon with verifiable outputs."
---

# Dataset Audit

**Category:** GenAI & ML  
**Trigger:** A dataset, train/test split, evaluation set, CSV or JSONL is supplied.

## Required inputs
- Actual train/test/schema files and problem metric
- Data licensing/allowed sources from official brief

## Workflow
1. Inspect file sizes, columns, types, label space, nulls, empty strings, duplicates and mixed encodings.
2. Check class imbalance, language/dialect distribution, length/token histogram, rare labels and out-of-distribution groups.
3. Detect duplicate and near-duplicate leakage between train/validation and train/test using normalized hashes and optional similarity checks.
4. Choose stratified/group/time-based splitting based on data collection; justify split and seed.
5. Check restricted personal or secret data; avoid printing raw sensitive records to logs.
6. Create 10-30 representative sanitized examples, including hard cases, to support manual error review.

## Outputs
- docs/DATA_AUDIT.md with schema and distributions
- Reproducible split definition and leakage findings

## Acceptance gate
Label mapping, split policy and metric interpretation are confirmed before model tuning.

## Upstream references (not embedded/executed)
- https://github.com/huggingface/skills
