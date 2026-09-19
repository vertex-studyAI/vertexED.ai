import React from "react";
import SEO from "@/components/SEO";
import { Linkedin } from "lucide-react";
import PageSection from "@/components/PageSection";

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
              name: p.name,
              jobTitle: p.role,
              sameAs: p.linkedin ? [p.linkedin] : [],
            })),
          },
        ]}
      />

      <PageSection className="relative px-6 md:px-12">
        <h1 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight brand-text-gradient">
          About VertexED
        </h1>

        <p className="text-lg md:text-xl max-w-3xl leading-relaxed text-muted-foreground">
          Better preparation for the next exam. Deeper understanding for what comes after it.
          VertexED brings curriculum-led practice, thoughtful feedback and revision into one learning space.
          Our purpose is to help students strengthen their exam performance while building knowledge
          they can retain, connect and use in everyday life.
        </p>
        <p className="mt-5 text-lg md:text-xl max-w-3xl leading-relaxed text-foreground/90">
          We are building study infrastructure, not a teacher replacement. The useful work is practical: keeping materials together,
          making feedback specific, and ensuring saved work is still there when a provider or network connection fails.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {team.map((person) => (
            <article key={person.name} className="rounded-3xl p-8 glass-tile">
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
        {team.filter(person => person.bio).map(person => (
          <article key={person.name} className="mt-12 max-w-4xl border-t border-border pt-10">
            <p className="text-sm text-primary mb-3">Meet the co-founders</p>
            <h2 className="text-3xl font-semibold mb-6">{person.fullName ?? person.name}</h2>
            <p className="text-base md:text-lg leading-loose text-muted-foreground">{person.bio}</p>
          </article>
        ))}
      </PageSection>
    </>
  );
}
