import { ArrowRight, ArrowUpRight, FileText, ListChecks, NotebookPen } from 'lucide-react';
import { Link } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const entries = [
  { id: 'notes', icon: FileText, label: 'I have notes', detail: 'Put recall after reading.',
    from: 'Your material', to: 'Something to recall', tool: 'Notes · Flashcards · Quiz', href: '/notetaker',
    title: 'Close the notes. Keep the question.',
    description: 'Turn a passage into notes, flashcards or a quiz. Check the generated content, then practise bringing it back without looking.',
    source: 'Osmosis', prompt: 'What determines the direction of water movement?',
    cue: 'Recall the water potential gradient. Then check your course notes.', action: 'Work with my notes' },
  { id: 'practice', icon: NotebookPen, label: 'I need practice', detail: 'Give the topic a test.',
    from: 'A topic', to: 'Your own attempt', tool: 'Paper Maker', href: '/paper-maker',
    title: 'A question you have to work through.',
    description: 'Choose topics and marks. Make an exam-style paper and attempt it before opening the suggested answers.',
    source: 'Cell transport', prompt: 'Explain water uptake in a root hair cell.',
    cue: 'Make the explanation yourself before checking an answer.', action: 'Make a practice paper' },
  { id: 'feedback', icon: ListChecks, label: 'I have an answer', detail: 'Find the part to revisit.',
    from: 'Your answer', to: 'A specific next step', tool: 'Answer Reviewer', href: '/answer-reviewer',
    title: 'Keep the reasoning behind the feedback.',
    description: 'Submit your answer. Read the suggested feedback, check it against the marking criteria and decide what needs another attempt.',
    source: 'A point to check', prompt: 'Have you named the gradient and the membrane?',
    cue: 'Suggested feedback is a starting point, not a final mark.', action: 'Review my answer' },
] as const;

/** Public route guide. Examples never create an artifact or learner progress. */
export default function StudyEntry() {
  return <section className="landing-section study-entry" aria-labelledby="entry-title" data-reveal>
    <div className="section-intro entry-intro">
      <p className="section-kicker">01 / Start with your work</p>
      <h2 id="entry-title">Come as you are.<br/><span className="ink-highlight">Leave with a task.</span></h2>
      <p>A page of notes, a topic to practise, an answer to check. There is a place to start with each.</p>
    </div>
    <Tabs defaultValue="notes" className="entry-workspace">
      <TabsList className="entry-choices" aria-label="Choose a starting point">
        {entries.map((entry, index) => <TabsTrigger value={entry.id} key={entry.id} className="entry-choice">
          <span className="entry-choice-number">0{index + 1}</span>
          <span><strong>{entry.label}</strong><small>{entry.detail}</small></span>
          <ArrowRight size={19} aria-hidden />
        </TabsTrigger>)}
      </TabsList>
      {entries.map(entry => <TabsContent value={entry.id} key={entry.id} className="entry-panel">
        <div className="entry-route"><span><entry.icon size={18} aria-hidden />{entry.from}</span><ArrowRight size={18} aria-hidden /><span>{entry.to}</span></div>
        <div className="entry-content">
          <div className="entry-explanation"><p className="section-kicker">{entry.tool}</p><h3>{entry.title}</h3><p>{entry.description}</p><Link to={entry.href} className="landing-secondary">{entry.action}<ArrowUpRight size={18} aria-hidden /></Link></div>
          <div className="entry-example"><div className="entry-example-caption"><span>{entry.source}</span><span>Example</span></div><p>{entry.prompt}</p><span className="entry-example-cue">{entry.cue}</span></div>
        </div>
      </TabsContent>)}
    </Tabs>
  </section>;
}
