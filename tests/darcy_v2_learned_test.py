from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys

import torch

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "portfolio/project2424/projects/T2424-0050/src/learned_models.py"
TRAIN = ROOT / "portfolio/project2424/projects/T2424-0050/experiment/train_v2_learned.py"
FREEZE = ROOT / "portfolio/project2424/projects/T2424-0050/v2-freeze-config.json"

spec = importlib.util.spec_from_file_location("darcy_v2_learned_models", SRC)
models = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(models)


def test_frozen_model_grid_shapes_and_parameter_ceiling():
    for modes in [12, 20]:
        for width in [32, 64]:
            model = models.FNO1d(modes=modes, width=width, layers=4)
            output = model(torch.randn(3, 128))
            assert output.shape == (3, 129)
            assert models.parameter_count(model) <= 500_000
            assert torch.equal(output[:, -1], torch.zeros(3))

    for branch_width in [64, 128]:
        for trunk_width in [64, 128]:
            model = models.DeepONet(
                branch_width=branch_width,
                trunk_width=trunk_width,
                hidden_layers=3,
                latent_width=64,
            )
            output = model(torch.randn(3, 128))
            assert output.shape == (3, 129)
            assert models.parameter_count(model) <= 500_000


def test_protocol_training_fails_closed_before_authorization(tmp_path):
    freeze = json.loads(FREEZE.read_text(encoding="utf-8"))
    assert freeze["training_authorized"] is False
    completed = subprocess.run(
        [
            sys.executable,
            str(TRAIN),
            "--kind",
            "fno",
            "--config-json",
            json.dumps({"modes": 12, "width": 32, "layers": 4}),
            "--train",
            str(tmp_path / "train.jsonl.gz"),
            "--validation",
            str(tmp_path / "validation.jsonl.gz"),
            "--freeze-config",
            str(FREEZE),
            "--out",
            str(tmp_path / "out"),
        ],
        capture_output=True,
        text=True,
    )
    assert completed.returncode != 0
    assert "training_authorized is false" in (completed.stdout + completed.stderr)


def test_nonprotocol_smoke_fixture_trains_without_touching_frozen_splits(tmp_path):
    completed = subprocess.run(
        [
            sys.executable,
            str(TRAIN),
            "--kind",
            "deeponet",
            "--config-json",
            json.dumps(
                {
                    "branch_width": 64,
                    "trunk_width": 64,
                    "hidden_layers": 3,
                    "latent_width": 64,
                }
            ),
            "--smoke-fixture",
            "--epochs",
            "1",
            "--out",
            str(tmp_path / "smoke"),
        ],
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    report = json.loads((tmp_path / "smoke/train-report.json").read_text())
    assert report["parameter_count"] <= 500_000
    assert report["epochs_ran"] == 1
    assert report["best_validation_relative_l2"] > 0
