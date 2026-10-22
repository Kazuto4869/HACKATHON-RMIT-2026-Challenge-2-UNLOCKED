---
name: model-data-poisoning
description: "Training data, RAG corpus, labels, model weights or evaluation samples may be manipulated. Specialised AI Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Model Data Poisoning

**Category:** AI Security  
**Trigger:** Training data, RAG corpus, labels, model weights or evaluation samples may be manipulated.

## Required inputs
- Data origins, transformations, model checksums
- Known-good samples and validation policy

## Workflow
1. Inventory source/revision/license, labelers, file hashes and transformation lineage.
2. Scan for anomalous labels, repeated instructions, unusual triggers, near-duplicate clusters and sudden distribution changes.
3. Run holdout and source-grouped evaluation on suspicious clusters where possible.
4. Use immutable snapshots and access separation between training and validation.
5. Record uncertainty: statistical outliers alone do not prove an attack.

## Outputs
- Dataset/model provenance report
- Flagged records with reproducible evidence

## Acceptance gate
Never discard records solely on speculative poisoning claims.

## Upstream references (not embedded/executed)
- https://github.com/mukul975/Anthropic-Cybersecurity-Skills
