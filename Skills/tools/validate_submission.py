#!/usr/bin/env python3
"""Schema and sanity checks for Kaggle CSV submissions (stdlib only).

This is not a substitute for checking competition-specific constraints.
"""
import argparse
import csv
import math
from pathlib import Path


def read_csv(path):
    path = Path(path)
    if not path.is_file():
        raise ValueError(f'File not found: {path}')
    with path.open('r', encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        if not headers:
            raise ValueError(f'No CSV header in {path}')
        if len(set(headers)) != len(headers):
            raise ValueError(f'Duplicate column names in {path}: {headers}')
        rows = list(reader)
        for i, row in enumerate(rows, start=2):
            if None in row:
                raise ValueError(f'Extra columns at line {i} of {path}')
            if any(v is None for v in row.values()):
                raise ValueError(f'Incomplete row at line {i} of {path}')
    return headers, rows


def validate(sample_path, prediction_path, id_column=None, prob_columns=()):
    expected_headers, samples = read_csv(sample_path)
    actual_headers, predictions = read_csv(prediction_path)
    if expected_headers != actual_headers:
        raise ValueError(f'Headers/order mismatch. Expected {expected_headers}, got {actual_headers}')
    if len(samples) != len(predictions):
        raise ValueError(f'Row count mismatch. Expected {len(samples)}, got {len(predictions)}')
    if not predictions:
        raise ValueError('Submission file contains no data rows')

    if id_column is None:
        id_column = next((h for h in ('id', 'ID', 'Id') if h in expected_headers), None)
    if id_column and id_column not in expected_headers:
        raise ValueError(f'ID column not in sample: {id_column}')
    for col in prob_columns:
        if col not in expected_headers:
            raise ValueError(f'Probability column missing: {col}')

    for i, (sample, pred) in enumerate(zip(samples, predictions), start=2):
        if id_column and sample[id_column] != pred[id_column]:
            raise ValueError(f'ID order/value mismatch at line {i}: {sample[id_column]} != {pred[id_column]}')
        for key, value in pred.items():
            if value is None or not value.strip():
                raise ValueError(f'Empty cell in column {key} at line {i}')
        for key in prob_columns:
            try:
                v = float(pred[key])
            except ValueError as exc:
                raise ValueError(f'Non-numeric probability {key} at line {i}') from exc
            if not math.isfinite(v) or not 0 <= v <= 1:
                raise ValueError(f'Invalid probability {key}={pred[key]} at line {i}')

    return len(predictions), expected_headers


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sample', required=True)
    parser.add_argument('--prediction', required=True)
    parser.add_argument('--id-column', default=None)
    parser.add_argument('--prob-columns', nargs='*', default=[])
    args = parser.parse_args()
    try:
        count, headers = validate(args.sample, args.prediction, args.id_column, args.prob_columns)
    except ValueError as err:
        parser.exit(status=1, message=f'NO-GO: {err}\n')
    print(f'PASS: {count} rows, exact columns/order {headers}; IDs and specified probabilities checked.')
    print('Reminder: task semantics, label direction, numeric regression values, external rules and upload not verified.')


if __name__ == '__main__':
    main()
