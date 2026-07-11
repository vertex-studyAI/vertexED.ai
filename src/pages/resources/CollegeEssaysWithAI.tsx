import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function CollegeEssaysWithAI() {
  return (
    <>
      <SEO
        title="College essays with AI: Common App and Personal Statement | VertexED"
        description="Use AI to mine memories, spot clichés, and check structure — while keeping a voice admissions officers can tell is yours."
        canonical="https://www.vertexed.app/resources/college-essays-with-ai"
        keywords="college essay AI, Common App essay AI, UCAS personal statement AI, university application help, AI for admissions essays, brainstorming college essays, VertexED, ethical AI for college prep"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "College essays with AI: keep your voice",
            description: "Use AI to brainstorm, structure, and refine your Common App or UCAS Personal Statement without losing your unique voice.",
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
                name: "Do colleges check for AI?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Some do. Even without detectors, generic AI prose — perfect grammar, no specific detail — reads differently from a real 17-year-old's draft."
                }
              },
              {
                "@type": "Question",
                name: "Can I use AI for supplemental essays?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, for research and structure — e.g., finding specific professors or clubs for a 'Why Us?' essay. You still write the sentences."
                }
              },
              {
                "@type": "Question",
                name: "Should I mention AI in my essay?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Generally no — unless building AI is genuinely central to your application story."
                }
              }
            ]
          }
        ]}
      />
      <Article
        title="College essays with AI: keep your voice"
        subtitle="Admissions officers read thousands of drafts. AI can help you find your story — not replace it."
        kicker="University Prep"
      >
        <p className="lead">
          The Common App essay or UCAS Personal Statement is where grades stop speaking and you start.
          Asking ChatGPT to write the whole piece produces flat, interchangeable prose. Using AI to
          interview you, flag clichés, and check structure is different — and usually defensible if your
          school allows AI for brainstorming.
        </p>

        <h2>Phase 1: Memory mining</h2>
        <p>
          When you do not know what to write about, treat AI like an interviewer — not a ghostwriter.
          <br /><em>&ldquo;I need a personal statement about resilience. Ask me ten probing questions about my childhood, hobbies, and failures — one at a time.&rdquo;</em>
        </p>

        <h2>Phase 2: Cliché check</h2>
        <p>
          Admissions teams see the same stories repeatedly — sports injury comeback, generic service trip.
          <br /><strong>Prompt:</strong> &ldquo;I am thinking of writing about [topic]. What clichés attach to this? How could I make it specific to me?&rdquo;
        </p>

        <h2>Phase 3: Structure and flow</h2>
        <p>
          Let AI suggest the skeleton; you write the sentences.
          <br /><strong>Prompt:</strong> &ldquo;I have three anecdotes: [A, B, C]. Suggest a narrative arc linking them around [theme].&rdquo;
        </p>

        <h2>Phase 4: Show, don&apos;t tell</h2>
        <p>
          Paste a paragraph into <Link to="/answer-reviewer">Answer Reviewer</Link>:
          <br /><em>&ldquo;Highlight where I am telling (e.g., &lsquo;I was hardworking&rsquo;) and suggest how to show it with a specific scene.&rdquo;</em>
        </p>

        <h2>The voice test</h2>
        <p>
          Read your draft aloud. Then ask AI:
          <br /><em>&ldquo;Does this sound like a 17-year-old student or generic formal prose? Flag unnatural phrases.&rdquo;</em>
        </p>

        <h2>FAQ</h2>
        <p><strong>Do colleges check for AI?</strong> Some do. Even without detectors, generic AI prose — perfect grammar, no specific detail — reads differently from a real draft.</p>
        <p><strong>Can I use AI for supplemental essays?</strong> Yes, for research and structure — especially &ldquo;Why Us?&rdquo; essays where you need specific professors or clubs. You still write the sentences.</p>
        <p><strong>Should I mention AI in my essay?</strong> Generally no — unless building AI is genuinely central to your application story.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/chatbot" className="neu-button">Brainstorm topics</Link>
          <Link to="/answer-reviewer" className="neu-button">Check for clichés</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>Georgia Tech Admissions Blog (2024): AI and the College Essay.</li>
          <li>The College Essay Guy: How to use ChatGPT ethically for college essays.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Your story is yours. AI should sharpen it, not flatten it.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/alevel-ap-exam-prep">A-Level &amp; AP Exam Prep</Link></li>
          <li><Link to="/resources/essay-writing-with-ai">Essay writing with AI</Link></li>
          <li><Link to="/resources/is-using-ai-cheating">Is Using AI Cheating?</Link></li>
        </ul>
      </Article>
    </>
  );
}
