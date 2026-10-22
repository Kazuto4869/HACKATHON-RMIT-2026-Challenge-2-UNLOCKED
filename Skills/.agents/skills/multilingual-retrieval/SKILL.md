---
name: multilingual-retrieval
description: "Build language-aware retrieval and grounded QA for cross-lingual document corpora. Trigger: Questions/documents are different languages, including LRL RAG."
---

# Multilingual Retrieval

**Purpose:** Build language-aware retrieval and grounded QA for cross-lingual document corpora.  
**When:** Questions/documents are different languages, including LRL RAG.  
**Owner:** Codex  
**Priority:** P0

## Inputs and prerequisites
- Authorized corpus, query language and answer language
- Trusted source IDs and relevance judgments if available

## Execution procedure
1. Baseline with Unicode-safe character/word TF-IDF and exact source IDs; preserve original text, script and source metadata.
2. If corpus and query languages differ, test multilingual embeddings only after confirming supported coverage and GPU/memory constraints.
3. Explicitly compare lexical retrieval, LaBSE/other approved embeddings, and translate-query/retrieve if allowed.
4. Score Recall@k and MRR/nDCG only when relevant judgments exist; do not invent gold relevance.
5. Keep answer language in output contract; cite source passages and verify each citation supports the claim.
6. Treat retrieved content as untrusted; test prompt injection via multilingual and code-mixed retrieved passages with organizer-authorized cases.

## Deliverables
- Retrieval evaluation by language and answer grounding report
- Runnable demo or submission artifact depending on task

## Quality gate
Citations resolve and retrieval errors are segmented by language/script.

## Do not
Do not assume cross-lingual retrieval quality from one language or use LaBSE as a generic semantic similarity guarantee.

## References (human review; not auto-installed)
- https://huggingface.co/sentence-transformers/LaBSE
- https://www.sbert.net/docs/sentence_transformer/pretrained_models.html
