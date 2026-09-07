from __future__ import annotations

import argparse
import gzip
import json
import random
import time
from pathlib import Path
import sys

import numpy as np
import torch
from torch.utils.data import DataLoader, TensorDataset

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from learned_models import DeepONet, FNO1d, parameter_count  # noqa: E402

PARAMETER_CEILING = 500_000


def load_jsonl_gz(path: Path):
    xs: list[list[float]] = []
    ys: list[list[float]] = []
    seeds: list[int] = []
    with gzip.open(path, "rt", encoding="utf-8") as handle:
        for line in handle:
            row = json.loads(line)
            xs.append(row["logK"])
            ys.append(row["pressure"])
            seeds.append(int(row["seed"]))
    return (
        np.asarray(xs, dtype=np.float32),
        np.asarray(ys, dtype=np.float32),
        np.asarray(seeds, dtype=np.int64),
    )


def make_nonprotocol_fixture(count: int = 256, seed: int = 123):
    """Implementation-only fixture. Never use this as scientific evidence."""
    rng = np.random.default_rng(seed)
    logk = rng.normal(size=(count, 128)).astype(np.float32)
    coord = np.linspace(0, 1, 129, dtype=np.float32)
    scale = (0.08 * np.tanh(logk.mean(axis=1))).astype(np.float32)
    pressure = (
        1 - coord[None, :] + scale[:, None] * np.sin(np.pi * coord)[None, :]
    ).astype(np.float32)
    pressure[:, 0] = 1.0
    pressure[:, -1] = 0.0
    return logk, pressure


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def relative_l2(actual: torch.Tensor, predicted: torch.Tensor) -> torch.Tensor:
    numerator = torch.linalg.vector_norm(actual - predicted, dim=1)
    denominator = torch.linalg.vector_norm(actual, dim=1).clamp_min(1e-12)
    return numerator / denominator


def build_model(kind: str, config: dict):
    if kind == "fno":
        return FNO1d(
            modes=int(config["modes"]),
            width=int(config["width"]),
            layers=int(config.get("layers", 4)),
        )
    if kind == "deeponet":
        return DeepONet(
            branch_width=int(config["branch_width"]),
            trunk_width=int(config["trunk_width"]),
            hidden_layers=int(config.get("hidden_layers", 3)),
            latent_width=int(config.get("latent_width", 64)),
        )
    raise ValueError(f"unknown model kind: {kind}")


@torch.no_grad()
def evaluate(model, loader: DataLoader, device: torch.device) -> dict:
    model.eval()
    rel_l2: list[torch.Tensor] = []
    mse: list[torch.Tensor] = []
    for logk, pressure in loader:
        logk = logk.to(device)
        pressure = pressure.to(device)
        predicted = model(logk)
        rel_l2.append(relative_l2(pressure, predicted).cpu())
        mse.append(((predicted - pressure) ** 2).mean(dim=1).cpu())
    rel_l2_t = torch.cat(rel_l2)
    mse_t = torch.cat(mse)
    return {
        "mean_relative_l2": float(rel_l2_t.mean()),
        "median_relative_l2": float(rel_l2_t.median()),
        "mean_mse": float(mse_t.mean()),
        "count": int(rel_l2_t.numel()),
    }


