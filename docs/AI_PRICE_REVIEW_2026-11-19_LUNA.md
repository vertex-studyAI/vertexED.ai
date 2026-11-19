# VertexED candidate AI price review — 19 November 2026

## Correction

The policy in candidate #1146 expired at 00:00 UTC on 1 November. A constructed request at the previous deadline and the current review date reproduces `AI_USAGE_UNAVAILABLE`. This update renews only its review metadata, to `beta-usd-2026-11-19-v4`, reviewed 19 November and expiring **26 November 2026 at 00:00 UTC**. The seven-day review window and closed admission at expiry remain.

This candidate has a different model generation from #1178: it already includes Luna. Copying that older two-model policy would remove existing candidate behavior. No model, request allowlist, price, context bound, resource ceiling, settlement code or provider configuration changes here.

## Official contract review

The official pages below were searched and opened on 19 November 2026.

| Existing model identity | Uncached input USD / million | Output USD / million | Context tokens |
| --- | ---: | ---: | ---: |
| `gpt-6-luna` | 0.10 | 0.50 | 1,050,000 |
| `gpt-4.1-mini-2025-04-14` | 0.40 | 1.60 | 1,047,576 |
| `gpt-4o-mini-2024-07-18` | 0.15 | 0.60 | 128,000 |

[Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) still documents a full-request multiplier above 272,000 input tokens: twice input and 1.5 times output. Its existing conservative reservation uses those larger rates over the complete context, plus the bounded output. The existing rolling alias and dated-response identity rule remain; the short review expiry limits unattended price drift.

[GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini) and [GPT-4o mini](https://developers.openai.com/api/docs/models/gpt-4o-mini) retain the recorded rates and context. Both snapshots are deprecated; the [official schedule](https://developers.openai.com/api/docs/deprecations) lists shutdown on 14 January 2027. This review does not certify account-specific availability or select replacements.

The [beta reconciliation record](BETA_ACCESS_RECONCILIATION_2026-10-16.md) records authority for USD1 per account and USD10 per project per UTC day, with two account/eight project unresolved operations, and requires another model/rate review after expiry. All those limits remain exact. Default service tier, no storage, redirect rejection, text-only inputs, 16–4096 output tokens, historical clock floor and uncertain-spend retention are unchanged. At 1,200 output tokens the existing reservations remain 210,900, 420,951 and 19,920 microUSD respectively.

## Verification

Parent head: `ce0461e3177f382c44c773cdff2e6f19be49656b`. The policy source was fetched at this immutable head. New focused tests run on Node24.22.3 with the standard library, no SDK, provider, credentials, network or database.

Before the metadata renewal: **three passed, one failed**, with the current-date admission test rejected by the old expiry. After renewal: **four passed, zero failed/skipped**. Cases verify prior-deadline/current-date admission, unchanged reservations and request controls for all three models, exact new expiry, invalid clocks, unchanged daily/concurrency limits, output bound and the long-context settlement threshold.

Run `node --test tests/ai-price-review-20261119.test.mjs`. This bounded local result uses Node24, while normal hosted candidate CI supplies the repository's pinned-runtime and broader integration evidence. It does not certify live provider calls or alter any workflow/test selection.

## Remaining boundary

This is a source-maintenance correction on the existing review branch. It does not apply migrations, change quotas, issue a provider call, approve held curriculum, certify real learner/account journeys, repair DNS, or record a public-release GO decision. The existing exact-hash content approval and account/release requirements remain in force.
