# VertexED pricing, quota, and lifecycle product contract

Status: **proposal / implementation specification only**. This document does not assert that billing, quotas, paid plans, pay-per-use, or any model entitlement is live in production.

This contract exists to keep pricing copy, quota UX, billing-period behavior, learner access, and analytics consistent before monetization is exposed.

## 1. Product principles

1. A learner must always be able to access saved plans, notes, practice history, exports, account settings, and account deletion even when AI generation is unavailable or a quota is exhausted.
2. Never show a precise usage number unless the server-side ledger can reconcile it to authoritative provider-reported usage.
3. Do not describe allowance as provider "tokens" unless the allowance is literally measured and billed that way. VertexED currently spans model classes with different input/output/cached-unit economics, so the public unit should remain a normalized AI usage unit until metering is proven.
4. No silent overage. Pay-per-use is off by default and requires explicit learner opt-in plus a spend cap.
5. Billing-period resets follow the account subscription period, not the first day of the calendar month.
6. Retry, timeout, failover, or duplicate requests must never double-charge a learner.
7. Pricing UI must distinguish a proposal from a live entitlement. Do not publish this ladder until the launch gates in this document pass.

## 2. Proposed plan ladder

The current proposed paid ladder is:

| Plan | Proposed monthly price | Proposed included normalized AI usage |
| --- | ---: | ---: |
| Free | $0 | numeric allowance TBD from beta evidence |
| Starter | $3 | 500,000 units |
| Plus | $10 | 1,500,000 units |
| Pro | $15 | 2,500,000 units |
| Max | $30 | 6,000,000 units |

The numbers above are product hypotheses, not production entitlements. Before launch, the free allowance and every paid allowance must be validated against observed provider-cost distributions and learner activation/retention behavior.

## 3. Normalized usage ledger

### Server-side source of truth

Every billable AI operation should create one idempotent usage record containing:

- account ID (server-side only; never sent to frontend analytics)
- immutable request/operation ID
- feature/surface key
- provider and model key
- provider-reported input units
- provider-reported cached-input units when available
- provider-reported output units
- any separately metered modality units when applicable
- cost-weight version
- normalized units charged
- provider request completion state
- billing period ID
- recorded-at timestamp

### Conversion rule

Provider-reported usage -> versioned cost weights -> normalized VertexED usage units.

The weight table must be versioned so historical usage does not change when providers change pricing or VertexED changes models.

### Charging rules

- Failure before confirmed provider usage: charge 0.
- Confirmed provider usage followed by downstream product failure: charge only according to the frozen billing policy and record the failure; do not silently retry-charge.
- Ambiguous or unverifiable provider usage: VertexED absorbs the cost; learner charge is 0.
- Retry/failover: one logical learner action carries one idempotency key across attempts.
- Cached input must be treated according to its actual provider economics, not as full-price input by assumption.
- Metering, enforcement, and display all read from the same authoritative ledger projection.

## 4. Usage visibility UX

### Account / Usage card

Required fields:

- current plan name
- included allowance for the current billing period
- used normalized units
- remaining normalized units
- percentage used
- exact billing-period reset date/time in the learner's local display timezone
- whether pay-per-use is disabled or enabled
- if enabled, current spend-cap state and verified overage spend
- link: `How usage works`

Do not render a synthetic number while reconciliation is unavailable. Use an explicit state instead:

> Usage details are temporarily unavailable. Your saved work is still available. We will not apply unverified usage to your allowance.

### Warning states

**Below 80%**: neutral progress display only.

**80-94.99%**:

> You have used {percent}% of this period's AI allowance. It resets on {date}. Your saved work is always available.

Primary action: `View usage`
Secondary action: `Compare plans` only if paid plans are actually live.

**95-99.99%**:

> You are close to this period's AI limit. New AI generation pauses when the included allowance is used. Your saved work stays available.

Show reset date prominently. If an upgrade path is live, show `Compare plans`. Do not imply urgency beyond the actual quota state.

