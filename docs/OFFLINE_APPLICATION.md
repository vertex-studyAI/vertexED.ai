# Offline application loading

Production builds generate `/sw.js` from the exact HTML, compiled assets and
public MYP lesson payloads. Installation verifies SHA-256 integrity and must
finish completely before activation. The public cache has a 20 MiB build limit.
The existing logo, app mark and favicon are included when present.

An installed version serves its own HTML and assets together. New versions wait
until existing tabs close before activating; activation removes only earlier
VertexED public caches. A failed install removes its incomplete cache and leaves
the active version intact. Rolling back the deployed source produces the
corresponding bundle on the next successful install and activation.

Only enumerated public build resources enter Cache Storage. API responses,
authorization-bearing requests, cross-origin requests, uploads and arbitrary
runtime responses are excluded. Existing account-scoped stores still own drafts
and saved work. Worker installation is not a cloud-save acknowledgement and does
not grant offline account access or provide AI responses.

Registration runs only in production builds and is allowed to fail without
breaking online operation. Browser storage restrictions, eviction and quota
limits can make offline loading unavailable. Study tools and Settings show an
offline status verified against every expected cached file, connectivity, and
pending updates. Download repairs an incomplete copy; Remove opts out across
reloads and deletes only the public copy, preserving private work. Initial
installation requires a successful online visit; this is not a first-visit
offline application. AI and account sync still require a connection.

## Verification

- `node --test tests/offline-bundle.test.mjs`: deterministic versions, excluded
  files, offline shell/lesson retrieval, private-request bypass, cache ownership
  and failed-install recovery.
- `npm run build`: Vite emits the worker after writing the production bundle.
- `npx playwright test --config=playwright.offline.config.ts`: reloads the formula
  desk offline, checks an answer, opens a previously unvisited physics route and
  inspects cached paths. This requires a fresh production build first.
- CI's `browser-release-features` matrix includes the offline journey and gates
  production smoke on its result.

14 October follow-up: fresh TypeScript and production build checks passed.
All 11 offline/calendar browser checks passed against the corrected build,
including offline reload, an unvisited lesson route, removal/reinstallation,
private-storage preservation, and keyboard/reduced-motion checks at 1440,
1024 and 390 pixels. Screenshots were inspected and a mobile calendar layout
and keyboard-focus correction was verified. See
[implementation checks](REPO_IMPLEMENTATION_2026-10-14.md).
