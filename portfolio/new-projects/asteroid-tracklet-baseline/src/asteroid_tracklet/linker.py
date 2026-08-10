from __future__ import annotations

from dataclasses import dataclass
from math import hypot
from typing import Iterable


@dataclass(frozen=True)
class Detection:
    frame: int
    x: float
    y: float
    detection_id: str


@dataclass(frozen=True)
class Tracklet:
    detections: tuple[Detection, ...]

    @property
    def ids(self) -> tuple[str, ...]:
        return tuple(d.detection_id for d in self.detections)


def _predict(a: Detection, b: Detection, frame: int) -> tuple[float, float]:
    dt = b.frame - a.frame
    if dt <= 0:
        raise ValueError("detections must have increasing frame numbers")
    vx = (b.x - a.x) / dt
    vy = (b.y - a.y) / dt
    ahead = frame - b.frame
    return b.x + vx * ahead, b.y + vy * ahead


def _validate_frame_groups(ordered: list[list[Detection]]) -> None:
    """Fail closed when caller-provided frame groups are internally inconsistent."""
    frame_numbers: list[int] = []
    for detections in ordered:
        if not detections:
            continue
        frame = detections[0].frame
        if any(d.frame != frame for d in detections):
            raise ValueError("detections within each frame group must share one frame number")
        frame_numbers.append(frame)

    if len(frame_numbers) == len(ordered) and any(
        current <= previous for previous, current in zip(frame_numbers, frame_numbers[1:])
    ):
        raise ValueError("frame groups must have strictly increasing frame numbers")


def link_four_frames(
    frames: Iterable[Iterable[Detection]], *, max_residual: float = 0.9
) -> list[Tracklet]:
    """Greedy constant-angular-velocity linker for four ordered frames.

    This is deliberately a cheap baseline, not a production asteroid detector.
    Each detection can be used at most once. Candidate extensions are accepted
    only when the angular residual is below ``max_residual``.

    Detection identifiers are allowed to repeat across different frames; usage
    is tracked by ``(frame, detection_id)`` rather than by identifier alone.
    """
    ordered = [sorted(list(f), key=lambda d: d.detection_id) for f in frames]
    if len(ordered) != 4:
        raise ValueError("exactly four frames are required")
    _validate_frame_groups(ordered)
    if any(not f for f in ordered):
        return []

    used: set[tuple[int, str]] = set()
    proposals: list[tuple[float, Tracklet]] = []

    for a in ordered[0]:
        for b in ordered[1]:
            if b.frame <= a.frame:
                continue
            chosen = [a, b]
            total = 0.0
            valid = True
            for candidates in ordered[2:]:
                px, py = _predict(chosen[-2], chosen[-1], candidates[0].frame)
                scored = sorted(
                    ((hypot(c.x - px, c.y - py), c) for c in candidates),
                    key=lambda pair: (pair[0], pair[1].detection_id),
                )
                residual, best = scored[0]
                if residual > max_residual:
                    valid = False
                    break
                chosen.append(best)
                total += residual
            if valid:
                proposals.append((total, Tracklet(tuple(chosen))))

    proposals.sort(key=lambda item: (item[0], item[1].ids))
    accepted: list[Tracklet] = []
    for _, track in proposals:
        detection_keys = {(d.frame, d.detection_id) for d in track.detections}
        if any(key in used for key in detection_keys):
            continue
        accepted.append(track)
        used.update(detection_keys)
    return accepted
