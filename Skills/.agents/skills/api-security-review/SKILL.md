---
name: api-security-review
description: "Hackathon solution exposes REST API, webhooks or external services. Specialised Application Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Api Security Review

**Category:** Application Security  
**Trigger:** Hackathon solution exposes REST API, webhooks or external services.

## Required inputs
- OpenAPI/schema/router code and authentication plan
- Local app/test server or authorized endpoint

## Workflow
1. Check authorization on every object and operation, including admin and cross-user paths.
2. Validate input schemas, request sizes, rate limits, CORS, content types and error-message leakage.
3. Check secrets in source, URLs, logs, exceptions and repository history.
4. Protect backend endpoints from client-supplied model/tool parameters that grant privilege.
5. Add tests for bad tokens, expired access, invalid IDs, malicious strings, and oversized input.

## Outputs
- API risk register and reproducible tests
- Minimal fixes prioritized by severity

## Acceptance gate
No unapproved network scan and no claim of security without actual tests.

## Upstream references (not embedded/executed)
- https://github.com/OWASP/secure-agent-playbook
