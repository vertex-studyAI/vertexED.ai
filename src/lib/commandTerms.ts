import type { ExamBoard } from '@/types/curriculum';
import { BOARD_CONFIGS } from '@/lib/curriculum';

export const COMMAND_TERM_DEFINITIONS: Record<string, string> = {
  Analyse: 'Break down into parts; examine relationships and implications.',
  Analyze: 'Break down into parts; examine relationships and implications.',
  Apply: 'Use knowledge in a new or given context.',
  Assess: 'Weigh strengths and limitations; form a balanced judgment.',
  Calculate: 'Obtain a numerical answer with working shown.',
  Compare: 'Identify similarities and differences between items.',
  Contrast: 'Emphasize differences between items.',
  Define: 'State the precise meaning of a term.',
  Demonstrate: 'Show clearly through examples or reasoning.',
  Describe: 'Give a detailed account of features or characteristics.',
  Discuss: 'Present key points with arguments for and against.',
  Deduce: 'Reach a logical conclusion from given information.',
  Derive: 'Show the steps to obtain a result from first principles.',
  Differentiate: 'Explain how two things differ.',
  Draw: 'Produce a labelled diagram or graph.',
  Evaluate: 'Judge the value or significance with evidence.',
  Examine: 'Inspect closely; consider in detail.',
  Explain: 'Give reasons; make clear how or why.',
  Identify: 'Recognize and name the relevant item(s).',
  Justify: 'Give valid reasons or evidence to support a claim.',
  List: 'Give a series of points without detail.',
  Name: 'State the term or item required.',
  Outline: 'Give a brief structured summary of main points.',
  Predict: 'State what is likely to happen based on evidence.',
  Sketch: 'Draw a rough diagram showing essential features.',
  State: 'Express in clear terms without elaboration.',
  Suggest: 'Propose a plausible answer with brief reasoning.',
  Write: 'Produce a structured written response.',
};

export function getCommandTermsForBoard(board: ExamBoard | null): Array<{ term: string; definition: string }> {
  if (!board) {
    return Object.entries(COMMAND_TERM_DEFINITIONS)
      .slice(0, 12)
      .map(([term, definition]) => ({ term, definition }));
  }
  const terms = BOARD_CONFIGS[board].commandTerms ?? [];
  return terms.map((term) => ({
    term,
    definition: COMMAND_TERM_DEFINITIONS[term] ?? `Board-specific command term used in ${BOARD_CONFIGS[board].label} exams.`,
  }));
}

export function detectCommandTerms(text: string, board: ExamBoard | null): string[] {
  const terms = board ? BOARD_CONFIGS[board].commandTerms ?? [] : Object.keys(COMMAND_TERM_DEFINITIONS);
  const lower = text.toLowerCase();
  return terms.filter((t) => lower.includes(t.toLowerCase()));
}
