import sys, unittest
from pathlib import Path
import pandas as pd
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from c1_submission_validator import validate
class TestC1Validator(unittest.TestCase):
 def setUp(self):
  self.t=pd.DataFrame({'id':['t1','t2','t3']})
  self.s=pd.DataFrame({'id':['t1','t2','t3'],'label':['BENIGN','JAILBREAK','PROMPT_INJECTION']})
 def test_valid(self):self.assertTrue(validate(self.t,self.s,3)['ok'])
 def test_wrong_columns(self):
  with self.assertRaises(ValueError):validate(self.t,self.s[['label','id']],3)
 def test_wrong_order(self):
  with self.assertRaises(ValueError):validate(self.t,self.s.iloc[::-1],3)
 def test_bad_class(self):
  s=self.s.copy();s.loc[0,'label']='benign'
  with self.assertRaises(ValueError):validate(self.t,s,3)
 def test_wrong_rows(self):
  with self.assertRaises(ValueError):validate(self.t,self.s,6000)
 def test_duplicate_id(self):
  s=self.s.copy();s.loc[1,'id']='t1'
  with self.assertRaises(ValueError):validate(self.t,s,3)
if __name__=='__main__':unittest.main()
