import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import SEO from '@/components/SEO';
import '@/styles/myp-mentorship.css';

const STUDENT_FORM = 'https://forms.gle/JbkVEATVf3f3X4yF9';
const MENTOR_FORM = 'https://forms.gle/gisd6w65hb6L7keu9';

export default function MYPMentorship() {
  return <>
    <SEO
      title="Free MYP mentoring | VertexED"
      description="Request free one-to-one MYP study support or volunteer as an MYP graduate. A student-led mentoring programme started by the four VertexED co-founders."
      canonical="https://www.vertexed.app/myp/mentorship"
    />
    <div className="mentorship-page">
      <header className="mentorship-intro">
        <Link to="/myp" className="mentorship-back"><ArrowLeft aria-hidden="true" /> Back to MYP</Link>
        <p className="mentorship-kicker">Free MYP mentoring</p>
        <h1>Bring the question<br /><em>you’re stuck on.</em></h1>
        <p className="mentorship-lead">Work through it with someone who has been through the MYP. The four VertexED co-founders are opening free one-to-one tutoring, with MYP graduates invited to volunteer alongside them.</p>
        <p className="mentorship-note">No VertexED account is needed to apply. Sessions depend on a suitable mentor and shared availability.</p>
      </header>

      <section className="mentorship-paths" aria-label="Choose your application">
        <article className="mentorship-path" aria-labelledby="mentorship-student-title">
          <p className="mentorship-kicker">For current MYP students</p>
          <h2 id="mentorship-student-title">Get help with your next attempt.</h2>
          <p>Ask for help with a difficult topic, how to approach a question or how to use feedback in your revision.</p>
          <ul>
            <li>Bring the work you have already tried.</li>
            <li>Talk through the method and the reasoning.</li>
            <li>Choose a small next step to practise yourself.</li>
          </ul>
          <a className="mentorship-apply mentorship-apply-primary" href={STUDENT_FORM} target="_blank" rel="noopener noreferrer" aria-describedby="student-form-note">Apply for free support <ArrowUpRight aria-hidden="true" /></a>
          <p id="student-form-note" className="mentorship-form-note">Student application. Opens a Google Form in a new tab.</p>
        </article>

        <article className="mentorship-path" aria-labelledby="mentorship-mentor-title">
          <p className="mentorship-kicker">For MYP graduates</p>
          <h2 id="mentorship-mentor-title">Help someone work through it.</h2>
          <p>Volunteer the time you can give. Share the explanations, study habits and lessons you wish you had earlier.</p>
          <ul>
            <li>Help with subjects you know well.</li>
            <li>Guide the student’s thinking and independent work.</li>
            <li>Agree a manageable schedule after matching.</li>
          </ul>
          <a className="mentorship-apply" href={MENTOR_FORM} target="_blank" rel="noopener noreferrer" aria-describedby="mentor-form-note">Apply to mentor <ArrowUpRight aria-hidden="true" /></a>
          <p id="mentor-form-note" className="mentorship-form-note">Mentor application. Opens a Google Form in a new tab.</p>
        </article>
      </section>

      <section className="mentorship-session" aria-labelledby="mentorship-session-title">
        <div>
          <p className="mentorship-kicker">A useful first session</p>
          <h2 id="mentorship-session-title">Start with one clear question.</h2>
          <p>A topic, an attempt and a little context give you something concrete to work on together.</p>
        </div>
        <ol>
          <li><span aria-hidden="true">01</span><div><h3>Pick the gap.</h3><p>Choose a question or topic and explain where you got stuck. Bring your attempt and any feedback you received.</p></div></li>
          <li><span aria-hidden="true">02</span><div><h3>Explain your thinking.</h3><p>Walk through what you tried. Use the conversation to understand the method and check the steps.</p></div></li>
          <li><span aria-hidden="true">03</span><div><h3>Try it again.</h3><p>Finish with a similar question or a short revision task you can attempt independently.</p></div></li>
        </ol>
      </section>

      <section className="mentorship-questions" aria-labelledby="mentorship-questions-title">
        <p className="mentorship-kicker">Before you apply</p>
        <h2 id="mentorship-questions-title">The practical details.</h2>
        <details>
          <summary>Is the tutoring free?</summary>
          <p>Yes. This is volunteer MYP support with no tutoring fee. You do not need a paid VertexED subscription to apply.</p>
        </details>
        <details>
          <summary>Does applying book a session?</summary>
          <p>No. The forms collect applications. A session is arranged only after a suitable match and availability are confirmed. There is no fixed response time or guaranteed place.</p>
        </details>
        <details>
          <summary>Can you guarantee a particular score?</summary>
          <p>No. Mentoring supports your understanding and revision; it cannot promise an exam result. Use your school’s current course materials and assessment guidance.</p>
        </details>
        <details>
          <summary>Can a mentor complete my assessed work?</summary>
          <p>No. Bring your own attempt. A mentor can help you understand a concept, practise a method or discuss feedback, while assessed work remains yours.</p>
        </details>
        <details>
          <summary>Do I need an account or an app?</summary>
          <p>You can apply directly through the student or mentor Google Form. Meeting details are agreed after matching; applying does not enrol you in the VertexED app beta.</p>
        </details>
        <p className="mentorship-boundary">VertexED is independent of the International Baccalaureate. This is a student-led volunteer programme.</p>
        <Link to="/myp" className="mentorship-library-link">Explore MYP subjects while you wait <ArrowRight aria-hidden="true" /></Link>
      </section>
    </div>
  </>;
}
