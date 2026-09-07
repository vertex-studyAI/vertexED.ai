# Next

## Current engineering release boundary

Canonical source is `main@6ed3e09b524b2bf86ef3372f517da6cfa627387e`, the verified merge of PR #773.
PR #773 landed read-only failed-SHA transport diagnostics that preserve a bounded CNAME
chain alongside final DNS addresses; the exact PR head passed canonical CI before merge.
The post-merge main CI run `34116347054` was still executing at the latest repository
checkpoint, so do not infer its final production lanes from the PR result.

The most recent retained production transport evidence localizes the first observable
live break after DNS and TCP but before application HTTP semantics:

- `www.vertexed.app` resolves to `104.219.250.37` and `2.59.170.20`;
- TCP/443 is reachable;
- authenticated TLS fails with `ECONNRESET` before a secure session is established;
- HTTPS fails at the same pre-handshake boundary;
- the final A destinations are announced by Namecheap and Worldstream rather than Vercel.

Treat that as a demonstrated production-routing mismatch, not as proof of which of the two
attached Vercel projects is the intended canonical owner or of the exact DNS value that
should replace the current route.

Do not create a sentinel/no-op commit, weaken immutable revision/readiness checks, guess a
project-specific DNS target, or rewrite unrelated product code to probe this failure.

## Next engineering gates

1. Prove which Vercel project intentionally owns the `www.vertexed.app` production alias.
2. Obtain the exact custom-domain DNS target reported by that canonical Vercel project
   through its domain settings or verification tooling, and retain only non-secret
   configuration evidence.
3. Inspect the first causal private deployment log for the canonical project. Inspect the
   duplicate project only far enough to determine whether it shares the same cause or
   should be detached.
4. Correct only the demonstrated `www.vertexed.app` DNS mismatch, preserving unrelated
   MX/TXT/verification records. Do not infer a target from examples or another project.
5. Make one deliberate immutable deployment of a selected current release SHA through the
   canonical project only after routing/project ownership is corrected.
6. Require that same SHA to pass DNS/TLS, `/api/health` liveness, exact revision in body and
   headers, `HEAD` health identity, dependency-aware readiness, production browser,
   production smoke, and the scheduled Production Health monitor.
7. Separately remediate the open Supabase platform security warnings tracked in #686
   through authorized infrastructure controls; do not simulate them in application code
   or perform an unattended database upgrade.
8. After exact production identity is certified, run approved disposable-account auth/RLS
   journeys. Never commit or paste access tokens, database URLs, service-role keys, or
   learner data into this repository or evidence artifacts.

## Scientific boundary

Learner-study execution and interpretation remain outside engineering automation. Keep
`docs/PILOT_PROTOCOL.md` frozen for the research workflow; until participant evidence
exists, do not claim measured learning improvement.
