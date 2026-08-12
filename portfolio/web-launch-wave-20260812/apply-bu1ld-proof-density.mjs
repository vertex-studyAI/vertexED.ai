#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const rootArg = process.argv[2];
if (!rootArg) {
  console.error("Usage: node apply-bu1ld-proof-density.mjs <bu1ld-landing checkout>");
  process.exit(2);
}

const root = path.resolve(rootArg);
const EXPECTED_HEAD = "daa80c1124b2a6d7d09b7669e04d29e50cffcbbe";
const actualHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
if (actualHead !== EXPECTED_HEAD) {
  throw new Error(`Bu1LD checkout drifted: expected ${EXPECTED_HEAD}, got ${actualHead}. Re-audit before applying.`);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function write(rel, content) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content.endsWith("\n") ? content : `${content}\n`, "utf8");
  console.log(`wrote ${dest}`);
}

function replaceExact(rel, before, after) {
  const source = read(rel);
  if (!source.includes(before)) throw new Error(`Expected source text missing in ${rel}`);
  write(rel, source.replace(before, after));
}

replaceExact(
  "src/data/landing.ts",
  '["Six labs", "published research divisions"]',
  '["Six labs", "research divisions in the platform"]',
);

const evidenceSection = `import { ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { SectionLabel } from "@/components/landing/Section";

const EVIDENCE_INDEX = "https://github.com/ryangomez010/bu1ld-landing/blob/main/research/VERIFIED_RESULTS_INDEX.yaml";

const highlights = [
  {
    status: "E4 · product evidence",
    title: "Bu1LD local release gate",
    body: "The retained evidence index records a local gate covering typecheck, 151 Bun tests, lint, and a production build. Live Supabase credentials and role smoke tests remain separate release gates.",
    boundary: "Allowed: local release evidence. Not allowed: calling this a verified live production release.",
  },
  {
    status: "E4 · research artifact",
    title: "Project Genesis ablation smoke",
    body: "A retained portfolio-ablation smoke manifest exists for the continual/modular learning research line.",
    boundary: "Allowed: local ablation-smoke artifact exists. Not allowed: public benchmark superiority or research completion.",
  },
  {
    status: "E4 · synthetic evidence",
    title: "GenesisE benchmark artifacts",
    body: "The registry records synthetic portfolio and benchmark artifacts plus a locally passing unittest suite for the economic simulation package.",
    boundary: "Allowed: synthetic/internal benchmark evidence. Not allowed: real-market validation.",
  },
] as const;

export function EvidenceHighlightsSection() {
  return (
    <section className="border-t border-border/60 bg-background/55 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionLabel id="evidence-highlights">recent evidence</SectionLabel>
        <div className="mt-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-3xl font-display text-4xl leading-none tracking-tight text-bone md:text-6xl">
              Show the artifact. Show the boundary.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              These examples come from the repository evidence registry. Each card states what the current artifact supports and what it does not support.
            </p>
          </div>
          <Link to="/evidence" className="shrink-0 font-mono text-[10px] uppercase tracking-[0.24em] text-accent-blue transition hover:text-bone">
            Open public evidence register →
          </Link>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="panel flex min-h-72 flex-col rounded-sm p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent-green">{item.status}</p>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-bone">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              <div className="mt-auto pt-6">
                <p className="border-t border-border/60 pt-4 text-xs leading-relaxed text-bone/70">{item.boundary}</p>
                <a href={EVIDENCE_INDEX} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent-blue hover:text-bone">
                  Inspect retained index <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
`;
write("src/components/landing/EvidenceHighlightsSection.tsx", evidenceSection);

let indexSource = read("src/routes/index.tsx");
const importAnchor = 'import { FeaturedProjectsSection } from "@/components/landing/FeaturedProjectsSection";';
if (!indexSource.includes(importAnchor)) throw new Error("Homepage import anchor missing");
indexSource = indexSource.replace(
  importAnchor,
  `${importAnchor}\nimport { EvidenceHighlightsSection } from "@/components/landing/EvidenceHighlightsSection";`,
);
const renderAnchor = "        <FeaturedProjectsSection />";
if (!indexSource.includes(renderAnchor)) throw new Error("Homepage render anchor missing");
indexSource = indexSource.replace(renderAnchor, `${renderAnchor}\n        <EvidenceHighlightsSection />`);
write("src/routes/index.tsx", indexSource);

const claimsLedger = `# The Bu1LD public claims ledger\n\nAudited target: ${EXPECTED_HEAD}\n\n| Claim | Status | Evidence | Safe public wording |\n|---|---|---|---|\n| Six labs | PARTIALLY VERIFIED | Six research entries/divisions are present in source; blanket published status is not established | Six labs — research divisions in the platform |\n| Local release gate passed | VERIFIED WITH BOUNDARY | research/VERIFIED_RESULTS_INDEX.yaml records typecheck, 151 Bun tests, lint and production build | Local release gate passed; live Supabase/role verification remains separate |\n| Project Genesis ablation artifact exists | VERIFIED WITH BOUNDARY | Retained E4 portfolio-ablation smoke manifest | Local ablation-smoke evidence exists; no benchmark-superiority claim |\n| GenesisE synthetic benchmark artifacts exist | VERIFIED WITH BOUNDARY | Retained E4 synthetic portfolio/benchmark artifacts | Synthetic economic-simulation evidence; no real-market validation |\n| AI Builder Cohort / Research Fellowship / Startup Incubation exist as public program definitions | REPOSITORY INFERRED | src/data/landing.ts program records | Keep current descriptions; do not add cohort dates, capacities, mentors, selection statistics, or outcomes without a source |\n| Institution-scale totals / partnerships / external endorsements | UNVERIFIED unless present in live evidence register | Public evidence system is designed to suppress unsupported totals/affiliations | Do not publish until a dated primary source is linked |\n`;
write("PUBLIC_CLAIMS_LEDGER.md", claimsLedger);

const claimTest = `import { describe, expect, test } from "bun:test";
import { STATS } from "@/data/landing";

describe("public claim boundaries", () => {
  test("does not label all six labs as published research divisions", () => {
    expect(STATS).toContainEqual(["Six labs", "research divisions in the platform"]);
    expect(STATS).not.toContainEqual(["Six labs", "published research divisions"]);
  });
});
`;
write("src/lib/public-claim-boundaries.test.ts", claimTest);

console.log("Bu1LD proof-density wave applied. Next: inspect git diff and run bun test, typecheck, lint, build/release gates before any deployment.");
