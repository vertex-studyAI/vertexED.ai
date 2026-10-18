import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(fs.readFileSync('public/myp5-content/manifest.json', 'utf8'));

test('generated MYP subject payloads preserve the complete curriculum inventory', () => {
  assert.equal(manifest.version, 'vertexed-myp5-content-v1');
  assert.equal(manifest.subjects.length, 17);
  assert.equal(manifest.lessonCount, 205);
  assert.equal(manifest.questionCount, 616);

  let lessonCount = 0;
  let questionCount = 0;
  const lessonIds = new Set();
  const questionIds = new Set();
  for (const subject of manifest.subjects) {
    const payload = JSON.parse(fs.readFileSync(`public/myp5-content/${subject.slug}.json`, 'utf8'));
    assert.equal(payload.version, manifest.version);
    assert.equal(payload.subjectSlug, subject.slug);
    assert.equal(payload.lessons.length, subject.lessonCount);
    assert.equal(payload.lessons.reduce((total, lesson) => total + lesson.practice.length, 0), subject.questionCount);
    for (const lesson of payload.lessons) {
      assert.equal(lesson.subjectSlug, subject.slug);
      assert.ok(!lessonIds.has(lesson.id), `duplicate lesson id: ${lesson.id}`);
      lessonIds.add(lesson.id);
      for (const question of lesson.practice) {
        assert.ok(!questionIds.has(question.id), `duplicate question id: ${question.id}`);
        questionIds.add(question.id);
      }
      assert.ok(lesson.sourceIds.every((id) => payload.sources.some((source) => source.id === id)));
      assert.ok((lesson.prerequisiteIds ?? []).every((id) => payload.prerequisites[id]));
    }
    lessonCount += payload.lessons.length;
    questionCount += payload.lessons.reduce((total, lesson) => total + lesson.practice.length, 0);
  }
  assert.equal(lessonCount, manifest.lessonCount);
  assert.equal(questionCount, manifest.questionCount);
});

test('browser routes load generated content instead of bundling the full authoring source', () => {
  for (const path of ['src/pages/MYPHub.tsx', 'src/pages/MYPSubject.tsx', 'src/pages/MYPEAssessment.tsx']) {
    const source = fs.readFileSync(path, 'utf8');
    assert.doesNotMatch(source, /from ['"]@\/content\/myp5Lessons['"]/);
  }
  const client = fs.readFileSync('src/content/myp5ContentClient.ts', 'utf8');
  assert.match(client, /import type \{ MypContentSource, MypLesson, MypPracticeQuestion \}/);
});
