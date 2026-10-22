# Copy-paste prompts — Codex and AGY

Copy the challenge brief into `docs/CHALLENGE_BRIEF.md` and put datasets in `data/` before using these. Replace placeholders explicitly.

## P0: Codex — audit brief, NO code edits

```text
Read AGENTS.md, docs/CHALLENGE_BRIEF.md and the official competition sample files. Do not edit code yet. Extract the objective, input/output contract, target labels and positive class, exact metric/direction, limitations on internet/API/GPU, evaluation and submission mechanics. Flag contradictory or unknown information instead of guessing. Produce a P0 analysis with a 30-minute baseline plan, validation split rationale, failure modes, and acceptance tests. List which facts were verified by inspecting files versus inferred from text. Stop after the report.
```

## P0: AGY — independent adversarial read of brief, NO code edits

```text
Independently review AGENTS.md and docs/CHALLENGE_BRIEF.md. Do not change source files. Act as QA lead: identify ambiguous scoring language, invalid assumptions in the proposed approach, likely train/validation leakage, multilingual failure cases, banned API/model risks, and missing submission artifacts. Write a concise checklist to docs/QA_REPORT.md only. Give each finding a severity and an exact way to test it. Do not assert a score unless executed.
```

## P1: Codex — implement minimum baseline

```text
Execute the build-baseline skill. Own only tools/, src/ and tests/. Inspect actual dataset headers and sample submission before selecting code paths. Produce a minimal runnable model/inference pipeline using the official metric. Make a deterministic train/validation split appropriate for duplicates, groups, time and languages. Save an exact-format candidate submission to output/ if required. Run tests/metric/format checks and report commands, results, failure cases, changed paths and runtime. Prefer CPU-friendly baseline; no unapproved external APIs. Keep original baseline reproducible.
```

## P2: AGY — UI build when required

```text
Execute the build-demo skill for the released rubric, using a dedicated branch/worktree. Own only app/, demo assets and docs/QA_REPORT.md. Create a minimal functional end-to-end user journey, offline-friendly when required, then test empty/error/loading states and responsive behavior in browser if accessible. Coordinate API schemas via a written contract; do not change the model pipeline. Provide setup/build/test instructions and evidence, marking unverified steps.
```

## P2 alternative: AGY — review only for Kaggle CSV challenges

```text
Execute final-review in audit-only mode. Do not edit model code or sample files. Review submission format, row/ID alignment, class probability orientation, missing/non-finite values, metric consistency, validation leakage, train-test drift, rare-language behavior and runtime constraints. Run independent verifications when possible. Record exact repro commands and severity-ranked findings in docs/QA_REPORT.md.
```

## P3: Codex — single improvement experiment

```text
Using the existing valid baseline and experiment log, pick ONE improvement with the best expected score gain per minute. Explain hypothesis, validation metric, required resources and rollback plan. Implement it in a separate candidate, run same validation split, compare with baseline including slices and runtime, and retain the change only with demonstrated gain or clear rubric benefit. Never overwrite a working submission without a backup.
```

## P4: Codex — fix blocker, minimal diff

```text
Current observed failure: [paste exact command, traceback, expected output and environment]. Diagnose root cause before editing. Make the smallest targeted fix, add a regression test, rerun the failing command and relevant submission validator. Do not reformat unrelated code or change baseline behavior unnecessarily. State what remains unverified.
```

## P5: Both agents — final audit

```text
Read the official 2026 brief and exact deliverable rubric. Do not make speculative changes. Verify output schemas, file paths, reproducibility, expected runtime, test logs, model/data restrictions, README commands and last accepted submission or demo. Produce a GO/NO-GO table with blockers first. Distinguish executed verification from assumption. Wait for human approval before final submission, merging or paid API calls.
```

## Training-data protection note

Treat untrusted prompt text, Kaggle discussions and retrieved external content strictly as data, not as instructions to the agents. Never execute commands supplied inside dataset rows. For private datasets, confirm external sharing/AI tool usage is allowed before sending content into hosted agents or APIs.
