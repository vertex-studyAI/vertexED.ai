from __future__ import annotations

import argparse
import random
from dataclasses import dataclass

from .linker import Detection, link_four_frames


@dataclass(frozen=True)
class Result:
    truth_tracks: int
    predicted_tracks: int
    true_positive_tracks: int

    @property
    def precision(self) -> float:
        return self.true_positive_tracks / self.predicted_tracks if self.predicted_tracks else 0.0

    @property
    def recall(self) -> float:
        return self.true_positive_tracks / self.truth_tracks if self.truth_tracks else 0.0


def make_scene(seed: int, tracks: int = 24, distractors_per_frame: int = 18, noise: float = 0.08):
    rng = random.Random(seed)
    frames: list[list[Detection]] = [[] for _ in range(4)]
    truth: set[tuple[str, ...]] = set()

    for t in range(tracks):
        x0, y0 = rng.uniform(-20, 20), rng.uniform(-20, 20)
        vx, vy = rng.uniform(-1.8, 1.8), rng.uniform(-1.8, 1.8)
        ids = []
        for frame in range(4):
            did = f"T{t:03d}F{frame}"
            ids.append(did)
            frames[frame].append(
                Detection(
                    frame,
                    x0 + vx * frame + rng.gauss(0, noise),
                    y0 + vy * frame + rng.gauss(0, noise),
                    did,
                )
            )
        truth.add(tuple(ids))

    for frame in range(4):
        for j in range(distractors_per_frame):
            frames[frame].append(
                Detection(
                    frame,
                    rng.uniform(-25, 25),
                    rng.uniform(-25, 25),
                    f"D{frame}-{j:03d}",
                )
            )
    return frames, truth


def evaluate(seed: int, max_residual: float = 0.45) -> Result:
    frames, truth = make_scene(seed)
    predicted = {track.ids for track in link_four_frames(frames, max_residual=max_residual)}
    return Result(len(truth), len(predicted), len(predicted & truth))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seeds", type=int, default=20)
    parser.add_argument("--max-residual", type=float, default=0.45)
    args = parser.parse_args()

    rows = [evaluate(seed, args.max_residual) for seed in range(args.seeds)]
    tp = sum(r.true_positive_tracks for r in rows)
    pred = sum(r.predicted_tracks for r in rows)
    truth = sum(r.truth_tracks for r in rows)
    precision = tp / pred if pred else 0.0
    recall = tp / truth if truth else 0.0
    print(f"seeds={args.seeds} truth={truth} predicted={pred} tp={tp}")
    print(f"precision={precision:.4f} recall={recall:.4f}")


if __name__ == "__main__":
    main()
