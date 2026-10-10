# Product activation and return metrics

VertexED already emits privacy-bounded product events, but the release gate also needs a durable activation denominator that does not depend on browser analytics delivery.

## Canonical activation

For this report, **durable core-artifact activation** means the first successful persisted **non-planner** row in `public.user_study_artifacts`. Planner rows are excluded because onboarding automatically creates a starter planner; counting that row would collapse onboarding and activation into the same event. A non-planner artifact is a narrower durable signal that the learner completed a study workflow which saved work.

The report in `docs/PRODUCT_ACTIVATION_RETENTION.sql` reads only `user_id`, `kind`, and `created_at` internally. It never selects artifact titles, payloads, prompts, answers, email addresses, tokens, or learner content, and its final result is aggregate-only.

## Return definitions

- **D1 core-artifact return:** another persisted artifact between 24 and 48 hours after activation.
- **D7 core-artifact return:** another persisted artifact between 7 and 8 days after activation.
- **Core-artifact-active users (7d):** distinct accounts that persisted at least one study artifact in the trailing seven days.

The D1/D7 denominators include only accounts old enough to have completed the full observation window. Recent activations are excluded until their window matures.

These are intentionally conservative product metrics. A learner can return to VertexED without creating another non-planner artifact, so these numbers must be described as **core-artifact return**, not universal app retention. The separate privacy-safe browser event `First Core Action Completed` remains the broader funnel signal when its delivery can be trusted.

## Release use

Use the aggregate report to establish a real activation cohort before widening the beta. Pair it with the existing privacy-safe funnel events to locate the largest drop-off, then address that observed break before adding a new feature family.

Do not expose the per-account CTEs as a browser/API response. Run this only from an authorized admin/server analytics context and publish aggregate counts/rates.


## Durable database funnel

`docs/PRODUCT_FUNNEL.sql` complements the browser analytics funnel with aggregate persistence evidence:

1. approved waitlist record;
2. approved record linked to an Auth account;
3. curriculum profile configured (board present and at least one subject);
4. starter planner persisted;
5. at least one non-planner core study artifact persisted.

The profile stage is explicitly a **database proxy**, not a replacement for the browser-side `Onboarding Completed` event. Likewise, a durable core artifact is narrower than `First Core Action Completed`, because some valid core workflows may not persist a study artifact.

The report intentionally keeps those distinctions instead of forcing all product activity into one metric. Use browser events to understand the journey and durable aggregate SQL to cross-check persistence-backed stages.
