import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { isApCourse } from '../contracts/apContent.js';
import { AP_COURSES } from '../src/content/apCatalogue.ts';

// AP Students current catalogue, inspected 15 October 2026. Networking is a
// pilot for a later public launch and must not silently appear as current.
const expected = [
  '2-d-art-and-design', '3-d-art-and-design', 'drawing', 'art-history', 'music-theory',
  'english-language-and-composition', 'english-literature-and-composition',
  'african-american-studies', 'comparative-government-and-politics', 'european-history',
  'human-geography', 'macroeconomics', 'microeconomics', 'psychology',
  'united-states-government-and-politics', 'united-states-history', 'world-history-modern',
  'calculus-ab', 'calculus-bc', 'computer-science-a', 'computer-science-principles', 'precalculus', 'statistics',
  'biology', 'chemistry', 'environmental-science', 'physics-1-algebra-based', 'physics-2-algebra-based',
  'physics-c-electricity-and-magnetism', 'physics-c-mechanics',
  'chinese-language-and-culture', 'french-language-and-culture', 'german-language-and-culture',
  'italian-language-and-culture', 'japanese-language-and-culture', 'latin',
  'spanish-language-and-culture', 'spanish-literature-and-culture', 'research', 'seminar',
  'business-personal-finance', 'cybersecurity',
].sort();
const directory = new URL('../src/content/ap/', import.meta.url);
const courses = await Promise.all((await readdir(directory)).filter((name) => name.endsWith('.json'))
  .map(async (name) => JSON.parse(await readFile(new URL(name, directory), 'utf8'))));

test('all 42 current AP courses have original study content and exact official identities', () => {
  assert.deepEqual(courses.map((course) => course.slug).sort(), expected);
  for (const course of courses) {
    assert.ok(isApCourse(course), course.slug);
    assert.equal(course.officialUrl, `https://apstudents.collegeboard.org/courses/ap-${course.slug}`);
    assert.equal(new Set(course.modules.map((unit) => unit.frameworkUnit)).size, course.modules.length, `${course.slug}: framework labels must distinguish each module`);
    const questions = course.modules.flatMap((unit) => unit.questions.map((question) => question.prompt));
    assert.equal(new Set(questions).size, questions.length, `${course.slug}: repeated questions do not supply distinct practice`);
  }
});

test('public downloads preserve every lesson and answer from the source library', async () => {
  for (const course of courses) {
    const body = await readFile(new URL(`../public/ap-content/${course.slug}.json`, import.meta.url), 'utf8');
    assert.deepEqual(JSON.parse(body), course);
    assert.equal(createHash('sha256').update(body).digest('hex'), AP_COURSES.find((entry) => entry.slug === course.slug)?.contentSha256, `${course.slug}: catalogue must identify the exact downloaded content`);
  }
});

test('content validation rejects missing answers, duplicate identities and unsafe source links', () => {
  const course = courses[0];
  assert.ok(course);
  for (const mutate of [
    (copy) => { copy.officialUrl = 'javascript:alert(1)'; },
    (copy) => { copy.slug = '../private'; },
    (copy) => { copy.modules[0].questions[0].answer = ''; },
    (copy) => { copy.modules[0].questions[1].id = copy.modules[0].questions[0].id; },
    (copy) => { copy.modules[0].workedExample.steps = []; },
    (copy) => { copy.modules[0].explanation = ['Only a placeholder']; },
    (copy) => { copy.modules.push(copy.modules[0]); },
  ]) {
    const copy = structuredClone(course); mutate(copy); assert.equal(isApCourse(copy), false);
  }
});

test('new framework structures and portfolio boundaries are explicit', () => {
  const get = (slug) => courses.find((course) => course.slug === slug);
  assert.equal(get('statistics').modules.length, 5, 'Fall 2026 Statistics has five units');
  assert.equal(get('computer-science-a').modules.length, 4, 'Revised CSA has four units');
  assert.equal(get('psychology').modules.length, 5);
  assert.match(JSON.stringify(get('precalculus')), /not assessed|not.*exam|unassessed/i);
  for (const slug of ['2-d-art-and-design', '3-d-art-and-design', 'drawing', 'research']) {
    assert.notEqual(get(slug).assessment, 'exam', `${slug} is not a standard written exam course`);
  }
});
