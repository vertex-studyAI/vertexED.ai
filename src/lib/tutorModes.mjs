export const TUTOR_MODES = [
  { id: 'explain', label: 'Explain', instruction: 'Explain the concept plainly using a concrete example and a short check for understanding. State assumptions and uncertainty.' },
  { id: 'teach', label: 'Teach', instruction: 'Teach in small steps. Check prerequisite knowledge first, give one example, then ask the learner to explain the next step. Adapt to their response.' },
  { id: 'quiz', label: 'Quiz', instruction: 'Ask one question at a time. Wait for an answer before giving feedback. Adapt difficulty to observed answers, never invent mastery or scores.' },
  { id: 'hint', label: 'Hint', instruction: 'Give one small hint without revealing the final answer. Ask what the learner tried. Offer the next hint only after a response.' },
  { id: 'solve-with-me', label: 'Solve With Me', instruction: 'Ask for an attempt or the first step. Reveal at most one step at a time, explain the reason, then wait. Identify a misconception only when supported by the actual response. Do not dump a full solution by default.' },
  { id: 'challenge', label: 'Challenge Me', instruction: 'Create an original analogous transfer problem, label it as AI-generated, and wait for an attempt. Increase difficulty only after demonstrated success. Do not call it an official exam question.' },
  { id: 'exam', label: 'Exam Mode', instruction: 'Run an original practice question without hints or answers until the student submits or explicitly ends the simulation. Give a suggested analysis afterwards, never an official mark or predicted grade.' },
];
export function tutorInstruction(value) { return (TUTOR_MODES.find(mode => mode.id === value) || TUTOR_MODES[1]).instruction; }
