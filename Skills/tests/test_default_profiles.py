import importlib.util
import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CFG = ROOT / 'config/default_skill_profiles.json'

class DefaultProfilesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cfg = json.loads(CFG.read_text(encoding='utf-8'))
        cls.names = {p.parent.name for p in (ROOT/'.agents/skills').glob('*/SKILL.md')}

    def test_all_39_have_defaults(self):
        self.assertEqual(len(self.names), 40)
        self.assertEqual(set(self.cfg['per_skill']), self.names)

    def test_scenarios_reference_only_local_skills(self):
        for name, scenario in self.cfg['scenarios'].items():
            for phase, skills in scenario['phases'].items():
                self.assertLessEqual(len(skills),self.cfg['global']['max_skills_loaded_per_agent_phase'])
                self.assertEqual(len(skills),len(set(skills)))
                self.assertTrue(set(skills)<=self.names,(name,phase))

    def test_defaults_do_not_auto_install_or_submit(self):
        self.assertTrue(self.cfg['global']['safe_mode'])
        self.assertIn('human-approval',self.cfg['global']['external_skill_install'])
        self.assertIn('human-approval',self.cfg['global']['submissions'])
        self.assertEqual(self.cfg['per_skill']['llm-redteam-harness']['cost_cap_usd'],0)
        self.assertFalse(self.cfg['upstream_policy']['install_default'])

    def test_cli_lists_scenarios(self):
        p=subprocess.run([sys.executable,str(ROOT/'tools/skill_plan.py'),'--list'],capture_output=True,text=True,check=True)
        self.assertIn('classification',p.stdout)
        self.assertIn('llm_security',p.stdout)

    def test_cli_json_plan_has_no_implicit_installs(self):
        p=subprocess.run([sys.executable,str(ROOT/'tools/skill_plan.py'),'--scenario','rag','--json'],capture_output=True,text=True,check=True)
        doc=json.loads(p.stdout)
        self.assertEqual(doc['scenario'],'rag')
        self.assertIn('rag-build',[skill['name'] for phase in doc['plan'] for skill in phase['skills']])
        self.assertIn('no actions were executed',doc['warning'])

if __name__=='__main__':
    unittest.main()
