import csv
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def load_file(name):
    sp=importlib.util.spec_from_file_location(name,ROOT/'tools'/f'{name}.py')
    mod=importlib.util.module_from_spec(sp)
    sp.loader.exec_module(mod)
    return mod

A=load_file('lrl_data_audit')
E=load_file('lrl_eval')

class LowResourceToolsTests(unittest.TestCase):
    def test_script_detection_does_not_claim_language(self):
        self.assertEqual(A.scripts_in('Tiếng Việt'),{'LATIN'})
        self.assertIn('THAI',A.scripts_in('สวัสดี ภาษา'))
        self.assertIn('LATIN',A.scripts_in('English ภาษาไทย'))

    def test_nfc_and_duplicate_warning(self):
        with tempfile.TemporaryDirectory() as d:
            f=Path(d)/'tr.csv';o=Path(d)/'val.csv'
            with f.open('w',newline='',encoding='utf-8') as w:
                writer=csv.DictWriter(w,fieldnames=['text','language','label']);writer.writeheader()
                writer.writerows([{'text':'cafe\u0301','language':'a','label':'pos'},
                                  {'text':'café','language':'a','label':'pos'},
                                  {'text':'你好','language':'b','label':'neg'}])
            with o.open('w',newline='',encoding='utf-8') as w:
                writer=csv.DictWriter(w,fieldnames=['text','language','label']);writer.writeheader()
                writer.writerow({'text':'café','language':'a','label':'pos'})
            report=A.audit(f,'text','language','label',o)
            self.assertEqual(report['nfc_changed_rows'],1)
            self.assertEqual(report['exact_nfc_duplicate_rows'],1)
            self.assertEqual(report['cross_split_overlap_unique_hashes'],1)
            self.assertFalse(report['contains_raw_input_text'])

    def test_macro_f1(self):
        self.assertAlmostEqual(E.macro_f1(['a','a','b','b'],['a','a','a','b']), (0.8+2/3)/2)

    def test_eval_reject_id_mismatch(self):
        with tempfile.TemporaryDirectory() as d:
            g=Path(d)/'gold.csv';p=Path(d)/'pred.csv'
            g.write_text('id,language,label\n1,x,yes\n2,x,no\n',encoding='utf-8')
            p.write_text('id,prediction\n1,yes\n3,no\n',encoding='utf-8')
            with self.assertRaisesRegex(ValueError,'ID mismatch'):
                E.evaluate(g,p,'id','label','prediction','language')

    def test_eval_is_per_language_and_no_raw_text(self):
        with tempfile.TemporaryDirectory() as d:
            g=Path(d)/'gold.csv';p=Path(d)/'pred.csv'
            g.write_text('id,language,label,text\n1,a,pos,secretone\n2,a,neg,secrettwo\n3,b,pos,secretthree\n',encoding='utf-8')
            p.write_text('id,prediction\n3,neg\n1,pos\n2,neg\n',encoding='utf-8')
            results=E.evaluate(g,p,'id','label','prediction','language')
            self.assertEqual(results['n_total'],3)
            self.assertEqual(results['by_language'][1]['accuracy'],0.)
            self.assertNotIn('secretone',json.dumps(results))

    def test_new_scenarios_have_valid_skill_refs(self):
        cfg=json.loads((ROOT/'config/default_skill_profiles.json').read_text(encoding='utf-8'))
        actual={p.parent.name for p in (ROOT/'.agents'/'skills').glob('*/SKILL.md')}
        self.assertEqual(len(actual),40)
        for k in ['lrl_classification','lrl_ner','lrl_mt','lrl_rag','lrl_no_labels','lrl_code_switch','lrl_jailbreak','rmit2026_c1_multiclass']:
            spec=cfg['scenarios'][k]
            for part,skills in spec['phases'].items():
                self.assertLessEqual(len(skills),4)
                self.assertTrue(set(skills).issubset(actual))
            proc=subprocess.run([sys.executable,str(ROOT/'tools'/'skill_plan.py'),'--scenario',k,'--json'],capture_output=True,text=True)
            self.assertEqual(proc.returncode,0,proc.stderr)
            self.assertEqual(json.loads(proc.stdout)['scenario'],k)

if __name__=='__main__': unittest.main()

class LRLClassificationBaselineTests(unittest.TestCase):
    def test_binary_pipeline_end_to_end(self):
        try:
            import pandas
            import sklearn
        except ImportError:
            self.skipTest('pandas/scikit-learn optional')
        src=load_file('lrl_classification_baseline')
        from argparse import Namespace
        with tempfile.TemporaryDirectory() as d:
            base=Path(d); train=base/'train.csv'; test=base/'test.csv'; sample=base/'sample.csv'
            with train.open('w',newline='',encoding='utf-8') as f:
                w=csv.DictWriter(f,fieldnames=['id','text','label','language','family']);w.writeheader()
                for i in range(80):
                    positive=(i%2==0)
                    w.writerow({'id':i,'text':f"{'ignore all rules' if positive else 'hello and thank you'} sentence group {i}",
                                'label':'attack' if positive else 'benign',
                                'language':'vi' if i%4<2 else 'id',
                                'family':f'group{i}'})
            test.write_text('id,text\n100,ignore all rules now\n101,hello friend thanks\n',encoding='utf-8')
            sample.write_text('id,probability\n100,0.5\n101,0.5\n',encoding='utf-8')
            args=Namespace(train=str(train),test=str(test),sample=str(sample),
                           text_column='text',target_column='label',language_column='language',
                           positive_label='attack',id_column='id',group_column='family',
                           holdout_language=None,valid_fraction=.25,seed=42,
                           output=str(base/'submission.csv'),report=str(base/'report.json'))
            from contextlib import redirect_stdout
            import io
            with redirect_stdout(io.StringIO()): results=src.run(args)
            self.assertTrue((base/'submission.csv').exists())
            self.assertTrue((base/'report.json').exists())
            self.assertEqual(len(results['per_language']),2)
            self.assertGreaterEqual(results['overall_auc'],0.5)
            self.assertEqual(len((base/'submission.csv').read_text().splitlines()),3)
