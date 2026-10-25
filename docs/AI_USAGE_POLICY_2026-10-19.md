# AI usage policy — 19 October 2026

Status: **implemented and locally contract-tested; deployed-provider behavior not yet certified**.

## Default model contract

VertexED's default text provider is `gpt-6-luna` on the OpenAI Responses API. Requests are pinned to Standard service, disable provider storage, and set reasoning effort to `none`. The retained fallback is `gpt-4o-mini`; it is used only through the existing explicit fallback contract.

The policy is fail-closed. A request is denied before provider invocation when the model is unknown, the price policy is expired, the modality is unsupported, or the usage-reservation store cannot authorize the request. Official pricing and context bounds were rechecked on 25 October 2026. The current policy version is `beta-usd-2026-10-25-v3` and expires at 00:00 UTC on 1 November 2026 so pricing and model assumptions cannot silently become permanent. Daily account/project allowances and concurrency limits are unchanged.

The reservation calculator uses the official Standard short-context rates of $0.10 per million input tokens and $0.50 per million output tokens for GPT-6 Luna. Requests above 272,000 input tokens use the documented long-context multipliers: 2× input and 1.5× output. A positive displayed balance is not a promise that a later request will be admitted; concurrency, request shape, policy freshness and the final atomic reservation still control admission.

Primary sources:

- [GPT-6 Luna model](https://developers.openai.com/api/docs/models/gpt-6-luna)
- [Latest-model migration guide](https://developers.openai.com/api/docs/guides/latest-model)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [GPT-4.1 Mini model](https://developers.openai.com/api/docs/models/gpt-4.1-mini): $0.40 input / $1.60 output per million tokens; 1,047,576-token context.
- [GPT-4o Mini model](https://developers.openai.com/api/docs/models/gpt-4o-mini): $0.15 input / $0.60 output per million tokens; 128,000-token context.

The [deprecation schedule](https://developers.openai.com/api/docs/deprecations) lists 14 January 2027 for the retained GPT-4.1 Mini and GPT-4o Mini snapshots. The current one-week policy expires well before that date; any future renewal must recheck availability and prices. GPT-6 Luna is already the default. A live fallback migration still requires provider and quality acceptance evidence.

## Verification boundary

Local tests verify model allowlisting, dated response identities, reasoning/service/storage fields, long-context reservation pricing, expiry refusal, fallback behavior and default route selection. They do not establish live latency, output quality, account quota, provider availability or production cost settlement. Those remain part of AI-01, AI-02, AI-05, AI-06, EXT-05 and the live acceptance journey.
