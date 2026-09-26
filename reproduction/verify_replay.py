#!/usr/bin/env python3
"""Verify preserved T2424-0025 source and an unchanged deterministic replay."""
from __future__ import annotations
import argparse
import hashlib
import json
import math
from pathlib import Path

ARCHIVE_COMMIT = '016e1bdc1f6e38f80d7bbe8b596bcb5349fa0c0a'
FREEZE_COMMIT = '0d2a14e559b0caa9b5b1cbeef0995013594ecf15'
PROJECT_TREE = 'f7793ccc3a32c37f1d09490f747b62b44892c516'
SOURCE_BLOBS = {
    'README.md': '59aa5fdbc7946dc418db3b20ecc2bbeb1dd19af6',
    'REPRODUCE.md': '8a0f485e7f03f06e0bdc5967ff3aba005b01d433',
    'RESULTS.md': '26a1e670fc1e30d62a89000ad4564d34bf47c636',
    'RESULTS_ABLATION_20260812.md': 'c6f536faa7a448df02b102e32cd2737fe239c686',
    'STATUS.md': '8defec41afb6ece42bc88822e8b9a65ad83ff49d',
    'experiment/ablation.mjs': 'ed0e5b600425f67ae3e60e9809d8b9c8378bcaae',
    'experiment/run.mjs': 'e5987fb6021fa0ed550166c8c45c8f4acce6fc1e',
    'experiment_metadata.json': 'ea2c3e2f17ce32364a4dddf801121a4fd738a798',
    'raw_metrics/repro-wave-20260812.json': '363c22a11abbe8fbb7f0b261054f4e46f9723e24',
    'src/core.mjs': '7826f9ba4577b471250ef13faa8e2c854aae4a73',
    'src/robust_readouts.mjs': 'badbc9529d04bc851b7782a9848e81d2d3aaf39a',
}
# Retained reproduction anchors in PR #567; the result comparison also reads the
# exact archived raw_metrics reference, independently of the PR's interpretation.
OUTPUT_SHA256 = {
    'run.json': '7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1',
    'ablation.json': 'f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e',
}
RATES = [0, 0.05, 0.10, 0.18, 0.25, 0.35]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def read_bytes(path: Path) -> bytes:
    require(not path.is_symlink() and path.is_file(), f'Not a regular file: {path.name}')
    with path.open('rb') as f:
        data = f.read(1024 * 1024 + 1)
    require(len(data) <= 1024 * 1024, f'Oversize input: {path.name}')
    return data


def git_blob(data: bytes) -> str:
    return hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()


def verify_source(root: Path) -> dict[str, str]:
    require(root.is_dir() and not root.is_symlink(), 'Missing or symlinked project directory')
    found = set()
    for path in root.rglob('*'):
        require(not path.is_symlink(), 'Symlink in recovered project')
        if path.is_file():
            found.add(path.relative_to(root).as_posix())
    require(found == set(SOURCE_BLOBS), 'Recovered project file set differs from archived tree')
    for path, expected in SOURCE_BLOBS.items():
        require(git_blob(read_bytes(root / path)) == expected, f'Source blob changed: {path}')
    return dict(SOURCE_BLOBS)


def exact_number(actual: object, expected: object, label: str) -> None:
    require(type(actual) in (int, float) and math.isfinite(actual), f'Invalid numeric result: {label}')
    require(actual == expected, f'Retained numeric result differs: {label}')


