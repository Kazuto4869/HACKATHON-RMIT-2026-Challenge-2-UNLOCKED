---
name: parallel-corpus-mt
description: "Construct translation baseline with language-pair coverage, aligned references and proper metrics. Trigger: Machine translation or instruction translating between LRL pairs."
---

# Parallel Corpus Mt

**Purpose:** Construct translation baseline with language-pair coverage, aligned references and proper metrics.  
**When:** Machine translation or instruction translating between LRL pairs.  
**Owner:** Codex  
**Priority:** P0

## Inputs and prerequisites
- Source/target language codes and scripts
- Aligned pairs, available checkpoints and permitted compute

## Execution procedure
1. Validate parallel data alignment, direction, lengths, empty pairs, duplicates and source-target swaps.
2. Preserve released benchmark/devtest splits; guard against accidental training on FLORES+ devtest or test.
3. Baseline: organizer-provided model; if not available, pretrained direction-supported model if permitted; otherwise transparent dictionary/TM lookup where suitable.
4. Check **actual language ID tokens** and script supported by checkpoint (e.g. NLLB eng_Latn), and read checkpoint version and license.
5. Evaluate with organizer metric; when permitted use chrF plus SacreBLEU, human adequacy/fluency checks for small per-language samples.
6. Manually inspect negation, numbers, proper names, entities, toxicity and script contamination. Keep original reference text.

## Deliverables
- Model/route feasibility sheet, scores by translation direction
- Saved prediction file and qualitative error table

## Quality gate
Correct output language/script, no benchmark leakage, license and resource restrictions checked.

## Do not
Do not claim NLLB supports all languages or that a model is production-suitable merely from leaderboard scores.

## References (human review; not auto-installed)
- https://huggingface.co/datasets/openlanguagedata/flores_plus
- https://huggingface.co/facebook/nllb-200-distilled-600M
- https://github.com/AI4Bharat/IndicTrans2
