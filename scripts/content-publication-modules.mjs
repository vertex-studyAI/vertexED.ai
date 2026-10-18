import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { hasExactContentApproval } from '../contracts/contentPublication.js';
import { approvedStaticPaths, contentHash, readPublicationApprovals } from './content-publication.mjs';
import { LEGACY_MODULES, TEACHING_SECTIONS, TEACHING_FUNCTIONS, heldModuleSource, legacyModulePath, readLegacyPublication, readLiteral, sectionPath, teachingFunctionDeclaration } from './legacy-content-publication.mjs';

const projectRoot = resolve(import.meta.dirname, '..');
const exportsByFile = {
  'src/content/formulaReference.ts': ['FORMULA_REFERENCE'],
  'src/content/examPractice.ts': ['EXAM_DRILLS'],
  'src/content/apCatalogue.ts': ['AP_COURSES'],
  'src/content/myp5Catalogue.ts': ['MYP5_CONTENT_CATALOGUE', 'MYP5_CONTENT_TOTALS'],
  'src/content/adaptiveQuestionBank.mjs': ['ADAPTIVE_QUESTION_BANK', 'ADAPTIVE_QUESTION_METADATA'],
  'src/content/complexNumbersPractice.mjs': ['COMPLEX_NUMBERS_PRACTICE', 'COMPLEX_DEFINITIONS'],
  'src/content/resourceLibrary.ts': ['RESOURCE_ARTICLES', 'ARCHIVE_COLLECTIONS', 'RESOURCE_ARTICLE_DIRECTORY', 'ARCHIVE_DIRECTORY'],
};

export const moduleContentPath = (file, id) => `module:/${file}#${encodeURIComponent(id)}`;

