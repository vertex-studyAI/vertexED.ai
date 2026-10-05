import { useState } from 'react';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';

const questions = [
  {
    code: 'PHY-02 / A LEVEL / MECHANICS',
    short: 'Vertical circle',
    subject: 'Physics',
    prompt: 'A mass moves in a vertical circle with non-uniform speed. With θ measured from the downward vertical, derive the radial and tangential equations of motion.',
    expression: 'T − mg cos θ = mv²/r   ·   m dv/dt = −mg sin θ',
    transfer: 'Use the two equations together to explain why the speed, radial acceleration and tension change at different points in the circle.',
    steps: [
      ['Set the axes', 'Which direction is towards the centre, and which direction increases θ?', 'Draw the inward radial axis before resolving any force. At the bottom of the circle, weight points opposite the inward direction.'],
      ['Resolve the weight', 'Why does one component use cos θ while the other uses sin θ?', 'The radial component lies adjacent to θ. Its magnitude is mg cos θ. The tangential component lies opposite θ and has magnitude mg sin θ. Signs come from the axes you chose.'],
      ['Connect the motion', 'Why does v²/r remain in the radial equation even though the speed is changing?', 'Changing direction still produces radial acceleration v²/r. The changing speed is handled separately by the tangential acceleration dv/dt.'],
      ['Carry it further', 'Where is the tension largest if the string stays taut, and what evidence would justify the claim?', 'Compare the radial equation and the speed at the bottom, side and top. Do not use position alone: the value of v matters too.'],
    ],
  },
  {
    code: 'MAT-04 / IB AA / CALCULUS',
    short: 'Product and chain',
    subject: 'Mathematics',
    prompt: 'For f(x) = x(3x² + 1)⁵e⁻ˣ, find f′(x), then identify which parts of the derivative come from product, chain and exponential rules.',
    expression: 'f′(x) = e⁻ˣ(3x² + 1)⁴[(3x² + 1)(1 − x) + 30x²]',
    transfer: 'Use the factored derivative to discuss how you would locate stationary points without expanding a twelfth-degree-looking expression.',
    steps: [
      ['See the structure', 'How many functions are multiplied, and which one contains a function inside another?', 'Treat x, (3x² + 1)⁵ and e⁻ˣ as three factors. The middle factor also needs the chain rule.'],
      ['Differentiate locally', 'What is the derivative of each factor before you combine them?', 'The local derivatives are 1, 30x(3x² + 1)⁴ and −e⁻ˣ. Keep them separate long enough to see where every term comes from.'],
      ['Combine and factor', 'Which common factors make the final expression easier to inspect?', 'Every term contains e⁻ˣ(3x² + 1)⁴. Factoring it exposes the remaining polynomial instead of hiding the structure in an expansion.'],
      ['Carry it further', 'Which factors can never be zero for real x, and what does that leave you to solve?', 'e⁻ˣ is positive and 3x² + 1 is positive. Real stationary points therefore come from the remaining bracket.'],
    ],
  },
  {
    code: 'CHE-03 / IB DP / EQUILIBRIUM',
    short: 'Equilibrium',
    subject: 'Chemistry',
    prompt: 'For N₂O₄(g) ⇌ 2NO₂(g), predict and explain the effect of increasing pressure, then separate the change in equilibrium position from the change in Kc.',
    expression: 'Kc = [NO₂]² / [N₂O₄]',
    transfer: 'Explain why a faster approach to equilibrium does not necessarily mean a larger equilibrium constant.',
    steps: [
      ['Count particles', 'Which side has fewer moles of gas?', 'The left side has one mole of gas for every two on the right. That comparison matters when pressure changes.'],
      ['Predict the shift', 'Which direction opposes an increase in pressure?', 'The system shifts towards fewer gas particles, so the equilibrium position moves towards N₂O₄ under the stated conditions.'],
      ['Separate the claims', 'Does changing pressure at constant temperature change Kc?', 'No. Pressure changes the equilibrium composition. For a given reaction, Kc changes only when temperature changes.'],
      ['Carry it further', 'What changes if a catalyst is added instead?', 'Both forward and reverse reactions speed up. Equilibrium is reached sooner, but neither its position nor Kc changes.'],
    ],
  },
] as const;

