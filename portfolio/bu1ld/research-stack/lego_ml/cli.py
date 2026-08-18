import argparse, json
from .registry import REGISTRY
from .core import validate_chain, GraphValidationError

def load_config(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def build(path):
    cfg = load_config(path)
    names = cfg.get('components', [])
    missing = [n for n in names if n not in REGISTRY]
    if missing:
        raise GraphValidationError(f'unknown components: {missing}')
    chain = [REGISTRY[n] for n in names]
    validate_chain(chain)
    return {'name': cfg.get('name','unnamed'), 'components': names, 'status': 'VALID'}

def main(argv=None):
    p = argparse.ArgumentParser(prog='lego')
    sub = p.add_subparsers(dest='cmd', required=True)
    sub.add_parser('list')
    for cmd in ('validate','build'):
        q = sub.add_parser(cmd); q.add_argument('config')
    args = p.parse_args(argv)
    if args.cmd == 'list':
        print('\n'.join(sorted(REGISTRY))); return 0
    try:
        result = build(args.config)
    except GraphValidationError as e:
        print(f'INVALID: {e}'); return 2
    print(json.dumps(result, indent=2)); return 0

if __name__ == '__main__':
    raise SystemExit(main())
