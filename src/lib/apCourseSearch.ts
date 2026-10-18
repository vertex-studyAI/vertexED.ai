import type { ApCourseSummary } from '../content/apTypes';
import { normaliseResourceQuery, searchResources } from './resourceSearch.ts';

/** A named course takes precedence over incidental mentions in another course. */
export function searchApCourses(courses: readonly ApCourseSummary[], query: string): ApCourseSummary[] {
  const courseName = normaliseResourceQuery(query).replace(/^ap(?:\s+|$)/, '');
  if (courseName) {
    const exact = courses.filter((course) => normaliseResourceQuery(course.slug) === courseName
      || normaliseResourceQuery(course.title).replace(/^ap\s+/, '') === courseName);
    if (exact.length) return exact;
  }
  return searchResources(courses.map((course) => ({
    ...course,
    description: course.summary,
    keywords: `${course.category} ${course.modules.map((unit) => `${unit.title} ${unit.focus}`).join(' ')}`,
  })), query);
}
