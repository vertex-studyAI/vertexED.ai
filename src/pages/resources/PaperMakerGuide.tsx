import { APP_ORIGIN } from '@/lib/appOrigin';
import Article from '@/components/Article';
import SEO from '@/components/SEO';
import BreadcrumbsJsonLd from '@/components/BreadcrumbsJsonLd';
import { Link } from 'react-router';

export default function PaperMakerGuide() {
  return (
    <>
      <SEO title="IB and IGCSE Paper Maker | VertexED" description="Create original practice around a topic, then check the questions and marking guidance." canonical={`${APP_ORIGIN}/resources/ib-igcse-paper-maker`} ogType="article" />
      <BreadcrumbsJsonLd />
      <Article title="IB and IGCSE Paper Maker" subtitle="Create original practice around a topic, then check the questions and marking guidance." kicker="Study guide">

        <p className="lead"><Link to="/paper-maker">Paper Maker</Link> drafts original practice questions from your selected curriculum, subject, topics and settings. Generated papers are independent practice material. They are not official past papers, exam predictions or a guarantee of syllabus coverage.</p>
        <h2>Set a focused brief</h2>
        <ol>
          <li>Choose the curriculum, grade and subject that match your course.</li>
          <li>Name the topics you want to practise. Include a specific subtopic when a broad title would be ambiguous.</li>
          <li>Choose the question count, difficulty and available marks or criteria settings.</li>
          <li>Generate a draft and inspect it before starting a timed attempt.</li>
        </ol>
        <p>Easy, Medium and Hard are generation instructions. They have not been calibrated to an official exam difficulty scale.</p>
        <h2>Check the paper before using it</h2>
        <ul>
          <li>Does every question include enough information to answer it?</li>
          <li>Are symbols, units, data and diagrams clear and consistent?</li>
          <li>Do question marks add up to the intended total?</li>
          <li>Do the command terms and topic scope fit your current course specification?</li>
          <li>Does the proposed answer follow from the question, and can you justify alternative valid answers?</li>
        </ul>
        <p>Compare with your teacher&apos;s guidance and official materials. A generated reference rubric is provisional, even when its format resembles a mark scheme.</p>
        <h2>Example setup</h2>
        <p>For a short algebra session, choose your actual course, enter linear equations as the topic and request a manageable number of questions. Inspect the draft, keep the answers out of view and choose your own time limit. This is an example of using the controls, not a saved paper or an official paper format.</p>
        <h2>Attempt, review, retry</h2>
        <ol>
          <li>Export the questions to PDF or Word if you want to work offline.</li>
          <li>Attempt them without the generated answers visible.</li>
          <li>Use <Link to="/answer-reviewer">Answer Reviewer</Link> for suggested feedback on one response, with any trusted marking guidance available.</li>
          <li>Check the feedback, correct a specific gap and try a related question.</li>
          <li>Add time for a retry in the <Link to="/planner">Planner</Link>.</li>
        </ol>
        <h2>If generation falls back</h2>
        <p>Read the generation status. When the provider is unavailable or returns unusable output, the tool can return a labelled fallback. Inspect that material as a starting point; it is not evidence that the requested AI paper was generated successfully.</p>
        <h2>Keep official preparation in the loop</h2>
        <p>Use official specifications, authorised past papers and teacher feedback to check assessment requirements. Paper Maker provides additional practice; a curriculum label cannot establish that a generated set matches an exam board&apos;s current format or standard.</p>
        <div className="not-prose mt-8 flex gap-3 flex-wrap"><Link to="/paper-maker" className="neu-button">Open Paper Maker</Link><Link to="/answer-reviewer" className="neu-button">Review an attempt</Link><Link to="/resources/notes-to-flashcards" className="neu-button">Make revision cards</Link></div>

        <div className="article-footer">Product guidance checked against the current implementation on 11 October 2026. Examples are illustrative. Educational accuracy and current assessment rules still require source and teacher checks.</div>
      </Article>
    </>
  );
}
