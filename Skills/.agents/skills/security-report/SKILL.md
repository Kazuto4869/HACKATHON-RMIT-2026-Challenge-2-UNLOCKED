---
name: security-report
description: "Need final security/evaluation evidence for judges, README or team handoff. Specialised Application Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Security Report

**Category:** Application Security  
**Trigger:** Need final security/evaluation evidence for judges, README or team handoff.

## Required inputs
- Actual test logs, metrics, constraints and changes
- Submission/demo rubric

## Workflow
1. List scoped target, test authorization, date, environment and exact version.
2. Separate observed successes/failures from assumptions and untested risks.
3. Give reproduction commands for each confirmed finding (using safe tests or dummy data).
4. Include severity, affected component, potential impact, fix, verification and residual risk.
5. Cross-reference score/validation results and link to evidence artifacts.
6. Ensure sensitive data is redacted and audience can reproduce the baseline.

## Outputs
- docs/SECURITY_REPORT.md with evidence table
- Concise judge-ready summary

## Acceptance gate
No claims of full safety or zero vulnerabilities based on limited tests.

## Upstream references (not embedded/executed)
- https://github.com/OWASP/secure-agent-playbook
