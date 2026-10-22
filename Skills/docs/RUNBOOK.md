# Team runbook: 22–23 October 2026

Official event windows: 22 Oct 08:00–18:00; 23 Oct 08:00–12:00 (venue local time). Scheduling below is a **proposal**; adjust for organizer briefings, check-ins and breaks.

## Four-person ownership

| Person | Main job | Deliverable | Agent |
|---|---|---|---|
| P1 — lead/integrator | Read brief, scoring and rules; Git merge, checkpoints and submission | `CHALLENGE_BRIEF.md`, release checklist | Human + review |
| P2 — ML engineer | Data audit, baseline, inference, metric | `tools/`, `src/`, `submission.csv` candidate | Codex |
| P3 — Security & language evaluator | Multilingual slices, negative tests, adversarial robustness within rules | `docs/QA_REPORT.md`, test matrix | AGY read-only or separate worktree |
| P4 — Product/demo | App integration, UX, live demo / presentation if required | `app/`, README/demo | AGY |

If only Kaggle CSV is required, P4 supports experiments and documentation rather than creating an unnecessary app.

## Critical gates

**Day 1**
- **08:00–08:30**: read exact brief, join competition, download data, identify constraints, complete `docs/CHALLENGE_BRIEF.md` and owner table.
- **08:30–09:30**: verify sample submission, smoke test environment, minimal valid baseline. If no labels, prove I/O contract first.
- **09:30–12:00**: reproduce local validation; build second method only if baseline valid; handoff from Codex.
- **12:00–15:00**: targeted improvements, error analysis, language slices or app features depending on rubric; preserve best baseline.
- **15:00–17:00**: independent QA, compare candidate with baseline, fix schema/runtime issues; ensure at least one accepted artifact where submissions are open.
- **17:00–18:00**: freeze validated checkpoint, commit, annotate experiments, record unresolved risks and backup.

**Day 2**
- **08:00–09:30**: confirm latest organizer updates and rules, prioritize a single proven improvement if time.
- **09:30–10:30**: full rerun or smoke test in environment close to Kaggle; independent review.
- **10:30–11:15**: prepare final submission and demo/report; save a fallback copy of last known-good output.
- **11:15–12:00**: submission buffer, confirm acceptance / version and repository state. Stop speculative changes.

Do not infer actual organizer submission deadline from 12:00; use published challenge-specific deadline.

## Git / agent isolation

Preferred: one shared origin, separate branches and worktrees. `main` stays integrated and working.

```bash
git init
# Commit the prepared playbook first; add a suitable .gitignore.
git add .
git commit -m "chore: bootstrap hackathon playbook"
git switch -c main  # Skip if main already exists.
# Run from root after confirming current branch and absence of local changes:
git worktree add -b feat/codex ../hackathon-codex main
git worktree add -b feat/agy ../hackathon-agy main
```

Start Codex inside `../hackathon-codex`, Antigravity in `../hackathon-agy`. The lead reviews each diff and merges **one at a time**. If Git config or branch differs, adapt commands instead of executing blindly. On Kaggle notebook-only submissions, use separate notebooks and version names rather than having both agents edit the same notebook.

## Handoff contract for each agent

Every handoff must state:
1. Changed files and branch/commit.
2. Commands run and observable results (including failed commands).
3. Actual local metric and split, or `not measured`.
4. Risks/assumptions/unstable dependencies.
5. Next minimal action for integrator.

## Decision authority

Human lead approves: changes to official task interpretation, API cost, external uploads, merging, Kaggle submission, policy/security exceptions, deleting important files. The AI agent may propose but must not autonomously perform these actions.

## Emergency clock

At <90 min remaining, refuse to start new model families, extensive tuning, or repo rewrites. At <45 min remaining, only fix verified blocker or preserve best valid submission. At <15 min remaining, focus on successful submission status and clean handoff; follow official deadline exactly.
