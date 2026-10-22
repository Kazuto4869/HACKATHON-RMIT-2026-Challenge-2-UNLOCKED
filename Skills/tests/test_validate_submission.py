import csv
import tempfile
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
from validate_submission import validate


class SubmissionTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        base = Path(self.temp.name)
        self.sample = base / 'sample.csv'
        self.pred = base / 'pred.csv'
        self.write(self.sample, ['id', 'target'], [['b', '0'], ['a', '0']])

    @staticmethod
    def write(path, header, rows):
        with path.open('w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(header)
            writer.writerows(rows)

    def test_valid(self):
        self.write(self.pred, ['id', 'target'], [['b', '0.2'], ['a', '0.9']])
        self.assertEqual(validate(self.sample, self.pred, prob_columns=['target'])[0], 2)

    def test_header_order(self):
        self.write(self.pred, ['target', 'id'], [['0.2', 'b'], ['0.9', 'a']])
        with self.assertRaisesRegex(ValueError, 'Headers/order'):
            validate(self.sample, self.pred)

    def test_id_order(self):
        self.write(self.pred, ['id', 'target'], [['a', '0.2'], ['b', '0.9']])
        with self.assertRaisesRegex(ValueError, 'ID order'):
            validate(self.sample, self.pred)

    def test_bad_probability(self):
        self.write(self.pred, ['id', 'target'], [['b', 'nan'], ['a', '0.9']])
        with self.assertRaisesRegex(ValueError, 'Invalid probability'):
            validate(self.sample, self.pred, prob_columns=['target'])

    def test_row_count(self):
        self.write(self.pred, ['id', 'target'], [['b', '0.2']])
        with self.assertRaisesRegex(ValueError, 'Row count'):
            validate(self.sample, self.pred)

    def test_regression_without_probability_range(self):
        self.write(self.pred, ['id', 'target'], [['b', '-100'], ['a', '200']])
        self.assertEqual(validate(self.sample, self.pred)[0], 2)


if __name__ == '__main__':
    unittest.main()
