#!/usr/bin/env python3
"""Generate the frozen 48-case NeuroCAD learned direct-vs-IR v2 benchmark.

This file is part of protocol NEUROCAD-EXP-001. Do not edit it after any v2
model output has been observed. A changed benchmark is a new protocol version.
"""

from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).with_name("learned_direct_vs_ir_v2.json")

VALID_SPECS = [
    (80, 40, 3, 0, 0, 0),
    (120, 60, 4, 1, 3, 12),
    (100, 70, 5, 2, 2.5, 10),
    (140, 90, 6, 4, 4, 15),
    (75, 55, 2.5, 0, 0, 0),
    (160, 80, 8, 1, 5, 20),
    (95, 65, 4, 2, 3, 12),
    (180, 120, 10, 4, 6, 18),
]


def p1(w, h, t, c, r, i):
    base = f"Make a rectangular mounting plate measuring {w} mm × {h} mm, {t} mm thick"
    return base + (f", with {c} holes of radius {r} mm inset {i} mm from the edges." if c else ".")


def p2(w, h, t, c, r, i):
    base = f"Create a panel with dimensions {w} by {h} millimetres and thickness {t} mm"
    return base + (f"; add {c} mounting holes, diameter {2*r} mm, edge offset {i} mm." if c else "; no holes.")


def p3(w, h, t, c, r, i):
    base = f"I need a {w} mm wide, {h} mm tall plate, thickness {t} mm"
    return base + (f", containing {c} holes (r={r} mm) at an inset of {i} mm." if c else ", without holes.")


def p4(w, h, t, c, r, i):
    base = f"Generate a rectangular bracket: width {w} mm; height {h} mm; thick {t} mm"
    return base + (f"; {c} circular holes, radius {r} mm, margin {i} mm." if c else "; zero holes.")


TEMPLATES = [
    ("paraphrase", p1),
    ("units", p2),
    ("compositional", p3),
    ("hole_layout", p4),
]

INVALID = [
    ("I001", "unsupported_object", "Design a gear with 24 teeth, 80 mm pitch diameter and 6 mm thickness.", "unsupported_object_class"),
    ("I002", "unsupported_object", "Create a cylinder 50 mm diameter and 100 mm tall.", "unsupported_object_class"),
    ("I003", "negative_dimension", "Make a rectangular plate -80 mm wide by 40 mm tall, 3 mm thick.", "non_positive_dimension"),
    ("I004", "negative_dimension", "Create a panel 80 by -40 mm and thickness 3 mm.", "non_positive_dimension"),
    ("I005", "zero_dimension", "Generate a plate 80 by 40 mm with thickness 0 mm.", "non_positive_dimension"),
    ("I006", "safety_limit", "Make a rectangular plate 2500 by 40 mm, thickness 3 mm.", "dimension_safety_limit"),
    ("I007", "safety_limit", "Create a plate 80 by 40 mm, thickness 250 mm.", "dimension_safety_limit"),
    ("I008", "unsupported_holes", "Make a plate 100 by 60 mm, 4 mm thick, with 3 holes radius 2 mm inset 10 mm.", "unsupported_hole_count"),
    ("I009", "unsupported_holes", "Create a panel 100 by 60 mm, 4 mm thick, with 5 mounting holes diameter 4 mm and edge offset 10 mm.", "unsupported_hole_count"),
    ("I010", "missing_hole_size", "Make a plate 100 by 60 mm, 4 mm thick, with 4 mounting holes inset 10 mm.", "missing_hole_size"),
    ("I011", "invalid_inset", "Create a plate 100 by 60 mm, 4 mm thick, with 4 holes radius 6 mm inset 5 mm.", "inset_not_greater_than_radius"),
    ("I012", "invalid_inset", "Create a plate 100 by 60 mm, 4 mm thick, with 4 holes radius 2 mm inset 31 mm.", "inset_outside_plate"),
    ("I013", "oversized_hole", "Make a plate 40 by 30 mm, 4 mm thick, with one hole radius 16 mm.", "hole_radius_too_large"),
    ("I014", "missing_dimensions", "Make a rectangular mounting plate, 3 mm thick, with four 4 mm diameter holes.", "missing_width_or_height"),
    ("I015", "ambiguous_units", "Make a plate 4 by 2 inches and 3 mm thick.", "unsupported_units"),
    ("I016", "contradiction", "Create a plate 100 by 60 mm with no holes and also add four 4 mm diameter mounting holes inset 10 mm.", "contradictory_request"),
]


def build() -> dict:
    cases = []
    n = 1
    for spec in VALID_SPECS:
        w, h, t, c, r, i = spec
        for stratum, template in TEMPLATES:
            cases.append(
                {
                    "id": f"L{n:03d}",
                    "valid": True,
                    "stratum": stratum,
                    "prompt": template(*spec),
                    "target": {
                        "type": "rectangular_plate",
                        "units": "mm",
                        "width": w,
                        "height": h,
                        "thickness": t,
                        "hole_count": c,
                        "hole_radius": r,
                        "inset": i,
                    },
                }
            )
            n += 1

    for case_id, stratum, prompt, reason in INVALID:
        cases.append(
            {
                "id": case_id,
                "valid": False,
                "stratum": stratum,
                "prompt": prompt,
                "expected_rejection": reason,
            }
        )

    assert len(cases) == 48
    assert sum(bool(case["valid"]) for case in cases) == 32
    assert len({case["id"] for case in cases}) == 48
    return {
        "protocol_id": "NEUROCAD-EXP-001/learned-direct-vs-ir-v2",
        "frozen_date": "2026-08-14",
        "units": "mm",
        "part_family": "rectangular_plate",
        "cases": cases,
    }


def main() -> None:
    text = json.dumps(build(), indent=2, ensure_ascii=False) + "\n"
    OUT.write_text(text, encoding="utf-8")
    print(OUT)


if __name__ == "__main__":
    main()
