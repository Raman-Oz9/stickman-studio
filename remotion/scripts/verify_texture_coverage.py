#!/usr/bin/env python3
"""Fail when generated texture names and the runtime preload cache drift apart."""
import ast
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
generator = (ROOT / "remotion/scripts/gen_assets.py").read_text(encoding="utf-8")
cache = (ROOT / "remotion/src/videos/story/texcache.ts").read_text(encoding="utf-8")
planner_path = ROOT / "remotion/scripts/story_assets.py"

tree = ast.parse(generator)
catalogues = {}
for node in tree.body:
    if isinstance(node, ast.Assign):
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id in {"ITEMS", "SKY"}:
                catalogues[target.id] = ast.literal_eval(node.value)
generated = set(catalogues.get("ITEMS", {})) | set(catalogues.get("SKY", {}))
match = re.search(r"const NAMES = (\[[\s\S]*?\]);", cache)
if not match:
    raise SystemExit("texture cache NAMES catalogue not found")
cached = json.loads(match.group(1))
cached_set = set(cached)
if len(cached) != len(cached_set):
    raise SystemExit("duplicate names in texture cache")
missing = sorted(generated - cached_set)
unknown = sorted(cached_set - generated)
if missing or unknown:
    raise SystemExit(f"texture cache mismatch: missing={missing}, not_generated={unknown}")

# Also check every story-planner rule points to an asset the generator can create.
namespace = {"__name__": "texture_coverage_check"}
exec(compile(ast.parse(planner_path.read_text(encoding="utf-8")), str(planner_path), "exec"), namespace)
rule_assets = {name for _, assets in namespace["RULES"] for name in assets}
unavailable = sorted(rule_assets - generated)
if unavailable:
    raise SystemExit(f"story planner requests assets absent from generator: {unavailable}")

print(f"texture coverage passed: {len(generated)} generated assets are all preloaded; story planner rules are valid")
