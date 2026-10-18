# AP content implementation — 15 October 2026

**All 42 current AP courses now have local study content: 274 modules and 548 original practice questions. Release verification remains incomplete.** No deployment was performed.

Later on 15 October, the [site completion pass](SITE_FINISH_2026-10-15.md)
completed semantic type checking, the full application suite, optimized build,
bundle budgets, all seven AP browser cases and visual review at the three required
widths. It corrected exact-course search and verified offline use. The initial
pass limitations below are retained as history; production and editorial gates
remain open.

The course roster follows the [official AP Students catalogue](https://apstudents.collegeboard.org/courses), checked on 15 October 2026. This includes the new 2026–27 Business with Personal Finance and Cybersecurity courses. Networking remains a future pilot, not an invented current catalogue entry.

## What students can use in the implementation

- Browse `/ap`, filter by subject area and search courses and module topics. Search state survives reload through the URL.
- Open a course outline and each module’s explanation, worked example, misconception correction and two original practice prompts.
- Attempt a response before opening hints, model reasoning and self-review checkpoints. Working stays temporarily across module navigation; download it before reloading or leaving. This does not save account progress or award AP marks.
- Find all 42 courses through the public learning library, global search and AP curriculum preferences. Existing saved subject selections are retained.
- Download integrity-checked public course assets. The offline build includes AP content alongside MYP; real browser offline acceptance still needs execution.

## Coverage

| Subject area | Courses | Modules | Questions |
| --- | ---: | ---: | ---: |
| Arts | 5 | 30 | 60 |
| English | 2 | 18 | 36 |
| History and social sciences | 10 | 65 | 130 |
| Maths and computer science | 6 | 36 | 72 |
| Sciences | 7 | 54 | 108 |
| World languages | 8 | 50 | 100 |
| Capstone | 2 | 10 | 20 |
| Career Kickstart | 2 | 11 | 22 |
| **Total** | **42** | **274** | **548** |

Each numbered unit or theme has focused material; art portfolios and Capstone use explicitly labelled original skill sequences. This is coverage of the course roster and selected unit skills, not an exhaustive textbook or externally approved AP curriculum. Required readings, authentic audio, speaking, laboratory and studio practice, and supervised projects remain necessary.

Current structures include five-unit Statistics and Psychology, revised four-unit Computer Science A, the 2026–27 language themes, and the current Pliny/Vergil Latin sequence. Precalculus Unit 4 is explicitly marked outside the AP exam. Business Unit 3 has two separate parts; portfolio and research courses do not imply a conventional written exam. Official references and scope notes appear in each course.

## Verification performed

- **33 focused tests passed, zero failures:** exact 42-course roster, source/public/hash consistency, invalid or stale downloads, retry/cache behaviour, all-course signed-out search, library boundaries, offline worker behaviour and sitemap rules.
- **Copy lint passed: 454 files, zero findings.** JSON lesson text is now included. The earlier single microeconomics wording finding remains in the retained log; it was corrected rather than suppressed.
- Targeted ESLint and Git whitespace checks passed. TypeScript syntax transpilation passed for 17 files; this is not semantic type checking.
- Deterministic generation and its read-only consistency check passed for all 42 assets. A final Chinese-language wording correction initially triggered a stale-asset failure; regeneration and current-content tests passed afterward. The failure log is retained.
- Content workers checked framework mappings and selected arithmetic; a separate internal review of Business and Cybersecurity found no actionable errors and passed 11 arithmetic checks. These are internal reviews, not external subject-expert certification.
- Seven AP Playwright cases were successfully discovered and connected to CI. **Discovery is not browser execution.**

## Remaining acceptance work

The final memory check recorded **195.95 MiB free plus speculative**, below the 512 MiB admission floor, with increasing pageouts. Full build, semantic typecheck, full application tests, bundle budgets and browser runs were not attempted. No unrelated process was stopped.

1. Run the full build/typecheck/application gates with adequate compute.
2. Execute `playwright.ap.config.ts`, inspect 1440px, 1024px and 390px screenshots, exercise keyboard/reduced motion and offline use, and complete the visual correction pass. No screenshots or visual acceptance are claimed here.
3. Complete subject-expert and native-speaker review; extend the focused modules where comprehensive syllabus preparation is required.
4. Integrate a committed candidate and satisfy the existing hosting/domain/service release gates before deployment. The [14 October release report](RELEASE_EXECUTION_2026-10-14.md) remains a historical blocker report; production was not re-probed in this content pass.

The 245 imported guide files remain held with zero publication approvals. Existing uncommitted product work was preserved. No new dependency, database mutation, commit, push or deployment was performed.

## Evidence and course inventory

The [portable receipt](evidence/ap-content-20261015.json) contains source and asset hashes, all final verification logs, resource measurements and content-review receipts. Raw intermediate logs remain in `.tmp/ap-expansion-20261015/`, including the initial copy finding and stale-generation failure.

| Course | Modules | Questions | Local route |
| --- | ---: | ---: | --- |
| AP 2-D Art and Design | 4 | 8 | `/ap/2-d-art-and-design` |
| AP 3-D Art and Design | 4 | 8 | `/ap/3-d-art-and-design` |
| AP African American Studies | 4 | 8 | `/ap/african-american-studies` |
| AP Art History | 10 | 20 | `/ap/art-history` |
| AP Biology | 8 | 16 | `/ap/biology` |
| AP Business with Personal Finance | 6 | 12 | `/ap/business-personal-finance` |
| AP Calculus AB | 8 | 16 | `/ap/calculus-ab` |
| AP Calculus BC | 10 | 20 | `/ap/calculus-bc` |
| AP Chemistry | 9 | 18 | `/ap/chemistry` |
| AP Chinese Language and Culture | 6 | 12 | `/ap/chinese-language-and-culture` |
| AP Comparative Government and Politics | 5 | 10 | `/ap/comparative-government-and-politics` |
| AP Computer Science A | 4 | 8 | `/ap/computer-science-a` |
| AP Computer Science Principles | 5 | 10 | `/ap/computer-science-principles` |
| AP Cybersecurity | 5 | 10 | `/ap/cybersecurity` |
| AP Drawing | 4 | 8 | `/ap/drawing` |
| AP English Language and Composition | 9 | 18 | `/ap/english-language-and-composition` |
| AP English Literature and Composition | 9 | 18 | `/ap/english-literature-and-composition` |
| AP Environmental Science | 9 | 18 | `/ap/environmental-science` |
| AP European History | 9 | 18 | `/ap/european-history` |
| AP French Language and Culture | 6 | 12 | `/ap/french-language-and-culture` |
| AP German Language and Culture | 6 | 12 | `/ap/german-language-and-culture` |
| AP Human Geography | 7 | 14 | `/ap/human-geography` |
| AP Italian Language and Culture | 6 | 12 | `/ap/italian-language-and-culture` |
| AP Japanese Language and Culture | 6 | 12 | `/ap/japanese-language-and-culture` |
| AP Latin | 6 | 12 | `/ap/latin` |
| AP Macroeconomics | 6 | 12 | `/ap/macroeconomics` |
| AP Microeconomics | 6 | 12 | `/ap/microeconomics` |
| AP Music Theory | 8 | 16 | `/ap/music-theory` |
| AP Physics 1: Algebra-Based | 8 | 16 | `/ap/physics-1-algebra-based` |
| AP Physics 2: Algebra-Based | 7 | 14 | `/ap/physics-2-algebra-based` |
| AP Physics C: Electricity and Magnetism | 6 | 12 | `/ap/physics-c-electricity-and-magnetism` |
| AP Physics C: Mechanics | 7 | 14 | `/ap/physics-c-mechanics` |
| AP Precalculus | 4 | 8 | `/ap/precalculus` |
| AP Psychology | 5 | 10 | `/ap/psychology` |
| AP Research | 5 | 10 | `/ap/research` |
| AP Seminar | 5 | 10 | `/ap/seminar` |
| AP Spanish Language and Culture | 6 | 12 | `/ap/spanish-language-and-culture` |
| AP Spanish Literature and Culture | 8 | 16 | `/ap/spanish-literature-and-culture` |
| AP Statistics | 5 | 10 | `/ap/statistics` |
| AP United States Government and Politics | 5 | 10 | `/ap/united-states-government-and-politics` |
| AP United States History | 9 | 18 | `/ap/united-states-history` |
| AP World History: Modern | 9 | 18 | `/ap/world-history-modern` |
