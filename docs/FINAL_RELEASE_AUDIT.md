# Final Release Audit

Date: 2026-07-13

## Verdict

Not yet a release candidate.

## What Is Now Safe In Code

- Legacy generated paper creation is retired.
- Legacy answer review now returns assistive feedback only and withholds unsupported grades.
- Quiz grading now auto-scores only deterministic multiple-choice items and withholds constructed-response scores.
- Verified exam catalogue routes exist for:
  - availability checks
  - approved session creation
  - response submission
  - deterministic scoring
  - evidence capture
  - mastery updates
  - spaced-review scheduling
  - recommendation refresh
- Admin routes exist for:
  - curriculum creation
  - subject creation
  - source ingestion
  - source-version registration
  - question import
  - review-state updates
  - question verification / activation
- A protected administrator content-operations UI now supports curriculum, subject, node, prerequisite, source, source-version, question import, review, publication, and activation workflows.
- Account export now includes cloud profile, saved work, sessions, responses, grading runs, evidence, mastery, schedules, and recommendations; account deletion clears cloud records and known device-only VertexED data.
- Local fake weakness tracking has been disabled.
- Default/fallback mastery and readiness inventions have been removed or withheld.

## Remaining Release Blockers

1. No authorized assessment dataset is present in the environment.
   - The code now handles this honestly, but production cannot claim supported exam coverage until approved content is ingested and verified.

2. The connected Supabase project now has the production-alignment, learning-architecture, and RLS/performance migrations applied. However, `public.waitlist` still has RLS disabled and requires an explicit owner decision before release.

3. Supabase Auth/Database owner settings remain outstanding: OTP expiry must be ≤ 1 hour, leaked-password protection must be enabled, and the available Postgres security patch must be applied.

4. The new content operations, privacy/export/deletion, and learner journeys still require end-to-end validation in the deployed Supabase/Vercel environment.

5. Constructed-response grading remains deliberately unavailable until a calibrated human-review workflow and its reliability evaluation are operated in production.

## Acceptance Gate Before Release

- Confirm the connected production Supabase project is the deployment target, and apply the waitlist RLS policy after choosing its intended access model.
- Enable OTP, leaked-password, database-patch, and backup safeguards in the Supabase dashboard.
- Ingest only authorized sources with provenance metadata.
- Verify and activate at least one end-to-end subject/component.
- Run manual QA on:
  - unsupported subject selection
  - verified session start
  - deterministic scoring
  - withheld scoring for unsupported answers
  - recommendation updates
  - cross-user isolation
  - mobile layout for paper maker and reviewer

## Current Confidence

The repo is materially safer than before and no longer relies on several known fabricated learning signals. The remaining blockers are real release blockers, not hidden correctness traps.
