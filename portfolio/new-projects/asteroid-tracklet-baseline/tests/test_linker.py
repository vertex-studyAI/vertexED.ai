import sys
from pathlib import Path

import pytest

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


def test_rejects_mixed_frame_numbers_inside_group():
    frames = [
        [Detection(0, 0, 0, "a")],
        [Detection(1, 1, 0, "b"), Detection(2, 5, 5, "bad-frame")],
        [Detection(2, 2, 0, "c")],
        [Detection(3, 3, 0, "d")],
    ]
    with pytest.raises(ValueError, match="share one frame number"):
        link_four_frames(frames)


def test_rejects_non_increasing_frame_groups():
    frames = [
        [Detection(0, 0, 0, "a")],
        [Detection(2, 1, 0, "b")],
        [Detection(1, 2, 0, "c")],
        [Detection(3, 3, 0, "d")],
    ]
    with pytest.raises(ValueError, match="strictly increasing"):
        link_four_frames(frames)


def test_detection_ids_may_repeat_across_different_frames():
    frames = [
        [Detection(0, 0, 0, "0"), Detection(0, 10, 0, "1")],
        [Detection(1, 1, 0, "1"), Detection(1, 11, 0, "0")],
        [Detection(2, 2, 0, "0"), Detection(2, 12, 0, "1")],
        [Detection(3, 3, 0, "1"), Detection(3, 13, 0, "0")],
    ]
    tracks = link_four_frames(frames, max_residual=0.01)
    assert {t.ids for t in tracks} == {("0", "1", "0", "1"), ("1", "0", "1", "0")}


def test_synthetic_falsifier_has_useful_signal():
    result = evaluate(seed=7)
    assert result.precision >= 0.70
    assert result.recall >= 0.70
