import assert from 'node:assert/strict';
import test from 'node:test';
import { AP_COURSES } from '../src/content/apCatalogue.ts';
import { searchApCourses } from '../src/lib/apCourseSearch.ts';

test('an exact AP course name excludes incidental topic and substring matches', () => {
  for (const query of ['Calculus AB', 'AP Calculus AB', '  calculus-ab  ', 'ap calculus-ab']) {
    assert.deepEqual(searchApCourses(AP_COURSES, query).map((course) => course.slug), ['calculus-ab']);
  }
  assert.deepEqual(searchApCourses(AP_COURSES, 'Calculus AB').filter((course) => course.category === 'Sciences'), []);
});

test('all AP course titles, names without AP, and route slugs identify their own course', () => {
  for (const course of AP_COURSES) {
    for (const query of [course.title, course.title.replace(/^AP\s+/, ''), course.slug]) {
      assert.deepEqual(searchApCourses(AP_COURSES, query).map((match) => match.slug), [course.slug], query);
    }
  }
});

test('broader course and topic searches still discover multiple relevant courses', () => {
  assert.deepEqual(searchApCourses(AP_COURSES, 'Spanish').map((course) => course.slug).sort(),
    ['spanish-language-and-culture', 'spanish-literature-and-culture']);
  const calculus = searchApCourses(AP_COURSES, 'calculus');
  assert.ok(calculus.some((course) => course.slug === 'calculus-ab'));
  assert.ok(calculus.some((course) => course.slug === 'calculus-bc'));
  const topic = searchApCourses(AP_COURSES, 'derivatives');
  assert.ok(topic.some((course) => course.slug === 'calculus-ab'));
  assert.ok(topic.some((course) => course.slug === 'calculus-bc'));
  assert.deepEqual(searchApCourses(AP_COURSES, 'zzzzmissing'), []);
  assert.equal(searchApCourses(AP_COURSES, '').length, 42);
});
