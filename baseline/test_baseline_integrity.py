"""Adversarial software fixtures only; these rows are NOT research evidence.

Tests patch the module trust anchor only for isolated fixtures. The production CLI
has no trust-anchor override. CI must additionally validate the real retained CSV.
"""
from __future__ import annotations

import copy
import csv
import gzip
import hashlib
import io
import json
import subprocess
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path
from unittest.mock import patch

import validate_project2424_baseline as validator


def encode_rows(rows: list[dict[str, str]], fields=validator.FIELDS) -> bytes:
    stream = io.StringIO(newline="")
    writer = csv.DictWriter(stream, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)
    return stream.getvalue().encode("utf-8")


def fixture_rows() -> list[dict[str, str]]:
    rows = []
    for pid in validator.EXPECTED_IDS:
        row = {field: "VALIDATOR_TEST_FIXTURE_ONLY" for field in validator.FIELDS}
        present = pid in validator.SOURCE_IDS
        row.update({
            "canonical_id": pid, "namespace": "T2424",
            "identity_status": "CANONICAL_WITHIN_T_REGISTRY",
            "cross_namespace_status": "NO_P_MAPPING_INFERRED",
            "source_status": "SOURCE_DIRECTORY_PRESENT_AUDIT_PENDING" if present else "SOURCE_NOT_RECOVERED",
            "scientific_verdict": "UNKNOWN_NO_CLAIM", "readiness_score": "10",
            "readiness_band": "CONCEPT", "ready_to_submit_today": "NO",
            "last_verified_date": "2026-08-30",
            "disposition": "SOURCE_MIGRATION_BLOCKED" if pid in ("T2424-0016", "T2424-0019") else (
                "EVIDENCE_AUDIT_REQUIRED" if present else "SOURCE_RECOVERY_REQUIRED"
            ),
        })
        row.update(validator.LOCKS.get(pid, {}))
        rows.append(row)
    return rows


def fixture_summary(rows, raw):
    return {
        "baseline_definition": validator.BASELINE_DEFINITION,
        "counts": dict(validator.EXPECTED_COUNTS),
        "csv_sha256": hashlib.sha256(raw).hexdigest(),
        "dispositions": dict(Counter(r["disposition"] for r in rows)),
        "readiness_bands": dict(Counter(r["readiness_band"] for r in rows)),
        "scientific_verdicts": dict(Counter(r["scientific_verdict"] for r in rows)),
        "errors": [], "integrity_locks": list(validator.INTEGRITY_LOCKS),
        "source_inventory": "PROJECT_2424_IDENTITY_INVENTORY_2026-08-15.jsonl",
        "source_inventory_rows_all_namespaces": 4850, "validation": "PASS",
    }


class BaselineIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.original_rows = fixture_rows()
        cls.original_raw = encode_rows(cls.original_rows)
        cls.original_summary = fixture_summary(cls.original_rows, cls.original_raw)
        cls.fixture_sha = hashlib.sha256(cls.original_raw).hexdigest()
        cls.compressed_fixture = gzip.compress(cls.original_raw, compresslevel=1, mtime=0)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / validator.ARCHIVE_NAME).write_bytes(self.compressed_fixture)
        self.summary = copy.deepcopy(self.original_summary)
        self.save_summary()
        self.trust = patch.object(validator, "EXPECTED_CSV_SHA256", self.fixture_sha)
        self.trust.start()
        self.addCleanup(self.trust.stop)

    def save_summary(self):
        (self.root / validator.SUMMARY_NAME).write_text(json.dumps(self.summary), encoding="utf-8")

    def check_code(self, code):
        report = validator.validate_bundle(self.root)
        self.assertEqual(report["result"], "FAIL", report)
        self.assertIn(code, [error["code"] for error in report["errors"]], report)
        return report

    def write_raw(self, raw, refresh_summary=False):
        (self.root / validator.ARCHIVE_NAME).write_bytes(gzip.compress(raw, compresslevel=1, mtime=0))
        if refresh_summary:
            self.summary["csv_sha256"] = hashlib.sha256(raw).hexdigest()
            self.save_summary()

    def mutated_rows(self, mutate):
        rows = copy.deepcopy(self.original_rows)
        mutate(rows)
        self.write_raw(encode_rows(rows), refresh_summary=True)

    def test_valid_fixture_has_no_scientific_promotion(self):
        result = validator.validate_bundle(self.root)
        self.assertEqual(result["result"], "PASS", result)
        self.assertEqual(result["rows"], 2424)
        self.assertFalse(result["scientific_promotion_authorized"])
        self.assertFalse(result["current_source_presence_verified"])
        self.assertFalse(result["independent_reproduction_verified_by_this_check"])
        self.assertEqual(result["new_scientific_experiments"], 0)

    def test_real_anchor_is_immutable_expected_value(self):
        self.trust.stop()
        self.assertEqual(validator.EXPECTED_CSV_SHA256, "84066ec134c0f9c216e23f18e9765efa439bee7f6be46dd5d6d29e9178f926d7")
        self.check_code("TRUST_ANCHOR_MISMATCH")

    def test_paired_csv_and_summary_rewrite_rejected(self):
        self.mutated_rows(lambda rows: rows[0].update(title="FORGED_TITLE"))
        self.check_code("TRUST_ANCHOR_MISMATCH")

    def test_summary_counts_are_recomputed(self):
        self.summary["counts"]["total_t_identities"] = 999999
        self.save_summary()
        self.check_code("SUMMARY_COUNTS")

    def test_boolean_count_is_not_integer(self):
        self.summary["counts"]["ready_to_submit_today"] = False
        self.save_summary()
        self.check_code("SUMMARY_COUNTS")

    def test_float_count_is_not_integer(self):
        self.summary["counts"]["total_t_identities"] = 2424.0
        self.save_summary()
        self.check_code("SUMMARY_COUNTS")

    def test_extra_summary_count_rejected(self):
        self.summary["counts"]["fabricated"] = 0
        self.save_summary()
        self.check_code("SUMMARY_COUNTS")

    def test_histograms_are_recomputed(self):
        for key in ("dispositions", "readiness_bands", "scientific_verdicts"):
            with self.subTest(key=key):
                self.summary = copy.deepcopy(self.original_summary)
                self.summary[key] = {"FABRICATED": 2424}
                self.save_summary()
                self.check_code("SUMMARY_HISTOGRAM")

    def test_histogram_booleans_rejected(self):
        self.summary["dispositions"]["BOUNDED_PREPRINT_RELEASE_GATES"] = True
        self.save_summary()
        self.check_code("SUMMARY_HISTOGRAM")

    def test_summary_digest_mismatch(self):
        self.summary["csv_sha256"] = "0" * 64
        self.save_summary()
        self.check_code("SUMMARY_DIGEST")

    def test_missing_summary_field(self):
        del self.summary["integrity_locks"]
        self.save_summary()
        self.check_code("SUMMARY_SCHEMA")

    def test_extra_summary_field(self):
        self.summary["publication_ready"] = True
        self.save_summary()
        self.check_code("SUMMARY_SCHEMA")

    def test_summary_integrity_locks_preserved(self):
        self.summary["integrity_locks"] = []
        self.save_summary()
        self.check_code("SUMMARY_CONTRACT")

    def test_summary_cannot_erase_failed_validation(self):
        self.summary["validation"] = "FAIL"
        self.summary["errors"] = ["existing failure"]
        self.save_summary()
        self.check_code("SUMMARY_CONTRACT")

    def test_inventory_total_exact_and_typed(self):
        for value in (2424, 4850.0, "4850", True):
            with self.subTest(value=value):
                self.summary["source_inventory_rows_all_namespaces"] = value
                self.save_summary()
                self.check_code("SUMMARY_INVENTORY_COUNT")

    def test_namespace_rejected(self):
        self.mutated_rows(lambda rows: rows[0].update(namespace="P2424"))
        self.check_code("ROW_CONTRACT")

    def test_cross_namespace_suffix_mapping_rejected(self):
        self.mutated_rows(lambda rows: rows[0].update(cross_namespace_status="P_SUFFIX_MATCH"))
        self.check_code("ROW_CONTRACT")

    def test_submission_claim_rejected(self):
        self.mutated_rows(lambda rows: rows[0].update(ready_to_submit_today="YES"))
        self.check_code("ROW_CONTRACT")

    def test_blank_title_rejected(self):
        self.mutated_rows(lambda rows: rows[0].update(title="  "))
        self.check_code("EMPTY_FIELD")

    def test_unsupported_source_identity_rejected(self):
        self.mutated_rows(lambda rows: rows[0].update(source_status="SOURCE_DIRECTORY_PRESENT_AUDIT_PENDING"))
        self.check_code("ROW_CONTRACT")

    def test_readiness_score_rejected(self):
        self.mutated_rows(lambda rows: rows[0].update(readiness_score="NaN"))
        self.check_code("INVALID_SCORE")

    def test_historical_date_not_refreshed_to_today(self):
        self.mutated_rows(lambda rows: rows[0].update(last_verified_date="2026-09-26"))
        self.check_code("ROW_CONTRACT")

    def test_all_five_frozen_verdicts_preserved(self):
        for pid in validator.LOCKS:
            with self.subTest(pid=pid):
                self.mutated_rows(lambda rows: rows[int(pid[-4:]) - 1].update(scientific_verdict="POSITIVE_RESCUE_RESULT"))
                result = self.check_code("ROW_CONTRACT")
                self.assertTrue(any(pid in item["detail"] for item in result["errors"]))

    def test_robust_readout_non_uniqueness_cannot_be_removed(self):
        self.mutated_rows(lambda rows: rows[24].update(scientific_verdict="UNIQUE_NGMT_MECHANISM"))
        self.check_code("ROW_CONTRACT")

    def test_darcy_hold_cannot_be_promoted(self):
        self.mutated_rows(lambda rows: rows[49].update(disposition="AUTO_MERGE"))
        self.check_code("ROW_CONTRACT")

    def test_v3_cannot_revert_to_pending(self):
        self.mutated_rows(lambda rows: rows[26].update(scientific_verdict="PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS_V3_PENDING"))
        self.check_code("ROW_CONTRACT")

    def test_empty_row_set_does_not_crash(self):
        self.write_raw(encode_rows([]), refresh_summary=True)
        self.check_code("EXACT_IDENTITIES")

    def test_missing_protected_identity_does_not_crash(self):
        self.mutated_rows(lambda rows: rows.pop(49))
        self.check_code("EXACT_IDENTITIES")

    def test_duplicate_identity(self):
        self.mutated_rows(lambda rows: rows[0].update(canonical_id=rows[1]["canonical_id"]))
        self.check_code("EXACT_IDENTITIES")

    def test_reordered_identity(self):
        self.mutated_rows(lambda rows: rows.reverse())
        self.check_code("EXACT_IDENTITIES")

    def test_row_count_overflow(self):
        self.mutated_rows(lambda rows: rows.append(dict(rows[-1])))
        self.check_code("ROW_LIMIT")

    def test_missing_header(self):
        self.write_raw(self.original_raw.split(b"\r\n", 1)[1])
        self.check_code("CSV_SCHEMA")

    def test_duplicate_header(self):
        raw = self.original_raw.replace(b"canonical_id,title,", b"canonical_id,canonical_id,", 1)
        self.write_raw(raw)
        self.check_code("CSV_SCHEMA")

    def test_extra_header(self):
        raw = self.original_raw.replace(b"canonical_id,title,", b"injected,canonical_id,title,", 1)
        self.write_raw(raw)
        self.check_code("CSV_SCHEMA")

    def test_row_missing_column(self):
        lines = self.original_raw.split(b"\r\n")
        lines[1] = lines[1].rsplit(b",", 1)[0]
        self.write_raw(b"\r\n".join(lines))
        self.check_code("CSV_ROW_WIDTH")

    def test_row_extra_column(self):
        lines = self.original_raw.split(b"\r\n")
        lines[1] += b",injected"
        self.write_raw(b"\r\n".join(lines))
        self.check_code("CSV_ROW_WIDTH")

    def test_malformed_csv_quotes(self):
        self.write_raw(self.original_raw.split(b"\r\n", 1)[0] + b'\r\n"unterminated')
        self.check_code("INPUT_ERROR")

    def test_invalid_utf8_csv(self):
        self.write_raw(b"\xff\xfe")
        self.check_code("INPUT_ERROR")

    def test_nul_csv(self):
        self.write_raw(self.original_raw + b"\x00")
        self.check_code("INPUT_ERROR")

    def test_missing_archive(self):
        (self.root / validator.ARCHIVE_NAME).unlink()
        self.check_code("INPUT_ERROR")

    def test_missing_summary(self):
        (self.root / validator.SUMMARY_NAME).unlink()
        self.check_code("INPUT_ERROR")

    def test_directory_input(self):
        path = self.root / validator.ARCHIVE_NAME
        path.unlink()
        path.mkdir()
        self.check_code("INPUT_ERROR")

    def test_symlink_input(self):
        path = self.root / validator.ARCHIVE_NAME
        target = self.root / "saved.gz"
        path.rename(target)
        path.symlink_to(target)
        self.check_code("INPUT_ERROR")

    def test_truncated_gzip(self):
        (self.root / validator.ARCHIVE_NAME).write_bytes(self.compressed_fixture[:-8])
        self.check_code("INPUT_ERROR")

    def test_corrupt_gzip_crc(self):
        content = bytearray(self.compressed_fixture)
        content[-8] ^= 255
        (self.root / validator.ARCHIVE_NAME).write_bytes(content)
        self.check_code("INPUT_ERROR")

    def test_not_gzip(self):
        (self.root / validator.ARCHIVE_NAME).write_bytes(b"NOT_GZIP")
        self.check_code("INPUT_ERROR")

    def test_gzip_recompression_does_not_change_trust(self):
        (self.root / validator.ARCHIVE_NAME).write_bytes(gzip.compress(self.original_raw, compresslevel=9, mtime=1234))
        self.assertEqual(validator.validate_bundle(self.root)["result"], "PASS")

    def test_archive_size_limit(self):
        with patch.object(validator, "MAX_ARCHIVE_BYTES", 100):
            self.check_code("INPUT_ERROR")

    def test_decompression_size_limit(self):
        with patch.object(validator, "MAX_CSV_BYTES", 1000):
            self.check_code("INPUT_ERROR")

    def test_summary_size_limit(self):
        with patch.object(validator, "MAX_SUMMARY_BYTES", 100):
            self.check_code("INPUT_ERROR")

    def test_invalid_json(self):
        (self.root / validator.SUMMARY_NAME).write_text("{broken", encoding="utf-8")
        self.check_code("INPUT_ERROR")

    def test_json_top_level_array(self):
        (self.root / validator.SUMMARY_NAME).write_text("[]", encoding="utf-8")
        self.check_code("INPUT_ERROR")

    def test_json_duplicate_key(self):
        (self.root / validator.SUMMARY_NAME).write_text('{"counts":{},"counts":{}}', encoding="utf-8")
        self.check_code("INPUT_ERROR")

    def test_json_nan(self):
        (self.root / validator.SUMMARY_NAME).write_text('{"value":NaN}', encoding="utf-8")
        self.check_code("INPUT_ERROR")

    def test_invalid_utf8_json(self):
        (self.root / validator.SUMMARY_NAME).write_bytes(b"\xff")
        self.check_code("INPUT_ERROR")

    def test_diagnostics_bounded(self):
        self.mutated_rows(lambda rows: [r.update(title="", namespace="P2424") for r in rows])
        result = self.check_code("EMPTY_FIELD")
        self.assertTrue(result["diagnostics_truncated"])
        self.assertEqual(len(result["errors"]), validator.MAX_DIAGNOSTICS)
        self.assertGreater(result["error_count"], 2424)

    def test_cli_failure_is_json_and_nonzero(self):
        proc = subprocess.run(
            [sys.executable, str(Path(validator.__file__)), "--root", str(self.root)],
            capture_output=True, text=True, timeout=10,
        )
        self.assertEqual(proc.returncode, 1)
        self.assertEqual(json.loads(proc.stdout)["result"], "FAIL")
        self.assertEqual(proc.stderr, "")

    def test_validation_never_modifies_inputs(self):
        before = {p.name: p.read_bytes() for p in self.root.iterdir()}
        validator.validate_bundle(self.root)
        after = {p.name: p.read_bytes() for p in self.root.iterdir()}
        self.assertEqual(before, after)


if __name__ == "__main__":
    unittest.main(verbosity=2)
