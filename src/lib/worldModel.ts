/**
 * World Model Learning — concept graph from real review/quiz/mock signals only.
 */

import type { ExamBoard } from '@/types/curriculum';

export type ConceptNode = {
  id: string;
  label: string;
  subject: string;
  mastery: number;
  layer: 'core' | 'exam';
  status: 'strong' | 'building' | 'weak' | 'unknown';
  source: 'review' | 'confidence';
};

export type ConceptEdge = {
  from: string;
  to: string;
  relation: 'feeds-exam' | 'interleave';
};

export type WorldModel = {
  board: ExamBoard | null;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  narrative: string;
  examScenario: string | null;
  hasData: boolean;
};

function nodeStatus(mastery: number): ConceptNode['status'] {
  if (mastery >= 75) return 'strong';
  if (mastery >= 55) return 'building';
  if (mastery > 0) return 'weak';
  return 'unknown';
}

export function buildWorldModel(
  board: ExamBoard | null,
  subjects: string[],
): WorldModel {
  void subjects;
  return {
    board,
    nodes: [],
    edges: [],
    narrative:
      'No verified concept map yet. This page will activate after reviewed catalogue attempts create evidence for curriculum nodes and prerequisites.',
    examScenario: null,
    hasData: false,
  };
}

export function getWorldModelPromptContext(model: WorldModel): string {
  if (!model.hasData) return model.narrative;
  const weak = model.nodes.filter((n) => n.status === 'weak').map((n) => `${n.label} (${n.mastery}%)`);
  const strong = model.nodes.filter((n) => n.status === 'strong').map((n) => n.label);
  return [
    model.narrative,
    weak.length ? `Weak nodes: ${weak.join('; ')}` : '',
    strong.length ? `Strong nodes: ${strong.slice(0, 5).join(', ')}` : '',
    model.examScenario ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}
