import React from "react";
import SEO from "@/components/SEO";
import { Linkedin } from "lucide-react";
import PageSection from "@/components/PageSection";

interface Person {
  name: string;
  role: string;
  bio: string;
  linkedin: string;
}

export default function About(): JSX.Element {
  const team: Person[] = [
    {
      name: "Ryan Gomez",
      role: "Co-founder · CFO · Head of AI Product Development",
      bio: `Ryan is a sophomore at Oakridge International School, Bangalore — maximalist in and out of the classroom. Between Model UN awards, international olympiads, published research, and writing on quantum mechanics, he has founded initiatives like Obscured Records, expanded a UNICEF-recognised nonprofit, and run Oakridge Junior Codefest for five years. He still plays football, builds side projects, and learns at a pace that keeps the rest of us honest.`,
      linkedin: "https://www.linkedin.com/in/ryan-gomez-03701b363/?originalSubdomain=in",
    },
    {
      name: "Pratyush Vel Shankar",
      role: "Co-founder · CEO · Head of Vision",
      bio: `Pratyush had the original spark for Vertex — the idea that study tools should feel like one coherent workspace, not a pile of tabs. After winning prize money at Bangalore's largest high-school hackathon and co-founding OneVertex.AI, he leads product vision while balancing perfect PSAT scores, Oakridge's tech club, and the occasional Nintendo session.`,
      linkedin: "#",
    },
    {
      name: "Ritayush Dey",
      role: "Co-founder · CTO · Finance Oversight",
      bio: `Ritayush brings engineering discipline and a bias for shipping. World Scholars Cup awards, cricket captaincy, Trinity Grade 6 music, and organising what aims to be India's largest overnight school-level hackathon — he handles the systems that keep Vertex reliable while the rest of us argue about copy.`,
      linkedin: "#",
    },
  ];

  const isExternal = (url: string) => url.startsWith("http");

  return (
    <>
      <SEO
        title="About Vertex — AI Study Tools"
        description="Learn about Vertex, the all-in-one AI study tools platform, and the founding team."
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
              sameAs: p.linkedin !== "#" ? [p.linkedin] : [],
            })),
          },
        ]}
      />

      <PageSection className="relative px-6 md:px-12">
        <h1 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight brand-text-gradient">
          About Vertex
        </h1>

        <p className="text-lg md:text-xl max-w-3xl leading-relaxed text-muted-foreground">
          Vertex began as a late-night hackathon project — three classmates who wanted planning,
          notes, flashcards, quizzes, and AI help in one place that actually felt good to open. After
          winning prize money at a major overnight student hackathon, we kept building because we
          needed it ourselves during exam season.
        </p>
        <p className="mt-5 text-lg md:text-xl max-w-3xl leading-relaxed text-foreground/90">
          We are not trying to replace teachers or shortcut the work. We are trying to remove the
          friction that makes the work harder than it needs to be — scattered resources, vague
          feedback, and tools that look impressive in a demo but fall apart at midnight before a mock.
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-20">
          {team.map((person) => (
            <article key={person.name} className="rounded-3xl p-8 glass-tile">
              <h3 className="text-xl font-semibold text-foreground mb-2">{person.name}</h3>
              <p className="text-sm text-primary/90 mb-4">{person.role}</p>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">{person.bio}</p>

              <a
                href={person.linkedin}
                aria-label={`${person.name} on LinkedIn`}
                className="inline-flex items-center justify-center h-11 w-11 rounded-full border border-border bg-foreground/5 hover:bg-primary/20 hover:border-primary/35 transition-colors"
                {...(isExternal(person.linkedin)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <Linkedin className="h-5 w-5 text-foreground" />
              </a>
            </article>
          ))}
        </div>
      </PageSection>
    </>
  );
}
