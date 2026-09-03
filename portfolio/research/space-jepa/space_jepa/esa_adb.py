from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import numpy as np

LABEL_PREFIX = "is_anomaly_"
TIMESTAMP_COLUMN = "timestamp"
NOMINAL = 0
ANOMALY = 1
RARE_EVENT = 2
GAP = 3
INVALID = 4

MISSION1_LITE_CHANNELS = tuple(f"channel_{i}" for i in range(41, 47))
MISSION2_LITE_CHANNELS = tuple(f"channel_{i}" for i in range(18, 29))

MISSION1_TARGET_CHANNELS = (
    "channel_12", "channel_13", "channel_14", "channel_15", "channel_16", "channel_17",
    "channel_18", "channel_19", "channel_20", "channel_21", "channel_22", "channel_23",
    "channel_24", "channel_25", "channel_26", "channel_27", "channel_28", "channel_29",
    "channel_30", "channel_31", "channel_32", "channel_33", "channel_34", "channel_35",
    "channel_36", "channel_37", "channel_38", "channel_39", "channel_40", "channel_41",
    "channel_42", "channel_43", "channel_44", "channel_45", "channel_46", "channel_47",
    "channel_48", "channel_49", "channel_50", "channel_51", "channel_52", "channel_57",
    "channel_58", "channel_59", "channel_60", "channel_61", "channel_62", "channel_63",
    "channel_64", "channel_65", "channel_66", "channel_70", "channel_71", "channel_72",
    "channel_73", "channel_74", "channel_75", "channel_76",
)
MISSION2_TARGET_CHANNELS = (
    "channel_9", "channel_10", "channel_11", "channel_12", "channel_13", "channel_14",
    "channel_15", "channel_16", "channel_17", "channel_18", "channel_19", "channel_20",
    "channel_21", "channel_22", "channel_23", "channel_24", "channel_25", "channel_26",
    "channel_27", "channel_28", "channel_58", "channel_59", "channel_70", "channel_71",
    "channel_72", "channel_73", "channel_74", "channel_75", "channel_76", "channel_77",
    "channel_78", "channel_79", "channel_80", "channel_81", "channel_82", "channel_83",
    "channel_84", "channel_85", "channel_86", "channel_87", "channel_88", "channel_89",
    "channel_90", "channel_91", "channel_96", "channel_97", "channel_98",
)
CHANNEL_PRESETS: dict[str, tuple[str, ...]] = {
    "mission1-lite": MISSION1_LITE_CHANNELS,
    "mission1-target": MISSION1_TARGET_CHANNELS,
    "mission2-lite": MISSION2_LITE_CHANNELS,
    "mission2-target": MISSION2_TARGET_CHANNELS,
}


@dataclass(frozen=True)
class ESAADBTable:
    telemetry: np.ndarray
    channel_labels: np.ndarray
    feature_names: tuple[str, ...]
    timestamps: np.ndarray | None = None

    def validate(self) -> "ESAADBTable":
        if self.telemetry.ndim != 2:
            raise ValueError("telemetry must have shape [time, channels]")
        if self.channel_labels.shape != self.telemetry.shape:
            raise ValueError("channel_labels must align 1:1 with telemetry channels")
        if len(self.feature_names) != self.telemetry.shape[1]:
            raise ValueError("feature_names must align with telemetry columns")
        if self.timestamps is not None and len(self.timestamps) != len(self.telemetry):
            raise ValueError("timestamps must align with telemetry rows")
        if not np.isin(self.channel_labels, [NOMINAL, ANOMALY, RARE_EVENT, GAP, INVALID]).all():
            raise ValueError("unexpected ESA-ADB annotation code")
        return self

    def binary_labels(self, *, include_rare_events: bool) -> np.ndarray:
        positive = self.channel_labels == ANOMALY
        if include_rare_events:
            positive |= self.channel_labels == RARE_EVENT
        return positive.any(axis=1).astype(np.int64)

    def channel_binary_labels(self, *, include_rare_events: bool) -> np.ndarray:
        positive = self.channel_labels == ANOMALY
        if include_rare_events:
            positive |= self.channel_labels == RARE_EVENT
        return positive.astype(np.int64)

    def diagnostic_valid_mask(self) -> np.ndarray:
        """Rows safe for repository-native point diagnostics.

        ESA's official metric path remains authoritative. This mask only prevents communication-gap
        or invalid annotation codes from being silently treated as nominal by local diagnostics.
        """
        excluded = (self.channel_labels == GAP) | (self.channel_labels == INVALID)
        return ~excluded.any(axis=1)


