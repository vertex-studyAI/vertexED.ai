import Article from '@/components/Article';
import SEO from '@/components/SEO';
import BreadcrumbsJsonLd from '@/components/BreadcrumbsJsonLd';
import { Link } from 'react-router';

export default function AIChatbotTutorGuide() {
  return (
    <>
      <SEO title="Using Apex for study help | VertexED" description="Choose the kind of help you need. Bring an attempt, check the explanation, then try again." canonical="https://www.vertexed.app/resources/ai-chatbot-tutor" ogType="article" />
      <BreadcrumbsJsonLd />
      <Article title="Using Apex for study help" subtitle="Choose the kind of help you need. Bring an attempt, check the explanation, then try again." kicker="Study guide">

        <p className="lead"><Link to="/chatbot">Apex</Link> is a text-based AI tutor. Use it to explain a concept, ask for a hint, discuss your working or practise a question. Replies can be wrong, even when they sound confident. Keep your course materials beside you.</p>
        <h2>Choose how you want to study</h2>
        <ul>
          <li><strong>Explain:</strong> request a plain explanation, a concrete example and a check question.</li>
          <li><strong>Teach:</strong> work through a topic in small steps, starting with what you already know.</li>
          <li><strong>Hint:</strong> ask for one nudge before trying the next step yourself.</li>
          <li><strong>Solve With Me:</strong> share an attempt and discuss one step at a time.</li>
          <li><strong>Quiz:</strong> answer one question before receiving feedback.</li>
          <li><strong>Challenge Me:</strong> try an original related problem.</li>
          <li><strong>Exam Mode:</strong> attempt an original practice question without hints until you submit or end the session.</li>
        </ul>
        <p>These modes guide the AI response. They do not certify an answer or reproduce an official examination.</p>
        <h2>A useful first message</h2>
        <blockquote>For my algebra revision, I am solving 2x + 5 = 15. I subtracted 5 from the left side but kept 15 on the right. Give me one hint about what must happen to both sides. Wait for my next step.</blockquote>
        <p>This is an illustrative prompt. Include the question, your course or level, your working and the point where you became unsure. You do not need to paste unrelated personal details.</p>
        <h2>Work from a source</h2>
        <p>For help with several documents, open <Link to="/study-notebook">Study Notebook</Link>, add the material and enable the sources you want to use. A source reference identifies material included in the request. It does not prove that the explanation follows from that material. Open the passage and compare the claim yourself.</p>
        <p>If the source does not answer your question, ask what information is missing. A board name alone does not supply a current syllabus or mark scheme.</p>
        <h2>Check a response before using it</h2>
        <ol>
          <li>Compare definitions and quotations with the original material.</li>
          <li>For calculations, check each step, the units and the result in the original equation.</li>
          <li>For an argument, separate evidence from interpretation and test a counterexample.</li>
          <li>Close the explanation and try a similar question without help.</li>
        </ol>
        <h2>Photographed working and feedback</h2>
        <p>Chat does not accept a photograph of your working. Use <Link to="/answer-reviewer">Answer Reviewer</Link> for a typed or photographed response. Make symbols and line order clear; image reading can miss detail. Feedback and suggested marks still need checking against trusted evidence.</p>
        <h2>When a reply fails</h2>
        <p>If generation is unavailable or cannot finish, keep your question and try a narrower request or fewer source passages. A failed request is not a completed explanation. AI replies need a network connection.</p>
        <h2>Keep the attempt yours</h2>
        <p>Follow your school and assessment rules. Ask for questions, explanations and critique you can use to revise your own work. Save or export what you need and check the displayed save status before leaving.</p>
        <div className="not-prose mt-8 flex gap-3 flex-wrap"><Link to="/chatbot" className="neu-button">Open Apex</Link><Link to="/study-notebook" className="neu-button">Study from sources</Link><Link to="/answer-reviewer" className="neu-button">Review an answer</Link></div>

        <div className="article-footer">Product guidance checked against the current implementation on 11 October 2026. Examples are illustrative. Educational accuracy and current assessment rules still require source and teacher checks.</div>
      </Article>
    </>
  );
}
