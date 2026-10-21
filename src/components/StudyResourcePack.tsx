import { useId, useState } from 'react';
import type { StudyPack } from '@/content/studyPackTypes';
import '@/styles/study-resource-pack.css';

export default function StudyResourcePack({ pack }: { pack: StudyPack }) {
  const prefix = useId();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  return <section className="study-resources" aria-label="Notes, examples, diagrams and flashcards">
    <section aria-labelledby={`${prefix}-notes`}><h2 id={`${prefix}-notes`}>Study notes</h2>
      {pack.notes.map((note, index) => <section key={index}><h3>{note.title}</h3>{note.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>)}
    </section>
    <section aria-labelledby={`${prefix}-examples`}><h2 id={`${prefix}-examples`}>Worked examples</h2>
      {pack.workedExamples.map((example) => <article className="study-resource-example" key={example.id}><h3>{example.prompt}</h3><ol>{example.steps.map((step, i) => <li key={i}>{step}</li>)}</ol><p><strong>Conclusion:</strong> {example.conclusion}</p></article>)}
    </section>
    <section aria-labelledby={`${prefix}-diagrams`}><h2 id={`${prefix}-diagrams`}>Concept diagrams</h2>
      {pack.diagrams.map((diagram) => <figure className="study-resource-diagram" key={diagram.id} aria-labelledby={`${prefix}-${diagram.id}-title`}>
        <figcaption><h3 id={`${prefix}-${diagram.id}-title`}>{diagram.title}</h3><p>{diagram.description}</p></figcaption>
        <ol className="study-diagram-nodes" aria-label="Concepts">{diagram.nodes.map((node, i) => <li key={node.id}><span className="study-node-number" aria-hidden="true">{i + 1}</span><strong>{node.label}</strong><p>{node.detail}</p></li>)}</ol>
        <ul className="study-diagram-connections" aria-label="Connections">{diagram.edges.map((edge, i) => <li key={i}><strong>{diagram.nodes.find((node) => node.id === edge.from)?.label}</strong><span className="study-diagram-arrow" aria-hidden="true"> → </span><span className="sr-only"> connects to </span><strong>{diagram.nodes.find((node) => node.id === edge.to)?.label}</strong><span className="study-edge-label">{edge.label}</span></li>)}</ul>
      </figure>)}
    </section>
    <section aria-labelledby={`${prefix}-cards`}><h2 id={`${prefix}-cards`}>Flashcards</h2><p>Recall an answer before revealing it. Explain the reasoning aloud, then revisit any uncertain cards after practice.</p>
      <div className="study-resource-cards">{pack.flashcards.map((card, i) => <article key={card.id}><h3><span className="study-card-number">Card {i + 1}</span>{card.front}</h3>
        <button type="button" aria-expanded={Boolean(revealed[card.id])} aria-controls={`${prefix}-${card.id}`} aria-label={`${revealed[card.id] ? 'Hide' : 'Reveal'} answer for card ${i + 1}`} onClick={() => setRevealed((previous) => ({ ...previous, [card.id]: !previous[card.id] }))}>{revealed[card.id] ? 'Hide answer' : 'Reveal answer'}</button>
        <p id={`${prefix}-${card.id}`} hidden={!revealed[card.id]}>{card.back}</p></article>)}</div>
    </section>
    {pack.references?.length ? <aside className="study-resource-references" aria-label="References for these resources"><h3>References for these resources</h3><ul>{pack.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title} (opens in a new tab)</a><p>{reference.note}</p></li>)}</ul></aside> : null}
  </section>;
}
