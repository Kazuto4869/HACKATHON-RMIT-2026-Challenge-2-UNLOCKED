# Copy-paste prompts for Codex and AGY

## Decide branch (Codex)
```text
Read AGENTS.md and docs/CHALLENGE_BRIEF.md; use language-resource-triage. Show a table of confirmed input/output/metric/languages/scripts/labels/compute/Internet/permissions. Mark unknown as TBD. Select the shortest lrl_* scenario and explain the baseline + split strategy. No code edits yet.
```

## Build baseline (Codex)
```text
Use script-language-id, cross-lingual-transfer, low-resource-evaluation only as needed. Inspect actual dataset files and sample submission. Build CPU char TF-IDF + linear classification baseline, or documented task-specific alternative. Prevent group and translation-family leakage. Run evaluation with per-language denominators and emit verified artifacts/tests; do not invent results.
```

## Assess RAG / MT (AGY read-only)
```text
Review the language/script direction, benchmark leakage, licenses, source citations and model output. For each language, list sample count, exact observed errors in names, numbers, negation and unsupported claims. Evaluate prompt injection in retrieved content only within authorized sandbox. Do not edit production code or submit.
```

## Release (Team lead)
```text
List the actual model/version/license, constraints, checked split, per-language metrics, scripts, commands, test results, exact submission contract, risks and release verdict. Never claim unrun tests or submit without human approval.
```
