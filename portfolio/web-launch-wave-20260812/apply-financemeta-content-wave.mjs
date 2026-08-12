#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [landingRootArg, portalRootArg] = process.argv.slice(2);
if (!landingRootArg || !portalRootArg) {
  console.error("Usage: node apply-financemeta-content-wave.mjs <FinanceMeta-Landing checkout> <finance4all-global-reach checkout>");
  process.exit(2);
}

const landingRoot = path.resolve(landingRootArg);
const portalRoot = path.resolve(portalRootArg);
const EXPECTED_LANDING_HEAD = "f9265ce6ae94bf01048271ecfcf09d5be7059604";
const EXPECTED_PORTAL_HEAD = "fbdd503223edc5b1780509720391083f485a4a85";

function gitHead(root) {
  return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
}

function assertHead(root, expected, label) {
  const actual = gitHead(root);
  if (actual !== expected) {
    throw new Error(`${label} checkout drifted: expected ${expected}, got ${actual}. Re-audit before applying.`);
  }
}

function write(root, rel, content) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content.endsWith("\n") ? content : `${content}\n`, "utf8");
  console.log(`wrote ${dest}`);
}

function rebrandUiFile(root, rel) {
  const dest = path.join(root, rel);
  if (!fs.existsSync(dest)) return;
  const before = fs.readFileSync(dest, "utf8");
  const after = before
    .replaceAll("Finance4All Meta", "FinanceMeta")
    .replaceAll("Finance 4All", "FinanceMeta")
    .replaceAll("Finance4All", "FinanceMeta");
  if (after !== before) {
    fs.writeFileSync(dest, after, "utf8");
    console.log(`rebranded ${dest}`);
  }
}

assertHead(landingRoot, EXPECTED_LANDING_HEAD, "FinanceMeta-Landing");
assertHead(portalRoot, EXPECTED_PORTAL_HEAD, "finance4all-global-reach");

const landingMain = `import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Pathway = {
  title: string;
  label: string;
  description: string;
  evidence: string;
};

const PATHWAYS: Pathway[] = [
  {
    title: "Learn",
    label: "Finance foundations",
    description: "Build financial vocabulary through explainers and current-events learning surfaces.",
    evidence: "Finance Debriefed + beginner explainers exist in the member platform.",
  },
  {
    title: "Research",
    label: "Inspect and contribute",
    description: "Explore research-project workflows and apply where a real project has an open contribution path.",
    evidence: "Finance Meta Labs has dedicated project, review, and application routes.",
  },
  {
    title: "Build",
    label: "Project-based work",
    description: "Use pathway and project listings to find scoped roles that can end in inspectable work, not just attendance.",
    evidence: "Axiom Pathways and project-oriented portal workflows are implemented.",
  },
  {
    title: "Opportunities",
    label: "Programs and roles",
    description: "Find opportunities in one place and follow a clear next action when a listing is actually open.",
    evidence: "The platform includes pathways, events, saved items, and member workflows.",
  },
  {
    title: "Community",
    label: "Contribute with context",
    description: "Join around concrete learning, research, and project activity rather than an unsupported scale claim.",
    evidence: "Member authentication and collaboration surfaces exist; public counts remain evidence-gated.",
  },
];

const SURFACES = [
  ["Finance Debriefed", "Market/current-events learning and explainers"],
  ["Finance Meta Labs", "Research-project directory and application workflows"],
  ["Axiom Pathways", "Opportunity and pathway board"],
  ["Member workspace", "Saved items, events, profiles, and collaboration routes"],
] as const;

export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <main className="min-h-screen bg-white text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="#top" className="text-lg font-bold tracking-tight text-emerald-500">FinanceMeta</a>
        <div className="flex items-center gap-3">
          <a href="#pathways" className="hidden text-sm text-slate-600 hover:text-emerald-500 dark:text-slate-300 sm:inline">Explore</a>
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="rounded-full border border-emerald-500/40 px-4 py-2 text-sm text-emerald-500"
            aria-label="Toggle color theme"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>
      </nav>

      <section id="top" className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-4xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-500">Finance education · research · projects · opportunities</p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">Learn finance. Research it. Build with it.</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            FinanceMeta is a student-built platform connecting finance learning with research workflows, project-based opportunities, and member collaboration. Public claims stay evidence-gated: the work matters more than a large unsourced number.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#pathways" className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600">Explore pathways</a>
            <a href="#evidence" className="rounded-full border border-slate-300 px-6 py-3 font-semibold hover:border-emerald-500 dark:border-slate-700">What exists today</a>
          </div>
        </motion.div>
      </section>

      <section id="pathways" className="border-y border-slate-200 bg-slate-50/70 py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">Choose a path</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Start from what you want to do.</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">Categories appear here because the platform has a corresponding workflow—not because a program name exists on a roadmap.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PATHWAYS.map((pathway) => (
              <article key={pathway.title} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">{pathway.label}</p>
                <h3 className="mt-3 text-2xl font-bold">{pathway.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{pathway.description}</p>
                <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400">{pathway.evidence}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="evidence" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500">What exists today</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Show the product surface before the impact claim.</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">The current codebase substantiates these platform surfaces. Reach, membership, country, partnership, mentor, and outcome statistics are intentionally omitted until each has a dated primary source and definition.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {SURFACES.map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 py-16 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Want to help turn a pathway into stronger public evidence?</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ask about a concrete research, learning, or project contribution—not a generic membership promise.</p>
          </div>
          <a href="mailto:financeforalledu@gmail.com" className="w-fit rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600">Contact FinanceMeta</a>
        </div>
      </section>
    </main>
  );
}
`;

