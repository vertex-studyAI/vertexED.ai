import { APP_ORIGIN } from '@/lib/appOrigin';
import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router";

export default function BestAIPromptsForStudents() {
  return (
    <>
      <SEO
        title="AI prompts that actually help with revision | VertexED"
        description="Copy-paste prompts for Socratic tutoring, rubric feedback, quiz generation, and essay critique - structured so AI asks first instead of handing you finished answers."
        canonical={`${APP_ORIGIN}/resources/best-ai-prompts-for-students`}
        keywords="AI prompts for students, ChatGPT study prompts, Socratic tutoring prompts, essay feedback prompts, exam revision, VertexED"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "AI prompts that actually help with revision",
            description: "Copy-paste prompts for Socratic tutoring, rubric feedback, quiz generation, and essay critique.",
            author: {
              "@type": "Organization",
              name: "VertexED Team",
              url: `${APP_ORIGIN}`
            },
            publisher: {
              "@type": "Organization",
              name: "VertexED",
              logo: {
                "@type": "ImageObject",
                url: `${APP_ORIGIN}/logo.png`
              }
            },
            datePublished: "2025-12-24",
            dateModified: "2026-10-11"
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Can I save these prompts?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes - keep a small prompt library in your notes app, or use VertexED's built-in templates in Apex."
                }
              },
              {
                "@type": "Question",
                name: "Why does AI sometimes ignore constraints?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "AI may miss a constraint. Restate the question, the relevant source and the constraint: 'You forgot the constraint: [constraint]. Try again.'"
                }
              },
              {
                "@type": "Question",
                name: "Which model is best?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Choose the study interaction you need in Apex. The server selects the configured provider and model; a model name is not a guarantee of a correct answer. Check the working and sources."
                }
              }
            ]
          }
        ]}
      />
      <Article
        title="AI prompts that actually help with revision"
        subtitle="A copy-paste library for maths, sciences, essays, and languages - each prompt keeps you doing the thinking."
        kicker="Guides"
      >
        <p className="lead">
          Give the AI your question, relevant source and current attempt. Ask for one next step, an explanation
          or a practice question, then check the response and retry without help. Here are prompts that fit a real revision week.
        </p>

        <h2>General study prompts</h2>
        <ul className="space-y-4">
          <li className="article-callout">
            <strong>Plain-language check:</strong> &ldquo;Explain [topic] in two sentences a Year 9 student would understand. Then ask me one question to test if I got it.&rdquo;
          </li>
          <li className="article-callout">
            <strong>Core links:</strong> &ldquo;What are the three ideas I need to connect to understand [subject]? How do they link?&rdquo;
          </li>
          <li className="article-callout">
            <strong>High-yield triage:</strong> &ldquo;I have an exam on [subject] in ten days. Here is my topic checklist and the questions I missed: [material]. Help me prioritise revision using only this evidence. Do not predict exam topics or invent past-paper frequencies.&rdquo;
          </li>
        </ul>

        <h2>Math &amp; science prompts</h2>
        <ul className="space-y-4">
          <li className="article-callout">
            <strong>Socratic solver:</strong> &ldquo;I am stuck on this problem: [insert problem]. Don&apos;t give the answer. Ask me one question that helps me find the first step.&rdquo;
          </li>
          <li className="article-callout">
            <strong>Error check:</strong> &ldquo;Here is my working for a physics problem. I got the wrong answer. Check each step against the question and supplied answer key. Identify the first supported error, or say if you cannot locate one. Do not guess why I made it.&rdquo;
          </li>
          <li className="article-callout">
            <strong>Real-world link:</strong> &ldquo;Give one engineering example of [calculus concept] so I understand why we use it on [board] papers.&rdquo;
          </li>
        </ul>

        <h2>Essay &amp; humanities prompts</h2>
        <ul className="space-y-4">
          <li className="article-callout">
            <strong>Counter-argument drill:</strong> &ldquo;Here is my thesis: [thesis]. Argue against it. Give me three strong counter-arguments.&rdquo;
          </li>
          <li className="article-callout">
            <strong>Rubric grader:</strong> &ldquo;Here is the task, my paragraph and the exact marking criterion: [material]. Quote evidence from my paragraph, identify missing support and suggest one revision. Keep any mark provisional.&rdquo;
          </li>
          <li className="article-callout">
            <strong>Precision upgrade:</strong> &ldquo;Rewrite this sentence to sound more academic, but keep the meaning exactly the same: [sentence].&rdquo;
          </li>
        </ul>

        <h2>Language learning prompts</h2>
        <ul className="space-y-4">
          <li className="article-callout">
            <strong>Roleplay practice:</strong> &ldquo;Let&apos;s roleplay. You are a shopkeeper in Madrid. I am a customer. Speak only in Spanish. Correct my grammar in brackets after each response.&rdquo;
          </li>
        </ul>

        <h2>How to write your own prompts</h2>
        <p>
          A useful prompt has three parts:
        </p>
        <ol>
          <li><strong>Context:</strong> Give your course, the question, the source and what you have tried.</li>
          <li><strong>Task:</strong> Ask for an explanation, a hint or one practice question.</li>
          <li><strong>Constraint:</strong> &ldquo;In under 100 words&rdquo;, &ldquo;using an analogy&rdquo;, &ldquo;strictly following the rubric&rdquo;.</li>
        </ol>

        <h2>FAQ</h2>
        <p><strong>Can I save these prompts?</strong> Yes - keep a small library in your notes app, or use VertexED&apos;s built-in templates in Apex.</p>
        <p><strong>Why does AI sometimes ignore constraints?</strong> AI may miss a constraint. Restate the question, the relevant source and the constraint: &ldquo;You forgot the constraint: [constraint]. Try again.&rdquo;</p>
        <p><strong>Which model is best?</strong> Choose the study interaction you need in Apex. The server selects the configured provider and model; a model name is not a guarantee of a correct answer. Check the working and sources.</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/chatbot" className="neu-button">Try these in Apex</Link>
          <Link to="/notetaker" className="neu-button">Summarize notes</Link>
        </div>

        <h2 className="mt-10">Using these prompts in VertexED</h2>
        <ul>
          <li><Link to="/resources/ai-chatbot-tutor">Using Apex: interaction modes, source checks and retries.</Link></li>
          <li><Link to="/resources/ai-answer-reviewer">Answer Reviewer: checking provisional feedback.</Link></li>
        </ul>

        <div className="article-footer">
          Editorial note: Prompts are tools. You still have to do the retrieval and the exam write-up yourself.
          <div className="mt-1">Last updated: 11 October 2026 · Author: VertexED Team</div>
        </div>

        <hr className="article-divider" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/how-to-use-ai-for-studying">How to Use AI for Studying</Link></li>
          <li><Link to="/resources/ai-chatbot-tutor">Using Apex for study help</Link></li>
          <li><Link to="/resources/essay-writing-with-ai">Essay writing with AI</Link></li>
        </ul>
      </Article>
    </>
  );
}
