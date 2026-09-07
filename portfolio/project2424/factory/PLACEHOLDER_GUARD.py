#!/usr/bin/env python3
from pathlib import Path
import re, sys

TOKENS = [r"\bTBD\b", r"\bTODO\b", r"placeholder", r"No evidence-backed result is available"]

def main(paths):
    bad=[]
    for arg in paths:
        p=Path(arg)
        text=p.read_text(encoding='utf-8')
        hits=[pat for pat in TOKENS if re.search(pat,text,re.I)]
        if hits:
            bad.append((str(p),hits))
    if bad:
        for p,h in bad:
            print(f"FAIL {p}: {', '.join(h)}")
        return 1
    return 0

if __name__=='__main__':
    raise SystemExit(main(sys.argv[1:]))
