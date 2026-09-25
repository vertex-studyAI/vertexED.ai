# Product activation and return metrics

VertexED already emits privacy-bounded product events, but the release gate also needs a durable activation denominator that does not depend on browser analytics delivery.

## Canonical activation

For this report, **activation** means the first successful persisted row in `public.user_study_artifacts`. This matches the product boundary that a learner has completed a useful workflow and actually saved study work.

The report in `docs/PRODUCT_ACTIVATION_RETENTION.sql` reads only `user_id` and `created_at` internally. It never selects artifact titles, payloads, prompts, answers, email addresses, tokens, or learner content, and its final result is aggregate-only.

## Return definitions

- **D1 saved-artifact return:** another persisted artifact between 24 and 48 hours after activation.
- **D7 saved-artifact return:** another persisted artifact between 7 and 8 days after activation.
- **Artifact-active users (7d):** distinct accounts that persisted at least one study artifact in the trailing seven days.

The D1/D7 denominators include only accounts old enough to have completed the full observation window. Recent activations are excluded until their window matures.

These are intentionally conservative product metrics. A learner can return to VertexED without creating a new artifact, so these numbers must be described as **saved-artifact return**, not universal app retention.

## Release use

Use the aggregate report to establish a real activation cohort before widening the beta. Pair it with the existing privacy-safe funnel events to locate the largest drop-off, then address that observed break before adding a new feature family.

Do not expose the per-account CTEs as a browser/API response. Run this only from an authorized admin/server analytics context and publish aggregate counts/rates.
