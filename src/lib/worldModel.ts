/**
 * World Model Learning — concept graph from real review/quiz/mock signals only.
 */

import type { ExamBoard } from '@/types/curriculum';
import { BOARD_CONFIGS } from '@/lib/curriculum';
import { getWeakestTopics } from '@/lib/weaknessTracker';
import { getConfidenceRatings } from '@/lib/portalFeatures';

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
  const weaknesses = getWeakestTopics(16);
  const confidence = getConfidenceRatings(subjects);
  const confMap = new Map(
    confidence.filter((c) => c.rating != null).map((c) => [c.subject, c.rating!]),
  );

  const nodes: ConceptNode[] = [];
  const edges: ConceptEdge[] = [];

  for (const w of weaknesses) {
    const mastery = Math.round(w.avgPercent);
    const id = `weak-${w.subject}-${w.topic.slice(0, 40)}`;
    nodes.push({
      id,
      label: w.topic.length > 48 ? `${w.topic.slice(0, 46)}…` : w.topic,
      subject: w.subject,
      mastery,
      layer: 'core',
      status: nodeStatus(mastery),
      source: 'review',
    });
  }

  const subjectsWithConfidence = subjects.filter((s) => confMap.has(s));
  for (const subject of subjectsWithConfidence) {
    const rating = confMap.get(subject)!;
    const examMastery = Math.min(100, Math.max(0, rating * 20));
    const examId = `exam-${subject}`;
    nodes.push({
      id: examId,
      label: `${subject} — your confidence check-in`,
      subject,
      mastery: examMastery,
      layer: 'exam',
      status: nodeStatus(examMastery),
      source: 'confidence',
    });
    const coreForSubject = nodes.find((n) => n.subject === subject && n.layer === 'core');
    if (coreForSubject) {
      edges.push({ from: coreForSubject.id, to: examId, relation: 'feeds-exam' });
    }
  }

  const coreNodes = nodes.filter((n) => n.layer === 'core');
  if (coreNodes.length >= 2) {
    edges.push({
      from: coreNodes[0].id,
      to: coreNodes[1].id,
      relation: 'interleave',
    });
  }

  const hasData = nodes.length > 0;
  const boardLabel = board ? BOARD_CONFIGS[board].label : 'your exam';
  const weakCount = nodes.filter((n) => n.status === 'weak').length;

  let narrative: string;
  let examScenario: string | null = null;

  if (!hasData) {
    narrative =
      'No concept map yet. Complete an answer review, quiz, or mock — then your weak topics appear here as real nodes, not guesses.';
  } else if (weakCount > 0) {
    narrative = `Your ${boardLabel} map shows ${weakCount} weak topic${weakCount === 1 ? '' : 's'} from real review scores. Drill those before adding new content.`;
    const weak = nodes.filter((n) => n.layer === 'core' && n.status === 'weak').slice(0, 2);
    if (weak.length > 0) {
      examScenario = `Focus block: 20 min on "${weak[0].label}"${weak[1] ? `, then 15 min on "${weak[1].label}"` : ''}. No new syllabus tonight.`;
    }
  } else {
    narrative = `Tracked topics look steady for ${boardLabel}. Run a timed mock to stress-test whether scores hold under pressure.`;
  }

  return { board, nodes, edges, narrative, examScenario, hasData };
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
