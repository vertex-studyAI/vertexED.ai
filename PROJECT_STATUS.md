# VertexED — verified engineering status

Snapshot date: **2026-09-23**.

This file is an engineering status snapshot, not deployment authorization. For the scheduled production incident use issue #652; for the canonical-domain release boundary use issue #44.

## Canonical source and public serving state

| Surface | Status | Evidence |
|---|---|---|
| `main` | **SOURCE CURRENT** | `2ca208c8ffd10c83005f3afe65057bc847277d5f` (merged #1057) |
| `https://www.vertexed.app` | **FAILED BEFORE TLS** | Production Health `35791069935`; Transport Diagnostics `35791141464` |
| DNS | **PASS** | `2.59.170.20`, `104.219.250.37`; no CNAME chain in latest retained transport artifact |
| TCP/443 | **PASS** | both observed IPv4 targets accept TCP |
| TLS / HTTPS | **FAIL** | `ECONNRESET` before secure TLS establishment on both observed IPv4 targets |

Latest retained transport artifact: `10721827923`, digest `sha256:9478bd77d789c864281beeab889f779cdc6c4cd6e17f7e10a348330b2b5acf0a`, bound to exact `main@2ca208c8ffd10c83005f3afe65057bc847277d5f` and captured at `2026-09-22T22:13:15.824Z`.

The production failure is a serving/routing boundary. It is not evidence that current application source should be rolled back, that smoke/readiness checks should be weakened, or that a DNS/certificate/backend target should be guessed.

## Reviewable engineering PRs

| PR | Role | Exact head | Engineering evidence | Integration boundary |
|---|---|---|---|---|
| #1066 | Fail-honest exam-practice subject routing | `e6c02f02df292a081f9649a99ee0df7db865dfe6` | CI `35615592970`: SUCCESS | Independent review first; #1061 must wait for integration |
| #1069 | Held/unreviewed study-guide publication boundary | `7a8ac7f368e894c2b235a4792093e9ef6ec5517f` | CI `35625175172`: SUCCESS | Independent content/release review |
| #1072 | Direct onboarding routing for incomplete authenticated learners | `0d24b5345750f2ba5831d03cc6bc756e0ed73d4c` | CI `35635484070`: SUCCESS | Independent product review |

Repository-green is not merge or deployment authorization. Do not merge without the required independent review.

## Intentionally Draft / blocked surfaces

| PR / issue | Boundary |
|---|---|
| #1067 | Member-authorization reconstruction; keep Draft for independent security review plus historical-account/access reconciliation |
| #1070 | Complete DB-readiness contract; keep Draft behind #913/#916 provenance/reconciliation review |
| #1071 | Production-repair provenance; keep Draft, no migration replay or production mutation |
| #1073 | Professor-study reproducibility infrastructure; keep Draft for scientific-method review, no study execution |
| #1061 | Historical optional-baseline branch; do not restack until #1066 integrates, then reconstruct once on resulting main |
| #44 | Canonical-domain release certification; provider ownership/DNS/certificate/backend/deployment receipt still unresolved |
| #13 | Authenticated production certification; wait for serving, auth/security and DB-readiness prerequisites |

## Release blockers that require external / authorized evidence

1. Establish the single provider project that intentionally owns `www.vertexed.app`.
2. Obtain the provider-reported domain/DNS/certificate/backend configuration for that project; do not infer it from examples or another project.
3. Obtain one real deployed receipt for one exact intended Git SHA.
4. Re-run unchanged production health, transport, browser, smoke and readiness contracts against that one served revision.
5. Complete #1067 security review and cross-product authorization reconciliation before broad account creation.
6. Complete #913/#916 production migration/provenance review before treating DB-readiness source checks as production-history proof.
7. Remediate authorized platform-security warnings through provider controls, not permissive application workarounds.
8. Only after the above, run disposable-account authenticated certification with non-secret retained evidence.

## Guardrails

- No force-push or destructive rebase.
- No sentinel/no-op deployment commits.
- No weakening TLS, smoke, browser, readiness, authorization or database checks to manufacture green status.
- No guessed DNS/certificate/backend mutation.
- No secret or learner-data exposure.
- No unattended production database mutation or migration-history surgery.
- No scientific experiment, held-out evaluation, participant analysis or outcome reinterpretation from the engineering lane.
