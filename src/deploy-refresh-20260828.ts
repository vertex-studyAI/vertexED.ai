// Deployment refresh sentinel: runtime-relevant, side-effect-free, and intentionally unimported.
// Its only purpose is to force a fresh production build of the current audited source tree.
export const DEPLOY_REFRESH_20260828 = 'vertex-runtime-refresh-20260828' as const;
