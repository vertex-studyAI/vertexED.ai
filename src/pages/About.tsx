import { Helmet } from "react-helmet-async";
import { Linkedin } from "lucide-react";
import PageSection from "@/components/PageSection";

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Vertex — AI Study Tools</title>
        <meta
          name="description"
          content="Learn about Vertex, the all-in-one AI study tools platform, and the founding team."
        />
        <link rel="canonical" href="https://www.vertexed.app/about" />
        <meta property="og:title" content="About Vertex — AI Study Tools" />
        <meta
          property="og:description"
          content="The story behind Vertex and our mission to help students study smarter."
        />
        <meta property="og:url" content="https://www.vertexed.app/about" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://www.vertexed.app/socialpreview.jpg"
        />
      </Helmet>

      <PageSection className="relative">
        <h1 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          About Vertex
        </h1>
        <p className="opacity-90 text-lg md:text-xl max-w-3xl leading-relaxed">
          Vertex began as an Oakridge 2025 Codefest idea — three classmates
          building a seamless AI study workspace. We study at the same school
          and crafted Vertex to bring planning, notes, flashcards, quizzes, and
          AI help into one elegant experience. After receiving over $500 in
          prize money at Bangalore&apos;s largest overnight hackathon for high
          schoolers, we decided to turn our vision into reality and create the
          ultimate study companion for students worldwide.
        </p>

        {/* Team grid */}
        <div className="grid md:grid-cols-3 gap-10 mt-20">
          {[
            {
              name: "Ryan Gomez",
              role: "Co-founder · CFO · Head of AI Product Development",
              bio: `Ryan Gomez is a Sophomore at Oakridge International School Bangalore with a passion for creating. Whilst winning awards at international model UN conferences and regional olympiads, he has founded initiatives and startups like obscured records, finance_debriefed and Oakridge Junior Codefest. He has also played international football, written books on quantum mechanics, and been a champion scholar at the World Scholars Cup.`,
              linkedin:
                "https://www.linkedin.com/in/ryan-gomez-03701b363/?originalSubdomain=in",
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
          ].map((person) => (
            <div
              key={person.name}
              className="rounded-3xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300"
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                {person.name}
              </h3>
              <p className="text-sm text-gray-300 mb-4">{person.role}</p>
              <p className="text-sm leading-relaxed text-gray-400 mb-6">
                {person.bio}
              </p>
              <div className="flex justify-start gap-3">
                <a
                  href={person.linkedin}
                  aria-label={`${person.name} on LinkedIn`}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gray-700 to-gray-900 p-3 hover:from-blue-500 hover:to-indigo-500 transition-all"
                >
                  <Linkedin className="h-4 w-4 text-white" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Social footer */}
        <div className="flex flex-col items-center gap-4 mt-20">
          <p className="text-sm text-gray-400">Follow our journey</p>
          <div className="flex gap-6">
            <a
              href="#"
              aria-label="Instagram"
              className="p-3 rounded-full bg-white/5 backdrop-blur hover:bg-gradient-to-r hover:from-pink-500 hover:to-yellow-500 transition-all"
            >
              <svg
                className="h-5 w-5 text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348c1.297 0 2.348 1.051 2.348 2.348s-1.051 2.348-2.348 2.348z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="p-3 rounded-full bg-white/5 backdrop-blur hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 transition-all"
            >
              <svg
                className="h-5 w-5 text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </PageSection>
    </>
  );
}
