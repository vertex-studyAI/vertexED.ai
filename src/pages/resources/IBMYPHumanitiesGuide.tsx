import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpenCheck,
  Compass,
  FileQuestion,
  LibraryBig,
  Quote,
} from "lucide-react";

import SEO from "@/components/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "@/styles/humanities-guide.css";

const SOURCE_PROMPTS = [
  {
    key: "O",
    title: "Origin",
    prompt: "Who created it, when and where? Is it primary or secondary? Note relevant affiliations.",
  },
  {
    key: "P",
    title: "Purpose",
    prompt: "Why was it created, for whom, and to inform, persuade, explain or record what?",
  },
  {
    key: "V",
    title: "Value",
    prompt: "What evidence or perspective does it offer for this exact investigation? What makes it useful?",
  },
  {
    key: "L",
    title: "Limitation",
    prompt: "Where does its value stop? Name missing perspectives, scope, date, access or reliability limits.",
  },
] as const;

const RESPONSE_STEPS = [
  ["1", "Read the command term", "Underline what you must do: describe, explain, analyse, evaluate or justify."],
  ["2", "Allocate the marks", "Use the mark total to decide how many distinct, developed points you need."],
  ["3", "Build each point", "Make a claim, add precise evidence, then explain why that evidence answers the question."],
  ["4", "Add perspective", "For extended responses, compare interpretations or case studies before reaching a supported judgement."],
] as const;

