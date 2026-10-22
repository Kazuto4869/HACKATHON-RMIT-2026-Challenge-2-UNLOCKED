# WARNING: NOT a compliant final C1 Kaggle submission model: this uses TF-IDF/LogReg,
# while official C1 requires fine-tuning ONE approved pretrained backbone.
#!/usr/bin/env python3
"""Multilingual MULTICLASS text baseline; local prediction artifact only.

Requires pandas + scikit-learn. This tool does NOT submit a Kaggle notebook.
The official 2026 evaluation metric and Kaggle Code submission requirements
must be read from the released challenge before use.

Label mode: sample_submission.csv must have ID column + ONE target label column.
Probability mode: all remaining sample columns must equal class label strings,
or --class-map path/to/map.json must map each output column to class name.
"""
import argparse
import json
from pathlib import Path


def _load_map(path):
    if not path:
        return None
    mapping = json.loads(Path(path).read_text(encoding='utf-8'))
    if not isinstance(mapping, dict):
        raise ValueError('Class map must be a JSON object: submission_column -> class label')
    return {str(k): str(v) for k, v in mapping.items()}


def _validate_schema(train, test, sample, args):
    tr_cols = [args.text_column, args.target_column]
    if args.language_column:
        tr_cols.append(args.language_column)
    if args.group_column:
        tr_cols.append(args.group_column)
    for name, frame, cols in [('train', train, tr_cols), ('test', test, [args.text_column]),
                              ('sample', sample, [args.id_column])]:
        missing = sorted(set(cols) - set(frame.columns))
        if missing:
            raise ValueError(f'{name} missing columns: {missing}')
    if len(test) != len(sample):
        raise ValueError('Test and sample submission row counts differ')
    if args.id_column in test.columns:
        if not test[args.id_column].astype(str).equals(sample[args.id_column].astype(str)):
            raise ValueError('Test IDs do not match sample IDs in order')
    if sample[args.id_column].isna().any() or sample[args.id_column].duplicated().any():
        raise ValueError('Sample IDs contain missing/duplicate values')
    if train[args.target_column].isna().any():
        raise ValueError('Training labels contain missing values')
    if train[args.target_column].astype(str).nunique() < 3:
        raise ValueError('This is a MULTICLASS baseline: expected at least 3 classes')


def _split_indices(train, y, args):
    import numpy as np
    from sklearn.model_selection import GroupShuffleSplit, train_test_split

    if args.holdout_language:
        if not args.language_column:
            raise ValueError('--holdout-language requires --language-column')
        mask = train[args.language_column].fillna('UNKNOWN').astype(str).eq(args.holdout_language).to_numpy()
        fit_idx = np.flatnonzero(~mask)
        val_idx = np.flatnonzero(mask)
        method = f'language-held-out:{args.holdout_language}'
    elif args.group_column:
        # All missing group values form one group, avoiding accidental leakage.
        groups = train[args.group_column].fillna('__MISSING_GROUP__').astype(str)
        fit_idx, val_idx = next(GroupShuffleSplit(n_splits=1, test_size=args.valid_fraction,
                                                  random_state=args.seed).split(train, y, groups))
        method = f'group-shuffle:{args.group_column}'
    else:
        if y.value_counts().min() < 2:
            raise ValueError('Need at least two examples per class for stratified validation')
        fit_idx, val_idx = train_test_split(np.arange(len(train)), test_size=args.valid_fraction,
                                           random_state=args.seed, stratify=y)
        method = 'stratified-random:verify-related-examples-are-not-split'
    if len(fit_idx) == 0 or len(val_idx) == 0:
        raise ValueError('Empty training or validation split')
    if set(y.iloc[fit_idx]) != set(y):
        raise ValueError('Training fold omits some classes: use a different split or more data')
    return fit_idx, val_idx, method