const landingHtml = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinanceMeta — Learn finance. Research it. Build with it.</title>
    <meta name="description" content="FinanceMeta connects finance learning with research workflows, project-based opportunities, and member collaboration." />
    <meta name="theme-color" content="#020617" />
    <meta property="og:title" content="FinanceMeta" />
    <meta property="og:description" content="Finance learning, research workflows, project-based opportunities, and collaboration in one platform." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="FinanceMeta" />
    <link rel="icon" href="/favicon.ico" />
    <link href="/index.css" rel="stylesheet" />
  </head>
  <body class="bg-white text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const landingLedger = `# FinanceMeta public claims ledger

Target audited: ${EXPECTED_LANDING_HEAD}\nPortal evidence target: ${EXPECTED_PORTAL_HEAD}\n
| Claim | Status | Public wording |
|---|---|---|
| FinanceMeta is a finance learning/research/opportunity platform | VERIFIED from portal routes/components | FinanceMeta connects finance learning with research workflows, project-based opportunities, and member collaboration. |
| Finance Debriefed exists | VERIFIED from source | Current-events learning and explainer surface. |
| Finance Meta Labs exists | VERIFIED from source | Research-project directory and application workflows. |
| Axiom Pathways exists | VERIFIED from source | Opportunity and pathway board. |
| 25,000+ impacted | UNVERIFIED | Do not publish until metric source/period/definition are documented. |
| 15+ countries | UNVERIFIED | Do not publish until country evidence is enumerated. |
| 50+ global members | UNVERIFIED | Do not publish until membership definition/source are documented. |
| University/industry partnerships and mentor affiliations | UNVERIFIED/REMOVE | Publish only a named, consented relationship tied to a concrete activity or output. |
`;

write(landingRoot, "src/main.tsx", landingMain);
write(landingRoot, "index.html", landingHtml);
write(landingRoot, "PUBLIC_CLAIMS_LEDGER.md", landingLedger);

const portalHero = `import { Link } from "react-router-dom";
import { ArrowRight, BookOpenText, FlaskConical, Route, Search } from "lucide-react";
import { portalRoutes } from "@/routes/portal";

