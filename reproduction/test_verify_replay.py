"""Software-only adversarial fixtures; no new scientific experiment or seed."""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import verify_replay as v


def fixtures():
    metrics = {'mean': {'mae': 0.2, 'sample_sd': 0.02},
               'median': {'mae': 0.1, 'sample_sd': 0.01},
               'trim10': {'mae': 0.15, 'sample_sd': 0.03},
               'huber': {'mae': 0.14, 'sample_sd': 0.02}}
    baseline = {'baseline_mae': 0.2, 'robust_mae': 0.1, 'relative_improvement': 0.5}
    ref = {'source_commit': v.FREEZE_COMMIT,
           'screen': {'verdict': 'PASS_HEAVY_TAIL_MEMORY_SCREEN', 'heavy_tail': baseline,
                      'clean': baseline, 'relative_improvement_gap': 0},
           'ablation': {'summary': [{'contamination': rate, **copy.deepcopy(metrics)} for rate in v.RATES]}}
    out = {'seeds': 30, 'queries': 720, 'baselineMae': 0.2, 'robustMae': 0.1, 'relativeImprovement': 0.5}
    screen = {'project': 'T2424-0025', 'verdict': 'PASS_HEAVY_TAIL_MEMORY_SCREEN',
              'benchmark': {'heavyTail': out, 'cleanControl': copy.deepcopy(out), 'nonGaussianAdvantageGap': 0}}
    rows = [{'contaminationRate': rate, 'seeds': 50,
             'metrics': {name: {'mean': metrics[key]['mae'], 'sampleStd': metrics[key]['sample_sd']}
                         for name, key in [('mean', 'mean'), ('median', 'median'), ('trimmed', 'trim10'), ('huber', 'huber')]}}
            for rate in v.RATES]
    ablation = {'project': 'T2424-0025', 'sweep': {'seeds': 50, 'trimFraction': 0.10, 'huberDelta': 0.15, 'rows': rows}}
    return screen, ablation, ref


class ReplayGuardTests(unittest.TestCase):
    def setUp(self):
        self.s, self.a, self.r = fixtures()

    def test_valid_fixture(self):
        v.compare_results(self.s, self.a, self.r)

    def test_wrong_identity(self):
        self.s['project'] = 'P2424-0025'
        with self.assertRaises(ValueError): v.compare_results(self.s, self.a, self.r)

    def test_wrong_source(self):
        self.r['source_commit'] = '0' * 40
        with self.assertRaises(ValueError): v.compare_results(self.s, self.a, self.r)

    def test_altered_seeds(self):
        self.a['sweep']['seeds'] = 51
        with self.assertRaises(ValueError): v.compare_results(self.s, self.a, self.r)

    def test_altered_numeric_result(self):
        self.a['sweep']['rows'][3]['metrics']['huber']['mean'] += 1e-8
        with self.assertRaises(ValueError): v.compare_results(self.s, self.a, self.r)

    def test_missing_clean_control(self):
        self.a['sweep']['rows'].pop(0)
        with self.assertRaises(ValueError): v.compare_results(self.s, self.a, self.r)

    def test_extra_condition(self):
        self.a['sweep']['rows'].append(copy.deepcopy(self.a['sweep']['rows'][0]))
        with self.assertRaises(ValueError): v.compare_results(self.s, self.a, self.r)

    def test_dropped_estimator(self):
        del self.a['sweep']['rows'][0]['metrics']['trimmed']
        with self.assertRaises(ValueError): v.compare_results(self.s, self.a, self.r)

    def test_nan_or_bool_not_numeric_results(self):
        for bad in (True, float('nan'), float('inf'), '0.2'):
            with self.subTest(bad=bad), self.assertRaises(ValueError): v.exact_number(bad, 0.2, 'test')

    def test_altered_gate_verdict(self):
        self.s['verdict'] = 'TRANSFORMER_SUPERIORITY'
        with self.assertRaises(ValueError): v.compare_results(self.s, self.a, self.r)

    def test_source_file_hash_and_unexpected_files(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            source = root / 'source.mjs'
            data = b'// SOFTWARE FIXTURE ONLY\n'
            source.write_bytes(data)
            with patch.object(v, 'SOURCE_BLOBS', {'source.mjs': v.git_blob(data)}):
                v.verify_source(root)
                source.write_bytes(data + b'// changed\n')
                with self.assertRaises(ValueError): v.verify_source(root)
                source.write_bytes(data)
                (root / 'extra').write_text('unregistered')
                with self.assertRaises(ValueError): v.verify_source(root)

    def test_missing_source(self):
        with tempfile.TemporaryDirectory() as name:
            with self.assertRaises(ValueError): v.verify_source(Path(name))

    def test_stdout_digests_reject_paired_mutation(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            for p in v.OUTPUT_SHA256:
                (root / p).write_text('{}')
            with self.assertRaisesRegex(ValueError, 'SHA-256'):
                v.verify_outputs(root, root)

    def test_symlink_rejected(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            (root / 'actual').write_bytes(b'x')
            (root / 'link').symlink_to(root / 'actual')
            with self.assertRaises(ValueError): v.read_bytes(root / 'link')


if __name__ == '__main__':
    unittest.main(verbosity=2)
