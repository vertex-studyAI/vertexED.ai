import React from "react";
import SEO from "@/components/SEO";
import { Linkedin } from "lucide-react";
import PageSection from "@/components/PageSection";

interface Person {
  name: string;
  role: string;
  bio: string;
  linkedin?: string;
}

export default function About(): React.JSX.Element {
  const team: Person[] = [
    {
      name: "Ryan Gomez",
      role: "Co-founder · CFO · Head of AI Product Development",
      bio: `Ryan leads the AI product and financial planning work behind VertexED. His focus is turning model output into study workflows that label uncertainty, preserve learner work, and remain useful when providers are unavailable.`,
      linkedin: "https://www.linkedin.com/in/ryan-gomez-03701b363/?originalSubdomain=in",
    },
    {
      name: "Pratyush Vel Shankar",
      role: "Co-founder · CEO · Head of Vision",
      bio: `Pratyush leads product vision for VertexED: one coherent workspace for planning, notes, practice, and review instead of a collection of disconnected study tabs.`,
    },
    {
      name: "Ritayush Dey",
      role: "Co-founder · CTO · Finance Oversight",
      bio: `Ritayush leads the engineering systems work: application structure, operational reliability, and the technical decisions needed to turn product ideas into maintainable releases.`,
    },
  ];

  return (
    <>
      <SEO
        title="About VertexED - founding team and story"
        description="VertexED started as a hackathon project between three students who wanted one workspace for exam season - planning, mocks, rubric feedback, and retrieval without tab overload."
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
              description: p.bio,
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
          VertexED began as a late-night hackathon build - three classmates who wanted planning,
          notes, flashcards, timed mocks, and evidence-linked AI feedback in one place they would use during exam season.
          The prototype became an ongoing student-led product because we were still using it
          ourselves the week before mocks.
        </p>
        <p className="mt-5 text-lg md:text-xl max-w-3xl leading-relaxed text-foreground/90">
          We are building study infrastructure, not a teacher replacement. The useful work is practical: keeping materials together,
          making feedback specific, and ensuring saved work is still there when a provider or network connection fails.
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-20">
          {team.map((person) => (
            <article key={person.name} className="rounded-3xl p-8 glass-tile">
              <h3 className="text-xl font-semibold text-foreground mb-2">{person.name}</h3>
              <p className="text-sm text-primary/90 mb-4">{person.role}</p>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">{person.bio}</p>

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
      </PageSection>
    </>
  );
}