export default function GuidedReasoning() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const question = questions[questionIndex];
  const current = question.steps[step];
  const chooseQuestion = (index: number) => {
    setQuestionIndex(index);
    setStep(0);
    setHintOpen(false);
  };
  const moveQuestionFocus = (index: number) => {
    chooseQuestion(index);
    document.getElementById(`guided-question-${index}`)?.focus();
  };
  const advance = () => {
    if (step === question.steps.length - 1) {
      setStep(0);
      setHintOpen(false);
      return;
    }
    setStep(value => value + 1);
    setHintOpen(false);
  };

  return <section className="vh-guided" id="guided-reasoning" aria-labelledby="guided-title" data-reveal>
    <header>
      <p className="vh-kicker">Question-led learning / Interactive example</p>
      <h2 id="guided-title">Do not skip to the answer.<br /><em>Build the reason.</em></h2>
      <p>Apex can slow a difficult problem down into one useful question at a time. You make the connection first. The hint and worked relationship come after it.</p>
    </header>
    <div className="vh-guided-shell">
      <div className="vh-guided-tabs" role="tablist" aria-label="Choose a guided question">
        {questions.map((item, index) => <button
          type="button"
          role="tab"
          id={`guided-question-${index}`}
          aria-selected={questionIndex === index}
          aria-controls="guided-question-panel"
          tabIndex={questionIndex === index ? 0 : -1}
          onClick={() => chooseQuestion(index)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
              event.preventDefault();
              moveQuestionFocus((index + 1) % questions.length);
            }
            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
              event.preventDefault();
              moveQuestionFocus((index - 1 + questions.length) % questions.length);
            }
            if (event.key === 'Home') {
              event.preventDefault();
              moveQuestionFocus(0);
            }
            if (event.key === 'End') {
              event.preventDefault();
              moveQuestionFocus(questions.length - 1);
            }
          }}
          key={item.code}
        ><span>0{index + 1}</span><strong>{item.short}</strong><small>{item.subject}</small></button>)}
      </div>
      <div className="vh-guided-panel" role="tabpanel" id="guided-question-panel" aria-labelledby={`guided-question-${questionIndex}`}>
        <div className="vh-guided-question">
          <span>{question.code}</span>
          <h3>{question.prompt}</h3>
          <p className="vh-guided-expression">{question.expression}</p>
          <p>{question.transfer}</p>
          <small>Original demonstration. It does not submit work, generate a mark or save progress.</small>
        </div>
        <div className="vh-guided-coach">
          <ol className="vh-guided-loader" aria-label={`Reasoning step ${step + 1} of ${question.steps.length}`}>
            {question.steps.map((item, index) => <li data-state={index < step ? 'complete' : index === step ? 'active' : 'waiting'} key={item[0]}><span>{index < step ? <Check aria-hidden /> : String(index + 1).padStart(2, '0')}</span><strong>{item[0]}</strong></li>)}
          </ol>
          <div className="vh-guided-prompt" aria-live="polite">
            <span>Step {step + 1} / {question.steps.length}</span>
            <h3>{current[1]}</h3>
            <button type="button" className="vh-secondary" aria-expanded={hintOpen} onClick={() => setHintOpen(value => !value)}>{hintOpen ? 'Hide the reasoning cue' : 'Open the reasoning cue'}</button>
            {hintOpen && <p>{current[2]}</p>}
          </div>
          <div className="vh-guided-actions">
            <button type="button" className="vh-primary" onClick={advance}>{step === question.steps.length - 1 ? <><RotateCcw aria-hidden /> Start again</> : <>Next step <ArrowRight aria-hidden /></>}</button>
            <Link to="/chatbot">Try a question in Apex <ArrowRight aria-hidden /></Link>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
