import type { MypContentSource, MypLesson, MypPracticeQuestion } from './myp5Lessons';
import { MYP5_CONTENT_CATALOGUE } from './myp5Catalogue.ts';

export { MYP5_CONTENT_TOTALS } from './myp5Catalogue.ts';

export const MYP5_SUBJECT_TOTALS: Record<string, { lessons: number; questions: number }> = Object.fromEntries(
  MYP5_CONTENT_CATALOGUE.map((subject) => [subject.slug, { lessons: subject.lessonCount, questions: subject.questionCount }]),
);

export type MypPrerequisiteLink = { id: string; subjectSlug: string; topic: string };
export type MypSubjectContent = {
  version: 'vertexed-myp5-content-v1';
  subjectSlug: string;
  lessons: MypLesson[];
  sources: MypContentSource[];
  prerequisites: Record<string, MypPrerequisiteLink>;
};

export type MypQuestionEntry = MypPracticeQuestion & {
  lessonId: string;
  topic: string;
  subjectSlug: string;
  subject: string;
};

const subjectRequests = new Map<string, Promise<MypSubjectContent>>();

function isSubjectContent(value: unknown, subjectSlug: string): value is MypSubjectContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const payload = value as Partial<MypSubjectContent>;
  const totals = MYP5_SUBJECT_TOTALS[subjectSlug];
  return payload.version === 'vertexed-myp5-content-v1'
    && payload.subjectSlug === subjectSlug
    && Array.isArray(payload.lessons)
    && payload.lessons.length === totals?.lessons
    && payload.lessons.every((lesson) => lesson?.subjectSlug === subjectSlug && Array.isArray(lesson.practice))
    && payload.lessons.reduce((total, lesson) => total + lesson.practice.length, 0) === totals?.questions
    && Array.isArray(payload.sources)
    && Boolean(payload.prerequisites && typeof payload.prerequisites === 'object');
}

export function loadMypSubjectContent(subjectSlug: string): Promise<MypSubjectContent> {
  const summary = MYP5_CONTENT_CATALOGUE.find((subject) => subject.slug === subjectSlug);
  if (!summary) return Promise.reject(new Error('Unknown MYP subject.'));
  const existing = subjectRequests.get(subjectSlug);
  if (existing) return existing;
  const request = fetch(`/myp5-content/${encodeURIComponent(subjectSlug)}.json`, {
    cache: 'no-cache',
    headers: { Accept: 'application/json' },
  }).then(async (response) => {
    if (response.status === 403) throw Object.assign(new Error('This lesson library is awaiting subject review and is not available yet.'), { code: 'CONTENT_REVIEW_REQUIRED' });
    if (!response.ok) throw new Error('The lesson library could not be loaded.');
    const body = await response.text();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== summary.contentSha256) throw new Error('The lesson library is incomplete or out of date. Reload the page and try again.');
    const payload: unknown = JSON.parse(body);
    if (!isSubjectContent(payload, subjectSlug)) throw new Error('The lesson library response was incomplete.');
    return payload;
  }).catch((error) => {
    subjectRequests.delete(subjectSlug);
    throw error;
  });
  subjectRequests.set(subjectSlug, request);
  return request;
}

export function findLoadedLesson(content: MypSubjectContent, topic: string): MypLesson | null {
  return content.lessons.find((lesson) => lesson.topic === topic) ?? null;
}

export function sourcesForLoadedLesson(content: MypSubjectContent, lesson: MypLesson): MypContentSource[] {
  const ids = new Set(lesson.sourceIds);
  return content.sources.filter((source) => ids.has(source.id));
}

export function prerequisitesForLoadedLesson(content: MypSubjectContent, lesson: MypLesson): MypPrerequisiteLink[] {
  return (lesson.prerequisiteIds ?? []).map((id) => {
    const prerequisite = content.prerequisites[id];
    if (!prerequisite) throw new Error(`Unknown prerequisite: ${id}`);
    return prerequisite;
  });
}
