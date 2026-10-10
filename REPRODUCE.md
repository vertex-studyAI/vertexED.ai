# Reproduce the VertexED local checks

Use Node 22.22.0 and npm 10.9.4 (`.nvmrc` and `package.json`). From this repository, after a lockfile-based `npm ci` in an isolated candidate:

```sh
rtk npm run ci
rtk proxy npx playwright test --config=playwright.learning.config.ts --workers=1
rtk proxy npx playwright test --config=playwright.astra.config.ts --workers=1
rtk npm run test:e2e:authenticated-golden
```

The normal production build must precede the learning/ASTRA browser suites. They use local API/auth fixtures; golden tests build their separate fixture artifact. Never count these as successful real-provider or deployed RLS checks. Browser binaries must already be installed, and the runner needs local browser/loopback access. Keep writable temporary files on storage with sufficient free space.

```sh
rtk proxy node scripts/probe-production-gates.mjs --json
```

This read-only live probe intentionally exits nonzero when production gates fail. Current failure is retained in the final report. Network access is required for dependency advisories and production probes. Do not turn missing advisory data into a pass.

`npm run db:test` resets a database. Run it only after confirming a disposable local Supabase target and functioning Docker. No production reset or shared-project migration is authorised by this reproduction recipe.

See [the final report](ASTRA_FINAL_REPORT.md) for the commands actually executed in this pass and the receipt paths.
