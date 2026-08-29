from __future__ import annotations

import ast
from pathlib import Path


HERE = Path(__file__).resolve().parent
RUNNER = HERE / "run.py"


def _load_guard():
    source = RUNNER.read_text(encoding="utf-8")
    tree = ast.parse(source)
    guard = next(
        (node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == "assert_and_filter_frozen_universe"),
        None,
    )
    if guard is None:
        raise RuntimeError("Runner is missing assert_and_filter_frozen_universe().")

    namespace: dict[str, object] = {}
    module = ast.Module(
        body=[
            ast.ImportFrom(module="__future__", names=[ast.alias(name="annotations")], level=0),
            ast.ImportFrom(module="collections", names=[ast.alias(name="Counter")], level=0),
            ast.ImportFrom(module="typing", names=[ast.alias(name="Any"), ast.alias(name="Dict"), ast.alias(name="List"), ast.alias(name="Sequence"), ast.alias(name="Tuple")], level=0),
            guard,
        ],
        type_ignores=[],
    )
    ast.fix_missing_locations(module)
    exec(compile(module, str(RUNNER), "exec"), namespace)
    return namespace["assert_and_filter_frozen_universe"], tree


def _row(locale: str, intent: str, i: int) -> dict[str, str]:
    return {"id": f"{locale}-{intent}-{i}", "locale": locale, "intent": intent, "text": "x"}


def _records(locales: list[str], intents: list[str], n: int) -> list[dict[str, str]]:
    return [_row(locale, intent, i) for locale in locales for intent in intents for i in range(n)]


def main() -> None:
    guard, tree = _load_guard()
    source = RUNNER.read_text(encoding="utf-8")

    main_node = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == "main")
    main_source = ast.get_source_segment(source, main_node) or ""
    guard_call = main_source.find("assert_and_filter_frozen_universe(")
    first_select = main_source.find("select_cells(all_fit")
    model_construct = main_source.find("model = SentenceTransformer(")
    if min(guard_call, first_select, model_construct) < 0 or not (guard_call < first_select < model_construct):
        raise RuntimeError("Frozen-universe guard must execute before selection and encoder construction.")

    locales = ["en-US", "es-ES"]
    frozen = ["alpha", "beta"]
    fit = _records(locales, frozen, 2)
    evaluation = _records(locales, frozen, 2)
    # A non-frozen, non-admissible row must be removed without changing the frozen universe.
    fit.append(_row("en-US", "noise", 0))
    evaluation.append(_row("en-US", "noise", 0))
    filtered_fit, filtered_eval, evidence = guard(fit, evaluation, locales, frozen, 2, 2)
    assert {row["intent"] for row in filtered_fit} == set(frozen)
    assert {row["intent"] for row in filtered_eval} == set(frozen)
    assert evidence["admissible_intents"] == frozen
    assert evidence["minimum_frozen_cell_count"] == 2
    assert evidence["encoder_instantiated"] is False
    assert evidence["model_outcomes_accessed"] is False

    # A newly admissible non-frozen intent must fail closed rather than silently widening the study.
    extra_fit = _records(locales, frozen + ["gamma"], 2)
    extra_eval = _records(locales, frozen + ["gamma"], 2)
    try:
        guard(extra_fit, extra_eval, locales, frozen, 2, 2)
    except RuntimeError as exc:
        assert "unexpected=['gamma']" in str(exc)
    else:
        raise AssertionError("Unexpected admissible intent did not fail closed.")

    # Any frozen cell below n must fail before the encoder can be constructed.
    deficient_fit = [row for row in _records(locales, frozen, 2) if not (row["locale"] == "es-ES" and row["intent"] == "beta" and row["id"].endswith("-1"))]
    try:
        guard(deficient_fit, _records(locales, frozen, 2), locales, frozen, 2, 2)
    except RuntimeError as exc:
        assert "missing=['beta']" in str(exc)
    else:
        raise AssertionError("Deficient frozen cell did not fail closed.")

    print("PASS: v3 runner is locked to the frozen intent universe before encoder construction")


if __name__ == "__main__":
    main()
