# Production backend audit — 2026-08-31

This snapshot records a read-only audit of the connected VertexED Supabase project. It is evidence for backend/security readiness only; it is **not** a full product launch certification.

## Project state

- Supabase project: `xwlrzgfuhfbckgvcmyoq`
- Status observed: `ACTIVE_HEALTHY`
- Region: `ap-south-1`
- Postgres: `17.4.1.074`

## Verified database security facts

- 26 `public` base tables were enumerated and every one had row-level security enabled.
- No `public` views or materialized views were present in the audit result.
- User-writable ownership-style UPDATE policies observed on `profiles` and `user_study_artifacts` included both `USING` and `WITH CHECK` predicates.
- `public.auth_email_exists` is `SECURITY DEFINER`, has an explicit `search_path=public, auth`, and was not executable by `anon` or `authenticated`.
- `public.handle_new_user` is `SECURITY DEFINER`, has an explicit `search_path=public`, and was not executable by `anon` or `authenticated`.

## Security Advisor findings still open

1. **Leaked Password Protection Disabled** — platform-level Auth hardening remains to be enabled.
2. **Current Postgres version has security patches available** — a controlled database upgrade remains to be scheduled and verified.

## Production Auth evidence

Recent Auth logs from the connected project include successful requests originating from `https://www.vertexed.app`, including:

- Google OAuth authorization/callback events;
- a successful Google login event;
- repeated authenticated `GET /user` responses with HTTP 200;
- refresh-token activity followed by successful user-session requests.

This supports the narrower claim that the live domain reaches the intended Auth backend and that at least one production Google OAuth/session path has worked. It does **not** establish that every auth failure mode or the entire product journey is green.

## Remaining launch evidence

Do not call production fully certified until the repository launch gate has direct evidence for:

- exact immutable served revision;
- onboarding and dashboard journey;
- one core learning feature path;
- logout and password recovery;
- two-account read/write isolation;
- transient network/refresh failure preserving the session;
- terminal/revoked refresh failure signing out exactly once;
- post-upgrade re-smoke if the database is upgraded.

## Repeatability

Run `scripts/supabase-security-audit.sql` against the intended project and attach the fresh output to the production launch/security issues. Also rerun Supabase Security Advisor; the SQL script cannot inspect platform Auth settings or platform upgrade warnings.
