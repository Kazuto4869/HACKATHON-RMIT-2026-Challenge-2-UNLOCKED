---
name: jailbreak-detection
description: "Challenge is jailbreak detection, safety classification or attack/benign discrimination. Specialised AI Security workflow for the RMIT Hackathon with verifiable outputs."
---

# Jailbreak Detection

**Category:** AI Security  
**Trigger:** Challenge is jailbreak detection, safety classification or attack/benign discrimination.

## Required inputs
- Labeled prompts and allowed dataset
- Definition of positive label and official metric

## Workflow
1. Inspect labels and leakage; do not equate offensive keywords with attacks.
2. Build character n-gram TF-IDF + linear model baseline, then multilingual representations as justified.
3. Evaluate ROC-AUC/PR-AUC/F1/calibration as appropriate to the official metric and class distribution.
4. Analyze false positives on benign quotes, negation, safety research and non-English text.
5. Analyze false negatives by known categories without generating harmful real-world payloads.
6. Export raw probabilities in correct positive-class order when metric expects them.

## Outputs
- Held-out score with language/family breakdown
- Correct probability submission and error report

## Acceptance gate
Never replace official scoring metric or assume 2025 schema equals 2026 schema.

## Upstream references (not embedded/executed)
- https://github.com/mukul975/Anthropic-Cybersecurity-Skills
