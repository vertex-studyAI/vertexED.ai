import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1] / "src"))

from asteroid_tracklet.benchmark import evaluate
from asteroid_tracklet.linker import Detection, link_four_frames


def test_links_clean_constant_velocity_track():
    frames = [
        [Detection(i, 2.0 + 0.5 * i, -1.0 + 0.25 * i, f"t{i}")]
        for i in range(4)
    ]
    tracks = link_four_frames(frames, max_residual=0.01)
    assert [t.ids for t in tracks] == [("t0", "t1", "t2", "t3")]


def test_rejects_non_linear_extension_outside_residual():
    frames = [
        [Detection(0, 0, 0, "a")],
        [Detection(1, 1, 0, "b")],
        [Detection(2, 7, 7, "c")],
        [Detection(3, 8, 7, "d")],
    ]
    assert link_four_frames(frames, max_residual=0.2) == []


def test_synthetic_falsifier_has_useful_signal():
    result = evaluate(seed=7)
    assert result.precision >= 0.70
    assert result.recall >= 0.70
