# AI usage policy — 19 October 2026

Status: **implemented and locally contract-tested; deployed-provider behavior not yet certified**.

## Default model contract

VertexED's default text provider is `gpt-6-luna` on the OpenAI Responses API. Requests are pinned to Standard service, disable provider storage, and set reasoning effort to `none`. The retained fallback is `gpt-4o-mini`; it is used only through the existing explicit fallback contract.

The policy is fail-closed. A request is denied before provider invocation when the model is unknown, the price policy is expired, the modality is unsupported, or the usage-reservation store cannot authorize the request. The current policy version is `beta-usd-2026-10-19-v2` and expires on 26 October 2026 so pricing and model assumptions cannot silently become permanent.

The reservation calculator uses the official Standard short-context rates of $0.10 per million input tokens and $0.50 per million output tokens for GPT-6 Luna. Requests above 272,000 input tokens use the documented long-context multipliers: 2× input and 1.5× output. A positive displayed balance is not a promise that a later request will be admitted; concurrency, request shape, policy freshness and the final atomic reservation still control admission.

Primary sources:

- [GPT-6 Luna model](https://developers.openai.com/api/docs/models/gpt-6-luna)
- [Latest-model migration guide](https://developers.openai.com/api/docs/guides/latest-model)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)

## Verification boundary

Local tests verify model allowlisting, dated response identities, reasoning/service/storage fields, long-context reservation pricing, expiry refusal, fallback behavior and default route selection. They do not establish live latency, output quality, account quota, provider availability or production cost settlement. Those remain part of AI-01, AI-02, AI-05, AI-06, EXT-05 and the live acceptance journey.