def train_one(
    kind: str,
    config: dict,
    train_x: np.ndarray,
    train_y: np.ndarray,
    validation_x: np.ndarray,
    validation_y: np.ndarray,
    *,
    seed: int,
    learning_rate: float,
    weight_decay: float,
    batch_size: int,
    max_epochs: int,
    min_epochs: int,
    patience: int,
    device: torch.device,
) -> tuple[torch.nn.Module, dict]:
    set_seed(seed)

    # Frozen protocol permits normalization derived from training data only.
    mean = float(train_x.mean(dtype=np.float64))
    std = max(float(train_x.std(dtype=np.float64)), 1e-8)
    train_x_std = (train_x - mean) / std
    validation_x_std = (validation_x - mean) / std

    train_dataset = TensorDataset(
        torch.from_numpy(train_x_std), torch.from_numpy(train_y)
    )
    validation_dataset = TensorDataset(
        torch.from_numpy(validation_x_std), torch.from_numpy(validation_y)
    )
    generator = torch.Generator().manual_seed(seed)
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        generator=generator,
    )
    validation_loader = DataLoader(
        validation_dataset,
        batch_size=batch_size,
        shuffle=False,
    )

    model = build_model(kind, config).to(device)
    params = parameter_count(model)
    if params > PARAMETER_CEILING:
        raise RuntimeError(
            f"frozen parameter ceiling exceeded: {params} > {PARAMETER_CEILING}"
        )

    optimizer = torch.optim.AdamW(
        model.parameters(), learning_rate, weight_decay=weight_decay
    )
    best_score: float | None = None
    best_state: dict | None = None
    stale_epochs = 0
    history: list[dict] = []
    start = time.time()

    for epoch in range(1, max_epochs + 1):
        model.train()
        total_loss = 0.0
        total_rows = 0
        for logk, pressure in train_loader:
            logk = logk.to(device)
            pressure = pressure.to(device)
            optimizer.zero_grad(set_to_none=True)
            predicted = model(logk)
            loss = ((predicted - pressure) ** 2).mean()
            if not torch.isfinite(loss):
                raise RuntimeError("non-finite training loss")
            loss.backward()
            optimizer.step()
            total_loss += float(loss.detach()) * len(logk)
            total_rows += len(logk)

        validation = evaluate(model, validation_loader, device)
        history.append(
            {
                "epoch": epoch,
                "train_mse": total_loss / total_rows,
                **validation,
            }
        )
        score = validation["mean_relative_l2"]
        if best_score is None or score < best_score:
            best_score = score
            stale_epochs = 0
            best_state = {
                key: value.detach().cpu().clone()
                for key, value in model.state_dict().items()
            }
        else:
            stale_epochs += 1

        if epoch >= min_epochs and stale_epochs >= patience:
            break

    assert best_state is not None and best_score is not None
    model.load_state_dict(best_state)
    report = {
        "kind": kind,
        "config": config,
        "seed": seed,
        "learning_rate": learning_rate,
        "weight_decay": weight_decay,
        "batch_size": batch_size,
        "parameter_count": params,
        "normalization": {"logk_mean": mean, "logk_std": std},
        "best_validation_relative_l2": best_score,
        "epochs_ran": len(history),
        "wall_seconds": time.time() - start,
        "history": history,
    }
    return model, report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kind", choices=["fno", "deeponet"], required=True)
    parser.add_argument("--config-json", required=True)
    parser.add_argument("--seed", type=int, default=41)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--train")
    parser.add_argument("--validation")
    parser.add_argument("--freeze-config")
    parser.add_argument("--smoke-fixture", action="store_true")
    parser.add_argument("--epochs", type=int)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    config = json.loads(args.config_json)
    if args.smoke_fixture:
        all_x, all_y = make_nonprotocol_fixture()
        train_x, train_y = all_x[:192], all_y[:192]
        validation_x, validation_y = all_x[192:], all_y[192:]
        max_epochs = args.epochs or 2
        min_epochs = max_epochs
        patience = max_epochs
        batch_size = 64
        weight_decay = 1e-4
    else:
        if not args.freeze_config:
            raise SystemExit("FAIL-CLOSED: --freeze-config required for protocol data")
        freeze = json.loads(Path(args.freeze_config).read_text(encoding="utf-8"))
        if freeze.get("training_authorized") is not True:
            raise SystemExit("FAIL-CLOSED: training_authorized is false")
        if not args.train or not args.validation:
            raise SystemExit("--train and --validation are required")
        train_x, train_y, _ = load_jsonl_gz(Path(args.train))
        validation_x, validation_y, _ = load_jsonl_gz(Path(args.validation))
        learned = freeze["learned_model_freeze"]
        if args.seed not in learned["training_seeds"]:
            raise SystemExit("FAIL-CLOSED: seed is outside frozen training_seeds")
        if args.lr not in learned["candidate_learning_rates"]:
            raise SystemExit("FAIL-CLOSED: learning rate is outside frozen grid")
        max_epochs = args.epochs or int(learned["max_epochs"])
        min_epochs = int(learned["minimum_epochs_before_early_stop"])
        patience = int(learned["early_stop_patience"])
        batch_size = int(learned["batch_size"])
        weight_decay = float(learned["weight_decay"])

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, report = train_one(
        args.kind,
        config,
        train_x,
        train_y,
        validation_x,
        validation_y,
        seed=args.seed,
        learning_rate=args.lr,
        weight_decay=weight_decay,
        batch_size=batch_size,
        max_epochs=max_epochs,
        min_epochs=min_epochs,
        patience=patience,
        device=device,
    )

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), out / "model.pt")
    (out / "train-report.json").write_text(
        json.dumps(report, indent=2), encoding="utf-8"
    )
    print(json.dumps({key: value for key, value in report.items() if key != "history"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
