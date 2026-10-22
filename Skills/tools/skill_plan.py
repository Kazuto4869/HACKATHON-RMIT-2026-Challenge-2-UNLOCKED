#!/usr/bin/env python3
"""Print phase-specific skill selections and defaults. No AI/network/code execution."""
import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "config" / "default_skill_profiles.json"

def load() -> dict[str, Any]:
    return json.loads(CONFIG.read_text(encoding="utf-8"))

def generate(scenario: str, config: dict[str, Any] | None = None) -> dict[str, Any]:
    cfg = load() if config is None else config
    selected = cfg["scenarios"][scenario]
    plans = []
    for phase, names in selected["phases"].items():
        if len(names) > cfg["global"]["max_skills_loaded_per_agent_phase"]:
            raise ValueError(f"Too many skills in {phase}")
        plans.append({
            "phase":phase,
            "skills":[{"name":name,"defaults":cfg["per_skill"][name]} for name in names],
        })
    return {
        "scenario":scenario,
        "description":selected["description"],
        "global_defaults":cfg["global"],
        "plan":plans,
        "notes":selected["notes"],
        "warning":"Official challenge rules override all defaults; no actions were executed.",
    }

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--list", action="store_true", help="List supported scenarios")
    parser.add_argument("--scenario", choices=load()["scenarios"].keys(), default="unknown")
    parser.add_argument("--json", action="store_true", help="JSON output")
    args = parser.parse_args()
    if args.list:
        for name, spec in load()["scenarios"].items():
            print(f"{name:16s}  {spec['description']}")
        return
    plan = generate(args.scenario)
    if args.json:
        print(json.dumps(plan, ensure_ascii=False, indent=2))
        return
    print(f"Scenario: {plan['scenario']} — {plan['description']}")
    for p in plan["plan"]:
        names = ", ".join(s["name"] for s in p["skills"]) or "(none)"
        print(f"  {p['phase']:9s}: {names}")
    print(f"Notes: {plan['notes']}")
    print(plan["warning"])

if __name__ == "__main__":
    main()
