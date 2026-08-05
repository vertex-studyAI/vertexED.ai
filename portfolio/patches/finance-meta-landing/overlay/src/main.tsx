import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

type Theme = "light" | "dark";

type Pathway = {
  title: string;
  description: string;
};

const pathways: Pathway[] = [
  { title: "Learn", description: "Build financial intuition through workshops, explainers, guided tracks, and practical case studies." },
  { title: "Research", description: "Investigate markets, policy, quantitative methods, and financial technology with reproducible work." },
  { title: "Build", description: "Turn ideas into models, dashboards, experiments, and responsible fintech prototypes." },
  { title: "Publish", description: "Share analysis through research notes, podcasts, explainers, and student-led publications." },
  { title: "Compete", description: "Practice under pressure through investment, economics, and quantitative-finance competitions." },
  { title: "Contribute", description: "Mentor peers, improve open resources, support chapters, and widen access to finance education." },
  { title: "Lead", description: "Launch a chapter, run a program, or lead a team that creates measurable value for learners." },
];

const programs = [
  ["Axiom Pathways", "Structured learning tracks from fundamentals to applied finance."],
  ["FinanceMeta Research", "Evidence-led projects across markets, policy, and quantitative methods."],
  ["Global Fellowship", "Long-form projects, mentorship, publication, and leadership."],
  ["Partnership Network", "Collaborations with schools, educators, researchers, and builders."],
] as const;

function initialTheme(): Theme {
  const stored = localStorage.getItem("finance-meta-theme");
  if (stored === "light" || stored === "dark") return stored;
  return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("finance-meta-theme", theme);
  }, [theme]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="FinanceMeta home">
          <span className="brand-mark" aria-hidden="true">FM</span>
          <span>FinanceMeta</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#pathways">Pathways</a>
          <a href="#programs">Programs</a>
          <a href="#standard">Standard</a>
        </nav>
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Finance education, research, and building</p>
            <h1>Turn curiosity about finance into work that matters.</h1>
            <p className="hero-copy">
              FinanceMeta is a student-led ecosystem for learning financial ideas, testing them through research and projects, publishing what survives scrutiny, and leading communities that widen access.
            </p>
            <div className="actions">
              <a className="button primary" href="mailto:financeforalledu@gmail.com?subject=FinanceMeta%20interest">Join the network</a>
              <a className="button secondary" href="#pathways">Explore the pathways</a>
            </div>
          </div>

          <div className="loop-card" aria-label="FinanceMeta operating loop">
            <span>Operating loop</span>
            <strong>Learn → Research → Build → Publish</strong>
            <p>Each stage creates evidence for the next.</p>
            <div className="loop-steps" aria-hidden="true">
              <b>Question</b><b>Test</b><b>Share</b>
            </div>
          </div>
        </section>

        <section className="section" id="pathways" aria-labelledby="pathways-heading">
          <div className="section-heading">
            <p className="eyebrow">Seven connected pathways</p>
            <h2 id="pathways-heading">A place to start, and a path to keep growing.</h2>
            <p>Enter through the work that fits you now. Move across pathways as your skills and ambitions expand.</p>
          </div>
          <div className="pathway-grid">
            {pathways.map((pathway, index) => (
              <article className="pathway-card" key={pathway.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{pathway.title}</h3>
                <p>{pathway.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="programs" aria-labelledby="programs-heading">
          <div className="section-heading compact">
            <p className="eyebrow">Flagship programs</p>
            <h2 id="programs-heading">Build depth through real outputs.</h2>
          </div>
          <div className="program-list">
            {programs.map(([name, description], index) => (
              <article className="program-row" key={name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{name}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section standard" id="standard" aria-labelledby="standard-heading">
          <div>
            <p className="eyebrow">Our standard</p>
            <h2 id="standard-heading">Make finance rigorous, practical, and accessible.</h2>
          </div>
          <div>
            <p>We separate facts from interpretation, cite primary sources, make uncertainty visible, and avoid pretending a polished chart is the same thing as a validated result.</p>
            <p>Whether the output is a lesson, model, paper, podcast, competition, or product, it should leave the learner more capable than before.</p>
          </div>
        </section>

        <section className="cta" aria-labelledby="cta-heading">
          <p className="eyebrow">Start with one useful contribution</p>
          <h2 id="cta-heading">Learn something. Test it. Build something. Share it well.</h2>
          <a className="button primary" href="mailto:financeforalledu@gmail.com?subject=FinanceMeta%20collaboration">Contact FinanceMeta</a>
        </section>
      </main>

      <footer>
        <strong>FinanceMeta</strong>
        <span>Learn · Research · Build · Publish · Compete · Contribute · Lead</span>
      </footer>
    </div>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root mount element");
createRoot(root).render(<App />);
