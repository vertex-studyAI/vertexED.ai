import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { isStudyPack } from '../contracts/studyPack.js';

const root = resolve(import.meta.dirname, '..');
const read = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const sorted = (value) => Array.isArray(value) ? value.map(sorted) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])])) : value;
const hash = value => createHash('sha256').update(JSON.stringify(sorted(value))).digest('hex');
const baseline = await read('docs/evidence/ap-myp-original-content-hashes-20261021.json');
const courses = await Promise.all((await readdir(resolve(root, 'src/content/ap'))).filter(name => name.endsWith('.json')).sort().map(name => read(`src/content/ap/${name}`)));
const manifest = await read('public/myp5-content/manifest.json');
const subjects = await Promise.all(manifest.subjects.map(subject => read(`public/myp5-content/${subject.slug}.json`)));
const records = [];
const units = [];
for (const [programme, items, kind] of [['AP', courses, 'ap'], ['IB_MYP', subjects, 'myp']]) {
  for (const item of items) {
    const slug = item.slug ?? item.subjectSlug;
    const original = structuredClone(item);
    const lessons = item.modules ?? item.lessons;
    for (const unit of original.modules ?? original.lessons) {
      delete unit.studyPack;
      const field = unit.questions ? 'questions' : 'practice';
      unit[field] = unit[field].filter(question => !question.id.startsWith('extension-'));
    }
    if (hash(original) !== baseline[kind][slug]) throw new Error(`Original content changed: ${programme}/${slug}`);
    for (const unit of lessons) {
      if (!isStudyPack(unit.studyPack)) throw new Error(`Missing or invalid resources: ${unit.id}`);
      const questions = unit.questions ?? unit.practice;
      units.push({ programme, subject: slug, id: unit.id, title: unit.title ?? unit.topic,
        additionalNoteWords: unit.studyPack.notes.flatMap(note => note.paragraphs).join(' ').split(/\s+/).length,
        workedExamples: 1 + unit.studyPack.workedExamples.length,
        flashcards: (unit.reviewCards?.length ?? 0) + unit.studyPack.flashcards.length,
        diagrams: unit.studyPack.diagrams.length, questions: questions.length,
        additionalQuestions: questions.filter(question => question.id.startsWith('extension-')).length,
        resourceHash: hash(unit.studyPack) });
    }
    records.push({ programme, subject: slug, modules: lessons.length, originalContentHash: hash(original),
      originalContentPreserved: true, expandedContentHash: hash(item),
      source: programme === 'AP' ? `src/content/ap/${slug}.json` : `src/content/myp5-resources/${slug}.json`,
      asset: programme === 'AP' ? `public/ap-content/${slug}.json` : `public/myp5-content/${slug}.json` });
  }
}
const totals = group => {
  const selected = units.filter(unit => unit.programme === group);
  return { subjects: records.filter(record => record.programme === group).length, modules: selected.length,
    ...Object.fromEntries(['additionalNoteWords', 'workedExamples', 'flashcards', 'diagrams', 'questions', 'additionalQuestions']
      .map(field => [field, selected.reduce((sum, unit) => sum + unit[field], 0)])) };
};
const report = { date: '2026-10-21', resourceVersion: '2026-10-21.1',
  scope: 'Every module in the current 42-course AP and 17-subject MYP catalogue has a populated resource pack. This is not exhaustive official syllabus coverage or independent subject approval.',
  publication: 'Editorial drafts; existing exact-hash approval gates remain in force. No deployment is part of this expansion.',
  additionsPerModule: { notes: 1, workedExamples: 1, flashcards: 4, diagrams: 1, questions: 2 },
  summary: { ap: totals('AP'), myp: totals('IB_MYP') },
  validation: { originalContent: 'All original course/lesson fields and question answers match the captured baseline after removing additions.',
    structure: 'contracts/studyPack.js; tests/ap-myp-resource-packs.test.mjs',
    answerScope: 'Internal editorial cross-checks and selected independent calculations; not a claim that every answer has qualified independent review.',
    browser: 'See docs/evidence/AP_MYP_RESOURCE_EXPANSION_20261021.md for final execution receipts.' },
  subjects: records, units };
const path = resolve(root, 'docs/evidence/ap-myp-resource-expansion-20261021.json');
const body = `${JSON.stringify(report, null, 2)}\n`;
if (process.argv.includes('--check')) {
  if (await readFile(path, 'utf8') !== body) throw new Error('AP/MYP resource expansion report is stale.');
} else await writeFile(path, body);
console.log(JSON.stringify(report.summary));
