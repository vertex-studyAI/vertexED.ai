"""FORGE developer-preview runner: executes only explicit argv arrays and records evidence."""
import hashlib, json, os, platform, subprocess, sys, time

def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()

def reproduce(spec_path):
    with open(spec_path, encoding='utf-8') as f:
        spec = json.load(f)
    command = spec.get('command')
    if not isinstance(command, list) or not command or not all(isinstance(x, str) for x in command):
        return {'verdict': 'BLOCKED', 'reason': 'command must be a non-empty argv list'}
    started = time.time()
    cp = subprocess.run(
        command,
        cwd=spec.get('cwd'),
        capture_output=True,
        text=True,
        timeout=spec.get('timeout_seconds', 60),
    )
    artifacts = []
    for path in spec.get('artifacts', []):
        if os.path.isfile(path):
            artifacts.append({'path': path, 'sha256': sha256(path)})
    return {
        'verdict': 'REPRODUCED' if cp.returncode == 0 else 'FAILED',
        'exit_code': cp.returncode,
        'command': command,
        'python': sys.version.split()[0],
        'platform': platform.platform(),
        'duration_seconds': round(time.time() - started, 3),
        'stdout': cp.stdout[-4000:],
        'stderr': cp.stderr[-4000:],
        'artifacts': artifacts,
    }

if __name__ == '__main__':
    print(json.dumps(reproduce(sys.argv[1]), indent=2))
