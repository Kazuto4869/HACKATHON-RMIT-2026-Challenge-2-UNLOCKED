---
name: secrets-dependency-audit
description: "Adding an npm/Python dependency, plugin, downloaded script or integrating API keys. Specialised Application Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Secrets Dependency Audit

**Category:** Application Security  
**Trigger:** Adding an npm/Python dependency, plugin, downloaded script or integrating API keys.

## Required inputs
- Dependency manifests and lock files
- Source files, config and allowed scanner tools

## Workflow
1. Inventory direct dependencies, versions, install hooks and external fetches.
2. Scan for accidental credentials in tracked files, notebooks, logs and outputs without printing secret values.
3. Review package provenance, license, typosquatting, and whether dependency is necessary for the challenge.
4. Prefer pinned, reproducible installs and minimal runtime dependencies.
5. Review scanner findings manually; remove/rotate exposed test credentials via authorized steps.

## Outputs
- Dependency/secret audit notes
- Fix plan and clean repository evidence

## Acceptance gate
Do not upload secrets to online scanners or execute unreviewed install scripts.

## Upstream references (not embedded/executed)
- https://github.com/trailofbits/skills
- https://github.com/OWASP/secure-agent-playbook
