# VertexED Stage 08 — UX, accessibility, responsive and performance pass

**Gate: PASS locally on exact candidate `9cb1c81de9725152ad46c8928c1b0556f1251131`.**

The serial production-preview command passed 34 checks across 375 px, 390 px,
768 px and 1440 px browser projects. Two tablet/desktop executions of the
mobile-navigation-only case were intentionally skipped. The suite asserts skip-link
focus, inert mobile navigation and Escape restoration, dialog focus/closure/restoration,
visible keyboard focus, horizontal fit at 375/390/768/1024/1440 px, and WCAG AA design-token
contrast in light and dark themes.

A runtime-equivalent parent candidate's first four-worker rerun recorded one 45-second
desktop timeout while 33 applicable cases passed. Its retained trace shows the browser
input call stalled for 33 seconds under host I/O contention; the focused assertion then
passed in 3.3 seconds. The final exact candidate's complete production-bundle matrix
passed serially at 34/34 applicable with the same two intentional skips. No product
assertion was weakened or removed.

The production build transforms 2,768 modules, validates one Vercel function and 19
routed endpoints, and passes frozen gzip budgets:

| Metric | Observed | Budget |
| --- | ---: | ---: |
| Initial JavaScript | 237,637 B | 275,000 B |
| Initial CSS | 33,424 B | 45,000 B |
| Largest JavaScript chunk | 232,813 B | 240,000 B |
| Total JavaScript | 969,955 B | 1,000,000 B |

The performance repair lazy-loads the landing feature surface, authenticated tutor panel
and rich message renderer, and removes a manual Markdown chunk boundary that had pulled
shared utilities into the entry graph. Initial JavaScript fell from 378,666 B to 237,637 B
gzip, a 37.2% reduction. `tests/build-performance.test.mjs` fails closed on budget
regression and protects the lazy boundaries.

Truth boundary: this is local Chromium and production-build evidence, not an assistive-
technology user study or a deployed Core Web Vitals measurement.