const proofCards = [
  { icon: BookOpenText, title: "Learn", body: "Finance Debriefed and beginner explainers turn market/current-events context into a learning surface.", href: portalRoutes.debriefed },
  { icon: FlaskConical, title: "Research", body: "Finance Meta Labs provides project, review, and application workflows inside the portal.", href: portalRoutes.labs },
  { icon: Route, title: "Find a pathway", body: "Axiom Pathways organizes opportunity and project-oriented routes without inventing an outcome claim.", href: portalRoutes.pathways },
] as const;

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-4 py-24">
      <div className="absolute inset-0 -z-20 bg-[#060a12]" />
      <div className="absolute left-1/4 top-1/4 -z-10 h-[520px] w-[520px] rounded-full bg-emerald-400/15 blur-[170px]" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-[520px] w-[520px] rounded-full bg-purple-500/15 blur-[180px]" />

      <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Finance education · research · projects · opportunities</p>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">FinanceMeta</h1>
          <p className="mt-5 text-2xl font-semibold text-white">Learn finance. Research it. Build with it.</p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            A student-built platform connecting finance learning with research workflows, project-based opportunities, and member collaboration. We publish product surfaces and evidence we can inspect; reach, partnership, mentor, and impact claims stay gated until they have primary sources.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400">
              Create account <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#programs" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
              Explore what exists <Search className="h-4 w-4" />
            </a>
            <Link to="/login" className="inline-flex items-center rounded-full px-5 py-3 text-sm font-medium text-white/75 hover:text-white">Member sign in</Link>
          </div>
        </div>

        <div className="grid gap-4">
          {proofCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.href} className="rounded-3xl border border-white/15 bg-white/[0.05] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-300/40">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-emerald-300"><Icon className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{card.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/65">{card.body}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;

const portalAbout = `import { BookOpenText, FlaskConical, Route } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const pillars = [
  { icon: BookOpenText, title: "Learn with context", description: "Use explainers and current-events surfaces to build finance vocabulary and connect concepts to what is happening now." },
  { icon: FlaskConical, title: "Research with a workflow", description: "Inspect research-project listings and application/review flows rather than treating a lab name as proof of a result." },
  { icon: Route, title: "Move toward an output", description: "Pathways and project-oriented roles should lead to a concrete next action and inspectable work when the opportunity is actually open." },
];

export default function AboutSection() {
  const ref = useScrollReveal();
  return (
    <section id="about" className="relative px-4 py-28 sm:py-36">
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-emerald-300">What FinanceMeta is</p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">One place to learn, inspect research, and find the next finance project or opportunity.</h2>
          <p className="mt-5 text-sm leading-7 text-white/70 sm:text-base">
            The public story follows what the codebase actually supports: finance/current-events learning, research-project workflows, pathway listings, and a member workspace. Scale and external-affiliation claims are not used as substitutes for product evidence.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="rounded-3xl border border-white/20 bg-white/[0.05] p-6 backdrop-blur-xl">
                <div className="mb-4 inline-flex rounded-xl border border-white/20 bg-white/10 p-3 text-emerald-300"><Icon className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
`;

