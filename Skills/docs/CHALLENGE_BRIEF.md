# Challenge intake — create `docs/CHALLENGE_BRIEF.md` from this template

Copy the *verbatim* important phrases from the released brief. Unknown = `TBD`, not a guessed default.

## A. Contest facts
- Competition URL / version:
- Challenge name / number / deadline + timezone:
- Rules for AI, APIs, internet, pretrained models, external data, GPU and team collaboration:
- Scoring weight / submission attempts / live updates:
- What is evaluated (private test, judge, rubric, demo, latency, safety)?

## B. Machine-readable contract
- Data files and actual path:
- Train rows / test rows / validation split availability:
- Input schema (column, dtype, missingness, examples):
- Target and class labels, positive class (if classification):
- Submission example headers, order, sample row, ID alignment:
- Submission mechanism (CSV upload, code submission, notebook, API, URL, video):
- Exact filenames and allowed output paths:

## C. Optimization objective
- Task type (binary/multiclass/regression/generation/retrieval/attack/defense/app):
- Primary metric formula / direction / averaging / threshold:
- Hard restrictions and disqualification conditions:
- Local validation protocol and rationale:
- Baseline expected to work in 30–60 minutes:
- How to prove correctness before improving score:

## D. Resources / ownership
- Available RAM/CPU/GPU, runtime and network:
- Installed package versions / pretrained models available:
- External API access and price limit:
- Codex owner, AGY owner, integration owner:
- Time budget for baseline / improvements / integration:

## E. Decision log (update after every test)
| Time | Hypothesis | Change | Local metric | Runtime | Decision | Commit |
|---|---|---|---|---|---|---|

## F. Acceptance gates
- [ ] One valid minimal submission or running demo
- [ ] Metric matches organizer's official specification
- [ ] Validation leakage checked
- [ ] Re-run works from clean environment when feasible
- [ ] Final deliverables exist and were inspected
- [ ] Human team lead approves final submission