def run(args):
    import numpy as np
    import pandas as pd
    from sklearn.pipeline import make_pipeline
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import f1_score, accuracy_score, confusion_matrix

    train = pd.read_csv(args.train)
    test = pd.read_csv(args.test)
    sample = pd.read_csv(args.sample)
    _validate_schema(train, test, sample, args)
    x = train[args.text_column].fillna('').astype(str)
    y = train[args.target_column].astype(str)
    languages = (train[args.language_column].fillna('UNKNOWN').astype(str)
                 if args.language_column else pd.Series(['UNKNOWN'] * len(train)))
    classes = sorted(y.unique().tolist())
    fit_idx, val_idx, split_method = _split_indices(train, y, args)

    def estimator():
        return make_pipeline(
            TfidfVectorizer(analyzer='char', ngram_range=(2, 5), min_df=1,
                            max_features=args.max_features, sublinear_tf=True),
            LogisticRegression(max_iter=1500, class_weight='balanced',
                               random_state=args.seed)
        )

    clf = estimator()
    clf.fit(x.iloc[fit_idx], y.iloc[fit_idx])
    actual = y.iloc[val_idx].to_numpy()
    predicted = clf.predict(x.iloc[val_idx])
    val_langs = languages.iloc[val_idx].to_numpy()

    def metrics(a, b):
        return {
            'n': int(len(a)),
            'accuracy': float(accuracy_score(a, b)),
            'macro_f1': float(f1_score(a, b, average='macro', labels=classes,
                                       zero_division=0)),
            'weighted_f1': float(f1_score(a, b, average='weighted', labels=classes,
                                          zero_division=0)),
        }

    per_language = []
    for lang in sorted(set(val_langs)):
        mask = val_langs == lang
        per_language.append({'language': str(lang), **metrics(actual[mask], predicted[mask]),
                             'small_slice_warning': bool(mask.sum() < 20)})
    from sklearn.metrics import classification_report
    report = {
        'task': 'MULTICLASS', 'official_metric': 'UNKNOWN: verify Kaggle Evaluation tab',
        'split': split_method, 'seed': int(args.seed),
        'train_n': len(fit_idx), 'validation_n': len(val_idx),
        'classes': classes, 'overall': metrics(actual, predicted),
        'per_class': classification_report(actual, predicted, labels=classes,
                                           output_dict=True, zero_division=0),
        'confusion_matrix': confusion_matrix(actual, predicted, labels=classes).tolist(),
        'confusion_matrix_label_order': classes,
        'per_language': per_language,
        'warnings': ['Local metrics are NOT the official Kaggle score.',
                     'Check translation/template/family leakage before trusting validation.',
                     'Official 2026 may require a Kaggle CODE submission; CSV is only a local artifact.',
                     'Raw prompt text was intentionally excluded from the report.'],
    }
    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    final = estimator()
    final.fit(x, y)
    label_predictions = final.predict(test[args.text_column].fillna('').astype(str))
    output = sample.copy()
    prediction_cols = [c for c in output.columns if c != args.id_column]
    if args.submission_mode == 'labels':
        if len(prediction_cols) != 1:
            raise ValueError('Label mode expects exactly one prediction column in sample CSV')
        output[prediction_cols[0]] = label_predictions
    else:
        mapping = _load_map(args.class_map)
        if mapping is None:
            mapping = {col: str(col) for col in prediction_cols}
        if set(mapping) != set(prediction_cols):
            raise ValueError('Class-map keys must equal prediction columns in sample CSV')
        if sorted(mapping.values()) != classes:
            raise ValueError('Class-map values must match train class labels one-to-one')
        probabilities = final.predict_proba(test[args.text_column].fillna('').astype(str))
        model_classes = list(final.classes_)
        for col in prediction_cols:
            output[col] = probabilities[:, model_classes.index(mapping[col])]
        row_sums = output[prediction_cols].sum(axis=1).to_numpy()
        if not np.allclose(row_sums, 1.0, atol=1e-6):
            raise ValueError('Probability rows do not sum to one')
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    output.to_csv(args.output, index=False)
    print(json.dumps({'output': args.output, 'report': args.report,
                      'class_count': len(classes), 'local_macro_f1': report['overall']['macro_f1'],
                      'warning': 'LOCAL ONLY. Confirm Kaggle Code submission contract.'}, ensure_ascii=False))
    return report


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--train', required=True)
    p.add_argument('--test', required=True)
    p.add_argument('--sample', required=True)
    p.add_argument('--text-column', required=True)
    p.add_argument('--target-column', required=True)
    p.add_argument('--language-column', help='Optional column used for per-language reporting')
    p.add_argument('--group-column', help='Optional template/translation/conversation group')
    p.add_argument('--holdout-language', help='Evaluate on specified language (if supported)')
    p.add_argument('--id-column', default='id')
    p.add_argument('--submission-mode', choices=['labels', 'probabilities'], default='labels')
    p.add_argument('--class-map', help='JSON dict: output column -> train class label (probabilities mode)')
    p.add_argument('--valid-fraction', type=float, default=0.2)
    p.add_argument('--seed', type=int, default=42)
    p.add_argument('--max-features', type=int, default=120000)
    p.add_argument('--output', default='submission.csv')
    p.add_argument('--report', default='multiclass_validation.json')
    args = p.parse_args()
    if not 0 < args.valid_fraction < 1:
        p.error('--valid-fraction must be between 0 and 1')
    if args.max_features <= 0:
        p.error('--max-features must be > 0')
    run(args)

if __name__ == '__main__':
    main()
