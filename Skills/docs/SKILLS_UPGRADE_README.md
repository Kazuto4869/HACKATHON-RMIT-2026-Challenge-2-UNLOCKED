# v3 supplement

New single-stop guide: `docs/SKILLS_MASTER_GUIDE.md`. Defaults: `config/default_skill_profiles.json`; skill matrix: `docs/SKILL_MATRIX.csv`; CLI: `tools/skill_plan.py`. This supplements the original v2 upgrade notes below.

# RMIT Hackathon 2026 — GenAI + Cybersecurity Skills v2

Updated 22 October 2026. **Source repository shortlist ≠ installed repository.**

## Distribution policy

This package includes 6 project-original skills from v1 and 20 newly authored challenge-specific skills. It does **not** embed third-party skill code or execute install scripts. See `UPSTREAM_CATALOG.csv` for precisely identified optional directories from 7 upstream repositories. Upstream repos have their own licenses, dependencies, scripts and security risks; fetch/review them separately.

## Start in under two minutes

1. Read `AGENTS.md` and `docs/SKILLS_ROUTER.md`.
2. Fill `docs/CHALLENGE_BRIEF.md` from the real official challenge.
3. Open separate Codex and Antigravity worktrees (or do read-only review in AGY).
4. Load the 2–4 skills selected by the router; do not paste all skills into model context.
5. Build valid baseline, run QA, and submit only after human inspection.

## Optional upstream skill selection

Look up the candidate in `docs/UPSTREAM_CATALOG.csv`. Read the upstream `SKILL.md`, any referenced files and license first. Run `python tools/inspect_upstream_skill.py path/to/candidate` to surface basic red flags. This scanner is a **heuristic**, not proof of safety; manual review remains mandatory. Copy a reviewed skill to `.agents/skills/<name>/` only after explicit approval and when its file dependencies are self-contained. OWASP standalone skill markdown often refers to sibling `plays/`, so prefer reviewing the full repository or using the local authored security skills.

### Recommended external sources

- OWASP Secure Agent Playbook — https://github.com/OWASP/secure-agent-playbook
- Hugging Face Skills — https://github.com/huggingface/skills
- Promptfoo Eval / Red Team Skills — https://github.com/promptfoo/promptfoo
- LangChain Skills — https://github.com/langchain-ai/langchain-skills
- Trail of Bits Security Skills — https://github.com/trailofbits/skills
- Community Cybersecurity Skills — https://github.com/mukul975/Anthropic-Cybersecurity-Skills (independent, not Anthropic)
- LLM Security Skills — https://github.com/fevziegeyurtsevenler/llm-security-skills

## Security scope

Only test contest targets and systems the team owns or has written authorization to examine. Limit cost/rate/resources; use synthetic dummy credentials for leak tests. Do not ingest unknown third-party skills or execute their scripts without inspection.
