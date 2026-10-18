import Article from '@/components/Article';
import SEO from '@/components/SEO';
import BreadcrumbsJsonLd from '@/components/BreadcrumbsJsonLd';
import { Link } from 'react-router';

export default function AutomatedNoteTakingGuide() {
  return (
    <>
      <SEO title="Automated note taking: capture, then review | VertexED" description="Keep the original material beside the draft. Check it before turning it into practice." canonical="https://www.vertexed.app/resources/automated-note-taking-guide" ogType="article" />
      <BreadcrumbsJsonLd />
      <Article title="Automated note taking: capture, then review" subtitle="Keep the original material beside the draft. Check it before turning it into practice." kicker="Study guide">

        <p className="lead">AI can help organise study material, but a readable summary can still omit an important condition or misread a term. Use <Link to="/notetaker">AI Notes and Quiz</Link> for editable notes and recordings, or <Link to="/study-notebook">Study Notebook</Link> to work with a set of sources.</p>
        <h2>Choose the right input</h2>
        <ul>
          <li><strong>Existing notes:</strong> paste the relevant text and choose the note format you want.</li>
          <li><strong>Audio:</strong> use the recording controls only when you have permission to record and share the material. Review the transcript before relying on the summary.</li>
          <li><strong>Documents:</strong> use Study Notebook&apos;s source import and check the extracted text. Scans or complex layouts may not provide usable text.</li>
          <li><strong>Photographed answers:</strong> use Answer Reviewer. The note workflow does not promise handwriting OCR.</li>
        </ul>
        <h2>Separate capture from interpretation</h2>
        <p>A transcript records recognised speech. A summary selects and rewrites it. Check both against the original when a quotation, equation, date or technical term matters. If audio is unclear, keep that uncertainty visible instead of filling it with a plausible answer.</p>
        <h2>Review a draft in four passes</h2>
        <ol>
          <li><strong>Meaning:</strong> check that the central explanation matches the source.</li>
          <li><strong>Conditions:</strong> restore assumptions, exceptions and qualifications that were lost.</li>
          <li><strong>Detail:</strong> inspect notation, units, names and examples.</li>
          <li><strong>Practice:</strong> turn one checked idea into a question you can answer without the notes.</li>
        </ol>
        <h2>Use several sources carefully</h2>
        <p>In Study Notebook, select the sources you want the AI to use. Ask it to identify agreements, disagreements and gaps. When sources differ, return to the passages and explain the difference; do not assume a fluent combined summary has resolved it.</p>
        <p>A citation points back to supplied material. It does not confirm that a claim is true or that the source is current. Keep the original available for comparison.</p>
        <h2>From corrected notes to recall</h2>
        <p>Create a few focused flashcards or a short quiz from corrected notes. Answer before revealing the key. Check unexpected answers against the source, then choose what to practise again. See <Link to="/resources/notes-to-flashcards">the flashcard and quiz workflow</Link> for the next steps.</p>
        <h2>When processing fails</h2>
        <p>Keep your original text or recording. Follow the displayed error and retry with a smaller input when appropriate. If only the transcript is available, you can still review it yourself. A fallback or partial result should not be mistaken for completed AI notes.</p>
        <h2>Handle source material deliberately</h2>
        <p>Use material you are permitted to share and follow your school&apos;s rules. AI requests send the selected material to a configured external provider. Check VertexED&apos;s <Link to="/privacy">privacy information</Link> before sending sensitive information.</p>
        <p>Check whether your work is saved to your account or only on this device. Export important notes before clearing browser storage.</p>
        <div className="not-prose mt-8 flex gap-3 flex-wrap"><Link to="/notetaker" className="neu-button">Open AI Notes and Quiz</Link><Link to="/study-notebook" className="neu-button">Import study sources</Link><Link to="/resources/notes-to-flashcards" className="neu-button">Plan a retrieval session</Link></div>

        <div className="article-footer">Product guidance checked against the current implementation on 11 October 2026. Examples are illustrative. Educational accuracy and current assessment rules still require source and teacher checks.</div>
      </Article>
    </>
  );
}
