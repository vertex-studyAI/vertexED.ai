from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import os
import platform
import random
import statistics
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import numpy as np
import torch
import torch.nn as nn


PROTOCOL = "NGMT-v0.1-frozen-2026-08-13"
TRAIN_SEEDS = [11, 23, 37]
TRAIN_CONDITIONS = ["gaussian_clean", "student_t", "two_mode", "regime_switch"]
EVAL_CONDITIONS = [
    "gaussian_clean",
    "student_t",
    "two_mode",
    "regime_switch",
    "outlier_bursts",
    "nonstationary_mixture",
]
ADVERSE_CONDITIONS = [
    "student_t",
    "two_mode",
    "regime_switch",
    "outlier_bursts",
    "nonstationary_mixture",
]
ARMS = ["B0", "B1", "B2", "B3"]
ANCHORS = [31, 47, 63, 78]
SEQ_LEN = 80
CONTEXT = 16
K = 6
D_MODEL = 24
EPS = 1e-4
NU = 3.0


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.use_deterministic_algorithms(True, warn_only=True)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def stable_softmax(logw: np.ndarray) -> np.ndarray:
    z = np.asarray(logw, dtype=np.float64)
    z = z - np.max(z)
    w = np.exp(z)
    den = float(np.sum(w))
    if not math.isfinite(den) or den <= 0:
        raise FloatingPointError("non-finite responsibility normalization")
    return w / den


@dataclass
class MemoryState:
    mu: np.ndarray
    var: np.ndarray
    mass: np.ndarray
    seeded: int = 0

    @property
    def scalar_capacity(self) -> int:
        return int(self.mu.size + self.var.size + self.mass.size)


class OnlineMemory:
    def __init__(self, arm: str) -> None:
        if arm not in ARMS:
            raise ValueError(f"unknown arm: {arm}")
        self.arm = arm
        self.state = MemoryState(
            mu=np.zeros(K, dtype=np.float64),
            var=np.ones(K, dtype=np.float64),
            mass=np.full(K, 1e-3, dtype=np.float64),
            seeded=0,
        )

    def _log_responsibilities(self, x: float) -> np.ndarray:
        mu = self.state.mu
        var = np.maximum(self.state.var, EPS)
        mass = np.maximum(self.state.mass, 1e-12)
        residual2 = (x - mu) ** 2
        if self.arm == "B1":
            return -residual2 / 2.0
        if self.arm == "B2":
            return np.log(mass) - 0.5 * (np.log(2.0 * math.pi * var) + residual2 / var)
        if self.arm == "B3":
            delta2 = residual2 / var
            const = math.lgamma((NU + 1.0) / 2.0) - math.lgamma(NU / 2.0)
            return (
                np.log(mass)
                + const
                - 0.5 * np.log(NU * math.pi * var)
                - ((NU + 1.0) / 2.0) * np.log1p(delta2 / NU)
            )
        raise RuntimeError("B0 has no responsibilities")

    def _responsibilities(self, x: float) -> np.ndarray:
        return stable_softmax(self._log_responsibilities(float(x)))

    def _read(self, x: float) -> np.ndarray:
        r = self._responsibilities(x)
        location = float(np.sum(r * self.state.mu))
        dispersion = float(np.sqrt(np.sum(r * np.maximum(self.state.var, EPS))))
        if not (math.isfinite(location) and math.isfinite(dispersion)):
            raise FloatingPointError("non-finite memory read")
        return np.array([location, dispersion], dtype=np.float64)

    def consume(self, x: float) -> np.ndarray:
        x = float(x)
        if self.arm == "B0":
            return np.zeros(2, dtype=np.float64)

        if self.state.seeded < K:
            idx = self.state.seeded
            self.state.mu[idx] = x
            # var=1 and mass=1e-3 are intentionally retained from the frozen initial policy.
            self.state.seeded += 1
            return self._read(x)

        r = self._responsibilities(x)
        n = self.state.mass.copy()
        alpha = np.minimum(0.25, r / (n + r + 1e-6))
        old_mu = self.state.mu.copy()
        residual = x - old_mu

        if self.arm == "B3":
            var = np.maximum(self.state.var, EPS)
            delta2 = (residual**2) / var
            influence = (NU + 1.0) / (NU + delta2)
            beta = alpha * influence
        else:
            beta = alpha

        self.state.mu = old_mu + beta * residual
        self.state.var = (1.0 - beta) * self.state.var + beta * (residual**2)
        self.state.var = np.maximum(self.state.var, EPS)
        self.state.mass = self.state.mass + r

        return self._read(x)


