import { APP_ORIGIN } from '@/lib/appOrigin';
import Article from '@/components/Article';
import SEO from '@/components/SEO';
import BreadcrumbsJsonLd from '@/components/BreadcrumbsJsonLd';
import { Link } from 'react-router';

export default function AIAnswerReviewer() {
  return (
    <>
      <SEO title="Using Answer Reviewer | VertexED" description="Find a reasoning gap, check the feedback and make a fresh attempt." canonical={`${APP_ORIGIN}/resources/ai-answer-reviewer`} ogType="article" />
      <BreadcrumbsJsonLd />
      <Article title="Using Answer Reviewer" subtitle="Find a reasoning gap, check the feedback and make a fresh attempt." kicker="Study guide">

        <p className="lead"><Link to="/answer-reviewer">Answer Reviewer</Link> gives AI-suggested feedback on a question and your response. It can suggest marks and criteria, but those suggestions are not an official grade or a prediction of your exam result.</p>
        <h2>Give the reviewer enough context</h2>
        <ol>
          <li>Provide the full question, including any command term, data and mark allocation.</li>
          <li>Choose your curriculum and subject, then paste your answer or attach clear images.</li>
          <li>Include the relevant rubric or mark-scheme guidance in the additional context when you have it.</li>
          <li>Choose a strictness level and request a review. Strictness changes the instruction; it does not make the mark more accurate.</li>
        </ol>
        <p>A curriculum selection gives context. It does not establish that the model has the current official rubric. If criteria are missing, treat the feedback as general guidance.</p>
        <h2>Photographs need a careful check</h2>
        <p>Keep the whole question and each line of working legible. Avoid glare and cropped symbols. The tool accepts up to five PNG, JPEG, WebP or GIF images across the question and answer, with a 4 MB limit per file. Text drafts save on this device; reattach images after refreshing.</p>
        <p>Image reading can confuse minus signs, powers, handwriting and diagram labels. If the feedback describes work you did not write, correct the input and request another review. Do not treat unreadable material as an incorrect answer.</p>
        <h2>Read the evidence behind a suggestion</h2>
        <ul>
          <li><strong>Quoted wording:</strong> check that the quotation actually appears in your answer.</li>
          <li><strong>Method:</strong> locate the first step that changes the meaning or breaks a rule.</li>
          <li><strong>Criteria:</strong> compare each suggested requirement with the supplied mark scheme.</li>
          <li><strong>Marks:</strong> check the allocation and total instead of accepting the number alone.</li>
        </ul>
        <h2>Example: improve one explanation</h2>
        <p>This is an illustrative revision task. Suppose a response describes a trend but the question asks you to explain it. Look for a supported mechanism connecting cause to effect. Write that connection in your own words, then check whether it answers the actual question.</p>
        <h2>Turn a review into a retry</h2>
        <ol>
          <li>Keep your original answer so you can compare attempts.</li>
          <li>Choose one feedback point you can verify with your teacher, course material or official mark scheme.</li>
          <li>Correct the reasoning and attempt a related question without the suggested answer visible.</li>
          <li>Add a review block in the <Link to="/planner">Planner</Link> if you want time to return to it.</li>
        </ol>
        <p>Use trusted marking evidence before confirming a result. AI feedback, your confidence and a scheduled retry are different things; none on its own demonstrates mastery.</p>
        <h2>If a review is unavailable</h2>
        <p>Keep your answer and any images. Check the error message, then try a smaller, clearer submission. A failed review should not be recorded as a zero or as completed work.</p>
        <div className="not-prose mt-8 flex gap-3 flex-wrap"><Link to="/answer-reviewer" className="neu-button">Open Answer Reviewer</Link><Link to="/resources/ai-chatbot-tutor" className="neu-button">Use Apex for hints</Link><Link to="/planner" className="neu-button">Plan a retry</Link></div>

        <div className="article-footer">Product guidance checked against the current implementation on 11 October 2026. Examples are illustrative. Educational accuracy and current assessment rules still require source and teacher checks.</div>
      </Article>
    </>
  );
}
