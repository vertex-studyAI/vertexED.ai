import { Helmet } from "react-helmet-async";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";
import { Github, Linkedin, Globe } from "lucide-react";

export default function About() {
  return (
    <>
      <Helmet>
        <title>Vertex — About</title>
        <meta name="description" content="Learn about the origins of Vertex and the founding team." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/about'} />
      </Helmet>

      <PageSection>
        <h1 className="text-3xl md:text-4xl font-semibold mb-6 brand-text-gradient">About Vertex</h1>
        <p className="opacity-90 text-base md:text-lg mb-8">
          Vertex began as an Oakridge 2025 Codefest idea — three classmates building a seamless AI study workspace. We study at the same school and crafted Vertex to bring planning, notes, flashcards, quizzes, and AI help into one elegant experience. After receiving over $500 in prize money at Bangalore's largest overnight hackathon for high schoolers, we decided to turn our vision into reality and create the ultimate study companion for students worldwide.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <NeumorphicCard className="p-8 text-center min-h-96" title="Ryan Gomez" info="Co‑founder & Creative Director">
            <p className="text-sm opacity-80 mb-6 text-left leading-relaxed">
              Ryan Gomez is a Sophomore at Oakridge International School Bangalore with a passion for creating. Whilst winning awards at international model UN conferences and regional olympiads, he has founded initiatives and startups like obscured records, finance_debriefed and even oak-ridges junior codefest. Whilst also having played international level football, writing books on quantum mechanics and being a champion scholar at the world scholars cup he enjoys his time on CFB 25 and playing the Guitar. He also loves working at various startups and projects.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a href="#" aria-label="Ryan on LinkedIn" className="neu-button px-3 py-2"><Linkedin className="h-4 w-4" /></a>
            </div>
          </NeumorphicCard>
          
          <NeumorphicCard className="p-8 text-center min-h-96" title="Pratyush Vel Shankar" info="Co‑founder & CEO">
            <p className="text-sm opacity-80 mb-6 text-left leading-relaxed">
              Pratyush Vel Shankar is Sophomore at Oakridge International School Bangalore, who had the core idea months before you saw this website. After receiving over $500 in prize money for coding Vertex during Bangalores largest overnight hackathon for high schoolers, he proceeded to co-found OneVertex.AI. Whilst also receiving perfect PSAT scores, leading Oakridges tech club and winning awards in various olympiads he explores his free time through playing on the Nintendo switch or simply coding another big idea. He also excels at math competitions as well.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a href="#" aria-label="Pratyush on LinkedIn" className="neu-button px-3 py-2"><Linkedin className="h-4 w-4" /></a>
            </div>
          </NeumorphicCard>
          
          <NeumorphicCard className="p-8 text-center min-h-96" title="Ritayush Dey" info="Co‑founder & CTO">
            <p className="text-sm opacity-80 mb-6 text-left leading-relaxed">
              Ritayush Dey is Sophomore at Oakridge International School Bangalore who is in love with excellence. Whilst also winning awards at the world scholars cup, leading Oakridges tech club, receiving 7's in MYP Spanish extended and receiving honours in olympiads, he also pursues guitar at trinity grade 6 and loves tutoring the rest of the peers in his free time. He also is a national level cricketer, whilst also having captaining Oakridges high school cricket team numeorus times when he was still in junior high. He is also currently organising India's largest overnight school-level hackathon.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a href="#" aria-label="Ritayush on LinkedIn" className="neu-button px-3 py-2"><Linkedin className="h-4 w-4" /></a>
            </div>
          </NeumorphicCard>
        </div>
        
  <div className="flex items-center justify-center gap-6 mt-12">
          <p className="text-sm opacity-70">Follow our journey:</p>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="neu-button px-3 py-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348c1.297 0 2.348 1.051 2.348 2.348s-1.051 2.348-2.348 2.348z"/>
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className="neu-button px-3 py-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </PageSection>
    </>
  );
}

