# AP and MYP resource expansion, 21 October 2026

Every module in the current AP and MYP catalogue now has a populated study pack. This covers 42 AP courses / 274 modules and 17 MYP subjects / 205 lessons. It extends the programme readers beyond the separate shared foundation library.

| Programme | Modules / lessons | Questions | Worked examples | Flashcards | Diagrams | Additional note words |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| AP | 274 | 1,115 | 548 | 1,127 | 274 | 24,902 |
| MYP | 205 | 1,026 | 410 | 820 | 205 | 18,135 |
| Combined | 479 | 2,141 | 958 | 1,947 | 479 | 43,037 |

Question, example and flashcard totals include retained original material. The additions are one explanatory note, one worked example, four flashcards, one labelled concept diagram and two practice questions per module: 479 notes, 479 examples, 1,916 cards, 479 diagrams and 958 questions. Each new question has hints, a worked solution or model response, and three editorial marking points. The existing 31 AP Calculus AB recall cards are also visible in the reader.

## Reader and content implementation

A shared resource component renders selectable notes, ordered worked steps, labelled diagram relationships, keyboard-operated flashcards and source links where provided. The layout stacks on mobile, uses the existing Blue/Midnight palette and does not require animation. MYP question selectors include their question number so repeated difficulty labels remain distinguishable. Saved MYP drafts use globally unique question identities. AP working retains its existing temporary-working/download behaviour.

AP sources remain in `src/content/ap/`; MYP additions are separate per-subject files in `src/content/myp5-resources/`, merged into the existing generated payloads. Generation rejects missing packs, missing lessons, malformed resources and duplicate MYP question identities. Runtime loading retains exact payload hash checks and validates the study-pack contract. The build verifier additionally scans for held AP/MYP teaching text.

[The resource ledger](ap-myp-resource-expansion-20261021.json) records every module's counts and resource hash, plus all 59 subject/course hashes. [The original-content baseline](ap-myp-original-content-hashes-20261021.json) confirms that removing additions reconstructs every original course/lesson object, including prompts and answers. Canonical hashing uses recursively sorted keys and ECMAScript JSON number serialisation.

## Editorial checks

- [AP STEM cross-check](ap-stem-crosscheck-20261021.json): 27 modules in nine courses, 27 new examples, 54 new questions and 99 independent arithmetic calculations. Corrected three question premises: initial chemical equilibrium/gas phases, gravitational rather than apparent weight, and initially uncharged capacitors.
- [AP author arithmetic checks](ap-stem-numeric-checks-20261021.json): 40 additional selected calculations. These are bounded calculations, not exhaustive independent subject review.
- [MYP language/arts cross-check](myp-language-arts-crosscheck-20261021.json): all 66 English, Spanish, music, drama and visual-arts packs; 66 examples, 264 cards and 132 questions. Thirteen bounded corrections across nine lessons improve language, supplied premises and concrete model responses. Ten AP art-history modules also receive checked primary-source references.
- [MYP STEM cross-check](myp-stem-crosscheck-20261021.json): all 192 new example/practice records in 64 mathematics, physics, chemistry, biology and integrated-sciences lessons were screened. All 130 numerical/algebraic calculations and three formal proof checks passed; 59 remaining records were conceptual/design items. Added the missing centimetre premise to one trigonometry question. Notes, cards and diagrams were outside this bounded check.
- [US government/history source checks](ap-us-source-checks-20261021.json) preserve both inspected sources and retrieval limits. Source links in selected PHE packs support general physiology, nutrition and activity explanations; fictional tasks are not personalised medical advice.

## Validation

- **99 focused checks passed**, zero failures, cancellations or skips (8.72 seconds). Coverage includes resource contracts, original-content preservation, global question identities, generated payloads and runtime loading, practice state, selected numerical answers, exact counts, report freshness and publication-leak mutations. Receipt: `test-results/ap-myp-expansion-20261021/final-content-tests.log`.
- **61 browser scenarios passed across resumed runs**: 42 AP course scenarios exercise all 274 modules; 17 MYP subject scenarios exercise all 205 lessons; two scenarios cover responsive/keyboard/reduced-motion behaviour and saved-answer separation across lessons. The final code and content are covered by the 42 AP successes in `ap-passed-myp-selector-failed.log`, 14 MYP successes before interruption in `myp-browser-final-interrupted.log`, and five remaining successes in `browser-completion.log`. Initial failures and interruption are preserved; this is not described as one uninterrupted 61-test run.
- **36 final visual captures**: diagrams and flashcards for AP Calculus AB, AP Japanese and MYP Design at 1440, 1024 and 390 px in Blue and Midnight. Inspected 13 representative final images across all three widths, both themes and all three subjects. Text, Japanese glyphs, diagram links and controls remain readable with no horizontal overflow. Keyboard Enter/Space toggles and reduced motion passed. Screenshots are in the `browser/ap-myp-resources-responsiv-be1fe-rd-cards-and-reduced-motion/` directory under the receipt folder.
- Node 22 type-check, scoped ESLint, whitespace checks and generated AP/MYP/coverage/ecosystem/resource-report freshness passed. Shared-library, source-crosswalk and curriculum-scope freshness also passed. **Copy lint: 542 files, zero findings**. The separate legacy audit remains **245 guides / zero approved / 53 flagged**; no legacy finding was suppressed.
- Final local production-mode Vite build passed in **33.75 seconds**. Verification of its emitted output passed: **144 JavaScript files, 50,499 string nodes and 6,853 held AP/MYP teaching strings checked; zero violations and zero approved static assets**. The build is under `test-results/ap-myp-expansion-20261021/build`; receipts are `build-final.log` and `publication-final.log`.

[The verification ledger](ap-myp-resource-verification-20261021.json) binds final report, review-receipt, log and screenshot hashes. These are local authoring/browser checks, not hosted account evidence or independent curriculum approval.

## Corrections and retained failures

The correction pass removed inherited AP list bullets from diagram connections and made resource headings consistent; it also gave the AP selector an explicit accessible name. Full MYP navigation exposed duplicate sibling React keys that retained the previous lesson's flashcards; the resource component now has its own key and every MYP lesson transition passes. Test selectors were scoped to the notes section when a diagram shared its title and made stable across flashcard reveal/hide labels.

Initial visual/selector failures, the MYP duplicate-key regression, an ESLint escape correction and interrupted runs remain under the receipt folder. One publication check was started before a build finished and found no emitted JavaScript; that failure is preserved and the final check ran after the successful build. No assertion, content approval or publication rule was weakened to obtain the final passes.

## Scope and publication

These are original editorial drafts for all modules in the current repository catalogue. The counts do not establish exhaustive official syllabus coverage, official scoring, practical certification or qualified independent subject approval. Existing source crosswalks and unknown course-topic denominators are preserved. The separate 42 shared foundation lessons remain at 385 questions, 428 cards, 196 examples and 46 diagrams.

Publication approvals remain zero. The 245 legacy guides remain held, including 53 quarantined/flagged guides. No publication gate was relaxed, no content was deployed and no database or provider mutation was performed. Existing unrelated working-tree changes are preserved.
