import { useState } from 'react';
import ChatMarkdown from './ChatMarkdown';

export type LearningWorkspace = { title: string; cards: { kind: string; title: string; body: string; hint?: string; answer?: string }[] };
export default function LearningPanels({ workspace, example = false }: { workspace: LearningWorkspace; example?: boolean }) {
  const [layout, setLayout] = useState<'sequence' | 'overview'>('sequence');
  const [active, setActive] = useState(0);
  const [working, setWorking] = useState<Record<number, string>>({});
  const download = () => {
    const text = [`# ${workspace.title}`, example ? 'Original sample lesson' : 'AI-generated draft. Check against course materials.', ...workspace.cards.map((card, index) => `## ${card.title}\n\n${card.body}${working[index] ? `\n\n### My working\n${working[index]}` : ''}${card.hint ? `\n\nHint: ${card.hint}` : ''}${card.answer ? `\n\nWorked answer: ${card.answer}` : ''}`)].join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'vertexed-study-notes.md'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="apex-workspace" aria-label="Learning workspace">
    <header><p className="vee-eyebrow">{example ? 'Original sample lesson' : 'AI-generated study draft'}</p><h3>{workspace.title}</h3><p className="text-sm text-muted-foreground">{example ? 'Try the card workflow without sending an AI request.' : 'Check the explanations against your course materials.'} Temporary workspace. Nothing is saved automatically.</p></header>
    <div className="apex-layout-switch" role="group" aria-label="Card layout"><button type="button" aria-pressed={layout === 'sequence'} onClick={() => setLayout('sequence')}>One step at a time</button><button type="button" aria-pressed={layout === 'overview'} onClick={() => setLayout('overview')}>All cards</button></div>
    {workspace.cards.map((card, index) => (layout === 'overview' || active === index) && <article key={index} className="apex-learning-card">
      <span className="vee-eyebrow">{String(index + 1).padStart(2, '0')} / {card.kind}</span><h4>{card.title}</h4><ChatMarkdown>{card.body}</ChatMarkdown>
      {card.kind === 'practice' && <label className="apex-working">Your working<textarea rows={3} value={working[index] ?? ''} onChange={event => setWorking(previous => ({ ...previous, [index]: event.target.value }))} placeholder="Try the method before revealing the answer." /></label>}
      {card.hint && <details><summary>Show hint</summary><ChatMarkdown>{card.hint}</ChatMarkdown></details>}
      {card.answer && <details><summary>Check worked answer</summary><ChatMarkdown>{card.answer}</ChatMarkdown></details>}
    </article>)}
    {layout === 'sequence' && <div className="apex-step-controls"><button type="button" disabled={active === 0} onClick={() => setActive(value => value - 1)}>Previous</button><span aria-live="polite">{active + 1} / {workspace.cards.length}</span><button type="button" disabled={active === workspace.cards.length - 1} onClick={() => setActive(value => value + 1)}>Next card</button></div>}
    <button type="button" className="btn-glass" onClick={download}>Download study notes</button>
  </section>;
}
