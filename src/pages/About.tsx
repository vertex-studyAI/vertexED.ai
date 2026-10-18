import React from "react";
import SEO from "@/components/SEO";
import { ArrowRight, ArrowUpRight, BookOpenCheck, Linkedin, ShieldCheck, Target } from "lucide-react";
import PageSection from "@/components/PageSection";
import { Link } from "react-router";
import { BU1LD_PROJECT_PAGES, FOUNDER_PROJECT_DESTINATIONS } from "@/content/founderPortfolio";
import '@/styles/about.css';

interface Person {
  name: string;
  fullName?: string;
  role: string;
  bio?: React.ReactNode;
  linkedin?: string;
}

const projectLinkProps = {
  className: "about-project-link",
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

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
      bio: <>
        <p>Ryan Gomez is 16 and, in his own words, likes to “LARP as a polymath”. He founded <a href="https://thebu1ld.com/" {...projectLinkProps}>the BU1LD</a>, described in the original profile as a machine-learning institution associated with more than $50 million in computational credits, assets, grants and project valuations, alongside researchers at Stanford, MIT and Nvidia.</p>
        <p>The founder-supplied profile also describes <a href="https://finance4all-global-reach.vercel.app/" {...projectLinkProps}>Finance4all</a> as operating across 20 countries on every continent except Antarctica, and <a href="https://obscured-records-tawny.vercel.app/" {...projectLinkProps}>Obscured Records</a> as a news agency with more than five million reads. It records internships at Y Combinator-backed companies and venture-capital firms.</p>
        <p>Outside those projects, Ryan plays football, has travelled to Spain for the sport, and leads his school&apos;s Model UN Club. The profile records an Outstanding Delegate award at Harvard Model United Nations and AIME qualification with distinction. He also enjoys making pizza, playing Mario Kart and playing guitar.</p>
      </>,
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
            <div><p className="about-kicker">Founder profile</p><h2 id={`founder-${person.name}`}>{person.fullName ?? person.name}</h2><p className="about-profile-source">Edited for readability from a founder-supplied profile in the VertexED repository history. The biographical claims below have not been independently verified by VertexED.</p></div>
            <div className="about-founder-bio">{person.bio}</div>
          </section>
        ))}

        <section className="about-project-directory" aria-labelledby="project-directory-title">
          <header>
            <div><p className="about-kicker">Project webpages</p><h2 id="project-directory-title">Follow the work<br /><em>to its own page.</em></h2></div>
            <div className="about-project-directory-intro"><p>Public destinations and project records across the organisations named in the founder profile. A listing does not establish personal authorship, production readiness, scientific validity or institutional endorsement.</p><Link to="/projects">Search and filter the complete directory <ArrowRight aria-hidden /></Link></div>
          </header>

          <div className="about-project-group">
            <div className="about-project-group-heading"><h3>Products and organisations</h3><span>{FOUNDER_PROJECT_DESTINATIONS.length} webpages</span></div>
            <ul className="about-project-list">
              {FOUNDER_PROJECT_DESTINATIONS.map((project) => (
                <li key={project.href}>
                  <a href={project.href} target="_blank" rel="noopener noreferrer">
                    <span><strong>{project.name}</strong><small>{project.descriptor}</small></span>
                    <ArrowUpRight aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="about-project-group">
            <div className="about-project-group-heading"><h3>BU1LD project pages</h3><span>{BU1LD_PROJECT_PAGES.length} webpages</span></div>
            <div className="about-project-feature">
              <div><strong>Fourteen public research and programme pages</strong><p>Move into the dedicated directory to search the project names, descriptions and destinations without turning the founder story into a second catalog.</p></div>
              <Link to="/projects?group=bu1ld">Browse all {BU1LD_PROJECT_PAGES.length} project pages <ArrowRight aria-hidden /></Link>
            </div>
            <a className="about-project-catalog" href="https://thebu1ld.com/projects" target="_blank" rel="noopener noreferrer">Open the source BU1LD catalog <ArrowUpRight aria-hidden /></a>
          </div>
        </section>
      </PageSection>
    </>
  );
}
