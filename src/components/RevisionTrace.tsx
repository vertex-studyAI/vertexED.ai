import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const stages = [
  { id: 'attempt', label: 'Attempt', number: '01', tool: 'Paper Maker', title: 'Explain water uptake in a root hair cell.',
    note: 'Start with your own explanation. Keep the answer so you can compare it with feedback.', action: 'Write before checking',
    text: 'Water moves into the root hair cell by osmosis.', annotation: 'A starting answer. What explains the direction of movement?' },
  { id: 'review', label: 'Review', number: '02', tool: 'Answer Reviewer', title: 'Name the gradient and the membrane.',
    note: 'Check suggested feedback against your course notes or an official mark scheme. This example is not a marked exam response.', action: 'Check the missing detail',
    text: 'Water moves from higher to lower water potential through a partially permeable membrane.', annotation: 'Add the water potential gradient and the membrane to your explanation.' },
  { id: 'retry', label: 'Retry', number: '03', tool: 'Scheduled retry', title: 'Try a related question without notes.',
    note: 'A retry returns to the same topic with another attempt. Selecting this example does not schedule work in your account.', action: 'Return to cell transport',
    text: 'What happens to a plant cell placed in a solution with a lower water potential?', annotation: 'Use the same two ideas: direction of water movement and the membrane.' },
];

export default function RevisionTrace() {
  const [stage, setStage] = useState('attempt');
  return (
    <aside className="revision-trace" data-stage={stage} aria-label="Example study session">
      <div className="trace-caption"><span className="trace-brand"><img src="/logo.png" alt="" width="24" height="24" /> Revision desk</span><span>Interactive example · Biology</span></div>
      <Tabs value={stage} onValueChange={setStage} className="trace-workspace">
        <TabsList className="trace-tabs" aria-label="Follow a revision attempt">
          {stages.map((stage) => <TabsTrigger key={stage.id} value={stage.id} className="trace-tab"><span>{stage.number}</span>{stage.label}</TabsTrigger>)}
        </TabsList>
        {stages.map((stage) => (
          <TabsContent key={stage.id} value={stage.id} className="trace-panel">
            <div className="trace-syllabus">
              <p className="trace-rail-label">IN THIS SESSION</p>
              <strong>Cell transport</strong>
              <p>Biology</p>
              <div className="trace-topic-list"><span>Diffusion</span><span className="is-current">Osmosis <span aria-hidden>↗</span></span><span>Active transport</span></div>
              <div className="trace-rail-bottom"><span>THE TASK</span><p>{stage.action}</p></div>
            </div>
            <div className="trace-paper">
              <div className="trace-document-meta"><span>{stage.tool}</span><span>EXAMPLE / {stage.number}</span></div>
              <h2>{stage.title}</h2>
              <p className="trace-answer">{stage.text}</p>
              <div className="trace-answer-lines" aria-hidden><i /><i /></div>
              <div className="trace-paper-footer"><span>TOPIC / CELL TRANSPORT</span><span aria-hidden="true">↗</span></div>
            </div>
            <div className="trace-next"><span className="trace-rail-label">IN THE MARGIN / {stage.number}</span><div className="trace-annotation"><span aria-hidden="true">↳</span><p>{stage.annotation}</p></div><div><strong>{stage.action}</strong><p>{stage.note}</p></div></div>
          </TabsContent>
        ))}
      </Tabs>
      <p className="trace-footnote"><span className="trace-node" aria-hidden />Example only. Your account and progress are unchanged.</p>
    </aside>
  );
}
