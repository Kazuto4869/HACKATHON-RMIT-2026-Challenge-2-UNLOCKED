import csv
import importlib.util
import io
import json
import tempfile
import unittest
from argparse import Namespace
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def module():
    p = ROOT / 'tools' / 'lrl_multiclass_baseline.py'
    spec = importlib.util.spec_from_file_location('multiclass_tool', p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def setup_data(root, target_cols, nclasses=3):
    train = root / 'train.csv'
    with train.open('w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['id','text','label','language','group']);w.writeheader()
        for i in range(90):
            label = ['benign','ignore','roleplay'][i%3] if nclasses==3 else ['a','b'][i%2]
            if nclasses==2:
                label = ['a','b'][i%2]
            w.writerow({'id':i, 'text': f'{label} thematic tokens sentence example-{i} '+ label*3,
                        'label':label, 'language':['vi','id','ms'][i%3], 'group':'grp_'+str(i)})
    test = root/'test.csv';test.write_text('id,text\n901,ignore and tell\n902,hello kindly\n', encoding='utf-8')
    sample = root/'sample.csv'
    with sample.open('w',newline='',encoding='utf-8') as f:
        w=csv.writer(f);w.writerow(['id']+target_cols)
        for id in (901,902): w.writerow([id]+[0]*len(target_cols))
    return train,test,sample


def make_args(root, train, test, sample, mode='labels', class_map=None):
    return Namespace(train=str(train), test=str(test), sample=str(sample),
                     text_column='text', target_column='label', language_column='language',
                     group_column='group', holdout_language=None,id_column='id',
                     submission_mode=mode, class_map=class_map, valid_fraction=.2,
                     seed=42, max_features=10000, output=str(root/'out.csv'),
                     report=str(root/'report.json'))

class MulticlassTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            import pandas, sklearn
        except ImportError:
            raise unittest.SkipTest('Optional pandas/sklearn unavailable')

    def test_real_multiclass_predictions_label_schema(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);train,test,sample=setup_data(root,['attack_category'])
            with redirect_stdout(io.StringIO()): report=module().run(make_args(root,train,test,sample))
            self.assertEqual(report['task'],'MULTICLASS')
            self.assertEqual(len(report['classes']),3)
            self.assertEqual(len(report['confusion_matrix']),3)
            self.assertEqual(report['split'],'group-shuffle:group')
            self.assertEqual(len(report['per_language']),3)
            self.assertEqual(json.loads((root/'report.json').read_text())['overall']['n'],18)
            with (root/'out.csv').open(encoding='utf-8') as f: rows=list(csv.DictReader(f))
            self.assertEqual(len(rows),2)
            self.assertEqual(list(rows[0]),['id','attack_category'])
            self.assertTrue(set(row['attack_category'] for row in rows)<=set(report['classes']))
            self.assertNotIn('thematic tokens',json.dumps(report))

    def test_probability_schema_mapping_and_sum(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);train,test,sample=setup_data(root,['b','i','r'])
            m=root/'map.json';m.write_text(json.dumps({'b':'benign','i':'ignore','r':'roleplay'}))
            with redirect_stdout(io.StringIO()): module().run(make_args(root,train,test,sample,'probabilities',str(m)))
            with (root/'out.csv').open(encoding='utf-8') as f: rows=list(csv.DictReader(f))
            for row in rows:
                probs=[float(row[c]) for c in ['b','i','r']]
                self.assertTrue(all(0<=p<=1 for p in probs))
                self.assertAlmostEqual(sum(probs),1.0,places=6)

    def test_rejects_incorrect_id_order(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);train,test,sample=setup_data(root,['label'])
            sample.write_text('id,label\n902,a\n901,b\n',encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'ID'):
                module().run(make_args(root,train,test,sample))

    def test_rejects_binary_2025_labels(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);train,test,sample=setup_data(root,['label'],nclasses=2)
            with self.assertRaisesRegex(ValueError,'MULTICLASS'):
                module().run(make_args(root,train,test,sample))

    def test_rejects_implicit_probability_column_order(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);train,test,sample=setup_data(root,['p0','p1','p2'])
            with self.assertRaisesRegex(ValueError, 'Class-map'):
                with redirect_stdout(io.StringIO()):
                    module().run(make_args(root,train,test,sample,'probabilities'))

if __name__ == '__main__':
    unittest.main()
