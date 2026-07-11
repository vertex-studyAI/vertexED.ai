import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function IsUsingAICheating() {
  return (
    <>
      <SEO
        title="Is using AI cheating? A student guide to academic integrity | VertexED"
        description="Where AI crosses into plagiarism — finished essays, exam use, fake citations — and where it stays on the right side: brainstorming, Socratic help, and rubric feedback."
        canonical="https://www.vertexed.app/resources/is-using-ai-cheating"
        keywords="is using AI cheating, AI plagiarism, Turnitin AI detection, academic integrity AI, ChatGPT in schools, ethical AI use for students, university AI policies, VertexED"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Is using AI cheating? A student guide to academic integrity",
            description: "The line between AI-assisted learning and plagiarism — and how school policies treat each.",
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
                name: "Will VertexED get me banned?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "VertexED is built for study — quizzes, planning, rubric feedback — not for generating work you submit as your own."
                }
              },
              {
                "@type": "Question",
                name: "Can teachers tell if I used AI?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Often yes — not always via detectors, but because voice and vocabulary shift. If your essay suddenly uses words you never use in class, it raises questions."
                }
              },
              {
                "@type": "Question",
                name: "What if I'm falsely accused?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Stay calm. Show document version history, planning notes, and be ready to discuss the material verbally."
                }
              }
            ]
          }
        ]}
      />
      <Article
        title="Is using AI cheating?"
        subtitle="The line between study help and academic misconduct — and what exam boards actually care about."
        kicker="Ethics &amp; Policy"
      >
        <p className="lead">
          &ldquo;Is using AI cheating?&rdquo; depends on what you are doing with it — like a calculator in
          a mental maths test vs a calculus exam. Copy-pasting a finished essay is misconduct. Using AI to
          explain a concept, stress-test a thesis, or read rubric feedback is a different category — and
          many schools now allow it for revision with disclosure.
        </p>

        <h2>What counts as cheating</h2>
        <p>
          These will get you flagged by Turnitin or disqualified by IB, College Board, or Cambridge:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Copy-pasting essays:</strong> Asking ChatGPT to write your Hamlet essay and submitting it unchanged.</li>
          <li><strong>AI during exams:</strong> Using a chatbot in a timed, closed-book assessment.</li>
          <li><strong>Fake citations:</strong> AI-generated bibliographies — models often invent books that do not exist.</li>
        </ul>

        <h2>What usually counts as ethical use</h2>
        <p>
          Many schools encourage these during revision. This is where <Link to="/signup">VertexED</Link> sits.
        </p>
        
        <h3>1. Ideation and brainstorming</h3>
        <p>
          <strong>Example prompt:</strong> &ldquo;I need to write about WWI causes. Give five thesis angles focused on economic factors.&rdquo;
          <br /><em>Why it is usually fine:</em> You still write the essay; AI sparks options.
        </p>

        <h3>2. Socratic tutoring</h3>
        <p>
          <strong>Example prompt:</strong> &ldquo;I do not understand opportunity cost. Explain it with a video-game example.&rdquo;
          <br /><em>Why it is usually fine:</em> You are learning, not bypassing the task.
        </p>

        <h3>3. Feedback and critique</h3>
        <p>
          <strong>Example prompt:</strong> &ldquo;Here is my draft. Where is my argument weak?&rdquo;
          <br /><em>Why it is usually fine:</em> Similar to asking a teacher or peer to proofread.
        </p>

        <h2>AI detectors (Turnitin, GPTZero)</h2>
        <p>
          False positives worry students. Here is the practical picture:
        </p>
        <ul>
          <li><strong>How they work:</strong> They look for predictable, uniform prose — common in AI output, less common in messy human drafts.</li>
          <li><strong>The risk:</strong> Generic writing you wrote yourself can still look suspicious.</li>
          <li><strong>Protection:</strong> Write in your own voice. Use specific class references and anecdotes. Keep Google Docs version history.</li>
        </ul>

        <h2>How to cite AI</h2>
        <p>
          If AI contributed significantly (e.g., a data visualization you relied on), cite it.
          <br /><strong>MLA example:</strong> &ldquo;Describe the symbolism of the green light.&rdquo; <em>ChatGPT</em>, OpenAI, 24 Dec. 2025, chat.openai.com.
        </p>

        <h2>FAQ</h2>
        <p><strong>Will VertexED get me banned?</strong> VertexED is built for study — quizzes, planning, rubric feedback — not for generating work you submit as your own.</p>
        <p><strong>Can teachers tell if I used AI?</strong> Often yes — voice and vocabulary shift. Sudden formal diction you never use in class raises questions.</p>
        <p><strong>What if I&apos;m falsely accused?</strong> Show version history, planning notes, and discuss the material verbally.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/answer-reviewer" className="neu-button">Get rubric feedback</Link>
          <Link to="/chatbot" className="neu-button">Brainstorm ideas</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>IBO (2023): Academic Integrity Policy — Appendix on Artificial Intelligence.</li>
          <li>Turnitin (2024): The False Positive Problem in AI Detection.</li>
          <li>UNESCO (2023): Guidance for Generative AI in Education.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Policies change quickly. Check your school or university handbook.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/essay-writing-with-ai">Essay writing with AI</Link></li>
          <li><Link to="/resources/how-to-use-ai-for-studying">How to Use AI for Studying</Link></li>
          <li><Link to="/resources/best-ai-study-tools-2025">Best AI Study Tools 2025</Link></li>
        </ul>
      </Article>
    </>
  );
}
