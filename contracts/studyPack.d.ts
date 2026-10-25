import type { StudyPack } from '../src/content/studyPackTypes';
import type { MypPracticeQuestion } from '../src/content/myp5Lessons';
export function isStudyPack(value: unknown): value is StudyPack;
export function isAdditionalMypPractice(value: unknown): value is MypPracticeQuestion[];
