#!/usr/bin/env python3
"""Strict official RMIT 2026 C1 CSV validator. No ML dependencies."""
import argparse
from pathlib import Path
import pandas as pd
LABELS = frozenset({'BENIGN','JAILBREAK','PROMPT_INJECTION'})

def validate(test:pd.DataFrame,submission:pd.DataFrame,expected_rows=6000):
    if list(submission.columns)!=['id','label']:
        raise ValueError(f'Expected EXACT columns [id,label], got {list(submission.columns)}')
    if 'id' not in test.columns:
        raise ValueError('Test missing id column')
    if len(test)!=expected_rows or len(submission)!=expected_rows:
        raise ValueError(f'Expected {expected_rows} rows, test={len(test)}, submission={len(submission)}')
    if test['id'].isna().any() or submission['id'].isna().any():
        raise ValueError('Missing IDs')
    if test['id'].duplicated().any() or submission['id'].duplicated().any():
        raise ValueError('Duplicate IDs')
    if list(test['id'].astype(str))!=list(submission['id'].astype(str)):
        raise ValueError('Submission ids must match test ids in the same order')
    if submission['label'].isna().any():
        raise ValueError('Missing predicted labels')
    invalid=set(submission['label'].astype(str))-LABELS
    if invalid:
        raise ValueError(f'Invalid labels: {sorted(invalid)}')
    return { 'ok':True,'rows':expected_rows,'labels':submission['label'].value_counts().to_dict()}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--test',required=True)
    p.add_argument('--submission',required=True)
    p.add_argument('--rows',type=int,default=6000)
    a=p.parse_args()
    result=validate(pd.read_csv(a.test),pd.read_csv(a.submission),a.rows)
    print('VALID',result)
if __name__=='__main__':main()