def memory_features(sequence: np.ndarray, arm: str) -> np.ndarray:
    memory = OnlineMemory(arm)
    rows = np.zeros((len(sequence), 2), dtype=np.float64)
    for t, x in enumerate(sequence):
        rows[t] = memory.consume(float(x))
    return rows


def generate_sequence(rng: np.random.Generator, condition: str, length: int = SEQ_LEN) -> np.ndarray:
    x = np.zeros(length, dtype=np.float64)

    if condition in {"gaussian_clean", "student_t", "outlier_bursts"}:
        x[0] = rng.normal(0.0, 0.5)
        for t in range(1, length):
            if condition == "student_t":
                noise = 0.20 * rng.standard_t(2.5)
            else:
                noise = rng.normal(0.0, 0.35)
            value = 0.75 * x[t - 1] + noise
            if condition == "outlier_bursts" and rng.random() < 0.06:
                value += rng.normal(0.0, 4.0)
            x[t] = value
        return x

    if condition in {"two_mode", "nonstationary_mixture"}:
        mode = -1.5 if rng.random() < 0.5 else 1.5
        for t in range(length):
            if condition == "two_mode":
                p_switch = 0.04
            else:
                p_switch = 0.01 if t < length // 2 else 0.12
            if t > 0 and rng.random() < p_switch:
                mode = -mode
            x[t] = mode + rng.normal(0.0, 0.25)
        return x

    if condition == "regime_switch":
        coeff = 0.85 if rng.random() < 0.5 else -0.45
        x[0] = rng.normal(0.0, 0.5)
        for t in range(1, length):
            if rng.random() < 0.035:
                coeff = -0.45 if coeff > 0 else 0.85
            x[t] = coeff * x[t - 1] + rng.normal(0.0, 0.25)
        return x

    raise ValueError(f"unknown condition: {condition}")


def generate_group(rng: np.random.Generator, condition: str, n: int) -> List[np.ndarray]:
    return [generate_sequence(rng, condition) for _ in range(n)]


def generate_train_validation(seed: int) -> Tuple[List[np.ndarray], List[np.ndarray]]:
    rng = np.random.default_rng(seed)
    train: List[np.ndarray] = []
    validation: List[np.ndarray] = []
    for condition in TRAIN_CONDITIONS:
        train.extend(generate_group(rng, condition, 160))
    for condition in TRAIN_CONDITIONS:
        validation.extend(generate_group(rng, condition, 40))
    return train, validation


def generate_evaluation(seed: int) -> Dict[str, List[np.ndarray]]:
    rng = np.random.default_rng(10000 + seed)
    return {condition: generate_group(rng, condition, 120) for condition in EVAL_CONDITIONS}


