# LIVE C1 (2026-10-22): APPROVED MODEL ONLY

**Mandatory correction:** Official C1 requires fine-tuning ONE of 10 pre-approved backbones. Standalone TF-IDF/LogReg is NOT a valid submission model. Exact metric is macro-F1, output id,label (6000 rows), 6 submission attempts. Read `docs/RMIT_2026_LIVE_BRIEF.md` and use `notebooks/C1_XLMR_Approved_Finetune.ipynb` for approved XLM-R base training. This template has not been trained on user data.

## Official challenge update (22 Oct 2026)

Read `docs/RMIT_2026_LIVE_BRIEF.md` and `START_HERE.md`. C1 is a multilingual **MULTICLASS** prompt-attack Kaggle Code task. This bundle now includes a 39th skill `multilingual-attack-multiclass` and a local multiclass baseline. It does not auto-submit or auto-download models. C2 is a parallel app + TideClock MCP challenge.

# RMIT Hackathon 2026 — Codex + AGY Skills v4

**39 local Agent Skills: 26 foundational + 12 Low-Resource Language skills.**

Read [`START_HERE.md`](START_HERE.md), [`docs/SKILLS_MASTER_GUIDE.md`](docs/SKILLS_MASTER_GUIDE.md), and [`docs/LRL_MASTER_GUIDE.md`](docs/LRL_MASTER_GUIDE.md).

Run `python tools/skill_plan.py --list`, then `python tools/skill_plan.py --scenario lrl_classification`.

All 45 legacy upstream skills are only catalog references; new LRL models/datasets are also reference-only. No automatic installation.

Run `python -m unittest discover -s tests -v`.
