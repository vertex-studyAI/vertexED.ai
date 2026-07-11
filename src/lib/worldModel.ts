/**
 * World Model Learning — interconnected concept graph from curriculum + weakness signals.
 */

import type { ExamBoard } from '@/types/curriculum';
import { BOARD_CONFIGS, getSubjectsForBoard } from '@/lib/curriculum';
import { getWeakestTopics } from '@/lib/weaknessTracker';
import { getConfidenceRatings } from '@/lib/portalFeatures';

export type ConceptNode = {
  id: string;
  label: string;
  subject: string;
  mastery: number;
  layer: 'foundation' | 'core' | 'exam';
  status: 'strong' | 'building' | 'weak' | 'unknown';
};

export type ConceptEdge = {
  from: string;
  to: string;
  relation: 'prerequisite' | 'feeds-exam' | 'interleave';
};

export type WorldModel = {
  board: ExamBoard | null;
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  narrative: string;
  examScenario: string;
};

const FOUNDATION_TOPICS: Record<string, string[]> = {
  Mathematics: ['Number & algebra', 'Functions & graphs'],
  Physics: ['Units & measurement', 'Forces basics'],
  Chemistry: ['Atomic structure', 'Bonding'],
  Biology: ['Cell biology', 'Organisation'],
  History: ['Chronology skills', 'Source analysis'],
  English: ['Comprehension', 'Paragraph structure'],
  default: ['Key definitions', 'Core vocabulary'],
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
  grade?: number | null,
): WorldModel {
  const weaknesses = getWeakestTopics(12);
  const confidence = getConfidenceRatings(subjects.length ? subjects : weaknesses.map((w) => w.subject));
  const confMap = new Map(confidence.map((c) => [c.subject, c.rating]));

  const subjectList =
    subjects.length > 0
      ? subjects.slice(0, 6)
      : board
        ? getSubjectsForBoard(board, grade).slice(0, 5)
        : ['Mathematics', 'Sciences', 'English', 'History'];

  const nodes: ConceptNode[] = [];
  const edges: ConceptEdge[] = [];

  for (const subject of subjectList) {
    const weakInSubject = weaknesses.filter((w) => w.subject === subject);
    const baseTopics = FOUNDATION_TOPICS[subject] ?? FOUNDATION_TOPICS.default;

    for (const topic of baseTopics) {
      nodes.push({
        id: `${subject}-foundation-${topic}`,
        label: topic,
        subject,
        mastery: 60,
        layer: 'foundation',
        status: 'building',
      });
    }

    const coreTopics =
      weakInSubject.length > 0
        ? weakInSubject.slice(0, 3).map((w) => w.topic)
        : [`${subject} exam techniques`, `${subject} key concepts`];

    for (const topic of coreTopics) {
      const w = weakInSubject.find((x) => x.topic === topic);
      const mastery = w ? Math.round(w.avgPercent) : 50;
      const id = `${subject}-core-${topic.slice(0, 30)}`;
      nodes.push({
        id,
        label: topic.length > 42 ? `${topic.slice(0, 40)}…` : topic,
        subject,
        mastery,
        layer: 'core',
        status: nodeStatus(mastery),
      });
      edges.push({
        from: `${subject}-foundation-${baseTopics[0]}`,
        to: id,
        relation: 'prerequisite',
      });
    }

    const conf = confMap.get(subject) ?? 3;
    const examMastery = Math.min(90, Math.max(20, conf * 18));
    const examId = `${subject}-exam-ready`;
    nodes.push({
      id: examId,
      label: `${subject} exam readiness`,
      subject,
      mastery: examMastery,
      layer: 'exam',
      status: nodeStatus(examMastery),
    });
    const lastCore = nodes.find((n) => n.subject === subject && n.layer === 'core');
    if (lastCore) {
      edges.push({ from: lastCore.id, to: examId, relation: 'feeds-exam' });
    }
  }

  if (subjectList.length >= 2) {
    edges.push({
      from: nodes.find((n) => n.subject === subjectList[0] && n.layer === 'core')?.id ?? nodes[0]?.id,
      to: nodes.find((n) => n.subject === subjectList[1] && n.layer === 'core')?.id ?? nodes[1]?.id,
      relation: 'interleave',
    });
  }

  const boardLabel = board ? BOARD_CONFIGS[board].label : 'your exam';
  const weakCount = nodes.filter((n) => n.status === 'weak').length;

  const narrative =
    weakCount > 0
      ? `Your ${boardLabel} world model shows ${weakCount} weak nodes — fix foundations before adding new content. Retrieval on weak topics moves mastery toward exam-ready layers.`
      : `Your ${boardLabel} concept map is balanced. Interleave subjects and run timed mocks to stress-test exam-ready nodes.`;

  const examScenario = buildExamScenario(board, subjectList, nodes);

  return { board, nodes, edges, narrative, examScenario };
}

function buildExamScenario(
  board: ExamBoard | null,
  subjects: string[],
  nodes: ConceptNode[],
): string {
  const weak = nodes.filter((n) => n.status === 'weak' && n.layer === 'core').slice(0, 2);
  const boardLabel = board ? BOARD_CONFIGS[board].label : 'exam';
  const subjectStr = subjects.slice(0, 2).join(' and ');

  if (weak.length === 0) {
    return `Scenario: Day 3 of ${boardLabel} revision week. You have 90 minutes. Spend 30 on ${subjectStr} retrieval, 30 on a timed mock section, 30 reviewing mark schemes.`;
  }

  return `Scenario: ${boardLabel} paper tomorrow. Skip new content. 20 min retrieval on "${weak[0].label}", 25 min rubric review on "${weak[1]?.label ?? weak[0].label}", then sleep. Exam-ready nodes activate under pressure only if core nodes were retrieved today.`;
}

export function getWorldModelPromptContext(model: WorldModel): string {
  const weak = model.nodes.filter((n) => n.status === 'weak').map((n) => `${n.label} (${n.mastery}%)`);
  const strong = model.nodes.filter((n) => n.status === 'strong').map((n) => n.label);
  return [
    model.narrative,
    weak.length ? `Weak nodes: ${weak.join('; ')}` : '',
    strong.length ? `Strong nodes: ${strong.slice(0, 5).join(', ')}` : '',
    model.examScenario,
  ]
    .filter(Boolean)
    .join(' ');
}
