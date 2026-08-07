#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
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

function run(script) {
  const result = spawnSync(process.execPath, [script, targetRoot], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(resolve(here, "../release-integrity/apply-release-integrity.mjs"));
run(resolve(here, "../auth-confirmation/apply-auth-confirmation.mjs"));

const projectRoutePath = "src/routes/projects/$slug.tsx";
let projectRoute = await read(projectRoutePath);
projectRoute = replaceOnce(
  projectRoute,
  '  const [isCollaborator, setIsCollaborator] = useState(false);',
  '  const [collaborationStatus, setCollaborationStatus] = useState<"none" | "active" | "paused">("none");',
  "project membership state",
);
projectRoute = replaceOnce(
  projectRoute,
  `    void fetchProjectMembership(project.id, user.id).then((membership) => {\n      setIsCollaborator(membership?.status === "active" || membership?.status === "paused");\n    });`,
  `    void fetchProjectMembership(project.id, user.id).then((membership) => {\n      setCollaborationStatus(\n        membership?.status === "active"\n          ? "active"\n          : membership?.status === "paused"\n            ? "paused"\n            : "none",\n      );\n    });`,
  "project membership loading",
);
projectRoute = replaceOnce(
  projectRoute,
  '  const isLead = project.lead_id === user?.id || isAdministrator(profile);',
  `  const isLead = project.lead_id === user?.id || isAdministrator(profile);\n  const canReadWorkspace = collaborationStatus === "active" || collaborationStatus === "paused";\n  const canContribute = collaborationStatus === "active";`,
  "project access derivation",
);
projectRoute = replaceOnce(
  projectRoute,
  `        {application && user ? (\n          <ProjectMemberWorkspace\n            project={project}\n            application={application}\n            teamMembers={teamMembers}\n          />\n        ) : null}`,
  `        {application && user && (isLead || canReadWorkspace) ? (\n          <ProjectMemberWorkspace\n            project={project}\n            application={application}\n            teamMembers={teamMembers}\n          />\n        ) : null}`,
  "member workspace visibility",
);
projectRoute = replaceOnce(
  projectRoute,
  `        <ProjectUpdatesSection\n          projectId={project.id}\n          projectSlug={project.slug}\n          projectTitle={project.title}\n          canPost={isLead || isCollaborator}\n          authorId={user?.id}\n          authorName={profile?.full_name ?? undefined}\n        />\n\n        <ProjectEvidenceSection\n          projectId={project.id}\n          userId={user?.id}\n          canManage={isLead}\n          isCollaborator={isCollaborator}\n        />\n\n        {isLead || isCollaborator ? (\n          <ProjectWorkspaceExtras\n            projectId={project.id}\n            userId={user?.id}\n            canEdit={isLead || isCollaborator}\n            canManage={isLead}\n          />\n        ) : null}`,
  `        <ProjectUpdatesSection\n          projectId={project.id}\n          projectSlug={project.slug}\n          projectTitle={project.title}\n          canPost={isLead || canContribute}\n          authorId={user?.id}\n          authorName={profile?.full_name ?? undefined}\n        />\n\n        <ProjectEvidenceSection\n          projectId={project.id}\n          userId={user?.id}\n          canManage={isLead}\n          isCollaborator={canReadWorkspace}\n          canContribute={isLead || canContribute}\n        />\n\n        {isLead || canReadWorkspace ? (\n          <ProjectWorkspaceExtras\n            projectId={project.id}\n            userId={user?.id}\n            canEdit={isLead || canContribute}\n            canManage={isLead}\n          />\n        ) : null}`,
  "project collaboration controls",
);
await write(projectRoutePath, projectRoute);

const evidencePath = "src/components/member/ProjectEvidenceSection.tsx";
let evidence = await read(evidencePath);
evidence = replaceOnce(
  evidence,
  `  canManage,\n  isCollaborator,`,
  `  canManage,\n  isCollaborator,\n  canContribute,`,
  "evidence prop destructuring",
);
evidence = replaceOnce(
  evidence,
  `  canManage: boolean;\n  isCollaborator: boolean;`,
  `  canManage: boolean;\n  isCollaborator: boolean;\n  canContribute: boolean;`,
  "evidence prop types",
);
evidence = replaceOnce(
  evidence,
  `          <Button type="button" size="sm" onClick={() => setShowContributionForm((v) => !v)}>\n            Record contribution\n          </Button>`,
  `          {canContribute ? (\n            <Button type="button" size="sm" onClick={() => setShowContributionForm((v) => !v)}>\n              Record contribution\n            </Button>\n          ) : null}`,
  "record contribution control",
);
evidence = evidence.replace(
  "      {showContributionForm ? (",
  "      {showContributionForm && canContribute ? (",
);
evidence = evidence.replaceAll(
  "contribution.contributor_id === userId &&",
  "canContribute && contribution.contributor_id === userId &&",
);
await write(evidencePath, evidence);

const phase34 = `-- Phase 34 — paused project memberships are read-only.\n-- Apply after phase33.sql. Paused collaborators retain visibility for continuity,\n-- but all contributor mutation paths require an active membership.\n\n-- Contributions: active members may create/revise/resubmit; paused members may only read.\ndrop policy if exists "Collaborators submit contributions" on public.project_contributions;\ncreate policy "Active collaborators submit contributions" on public.project_contributions\n  for insert\n  to authenticated\n  with check (\n    contributor_id = auth.uid()\n    and exists (\n      select 1 from public.project_memberships pm\n      where pm.project_id = project_id\n        and pm.user_id = auth.uid()\n        and pm.status = 'active'\n    )\n  );\n\ndrop policy if exists "Contributors revise own submissions" on public.project_contributions;\ncreate policy "Active contributors revise own submissions" on public.project_contributions\n  for update\n  to authenticated\n  using (\n    contributor_id = auth.uid()\n    and exists (\n      select 1 from public.project_memberships pm\n      where pm.project_id = project_contributions.project_id\n        and pm.user_id = auth.uid()\n        and pm.status = 'active'\n    )\n  )\n  with check (\n    contributor_id = auth.uid()\n    and exists (\n      select 1 from public.project_memberships pm\n      where pm.project_id = project_contributions.project_id\n        and pm.user_id = auth.uid()\n        and pm.status = 'active'\n    )\n  );\n\ncreate or replace function public.resubmit_project_contribution(p_contribution_id uuid)\nreturns public.project_contributions\nlanguage plpgsql\nsecurity definer\nset search_path = public\nas $$\ndeclare contribution_row public.project_contributions;\nbegin\n  if auth.uid() is null then raise exception 'Not authenticated'; end if;\n  perform set_config('app.contribution_resubmit', 'true', true);\n  update public.project_contributions c\n  set verification_status = 'submitted',\n      verification_note = null,\n      verified_by = null,\n      verified_at = null,\n      updated_at = now()\n  where c.id = p_contribution_id\n    and c.contributor_id = auth.uid()\n    and c.verification_status = 'needs_changes'\n    and exists (\n      select 1 from public.project_memberships pm\n      where pm.project_id = c.project_id\n        and pm.user_id = auth.uid()\n        and pm.status = 'active'\n    )\n  returning c.* into contribution_row;\n  if not found then\n    raise exception 'Only an active contributor may resubmit their contribution awaiting changes';\n  end if;\n  return contribution_row;\nend;\n$$;\n\nrevoke all on function public.resubmit_project_contribution(uuid) from public;\ngrant execute on function public.resubmit_project_contribution(uuid) to authenticated;\n\n-- Project updates: paused collaborators keep read access but cannot post.\ndrop policy if exists "Collaborators insert project updates" on public.project_updates;\ncreate policy "Active collaborators insert project updates" on public.project_updates\n  for insert\n  to authenticated\n  with check (\n    author_id = auth.uid()\n    and (\n      public.is_platform_admin()\n      or exists (select 1 from public.projects p where p.id = project_id and p.lead_id = auth.uid())\n      or exists (\n        select 1 from public.project_memberships pm\n        where pm.project_id = project_id\n          and pm.user_id = auth.uid()\n          and pm.status = 'active'\n      )\n    )\n  );\n\n-- Deliverables: authors lose mutation rights while paused; leads/admins retain review authority.\ndrop policy if exists "Leads and authors update deliverables" on public.project_deliverables;\ncreate policy "Leads and active authors update deliverables" on public.project_deliverables\n  for update\n  to authenticated\n  using (\n    public.is_platform_admin()\n    or exists (select 1 from public.projects p where p.id = project_id and p.lead_id = auth.uid())\n    or (\n      submitted_by = auth.uid()\n      and exists (\n        select 1 from public.project_memberships pm\n        where pm.project_id = project_deliverables.project_id\n          and pm.user_id = auth.uid()\n          and pm.status = 'active'\n      )\n    )\n  )\n  with check (\n    public.is_platform_admin()\n    or exists (select 1 from public.projects p where p.id = project_id and p.lead_id = auth.uid())\n    or (\n      submitted_by = auth.uid()\n      and exists (\n        select 1 from public.project_memberships pm\n        where pm.project_id = project_deliverables.project_id\n          and pm.user_id = auth.uid()\n          and pm.status = 'active'\n      )\n    )\n  );\n\n-- Datasets: authors lose mutation rights while paused; leads/admins retain curation authority.\ndrop policy if exists "Leads update project datasets" on public.project_datasets;\ncreate policy "Leads and active authors update project datasets" on public.project_datasets\n  for update\n  to authenticated\n  using (\n    public.is_platform_admin()\n    or exists (select 1 from public.projects p where p.id = project_id and p.lead_id = auth.uid())\n    or (\n      created_by = auth.uid()\n      and exists (\n        select 1 from public.project_memberships pm\n        where pm.project_id = project_datasets.project_id\n          and pm.user_id = auth.uid()\n          and pm.status = 'active'\n      )\n    )\n  )\n  with check (\n    public.is_platform_admin()\n    or exists (select 1 from public.projects p where p.id = project_id and p.lead_id = auth.uid())\n    or (\n      created_by = auth.uid()\n      and exists (\n        select 1 from public.project_memberships pm\n        where pm.project_id = project_datasets.project_id\n          and pm.user_id = auth.uid()\n          and pm.status = 'active'\n      )\n    )\n  );\n\ninsert into public.schema_migrations (phase) values ('phase34') on conflict (phase) do nothing;\n`;
await write("supabase/phase34.sql", phase34);

const applySchemaPath = "scripts/apply-schema.mjs";
let applySchema = await read(applySchemaPath);
applySchema = replaceOnce(
  applySchema,
  '  "supabase/phase33.sql",\n];',
  '  "supabase/phase33.sql",\n  "supabase/phase34.sql",\n];',
  "schema migration list",
);
await write(applySchemaPath, applySchema);

const releasePath = "scripts/release-readiness.mjs";
let release = await read(releasePath);
release = replaceOnce(
  release,
  '  "phase33.sql",\n]) {',
  '  "phase33.sql",\n  "phase34.sql",\n]) {',
  "release migration list",
);
release = replaceOnce(
  release,
  `const phase33 = resolve(root, "supabase/phase33.sql");`,
  `const phase34 = resolve(root, "supabase/phase34.sql");\nif (existsSync(phase34)) {\n  const sql = readFileSync(phase34, "utf8");\n  for (const invariant of [\n    "Active collaborators submit contributions",\n    "Active contributors revise own submissions",\n    "Active collaborators insert project updates",\n    "Leads and active authors update deliverables",\n    "Leads and active authors update project datasets",\n    "pm.status = 'active'",\n    "values ('phase34')",\n  ]) {\n    if (!sql.includes(invariant)) {\n      failures.push(\`phase34.sql is missing required invariant: \${invariant}.\`);\n    }\n  }\n}\n\nconst phase33 = resolve(root, "supabase/phase33.sql");`,
  "phase34 release invariants",
);
await write(releasePath, release);

for (const path of [".env.example", "DEPLOYMENT.md"]) {
  let text = await read(path);
  text = text.replaceAll("phase33", "phase34");
  await write(path, text);
}

await write(
  "src/lib/project-membership-write-gate.test.ts",
  `import { describe, expect, test } from "bun:test";\nimport { readFileSync } from "node:fs";\n\nconst route = readFileSync(new URL("../routes/projects/$slug.tsx", import.meta.url), "utf8");\nconst evidence = readFileSync(\n  new URL("../components/member/ProjectEvidenceSection.tsx", import.meta.url),\n  "utf8",\n);\nconst migration = readFileSync(new URL("../../supabase/phase34.sql", import.meta.url), "utf8");\n\ndescribe("paused project membership write gate", () => {\n  test("keeps paused collaborators read-only in the project UI", () => {\n    expect(route).toContain('const canReadWorkspace = collaborationStatus === "active" || collaborationStatus === "paused"');\n    expect(route).toContain('const canContribute = collaborationStatus === "active"');\n    expect(route).toContain("canPost={isLead || canContribute}");\n    expect(route).toContain("canEdit={isLead || canContribute}");\n    expect(evidence).toContain("canContribute: boolean");\n    expect(evidence).toContain("showContributionForm && canContribute");\n  });\n\n  test("requires active membership at the database write boundary", () => {\n    for (const invariant of [\n      "Active collaborators submit contributions",\n      "Active contributors revise own submissions",\n      "Active collaborators insert project updates",\n      "Leads and active authors update deliverables",\n      "Leads and active authors update project datasets",\n    ]) {\n      expect(migration).toContain(invariant);\n    }\n    expect(migration).toContain("pm.status = 'active'");\n    expect(migration).not.toContain("pm.status in ('active', 'paused')");\n  });\n});\n`,
);

console.log(`Applied consolidated Bu1LD launch foundation to ${targetRoot}`);
