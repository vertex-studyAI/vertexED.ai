# Next

## Current engineering release boundary

Canonical source is `main@67f9a0b861fcac886a6f676202e1068281725723`, the verified merge of PR #771.
Repository source/build and local keyboard accessibility are green on this SHA, while the
live production browser and smoke lanes remain red.

The exact failed-SHA transport diagnostic retained by workflow run `34106267097`
localizes the first observable production break after DNS and TCP but before application
HTTP semantics:

- `www.vertexed.app` resolves successfully to `104.219.250.37` and `2.59.170.20`;
- TCP/443 is reachable;
- authenticated TLS fails with `ECONNRESET` before a secure session is established;
- HTTPS fails at the same pre-handshake boundary.

The current resolved addresses are announced by Namecheap (`104.219.250.37`) and
Worldstream (`2.59.170.20`), not Vercel. Treat that as a demonstrated production-routing
mismatch. It still does not prove which of the two attached Vercel projects is the intended
canonical owner of `www.vertexed.app`.

Both connected Vercel integrations also fail this exact source SHA:

- `vertex-ed-ai` → `dpl_5YwjUzJZX4fe5YNpfLa4f7VVgQJn`;
- `vertex-ai` → `dpl_CEyGKs3zzXzzZ8i24qketxrXPqWG`.

PR #773 is a read-only release-observability follow-up that retains the bounded CNAME
chain alongside final DNS addresses so future failed-SHA artifacts preserve alias routing
instead of flattening it. It does not change DNS or deploy production.

Do not create a sentinel/no-op commit, weaken immutable revision/readiness checks, guess a
project-specific DNS target, or rewrite unrelated product code to probe this failure.

## Next engineering gates

1. Prove which Vercel project intentionally owns the `www.vertexed.app` production alias.
2. Obtain the exact custom-domain DNS target reported by that canonical Vercel project
   (for example through the project's Domain Settings or domain verification tooling) and
   retain only non-secret configuration evidence.
3. Inspect the first causal private deployment log for the canonical project. Inspect the
   duplicate project only far enough to determine whether it shares the same cause or
   should be detached.
4. Correct only the demonstrated `www.vertexed.app` DNS mismatch, preserving unrelated
   MX/TXT/verification records. Do not infer a target from examples or another project.
5. Make one deliberate immutable deployment of the selected current release SHA through
   the canonical project after routing/project ownership is corrected.
6. Require the same SHA to pass DNS/TLS, `/api/health` liveness, exact revision in body and
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
