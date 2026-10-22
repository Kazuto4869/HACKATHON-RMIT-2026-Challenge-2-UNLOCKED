# Hackathon checklist

## Tonight
- [ ] Confirm accounts, allowed AI agents, Git, Python version, venv, Kaggle access and contact method.
- [ ] Start Codex (`codex --help`) and AGY, verify both see `AGENTS.md` and local skills.
- [ ] Run `python -m unittest discover -s tests -v`.
- [ ] Dry run `python tools/validate_submission.py --help`.
- [ ] Prepare a fallback plan for no GPU / offline / rate-limited APIs.
- [ ] Establish who is authorized to submit and merge.

## First 15 minutes
- [ ] Read challenge brief, scoring, rules and Discussion updates.
- [ ] Save objective, metric, direction, schemas and restrictions in `docs/CHALLENGE_BRIEF.md`.
- [ ] Inspect all provided datasets, sample outputs and starter code.
- [ ] Identify owner, baseline and acceptance test per challenge.
- [ ] Confirm exact deadline and number of submission attempts (do not assume 2025 rules).

## Before candidate submission
- [ ] Correct sample headers and column order, row count and IDs.
- [ ] No NaN/inf/out-of-range probabilities for probability columns.
- [ ] Positive-class meaning and probability orientation verified.
- [ ] Metric implementation and split are appropriate.
- [ ] Actual test run recorded; package dependencies available.
- [ ] Legal/rules-compliant external datasets, models and APIs.
- [ ] No credentials or sensitive data in repo or logs.

## Final
- [ ] Last good working version saved and recoverable.
- [ ] Team lead confirms final artifacts exist.
- [ ] Accepted Kaggle submission/version or demo accessibility verified (when applicable).
- [ ] Documentation and code match; scores reflect executed runs only.
