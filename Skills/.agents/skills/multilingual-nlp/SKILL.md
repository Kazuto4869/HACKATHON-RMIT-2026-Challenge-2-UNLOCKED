---
name: multilingual-nlp
description: "Prompts or documents span languages, transliteration, code-switching, or low-resource text. Specialised GenAI & ML workflow for the RMIT Hackathon with verifiable outputs."
---

# Multilingual Nlp

**Category:** GenAI & ML  
**Trigger:** Prompts or documents span languages, transliteration, code-switching, or low-resource text.

## Required inputs
- Language inventory and expected output
- Train/validation sets and compute budget

## Workflow
1. Identify scripts, language coverage and code-switching; do not assume every row is English.
2. Preserve Unicode in NFC unless task requires exact byte-level reproduction; avoid aggressive stemming or translation by default.
3. Establish word and character n-gram TF-IDF baselines; compare with multilingual sentence embeddings if locally available.
4. If using pretrained models, confirm model license, availability, tokenizer and whether internet/GPU is allowed.
5. Report metrics by language, text length, script and domain; look for majority-language masking.
6. Track performance on rare languages and code-switched samples; apply language-aware validation if possible.

## Outputs
- Per-language error report
- Reproducible baseline comparisons with identical validation folds

## Acceptance gate
Overall score plus per-language checks are available; no target-language leakage.

## Upstream references (not embedded/executed)
- https://github.com/huggingface/skills
- https://github.com/langchain-ai/langchain-skills
