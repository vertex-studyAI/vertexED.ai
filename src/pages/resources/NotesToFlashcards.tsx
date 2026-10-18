import Article from '@/components/Article';
import SEO from '@/components/SEO';
import BreadcrumbsJsonLd from '@/components/BreadcrumbsJsonLd';
import { Link } from 'react-router';

export default function NotesToFlashcards() {
  return (
    <>
      <SEO title="From notes to flashcards and quizzes | VertexED" description="Check the source, write a focused question and answer before revealing." canonical="https://www.vertexed.app/resources/notes-to-flashcards" ogType="article" />
      <BreadcrumbsJsonLd />
      <Article title="From notes to flashcards and quizzes" subtitle="Check the source, write a focused question and answer before revealing." kicker="Study guide">

        <p className="lead">Use <Link to="/notetaker">AI Notes and Quiz</Link> to turn a topic and your notes into an editable draft, flashcards and practice questions. For a collection of source documents with references, start in <Link to="/study-notebook">Study Notebook</Link>.</p>
        <h2>Start with material you can check</h2>
        <p>Paste the relevant explanation or add sources to a notebook. A topic name by itself is a request for generated material, not evidence for the answer. Correct definitions, notation, names and units before using a draft to make more study material.</p>
        <h2>Make a small deck</h2>
        <ol>
          <li>Choose one topic and a note format.</li>
          <li>Read and edit the generated notes against your source.</li>
          <li>Generate flashcards from the corrected material.</li>
          <li>Split cards that ask several unrelated things. Make each question clear enough to answer without guessing its context.</li>
          <li>Check the back of each card before adding it to your revision routine.</li>
        </ol>
        <h2>Three original example cards</h2>
        <ul>
          <li><strong>Method:</strong> What operation preserves equality when subtracting 5 from one side of an equation? Subtract 5 from the other side too.</li>
          <li><strong>Calculation:</strong> Solve 3x = 12. Divide both sides by 3, giving x = 4; substitute to check.</li>
          <li><strong>Contrast:</strong> How does an expression differ from an equation? An expression represents a value; an equation states that two expressions are equal.</li>
        </ul>
        <p>These examples illustrate question design. They are not saved cards or an official syllabus checklist.</p>
        <h2>Answer before you reveal</h2>
        <p>In Study Mode, attempt the card first, reveal the answer and rate your recall. The rating sets a future due date. It is your own judgement, not a measured grade. A familiar-looking answer is a reason to try explaining it without looking.</p>
        <h2>Use a quiz for a longer attempt</h2>
        <p>Create a quiz from the notes and check the generated questions and answer key. In Study Notebook, you can write a response, record confidence, reveal an answer and add a self-check. Source references help you return to the material; they do not verify the answer key.</p>
        <p>If a question is ambiguous or its options do not contain a defensible answer, leave that item out of your assessment and repair it before trying again.</p>
        <h2>Plan the next review</h2>
        <p>Return to due cards and choose another question for concepts you missed. Add a <Link to="/planner">Planner</Link> block yourself when you want calendar time. Card due dates do not automatically create calendar events.</p>
        <h2>Formats and saving</h2>
        <p>The flashcard editor uses text fronts and backs. Do not rely on an image-upload or special cloze-card feature. Keep diagrams in your source material and write a text question that identifies the diagram clearly.</p>
        <p>Check the save status before closing. If the tool displays a fallback, review that label: a fallback is not a successfully generated AI lesson. Your source is the place to verify missing or uncertain details.</p>
        <div className="not-prose mt-8 flex gap-3 flex-wrap"><Link to="/notetaker" className="neu-button">Open AI Notes and Quiz</Link><Link to="/study-notebook" className="neu-button">Open Study Notebook</Link><Link to="/planner" className="neu-button">Schedule a review</Link></div>

        <div className="article-footer">Product guidance checked against the current implementation on 11 October 2026. Examples are illustrative. Educational accuracy and current assessment rules still require source and teacher checks.</div>
      </Article>
    </>
  );
}
