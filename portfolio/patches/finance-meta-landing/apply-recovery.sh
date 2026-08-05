#!/usr/bin/env bash
set -euo pipefail

target_dir="${1:?usage: apply-recovery.sh <target-directory>}"
mkdir -p "$target_dir/src" "$target_dir/tests" "$target_dir/e2e" "$target_dir/.github/workflows"

cat > "$target_dir/package.json" <<'EOF'
{
  "name": "financemeta-landing",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "test": "node --test tests/source.test.mjs",
    "build": "vite build",
    "test:dist": "node --test tests/dist.test.mjs",
    "test:e2e": "playwright test",
    "ci": "npm run typecheck && npm audit --omit=dev --audit-level=high && npm test && npm run build && npm run test:dist",
    "preview": "vite preview"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.2",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "typescript": "^5.8.3",
    "vite": "^7.0.6"
  }
}
EOF

cat > "$target_dir/index.html" <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#07111f" />
    <meta name="description" content="FinanceMeta helps students learn finance, conduct research, build projects, publish work, compete, contribute, and lead." />
    <title>FinanceMeta | Learn, research, build, and lead in finance</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > "$target_dir/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "playwright.config.ts", "e2e"]
}
EOF

cat > "$target_dir/src/main.tsx" <<'EOF'
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

type Theme = "light" | "dark";

type Pathway = {
  label: string;
  title: string;
  description: string;
};

const pathways: Pathway[] = [
  { label: "01", title: "Learn", description: "Build financial intuition through workshops, explainers, guided tracks, and practical case studies." },
  { label: "02", title: "Research", description: "Investigate markets, policy, quantitative methods, and financial technology with reproducible research." },
  { label: "03", title: "Build", description: "Turn ideas into models, tools, dashboards, trading experiments, and responsible fintech prototypes." },
  { label: "04", title: "Publish", description: "Share analysis through Finance Debriefed, research notes, podcasts, and student-led publications." },
  { label: "05", title: "Compete", description: "Practice under pressure through investment, economics, and quantitative-finance competitions." },
  { label: "06", title: "Contribute", description: "Mentor peers, improve open resources, support chapters, and help make finance more accessible." },
  { label: "07", title: "Lead", description: "Launch a chapter, run a program, or lead a team that creates measurable value for learners." },
];

const programs = [
  { name: "Axiom Pathways", detail: "Structured learning tracks from fundamentals to applied finance." },
  { name: "FinanceMeta Labs", detail: "Research and experimentation across markets, policy, and quantitative methods." },
  { name: "FinTech Studio", detail: "A builder environment for tools, prototypes, and product collaboration." },
  { name: "Global Fellowship", detail: "Long-form projects, mentorship, publication, and leadership opportunities." },
];

