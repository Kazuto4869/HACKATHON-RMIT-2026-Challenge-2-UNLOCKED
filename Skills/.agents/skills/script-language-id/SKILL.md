---
name: script-language-id
description: "Handle multilingual IDs, scripts, diacritics, Unicode and noisy transliteration safely. Trigger: Multiple languages or scripts, OCR/transliteration, or code-switched data."
---

# Script Language Id

**Purpose:** Handle multilingual IDs, scripts, diacritics, Unicode and noisy transliteration safely.  
**When:** Multiple languages or scripts, OCR/transliteration, or code-switched data.  
**Owner:** Codex  
**Priority:** P0

## Inputs and prerequisites
- Actual strings, declared language labels and expected output script
- Organizer requirements on preserving exact text

## Execution procedure
1. Sample source text and compare declared vs manually inspected language; never equate script with language.
2. If allowed, normalize Unicode to NFC in a **derived column** while keeping the original untouched and diff-counting changed rows.
3. Keep diacritics, tone markers, punctuation and joiners unless ablation shows removal is harmless for this task.
4. Measure unknown characters, replacement symbols, mixed scripts, invisible controls, empty and very short strings.
5. Assess language-ID confidence (when available), and mark low-confidence/code-mixed cases as unknown or mixed rather than force a single code.
6. Test tokenization on a small multilingual fixture before running pretrained model inference.

## Deliverables
- Text integrity report with changed rows and samples using synthetic fixtures
- Documented language/script mapping

## Quality gate
No unintended text corruption; original text can be reconstructed.

## Do not
Do not run ASCII-only regex cleaning, strip accents indiscriminately, or assume a language-id model recognizes rare languages.

## References (human review; not auto-installed)
- https://huggingface.co/datasets/openlanguagedata/flores_plus
- https://aclanthology.org/2023.acl-long.61/
