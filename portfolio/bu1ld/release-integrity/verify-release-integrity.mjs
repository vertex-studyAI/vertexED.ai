#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const targetRoot = resolve(process.argv[2] || "target");
const expectedCommit = (process.argv[3] || "").trim().toLowerCase();

async function read(path) {
  return readFile(resolve(targetRoot, path), "utf8");
}

function requireText(text, needle, label) {
  if (!text.includes(needle)) throw new Error(`${label}: missing ${needle}`);
}

function requirePattern(text, pattern, label) {
  if (!pattern.test(text)) throw new Error(`${label}: missing pattern ${pattern}`);
}

function rejectText(text, needle, label) {
  if (text.includes(needle)) throw new Error(`${label}: forbidden ${needle}`);
}

const onboarding = await read("src/routes/onboarding.tsx");
rejectText(onboarding, "Skip for now — go to your dashboard", "onboarding");
rejectText(onboarding, "createFileRoute, Link, useNavigate", "onboarding");
requireText(
  onboarding,
  "Complete these four steps to unlock the member workspace. You can edit your profile later.",
  "onboarding",
);

const envExample = await read(".env.example");
requirePattern(envExample, /complete chain through phase(?:3[3-9]|[4-9]\d)/, ".env.example");
requireText(envExample, "SUPABASE_DB_URL=postgresql://", ".env.example");

const deploy = await read(".github/workflows/deploy-cloudflare.yml");
for (const required of [
  "BU1LD_BUILD_COMMIT: ${{ github.sha }}",
  "SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}",
  "RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}",
  "DIGEST_API_SECRET: ${{ secrets.DIGEST_API_SECRET }}",
  "VITE_EMAIL_ENDPOINT: ${{ secrets.VITE_EMAIL_ENDPOINT }}",
  "run: bun run release:prod",
  "run: node scripts/verify-deployed-build.mjs",
  "uses: actions/checkout@v5",
]) {
  requireText(deploy, required, "deploy workflow");
}
rejectText(deploy, "uses: actions/checkout@v4", "deploy workflow");
rejectText(deploy, "run: bun run build\n      - name: Deploy Worker", "deploy workflow");

const deployment = await read("DEPLOYMENT.md");
requirePattern(deployment, /phase(?:3[3-9]|[4-9]\d)\.sql/, "DEPLOYMENT.md migration chain");
for (const required of [
  "bun run supabase:rls",
  "BU1LD_RELEASE_STRICT=1 bun run release:check",
  "https://thebu1ld.com/build.json",
]) {
  requireText(deployment, required, "DEPLOYMENT.md");
}

const verifier = await read("scripts/verify-deployed-build.mjs");
for (const required of [
  "BU1LD_BUILD_COMMIT",
  "build.json?commit=",
  'identity?.service === "bu1ld"',
  "identity?.commit === expected",
]) {
  requireText(verifier, required, "production build verifier");
}

const buildIdentity = await read("src/lib/build-identity.ts");
requireText(buildIdentity, 'service: "bu1ld"', "build identity");
const root = await read("src/routes/__root.tsx");
for (const required of ["data-bu1ld-build", "bu1ld-build-identity", "bu1ld-build"]) {
  requireText(root, required, "root build identity");
}

if (expectedCommit) {
  if (!/^[0-9a-f]{40}$/.test(expectedCommit)) throw new Error("expected commit must be a full SHA");
}

console.log(
  JSON.stringify(
    {
      targetRoot,
      expectedCommit: expectedCommit || null,
      onboardingGate: true,
      strictDeployGate: true,
      checkoutRuntimeGate: true,
      immutableBuildIdentity: true,
      deploymentDocs: true,
    },
    null,
    2,
  ),
);