function getInitialTheme(): Theme {
  const stored = window.localStorage.getItem("financemeta-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("financemeta-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="FinanceMeta home">
          <span className="brand-mark" aria-hidden="true">FM</span>
          <span>FinanceMeta</span>
        </a>
        <nav className="nav-links" aria-label="Main links">
          <a href="#pathways">Pathways</a>
          <a href="#programs">Programs</a>
          <a href="#about">About</a>
        </nav>
        <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Finance education, research, and building</p>
            <h1>Turn curiosity about finance into work that matters.</h1>
            <p className="hero-lede">
              FinanceMeta is a student-led ecosystem for learning financial ideas, testing them through research and projects, publishing what survives scrutiny, and leading communities that widen access.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="mailto:financeforalledu@gmail.com?subject=FinanceMeta%20interest">Join the network</a>
              <a className="button button-secondary" href="#pathways">Explore the pathways</a>
            </div>
            <dl className="proof-strip" aria-label="FinanceMeta focus areas">
              <div><dt>Learn</dt><dd>Concepts to application</dd></div>
              <div><dt>Build</dt><dd>Models and products</dd></div>
              <div><dt>Publish</dt><dd>Evidence over hype</dd></div>
            </dl>
          </div>
          <div className="hero-visual" aria-label="FinanceMeta operating loop">
            <div className="signal-card signal-card-main">
              <span className="signal-label">Operating loop</span>
              <strong>Learn → Research → Build → Publish</strong>
              <p>Each stage creates evidence for the next.</p>
            </div>
            <div className="signal-card signal-card-a"><span>01</span><strong>Question</strong></div>
            <div className="signal-card signal-card-b"><span>02</span><strong>Test</strong></div>
            <div className="signal-card signal-card-c"><span>03</span><strong>Share</strong></div>
          </div>
        </section>

        <section className="section" id="pathways" aria-labelledby="pathways-title">
          <div className="section-heading">
            <p className="eyebrow">Seven connected pathways</p>
            <h2 id="pathways-title">A place to start, and a path to keep growing.</h2>
            <p>Enter through the work that fits you now. Move across pathways as your skills and ambitions expand.</p>
          </div>
          <div className="pathway-grid">
            {pathways.map((pathway) => (
              <article className="pathway-card" key={pathway.title}>
                <span className="card-index">{pathway.label}</span>
                <h3>{pathway.title}</h3>
                <p>{pathway.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section programs-section" id="programs" aria-labelledby="programs-title">
          <div className="section-heading compact">
            <p className="eyebrow">Flagship programs</p>
            <h2 id="programs-title">Build depth through real outputs.</h2>
          </div>
          <div className="program-list">
            {programs.map((program, index) => (
              <article className="program-row" key={program.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{program.name}</h3>
                <p>{program.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section about-section" id="about" aria-labelledby="about-title">
          <div>
            <p className="eyebrow">Our standard</p>
            <h2 id="about-title">Make finance rigorous, practical, and accessible.</h2>
          </div>
          <div className="about-copy">
            <p>We separate facts from interpretation, cite primary sources, make uncertainty visible, and avoid pretending that a polished chart is the same thing as a validated result.</p>
            <p>Whether the output is a lesson, model, paper, podcast, competition, or product, it should leave the learner more capable than before.</p>
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-title">
          <p className="eyebrow">Start with one useful contribution</p>
          <h2 id="cta-title">Learn something. Test it. Build something. Share it well.</h2>
          <a className="button button-primary" href="mailto:financeforalledu@gmail.com?subject=FinanceMeta%20collaboration">Contact FinanceMeta</a>
        </section>
      </main>

      <footer>
        <span>FinanceMeta</span>
        <span>Learn · Research · Build · Publish · Compete · Contribute · Lead</span>
      </footer>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root mount element");
createRoot(rootElement).render(<App />);
EOF

cat > "$target_dir/src/index.css" <<'EOF'
:root {
  color-scheme: dark;
  --bg: #07111f;
  --surface: rgba(17, 31, 49, 0.72);
  --surface-strong: #112239;
  --text: #f7fbff;
  --muted: #9db0c5;
  --line: rgba(173, 205, 231, 0.18);
  --accent: #7cf5c8;
  --accent-strong: #35d89c;
  --shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

:root[data-theme="light"] {
  color-scheme: light;
  --bg: #f3f7f5;
  --surface: rgba(255, 255, 255, 0.82);
  --surface-strong: #ffffff;
  --text: #0b1a24;
  --muted: #506573;
  --line: rgba(11, 26, 36, 0.14);
  --accent: #087a57;
  --accent-strong: #056545;
  --shadow: 0 30px 80px rgba(28, 55, 46, 0.14);
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-width: 320px;
  background:
    radial-gradient(circle at 12% 8%, color-mix(in srgb, var(--accent) 15%, transparent), transparent 34rem),
    radial-gradient(circle at 88% 24%, rgba(68, 132, 255, 0.12), transparent 30rem),
    var(--bg);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.6;
  transition: background 180ms ease, color 180ms ease;
}
a { color: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
button:focus-visible, a:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
.site-shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }
.skip-link { position: fixed; left: 16px; top: -80px; z-index: 100; padding: 12px 16px; background: var(--accent); color: #04130d; border-radius: 10px; font-weight: 800; }
.skip-link:focus { top: 16px; }
.site-header { position: sticky; top: 14px; z-index: 20; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; margin-top: 14px; padding: 12px 14px; border: 1px solid var(--line); border-radius: 18px; background: color-mix(in srgb, var(--surface-strong) 78%, transparent); backdrop-filter: blur(18px); box-shadow: 0 12px 40px rgba(0,0,0,.12); }
.brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; font-weight: 850; letter-spacing: -.02em; }
.brand-mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; background: var(--accent); color: #04130d; font-size: 13px; }
.nav-links { display: flex; gap: 22px; }
.nav-links a { color: var(--muted); text-decoration: none; font-weight: 700; font-size: 14px; }
.nav-links a:hover { color: var(--text); }
.theme-toggle { justify-self: end; border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--text); padding: 9px 14px; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; }
.hero { min-height: 720px; display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(360px, .92fr); align-items: center; gap: clamp(40px, 8vw, 110px); padding: 90px 0 70px; }
.eyebrow { margin: 0 0 16px; color: var(--accent); text-transform: uppercase; letter-spacing: .16em; font-size: 12px; font-weight: 900; }
h1, h2, h3, p { margin-top: 0; }
h1 { max-width: 780px; margin-bottom: 24px; font-size: clamp(3.4rem, 7.8vw, 6.9rem); line-height: .93; letter-spacing: -.065em; }
.hero-lede { max-width: 680px; color: var(--muted); font-size: clamp(1.05rem, 2vw, 1.28rem); }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
.button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 20px; border: 1px solid transparent; border-radius: 12px; text-decoration: none; font-weight: 850; }
.button-primary { background: var(--accent); color: #04130d; box-shadow: 0 12px 32px color-mix(in srgb, var(--accent) 23%, transparent); }
.button-primary:hover { background: var(--accent-strong); }
.button-secondary { border-color: var(--line); background: var(--surface); }
.proof-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 44px 0 0; }
.proof-strip div { padding: 16px; border-top: 1px solid var(--line); }
.proof-strip dt { font-weight: 850; }
.proof-strip dd { margin: 2px 0 0; color: var(--muted); font-size: 13px; }
.hero-visual { position: relative; min-height: 510px; }
.signal-card { position: absolute; border: 1px solid var(--line); background: var(--surface); backdrop-filter: blur(14px); box-shadow: var(--shadow); }
.signal-card-main { inset: 80px 20px 80px 20px; display: flex; flex-direction: column; justify-content: center; padding: 42px; border-radius: 30px; }
.signal-label { color: var(--accent); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .14em; }
.signal-card-main strong { max-width: 360px; margin-top: 16px; font-size: clamp(1.8rem, 3vw, 3rem); line-height: 1.08; letter-spacing: -.04em; }
.signal-card-main p { margin: 16px 0 0; color: var(--muted); }
.signal-card-a, .signal-card-b, .signal-card-c { display: grid; gap: 2px; min-width: 132px; padding: 16px 18px; border-radius: 16px; }
.signal-card-a span, .signal-card-b span, .signal-card-c span { color: var(--accent); font-size: 11px; font-weight: 900; }
.signal-card-a { top: 20px; left: -10px; }
.signal-card-b { right: -4px; top: 38px; }
.signal-card-c { right: 26px; bottom: 18px; }
.section { padding: 100px 0; border-top: 1px solid var(--line); }
.section-heading { max-width: 760px; margin-bottom: 50px; }
.section-heading.compact { margin-bottom: 28px; }
h2 { margin-bottom: 18px; font-size: clamp(2.3rem, 5vw, 4.5rem); line-height: 1; letter-spacing: -.055em; }
.section-heading > p:last-child, .about-copy { color: var(--muted); font-size: 1.05rem; }
.pathway-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
.pathway-card { grid-column: span 4; min-height: 250px; padding: 28px; border: 1px solid var(--line); border-radius: 22px; background: var(--surface); }
.pathway-card:nth-child(4), .pathway-card:nth-child(5), .pathway-card:nth-child(6), .pathway-card:nth-child(7) { grid-column: span 3; }
.card-index { color: var(--accent); font-size: 12px; font-weight: 900; }
.pathway-card h3 { margin: 42px 0 10px; font-size: 1.8rem; letter-spacing: -.035em; }
.pathway-card p { color: var(--muted); }
.program-list { border-top: 1px solid var(--line); }
.program-row { display: grid; grid-template-columns: 70px minmax(220px, .7fr) 1fr; gap: 24px; align-items: baseline; padding: 24px 0; border-bottom: 1px solid var(--line); }
.program-row > span { color: var(--accent); font-size: 12px; font-weight: 900; }
.program-row h3 { margin: 0; font-size: 1.35rem; }
.program-row p { margin: 0; color: var(--muted); }
.about-section { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.cta-section { margin: 70px 0; padding: clamp(38px, 7vw, 76px); border: 1px solid var(--line); border-radius: 28px; background: var(--surface); text-align: center; box-shadow: var(--shadow); }
.cta-section h2 { max-width: 780px; margin-left: auto; margin-right: auto; }
footer { display: flex; justify-content: space-between; gap: 24px; padding: 28px 0 42px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }
footer span:first-child { color: var(--text); font-weight: 850; }

@media (max-width: 900px) {
  .site-header { grid-template-columns: 1fr auto; }
  .nav-links { display: none; }
  .hero { grid-template-columns: 1fr; min-height: auto; padding-top: 80px; }
  .hero-visual { min-height: 440px; }
  .pathway-card, .pathway-card:nth-child(n) { grid-column: span 6; }
  .about-section { grid-template-columns: 1fr; gap: 18px; }
}

@media (max-width: 620px) {
  .site-shell { width: min(100% - 20px, 1180px); }
  .site-header { top: 8px; margin-top: 8px; }
  .brand-mark { width: 32px; height: 32px; }
  h1 { font-size: clamp(3rem, 16vw, 4.8rem); }
  .proof-strip { grid-template-columns: 1fr; }
  .hero-visual { min-height: 380px; }
  .signal-card-main { inset: 62px 0 58px; padding: 28px; }
  .signal-card-a { left: 8px; }
  .signal-card-b { right: 4px; }
  .signal-card-c { right: 12px; }
  .section { padding: 74px 0; }
  .pathway-card, .pathway-card:nth-child(n) { grid-column: 1 / -1; min-height: auto; }
  .pathway-card h3 { margin-top: 26px; }
  .program-row { grid-template-columns: 44px 1fr; gap: 12px; }
  .program-row p { grid-column: 2; }
  footer { flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
EOF

cat > "$target_dir/tests/source.test.mjs" <<'EOF'
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [html, source, css, packageJson] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../src/main.tsx", import.meta.url), "utf8"),
  readFile(new URL("../src/index.css", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
]);

test("mounts React and imports the real stylesheet", () => {
  assert.match(source, /createRoot\(rootElement\)\.render/);
  assert.match(source, /import "\.\/index\.css"/);
  assert.doesNotMatch(html, /href="\/index\.css"/);
});

test("uses FinanceMeta branding and complete pathway language", () => {
  assert.match(html, /FinanceMeta/);
  for (const label of ["Learn", "Research", "Build", "Publish", "Compete", "Contribute", "Lead"]) {
    assert.match(source, new RegExp(`title: "${label}"`));
  }
});

test("removes the obsolete particle dependency surface", () => {
  assert.doesNotMatch(source, /tsparticles|Particles/);
  assert.doesNotMatch(packageJson, /tsparticles|framer-motion/);
});

test("includes accessibility and responsive safeguards", () => {
  assert.match(source, /Skip to content/);
  assert.match(source, /aria-label/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media \(max-width: 620px\)/);
});
EOF

cat > "$target_dir/tests/dist.test.mjs" <<'EOF'
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

const distUrl = new URL("../dist/", import.meta.url);
const html = await readFile(new URL("index.html", distUrl), "utf8");
const assetNames = await readdir(new URL("assets/", distUrl));

test("production output contains emitted JavaScript and CSS", async () => {
  const js = assetNames.filter((name) => name.endsWith(".js"));
  const css = assetNames.filter((name) => name.endsWith(".css"));
  assert.ok(js.length >= 1, "expected at least one JavaScript bundle");
  assert.ok(css.length >= 1, "expected at least one CSS bundle");
  assert.match(html, /FinanceMeta/);
  for (const name of [...js, ...css]) {
    const details = await stat(new URL(`assets/${name}`, distUrl));
    assert.ok(details.size > 0, `${name} should not be empty`);
  }
});
EOF

cat > "$target_dir/playwright.config.ts" <<'EOF'
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
EOF

cat > "$target_dir/e2e/landing.spec.ts" <<'EOF'
import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const dimensions = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth + 1);
}

test("primary journey exposes the FinanceMeta pathways and contact action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/work that matters/i);
  await expect(page.getByRole("link", { name: /join the network/i })).toHaveAttribute("href", /mailto:/);
  await page.getByRole("link", { name: /explore the pathways/i }).click();
  await expect(page.getByRole("heading", { name: /place to start/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Research" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Lead" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("theme choice persists across reloads", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /switch to/i });
  await toggle.click();
  const theme = await page.locator("html").getAttribute("data-theme");
  expect(theme).toMatch(/light|dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme!);
});

test("keyboard navigation reaches a visible focus target", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});
EOF

cat > "$target_dir/.github/workflows/ci.yml" <<'EOF'
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  release-gate:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v6
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - run: npm run ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - if: always()
        uses: actions/upload-artifact@v7
        with:
          name: playwright-report
          path: |
            playwright-report
            test-results
          if-no-files-found: ignore
          retention-days: 14
EOF

rm -f "$target_dir/tailwind_config.js" "$target_dir/tailwind.config.js" "$target_dir/postcss.config.js"
