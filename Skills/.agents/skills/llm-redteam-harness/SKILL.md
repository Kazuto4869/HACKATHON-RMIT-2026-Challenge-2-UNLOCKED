---
name: llm-redteam-harness
description: "Need authorized, reproducible security checks against an LLM app. Specialised AI Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Llm Redteam Harness

**Category:** AI Security  
**Trigger:** Need authorized, reproducible security checks against an LLM app.

## Required inputs
- Written scope and sanctioned target
- Threat model, safe test set and budget

## Workflow
1. Confirm test authorization, resource quotas, rate limits and approved endpoints.
2. Select a focused defensive evaluation: instruction hierarchy, data leakage with dummy secrets, tool refusal, or grounding.
3. Set deterministic seeds where available, log request IDs, model settings and outcomes.
4. Use Promptfoo/garak/PyRIT only if installed, allowed and compatible; avoid broad unattended scans.
5. Classify findings by reproducibility, impact, preconditions, false positives and remediation.
6. Retest against a separate fixed regression set.

## Outputs
- Test plan, sanitized transcript and findings report
- Pass/fail reproducible evidence

## Acceptance gate
No target scanning outside authorized contest scope; pause if rules or quotas are unclear.

## Upstream references (not embedded/executed)
- https://github.com/promptfoo/promptfoo
- https://github.com/NVIDIA/garak
- https://github.com/microsoft/pyrit
