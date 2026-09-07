# Next

## Current engineering release boundary

Canonical source is `main@67f9a0b861fcac886a6f676202e1068281725723`, the verified merge of PR #771.
Repository source/build and local keyboard accessibility are green on this SHA, while the
live production browser and smoke lanes remain red.

The exact failed-SHA transport diagnostic retained by workflow run `34106267097`
localizes the first observable production break after DNS and TCP but before application
HTTP semantics:

- `www.vertexed.app` resolves successfully;
- TCP/443 is reachable;
- authenticated TLS fails with `ECONNRESET` before a secure session is established;
- HTTPS fails at the same pre-handshake boundary.

Both connected Vercel integrations also fail this exact source SHA:

- `vertex-ed-ai` → `dpl_5YwjUzJZX4fe5YNpfLa4f7VVgQJn`;
- `vertex-ai` → `dpl_CEyGKs3zzXzzZ8i24qketxrXPqWG`.

Do not create a sentinel/no-op commit, weaken immutable revision/readiness checks, or
rewrite unrelated product code to probe this failure.

## Next engineering gates

1. Prove which Vercel project intentionally owns the `www.vertexed.app` production alias
   and which DNS record/target is authoritative.
2. Inspect the first causal private deployment log for that canonical project without
   copying secret values into repository evidence. Inspect the duplicate project only far
   enough to determine whether it shares the same cause or should be detached.
3. Compare the canonical project's required custom-domain DNS target with the published
   DNS path and repair only a demonstrated mismatch.
4. Make one deliberate immutable deployment of the selected current release SHA through
   the canonical project.
5. Require the same SHA to pass DNS/TLS, `/api/health` liveness, exact revision in body and
   headers, `HEAD` health identity, dependency-aware readiness, production browser,
   production smoke, and the scheduled Production Health monitor.
6. Separately remediate the open Supabase platform security warnings tracked in #686
   through authorized infrastructure controls; do not simulate them in application code
   or perform an unattended database upgrade.
7. After exact production identity is certified, run approved disposable-account auth/RLS
   journeys. Never commit or paste access tokens, database URLs, service-role keys, or
   learner data into this repository or evidence artifacts.

## Scientific boundary

Learner-study execution and interpretation remain outside engineering automation. Keep
`docs/PILOT_PROTOCOL.md` frozen for the research workflow; until participant evidence
exists, do not claim measured learning improvement.