export default function IBMYPHumanitiesGuide() {
  const [factor, setFactor] = useState("");
  const [outcome, setOutcome] = useState("");
  const [place, setPlace] = useState("");
  const [period, setPeriod] = useState("");

  const researchQuestion = useMemo(() => {
    const filled = [factor, outcome, place, period].every((value) => value.trim());
    if (!filled) return "Complete all four fields to preview a focused research question.";
    return `To what extent did ${factor.trim()} influence ${outcome.trim()} in ${place.trim()} during ${period.trim()}?`;
  }, [factor, outcome, place, period]);

  return (
    <>
      <SEO
        title="IB MYP Humanities answer studio | VertexED"
        description="A practical IB MYP History and Geography guide for research questions, OPVL source evaluation, short answers and extended responses."
        canonical="https://www.vertexed.app/resources/ib-myp-humanities-guide"
        keywords="IB MYP humanities, MYP history, MYP geography, OPVL, research question, source evaluation"
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: "IB MYP Humanities answer studio",
          educationalLevel: "IB Middle Years Programme",
          learningResourceType: "Study guide",
          isAccessibleForFree: true,
          provider: { "@type": "Organization", name: "VertexED" },
        }}
      />

      <div className="humanities-page">
        <header className="humanities-hero">
          <div>
            <p className="humanities-kicker"><span>01</span> IB MYP / Individuals and Societies</p>
            <h1>Build an answer that <em>shows its reasoning.</em></h1>
          </div>
          <div className="humanities-hero-note">
            <p>Move from a focused question to evidence, source evaluation and a supported judgement.</p>
            <p className="humanities-source-note">Adapted from learner-supplied Humanities notes. Independent study support, not official IB guidance. Check current criteria and task instructions with your teacher.</p>
          </div>
        </header>

        <section className="humanities-workbench" aria-labelledby="workbench-title">
          <div className="humanities-workbench-heading">
            <div>
              <p className="humanities-kicker"><span>02</span> Working desk</p>
              <h2 id="workbench-title">Choose the part you are writing.</h2>
            </div>
            <p>Nothing entered here is saved or sent to an AI provider.</p>
          </div>

          <Tabs defaultValue="question" className="humanities-tabs">
            <TabsList aria-label="Humanities writing tools" className="humanities-tab-list">
              <TabsTrigger value="question"><FileQuestion aria-hidden /> Research question</TabsTrigger>
              <TabsTrigger value="opvl"><LibraryBig aria-hidden /> OPVL</TabsTrigger>
              <TabsTrigger value="response"><BookOpenCheck aria-hidden /> Answer plan</TabsTrigger>
            </TabsList>

            <TabsContent value="question" className="humanities-panel">
              <div className="humanities-panel-intro">
                <span className="humanities-stage">A / Question</span>
                <div>
                  <h3>Make the relationship researchable.</h3>
                  <p>Use a command term that matches the task. “To what extent” suits questions that require weighing influence, but it is not the right opening for every investigation.</p>
                </div>
              </div>
              <div className="rq-layout">
                <div className="rq-fields">
                  <label>Factor or event<input value={factor} onChange={(event) => setFactor(event.target.value)} placeholder="e.g. railway expansion" /></label>
                  <label>Outcome to investigate<input value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="e.g. urban growth" /></label>
                  <label>Place<input value={place} onChange={(event) => setPlace(event.target.value)} placeholder="e.g. western India" /></label>
                  <label>Time period<input value={period} onChange={(event) => setPeriod(event.target.value)} placeholder="e.g. 1853 to 1900" /></label>
                </div>
                <div className="rq-preview" aria-live="polite">
                  <Quote aria-hidden />
                  <p>{researchQuestion}</p>
                  <span>Preview only. Refine the wording for your task.</span>
                </div>
              </div>
              <div className="humanities-checkline">
                <strong>Before you continue</strong>
                <span>Can you investigate the factor, effect, place and full period with the sources available?</span>
              </div>
            </TabsContent>

            <TabsContent value="opvl" className="humanities-panel">
              <div className="humanities-panel-intro">
                <span className="humanities-stage">B / Source</span>
                <div>
                  <h3>Evaluate value for your investigation.</h3>
                  <p>Do more than identify a source type. Link each observation to what the source lets you know, and what it cannot establish.</p>
                </div>
              </div>
              <ol className="opvl-list">
                {SOURCE_PROMPTS.map((item) => (
                  <li key={item.key}>
                    <span>{item.key}</span>
                    <div><h4>{item.title}</h4><p>{item.prompt}</p></div>
                  </li>
                ))}
              </ol>
              <div className="humanities-checkline">
                <strong>Useful test</strong>
                <span>Finish with: “For this investigation, that matters because…”</span>
              </div>
            </TabsContent>

            <TabsContent value="response" className="humanities-panel">
              <div className="humanities-panel-intro">
                <span className="humanities-stage">C / Response</span>
                <div>
                  <h3>Let the marks control the depth.</h3>
                  <p>A short answer still needs developed points. An extended answer needs precise knowledge, the requested format and more than one defensible perspective.</p>
                </div>
              </div>
              <ol className="response-trace">
                {RESPONSE_STEPS.map(([number, title, description]) => (
                  <li key={number}>
                    <span>{number}</span>
                    <div><h4>{title}</h4><p>{description}</p></div>
                  </li>
                ))}
              </ol>
              <div className="criteria-strip" aria-label="Extended response checks">
                <div><strong>Knowledge</strong><span>Accurate facts, examples and case studies.</span></div>
                <div><strong>Communication</strong><span>The correct format, structure and vocabulary.</span></div>
                <div><strong>Thinking</strong><span>Connections, perspectives and a justified conclusion.</span></div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="humanities-guidance" aria-labelledby="guidance-title">
          <div className="humanities-guidance-title">
            <p className="humanities-kicker"><span>03</span> Revision trace</p>
            <h2 id="guidance-title">Research. Attempt. Inspect. Retry.</h2>
            <p>Keep the question visible through the whole process so every paragraph has a job.</p>
          </div>
          <div className="humanities-guidance-steps">
            <article><span>01</span><Compass aria-hidden /><h3>Frame the inquiry</h3><p>Define the relationship, place and period. Explain why each boundary belongs in the investigation.</p></article>
            <article><span>02</span><LibraryBig aria-hidden /><h3>Build the evidence set</h3><p>Combine relevant primary and secondary material. Record enough publication detail to identify each source.</p></article>
            <article><span>03</span><BookOpenCheck aria-hidden /><h3>Make the judgement</h3><p>Compare evidence and perspectives. State what mattered most and explain why the alternatives mattered less.</p></article>
          </div>
        </section>

        <section className="humanities-actions" aria-labelledby="actions-title">
          <div><p className="humanities-kicker"><span>04</span> Continue in VertexED</p><h2 id="actions-title">Put the guide into practice.</h2></div>
          <nav aria-label="Humanities study actions">
            <Link to="/paper-maker">Create a practice paper <ArrowRight aria-hidden /></Link>
            <Link to="/answer-reviewer">Review an answer <ArrowRight aria-hidden /></Link>
            <Link to="/chatbot">Question your reasoning with Apex <ArrowRight aria-hidden /></Link>
          </nav>
        </section>
      </div>
    </>
  );
}
