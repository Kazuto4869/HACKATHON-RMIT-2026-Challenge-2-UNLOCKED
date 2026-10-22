---
name: structured-outputs
description: "LLM response must be parsed as JSON, function arguments, CSV or other schema. Specialised Generative AI workflow for the RMIT Hackathon with verifiable outputs."
---

# Structured Outputs

**Category:** Generative AI  
**Trigger:** LLM response must be parsed as JSON, function arguments, CSV or other schema.

## Required inputs
- Explicit JSON/schema contract
- Agent output and downstream consumer

## Workflow
1. Define strict field types, required keys, enum values and null/empty handling.
2. Validate before acting; reject malformed fields, extra keys where prohibited, mixed encodings and size overruns.
3. For tool calls, separately authorize action, scope, cost and side effects; schema-valid is not permission to execute.
4. Add retries with bounded budget and safe deterministic fallbacks; never silently coerce labels without checking.
5. Test malicious content embedded in string fields and ensure no nested instructions are executed.

## Outputs
- Schema validator and negative tests
- Error handling policy

## Acceptance gate
Invalid outputs fail closed and cannot trigger external or irreversible actions.

## Upstream references (not embedded/executed)
- https://github.com/promptfoo/promptfoo