async function readAuthoringModule(source) {
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

function replaceInitializers(source, relativePath, replacements) {
  const parsed = ts.createSourceFile(relativePath, source, ts.ScriptTarget.Latest, true, relativePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  for (const statement of parsed.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const name = declaration.name.getText(parsed);
      if (name in replacements && declaration.initializer) edits.push({
        start: declaration.initializer.getStart(parsed), end: declaration.initializer.end, text: JSON.stringify(replacements[name]),
      });
    }
  }
  if (edits.length !== Object.keys(replacements).length) throw new Error(`Cannot apply publication boundary to ${relativePath}.`);
  let output = source;
  for (const edit of edits.sort((a, b) => b.start - a.start)) output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return output;
}

/** Keep history identities while removing held practice bodies from browser modules. */
export async function filterAdaptivePublicationModule(source, relativePath, { root = projectRoot, approvals = [] } = {}) {
  const adaptiveFile = 'src/content/adaptiveQuestionBank.mjs';
  const complexFile = 'src/content/complexNumbersPractice.mjs';
  if (![adaptiveFile, complexFile].includes(relativePath)) return null;
  const approvalsByPath = new Map(approvals.map((entry) => [entry.path, entry]));
  const publishedQuestions = (questions) => questions.flatMap((question) => {
    const contentRevision = contentHash(JSON.stringify(question));
    return hasExactContentApproval(approvalsByPath.get(moduleContentPath(adaptiveFile, question.id)), contentRevision)
      ? [{ ...question, contentRevision }] : [];
  });
  if (relativePath === complexFile) {
    const authoring = await readAuthoringModule(source);
    const definitions = authoring.COMPLEX_DEFINITIONS;
    return replaceInitializers(source, relativePath, {
      COMPLEX_NUMBERS_PRACTICE: publishedQuestions(authoring.COMPLEX_NUMBERS_PRACTICE),
      COMPLEX_DEFINITIONS: hasExactContentApproval(approvalsByPath.get(moduleContentPath(complexFile, 'complex-definitions')), contentHash(JSON.stringify(definitions))) ? definitions : {},
    });
  }
  const complex = await readAuthoringModule(await readFile(resolve(root, complexFile), 'utf8'));
  const resolvedSource = source.replace(/import\s*\{\s*COMPLEX_NUMBERS_PRACTICE\s*\}\s*from\s*['"]\.\/complexNumbersPractice\.mjs['"];?/, () => `const COMPLEX_NUMBERS_PRACTICE = ${JSON.stringify(complex.COMPLEX_NUMBERS_PRACTICE)};`);
  const authoring = await readAuthoringModule(resolvedSource);
  const metadata = authoring.ADAPTIVE_QUESTION_BANK.map(({ id, subject, topic, difficulty, type, curriculum, concepts }) => ({ id, subject, topic, difficulty, type, curriculum, concepts }));
  return replaceInitializers(source, relativePath, {
    ADAPTIVE_QUESTION_BANK: publishedQuestions(authoring.ADAPTIVE_QUESTION_BANK),
    ADAPTIVE_QUESTION_METADATA: metadata,
  });
}

/** Remove held educational bodies at bundling, retaining the original authoring files. */
export async function filterPublishedModule(source, relativePath, { root = projectRoot, approvals, allowedStatic } = {}) {
  const names = exportsByFile[relativePath];
  const legacyModule = LEGACY_MODULES.find((item) => item.file === relativePath);
  const teachingSections = TEACHING_SECTIONS.filter((item) => item.file === relativePath);
  const teachingFunction = TEACHING_FUNCTIONS.find((item) => item.file === relativePath);
  if (!names && !legacyModule && !teachingSections.length && !teachingFunction) return null;
  approvals ??= await readPublicationApprovals(root);
  const approvalsByPath = new Map(approvals.map((entry) => [entry.path, entry]));
  if (teachingFunction) {
    const declaration = teachingFunctionDeclaration(source, teachingFunction);
    return hasExactContentApproval(approvalsByPath.get(sectionPath(teachingFunction)), contentHash(declaration.value)) ? source
      : source.slice(0, declaration.start) + teachingFunction.replacement + source.slice(declaration.end);
  }
  if (legacyModule) {
    if (hasExactContentApproval(approvalsByPath.get(legacyModulePath(relativePath)), contentHash(source))) return source;
    const { modules } = await readLegacyPublication({ root, approvals });
    return heldModuleSource(modules.find((item) => item.file === relativePath));
  }
  if (teachingSections.length) {
    const replacements = {};
    for (const section of teachingSections) {
      const value = await readLiteral(source, relativePath, section.name);
      replacements[section.name] = hasExactContentApproval(approvalsByPath.get(sectionPath(section)), contentHash(JSON.stringify(value)))
        ? value : section.heldValue ? section.heldValue(value) : Array.isArray(value) ? [] : {};
    }
    return replaceInitializers(source, relativePath, replacements);
  }
  if (relativePath === 'src/content/resourceLibrary.ts') {
    const authoring = await readAuthoringModule(source);
    const { heldRoutes } = await readLegacyPublication({ root, approvals });
    return replaceInitializers(source, relativePath, {
      RESOURCE_ARTICLES: authoring.RESOURCE_ARTICLES.filter((item) => !heldRoutes.has(item.to)),
      ARCHIVE_COLLECTIONS: authoring.ARCHIVE_COLLECTIONS.filter((item) => !heldRoutes.has(item.to)),
      RESOURCE_ARTICLE_DIRECTORY: authoring.RESOURCE_ARTICLES.map(({ title, to }) => ({ title, available: !heldRoutes.has(to) })),
      ARCHIVE_DIRECTORY: authoring.ARCHIVE_COLLECTIONS.map(({ title, to }) => ({ title, available: !heldRoutes.has(to) })),
    });
  }
  if (relativePath === 'src/content/adaptiveQuestionBank.mjs' || relativePath === 'src/content/complexNumbersPractice.mjs') {
    return filterAdaptivePublicationModule(source, relativePath, { root, approvals });
  }
  allowedStatic ??= await approvedStaticPaths({ root, approvals });
  const authoring = await readAuthoringModule(source);
  const replacements = {};
  if (relativePath === 'src/content/apCatalogue.ts') {
    replacements.AP_COURSES = authoring.AP_COURSES.map((course) => allowedStatic.has(`/ap-content/${course.slug}.json`) ? course : {
      slug: course.slug, title: course.title, category: course.category, officialUrl: course.officialUrl, assessment: course.assessment,
      summary: 'Study material is awaiting subject review.', frameworkNote: 'Full syllabus coverage and subject review are not complete.',
      contentSha256: course.contentSha256, modules: [], questionCount: 0,
    });
  } else if (relativePath === 'src/content/myp5Catalogue.ts') {
    replacements.MYP5_CONTENT_CATALOGUE = authoring.MYP5_CONTENT_CATALOGUE.map((subject) => allowedStatic.has(`/myp5-content/${subject.slug}.json`)
      ? subject : { ...subject, lessonCount: 0, questionCount: 0 });
    replacements.MYP5_CONTENT_TOTALS = {
      lessons: replacements.MYP5_CONTENT_CATALOGUE.reduce((sum, subject) => sum + subject.lessonCount, 0),
      questions: replacements.MYP5_CONTENT_CATALOGUE.reduce((sum, subject) => sum + subject.questionCount, 0),
    };
  } else {
    const approvalsByPath = new Map(approvals.map((entry) => [entry.path, entry]));
    for (const name of names) replacements[name] = authoring[name].filter((item) => hasExactContentApproval(
      approvalsByPath.get(moduleContentPath(relativePath, item.id)), contentHash(JSON.stringify(item)),
    ));
  }
  return replaceInitializers(source, relativePath, replacements);
}

export function contentPublicationModulesPlugin() {
  return {
    name: 'reviewed-content-modules',
    enforce: 'pre',
    async transform(source, id) {
      const cleanId = id.split('?')[0].replaceAll('\\', '/');
      const file = [...Object.keys(exportsByFile), ...LEGACY_MODULES.map((item) => item.file), ...TEACHING_SECTIONS.map((item) => item.file), ...TEACHING_FUNCTIONS.map((item) => item.file)].find((name) => cleanId === resolve(projectRoot, name).replaceAll('\\', '/'));
      if (!file) return null;
      if (/[?&](?:raw|url)(?:[=&]|$)/.test(id)) throw new Error('Raw educational source imports cannot bypass publication review.');
      const code = await filterPublishedModule(source, file);
      return { code, map: null };
    },
  };
}
