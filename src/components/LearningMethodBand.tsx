import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';

import { LEARNING_DESIGN_COMMITMENTS, STUDY_LOOP_STAGES, studyStageForPath } from '@/content/learningFoundations';
import '@/styles/learning-method.css';

type Props = {
  pathname: string;
};

export default function LearningMethodBand({ pathname }: Props) {
  const activeStage = studyStageForPath(pathname);

  return (
    <section className="learning-method-band" aria-labelledby="learning-method-title">
      <header className="learning-method-intro">
        <div>
          <p>VertexED learning method</p>
          <h2 id="learning-method-title">A study loop with a visible reason for every step.</h2>
        </div>
        <p>
          Technology is most useful when it keeps the task, the learner’s attempt, the source and the next retry connected.
          Use this cycle as a route through the workspace, then adapt it to your course and teacher’s guidance.
        </p>
      </header>

      <ol className="learning-method-steps">
        {STUDY_LOOP_STAGES.map((stage, index) => (
          <li key={stage.id} data-current={stage.id === activeStage ? 'true' : undefined}>
            <span>{String(index + 1).padStart(2, '0')} / {stage.label}</span>
            <h3>{stage.heading}</h3>
            <p>{stage.summary}</p>
            <blockquote>{stage.question}</blockquote>
            <Link to={stage.href}>Open {stage.label.toLowerCase()} tools <ArrowRight aria-hidden /></Link>
          </li>
        ))}
      </ol>

      <div className="learning-method-commitments" aria-label="Learning design commitments">
        {LEARNING_DESIGN_COMMITMENTS.map((item) => (
          <div key={item.title}>
            <CheckCircle2 aria-hidden />
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
