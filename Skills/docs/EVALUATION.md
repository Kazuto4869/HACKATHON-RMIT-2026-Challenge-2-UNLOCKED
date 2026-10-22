# Evaluation methodology — choose metric from the brief

| Official metric | Must predict | Main trap | Local evaluation |
|---|---|---|---|
| Accuracy | Discrete class | Majority baseline hides minority failure | `accuracy_score` |
| Binary ROC-AUC | Continuous score for *specified positive class* | Reversed class mapping; thresholded labels | `roc_auc_score(y, score)` |
| Macro F1 | Discrete classes | High majority-class score masks minority errors | `f1_score(average="macro")` |
| Log loss | Class probabilities | Column ordering, confidence calibration | `log_loss` |
| PR-AUC / AP | Scores | Imbalanced data and baseline prevalence | `average_precision_score` |
| RMSE / MAE | Real values | Wrong scaling of target | `root_mean_squared_error` or `mean_absolute_error` |
| Exact match / BLEU / chrF | Text per official spec | Normalization and language/script mismatch | Run specified official evaluator |
| Human rubric | Demo/documentation | App impressive but requirements missing | Checklist mapped to rubric |
| Security ASR | Attack results (authorized) | Judge unreliable, incomplete trials | Predefined success rubric; independent audit |

## Split decision

- IID class samples → stratified holdout (if class sizes allow).
- Same underlying document/conversation/customer across rows → group-based split.
- Deployment to future time → temporal holdout.
- Target evaluation on new language → leave-one-language-out or language-held-out validation.
- Small test size → cross-validation with leakage-safe groups; don't exhaust time tuning.

## Red flags

- Same prompt or paraphrase in train and validation; translated duplicates.
- Fitting TF-IDF/tokenizer/imputer/oversampling to full data before CV.
- Tuning thresholds on test or public leaderboard alone.
- Writing class indices without checking that the model's `classes_` order matches positive label.
- Sending labels or confidential evaluation samples to unauthorized external tools.
- Confusing public leaderboard with final/private score.

## Experiment log minimum

Record: dataset version/hash, code commit, seed, split, exact metric, score, runtime, failure cases by language/attack class and whether the experiment is reproducible. Never report an unexecuted benchmark as a measured result.
