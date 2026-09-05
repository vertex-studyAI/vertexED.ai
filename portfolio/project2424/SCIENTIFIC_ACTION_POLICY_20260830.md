# Scientific action policy

When a lane already has a frozen successor protocol, the next action is not automatically to execute it. Before outcome access, verify exact manifest identity, authorization state, environment/data/model revisions, and CI/preflight gates. If any material field differs, stop and create a separately versioned successor freeze rather than silently drifting the protocol.
