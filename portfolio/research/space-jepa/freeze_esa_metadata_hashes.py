#!/usr/bin/env python3
"""Freeze ESA Mission-1 benchmark metadata identities without parsing outcomes.

This utility reads only ZIP container metadata plus the raw bytes of three declared
benchmark metadata files. It never parses CSV rows, columns, labels, anomaly types,
or channel declarations. For the official multi-gigabyte Zenodo archive it uses
HTTP byte ranges so the telemetry payload is not downloaded.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import urllib.error
import urllib.request
import zipfile
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import BinaryIO, Iterable

ZENODO_RECORD_ID = "12528696"
ZENODO_DOI = "10.5281/zenodo.12528696"
MISSION1_ARCHIVE_NAME = "ESA-Mission1.zip"
MISSION1_ARCHIVE_URL = (
    "https://zenodo.org/records/12528696/files/ESA-Mission1.zip?download=1"
)
ZENODO_DECLARED_MD5 = "80750189d171f5f398fb3d96c49df12b"
PINNED_ESA_ADB_COMMIT = "aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33"
TARGET_BASENAMES = ("labels.csv", "anomaly_types.csv", "channels.csv")
HEX32 = re.compile(r"^[0-9a-f]{32}$")


class ProvenanceError(RuntimeError):
    pass


@dataclass(frozen=True)
class HttpIdentity:
    size_bytes: int
    etag: str | None
    last_modified: str | None


class HttpRangeReader(io.RawIOBase):
    """Minimal seekable reader backed by strict HTTP Range requests."""

    def __init__(self, url: str, *, timeout: int = 60, max_read_bytes: int = 64 << 20):
        super().__init__()
        self.url = url
        self.timeout = timeout
        self.max_read_bytes = max_read_bytes
        self._position = 0
        self.identity = self._probe()

    def _request(self, start: int, end: int) -> tuple[bytes, dict[str, str]]:
        if start < 0 or end < start:
            raise ProvenanceError(f"invalid byte range {start}-{end}")
        if end - start + 1 > self.max_read_bytes:
            raise ProvenanceError(
                f"refusing unexpectedly large range read: {end - start + 1} bytes"
            )
        request = urllib.request.Request(
            self.url,
            headers={
                "Range": f"bytes={start}-{end}",
                "Accept-Encoding": "identity",
                "User-Agent": "Space-JEPA-preoutcome-metadata-freezer/1.0",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                status = getattr(response, "status", None)
                headers = {k.lower(): v for k, v in response.headers.items()}
                data = response.read()
        except urllib.error.HTTPError as exc:
            raise ProvenanceError(f"HTTP range request failed with {exc.code}") from exc
        if status != 206:
            raise ProvenanceError(
                f"server did not honor byte range: expected HTTP 206, observed {status}"
            )
        expected = end - start + 1
        if len(data) != expected:
            raise ProvenanceError(
                f"short/long range response: expected {expected} bytes, observed {len(data)}"
            )
        content_range = headers.get("content-range", "")
        match = re.fullmatch(r"bytes (\d+)-(\d+)/(\d+)", content_range)
        if match is None:
            raise ProvenanceError(f"missing/invalid Content-Range: {content_range!r}")
        got_start, got_end, _ = map(int, match.groups())
        if (got_start, got_end) != (start, end):
            raise ProvenanceError(
                f"range identity drift: requested {start}-{end}, received {got_start}-{got_end}"
            )
        return data, headers

    def _probe(self) -> HttpIdentity:
        data, headers = self._request(0, 0)
        del data
        content_range = headers["content-range"]
        size = int(content_range.rsplit("/", 1)[1])
        if size <= 0:
            raise ProvenanceError("remote archive size must be positive")
        return HttpIdentity(
            size_bytes=size,
            etag=headers.get("etag"),
            last_modified=headers.get("last-modified"),
        )

    def readable(self) -> bool:
        return True

    def seekable(self) -> bool:
        return True

    def tell(self) -> int:
        return self._position

    def seek(self, offset: int, whence: int = io.SEEK_SET) -> int:
        if whence == io.SEEK_SET:
            position = offset
        elif whence == io.SEEK_CUR:
            position = self._position + offset
        elif whence == io.SEEK_END:
            position = self.identity.size_bytes + offset
        else:
            raise ValueError(f"unsupported seek whence {whence}")
        if position < 0:
            raise ValueError("negative seek position")
        self._position = position
        return position

    def read(self, size: int = -1) -> bytes:
        if self._position >= self.identity.size_bytes:
            return b""
        if size is None or size < 0:
            size = self.identity.size_bytes - self._position
        if size == 0:
            return b""
        end = min(self.identity.size_bytes - 1, self._position + size - 1)
        data, _ = self._request(self._position, end)
        self._position += len(data)
        return data


def _safe_unique_targets(names: Iterable[str]) -> dict[str, str]:
    candidates: dict[str, list[str]] = {name: [] for name in TARGET_BASENAMES}
    for raw_name in names:
        path = PurePosixPath(raw_name)
        if path.is_absolute() or ".." in path.parts:
            raise ProvenanceError(f"unsafe ZIP path: {raw_name!r}")
        if path.name in candidates:
            candidates[path.name].append(raw_name)

    selected: dict[str, str] = {}
    for basename, matches in candidates.items():
        mission1_matches = [
            name
            for name in matches
            if "ESA-Mission1" in PurePosixPath(name).parts
        ]
        if len(mission1_matches) != 1:
            raise ProvenanceError(
                f"expected exactly one Mission-1 {basename}, observed {mission1_matches}"
            )
        selected[basename] = mission1_matches[0]
    return selected


def _sha256_stream(handle: BinaryIO) -> tuple[str, int]:
    digest = hashlib.sha256()
    total = 0
    while True:
        chunk = handle.read(1 << 20)
        if not chunk:
            break
        digest.update(chunk)
        total += len(chunk)
    return digest.hexdigest(), total


def hash_metadata_entries(archive: zipfile.ZipFile) -> dict[str, dict[str, object]]:
    selected = _safe_unique_targets(info.filename for info in archive.infolist())
    result: dict[str, dict[str, object]] = {}
    for basename in TARGET_BASENAMES:
        entry_path = selected[basename]
        info = archive.getinfo(entry_path)
        if info.is_dir():
            raise ProvenanceError(f"metadata entry unexpectedly a directory: {entry_path}")
        with archive.open(info, "r") as handle:
            sha256, bytes_read = _sha256_stream(handle)
        if bytes_read != info.file_size:
            raise ProvenanceError(
                f"uncompressed-size mismatch for {entry_path}: {bytes_read} != {info.file_size}"
            )
        result[basename] = {
            "path": entry_path,
            "sha256": sha256,
            "bytes": bytes_read,
            "zip_crc32": f"{info.CRC:08x}",
            "compress_type": info.compress_type,
            "compressed_bytes": info.compress_size,
        }
    return result


def freeze_remote(url: str) -> dict[str, object]:
    reader = HttpRangeReader(url)
    with zipfile.ZipFile(reader, "r") as archive:
        entries = hash_metadata_entries(archive)
    return {
        "schema_version": 1,
        "status": "PREOUTCOME_METADATA_BYTES_HASHED_NO_CSV_ROWS_PARSED",
        "execution_authorized": False,
        "channel_aware_outcome_access_authorized": False,
        "zenodo_record_id": ZENODO_RECORD_ID,
        "zenodo_doi": ZENODO_DOI,
        "archive": {
            "name": MISSION1_ARCHIVE_NAME,
            "url": url,
            "zenodo_declared_md5": ZENODO_DECLARED_MD5,
            "remote_size_bytes": reader.identity.size_bytes,
            "http_etag": reader.identity.etag,
            "http_last_modified": reader.identity.last_modified,
        },
        "pinned_esa_adb_commit": PINNED_ESA_ADB_COMMIT,
        "entries": entries,
        "access_boundary": {
            "csv_rows_parsed": False,
            "labels_interpreted": False,
            "anomaly_types_interpreted": False,
            "channel_declarations_interpreted": False,
            "model_outputs_generated": False,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Hash official ESA Mission-1 labels/anomaly_types/channels bytes without parsing CSV rows."
    )
    parser.add_argument("--url", default=MISSION1_ARCHIVE_URL)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    if args.url != MISSION1_ARCHIVE_URL:
        raise SystemExit("refusing unpinned archive URL")
    if HEX32.fullmatch(ZENODO_DECLARED_MD5) is None:
        raise SystemExit("invalid pinned Zenodo MD5")
    if args.out.exists():
        raise SystemExit(f"refusing to overwrite {args.out}")
    args.out.parent.mkdir(parents=True, exist_ok=True)
    result = freeze_remote(args.url)
    args.out.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(result["status"])
    print(f"REMOTE_SIZE_BYTES={result['archive']['remote_size_bytes']}")
    for name in TARGET_BASENAMES:
        entry = result["entries"][name]
        print(f"{name.upper().replace('.', '_')}_SHA256={entry['sha256']}")


if __name__ == "__main__":
    main()
