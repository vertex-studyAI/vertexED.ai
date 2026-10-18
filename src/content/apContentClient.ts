import { isApCourse } from '../../contracts/apContent.js';
import { AP_COURSES } from './apCatalogue.ts';
import type { ApCourse } from './apTypes';

const requests = new Map<string, Promise<ApCourse>>();

export function loadApCourse(slug: string): Promise<ApCourse> {
  const summary = AP_COURSES.find((course) => course.slug === slug);
  if (!summary) return Promise.reject(new Error('This AP course is not in the library.'));
  const existing = requests.get(slug);
  if (existing) return existing;
  const request = fetch(`/ap-content/${encodeURIComponent(slug)}.json`, { cache: 'no-cache', headers: { Accept: 'application/json' } })
    .then(async (response) => {
      if (response.status === 403) throw new Error('This course is awaiting subject review and is not available yet.');
      if (!response.ok) throw new Error('The course could not be loaded. Check your connection and try again.');
      const body = await response.text();
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
      const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
      if (hash !== summary.contentSha256) throw new Error('The course download is incomplete or out of date. Reload the page and try again.');
      const course = JSON.parse(body) as ApCourse;
      if (!isApCourse(course) || course.slug !== slug || course.title !== summary.title
        || course.modules.map((unit) => unit.id).join('|') !== summary.modules.map((unit) => unit.id).join('|')
        || course.modules.reduce((count, unit) => count + unit.questions.length, 0) !== summary.questionCount) {
        throw new Error('The course download is incomplete or out of date. Reload the page and try again.');
      }
      return course;
    }).catch((error: unknown) => {
      requests.delete(slug);
      throw error;
    });
  requests.set(slug, request);
  return request;
}
