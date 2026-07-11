import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function MemorizationTechniques() {
  return (
    <>
      <SEO
        title="Memory techniques for exam revision | VertexED"
        description="When to use a memory palace, spaced repetition, or teaching-back — three approaches that match how recall actually works under exam pressure."
        canonical="https://www.vertexed.app/resources/how-to-memorize-anything-fast"
        keywords="how to memorize for exams, memory palace technique, method of loci, spaced repetition, active recall, mnemonics, VertexED, remembering facts"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Memory techniques for exam revision",
            description: "When to use a memory palace, spaced repetition, or teaching-back for exam recall.",
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
                name: "Can I combine them?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes — encode sequences with a memory palace, then put the facts on spaced-repetition flashcards in Notetaker."
                }
              },
              {
                "@type": "Question",
                name: "Why do I forget so fast?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The forgetting curve is steep. You lose a large share of new information within an hour unless you retrieve it soon after learning."
                }
              },
              {
                "@type": "Question",
                name: "Is photographic memory real?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Rarely in the way people imagine. Strong recall usually comes from deliberate techniques, not innate ability."
                }
              }
            ]
          }
        ]}
      />
      <Article
        title="Memory techniques for exam revision"
        subtitle="Memory palace for sequences, spaced repetition for definitions, teaching-back for concepts — pick the tool that fits the material."
        kicker="Study Techniques"
      >
        <p className="lead">
          Your brain retains places and stories more easily than textbook definitions. That is why you
          remember a film plot from years ago but blank on a definition you read yesterday. Different
          exam content needs different techniques — not one generic &ldquo;study harder&rdquo; approach.
        </p>

        <h2>Technique 1: Memory palace (method of loci)</h2>
        <p>
          <strong>Best for:</strong> Lists, sequences, and ordered processes.
        </p>
        <p>
          <strong>How it works:</strong>
          <br />
          1. Pick a familiar place (your house).
          <br />
          2. Place vivid images for each fact along a path.
          <br />
          3. Walk the path in your mind to retrieve the sequence.
        </p>
        <p>
          <strong>Example (first three elements):</strong>
          <br />
          - <em>Hydrogen (H):</em> A <strong>hydra</strong> at the front door.
          <br />
          - <em>Helium (He):</em> A <strong>balloon</strong> lifting the kitchen fridge.
          <br />
          - <em>Lithium (Li):</em> The fridge full of <strong>batteries</strong>.
        </p>

        <h2>Technique 2: Spaced repetition (SRS)</h2>
        <p>
          <strong>Best for:</strong> Vocabulary, definitions, and formulas.
        </p>
        <p>
          <strong>How it works:</strong> Review at increasing intervals (1 day, 3 days, 1 week, 1 month).
          <br />
          <strong>In VertexED:</strong> Send decks to the <Link to="/planner">Planner</Link> — it schedules
          reviews before you would otherwise forget.
        </p>

        <h2>Technique 3: Teaching back (Feynman method)</h2>
        <p>
          <strong>Best for:</strong> Complex concepts — quantum topics, economics models, long biology pathways.
        </p>
        <p>
          <strong>How it works:</strong> Explain the idea in plain language. Where you stumble, you do not know it yet.
          <br />
          <strong>With AI:</strong> Teach <Link to="/chatbot">Apex</Link>: &ldquo;I am going to explain photosynthesis. Correct me if I am wrong.&rdquo;
        </p>

        <h2>Which one should I use?</h2>
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <div className="article-callout">
            <h3 className="text-xl font-bold text-green-400 mt-0">Memory palace for&hellip;</h3>
            <ul className="space-y-2 text-sm">
              <li>History timelines</li>
              <li>Biology processes (Krebs cycle)</li>
              <li>Speeches and ordered lists</li>
            </ul>
          </div>
          <div className="article-callout">
            <h3 className="text-xl font-bold text-blue-400 mt-0">Spaced repetition for&hellip;</h3>
            <ul className="space-y-2 text-sm">
              <li>Language vocabulary</li>
              <li>Math formulas</li>
              <li>Chemical equations</li>
            </ul>
          </div>
        </div>

        <h2>FAQ</h2>
        <p><strong>Can I combine them?</strong> Yes — encode sequences with a memory palace, then put the facts on spaced-repetition flashcards in <Link to="/notetaker">Notetaker</Link>.</p>
        <p><strong>Why do I forget so fast?</strong> The forgetting curve is steep. Retrieve new material within a day or two, not at the end of the unit.</p>
        <p><strong>Is photographic memory real?</strong> Rarely as people imagine. Strong recall usually comes from deliberate practice, not innate ability.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/notetaker" className="neu-button">Create flashcards</Link>
          <Link to="/planner" className="neu-button">Schedule spaced review</Link>
        </div>

        <h2 className="mt-10">Evidence &amp; references</h2>
        <ul>
          <li>Foer, J. (2011): Moonwalking with Einstein.</li>
          <li>Maguire, E. A. et al. (2000): Navigation-related structural change in the hippocampi of taxi drivers.</li>
        </ul>

        <div className="article-footer">
          Editorial note: Match the technique to the material. Retrieval beats rereading on exam day.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/active-recall-spaced-repetition">Active Recall &amp; Spaced Repetition</Link></li>
          <li><Link to="/resources/notes-to-flashcards">From Notes to Flashcards</Link></li>
          <li><Link to="/resources/how-to-cram-effectively">How to Cram Effectively</Link></li>
        </ul>
      </Article>
    </>
  );
}
