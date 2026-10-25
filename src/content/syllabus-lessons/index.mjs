import { numberFoundations } from './number-foundations.mjs';
import { numberRepresentations } from './number-representations.mjs';
import { numberMeasures } from './number-measures.mjs';
import { numberExtensions } from './number-extensions.mjs';

export const syllabusLessons = [...numberFoundations, ...numberRepresentations, ...numberMeasures, ...numberExtensions];
export function syllabusLessonSource(id) {
  for (const [name, lessons] of [['number-foundations', numberFoundations], ['number-representations', numberRepresentations], ['number-measures', numberMeasures], ['number-extensions', numberExtensions]]) {
    if (lessons.some(lesson => lesson.id === id)) return `src/content/syllabus-lessons/${name}.mjs`;
  }
  throw new Error(`No syllabus lesson source for ${id}`);
}
