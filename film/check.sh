#!/bin/bash
# syntax check of film JS/Python (used by agent workflows)
for f in film/*.js film/*.mjs; do [ -f "$f" ] || continue; [ "$f" = film/engine.js ] && continue; node --check "$f" || exit 1; done
for f in film/*.py; do [ -f "$f" ] || continue; python3 -m py_compile "$f" || exit 1; done
exit 0
