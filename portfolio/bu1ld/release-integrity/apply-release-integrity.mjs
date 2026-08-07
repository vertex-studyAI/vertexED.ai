#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const targetRoot = resolve(process.argv[2] || "target");

async function read(path) {
  return readFile(resolve(targetRoot, path), "utf8");
}

async function write(path, content) {
  await writeFile(resolve(targetRoot, path), content, "utf8");
}

function replaceOnce(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  if (first === -1) throw new Error(`${label}: expected source anchor was not found`);
  if (source.indexOf(needle, first + needle.length) !== -1) {
    throw new Error(`${label}: expected source anchor was not unique`);
  }
  return `${source.slice(0, first)}${replacement}${source.slice(first + needle.length)}`;
}

const identity = spawnSync(
  process.execPath,
  [resolve(here, "../build-identity/apply-build-identity.mjs"), targetRoot],
  { stdio: "inherit" },
);
if (identity.status !== 0) process.exit(identity.status ?? 1);

const onboardingPath = "src/routes/onboarding.tsx";
let onboarding = await read(onboardingPath);
onboarding = replaceOnce(
  onboarding,
  'import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";',
  'import { createFileRoute, useNavigate } from "@tanstack/react-router";',
  "onboarding router import",
);
onboarding = replaceOnce(
  onboarding,
  `      <p className="mt-4 text-center text-xs text-muted-foreground">\n        <Link to="/dashboard" className="hover:text-bone transition">\n          Skip for now — go to your dashboard →\n        </Link>\n      </p>`,
  `      <p className="mt-4 text-center text-xs text-muted-foreground">\n        Complete these four steps to unlock the member workspace. You can edit your profile later.\n      </p>`,
  "broken onboarding skip link",
);
await write(onboardingPath, onboarding);

const envPath = ".env.example";
let envExample = await read(envPath);
envExample = replaceOnce(
  envExample,
  "applies the complete chain through phase32",
  "applies the complete chain through phase33",
  "env migration phase",
);
envExample = replaceOnce(
  envExample,
  "# SUPABASE_DB_PASSWORD=your-database-password\n# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key",
  "# SUPABASE_DB_PASSWORD=your-database-password\n# SUPABASE_DB_URL=postgresql://postgres:password@db.<project-ref>.supabase.co:5432/postgres\n# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key",
  "env database connection options",
);
await write(envPath, envExample);

const verifyDeployPath = "scripts/verify-deployed-build.mjs";
await write(
  verifyDeployPath,
  `#!/usr/bin/env node\n\nconst expected = (process.env.BU1LD_BUILD_COMMIT ?? process.env.GITHUB_SHA ?? "").trim().toLowerCase();\nconst origin = (process.env.BU1LD_PUBLIC_ORIGIN ?? "https://thebu1ld.com").replace(/\\/$/, "");\n\nif (!/^[0-9a-f]{7,40}$/.test(expected)) {\n  console.error("Set BU1LD_BUILD_COMMIT or GITHUB_SHA to the immutable deployed commit.");\n  process.exit(1);\n}\n\nconst attempts = Number(process.env.BU1LD_VERIFY_ATTEMPTS ?? 8);\nconst delayMs = Number(process.env.BU1LD_VERIFY_DELAY_MS ?? 5000);\n\nfor (let attempt = 1; attempt <= attempts; attempt += 1) {\n  try {\n    const response = await fetch(\n      \\`${origin}/build.json?commit=${expected}&attempt=${attempt}\\`,\n      { cache: "no-store", headers: { "cache-control": "no-cache" } },\n    );\n    if (!response.ok) throw new Error(\\`HTTP ${response.status}\\`);\n    const identity = await response.json();\n    if (identity?.service === "bu1ld" && identity?.commit === expected) {\n      console.log(JSON.stringify({ origin, expected, identity, attempt }, null, 2));\n      process.exit(0);\n    }\n    console.error(\n      \\`Attempt ${attempt}/${attempts}: expected ${expected}, received ${JSON.stringify(identity)}\\`,\n    );\n  } catch (error) {\n    console.error(\\`Attempt ${attempt}/${attempts}: ${error instanceof Error ? error.message : error}\\`);\n  }\n  if (attempt < attempts) await new Promise((resolveDelay) => setTimeout(resolveDelay, delayMs));\n}\n\nconsole.error(\\`Production did not expose immutable Bu1LD build ${expected}.\\`);\nprocess.exit(1);\n`,
);

