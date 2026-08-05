# Bu1LD Public Production Monitoring

## Purpose

The Bu1LD repository has a substantial local release gate, but its existing `smoke` command verifies route declarations in generated source rather than the deployed public surface. This monitor adds external, read-only availability evidence for live production at `https://thebu1ld.com`.

## Public route contract

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

The routes currently return distinct response sizes, which provides evidence that the monitor is not merely accepting one identical fallback document for every path. This remains an HTTP-level contract: it does not execute client JavaScript or assert that every visible interaction is usable.

## Safety and certification boundary

The monitor performs GET requests only. It does not:

- execute a browser or certify client-side hydration;
- run accessibility or responsive-layout checks;
- create an account;
- authenticate a member;
- submit an application;
- call privileged APIs;
- read Supabase data directly;
- write to production;
- use repository, Cloudflare, Supabase, or email secrets.

Authenticated member, project-lead, reviewer, and administrator journeys remain part of the strict credential-dependent production release gate. A green run proves public route availability and meaningful server-delivered HTML; it does not prove the complete user journey.

## Schedule and evidence

The `Bu1LD Production Health` workflow runs every six hours, on manual dispatch, and when this contract changes on a pull request or `main`. Each run writes a concise GitHub summary and retains the complete command log for 14 days.

## Target-repository handoff

The durable script is `portfolio/scripts/bu1ld-production-smoke.mjs`. Once the GitHub integration can create branches in `ryangomez010/bu1ld-landing`, copy the script into that repository, expose it as `smoke:prod`, and require it after deployment. Until then, the portfolio workflow provides independent public-route evidence without claiming browser or authenticated certification.