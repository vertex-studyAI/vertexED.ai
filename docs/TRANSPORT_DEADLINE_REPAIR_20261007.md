# HTTPS diagnostic completion — 7 October 2026

The production transport diagnostic could lose its structured report after a
truncated HTTPS response, or wait beyond its configured timeout while a peer
continued sending response bytes. Both behaviors were reproduced against
`main@18b22e51fe5e2f041d7e45335da95546d7a9ae94` using a local TLS server.

## Change

Each HTTPS attempt now has an absolute deadline covering request setup and
response consumption. The existing socket inactivity timeout remains. One
terminal path clears the deadline, destroys the request and response, and
returns a failed transport result for a timeout, abort, premature close or
stream error. A completed response preserves its status and diagnostic headers.

The configured timeout must be an integer from 1 through 2147483647 milliseconds,
the supported timer range. Invalid values fail before any network probe.
The default remains 10000 milliseconds.

TLS verification, SNI and Host binding remain enabled. A complete HTTP 503 is
still transport-reachable; this diagnostic does not substitute for the health
and immutable-revision checks.

This change bounds each HTTPS attempt. It does not add a whole-workflow deadline
or change the separate DNS, TCP or TLS diagnostic implementations.

## Evidence

Node 22.22.0, real loopback TCP/TLS/HTTPS, one constructed resolved IPv4 address.
Only DNS evidence is stubbed, so the fixture does not contact public DNS or a
production endpoint. The deliberately public test key/certificate are trusted
only by the fixture child process. An untrusted-certificate control confirms
that authenticated TLS still rejects the connection before HTTP.

- Same 13 runtime cases on the exact original source: 7 failures, 6 passing controls.
- Repaired source: 13 runtime cases plus 6 existing diagnostic contracts; 19/19 pass.
- Failures reproduced: an endless body, a truncated response that produced no
  complete JSON report, and 5 invalid timeout configurations.
- Passing controls include completed HTTP 200/503, an idle partial body, missing
  headers, a reset before headers, and rejection of an untrusted certificate.
- Changed script/test lint and `git diff --check` passed.

Run the current checks:

```sh
node --test tests/production-transport-runtime.test.mjs tests/production-transport-diagnostics.test.mjs
```

For a counterfactual, set `TRANSPORT_TEST_SCRIPT` to an unchanged copy of the
original diagnostic. The test runner has a separate 10 second outer guard so a
broken diagnostic cannot hang the test indefinitely; each valid diagnostic
attempt is configured for 1000 milliseconds in the runtime fixture.

## Production state

The last inspected hosted production monitor still fails before application
HTTP. The paired transport run reports the existing parking-address route and
TLS resets or timeouts. This repair does not establish production recovery or
change domain ownership, DNS records, deployed source or database state.

- [Failed monitor 37595646229](https://github.com/vertex-studyAI/vertexED.ai/actions/runs/37595646229)
- [Retained transport run 37595728636](https://github.com/vertex-studyAI/vertexED.ai/actions/runs/37595728636)
- Existing domain-recovery instructions: `CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md`.
