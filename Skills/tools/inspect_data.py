#!/usr/bin/env python3
"""Basic Kaggle CSV schema / counts without pandas, network, or data uploads."""
import argparse
import collections
import csv
from pathlib import Path


def inspect(path, target=None, max_rows=100000):
    path = Path(path)
    print(f'\nFILE: {path}')
    if not path.is_file():
        print('  Missing file'); return
    with path.open(encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        print('  Columns:', reader.fieldnames)
        if not reader.fieldnames:
            return
        missing = collections.Counter()
        labels = collections.Counter()
        n = 0
        for row in reader:
            n += 1
            for key in reader.fieldnames:
                if not str(row.get(key) or '').strip():
                    missing[key] += 1
            if target and target in row:
                labels[row[target]] += 1
            if n >= max_rows:
                break
        print(f'  Scanned rows: {n}' + (' (capped)' if n >= max_rows else ''))
        print('  Missing counts:', dict(missing))
        if target:
            if target in reader.fieldnames:
                print('  Label counts:', dict(labels.most_common(25)))
            else:
                print(f'  Target column {target!r} absent')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--train', required=True)
    p.add_argument('--test', required=True)
    p.add_argument('--sample', default=None)
    p.add_argument('--target', default=None)
    p.add_argument('--max-rows', type=int, default=100000)
    a = p.parse_args()
    for path in (a.train, a.test, a.sample):
        if path:
            inspect(path, a.target, a.max_rows)


if __name__ == '__main__':
    main()
