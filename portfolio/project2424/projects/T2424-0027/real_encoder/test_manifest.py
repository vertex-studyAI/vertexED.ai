from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest

from validate_manifest import validate_manifest


HERE = Path(__file__).resolve().parent


def frozen_manifest():
    return json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))


def test_frozen_manifest_passes() -> None:
    validate_manifest(frozen_manifest())


@pytest.mark.parametrize(
    ("path", "value"),
    [
        (("predeclared_success_gate", "mean_effect_retention_min"), 0.2),
        (("predeclared_success_gate", "mean_intent_drop_max"), 0.2),
        (("encoder", "fine_tuning"), True),
        (("encoder", "revision"), "main"),
        (("dataset", "revision"), "main"),
        (("budget", "hyperparameter_search"), "allowed"),
        (("execution_authorized",), False),
    ],
)
def test_scientifically_material_mutations_fail(path, value) -> None:
    data = copy.deepcopy(frozen_manifest())
    target = data
    for key in path[:-1]:
        target = target[key]
    target[path[-1]] = value
    with pytest.raises(AssertionError):
        validate_manifest(data)
