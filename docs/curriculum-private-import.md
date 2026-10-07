# Private curriculum packet imports

The offline importer makes an authored curriculum batch reproducible for editorial review. It normalizes supported legacy manifests, verifies source bytes, preserves question context and dependencies, and creates an immutable local store containing both the normalized records and every referenced source file.

It has no database, network, publishing, approval, or subject-catalog mutation capability. The resulting store is private review material. Teacher approval, rights review, product rendering, authenticated serving, and learner evaluation remain distinct steps.

## Run

Use the repository's declared Node 22 runtime, with type stripping enabled so the importer reads the actual `BOARD_CONFIGS` contract.

```sh
node --experimental-strip-types scripts/import-curriculum-packets.mjs --batch /absolute/path/to/batch.json --check
node --experimental-strip-types scripts/import-curriculum-packets.mjs --batch /absolute/path/to/batch.json --stage-dir /absolute/path/to/private-review-imports
node --experimental-strip-types --test tests/curriculum-private-import.test.mjs
```

`--check` validates and reports without writing. `--stage-dir` imports a complete validated batch into a directory named by its content digest. Repeating the same import reuses identical bytes without changing file timestamps. A changed or incomplete existing import is rejected; it is never silently overwritten. Save a genuinely revised batch as a new digest and retain its earlier version.

Do not use a served directory as the destination. The importer rejects common application/public/build paths and symlinked destinations resolving into those paths, writes new import directories with mode 0700, and writes files with mode 0600. These local permissions do not supply application authentication. Copying the store to an unrelated web server would expose it; production integration must implement its own access controls.

## Input contract

The input is a schemaVersion 1 batch with an identifier, expected total count, and one or more packets. Each packet declares a stable key, expected count, curriculum board/subject/level/language, a source manifest path and SHA-256, and source resources with relative paths and SHA-256 hashes. Optional type counts require exact lesson/worked-example/question totals.

Supported original manifests are arrays or schema_version `1.0` objects containing `records`. The importer preserves `id` or legacy `item_id`; conflicting aliases and duplicate IDs across the entire batch fail. Declared record counts must match. The known short-answer and language-practice subtypes remain recorded as `sourceType` while normalizing to `question`.

Each source path must stay inside the batch directory and use a canonical relative path. Every source resource is hash-verified. The store contains a `source-batch.json`, original manifests, and all referenced teaching assets in addition to its three generated records files. That makes a copied store independently reloadable; it does not depend on the author's temporary paths.

## Source context and repair

Short prompts often depend on a shared model, algorithm, unit convention or preceding question. Attach those inputs explicitly. `contexts` contains exact selected source text; `recordContextBindings` associates it with one or more existing records without altering their original prompt. `dependencyIds` retains a premise relationship between records; missing or cyclic dependencies are rejected. A binding may explain which local assumption overrides a shared convention.

`promptRepairs` is for unresolved references such as “See learner pack item Q001.” Each repair must match the exact original prompt and cite an existing source resource plus the selected paragraph in a verified extraction resource. A stale original prompt, missing source, changed selected text or unused repair fails validation. Context text is checked against the same source-extraction contract. Markdown lines keep single newline separators, preserving pseudocode; prose paragraphs may use double newlines.

Extraction resources bind their original document's SHA-256 and contain the selected document's ordered text paragraphs. The authoring workflow must independently establish extraction fidelity. In particular, a `w:t`-only DOCX extractor loses OMML mathematics and some internal breaks; use original Markdown for code/math, or a renderer-aware extraction process. The importer checks the declared source binding and selection; it does not independently decode DOCX equations or certify an author's extraction.

For newly authored numerical variants, create a derived source manifest, retain the parent manifest and exact before/after amendment as resources, and declare the derivation. Preserve logical record IDs with explicit revision metadata. Do not disguise a new question as a verbatim recovery of its parent.

## Outputs and limits

`review-catalog.json` includes solutions, source hashes, source claims, supporting assets, context, dependencies and unresolved review actions. Every record begins unreviewed and held from the learner index. A source string claiming approval never creates teacher approval or a published record.

`learner-preview.json` is an offline review projection. Questions omit their solutions and source answer fields; worked examples intentionally retain worked solutions. A question with an exact prompt-and-answer match to a visible worked example is labeled guided repetition, requiring replacement or deliberate labeling before assessment use. This exact-duplicate check does not establish semantic answer isolation or assessment validity.

Lesson records in this projection are explicitly metadata-only. Their full authored documents remain available to private reviewers through the packet resources; this importer does not convert a complete DOCX/PDF/Markdown lesson into a production lesson renderer.

An unrecognized subject in an otherwise valid board is retained as an unresolved runtime mapping. It is never silently moved to another board or added to the application's subject list. For example, the current IB_DP configuration lacks Computer Science; a private CS packet can be reviewed while its runtime mapping remains held.

`import-receipt.json` binds its counts and status to the same digest as the two projections. The source manifests/resources are separately hash-bound. A caller cannot alter receipt counts, approval flags, a projection or retained source bytes after validation and then use the original digest.

All generated values describing teacher approval, runtime export or production import remain zero in this workflow. The importer can complete private record ingestion; it cannot establish pedagogical correctness, adoption, production release or learner outcomes.

## Verification coverage

The dedicated tests exercise legacy shapes and identities, count/schema corruption, missing prompts/answers, checksum mismatch, path/symlink boundaries, cross-packet collisions, exact-source repairs, context dependencies, guided repetition, private file permissions, immutable replay, complete source reload, and post-validation mutation of sources/projections/receipt counts. They use synthetic fixtures and do not count as student outcomes or teacher review.