def resolve_channels(preset: str | None, channels: Iterable[str] | None) -> tuple[str, ...] | None:
    explicit = tuple(str(c) for c in channels) if channels is not None else None
    if preset and explicit:
        raise ValueError("choose either a channel preset or explicit channels, not both")
    if preset:
        try:
            return CHANNEL_PRESETS[preset]
        except KeyError as exc:
            raise ValueError(f"unknown ESA-ADB channel preset {preset!r}; choose from {sorted(CHANNEL_PRESETS)}") from exc
    return explicit


def inspect_esa_adb_columns(path: str | Path) -> tuple[str, ...]:
    import pandas as pd

    columns = pd.read_csv(Path(path), nrows=0).columns.tolist()
    return tuple(str(c) for c in columns)


def load_esa_adb_csv(
    path: str | Path,
    *,
    channels: Iterable[str] | None = None,
    preset: str | None = None,
    load_timestamps: bool = True,
) -> ESAADBTable:
    """Load an official ESA-ADB preprocessed multivariate CSV without label leakage.

    Official preprocessed files interleave telemetry columns with per-channel `is_anomaly_*`
    annotations. This adapter explicitly selects telemetry plus the matching annotation columns,
    preventing annotation codes from entering the model feature matrix.

    Use `mission1-lite` / `mission2-lite` for the same lightweight channel subsets declared in the
    official ESA-ADB experiment scripts; full target-channel presets are also available.
    """
    import pandas as pd

    path = Path(path)
    columns = inspect_esa_adb_columns(path)
    requested = resolve_channels(preset, channels)
    if requested is None:
        requested = tuple(
            c for c in columns
            if c != TIMESTAMP_COLUMN and not c.startswith(LABEL_PREFIX)
        )
    if not requested:
        raise ValueError("no telemetry channels selected")

    missing_features = [c for c in requested if c not in columns]
    label_columns = tuple(f"{LABEL_PREFIX}{c}" for c in requested)
    missing_labels = [c for c in label_columns if c not in columns]
    if missing_features or missing_labels:
        raise ValueError(
            f"ESA-ADB CSV is missing features={missing_features} labels={missing_labels}"
        )

    usecols = list(requested) + list(label_columns)
    if load_timestamps:
        if TIMESTAMP_COLUMN not in columns:
            raise ValueError("official ESA-ADB CSV is missing timestamp column")
        usecols.insert(0, TIMESTAMP_COLUMN)

    dtypes = {c: np.float32 for c in requested}
    dtypes.update({c: np.uint8 for c in label_columns})
    if load_timestamps:
        dtypes[TIMESTAMP_COLUMN] = "string"

    frame = pd.read_csv(path, usecols=usecols, dtype=dtypes)
    telemetry = frame.loc[:, list(requested)].to_numpy(dtype=np.float32, copy=True)
    labels = frame.loc[:, list(label_columns)].to_numpy(dtype=np.uint8, copy=True)
    timestamps = None
    if load_timestamps:
        timestamps = frame[TIMESTAMP_COLUMN].astype(str).to_numpy(copy=True)
    return ESAADBTable(
        telemetry=telemetry,
        channel_labels=labels,
        feature_names=tuple(requested),
        timestamps=timestamps,
    ).validate()