**100%**:

> You have used this period's included AI allowance. New AI generation is paused until {reset date} unless you change plan or explicitly enable pay-per-use. Your saved work is still available.

Never disable saved content, export, settings, cancellation, or account deletion.

## 5. Reset semantics

Each account has a billing-period record with `period_start` and `period_end`.

- Free: use a documented recurring period boundary chosen by the billing system; do not silently call it "monthly" until that boundary is defined.
- Paid: reset at the subscription billing-period boundary.
- Upgrading must not grant two resets in one billing period.
- Downgrading does not erase already-recorded usage.
- Unused included allowance does not roll over in v1.
- Reset display must always show an exact date, not copy such as "next month".

## 6. Upgrade, downgrade, cancellation, and payment states

### Upgrade

Proposed behavior: effective immediately after successful payment-provider confirmation, with provider-supported proration. The account receives the new period allowance according to one deterministic proration/allowance rule. The implementation must prove that the upgrade cannot reset usage twice.

Required confirmation copy:

> Your plan changed to {plan}. Your current billing period still ends on {date}. Your usage page shows the allowance available for the rest of this period.

Do not state the new allowance until the ledger has applied it.

### Downgrade

Effective at the next billing-period boundary unless the billing provider requires another clearly disclosed behavior.

> Your current plan stays active until {date}. {new plan} begins on that date. Your saved work will remain available.

If current usage exceeds the future lower allowance, do not retroactively block the current period.

### Cancellation

Cancellation stops renewal; paid access remains through the current paid period unless a verified refund or billing rule says otherwise.

> Your plan will not renew. Paid plan access continues through {date}. Your saved work remains available after the plan changes.

### Past due

Use a defined grace state rather than deleting learner access. After the grace policy ends, fall back to the appropriate free entitlement while preserving saved work. Never claim a grace duration until the billing policy is frozen.

### Refunds

Do not publish a refund promise until legal/billing policy is approved. Help surfaces should link to the actual policy once available.

## 7. Pay-per-use contract

Pay-per-use must launch only after the authoritative usage ledger and payment reconciliation pass production validation.

Required UX before enabling:

1. Toggle is off by default.
2. Show the public normalized-unit rate and a plain-language example based only on verified billing semantics.
3. Require the learner to set a monthly/billing-period spend cap.
4. Confirm the exact cap before enabling.
5. Show accumulated verified overage spend and remaining cap.
6. At cap, pause new overage-generating AI operations.
7. Provide one-click disable. Disabling does not affect saved work.

Never automatically enable pay-per-use because included allowance is exhausted.

Suggested enable confirmation:

> Pay-per-use is off by default. If you turn it on, eligible AI usage beyond your included allowance can be charged up to the spend cap you choose. You can turn it off at any time.

## 8. Feature-entry quota behavior

Before starting a potentially billable AI operation, the server returns one of:

- `allowed_included`
- `allowed_payg`
- `blocked_quota`
- `usage_unavailable_fail_open_no_charge` only when policy explicitly permits the operation at VertexED's cost
- `usage_unavailable_blocked` when the operation cannot be safely authorized

Frontend copy for `blocked_quota`:

> AI generation is paused because this period's included allowance is used. Your saved work and non-AI study tools remain available.

Actions: `View usage`, and only if live, `Compare plans` / `Enable pay-per-use`.

## 9. Help and support copy

### How usage works

> VertexED may use different AI systems for different study tasks. Their underlying usage is not directly comparable, so your plan uses normalized AI usage units. Your usage page shows the allowance applied to your account for the current billing period and its reset date. We only apply usage that our server-side meter can verify.

### Why did my usage change?

> AI tasks can use different amounts of computing depending on the feature, input size, and output generated. VertexED converts verified provider usage into normalized units using a versioned rate table. We do not charge an additional allowance for failed requests when provider usage cannot be verified.

### Does my allowance roll over?

