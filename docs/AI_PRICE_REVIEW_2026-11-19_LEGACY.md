# Legacy AI price review — 19 November 2026

PR #1145 retained an expired admission policy. This review renews its existing two-model policy through **26 November 2026 at 00:00 UTC**; the exact expiry still fails closed. The source change is limited to the review comment, version label and expiry. Every model, rate, context bound, capability/tool rule, budget, concurrency limit and request/usage check is byte-for-byte unchanged.

Official OpenAI model documentation was checked on 19 November 2026:

| Existing snapshot | Input USD / 1M tokens | Output USD / 1M tokens | Context |
| --- | ---: | ---: | ---: |
| `gpt-4.1-mini-2025-04-14` | 0.40 | 1.60 | 1,047,576 |
| `gpt-4o-mini-2024-07-18` | 0.15 | 0.60 | 128,000 |

Sources: [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [GPT-4o mini](https://developers.openai.com/api/docs/models/gpt-4o-mini), and [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations). Both snapshots are deprecated and listed for shutdown on **14 January 2027**. This short review window does not migrate models or extend beyond that date.

The existing full-context reservation deliberately uses uncached standard text-token prices. Account/project limits remain USD 1 / USD 10 with concurrency 2 / 8. Five local, network-free regression tests check current-date admission, exact expiry and invalid clocks, unchanged limits, all four alias/snapshot reservations, rejected unsupported requests and strict actual-usage accounting. No provider request, account change, payment action, live deployment or budget increase was performed.

The baseline source is `ea87c543eeb87de45784a06681b7a36087d7279f`, policy blob `120919f05b774e9546908068a342e4f964a51343`. This receipt establishes only the narrow policy renewal; the PR's existing production, database, content, payment or owner acceptance conditions remain independently applicable. Historical policy receipts are retained.
