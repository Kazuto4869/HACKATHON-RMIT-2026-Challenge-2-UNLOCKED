# LIVE C1 (2026-10-22): APPROVED MODEL ONLY

**Mandatory correction:** Official C1 requires fine-tuning ONE of 10 pre-approved backbones. Standalone TF-IDF/LogReg is NOT a valid submission model. Exact metric is macro-F1, output id,label (6000 rows), 6 submission attempts. Read `docs/RMIT_2026_LIVE_BRIEF.md` and use `notebooks/C1_XLMR_Approved_Finetune.ipynb` for approved XLM-R base training. This template has not been trained on user data.

# CURRENT COMPETITION — PRIORITY ON 22 OCT 2026

Read [`docs/RMIT_2026_LIVE_BRIEF.md`](docs/RMIT_2026_LIVE_BRIEF.md) **first**. C1 is now explicitly **multiclass**, not 2025 binary. Use `python tools/skill_plan.py --scenario rmit2026_c1_multiclass` and `tools/lrl_multiclass_baseline.py` after verifying actual columns/metrics from Kaggle. C2 is a parallel TideClock MCP app track; both slide deadlines are 18:00 Vietnam time 22/10/2026.

# START HERE — RMIT 2026 Skills v4

**0.** Đọc `AGENTS.md`; ưu tiên official challenge.

**1.** Skill tổng hợp: `docs/SKILLS_MASTER_GUIDE.md` (39 local skills).

**2.** Nếu đề có ngôn ngữ ít tài nguyên: `docs/LRL_MASTER_GUIDE.md`, `docs/LRL_SCENARIOS.md`, `docs/LRL_RESOURCE_CATALOG.csv`.

**3.** Điền `docs/CHALLENGE_BRIEF.md` dựa trên input/output/metric có thật.

**4.** Chạy:

```bash
python tools/skill_plan.py --list
python tools/skill_plan.py --scenario lrl_classification
python -m unittest discover -s tests -v
```

**5.** Codex xây baseline, AGY kiểm đánh giá độc lập; không sửa cùng file/worktree.

**6.** Tuân thủ review thủ công trước download model, cài third-party skills, gọi paid API, submit, Git push và security test bên ngoài.
