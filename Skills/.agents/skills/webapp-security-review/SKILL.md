---
name: webapp-security-review
description: "Vibe coding produces a public or local web interface. Specialised Application Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Webapp Security Review

**Category:** Application Security  
**Trigger:** Vibe coding produces a public or local web interface.

## Required inputs
- UI source, API endpoints, data flows
- Auth/session model and demo plan

## Workflow
1. Review output encoding, unsafe HTML, DOM injection, CSRF (when applicable) and storage of tokens.
2. Audit third-party scripts, public environment variables, debug endpoints and error responses.
3. Test form constraints, content-type handling, file-upload limits and race/error paths.
4. Verify the frontend does not bypass backend authorization checks or trust client-side scoring.
5. Run dependency and static checks where available; manually verify high-impact alerts.

## Outputs
- Minimal app security checklist and findings
- Reproduction and fixed regression tests

## Acceptance gate
Block demo release for exposed real secrets or unauthorized access paths.

## Upstream references (not embedded/executed)
- https://github.com/OWASP/secure-agent-playbook
- https://github.com/trailofbits/skills
