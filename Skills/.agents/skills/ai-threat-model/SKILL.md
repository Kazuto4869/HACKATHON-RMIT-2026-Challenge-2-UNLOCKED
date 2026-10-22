---
name: ai-threat-model
description: "LLM, RAG, agents, tools, or external text can influence decisions or actions. Specialised AI Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Ai Threat Model

**Category:** AI Security  
**Trigger:** LLM, RAG, agents, tools, or external text can influence decisions or actions.

## Required inputs
- System diagram and trust boundaries
- Assets, permissions and attacker capabilities

## Workflow
1. List assets: credentials, private files, prompt/system instructions, model outputs, tools and stored memories.
2. Enumerate entry points: chat input, retrieved documents, web pages, tool returns, file uploads, logs and dependencies.
3. Map data/control boundaries and possible excessive agency, prompt injection, exfiltration and tool-output laundering.
4. Prioritize by likelihood, impact and reachable capabilities, using OWASP LLM/Agentic references where applicable.
5. Define controls: least privilege, allowlists, approval gates, isolation, structured validation and audit trails.
6. Translate high-risk scenarios into reproducible authorization-safe tests.

## Outputs
- docs/THREAT_MODEL.md: diagram, trust boundaries, risk register
- Prioritized defensive test plan

## Acceptance gate
Every privileged tool/action has explicit authorization and an owner.

## Upstream references (not embedded/executed)
- https://github.com/OWASP/secure-agent-playbook