def make_examples(sequences: Iterable[np.ndarray], arm: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    contexts: List[np.ndarray] = []
    memories: List[np.ndarray] = []
    targets: List[float] = []
    for sequence in sequences:
        feats = memory_features(sequence, arm)
        for t in ANCHORS:
            contexts.append(sequence[t - CONTEXT + 1 : t + 1].reshape(CONTEXT, 1))
            memories.append(feats[t])
            targets.append(float(sequence[t + 1]))
    return (
        np.asarray(contexts, dtype=np.float32),
        np.asarray(memories, dtype=np.float32),
        np.asarray(targets, dtype=np.float32).reshape(-1, 1),
    )


class TinyTransformer(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.input_proj = nn.Linear(1, D_MODEL)
        self.pos = nn.Parameter(torch.zeros(1, CONTEXT, D_MODEL))
        nn.init.normal_(self.pos, mean=0.0, std=0.02)
        self.block = nn.TransformerEncoderLayer(
            d_model=D_MODEL,
            nhead=3,
            dim_feedforward=48,
            dropout=0.0,
            activation="gelu",
            batch_first=True,
            norm_first=False,
        )
        self.memory_proj = nn.Linear(2, D_MODEL)
        self.head = nn.Sequential(
            nn.LayerNorm(D_MODEL),
            nn.Linear(D_MODEL, D_MODEL),
            nn.GELU(),
            nn.Linear(D_MODEL, 1),
        )
        mask = torch.full((CONTEXT, CONTEXT), float("-inf"))
        mask = torch.triu(mask, diagonal=1)
        self.register_buffer("causal_mask", mask, persistent=False)

    def forward(self, context: torch.Tensor, memory: torch.Tensor) -> torch.Tensor:
        h = self.input_proj(context) + self.pos
        h = self.block(h, src_mask=self.causal_mask)
        final = h[:, -1, :] + self.memory_proj(memory)
        return self.head(final)


def trainable_parameters(model: nn.Module) -> int:
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


def batches(indices: np.ndarray, batch_size: int = 64) -> Iterable[np.ndarray]:
    for start in range(0, len(indices), batch_size):
        yield indices[start : start + batch_size]


@torch.no_grad()
def evaluate_arrays(model: nn.Module, arrays: Tuple[np.ndarray, np.ndarray, np.ndarray]) -> Dict[str, float]:
    model.eval()
    x, m, y = arrays
    pred_rows = []
    for start in range(0, len(x), 256):
        xb = torch.from_numpy(x[start : start + 256])
        mb = torch.from_numpy(m[start : start + 256])
        pred_rows.append(model(xb, mb).cpu().numpy())
    pred = np.concatenate(pred_rows, axis=0).astype(np.float64)
    target = y.astype(np.float64)
    err = pred - target
    return {
        "mse": float(np.mean(err**2)),
        "mae": float(np.mean(np.abs(err))),
        "n": int(len(target)),
    }


def train_one(
    *,
    seed: int,
    arm: str,
    train_sequences: List[np.ndarray],
    validation_sequences: List[np.ndarray],
    eval_sequences: Dict[str, List[np.ndarray]],
    initial_state: Dict[str, torch.Tensor],
    output_dir: Path,
) -> Dict[str, object]:
    set_seed(seed)
    model = TinyTransformer()
    model.load_state_dict(initial_state)
    parameter_count = trainable_parameters(model)
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-3, weight_decay=1e-4)
    loss_fn = nn.MSELoss()

    train_arrays = make_examples(train_sequences, arm)
    validation_arrays = make_examples(validation_sequences, arm)
    train_x, train_m, train_y = train_arrays

    start_time = time.perf_counter()
    history = []
    for epoch in range(6):
        model.train()
        permutation = np.random.default_rng(100000 + 1000 * seed + epoch).permutation(len(train_x))
        losses = []
        for idx in batches(permutation, 64):
            xb = torch.from_numpy(train_x[idx])
            mb = torch.from_numpy(train_m[idx])
            yb = torch.from_numpy(train_y[idx])
            optimizer.zero_grad(set_to_none=True)
            pred = model(xb, mb)
            loss = loss_fn(pred, yb)
            if not torch.isfinite(loss):
                raise FloatingPointError(f"non-finite training loss for {arm} seed {seed}")
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            losses.append(float(loss.detach().cpu()))
        history.append({"epoch": epoch + 1, "train_mse": float(np.mean(losses))})

    runtime = time.perf_counter() - start_time
    validation = evaluate_arrays(model, validation_arrays)
    conditions = {
        condition: evaluate_arrays(model, make_examples(sequences, arm))
        for condition, sequences in eval_sequences.items()
    }

    ckpt_path = output_dir / f"ngmt_v01_seed{seed}_{arm}.pt"
    torch.save(model.state_dict(), ckpt_path)

    return {
        "seed": seed,
        "arm": arm,
        "status": "complete",
        "trainable_parameters": parameter_count,
        "runtime_seconds": runtime,
        "train_examples": int(len(train_x)),
        "validation": validation,
        "conditions": conditions,
        "history": history,
        "checkpoint": str(ckpt_path.name),
        "checkpoint_sha256": sha256_file(ckpt_path),
        "memory_scalar_capacity": 0 if arm == "B0" else 18,
    }


def sample_sd(values: List[float]) -> float:
    return float(statistics.stdev(values)) if len(values) > 1 else 0.0


def aggregate_runs(runs: List[Dict[str, object]]) -> Dict[str, object]:
    complete = [r for r in runs if r.get("status") == "complete"]
    by_arm_seed = {(r["arm"], r["seed"]): r for r in complete}

    condition_summary: Dict[str, Dict[str, object]] = {}
    for arm in ARMS:
        condition_summary[arm] = {}
        for condition in EVAL_CONDITIONS:
            vals = [float(by_arm_seed[(arm, seed)]["conditions"][condition]["mse"]) for seed in TRAIN_SEEDS]
            maes = [float(by_arm_seed[(arm, seed)]["conditions"][condition]["mae"]) for seed in TRAIN_SEEDS]
            condition_summary[arm][condition] = {
                "mse_mean": float(np.mean(vals)),
                "mse_sample_sd": sample_sd(vals),
                "mae_mean": float(np.mean(maes)),
                "mae_sample_sd": sample_sd(maes),
                "n_seeds": len(vals),
                "n_examples_per_seed": int(by_arm_seed[(arm, TRAIN_SEEDS[0])]["conditions"][condition]["n"]),
            }

    seed_effects = []
    for seed in TRAIN_SEEDS:
        adverse = {}
        for arm in ARMS:
            adverse[arm] = float(
                np.mean([
                    by_arm_seed[(arm, seed)]["conditions"][condition]["mse"]
                    for condition in ADVERSE_CONDITIONS
                ])
            )
        b3_b2 = (adverse["B2"] - adverse["B3"]) / adverse["B2"]
        b3_b1 = (adverse["B1"] - adverse["B3"]) / adverse["B1"]
        clean_b2 = float(by_arm_seed[("B2", seed)]["conditions"]["gaussian_clean"]["mse"])
        clean_b3 = float(by_arm_seed[("B3", seed)]["conditions"]["gaussian_clean"]["mse"])
        clean_regression = (clean_b3 - clean_b2) / clean_b2
        seed_effects.append(
            {
                "seed": seed,
                "adverse_mse": adverse,
                "relative_b3_over_b2": float(b3_b2),
                "relative_b3_over_b1": float(b3_b1),
                "gaussian_clean_relative_regression_b3_vs_b2": float(clean_regression),
            }
        )

    b3_b2_vals = [row["relative_b3_over_b2"] for row in seed_effects]
    b3_b1_vals = [row["relative_b3_over_b1"] for row in seed_effects]
    clean_vals = [row["gaussian_clean_relative_regression_b3_vs_b2"] for row in seed_effects]

    parameter_counts = {arm: sorted({int(r["trainable_parameters"]) for r in complete if r["arm"] == arm}) for arm in ARMS}
    params_equal = len({counts[0] for counts in parameter_counts.values() if len(counts) == 1}) == 1 and all(len(v) == 1 for v in parameter_counts.values())
    capacities = {arm: sorted({int(r["memory_scalar_capacity"]) for r in complete if r["arm"] == arm}) for arm in ARMS}
    memory_matched = capacities["B1"] == [18] and capacities["B2"] == [18] and capacities["B3"] == [18]
    b3_complete = all(("B3", seed) in by_arm_seed for seed in TRAIN_SEEDS)

    means = {
        "relative_b3_over_b2_mean": float(np.mean(b3_b2_vals)),
        "relative_b3_over_b2_sample_sd": sample_sd(b3_b2_vals),
        "relative_b3_over_b1_mean": float(np.mean(b3_b1_vals)),
        "relative_b3_over_b1_sample_sd": sample_sd(b3_b1_vals),
        "gaussian_clean_relative_regression_b3_vs_b2_mean": float(np.mean(clean_vals)),
        "gaussian_clean_relative_regression_b3_vs_b2_sample_sd": sample_sd(clean_vals),
        "n_seeds": 3,
    }

    criteria = {
        "b3_over_b2_at_least_5pct": means["relative_b3_over_b2_mean"] >= 0.05,
        "b3_over_b1_at_least_3pct": means["relative_b3_over_b1_mean"] >= 0.03,
        "clean_regression_at_most_2pct": means["gaussian_clean_relative_regression_b3_vs_b2_mean"] <= 0.02,
        "no_b3_failure": b3_complete,
        "identical_trainable_parameter_counts": params_equal,
        "b1_b2_b3_equal_memory_capacity": memory_matched,
    }
    passed = all(criteria.values())

    return {
        "condition_summary": condition_summary,
        "seed_effects": seed_effects,
        "paired_effect_summary": means,
        "parameter_counts": parameter_counts,
        "memory_scalar_capacities": capacities,
        "criteria": criteria,
        "verdict": "PASS_NGMT_V01_DEVELOPMENT_GATE" if passed else "NEGATIVE_OR_INCONCLUSIVE_NGMT_V01",
    }


def environment() -> Dict[str, object]:
    return {
        "python": sys.version,
        "numpy": np.__version__,
        "torch": torch.__version__,
        "platform": platform.platform(),
        "machine": platform.machine(),
        "cpu_count": os.cpu_count(),
        "cuda_available": torch.cuda.is_available(),
        "device": "cpu",
        "dtype": "float32",
    }


def run(output_dir: Path) -> Dict[str, object]:
    output_dir.mkdir(parents=True, exist_ok=True)
    runs: List[Dict[str, object]] = []

    for seed in TRAIN_SEEDS:
        train_sequences, validation_sequences = generate_train_validation(seed)
        eval_sequences = generate_evaluation(seed)

        set_seed(seed)
        base = TinyTransformer()
        initial_state = copy.deepcopy(base.state_dict())

        for arm in ARMS:
            try:
                result = train_one(
                    seed=seed,
                    arm=arm,
                    train_sequences=train_sequences,
                    validation_sequences=validation_sequences,
                    eval_sequences=eval_sequences,
                    initial_state=initial_state,
                    output_dir=output_dir,
                )
            except FloatingPointError as error:
                result = {
                    "seed": seed,
                    "arm": arm,
                    "status": "divergent",
                    "error": str(error),
                    "trainable_parameters": trainable_parameters(base),
                    "memory_scalar_capacity": 0 if arm == "B0" else 18,
                }
            runs.append(result)

    aggregate = aggregate_runs(runs) if all(r.get("status") == "complete" for r in runs) else {
        "verdict": "NEGATIVE_OR_INCONCLUSIVE_NGMT_V01",
        "reason": "one_or_more_runs_failed_or_diverged",
    }

    payload = {
        "schema_version": 1,
        "protocol": PROTOCOL,
        "protocol_files": [
            "portfolio/research/ngmt/NGMT_V01_PROTOCOL.md",
            "portfolio/research/ngmt/NGMT_V01_PROTOCOL_CLARIFICATION.md",
            "portfolio/research/ngmt/NGMT_V01_TRAINING_FIXTURE.md",
            "portfolio/research/ngmt/NGMT_V01_VERDICT_RULE.md",
        ],
        "training_seeds": TRAIN_SEEDS,
        "evaluation_seed_rule": "10000 + training_seed",
        "train_conditions": TRAIN_CONDITIONS,
        "evaluation_conditions": EVAL_CONDITIONS,
        "adverse_conditions": ADVERSE_CONDITIONS,
        "anchors": ANCHORS,
        "environment": environment(),
        "runs": runs,
        "aggregate": aggregate,
        "claim_boundary": "Tiny synthetic development experiment only; no general Transformer, language-model, long-context, real-data, AGI, external-validation, or publication claim.",
    }

    out = output_dir / "results.json"
    out.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    payload["results_sha256"] = sha256_file(out)
    (output_dir / "completion.json").write_text(
        json.dumps(
            {
                "protocol": PROTOCOL,
                "verdict": aggregate.get("verdict"),
                "results_sha256": payload["results_sha256"],
                "run_count": len(runs),
            },
            indent=2,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the frozen NGMT v0.1 B0-B3 development protocol.")
    parser.add_argument("--output-dir", default="artifacts/ngmt-v01")
    args = parser.parse_args()
    result = run(Path(args.output_dir))
    print(json.dumps({
        "protocol": result["protocol"],
        "verdict": result["aggregate"].get("verdict"),
        "results_sha256": result["results_sha256"],
        "paired_effect_summary": result["aggregate"].get("paired_effect_summary"),
        "criteria": result["aggregate"].get("criteria"),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
