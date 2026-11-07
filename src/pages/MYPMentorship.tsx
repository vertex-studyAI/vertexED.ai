import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import SEO from '@/components/SEO';
import { PUBLIC_INTAKE_ROUTES } from '@/lib/intakeRoutes.mjs';
import '@/styles/myp-mentorship.css';

const questions = [
  {
    question: 'Is the mentoring free?',
    answer: 'Yes. This is a volunteer programme. There is no tutoring fee, and you do not need a paid VertexED subscription to apply.',
  },
  {
    question: 'Who can request support?',
    answer: 'Current IB MYP students can apply. Tell us your year, the subjects you want help with and what you are working towards. You do not need to be aiming for a particular score.',
  },
  {
    question: 'What happens after I apply?',
    answer: 'The team reviews your request and looks for a match based on your subject and availability. Applying does not book a session. A time is agreed with you once a suitable mentor is available.',
  },
  {
    question: 'What can I bring to a session?',
    answer: 'Bring a topic, a question you have tried, or feedback you want to understand. A mentor can help you work through your reasoning and plan what to practise next. You remain the author of your assessed work.',
  },
  {
    question: 'Can I volunteer as a mentor?',
    answer: 'If you have completed the MYP, use the mentor application to share the subjects you can support and the time you can realistically offer. The team will discuss a suitable match before sessions begin.',
  },
];

export default function MYPMentorship() {
  return <>
    <SEO
      title="Free MYP mentoring | VertexED"
      description="Request free one-to-one IB MYP support or volunteer as a mentor. A student-led programme from the VertexED co-founders and MYP graduates."
      canonical="https://www.vertexed.app/myp/mentorship"
    />
    <div className="mentorship-page">
      <header className="mentorship-hero">
        <div>
          <Link className="mentorship-back" to="/myp">MYP learning hub <ArrowRight aria-hidden="true" /></Link>
          <p className="mentorship-kicker">MYP / Peer mentoring</p>
          <h1>Free MYP<br /><em>mentoring.</em></h1>
          <p className="mentorship-intro">Work through the topic you are stuck on with someone who has been through the MYP. One-to-one support from VertexED&apos;s co-founders and volunteer MYP graduates.</p>
          <div className="mentorship-actions">
            <a className="mentorship-primary" href={PUBLIC_INTAKE_ROUTES.mypStudent} target="_blank" rel="noopener noreferrer">
              Request free mentoring <ArrowUpRight aria-hidden="true" />
              <span className="sr-only"> (Google Forms, opens in a new tab)</span>
            </a>
            <a className="mentorship-secondary" href={PUBLIC_INTAKE_ROUTES.mypMentor} target="_blank" rel="noopener noreferrer">
              Volunteer as a mentor <ArrowUpRight aria-hidden="true" />
              <span className="sr-only"> (Google Forms, opens in a new tab)</span>
            </a>
          </div>
          <p className="mentorship-note">Both applications open in Google Forms. Matching depends on subject coverage and mentor availability.</p>
        </div>
        <aside className="mentorship-session" aria-labelledby="mentorship-session-title">
          <p className="mentorship-kicker">Bring your next question</p>
          <h2 id="mentorship-session-title">Start with<br />your attempt.</h2>
          <ol>
            <li><span aria-hidden="true">01</span><div><h3>Choose one topic</h3><p>A concept, a question or teacher feedback you want to understand.</p></div></li>
            <li><span aria-hidden="true">02</span><div><h3>Show your working</h3><p>Walk through what you tried and where you got stuck.</p></div></li>
            <li><span aria-hidden="true">03</span><div><h3>Try the next step</h3><p>Work through the gap, then choose something to practise independently.</p></div></li>
          </ol>
        </aside>
      </header>

      <section className="mentorship-team" aria-labelledby="mentorship-team-title">
        <div><p className="mentorship-kicker">The people behind it</p><h2 id="mentorship-team-title">Students helping<br />students.</h2></div>
        <div><p>VertexED&apos;s four co-founders, Ritayush, Ryan, Pratyush and Aadi, are starting the programme together. MYP graduates can join as volunteer mentors.</p><p>Tell us what you need help with or what you can teach. Subject coverage and session times are confirmed when a match is arranged.</p><Link to="/about">Meet the founding team <ArrowRight aria-hidden="true" /></Link></div>
      </section>

      <section className="mentorship-faq" aria-labelledby="mentorship-faq-title">
        <div><p className="mentorship-kicker">Before you apply</p><h2 id="mentorship-faq-title">A few practical<br />details.</h2><p>Mentoring supports your learning. It does not guarantee a score or replace your school&apos;s guidance.</p></div>
        <div>{questions.map(({ question, answer }) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
      </section>
    </div>
  </>;
}
