import React from "react";
import { Helmet } from "react-helmet-async";
import { Linkedin } from "lucide-react";
import PageSection from "@/components/PageSection";

interface Person {
  name: string;
  role: string;
  bio: string;
  linkedin: string;
}

// Simple text wrapper (NO animations)
function AnimatedText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent ${className}`}>
      {text}
    </span>
  );
}

export default function About(): JSX.Element {
  const team: Person[] = [
    {
      name: "Ryan Gomez",
      role: "Co-founder · CFO · Head of AI Product Development",
      bio: `Ryan Gomez is a Sophomore at the Oakridge International School of Bangalore with a passion for being a maximalist especially outside the classroom. Whilst receiving awards at various International Model UN conferences and being a champion scholar, international olympiads and having his research published internationally whilst being an author of a quantum mechanics book, he has founded initiatives like obscured records, expanded upon a UNICEF recognised non profit and has ran Oakridge Junior codefest for 5 years running now. He has also played international football and works at various projects like he’s the next Soham Parekh. In his “free time”, he loves to explore his hobbies like the guitar or work on his assortment of projects. He also loves learning at an astronomical rate per se.`,
      linkedin: "https://www.linkedin.com/in/ryan-gomez-03701b363/?originalSubdomain=in",
    },
    {
      name: "Pratyush Vel Shankar",
      role: "Co-founder · CEO · Head of Vision",
      bio: `Pratyush Vel Shankar is a Sophomore at Oakridge who had the core idea behind Vertex. After winning $500 in Bangalore’s largest hackathon, he co-founded OneVertex.AI. With perfect PSAT scores, leading Oakridge’s tech club, and winning Olympiads, he spends his free time coding big ideas or playing on his Nintendo Switch.`,
      linkedin: "#",
    },
    {
      name: "Ritayush Dey",
      role: "Co-founder · CTO · Finance Oversight",
      bio: `Ritayush Dey is a Sophomore at Oakridge with a love for excellence. He has won awards at World Scholars Cup, captained Oakridge’s cricket team, and pursued music at Trinity Grade 6. Alongside academics and leadership, he is currently organizing India’s largest overnight school-level hackathon.`,
      linkedin: "#",
    },
  ];

  // simple + safe external link check (NO regex escaping issues)
  const isExternal = (url: string) => url.startsWith("http");

  return (
    <>
      <Helmet>
        <title>About Vertex — AI Study Tools</title>
        <meta
          name="description"
          content="Learn about Vertex, the all-in-one AI study tools platform, and the founding team."
        />
        <link rel="canonical" href="https://www.vertexed.app/about" />
      </Helmet>

      <PageSection className="relative px-6 md:px-12">
        <h1 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight">
          <AnimatedText text="About Vertex" />
        </h1>

        <p className="opacity-90 text-lg md:text-xl max-w-3xl leading-relaxed text-gray-200">
          Vertex began as an Oakridge 2025 Codefest idea — three classmates building a seamless AI study workspace. We study at the same school and crafted Vertex to bring planning, notes, flashcards, quizzes, and AI help into one elegant experience. After receiving over $500 in prize money at Bangalore&apos;s largest overnight hackathon for high schoolers, we decided to turn our vision into reality and create the ultimate study companion for students worldwide.
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-20">
          {team.map((person) => (
            <article
              key={person.name}
              className="rounded-3xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                <AnimatedText text={person.name} />
              </h3>
              <p className="text-sm text-gray-300 mb-4">{person.role}</p>
              <p className="text-sm leading-relaxed text-gray-400 mb-6">{person.bio}</p>

              <a
                href={person.linkedin}
                aria-label={`${person.name} on LinkedIn`}
                className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors"
                {...(isExternal(person.linkedin)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <Linkedin className="h-5 w-5 text-white" />
              </a>
            </article>
          ))}
        </div>
      </PageSection>
    </>
  );
}
