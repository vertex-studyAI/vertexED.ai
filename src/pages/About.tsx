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
  bio?: string;
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
      bio: "Ryan Gomez is a 16 year old who likes to larp being a polymath. He's founded the BU1LD; a machine learning institution which has raised over $50 million in computational credits, assets, grants and valuation of projects with researchers at Stanford, MIT, Nvidia (you get the idea). He runs Finance4all across 20 countries in every continent (except Antarctica for now), Obscured Records: A news agency with over 5 millions reads, and has interned at YC backed companies and VC firms. He also plays football having once travelled to Spain for it, and leads the Model UN Club at his school having won Outstanding Delegate at Harvard MUN, alongside quite a few events and roles as well. He loves Math and has qualified for the AIME with distinction He has a life outside this as well; he likes making pizza, playing mariokart and playing the guitar to name a few.",
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
            <article><BookOpenCheck aria-hidden /><h3>Evidence before mastery</h3><p>AI feedback stays provisional. Only marks confirmed against an accepted source can enter measured weak-topic and retry records.</p></article>
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

        {team.filter((person) => person.bio).map((person) => (
          <section key={person.name} className="about-founder-note" aria-labelledby={`founder-${person.name}`}>
            <div><p className="about-kicker">Founder profile</p><h2 id={`founder-${person.name}`}>{person.fullName ?? person.name}</h2><p className="about-profile-source">Founder-supplied profile preserved from the VertexED repository history. The biographical claims below have not been independently verified by VertexED.</p></div>
            <p>{person.bio}</p>
          </section>
        ))}
      </PageSection>
    </>
  );
}
