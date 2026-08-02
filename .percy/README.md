# Percy Durable State

This directory stores evidence-backed state for the Percy 16384X execution engine.

Rules:

- Count only real, verified iterations.
- Never store credentials, private keys, passwords, invite codes, or service-role secrets.
- Revalidate external state before acting on it.
- Use isolated branches for changes.
- Preserve exact blockers and continuation points.
- `portfolio/portfolio.yaml` remains the detailed human-maintained control source during bootstrap; `.percy/portfolio.json` is the execution snapshot.
