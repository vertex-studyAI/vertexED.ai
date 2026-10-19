#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const contentDirectory = resolve(root, 'public/myp5-content');
const check = process.argv.includes('--check');
const moduleSpecs = [
  ['MYP5_LESSON_EXPANSION', 'src/content/myp5LessonExpansion.ts'],
  ['MYP5_MATHEMATICS_COMPLETION', 'src/content/myp5MathematicsCompletion.ts'],
  ['MYP5_PHYSICS_COMPLETION', 'src/content/myp5PhysicsCompletion.ts'],
  ['MYP5_CHEMISTRY_COMPLETION', 'src/content/myp5ChemistryCompletion.ts'],
  ['MYP5_BIOLOGY_COMPLETION', 'src/content/myp5BiologyCompletion.ts'],
  ['MYP5_INTEGRATED_SCIENCES_COMPLETION', 'src/content/myp5IntegratedSciencesCompletion.ts'],
  ['MYP5_ENGLISH_COMPLETION', 'src/content/myp5EnglishCompletion.ts'],
  ['MYP5_HISTORY_COMPLETION', 'src/content/myp5HistoryCompletion.ts'],
  ['MYP5_ECONOMICS_COMPLETION', 'src/content/myp5EconomicsCompletion.ts'],
  ['MYP5_GEOGRAPHY_COMPLETION', 'src/content/myp5GeographyCompletion.ts'],
  ['MYP5_INTEGRATED_HUMANITIES_COMPLETION', 'src/content/myp5IntegratedHumanitiesCompletion.ts'],
  ['MYP5_SPANISH_COMPLETION', 'src/content/myp5SpanishCompletion.ts'],
  ['MYP5_DESIGN_COMPLETION', 'src/content/myp5DesignCompletion.ts'],
  ['MYP5_ARTS_COMPLETION', 'src/content/myp5ArtsCompletion.ts'],
  ['MYP5_PERSONAL_PROJECT_COMPLETION', 'src/content/myp5PersonalProjectCompletion.ts'],
  ['MYP5_PHE_COMPLETION', 'src/content/myp5PheCompletion.ts'],
];

function transpile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}

async function importSource(source) {
  return import(`data:text/javascript;base64,${Buffer.from(transpile(source)).toString('base64')}`);
}

async function importTypeScriptFile(relativePath) {
  return importSource(await readFile(resolve(root, relativePath), 'utf8'));
}

async function writeIfChanged(path, value) {
  let current = null;
  try { current = await readFile(path, 'utf8'); } catch { current = null; }
  if (current === value) return;
  if (check) throw new Error(`Stale generated MYP content: ${path}`);
  await writeFile(path, value, 'utf8');
}

const completionModules = {};
for (const [exportName, relativePath] of moduleSpecs) {
  completionModules[exportName] = (await importTypeScriptFile(relativePath))[exportName];
}

const lessonSource = (await readFile(resolve(root, 'src/content/myp5Lessons.ts'), 'utf8'))
  .replace(/^import \{ MYP5_[A-Z_]+ \} from '\.\/myp5[^']+';\n/gm, '');
const preamble = Object.entries(completionModules)
  .map(([name, value]) => `const ${name} = ${JSON.stringify(value)};`)
  .join('\n');
const lessonModule = await importSource(`${preamble}\n${lessonSource}`);
const { MYP5_LESSONS, MYP_CONTENT_SOURCES } = lessonModule;
const { MYP5_SUBJECTS } = await importTypeScriptFile('src/content/myp5.ts');

if (MYP5_LESSONS.length !== 205) throw new Error(`Expected 205 MYP lessons, received ${MYP5_LESSONS.length}`);
const questionCount = MYP5_LESSONS.reduce((total, lesson) => total + lesson.practice.length, 0);
if (questionCount !== 616) throw new Error(`Expected 616 MYP questions, received ${questionCount}`);

const lessonById = new Map(MYP5_LESSONS.map((lesson) => [lesson.id, lesson]));
const sourceById = new Map(MYP_CONTENT_SOURCES.map((source) => [source.id, source]));
const manifest = { version: 'vertexed-myp5-content-v1', lessonCount: 205, questionCount: 616, subjects: [] };

if (!check) await mkdir(contentDirectory, { recursive: true });
for (const subject of MYP5_SUBJECTS) {
  const lessons = MYP5_LESSONS.filter((lesson) => lesson.subjectSlug === subject.slug);
  if (lessons.length !== subject.topics.length) {
    throw new Error(`${subject.slug}: expected ${subject.topics.length} lessons, received ${lessons.length}`);
  }
  const sourceIds = new Set(lessons.flatMap((lesson) => lesson.sourceIds));
  const prerequisiteIds = new Set(lessons.flatMap((lesson) => lesson.prerequisiteIds ?? []));
  const sources = [...sourceIds].map((id) => {
    const source = sourceById.get(id);
    if (!source) throw new Error(`${subject.slug}: unknown source ${id}`);
    return source;
  });
  const prerequisites = Object.fromEntries([...prerequisiteIds].map((id) => {
    const prerequisite = lessonById.get(id);
    if (!prerequisite) throw new Error(`${subject.slug}: unknown prerequisite ${id}`);
    return [id, { id, subjectSlug: prerequisite.subjectSlug, topic: prerequisite.topic }];
  }));
  const subjectQuestionCount = lessons.reduce((total, lesson) => total + lesson.practice.length, 0);
  const payload = {
    version: 'vertexed-myp5-content-v1',
    subjectSlug: subject.slug,
    lessons,
    sources,
    prerequisites,
  };
  const body = `${JSON.stringify(payload)}\n`;
  await writeIfChanged(resolve(contentDirectory, `${subject.slug}.json`), body);
  manifest.subjects.push({ slug: subject.slug, lessonCount: lessons.length, questionCount: subjectQuestionCount,
    contentSha256: createHash('sha256').update(body).digest('hex') });
}

await writeIfChanged(resolve(contentDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeIfChanged(resolve(root, 'src/content/myp5Catalogue.ts'),
  `// Generated by scripts/generate-myp5-content.mjs. Do not edit by hand.\nexport const MYP5_CONTENT_TOTALS = ${JSON.stringify({ lessons: manifest.lessonCount, questions: manifest.questionCount })} as const;\n\nexport const MYP5_CONTENT_CATALOGUE = ${JSON.stringify(manifest.subjects, null, 2)} as const;\n`);
process.stdout.write(`[myp5-content] ${check ? 'Verified' : 'Wrote'} ${manifest.subjects.length} subject payloads: ${manifest.lessonCount} lessons, ${manifest.questionCount} questions.\n`);
