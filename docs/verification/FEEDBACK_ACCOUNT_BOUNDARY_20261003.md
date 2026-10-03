# Feedback account boundary verification — 3 October 2026

## Source binding

- Base: draft PR #1107 exact head `5441e60a4809e26cd88d12e8ac0f3b4126afebc5`
- Inspected `src/components/FeedbackLauncher.tsx` blob: `a125a9acd7692d721a6595d33866548046757249`
- Inspected `src/contexts/AuthContext.tsx` blob: `d88c62c353900437f17b5271cf02eb833a97f361`
- Inspected `src/lib/productFeedback.mjs` blob: `8ed06785a7c98347115f87e2f25f58241ce7e33e`

## Defect and repair

`FeedbackLauncher` is mounted above account changes. Before this patch, an unsent note and its category/rating remained in component state after sign-out, so a later account on the same mounted application could reopen the previous learner's draft. A delayed insert completion could also close or toast inside the next account's UI.

The repair clears the form whenever `user.id` changes, suppresses the launcher during the intervening pre-effect render so stale text is never painted, and binds each async submission to a monotonic account scope. An account switch or sign-out invalidates the old token before its promise continuation may update analytics, form state, submission state, or toasts. The database row uses the captured account ID rather than a later render's identity.

## Verification

```bash
node --test tests/feedback-account-boundary.test.mjs
```

The focused tests exercise stable identity, account-switch invalidation, sign-out invalidation, form reset source wiring, captured row ownership, and stale completion guards. This is local source-bound evidence only. It does not certify hosted Supabase policies, authenticated preview behavior, or production.

## Boundaries

No migration, RLS/policy, database, auth-provider, secret, analytics payload, deployment, DNS, or production setting changes are included. Production incidents #44 and #652 remain blocked on authoritative provider/domain identity and serving-path evidence.
