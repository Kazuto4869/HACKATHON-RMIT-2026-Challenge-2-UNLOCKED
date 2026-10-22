#!/usr/bin/env python3
"""Safe, dependency-free multilingual CSV audit: aggregate counts, hashes, no raw-row logging.

Not a language identifier. Unicode script group ≠ language. This tool does not modify input.
"""
import argparse
import csv
import hashlib
import json
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

SCRIPT_KEYS = (
    'LATIN', 'CYRILLIC', 'ARABIC', 'DEVANAGARI', 'BENGALI', 'TAMIL',
    'TELUGU', 'KANNADA', 'MALAYALAM', 'THAI', 'LAO', 'KHMER', 'MYANMAR',
    'HANGUL', 'HIRAGANA', 'KATAKANA', 'HEBREW', 'ETHIOPIC', 'GEORGIAN',
    'GREEK', 'ARMENIAN', 'GUJARATI', 'GURMUKHI', 'OL CHIKI', 'MEETEI MAYEK',
)

def normalize(text: str) -> str:
    """Strict NFC only, original never overwritten."""
    return unicodedata.normalize('NFC', text)


def scripts_in(text: str) -> set[str]:
    detected: set[str] = set()
    for ch in text:
        if not ch.isalpha():
            continue
        code_name = unicodedata.name(ch, '')
        for script in SCRIPT_KEYS:
            if script in code_name:
                detected.add(script)
                break
        else:
            if 'CJK UNIFIED IDEOGRAPH' in code_name or 'IDEOGRAPH' in code_name:
                detected.add('HAN')
            else:
                detected.add('OTHER_OR_UNKNOWN')
    return detected


def read_csv(path: Path, limit: int | None = None) -> tuple[list[str], list[dict[str,str]], int]:
    with path.open(encoding='utf-8-sig', newline='') as file:
        reader=csv.DictReader(file)
        columns=list(reader.fieldnames or [])
        if not columns:
            raise ValueError(f'Missing CSV header: {path}')
        rows=[];total=0
        for row in reader:
            total+=1
            if limit is None or len(rows)<limit:
                rows.append(row)
    return columns,rows,total


def digest(text: str) -> str:
    return hashlib.sha256(normalize(text).encode('utf-8')).hexdigest()


def audit(path: Path, text_col: str, language_col: str | None = None,
          label_col: str | None = None, other_split: Path | None = None,
          limit: int = 100000) -> dict:
    columns,rows,total_count=read_csv(path,limit=limit)
    required=[text_col]+([language_col] if language_col else [])+([label_col] if label_col else [])
    missing=[col for col in required if col not in columns]
    if missing:
        raise ValueError('Missing expected columns: '+', '.join(missing)+'; available: '+', '.join(columns))
    langs=Counter()
    labels=defaultdict(Counter)
    script_counts=Counter()
    missing_text=0; changed_nfc=0; multiple_scripts=0; n_replacement=0
    hashes=[]
    for row in rows:
        raw=(row.get(text_col) or '')
        if not raw.strip(): missing_text+=1
        if normalize(raw)!=raw: changed_nfc+=1
        if '\ufffd' in raw: n_replacement+=1
        scripts=scripts_in(raw)
        if len(scripts)>1: multiple_scripts+=1
        for script in scripts: script_counts[script]+=1
        lang=((row.get(language_col) or '') if language_col else 'UNSPECIFIED').strip() or 'UNKNOWN'
        langs[lang]+=1
        if label_col: labels[lang][(row.get(label_col) or '').strip() or 'MISSING']+=1
        hashes.append(digest(raw))
    counts=Counter(hashes)
    result={
        'source':str(path),'rows_total':total_count,'rows_inspected':len(rows),
        'truncated':len(rows)<total_count,'columns':columns,
        'language_counts':dict(langs),'label_counts_by_language':{k:dict(v) for k,v in labels.items()},
        'scripts_by_row_presence':dict(script_counts),
        'rows_with_multiple_unicode_script_groups':multiple_scripts,
        'note':'Unicode scripts are NOT proof of language or code-switching.',
        'missing_text_rows':missing_text,'nfc_changed_rows':changed_nfc,
        'rows_with_replacement_character':n_replacement,
        'exact_nfc_duplicate_rows':sum(count-1 for count in counts.values() if count>1),
        'cross_split_overlap_unique_hashes':None,
        'contains_raw_input_text':False,
    }
    if other_split:
        other_columns,other_rows,_=read_csv(other_split)
        if text_col not in other_columns:
            raise ValueError(f'{text_col} not in {other_split}')
        ref_hashes={digest(row.get(text_col) or '') for row in other_rows}
        result['cross_split_overlap_unique_hashes']=len(set(hashes)&ref_hashes)
    return result


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--csv',type=Path,required=True)
    p.add_argument('--text-column',required=True)
    p.add_argument('--language-column')
    p.add_argument('--label-column')
    p.add_argument('--other-split',type=Path,help='Optional extra CSV to check NFC-exact text leakage')
    p.add_argument('--max-rows',type=int,default=100000)
    p.add_argument('--output',type=Path,help='JSON report path, if omitted prints aggregate JSON')
    args=p.parse_args()
    if args.max_rows < 1: p.error('--max-rows must be positive')
    result=audit(args.csv,args.text_column,args.language_column,args.label_column,args.other_split,args.max_rows)
    serialized=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(serialized,encoding='utf-8')
        print(f'Wrote aggregate (no raw text) report: {args.output}')
    else: print(serialized,end='')
if __name__=='__main__': main()
