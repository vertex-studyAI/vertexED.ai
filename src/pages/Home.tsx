import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import VertexLearningField from "@/components/landing/VertexLearningField";
import { useAuth } from "@/contexts/AuthContext";
import { LANDING_FEATURES } from "@/content/landing";
import "@/styles/vertex-landing.css";

const VERTEX_INTEREST_URL =
  "https://tally.so/r/QKZByA?utm_source=vertexed.app&utm_medium=homepage&utm_campaign=school_research_contributor_interest";

const workflow = [
  {
    step: "01",
    title: "Plan the week",
    body: "Turn exams and deadlines into study blocks that fit the time you actually have. The task should already know where it goes next.",
  },
  {
    step: "02",
    title: "Do the work",
    body: "Open a focused session, practise in exam-shaped formats, and keep the attempt attached to the topic instead of losing it in another tab.",
  },
  {
    step: "03",
    title: "Use the evidence",
    body: "Review lost marks, turn the weak topic into another task, and retrieve it again before the next paper.",
  },
];

const trajectory = ["Plan", "Focus", "Practise", "Review", "Remember"];
const founders = ["Ryan Gomez", "Pratyush Vel Shankar", "Ritayush Dey"];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="vertex-landing">
      <SEO
        title="AI Study Planner & Exam Practice Tools | VertexED"
        description="VertexED connects revision planning, focused study, exam-style practice, rubric feedback, notes, flashcards, quizzes, and AI support in one study workflow."
        keywords="AI study planner, MYP study guides, IGCSE paper generator, IB practice papers, revision planner, study tools for students"
        canonical="https://www.vertexed.app/"
        jsonLd={[
          { "@context": "https://schema.org", "@type": "WebSite", name: "VertexED", url: "https://www.vertexed.app/" },
          { "@context": "https://schema.org", "@type": "Organization", name: "VertexED", url: "https://www.vertexed.app", logo: "https://www.vertexed.app/logo.png" },
        ]}
      />

      <section className="vertex-hero" aria-labelledby="home-title">
        <div className="vertex-hero-copy">
          <p className="vertex-hero-kicker">One connected study loop</p>
          <h1 id="home-title">
            Know what to study. <span className="vertex-word-accent">Practise</span> what matters.
          </h1>
          <p className="vertex-hero-lead">
            VertexED carries the same study task through planning, focused work, exam practice, feedback, and retrieval.
            Start with a clear reason. Finish with a specific next move.
          </p>
          <div className="vertex-hero-actions">
            <Link to="/signup" className="vertex-primary-action">
              Join the private beta <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/features" className="vertex-secondary-action">
              See the study loop <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="vertex-hero-loop" aria-label="VertexED study loop">
            {trajectory.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>

        <VertexLearningField />
      </section>

      <div className="vertex-trajectory-band" aria-hidden="true">
        <div className="vertex-trajectory-band-track">
          {[...trajectory, ...trajectory].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="vertex-section" aria-labelledby="workflow-title">
        <div className="vertex-section-header">
          <div>
            <p className="vertex-section-kicker">Evidence carries forward</p>
            <h2 id="workflow-title">Practice should change the next plan.</h2>
          </div>
          <p>
            The useful output of a study session is not another dashboard number. It is a clearer decision about what to
            do next and why.
          </p>
        </div>

        <ol className="vertex-process">
          {workflow.map((item) => (
            <li key={item.step} className="vertex-process-item">
              <span className="vertex-process-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="vertex-tools-section" aria-labelledby="tools-title">
        <div className="vertex-section-header">
          <div>
            <p className="vertex-section-kicker">The workspace</p>
            <h2 id="tools-title">Different tools. One trajectory.</h2>
          </div>
          <p>
            Each tool has a defined job in the loop. Work should move between them with context instead of ending as an
            isolated score or generated file.
          </p>
        </div>

        <div className="vertex-tool-runway">
          {LANDING_FEATURES.map((feature) => (
            <article key={feature.title} className="vertex-tool-row">
              <p className="vertex-tool-phase">{feature.loop}</p>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <Link to={feature.href} className="vertex-tool-link" aria-label={`Open ${feature.title}`}>
                Open <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="vertex-principle" aria-labelledby="principle-title">
        <div>
          <p className="vertex-section-kicker">Product principle</p>
          <h2 id="principle-title">AI should support the thinking, not replace it.</h2>
        </div>
        <div className="vertex-principle-copy">
          <p>
            VertexED is designed to explain, question, and review. The student still makes the plan, attempts the work,
            and decides how to improve it.
          </p>
          <p>
            Progress stays inspectable. You can see the task completed, the marks lost, and the topic that needs another
            attempt instead of receiving a polished answer you cannot reproduce.
          </p>
        </div>
      </section>

      <section className="vertex-final" aria-labelledby="beta-title">
        <p className="vertex-section-kicker">Private beta</p>
        <h2 id="beta-title">Try it with one real week and one real paper.</h2>
        <p>
          Built by {founders.join(", ")}. Students can join the private beta directly. Educators, schools, researchers,
          contributors, and partners can use the separate interest form so the right team can follow up.
        </p>
        <div className="vertex-final-actions">
          <Link to="/signup" className="vertex-primary-action">Join the private beta</Link>
          <a href={VERTEX_INTEREST_URL} target="_blank" rel="noreferrer" className="vertex-secondary-action">
            School / contributor interest
          </a>
          <Link to="/about" className="vertex-secondary-action">About the team</Link>
        </div>
      </section>
    </div>
  );
}
