---
name: static-review
description: "Need offline inspection of Python, JS or configuration for obvious security regressions. Specialised Application Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Static Review

**Category:** Application Security  
**Trigger:** Need offline inspection of Python, JS or configuration for obvious security regressions.

## Required inputs
- Exact changed files and threat model
- Available local formatters/static tools

## Workflow
1. Inspect git diff before whole-repo scans; prioritize changes that introduce inputs, execution, credentials or network.
2. Run existing linters/tests and available Semgrep/CodeQL only when installed and allowed.
3. Trace untrusted input to sensitive sinks: shell, SQL, HTML, template engines, file paths, deserialization and model tools.
4. Distinguish suspected patterns from confirmed exploitable paths; reproduce issues with local safe tests.
5. Report file:line, impact, exploit preconditions and smallest fix; rerun tests after repairs.

## Outputs
- Security findings ledger with evidence and confidence
- Targeted fix suggestions

## Acceptance gate
No invented CVE, scanner output or vulnerability exploitability claims.

## Upstream references (not embedded/executed)
- https://github.com/trailofbits/skills
