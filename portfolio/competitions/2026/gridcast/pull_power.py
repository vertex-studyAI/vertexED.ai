#!/usr/bin/env python3
"""Freeze a small NASA POWER hourly point response for GridCast experiments.

The script intentionally uses only the Python standard library. It records the
exact request metadata and SHA-256 of the response next to the downloaded data.
It does not train a model or make any performance claim.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import urllib.parse
import urllib.request
from datetime import datetime, timezone

BASE_URL = "https://power.larc.nasa.gov/api/temporal/hourly/point"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--latitude", type=float, required=True)
    parser.add_argument("--longitude", type=float, required=True)
    parser.add_argument("--start", required=True, help="YYYYMMDD")
    parser.add_argument("--end", required=True, help="YYYYMMDD")
    parser.add_argument(
        "--parameters",
        default="T2M,RH2M,PS,WS10M",
        help="Comma-separated official NASA POWER parameter names",
    )
    parser.add_argument("--community", default="RE")
    parser.add_argument("--time-standard", choices=["UTC", "LST"], default="UTC")
    parser.add_argument("--format", choices=["JSON", "CSV"], default="JSON")
    parser.add_argument("--out-dir", default="data/raw")
    return parser.parse_args()


def validate_date(value: str) -> None:
    if len(value) != 8 or not value.isdigit():
        raise ValueError(f"Expected YYYYMMDD, got {value!r}")
    datetime.strptime(value, "%Y%m%d")


def main() -> int:
    args = parse_args()
    validate_date(args.start)
    validate_date(args.end)
    if args.start > args.end:
        raise ValueError("--start must be <= --end")

    parameters = [p.strip() for p in args.parameters.split(",") if p.strip()]
    if not parameters:
        raise ValueError("At least one parameter is required")
    if len(parameters) > 15:
        raise ValueError("NASA POWER Hourly API currently permits at most 15 parameters per request")

    query = {
        "parameters": ",".join(parameters),
        "community": args.community,
        "longitude": f"{args.longitude:.6f}",
        "latitude": f"{args.latitude:.6f}",
        "start": args.start,
        "end": args.end,
        "format": args.format,
        "time-standard": args.time_standard,
    }
    url = f"{BASE_URL}?{urllib.parse.urlencode(query, safe=',')}"

    request = urllib.request.Request(
        url,
        headers={"User-Agent": "GridCast-research-loader/0.1"},
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        raw = response.read()
        status = response.status
        content_type = response.headers.get("Content-Type")

    digest = hashlib.sha256(raw).hexdigest()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    slug = f"power_{args.latitude:.4f}_{args.longitude:.4f}_{args.start}_{args.end}_{timestamp}"

    out_dir = pathlib.Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    extension = "json" if args.format == "JSON" else "csv"
    data_path = out_dir / f"{slug}.{extension}"
    manifest_path = out_dir / f"{slug}.manifest.json"

    data_path.write_bytes(raw)
    manifest = {
        "retrieved_at_utc": datetime.now(timezone.utc).isoformat(),
        "request_url": url,
        "query": query,
        "http_status": status,
        "content_type": content_type,
        "sha256": digest,
        "bytes": len(raw),
        "data_file": data_path.name,
        "scientific_status": "raw input only; no performance claim",
    }
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    print(json.dumps({"data": str(data_path), "manifest": str(manifest_path), "sha256": digest}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
