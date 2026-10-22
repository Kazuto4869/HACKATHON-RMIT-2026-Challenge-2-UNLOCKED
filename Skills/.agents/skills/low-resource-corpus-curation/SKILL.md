---
name: low-resource-corpus-curation
description: "Audit, deduplicate, license-check, and document small multilingual corpora. Trigger: Before training or augmenting with unlabeled/parallel data."
---

# Low Resource Corpus Curation

**Purpose:** Audit, deduplicate, license-check, and document small multilingual corpora.  
**When:** Before training or augmenting with unlabeled/parallel data.  
**Owner:** Codex  
**Priority:** P0

## Inputs and prerequisites
- Raw dataset paths and source URLs/licenses
- Language and split columns; fields carrying user text/PII

## Execution procedure
1. Create a data card: provenance, collection method, language varieties, scripts, speakers/annotators if provided, consent and license.
2. Count missing fields, exact/normalized duplicates, conflicts between labels and duplicates crossing splits.
3. Keep immutable raw input; apply reversible preprocessing in derived files; store encoding and normalization decisions.
4. Identify machine-translated examples and templated/near-duplicate series as leakage risks. Group near duplicates before splitting where possible.
5. For extremely small sets, report uncertainty and manually verify representative examples with native speakers when available.
6. Never upload private competition data to external services or place unapproved raw rows in issue trackers/prompts.

## Deliverables
- Corpus audit: distribution, leakage, annotation/licensing risks
- Reproducible transformation manifest and checksums

## Quality gate
Training excludes forbidden/ambiguous-license sources, and holdout contamination has been checked.

## Do not
Do not deduplicate or normalize away orthographic features used as labels.

## References (human review; not auto-installed)
- https://www.masakhane.io/
- https://github.com/IndoNLP/nusa-crowd
