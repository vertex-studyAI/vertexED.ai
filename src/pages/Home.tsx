import { Link, useNavigate } from "react-router";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { LANDING_FEATURES } from "@/content/landing";

const workflow = [
  { step: "01", title: "Plan the week", body: "Turn exams and deadlines into study blocks that fit the time you actually have." },
  { step: "02", title: "Do the work", body: "Open a focused session, practise in exam-shaped formats, and keep the attempt with the task." },
  { step: "03", title: "Use the evidence", body: "Review lost marks, schedule the weak topics, and retrieve them again before they fade." },
];

const founders = ["Ryan Gomez", "Pratyush Vel Shankar", "Ritayush Dey"];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/main", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <>
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

      <section className="editorial-hero workbook-hero" aria-labelledby="home-title">
        <div className="max-w-4xl">
          <p className="section-kicker">Study planning, practice, and feedback</p>
          <h1 id="home-title">A clearer path to your next exam.</h1>
          <p className="editorial-lead">
            Make a plan you can follow. Practise the hard questions. Turn feedback into your next study session.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="btn-solid">Join the private beta</Link>
            <Link to="/features" className="btn-glass">See how it works</Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="VertexED study loop">
            {["Plan", "Focus", "Practise", "Review", "Remember"].map((item) => (
              <li key={item} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />{item}</li>
            ))}
          </ul>
        </div>
        <aside className="workbook-preview" aria-label="Example study session">
          <div className="workbook-preview-heading"><span>YOUR STUDY DESK</span><span>Example session</span></div>
          <h2>One topic. Three steps.</h2>
          <p className="workbook-preview-topic">Biology / Cell transport</p>
          <ol>
            <li><span>01</span><div><strong>Recall what you know</strong><p>Explain osmosis without your notes.</p></div><small>5 min</small></li>
            <li><span>02</span><div><strong>Put it into practice</strong><p>Attempt a question, then check your reasoning.</p></div><small>15 min</small></li>
            <li><span>03</span><div><strong>Make the next attempt easier</strong><p>Save the mistake you want to revisit.</p></div><small>5 min</small></li>
          </ol>
          <Link to="/signup" className="text-link">Build your own session <span aria-hidden>→</span></Link>
        </aside>
      </section>

      <section className="editorial-section" aria-labelledby="workflow-title">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">One connected workflow</p>
            <h2 id="workflow-title">Less organising. More studying.</h2>
          </div>
          <p>Plans guide practice. Practice produces feedback. Feedback changes the next plan.</p>
        </div>
        <ol className="workflow-grid">
          {workflow.map((item) => (
            <li key={item.step} className="quiet-card">
              <span className="step-number">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="editorial-section" aria-labelledby="tools-title">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">The workspace</p>
            <h2 id="tools-title">Tools with a defined job</h2>
          </div>
          <p>Each tool has a clear role, and saved work can move into the next part of the study process.</p>
        </div>
        <div className="tool-directory">
          {LANDING_FEATURES.map((feature) => (
            <article key={feature.title} className="tool-directory-row">
              <p className="tool-phase">{feature.loop}</p>
              <h3>{feature.title}</h3>
              <p className="flex-1">{feature.desc}</p>
              <Link to={feature.href} className="text-link" aria-label={`Open ${feature.title}`}>
                Open {feature.title}<span aria-hidden> →</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial-section editorial-split" aria-labelledby="principle-title">
        <div>
          <p className="section-kicker">Product principle</p>
          <h2 id="principle-title">AI should support the thinking, not replace it.</h2>
        </div>
        <div>
          <p className="text-lg leading-relaxed text-foreground/90">
            VertexED is designed to explain, question, and review. The student still makes the plan, attempts the work,
            and decides how to improve it.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            You can see the task you completed, the evidence behind feedback, and the topic that deserves another
            attempt. A polished answer is much less useful if you cannot reproduce the reasoning yourself.
          </p>
        </div>
      </section>

      <section className="editorial-section border-b-0 text-center" aria-labelledby="beta-title">
        <p className="section-kicker">Private beta</p>
        <h2 id="beta-title" className="mx-auto max-w-2xl">Try VertexED with one real week and one real paper.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
          Built by {founders.join(", ")}. Join the beta or use a team invite to test the complete study loop.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="btn-solid">Join the private beta</Link>
          <Link to="/about" className="btn-glass">About the team</Link>
        </div>
      </section>
    </>
  );
}
