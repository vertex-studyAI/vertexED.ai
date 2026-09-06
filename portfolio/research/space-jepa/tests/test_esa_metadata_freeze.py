import io
import zipfile

import pytest

from freeze_esa_metadata_hashes import ProvenanceError, hash_metadata_entries


def _archive(entries):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for path, payload in entries.items():
            archive.writestr(path, payload)
    buffer.seek(0)
    return zipfile.ZipFile(buffer, "r")


def test_hashes_only_three_unique_mission1_metadata_entries():
    archive = _archive(
        {
            "ESA-Mission1/labels.csv": b"synthetic-label-fixture\n",
            "ESA-Mission1/anomaly_types.csv": b"synthetic-type-fixture\n",
            "ESA-Mission1/channels.csv": b"synthetic-channel-fixture\n",
            "ESA-Mission1/channels/41.csv": b"telemetry-not-selected\n",
            "ESA-Mission2/labels.csv": b"other-mission\n",
        }
    )
    with archive:
        result = hash_metadata_entries(archive)
    assert set(result) == {"labels.csv", "anomaly_types.csv", "channels.csv"}
    assert result["labels.csv"]["path"] == "ESA-Mission1/labels.csv"
    assert result["anomaly_types.csv"]["path"] == "ESA-Mission1/anomaly_types.csv"
    assert result["channels.csv"]["path"] == "ESA-Mission1/channels.csv"
    assert result["labels.csv"]["bytes"] == len(b"synthetic-label-fixture\n")
    assert len(result["labels.csv"]["sha256"]) == 64


def test_rejects_missing_or_duplicate_mission1_metadata_entry():
    archive = _archive(
        {
            "ESA-Mission1/labels.csv": b"x",
            "ESA-Mission1/channels.csv": b"x",
        }
    )
    with archive, pytest.raises(ProvenanceError, match="anomaly_types.csv"):
        hash_metadata_entries(archive)

    archive = _archive(
        {
            "ESA-Mission1/labels.csv": b"x",
            "copy/ESA-Mission1/labels.csv": b"y",
            "ESA-Mission1/anomaly_types.csv": b"x",
            "ESA-Mission1/channels.csv": b"x",
        }
    )
    with archive, pytest.raises(ProvenanceError, match="exactly one Mission-1 labels.csv"):
        hash_metadata_entries(archive)


def test_rejects_unsafe_zip_paths_before_hashing():
    archive = _archive(
        {
            "../ESA-Mission1/labels.csv": b"x",
            "ESA-Mission1/anomaly_types.csv": b"x",
            "ESA-Mission1/channels.csv": b"x",
        }
    )
    with archive, pytest.raises(ProvenanceError, match="unsafe ZIP path"):
        hash_metadata_entries(archive)
