import React from "react";
import Article from "@/components/Article";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function AcademicBurnoutGuide() {
  return (
    <>
      <SEO
        title="Academic Burnout: Signs, Symptoms & Recovery Guide | VertexED"
        description="Feeling exhausted? You might be burnt out. Learn the difference between stress and burnout, and discover the 'Minimum Viable Studying' method to recover."
        canonical="https://www.vertexed.app/resources/academic-burnout-guide"
        keywords="academic burnout, student burnout, study motivation, mental health for students, recovering from burnout, minimum viable studying, VertexED, exam stress"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Academic Burnout: Signs, Symptoms, and How to Recover",
            description: "Feeling exhausted? You might be burnt out. Learn the difference between stress and burnout.",
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
                name: "Should I take a gap year?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "That's a big decision. Try a 'gap week' first. Complete detachment for 7 days often provides clarity."
                }
              },
              {
                "@type": "Question",
                name: "Is it my fault?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. The modern education system is a pressure cooker. Burnout is a systemic response to chronic stress."
                }
              },
              {
                "@type": "Question",
                name: "How do I explain this to my parents?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Show them the data. Explain that rest is productive. 'I am resting now so I can sprint later.'"
                }
              }
            ]
          }
        ]}
      />
      <Article
        title="Academic Burnout: Signs, Symptoms, and How to Recover"
        subtitle="You aren't 'lazy'. You are exhausted. Here is how to spot the signs of burnout and a practical roadmap to getting your spark back."
        kicker="Mental Health"
      >
        <p className="lead">
          There is a difference between "tired" and "burnt out." 
          Tiredness is fixed by sleep. Burnout is not. 
          If you feel cynical, detached, and ineffective even after a weekend off, you are likely in the burnout zone.
        </p>

        <h2>The 3 Dimensions of Burnout</h2>
        <p>
          According to the Maslach Burnout Inventory, burnout has three components:
        </p>
        <ol>
          <li><strong>Exhaustion:</strong> Emotional and physical draining. "I can't face another day."</li>
          <li><strong>Cynicism (Depersonalization):</strong> Feeling detached from your studies. "None of this matters. It's all pointless."</li>
          <li><strong>Inefficacy:</strong> Feeling like you can't achieve anything. "No matter how hard I try, I fail."</li>
        </ol>

        <h2>The Recovery Strategy: "Minimum Viable Studying" (MVS)</h2>
        <p>
          When you are burnt out, your instinct is to stop everything. But stopping completely can cause anxiety about falling behind.
          Instead, switch to MVS.
        </p>
        <p>
          <strong>The Rule:</strong> Do the absolute bare minimum required to not fail.
        </p>
        <ul>
          <li><strong>Stop:</strong> Making beautiful notes, reading extra chapters, aiming for 100%.</li>
          <li><strong>Start:</strong> Doing <em>just</em> the homework. Using <Link to="/notetaker">AI to summarize</Link> readings instead of doing them manually.</li>
        </ul>
        <p>
          Use <Link to="/planner">VertexED Planner</Link> to set your intensity to "Low". The AI will strip your schedule down to the essentials.
        </p>

        <h2>The "Input Deprivation" Week</h2>
        <p>
          Your brain is over-stimulated.
          <br /><strong>Challenge:</strong> For one week, remove all "cheap dopamine" (TikTok, Reels, Shorts) during study breaks. 
          Replace them with "boredom" (walking, staring at a wall, napping). 
          Boredom is the reset button for your dopamine receptors.
        </p>

        <h2>Using AI to Reduce Cognitive Load</h2>
        <p>
          Burnout is often caused by "decision fatigue."
          <br /><strong>Let AI decide:</strong> Don't wake up and ask "What should I study?" 
          Let the <Link to="/planner">Planner</Link> tell you. Removing the <em>decision</em> saves energy for the <em>action</em>.
        </p>

        <h2>FAQ</h2>
        <p><strong>Should I take a gap year?</strong> That's a big decision. Try a "gap week" first. Complete detachment for 7 days often provides clarity.</p>
        <p><strong>Is it my fault?</strong> No. The modern education system is a pressure cooker. Burnout is a systemic response to chronic stress.</p>
        <p><strong>How do I explain this to my parents?</strong> Show them the data. Explain that rest is productive. "I am resting now so I can sprint later."</p>

        <div className="not-prose mt-8 flex gap-3 flex-wrap">
          <Link to="/planner" className="neu-button">Set Low Intensity Plan</Link>
          <Link to="/study-zone" className="neu-button">Focus Timer (Pomodoro)</Link>
        </div>

        <h2 className="mt-10">Evidence & references</h2>
        <ul>
          <li>Maslach, C., & Leiter, M. P. (2016): Understanding the burnout experience: recent research and its implications for psychiatry.</li>
          <li>Huberman, A. (2023): Dopamine Nation — understanding the role of dopamine in motivation and fatigue.</li>
        </ul>

        <div className="mt-8 text-xs text-slate-400 border-t border-white/10 pt-4">
          Editorial note: We are an AI company, not doctors. If you are struggling with severe mental health issues, please seek professional help.
          <div className="mt-1">Last updated: 2025-12-24 · Author: VertexED Team</div>
        </div>

        <hr className="my-8 border-white/10" />
        <h3>Related guides</h3>
        <ul>
          <li><Link to="/resources/exam-strategy-time-management">Exam Strategy & Time Management</Link></li>
          <li><Link to="/resources/how-to-cram-effectively">How to Cram Effectively</Link></li>
          <li><Link to="/resources/ai-study-planner">AI Study Planner & Calendar</Link></li>
        </ul>
      </Article>
    </>
  );
}
