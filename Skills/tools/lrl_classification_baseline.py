#!/usr/bin/env python3
"""CPU-first binary multilingual text baseline with held-out slice diagnostics.

Requires pandas and scikit-learn (not installed by this script).
IMPORTANT: Adapt to the official competition's metric and submission contract.
"""
import argparse
import json
from pathlib import Path


def run(args):
    import pandas as pd
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import roc_auc_score, f1_score, accuracy_score
    from sklearn.model_selection import train_test_split, GroupShuffleSplit
    from sklearn.pipeline import make_pipeline

    train=pd.read_csv(args.train)
    test=pd.read_csv(args.test)
    sample=pd.read_csv(args.sample)
    required_train=[args.text_column,args.target_column,args.language_column]
    required_test=[args.text_column]
    if args.group_column: required_train.append(args.group_column)
    for title,frame,columns in [('train',train,required_train),('test',test,required_test)]:
        missing=[c for c in columns if c not in frame.columns]
        if missing: raise ValueError(f'{title} missing columns {missing}')
    if len(test)!=len(sample):raise ValueError('Test and sample submission have different row counts')
    if args.id_column in test and args.id_column in sample:
        if not test[args.id_column].astype(str).equals(sample[args.id_column].astype(str)):
            raise ValueError('Test/sample ID order mismatch')
    result_cols=[c for c in sample.columns if c != args.id_column]
    if len(result_cols)!=1:
        raise ValueError('This binary baseline needs exactly one prediction column; adapt if official schema differs')
    if train[args.target_column].isna().any() or train[args.text_column].isna().all():
        raise ValueError('Missing labels / entirely empty training text')
    ylabels=train[args.target_column].astype(str)
    if ylabels.nunique()!=2 or args.positive_label not in set(ylabels):
        raise ValueError(f'Expected binary labels, found {sorted(ylabels.unique())}, positive={args.positive_label}')
    y=(ylabels==args.positive_label).astype(int)
    X=train[args.text_column].fillna('').astype(str)
    langs=train[args.language_column].fillna('UNKNOWN').astype(str)
    if args.holdout_language:
        v_idx=train.index[langs==args.holdout_language].to_numpy()
        f_idx=train.index[langs!=args.holdout_language].to_numpy()
        if not len(v_idx) or not len(f_idx): raise ValueError('Holdout language absent or covers all rows')
        split_info=f'language-held-out:{args.holdout_language}'
    elif args.group_column:
        groups=train[args.group_column].fillna('__MISSING__').astype(str)
        f_idx,v_idx=next(GroupShuffleSplit(n_splits=1,test_size=args.valid_fraction,random_state=args.seed).split(X,y,groups))
        split_info=f'group-shuffle:{args.group_column}'
    else:
        if y.value_counts().min()<2: raise ValueError('Insufficient examples per class for stratified split')
        f_idx,v_idx=train_test_split(train.index.to_numpy(),stratify=y,test_size=args.valid_fraction,random_state=args.seed)
        split_info='stratified-random:CHECK_TRANSLATION_SIBLINGS'
    if len(set(y.iloc[f_idx]))!=2:
        raise ValueError('Training fold has fewer than two classes; change split or get labels')
    estimator=lambda: make_pipeline(
        TfidfVectorizer(analyzer='char',ngram_range=(2,5),min_df=1,max_features=150000,sublinear_tf=True),
        LogisticRegression(max_iter=1500,class_weight='balanced',random_state=args.seed)
    )
    model=estimator();model.fit(X.iloc[f_idx],y.iloc[f_idx]);scores=model.predict_proba(X.iloc[v_idx])[:,1]
    preds=(scores>=0.5).astype(int)
    yt=y.iloc[v_idx].to_numpy()
    diagnostics=[]
    for lang in sorted(set(langs.iloc[v_idx])):
        mask=(langs.iloc[v_idx].to_numpy()==lang)
        yy=yt[mask];pp=preds[mask];ss=scores[mask]
        slice_doc={'language':lang,'n':int(mask.sum()),'accuracy':float(accuracy_score(yy,pp)),
                   'macro_f1':float(f1_score(yy,pp,average='macro',zero_division=0)),
                   'roc_auc':float(roc_auc_score(yy,ss)) if len(set(yy))==2 else None,
                   'small_slice_warning':bool(mask.sum()<20)}
        diagnostics.append(slice_doc)
    report={
        'split':split_info,'seed':args.seed,'train_n':len(f_idx),'validation_n':len(v_idx),
        'overall_macro_f1':float(f1_score(yt,preds,average='macro',zero_division=0)),
        'overall_auc':float(roc_auc_score(yt,scores)) if len(set(yt))==2 else None,
        'per_language':diagnostics,
        'warnings':['These are local held-out metrics, not the official score.',
                    'Text duplicates and translated sibling leakage require additional human/context-specific audit.',
                    'This example makes probability submission; verify exact target and schema first.']
    }
    print(json.dumps(report,ensure_ascii=False,indent=2))
    report_path=Path(args.report)
    report_path.parent.mkdir(parents=True,exist_ok=True)
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    final=estimator();final.fit(X,y)
    out=sample.copy();out[result_cols[0]]=final.predict_proba(test[args.text_column].fillna('').astype(str))[:,1]
    out.to_csv(args.output,index=False)
    print(f'Wrote {args.output}. Validate using tools/validate_submission.py before submitting.')
    return report


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--train',required=True)
    parser.add_argument('--test',required=True)
    parser.add_argument('--sample',required=True)
    parser.add_argument('--text-column',required=True)
    parser.add_argument('--target-column',required=True)
    parser.add_argument('--language-column',required=True)
    parser.add_argument('--positive-label',required=True)
    parser.add_argument('--id-column',default='id')
    parser.add_argument('--group-column')
    parser.add_argument('--holdout-language')
    parser.add_argument('--valid-fraction',type=float,default=0.2)
    parser.add_argument('--seed',type=int,default=42)
    parser.add_argument('--output',default='submission.csv')
    parser.add_argument('--report',default='language_validation.json')
    args=parser.parse_args()
    if not 0<args.valid_fraction<1: parser.error('--valid-fraction must be between 0 and 1')
    run(args)

if __name__=='__main__':main()
