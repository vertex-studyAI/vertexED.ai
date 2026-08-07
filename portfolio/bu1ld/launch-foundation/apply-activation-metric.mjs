#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const targetRoot = resolve(process.argv[2] || "target");

async function read(path) {
  return readFile(resolve(targetRoot, path), "utf8");
}

async function write(path, content) {
  const absolute = resolve(targetRoot, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, content, "utf8");
}

function replaceOnce(source, needle, replacement, label) {
  const index = source.indexOf(needle);
  if (index === -1) throw new Error(`${label}: expected source anchor was not found`);
  if (source.indexOf(needle, index + needle.length) !== -1) {
    throw new Error(`${label}: expected source anchor was not unique`);
  }
  return `${source.slice(0, index)}${replacement}${source.slice(index + needle.length)}`;
}

const migrationPath = "supabase/phase34.sql";
let migration = await read(migrationPath);
migration = replaceOnce(
  migration,
  "insert into public.schema_migrations (phase) values ('phase34') on conflict (phase) do nothing;",
  `-- Activation is the first verified contribution by a member. Keep this metric server-side so\n-- leadership can measure unique activated members without exporting contributor identities.\ncreate or replace function public.get_admin_activation_stats()\nreturns table (\n  activated_members bigint,\n  total_members bigint,\n  activation_rate_percent numeric\n)\nlanguage plpgsql\nstable\nsecurity definer\nset search_path = public\nas $$\nbegin\n  if auth.uid() is null or not public.is_platform_admin() then\n    raise exception 'Administrator access required';\n  end if;\n\n  return query\n  with counts as (\n    select\n      (\n        select count(distinct c.contributor_id)::bigint\n        from public.project_contributions c\n        where c.verification_status = 'verified' and c.verified_at is not null\n      ) as activated,\n      (select count(*)::bigint from public.profiles) as members\n  )\n  select\n    counts.activated,\n    counts.members,\n    case\n      when counts.members = 0 then 0::numeric\n      else round((counts.activated::numeric / counts.members::numeric) * 100, 1)\n    end\n  from counts;\nend;\n$$;\n\nrevoke all on function public.get_admin_activation_stats() from public;\ngrant execute on function public.get_admin_activation_stats() to authenticated;\n\ninsert into public.schema_migrations (phase) values ('phase34') on conflict (phase) do nothing;`,
  "phase34 activation function",
);
await write(migrationPath, migration);

const typesPath = "src/lib/types.ts";
let types = await read(typesPath);
types = replaceOnce(
  types,
  `  contributions: number;\n  verifiedContributions: number;\n  evidenceClaims: number;`,
  `  contributions: number;\n  verifiedContributions: number;\n  activatedMembers: number;\n  activationRatePercent: number;\n  evidenceClaims: number;`,
  "AdminStats activation fields",
);
await write(typesPath, types);

const adminPath = "src/lib/admin.ts";
let admin = await read(adminPath);
admin = replaceOnce(
  admin,
  `  contributions: 0,\n  verifiedContributions: 0,\n  evidenceClaims: 0,`,
  `  contributions: 0,\n  verifiedContributions: 0,\n  activatedMembers: 0,\n  activationRatePercent: 0,\n  evidenceClaims: 0,`,
  "empty admin activation stats",
);
admin = replaceOnce(
  admin,
  `    contributions,\n    verifiedContributions,\n    evidenceClaims,`,
  `    contributions,\n    verifiedContributions,\n    activationStats,\n    evidenceClaims,`,
  "admin activation result destructuring",
);
admin = replaceOnce(
  admin,
  `    supabase\n      .from("project_contributions")\n      .select("id", { count: "exact", head: true })\n      .eq("verification_status", "verified"),\n    supabase\n      .from("institutional_claims")`,
  `    supabase\n      .from("project_contributions")\n      .select("id", { count: "exact", head: true })\n      .eq("verification_status", "verified"),\n    supabase.rpc("get_admin_activation_stats").maybeSingle(),\n    supabase\n      .from("institutional_claims")`,
  "admin activation RPC",
);
admin = replaceOnce(
  admin,
  `    contributions: numberOrZero(contributions.count),\n    verifiedContributions: numberOrZero(verifiedContributions.count),\n    evidenceClaims: numberOrZero(evidenceClaims.count),`,
  `    contributions: numberOrZero(contributions.count),\n    verifiedContributions: numberOrZero(verifiedContributions.count),\n    activatedMembers: numberOrZero(activationStats.data?.activated_members),\n    activationRatePercent: numberOrZero(activationStats.data?.activation_rate_percent),\n    evidenceClaims: numberOrZero(evidenceClaims.count),`,
  "admin activation return",
);
await write(adminPath, admin);

const overviewPath = "src/components/admin/AdminOverviewTab.tsx";
let overview = await read(overviewPath);
overview = replaceOnce(
  overview,
  `        { label: "Verified work", value: stats.verifiedContributions },\n        { label: "Project publication queue", value: stats.pendingProjectReviews },`,
  `        { label: "Activated members", value: stats.activatedMembers },\n        { label: "Activation rate", value: \`${"${stats.activationRatePercent}"}%\` },\n        { label: "Verified work", value: stats.verifiedContributions },\n        { label: "Project publication queue", value: stats.pendingProjectReviews },`,
  "admin activation overview",
);
await write(overviewPath, overview);

const releasePath = "scripts/release-readiness.mjs";
let release = await read(releasePath);
release = replaceOnce(
  release,
  `    "Leads and active authors update project datasets",\n    "pm.status = 'active'",`,
  `    "Leads and active authors update project datasets",\n    "get_admin_activation_stats",\n    "count(distinct c.contributor_id)",\n    "pm.status = 'active'",`,
  "phase34 activation release invariants",
);
await write(releasePath, release);

await write(
  "src/lib/activation-metric-contract.test.ts",
  `import { describe, expect, test } from "bun:test";\nimport { readFileSync } from "node:fs";\n\nconst migration = readFileSync(new URL("../../supabase/phase34.sql", import.meta.url), "utf8");\nconst admin = readFileSync(new URL("./admin.ts", import.meta.url), "utf8");\nconst overview = readFileSync(new URL("../components/admin/AdminOverviewTab.tsx", import.meta.url), "utf8");\n\ndescribe("member activation measurement", () => {\n  test("defines activation as unique members with verified contributions", () => {\n    expect(migration).toContain("get_admin_activation_stats");\n    expect(migration).toContain("count(distinct c.contributor_id)");\n    expect(migration).toContain("c.verification_status = 'verified'");\n    expect(migration).toContain("c.verified_at is not null");\n  });\n\n  test("surfaces activation rather than only artifact volume", () => {\n    expect(admin).toContain('rpc("get_admin_activation_stats")');\n    expect(admin).toContain("activatedMembers");\n    expect(admin).toContain("activationRatePercent");\n    expect(overview).toContain("Activated members");\n    expect(overview).toContain("Activation rate");\n  });\n});\n`,
);

console.log(`Applied Bu1LD activation metric recovery to ${targetRoot}`);
