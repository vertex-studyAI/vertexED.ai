# Bu1LD Public Production Monitoring

## Purpose

The Bu1LD repository has a substantial local release gate, but its existing `smoke` command verifies route declarations in generated source rather than the deployed public journey. This monitor adds external, read-only evidence for the live production surface at `https://thebu1ld.com`.

## Public contract

Every run verifies that these routes return HTTP 200, an HTML content type, a non-trivial response body, and no common application-error marker:

- `/`
- `/signup`
- `/login`
- `/projects`
- `/programs-public`
- `/evidence`
- `/privacy`
- `/terms`

The landing page must also contain Bu1LD identity and membership/research language. Each request has a 12-second timeout and follows normal redirects.

## Safety boundary

The monitor performs GET requests only. It does not:

- create an account;
- authenticate a member;
- submit an application;
- call privileged APIs;
- read Supabase data directly;
- write to production;
- use repository, Cloudflare, Supabase, or email secrets.

Authenticated member, project-lead, reviewer, and administrator journeys remain part of the strict credential-dependent production release gate.

## Schedule and evidence

The `Bu1LD Production Health` workflow runs every six hours, on manual dispatch, and when this contract changes on a pull request or `main`. Each run writes a concise GitHub summary and retains the complete command log for 14 days.

## Target-repository handoff

The durable script is `portfolio/scripts/bu1ld-production-smoke.mjs`. Once the GitHub integration can create branches in `ryangomez010/bu1ld-landing`, copy the script into that repository, expose it as `smoke:prod`, and require it after deployment. Until then, the portfolio workflow provides independent production evidence without claiming authenticated certification.
