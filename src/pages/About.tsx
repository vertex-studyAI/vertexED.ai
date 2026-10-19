import React from "react";
import SEO from "@/components/SEO";
import { ArrowRight, BookOpenCheck, Linkedin, ShieldCheck, Target } from "lucide-react";
import PageSection from "@/components/PageSection";
import { Link } from "react-router";
import '@/styles/about.css';

interface Person {
  name: string;
  fullName?: string;
  role: string;
  linkedin?: string;
}

export default function About(): React.JSX.Element {
  const team: Person[] = [
    {
      name: "Ritayush",
      role: "Co-founder",
    },
    {
      name: "Ryan",
      fullName: "Ryan Gomez",
      role: "Co-founder",
      linkedin: "https://www.linkedin.com/in/ryan-gomez-03701b363/?originalSubdomain=in",
    },
    {
      name: "Pratyush",
      role: "Co-founder",
    },
    {
      name: "Aadi",
      role: "Co-founder",
    },
  ];

  return (
    <>
      <SEO
        title="About VertexED - founding team and story"
        description="Meet the co-founders of VertexED, a learning workspace built for curriculum-led practice, exam preparation and understanding that lasts beyond the paper."
        canonical="https://www.vertexed.app/about"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "VertexED",
            url: "https://www.vertexed.app",
            logo: "https://www.vertexed.app/logo.png",
            foundingDate: "2025",
            founders: team.map((p) => ({
              "@type": "Person",
              name: p.fullName ?? p.name,
              jobTitle: p.role,
              sameAs: p.linkedin ? [p.linkedin] : [],
            })),
          },
        ]}
      />

      <PageSection className="about-page relative px-6 md:px-12">
        <section className="about-hero" aria-labelledby="about-title">
          <div><p className="about-kicker">The work between exams</p><h1 id="about-title">Build the method.<br /><em>Keep the reason.</em></h1></div>
          <div><p>VertexED brings curriculum-led practice, thoughtful feedback and revision into one learning space. The aim is better preparation for the next paper and understanding that remains useful after it.</p><div className="about-actions"><Link to="/features">See the study loop <ArrowRight aria-hidden /></Link><Link to="/signup">Join the private beta</Link></div></div>
        </section>

        <section className="about-principles" aria-labelledby="about-principles-title">
          <header><p className="about-kicker">Product principles</p><h2 id="about-principles-title">A serious workspace<br />for serious study.</h2></header>
          <div>
            <article><Target aria-hidden /><h3>Attempts before applause</h3><p>Show the question, preserve the working and name the first gap. Generic encouragement cannot replace specific feedback.</p></article>
            <article><BookOpenCheck aria-hidden /><h3>Evidence before mastery</h3><p>AI feedback stays provisional. Only independently validated results from a supported evidence path can enter measured weak-topic and retry records.</p></article>
            <article><ShieldCheck aria-hidden /><h3>Learner control</h3><p>Keep saved work recoverable, make AI actions visible and let learners choose what becomes part of their account history.</p></article>
          </div>
        </section>

        <section className="about-team" aria-labelledby="about-team-title">
          <header><p className="about-kicker">Founding team</p><h2 id="about-team-title">Four people,<br />one study problem.</h2><p>VertexED is an independent product. The team cards identify the founders without implying school, board or institutional endorsement.</p></header>
        <div className="about-team-grid">
          {team.map((person) => (
            <article key={person.name} className="about-person">
              <span aria-hidden>{String(team.indexOf(person) + 1).padStart(2, '0')}</span>
              <h3 className="text-xl font-semibold text-foreground mb-2">{person.name}</h3>
              <p className="text-sm text-primary/90 mb-4">{person.role}</p>

              {person.linkedin && (
                <a
                  href={person.linkedin}
                  aria-label={`${person.name} on LinkedIn`}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-border bg-foreground/5 hover:bg-primary/20 hover:border-primary/35 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="h-5 w-5 text-foreground" />
                </a>
              )}
            </article>
          ))}
        </div>
        </section>

      </PageSection>
    </>
  );
}