const portalPrograms = `import { Link } from "react-router-dom";
import { BookOpenText, FlaskConical, Newspaper, Route, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { portalRoutes } from "@/routes/portal";

const pathways = [
  { icon: Newspaper, title: "Finance Debriefed", status: "IMPLEMENTED SURFACE", summary: "Market/current-events learning and finance explainers inside the member platform.", href: portalRoutes.debriefed },
  { icon: BookOpenText, title: "Intro to Finance", status: "IMPLEMENTED SURFACE", summary: "Beginner-facing explainers designed to turn finance vocabulary into usable context.", href: portalRoutes.debriefedExplainers },
  { icon: FlaskConical, title: "Finance Meta Labs", status: "IMPLEMENTED WORKFLOW", summary: "Research-project directory plus review/application workflows. External mentorship and research-result claims remain separately evidence-gated.", href: portalRoutes.labs },
  { icon: Route, title: "Axiom Pathways", status: "IMPLEMENTED WORKFLOW", summary: "Opportunity and pathway board for internships, programs, and project-oriented roles.", href: portalRoutes.pathways },
] as const;

export default function ProgramsSection() {
  const ref = useScrollReveal();
  return (
    <section id="programs" className="relative overflow-hidden px-4 py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-10 h-[380px] w-[380px] rounded-full bg-emerald-400/15 blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 h-[420px] w-[420px] rounded-full bg-purple-400/15 blur-[160px]" />
      </div>
      <div ref={ref} className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-emerald-300">Explore the platform</p>
          <h2 className="text-4xl font-bold text-white sm:text-5xl">Real surfaces, clear status, no logo wall.</h2>
          <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
            These cards are tied to implemented portal routes. Programs, competitions, chapters, partners, mentors, and impact statistics should only be promoted here after their own evidence record exists.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {pathways.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} to={item.href} className="group rounded-3xl border border-white/20 bg-white/[0.05] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-300/40">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-emerald-300"><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">{item.status}</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">{item.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-300">Open workflow <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-12 rounded-3xl border border-amber-300/20 bg-amber-300/[0.05] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Evidence boundary</p>
          <p className="mt-3 text-sm leading-6 text-white/70">No public 25,000+ impact, 15+ country, 50+ member, university-mentor, Jane Street, or partner/collaborator claim is shown in this section. Those claims require a primary source, date, definition, and publishable relationship evidence before restoration.</p>
        </div>
      </div>
    </section>
  );
}
`;

const portalHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinanceMeta — Finance learning, research and opportunities</title>
    <meta name="description" content="FinanceMeta connects finance learning with research workflows, project-based opportunities, and member collaboration." />
    <meta name="theme-color" content="#060a12" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:title" content="FinanceMeta" />
    <meta property="og:description" content="Finance learning, research workflows, project-based opportunities, and member collaboration." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="FinanceMeta" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

write(portalRoot, "src/components/HeroSection.tsx", portalHero);
write(portalRoot, "src/components/AboutSection.tsx", portalAbout);
write(portalRoot, "src/components/ProgramsSection.tsx", portalPrograms);
write(portalRoot, "index.html", portalHtml);

for (const rel of [
  "src/components/Navbar.tsx",
  "src/components/Footer.tsx",
  "src/components/ContactSection.tsx",
  "src/components/FounderSection.tsx",
  "src/hooks/useDocumentTitle.ts",
  "src/pages/auth/Login.tsx",
  "src/pages/auth/Signup.tsx",
  "src/components/portal/AuthLayout.tsx",
  "src/layouts/PortalLayout.tsx",
]) {
  rebrandUiFile(portalRoot, rel);
}

const portalLedger = `# FinanceMeta public claims ledger\n\nAudited target: ${EXPECTED_PORTAL_HEAD}\n\n## Verified product surfaces\n\n- Finance Debriefed / finance explainers: source routes and components exist.\n- Finance Meta Labs: source routes, project/review/application components exist.\n- Axiom Pathways: source routes/components exist.\n- Member workspace: authentication, saved items, events, profiles and collaboration-oriented routes exist.\n\n## Removed from public promotion pending evidence\n\n- 25,000+ students impacted\n- 15+ countries reached\n- 50+ global members\n- broad worldwide underserved-school outreach\n- global economics-journal reach\n- university-mentored research claims naming Stanford/MIT/UChicago or similar institutions\n- Jane Street-supported curriculum claims\n- partner/collaborator name wall\n\nA source-code string is not external validation. Restore a claim only when a dated primary source, metric definition, and publishable relationship/outcome record exist.\n`;
write(portalRoot, "PUBLIC_CLAIMS_LEDGER.md", portalLedger);

console.log("FinanceMeta content wave applied. Next: inspect git diff, run build/typecheck/tests in each checkout, and do not deploy until the canonical release/security gates pass.");