> No. In the initial plan design, unused included allowance does not roll over to the next billing period.

### What happens when I reach my limit?

> New AI generation pauses when your included allowance is used unless you have explicitly enabled pay-per-use. Your saved plans, notes, history, exports, settings, and account controls stay available.

### When does usage reset?

> Your usage page shows the exact end of your current billing period. Resets follow that period rather than the first day of the calendar month.

## 10. First-session activation contract

The first-session learner journey is:

`Account -> onboarding -> starter plan -> dashboard -> first practice route -> useful result -> clear next action`

The dashboard handoff should expose:

- Primary: `Try one question` -> `/exam-prep`
- Secondary: `Review plan` -> `/planner`

The first-practice CTA is navigation only. It must not count as activation on click.

A learner becomes product-activated only after a real learner-visible core result succeeds. The exact result boundary must be implemented where the product can prove that the result was returned, not in the banner.

## 11. Analytics instrumentation requirements

Continue to obey `docs/ANALYTICS_EVENTS.md`: low-cardinality product state only; never prompts, answers, learner content, emails, names, IDs, or other identifying payloads.

Required future events for this contract:

### First Core Action Completed

Fire only after a successful learner-visible core result.

Allowed properties:

- `surface`: `exam_prep | answer_reviewer | paper_maker | notetaker | other_core`
- `result_type`: bounded enum defined by the implementing surface
- `review_state`: `not_applicable | available | completed`
- `cloud_state`: `synced | device_only | unknown`

Never fire on route entry, CTA click, provider request start, provider error, or partial result.

### Usage Viewed

Allowed properties:

- `plan_tier`: bounded tier enum
- `usage_band`: `under_80 | 80_94 | 95_99 | exhausted | unavailable`
- `payg_state`: `off | on | unavailable`

Do not send raw usage counts to third-party frontend analytics.

### Quota Warning Shown

Allowed properties:

- `warning_band`: `80 | 95 | 100`
- `surface`: bounded feature enum

### Plan Change Started / Completed / Failed

Allowed properties only:

- `from_tier`
- `to_tier`
- `change_type`: `upgrade | downgrade | cancel | resume`
- `result`: on completed/failed event only

Never send price, payment identifiers, invoices, card data, account ID, or free-form failure messages to frontend analytics.

### Pay Per Use Changed

Allowed properties:

- `state`: `enabled | disabled`
- `cap_band`: a predefined non-identifying bucket, never the raw payment instrument or billing identifier

## 12. Launch-conversion surfaces

Before monetization launch, product surfaces should be sequenced as follows:

1. Private-beta landing: continue to emphasize joining/using the beta, not public paid-plan promises.
2. In-product activation: first useful study result before any upgrade prompt.
3. Usage page: visible before enforcement is turned on.
4. Quota warnings: informational at 80%, stronger at 95%, enforcement only at 100% after ledger validation.
5. Pricing page: publish only after plan entitlements, reset behavior, checkout, lifecycle transitions, support policy, and unit economics have passed the launch gates.

Do not insert a paywall into onboarding.

## 13. Pre-launch acceptance gates

Paid-plan UI may be exposed only when all are true:

- every billable AI route emits authoritative usage or is explicitly non-billable
- ledger usage reconciles against provider billing within an approved tolerance over real beta traffic
- idempotency/retry tests prove no duplicate allowance charge
- upgrade, downgrade, cancellation, resume, past-due, and reset transitions have automated tests
- quota warnings and 100% enforcement preserve saved-work access
- pay-per-use, if offered, has explicit opt-in and cap enforcement
- exact plan prices/allowances are approved against measured unit economics
- Terms, Privacy, billing/refund language, tax/entity setup, and support route are approved
- end-to-end checkout and account lifecycle are verified in the actual production environment
- analytics events are schema-tested and contain no learner content or identifying payloads

Until those gates pass, this document remains an implementation contract, not a statement of live product capability.