const deployWorkflow = [
  "name: Deploy Cloudflare",
  "",
  "on:",
  "  push:",
  "    branches: [main]",
  "  workflow_dispatch:",
  "",
  "permissions:",
  "  contents: read",
  "",
  "concurrency:",
  "  group: bu1ld-production",
  "  cancel-in-progress: false",
  "",
  "jobs:",
  "  verify:",
  "    runs-on: ubuntu-latest",
  "    env:",
  "      BU1LD_BUILD_COMMIT: ${{ github.sha }}",
  "      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}",
  "      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}",
  "    steps:",
  "      - uses: actions/checkout@v4",
  "      - uses: oven-sh/setup-bun@v2",
  "      - run: bun install --frozen-lockfile",
  "      - run: bun run release:check",
  "      - run: bun run audit:ci",
  "",
  "  deploy:",
  "    needs: verify",
  "    runs-on: ubuntu-latest",
  "    env:",
  "      BU1LD_BUILD_COMMIT: ${{ github.sha }}",
  "      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}",
  "      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}",
  "      SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}",
  "      SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}",
  "      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}",
  "      RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}",
  "      DIGEST_API_SECRET: ${{ secrets.DIGEST_API_SECRET }}",
  "      VITE_EMAIL_ENDPOINT: ${{ secrets.VITE_EMAIL_ENDPOINT }}",
  "    steps:",
  "      - uses: actions/checkout@v4",
  "      - uses: oven-sh/setup-bun@v2",
  "      - run: bun install --frozen-lockfile",
  "      - name: Run strict production release gate",
  "        run: bun run release:prod",
  "      - name: Deploy Worker",
  "        env:",
  "          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}",
  "          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}",
  "        run: npx wrangler deploy",
  "      - name: Verify immutable production build",
  "        run: node scripts/verify-deployed-build.mjs",
  "",
].join("\n");
await write(".github/workflows/deploy-cloudflare.yml", deployWorkflow);

const deploymentPath = "DEPLOYMENT.md";
let deployment = await read(deploymentPath);
deployment = replaceOnce(
  deployment,
  "Or push to `main` to run `.github/workflows/deploy-cloudflare.yml` (requires secrets below).",
  "Or push an approved commit to `main` to run `.github/workflows/deploy-cloudflare.yml`. The workflow fails closed unless the strict production gate passes and the deployed `/build.json` reports that exact Git commit.",
  "deployment workflow contract",
);
deployment = replaceOnce(
  deployment,
  "| `CLOUDFLARE_API_TOKEN`  | Workers deploy |\n| `CLOUDFLARE_ACCOUNT_ID` | Account scope  |",
  "| `CLOUDFLARE_API_TOKEN`       | Workers deploy |\n| `CLOUDFLARE_ACCOUNT_ID`      | Account scope |\n| `SUPABASE_DB_URL` or `SUPABASE_DB_PASSWORD` | Strict schema/RLS verification |\n| `SUPABASE_SERVICE_ROLE_KEY`  | Server-only privileged operations required by the release gate |\n| `RESEND_API_KEY`             | Transactional email |\n| `DIGEST_API_SECRET`          | Digest endpoint authentication |\n| `VITE_EMAIL_ENDPOINT`        | Client email endpoint |",
  "deployment secret table",
);
deployment = replaceOnce(
  deployment,
  "1. Apply `FINAL_SETUP.sql` then `phase24.sql`.",
  "1. Apply the repository migration chain through `phase33.sql` with `bun run supabase:apply`, then run `bun run supabase:verify` and `bun run supabase:rls`.",
  "supabase deployment checklist",
);
deployment = replaceOnce(
  deployment,
  "bun run supabase:verify   # needs live keys\nbun run release:check",
  "bun run supabase:verify   # needs live database access\nbun run supabase:rls      # verifies production authorization invariants\nbun run release:check     # non-secret source gate\nBU1LD_RELEASE_STRICT=1 bun run release:check  # production gate; requires server credentials",
  "deployment verification commands",
);
deployment = replaceOnce(
  deployment,
  "- Email features stay no-op until Resend + endpoint secrets are set.",
  "- Email features stay blocked until Resend + endpoint secrets are set.\n- A production deploy is incomplete until `https://thebu1ld.com/build.json` reports the deployed immutable commit.",
  "deployment known blockers",
);
await write(deploymentPath, deployment);

console.log(`Applied Bu1LD release integrity recovery to ${targetRoot}`);
