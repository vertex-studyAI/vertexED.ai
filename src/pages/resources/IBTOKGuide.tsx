import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function IBTOKGuide() {
  return (
    <>
      <SEO
        title="Using AI for IB TOK essays and exhibitions | VertexED"
        description="Brainstorm real-life situations, knowledge questions, and counter-claims — then write the analysis yourself so it sounds like TOK, not a Wikipedia summary."
        canonical="https://www.vertexed.app/resources/ib-tok-guide-ai"
        keywords="IB TOK, Theory of Knowledge, TOK Essay AI, TOK Exhibition AI, Real Life Situations RLS, Knowledge Questions, Areas of Knowledge, Ways of Knowing, IB Diploma, VertexED"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Using AI for IB TOK essays and exhibitions",
            description: "Brainstorm RLS examples, knowledge questions, and counter-claims for IB Theory of Knowledge.",
            author: {
              "@type": "Organization",
              name: "VertexED Team",
              url: "https://www.vertexed.app"
            },
            publisher: {
              "@type": "Organization",
              name: "VertexED",
              logo: {
                "@type": "ImageObject",
                url: "https://www.vertexed.app/logo.png"
              }
            },
            datePublished: "2025-12-24",
            dateModified: "2025-12-24"
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Can I use AI examples?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, but verify them. AI can invent studies or events — Google every RLS before you cite it."
                }
              },
              {
                "@type": "Question",
                name: "What if my RLS is too common?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Ask for less overused examples. Flat Earth and Mandela Effect appear on every TOK draft — examiners have seen them."
                }
              },
              {
                "@type": "Question",
                name: "How do I structure the essay?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Intro, Body 1 (claim + counter + mini-conclusion), Body 2 (same), conclusion. Use AI to check flow — not to write paragraphs."
                }
              }
            ]
          }
        ]}
      />
      <Article
        title="Using AI for IB TOK: essays and exhibitions"
        subtitle="AI helps you find examples and test arguments — you still do the TOK linking yourself."
        kicker="IB Diploma"
      >
        <p className="lead">
          TOK asks how we know what we know — abstract by design. The hard part is finding credible
          real-life situations (RLS) and connecting them to knowledge questions (KQ). AI is useful for
          brainstorming and structure checks. The analysis and linking must be yours, or it reads like
          generic encyclopedia prose.
        </p>

        <h2>TOK exhibition: finding objects</h2>
        <p>
          You need three objects linked to one IA prompt (e.g., &ldquo;To what extent is certainty attainable?&rdquo;).
        </p>
        <p>
          <strong>Brainstorm prompt:</strong>
          <br /><em>&ldquo;Prompt: &lsquo;To what extent is certainty attainable?&rsquo; I am interested in physics and history. Suggest five specific, tangible objects — not abstract concepts — for each field.&rdquo;</em>
        </p>
        <p>
          <strong>Example:</strong> Heisenberg&apos;s 1927 uncertainty paper (physics) vs. a 1940 propaganda poster claiming certain victory (history — false certainty).
        </p>

        <h2>TOK essay: counter-claims and perspectives</h2>
        <p>
          Strong essays argue a position, test a counter-claim, then synthesize — not a one-sided essay.
        </p>
        <h3>Workflow</h3>
        <ol>
          <li><strong>Decode the title:</strong> Paste into <Link to="/chatbot">Apex</Link>. <em>&ldquo;What is this title asking? Name key terms and ambiguities.&rdquo;</em></li>
          <li><strong>Find RLS:</strong> <em>&ldquo;Give a real-life situation from the natural sciences in the last five years that challenges the idea that scientific knowledge is permanent.&rdquo;</em></li>
          <li><strong>Develop counter-claims:</strong> <em>&ldquo;I argue emotion is an obstacle to knowledge in history. When is emotion essential for historical understanding?&rdquo;</em></li>
        </ol>

        <h2>Areas of Knowledge (AOK) — methodology prompts</h2>
        <p>
          Use AI to clarify how each AOK builds knowledge:
        </p>
        <ul>
          <li><strong>Mathematics:</strong> Axiomatic deductive reasoning. (&ldquo;How is truth established in maths vs science?&rdquo;)</li>
          <li><strong>History:</strong> Evidence selection and interpretation. (&ldquo;How does historian bias affect source selection?&rdquo;)</li>
          <li><strong>The Arts:</strong> Subjective experience and communication.</li>
        </ul>

        <h2>Warning: generic TOK voice</h2>
        <p>
          TOK examiners penalize vague, flowery language — the kind AI defaults to.
          <br /><strong>Do not</strong> let AI write your essay. Use it for examples and structure checks;
          write the links between RLS, KQ, and AOK yourself.
        </p>

        <h2>FAQ</h2>
        <p><strong>Can I use AI examples?</strong> Yes, but verify them. AI can invent studies or events — Google every RLS before you cite it.</p>
        <p><strong>What if my RLS is too common?</strong> Ask for less overused examples. Flat Earth and Mandela Effect appear on every TOK draft.</p>
        <p><strong>How do I structure the essay?</strong> Intro, two body sections (claim + counter + mini-conclusion each), conclusion. Use AI to check flow — not to write paragraphs.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/chatbot" className="neu-button">Brainstorm RLS</Link>
          <Link to="/answer-reviewer" className="neu-button">Check essay structure</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>IBO (2022): Theory of Knowledge Guide (First Assessment 2022).</li>
          <li>Lagemaat, R. (2015): Theory of Knowledge for the IB Diploma.</li>
        </ul>

        <div className="article-footer">
          Editorial note: TOK is subjective. Use AI to broaden examples, not to replace your reasoning.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/essay-writing-with-ai">Essay writing with AI</Link></li>
          <li><Link to="/resources/ib-math-aa-ai-guide">IB Math AA &amp; AI Guide</Link></li>
          <li><Link to="/resources/is-using-ai-cheating">Is Using AI Cheating?</Link></li>
        </ul>
      </Article>
    </>
  );
}
