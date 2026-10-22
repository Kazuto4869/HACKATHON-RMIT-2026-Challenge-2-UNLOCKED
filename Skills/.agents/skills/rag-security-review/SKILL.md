---
name: rag-security-review
description: "RAG, vector DB, retrieval tools, external documents or search results are used. Specialised AI Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Rag Security Review

**Category:** AI Security  
**Trigger:** RAG, vector DB, retrieval tools, external documents or search results are used.

## Required inputs
- RAG implementation, retrieval corpus, policy
- Read-only access and synthetic attack documents

## Workflow
1. Check source provenance, document access controls, poisoned/updated chunks and embedding attacks.
2. Test that malicious instructions in retrieved passages are treated as quoted data.
3. Verify citations map to actually retrieved chunks and cannot be spoofed by source text.
4. Review document ingestion ACL, cached embeddings, cross-tenant retrieval and redaction.
5. Test response behavior when evidence conflicts or is absent.
6. Track retrieval and generation errors separately with reproducible fixtures.

## Outputs
- RAG security assessment with affected corpus IDs
- Prioritized remediation and safe regression tests

## Acceptance gate
No cross-user data access and no agent action authorized solely by retrieved text.

## Upstream references (not embedded/executed)
- https://github.com/mukul975/Anthropic-Cybersecurity-Skills
- https://github.com/fevziegeyurtsevenler/llm-security-skills
