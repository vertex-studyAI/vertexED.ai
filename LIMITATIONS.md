# VertexED limitations

The current checkout is WIP and explicitly noncanonical. No production deployment or unattended merge was made. Local tests, generated assets and browser fixtures are engineering evidence only.

- The practice session is saved on this device. Submitted attempt/mistake cloud sync needs a working authenticated database; current-session cross-device resume is not implemented by the new guard.
- A stale-tab check compares the last observed storage value and handles storage events. It is not an atomic distributed lock. Paused tabs expose a copyable answer recovery panel.
- Original-bank question coverage is limited to 25 questions. Practice status rules do not establish measured learning gains or transferable mastery.
- Imported study guides remain unapproved. Full curriculum coverage, content rights, subject review and appropriate privacy/safeguarding approval remain open.
- The local environment file has no provider API key or operator readiness token. No real AI canary or live end-to-end provider acceptance was possible in this pass.
- The local Colima Docker socket is absent. Clean migration replay, pgTAP, SQL lint and real two-account/two-device acceptance remain unverified.
- Canonical hosts fail TLS and fallback deployments return readiness 503. Their deployed revisions differ from this source candidate.
- Real mobile hardware, sustained two-hour study, monitoring delivery, backup restore, rollback and live export/deletion have not been certified.

The larger [complete-product checklist](docs/PUBLISHABLE_COMPLETION_CHECKLIST.md) retains mandatory work beyond this hardening pass. These limitations are not waivers or a declaration that the full product is finished.
