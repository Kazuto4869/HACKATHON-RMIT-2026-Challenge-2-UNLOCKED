#!/usr/bin/env python3
"""Evaluate label predictions with per-language denominators; stdlib only.

Requires actual held-out gold labels. Will not judge generation or machine translation.
ID-based join; does not print raw text or examples.
"""
import argparse
import csv
import json
from collections import Counter,defaultdict
from pathlib import Path


def rows_from_csv(path:Path) -> list[dict[str,str]]:
    with path.open(newline='',encoding='utf-8-sig') as f:
        data=list(csv.DictReader(f))
    if not data: raise ValueError(f'No CSV data rows: {path}')
    return data


def macro_f1(y_true:list[str],y_pred:list[str]) -> float:
    """Macro-F1 over the union of actual/predicted classes, no sklearn needed."""
    classes=set(y_true)|set(y_pred)
    if not classes: raise ValueError('No labels')
    scores=[]
    for c in classes:
        tp=sum(a==c and b==c for a,b in zip(y_true,y_pred))
        fp=sum(a!=c and b==c for a,b in zip(y_true,y_pred))
        fn=sum(a==c and b!=c for a,b in zip(y_true,y_pred))
        denominator=2*tp+fp+fn
        scores.append((2*tp/denominator) if denominator else 0.)
    return sum(scores)/len(scores)


def evaluate(gold_path:Path,pred_path:Path,id_col:str,gold_col:str,pred_col:str,language_col:str) -> dict:
    gold=rows_from_csv(gold_path)
    pred=rows_from_csv(pred_path)
    for title,items,required in [('gold',gold,[id_col,gold_col,language_col]),('pred',pred,[id_col,pred_col])]:
        missing=set(required)-set(items[0])
        if missing: raise ValueError(f'{title}: missing columns {sorted(missing)}')
    ids_gold=[r[id_col] for r in gold];ids_pred=[r[id_col] for r in pred]
    if len(set(ids_gold))!=len(ids_gold) or len(set(ids_pred))!=len(ids_pred):
        raise ValueError('Duplicate IDs in gold or predictions')
    if set(ids_gold)!=set(ids_pred):
        raise ValueError(f'ID mismatch; gold-only={len(set(ids_gold)-set(ids_pred))}, pred-only={len(set(ids_pred)-set(ids_gold))}')
    indexed={r[id_col]:r for r in pred}
    groups=defaultdict(lambda:[[],[]])
    all_true=[];all_pred=[]
    for row in gold:
        t=row[gold_col];p=indexed[row[id_col]][pred_col]
        lang=row[language_col].strip() or 'UNKNOWN'
        if t=='' or p=='': raise ValueError('Empty label; cannot score')
        groups[lang][0].append(t);groups[lang][1].append(p)
        all_true.append(t);all_pred.append(p)
    bylang=[]
    for lang,(true,predicted) in sorted(groups.items()):
        n=len(true)
        bylang.append({'language':lang,'n':n,'accuracy':sum(a==b for a,b in zip(true,predicted))/n,
                       'macro_f1':macro_f1(true,predicted),'gold_counts':dict(Counter(true)),
                       'pred_counts':dict(Counter(predicted)),'small_slice_warning':n<20})
    return {'gold':str(gold_path),'predictions':str(pred_path),'n_total':len(all_true),
            'pooled_accuracy':sum(a==b for a,b in zip(all_true,all_pred))/len(all_true),
            'pooled_macro_f1':macro_f1(all_true,all_pred),
            'mean_language_accuracy':sum(x['accuracy'] for x in bylang)/len(bylang),
            'mean_language_macro_f1':sum(x['macro_f1'] for x in bylang)/len(bylang),
            'by_language':bylang,
            'metric_warning':'Supplemental label metrics only; official contest score may differ.',
            'privacy':'No raw text in report'}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--gold',type=Path,required=True)
    p.add_argument('--predictions',type=Path,required=True)
    p.add_argument('--id-column',default='id')
    p.add_argument('--gold-column',default='label')
    p.add_argument('--pred-column',default='prediction')
    p.add_argument('--language-column',default='language')
    p.add_argument('--output',type=Path)
    args=p.parse_args()
    result=evaluate(args.gold,args.predictions,args.id_column,args.gold_column,args.pred_column,args.language_column)
    output=json.dumps(result,indent=2,ensure_ascii=False)+'\n'
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(output,encoding='utf-8')
        print(f'Wrote aggregate (no raw text) report: {args.output}')
    else: print(output,end='')
if __name__=='__main__': main()