def compare_results(screen: dict, ablation: dict, reference: dict) -> None:
    require(screen['project'] == ablation['project'] == 'T2424-0025', 'Wrong project identity')
    require(reference['source_commit'] == FREEZE_COMMIT, 'Reference source identity changed')
    require(screen['verdict'] == reference['screen']['verdict'] == 'PASS_HEAVY_TAIL_MEMORY_SCREEN', 'Screen verdict changed')
    for result_name, ref_name in [('heavyTail', 'heavy_tail'), ('cleanControl', 'clean')]:
        result = screen['benchmark'][result_name]
        retained = reference['screen'][ref_name]
        exact_number(result['seeds'], 30, f'{result_name}.seeds')
        exact_number(result['queries'], 720, f'{result_name}.queries')
        for key, refkey in [('baselineMae', 'baseline_mae'), ('robustMae', 'robust_mae'), ('relativeImprovement', 'relative_improvement')]:
            exact_number(result[key], retained[refkey], f'{result_name}.{key}')
    exact_number(screen['benchmark']['nonGaussianAdvantageGap'], reference['screen']['relative_improvement_gap'], 'advantage gap')
    sweep = ablation['sweep']
    exact_number(sweep['seeds'], 50, 'ablation seeds')
    exact_number(sweep['trimFraction'], 0.10, 'trim fraction')
    exact_number(sweep['huberDelta'], 0.15, 'Huber delta')
    require([r['contaminationRate'] for r in sweep['rows']] == RATES, 'Frozen contamination grid changed')
    require([r['contamination'] for r in reference['ablation']['summary']] == RATES, 'Reference grid changed')
    for actual, expected in zip(sweep['rows'], reference['ablation']['summary']):
        exact_number(actual['seeds'], 50, 'per-condition seeds')
        require(set(actual['metrics']) == {'mean', 'median', 'trimmed', 'huber'}, 'Estimator set changed')
        for key, refkey in [('mean', 'mean'), ('median', 'median'), ('trimmed', 'trim10'), ('huber', 'huber')]:
            for metric, refmetric in [('mean', 'mae'), ('sampleStd', 'sample_sd')]:
                exact_number(actual['metrics'][key][metric], expected[refkey][refmetric], f'{actual["contaminationRate"]}:{key}:{metric}')
    clean = sweep['rows'][0]['metrics']
    require(clean['median']['mean'] < clean['mean']['mean'], 'Non-unique-mechanism clean control disappeared')


def verify_outputs(project: Path, output: Path) -> dict:
    content = {name: read_bytes(output / name) for name in OUTPUT_SHA256}
    digests = {name: hashlib.sha256(raw).hexdigest() for name, raw in content.items()}
    require(digests == OUTPUT_SHA256, 'Replay stdout differs from retained SHA-256 anchors')
    screen, ablation = (json.loads(content[name]) for name in ('run.json', 'ablation.json'))
    reference = json.loads(read_bytes(project / 'raw_metrics/repro-wave-20260812.json'))
    compare_results(screen, ablation, reference)
    return {'output_sha256': digests, 'screen_seed_count': 30,
            'ablation_seed_count_per_condition': 50, 'contamination_rates': RATES,
            'clean_control_mae': ablation['sweep']['rows'][0]['metrics'],
            'historical_screen_verdict': screen['verdict'],
            'scientific_interpretation': 'REPRODUCED_MECHANISM_NON_UNIQUE'}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['source', 'results'])
    parser.add_argument('--project', type=Path, default=Path('projects/T2424-0025'))
    parser.add_argument('--output', type=Path, default=Path('evidence/replay'))
    args = parser.parse_args()
    report = {'scope': 'UNCHANGED_FROZEN_SYNTHETIC_REPLAY_ONLY', 'archive_commit': ARCHIVE_COMMIT,
              'freeze_commit': FREEZE_COMMIT, 'project_tree': PROJECT_TREE,
              'new_protocols': 0, 'new_seeds': 0, 'publication_ready': False,
              'transformer_or_unique_non_gaussian_claim': False}
    try:
        report['verified_source_blobs'] = verify_source(args.project)
        if args.mode == 'results':
            report.update(verify_outputs(args.project, args.output))
        report['result'] = 'PASS'
    except (OSError, ValueError, KeyError, TypeError, OverflowError) as exc:
        report.update(result='FAIL', error=str(exc)[:500])
    print(json.dumps(report, indent=2, sort_keys=True))
    return int(report['result'] != 'PASS')


if __name__ == '__main__':
    raise SystemExit(main())
