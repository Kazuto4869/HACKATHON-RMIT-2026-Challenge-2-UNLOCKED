
#!/usr/bin/env python3
"""Conservative static text scanner for candidate third-party SKILL.md directories.
Does not execute the candidate, resolve references or inspect binary contents.
Return 0: no heuristic red flags; 2: flags; 1: invalid candidate.
"""
from pathlib import Path
import argparse,re,sys
PATTERNS = {
  'remote shell execution':r'(?:curl|wget)\b[^\n]{0,220}\|\s*(?:ba)?sh\b',
  'privilege escalation':r'\b(?:sudo|chmod\s+777|setcap)\b',
  'dangerous recursive deletion':r'\brm\s+-[a-zA-Z]*r[a-zA-Z]*f?\s+',
  'credentials or hidden config':r'(?:\.aws/credentials|\.ssh/id_|\.env\b|OPENAI_API_KEY|ANTHROPIC_API_KEY|KAGGLE_KEY)',
  'network exfil instruction':r'\b(?:upload|POST|exfiltrate|send)\b[^\n]{0,130}\b(?:secret|credential|token|environment variable)\b',
  'shell eval':r'\b(?:eval|exec)\s*\(',
  'unreviewed installs':r'\b(?:pip|npm|npx|uv)\s+(?:install|add|i)\b',
  'instruction override':r'\b(?:ignore previous instructions|override system instructions|disable safety|bypass approval)\b',
  'force auto approval':r'(?:--dangerously-skip-permissions|--ask-for-approval\s+never|--yes\b)'
}
EXT={'.md','.txt','.yaml','.yml','.json','.py','.sh','.ps1','.js','.ts','.toml','.ini'}
def main():
 p=argparse.ArgumentParser();p.add_argument('candidate');a=p.parse_args()
 root=Path(a.candidate).resolve()
 if not root.is_dir() or not (root/'SKILL.md').is_file():
  print('ERROR: expected directory containing SKILL.md',file=sys.stderr);return 1
 found=[];files=0
 for f in root.rglob('*'):
  if f.is_symlink():
   found.append((str(f.relative_to(root)),0,'symlink requires manual verification'));continue
  if not f.is_file():continue
  files+=1
  if f.stat().st_size>512_000:
   found.append((str(f.relative_to(root)),0,'large file not inspected'));continue
  if f.suffix.lower() not in EXT:
   found.append((str(f.relative_to(root)),0,'non-text file needs manual review'));continue
  try: txt=f.read_text(encoding='utf-8')
  except UnicodeError:
   found.append((str(f.relative_to(root)),0,'non-utf8 file not inspected'));continue
  for n,line in enumerate(txt.splitlines(),1):
   for reason,pat in PATTERNS.items():
    if re.search(pat,line,flags=re.IGNORECASE):found.append((str(f.relative_to(root)),n,reason))
 print(f'Inspected candidate={root.name} files={files}, heuristic flags={len(found)}')
 for filename,line,why in found:print(f'  {filename}:{line}: {why}')
 print('A clean scan does not prove safe execution. Review references, permissions, dependencies and source commit manually.')
 return 2 if found else 0
if __name__=='__main__':sys.exit(main())
