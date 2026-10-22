#!/usr/bin/env python3
"""Example *binary* text classification baseline. Adapt to the released brief.

Requires pandas and scikit-learn. Expects sample_submission to have exactly
one prediction column, plus optional ID. No online packages or Kaggle access.
"""
import argparse


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--train', required=True)
    p.add_argument('--test', required=True)
    p.add_argument('--sample', required=True)
    p.add_argument('--text-column', required=True)
    p.add_argument('--target-column', required=True)
    p.add_argument('--positive-label', required=True)
    p.add_argument('--output', default='submission.csv')
    p.add_argument('--id-column', default='id')
    p.add_argument('--seed', type=int, default=42)
    args = p.parse_args()

    import pandas as pd
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import roc_auc_score
    from sklearn.model_selection import train_test_split
    from sklearn.pipeline import make_pipeline

    train = pd.read_csv(args.train)
    test = pd.read_csv(args.test)
    sample = pd.read_csv(args.sample)
    for df, cols, name in ((train, [args.text_column, args.target_column], 'train'),
                           (test, [args.text_column], 'test')):
        missing = [col for col in cols if col not in df.columns]
        if missing:
            raise ValueError(f'Missing {name} columns: {missing}; actual={list(df.columns)}')
    if len(test) != len(sample):
        raise ValueError('Test/sample row count mismatch')
    if args.id_column in test and args.id_column in sample:
        if not test[args.id_column].astype(str).equals(sample[args.id_column].astype(str)):
            raise ValueError('Test/sample ID order mismatch')
    result_cols = [c for c in sample.columns if c != args.id_column]
    if len(result_cols) != 1:
        raise ValueError(f'Expected exactly one prediction column in sample, found {result_cols}')

    labels = train[args.target_column].astype(str)
    if labels.isna().any() or train[args.target_column].isna().any():
        raise ValueError('Missing training labels')
    if labels.nunique() != 2 or args.positive_label not in set(labels):
        raise ValueError(f'Binary target needed; labels={labels.unique().tolist()}, positive={args.positive_label!r}')
    y = (labels == args.positive_label).astype(int)
    X = train[args.text_column].fillna('').astype(str)
    if X.str.strip().eq('').all():
        raise ValueError('All training text empty')
    X_test = test[args.text_column].fillna('').astype(str)
    if y.value_counts().min() < 2:
        raise ValueError('Not enough rows per class for stratified validation')
    X_fit, X_valid, y_fit, y_valid = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=args.seed)
    model = make_pipeline(
        TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=100000),
        LogisticRegression(max_iter=1000, random_state=args.seed)
    )
    model.fit(X_fit, y_fit)
    positive_index = list(model[-1].classes_).index(1)
    score = roc_auc_score(y_valid, model.predict_proba(X_valid)[:, positive_index])
    print(f'Local stratified holdout ROC-AUC={score:.6f}; seed={args.seed}; positive={args.positive_label!r}')
    print('Caution: random split may leak near-duplicate or grouped examples; inspect task before trusting this score.')
    model.fit(X, y)
    result = sample.copy()
    result[result_cols[0]] = model.predict_proba(X_test)[:, positive_index]
    result.to_csv(args.output, index=False)
    print(f'Wrote {args.output} with {len(result)} rows; prediction column={result_cols[0]!r}')
    print(f'Validate with: python tools/validate_submission.py --sample "{args.sample}" --prediction "{args.output}" --prob-columns {result_cols[0]}')


if __name__ == '__main__':
    main()
