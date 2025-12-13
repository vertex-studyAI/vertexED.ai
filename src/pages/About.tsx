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

// Utility component for per-letter hover animations with gradient fix
// Simple text wrapper without animations
// Simple text wrapper without animations
function AnimatedText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent ${className}`}>
      {text}
    </span>
  );
}
    </span>
  );
}
    </span>
  );
}
    >
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block transform transition-transform duration-300 ease-out hover:-translate-y-2"
          style={{ transitionDelay: `${i * 30}ms` }}
          aria-hidden={char === "\u00A0"}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
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

  const isExternal = (url: string) => /^https?:\/\//i.test(url);

  return (
    <>
      <Helmet>
        <title>About Vertex — AI Study Tools</title>
        <meta
          name="description"
          content="Learn about Vertex, the all-in-one AI study tools platform, and the founding team."
        />
        <link rel="canonical" href="https://www.vertexed.app/about" />

        {/* Open Graph */}
        <meta property="og:title" content="About Vertex — AI Study Tools" />
        <meta
          property="og:description"
          content="The story behind Vertex and our mission to help students study smarter."
        />
        <meta property="og:url" content="https://www.vertexed.app/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
      </Helmet>

      <PageSection className="relative px-6 md:px-12">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight">
          <AnimatedText text="About Vertex" />
        </h1>

        {/* Description */}
        <p className="opacity-90 text-lg md:text-xl max-w-3xl leading-relaxed text-gray-200">
          Vertex began as an Oakridge 2025 Codefest idea — three classmates building a seamless AI study workspace. We study at the same school and crafted Vertex to bring planning, notes, flashcards, quizzes, and AI help into one elegant experience. After receiving over $500 in prize money at Bangalore&apos;s largest overnight hackathon for high schoolers, we decided to turn our vision into reality and create the ultimate study companion for students worldwide.
        </p>

        {/* Team Grid */}
        <div className="grid md:grid-cols-3 gap-10 mt-20">
          {team.map((person) => (
            <article
              key={person.name}
              aria-labelledby={`${person.name.replace(/\s+/g, "-").toLowerCase()}-name`}
              className="rounded-3xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300"
            >
              <h3 id={`${person.name.replace(/\s+/g, "-").toLowerCase()}-name`} className="text-xl font-semibold text-white mb-2">
                <AnimatedText text={person.name} />
              </h3>
              <p className="text-sm text-gray-300 mb-4">{person.role}</p>
              <p className="text-sm leading-relaxed text-gray-400 mb-6">{person.bio}</p>

              <div className="flex justify-start gap-3">
                <a
                  href={person.linkedin}
                  aria-label={`${person.name} on LinkedIn`}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors"
                  {...(isExternal(person.linkedin)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <Linkedin className="h-5 w-5 text-white" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Social Footer */}
        <div className="flex flex-col items-center gap-4 mt-20">
          <p className="text-sm text-gray-400">Follow our journey</p>
          <div className="flex gap-6">
            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram"
              className="p-3 rounded-full bg-white/5 backdrop-blur hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500 transition-all"
            >
              <AnimatedText text="IG" />
              <svg className="h-5 w-5 text-gray-300 ml-1 inline-block" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348c1.297 0 2.348 1.051 2.348 2.348s-1.051 2.348-2.348 2.348z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="#"
              aria-label="YouTube"
              className="p-3 rounded-full bg-white/5 backdrop-blur hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 transition-all"
            >
              <AnimatedText text="YT" />
              <svg className="h-5 w-5 text-gray-300 ml-1 inline-block" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </PageSection>
    </>
  );
}
