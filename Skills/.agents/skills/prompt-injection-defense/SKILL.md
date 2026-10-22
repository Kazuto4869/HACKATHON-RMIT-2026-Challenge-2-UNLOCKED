---
name: prompt-injection-defense
description: "Model sees untrusted text and may mistake it for an instruction. Specialised AI Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Prompt Injection Defense

**Category:** AI Security  
**Trigger:** Model sees untrusted text and may mistake it for an instruction.

## Required inputs
- App/system constraints and untrusted-input surfaces
- Owned/sanctioned test endpoint

## Workflow
1. Separate user requests, system instructions, retrieved data and tool results into identifiable trust tiers.
2. Create a small, authorized suite of direct and indirect injection examples using synthetic data and toy secrets.
3. Measure task success, unauthorized instruction following and false refusal rates independently.
4. Apply data boundaries, minimum tool permissions, retrieval filters, output validators and explicit human approval on side effects.
5. Retest after each change; include non-attack and multilingual cases to detect excessive blocking.
6. Document remaining risk; a prompt-only defense is insufficient for critical actions.

## Outputs
- Attack surface matrix and regression tests
- Before/after defensive evaluation

## Acceptance gate
Never test real targets without permission or use real credentials in probes.

## Upstream references (not embedded/executed)
- https://github.com/OWASP/secure-agent-playbook
- https://github.com/mukul975/Anthropic-Cybersecurity-Skills
