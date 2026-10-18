import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
import { hasExactContentApproval } from '../contracts/contentPublication.js';
import { contentHash, readPublicationApprovals } from './content-publication.mjs';

const rootDirectory = resolve(import.meta.dirname, '..');
const articleFiles = {
  'ai-study-planner': 'AIStudyPlanner', 'ib-igcse-paper-maker': 'PaperMakerGuide',
  'notes-to-flashcards': 'NotesToFlashcards', 'ai-answer-reviewer': 'AIAnswerReviewer',
  'active-recall-spaced-repetition': 'StudyTechniquesActiveRecall', 'exam-strategy-time-management': 'ExamStrategyTimeManagement',
  'subject-guides-common-mistakes': 'SubjectGuidesCommonMistakes', 'best-ai-study-tools-2025': 'BestAIStudyTools2025',
  'automated-note-taking-guide': 'AutomatedNoteTakingGuide', 'how-to-use-ai-for-studying': 'HowToUseAIForStudying',
  'ai-chatbot-tutor': 'AIChatbotTutorGuide', 'ib-math-aa-ai-guide': 'IBMathGuide', 'igcse-science-revision': 'IGCSEScienceGuide',
  'essay-writing-with-ai': 'EssayWritingGuide', 'alevel-ap-exam-prep': 'ALevelAPGuide', 'is-using-ai-cheating': 'IsUsingAICheating',
  'how-to-cram-effectively': 'HowToCramEffectively', 'ib-tok-guide-ai': 'IBTOKGuide', 'ib-myp-humanities-guide': 'IBMYPHumanitiesGuide',
  'best-ai-prompts-for-students': 'BestAIPromptsForStudents', 'academic-burnout-guide': 'AcademicBurnoutGuide',
  'how-to-memorize-anything-fast': 'MemorizationTechniques', 'college-essays-with-ai': 'CollegeEssaysWithAI',
};
export const ARCHIVE_FILE = 'src/components/archives/ArchivesSubjectPage.tsx';
export const ARCHIVE_ROUTES = ['/archives-lnl', '/archives-history', '/archives-geography', '/archives/english', '/archives/history', '/archives/geography'];
export const LEGACY_MODULES = [
  ...Object.entries(articleFiles).map(([slug, name]) => ({ file: `src/pages/resources/${name}.tsx`, route: `/resources/${slug}`, kind: 'editorial-article' })),
  { file: ARCHIVE_FILE, route: '/archives', kind: 'archive-samples', title: 'Archive collection' },
  { file: 'src/components/learning/ComplexPlane.tsx', route: '/learn', kind: 'interactive-explanation', title: 'Complex plane', component: true },
  { file: 'src/components/ConceptLens.tsx', route: '/', kind: 'interactive-explanation', title: 'Concept Lens', component: true, id: 'concept-lens', headingId: 'concept-lens-title' },
  { file: 'src/components/landing/StudyGallery.tsx', route: '/', kind: 'worked-examples', title: 'Study examples', component: true, id: 'study-examples' },
  { file: 'src/components/landing/GuidedReasoning.tsx', route: '/', kind: 'guided-explanations', title: 'Guided reasoning', component: true, id: 'guided-reasoning' },
  { file: 'src/components/landing/RevisionJourney.tsx', route: '/', kind: 'revision-example', title: 'Revision journey', component: true, id: 'revision-journey', links: [['Study Notebook', '/study-notebook'], ['Paper Maker', '/paper-maker'], ['Study Planner', '/planner']] },
];
export const TEACHING_SECTIONS = [
  { file: 'src/pages/StudyTools.tsx', name: 'TECHNIQUES', route: '/study-tools', kind: 'study-methods' },
  { file: 'src/pages/StudyTools.tsx', name: 'EXAM_CHECKLIST', route: '/study-tools', kind: 'exam-checklist' },
  { file: 'src/pages/MYPEAssessment.tsx', name: 'ASSESSMENT_TECHNIQUE', route: '/myp/eassessment', kind: 'assessment-advice' },
  { file: 'src/pages/MYPEAssessment.tsx', name: 'ASSESSMENT_GUIDANCE', route: '/myp/eassessment', kind: 'assessment-advice' },
  { file: 'src/lib/commandTerms.ts', name: 'COMMAND_TERM_DEFINITIONS', route: '/study-tools', kind: 'command-term-definitions' },
  { file: 'src/pages/Home.tsx', name: 'learningStages', route: '/', kind: 'learning-stage-examples', heldValue: (items) => items.map((item) => ({ ...item, sample: ['Awaiting review', 'Study example awaiting subject review.', 'Use your teacher’s approved materials.'] })) },
  { file: 'src/pages/Home.tsx', name: 'assessmentQuestions', route: '/', kind: 'assessment-examples', heldValue: () => [['AWAITING SUBJECT REVIEW', 'Assessment examples are not available yet.']] },
  { file: 'src/components/ExamAssessmentSetup.tsx', name: 'EXAM_TECHNIQUE', route: '/exam-prep', kind: 'exam-technique', heldValue: () => ({ reading: [], assessment: [] }) },
  { file: 'src/components/RevisionTrace.tsx', name: 'stages', route: '/', kind: 'revision-trace-examples', heldValue: (items) => items.map((item) => ({ ...item,
    title: `${item.label} example awaiting subject review.`, text: 'This teaching example is not available yet.', annotation: 'Use your teacher’s approved material while review is in progress.' })) },
];
export const TEACHING_FUNCTIONS = [{ file: 'src/components/landing/ToolGallery.tsx', name: 'ToolPreview', route: '/', kind: 'tool-preview-examples',
  replacement: 'function ToolPreview() { return <div className="tool-preview preview-paper"><span className="preview-label">Example awaiting subject review</span><p>Teaching examples are not available yet.</p><span className="preview-note">Open the tool to work with your own material.</span></div>; }' }];
export const legacyModulePath = (file) => `module:/${file}#educational-module`;
export const sectionPath = ({ file, name }) => `module:/${file}#${encodeURIComponent(name)}`;

export async function readLiteral(source, file, name) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const statement of parsed.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const declaration = statement.declarationList.declarations.find((entry) => entry.name.getText(parsed) === name);
    if (!declaration?.initializer) continue;
    const code = ts.transpileModule(`export default ${declaration.initializer.getText(parsed)};`, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
    return (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)).default;
  }
  throw new Error(`Cannot inventory ${file}#${name}`);
}

export function teachingFunctionDeclaration(source, item) {
  const parsed = ts.createSourceFile(item.file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = parsed.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === item.name);
  if (!declaration) throw new Error(`Cannot inventory teaching function ${item.file}#${item.name}`);
  return { start: declaration.getStart(parsed), end: declaration.end, value: declaration.getText(parsed) };
}

export async function readLegacyPublication({ root = rootDirectory, approvals } = {}) {
  approvals ??= await readPublicationApprovals(root);
  const entries = new Map(approvals.map((entry) => [entry.path, entry]));
  const library = await readLiteral(await readFile(resolve(root, 'src/content/resourceLibrary.ts'), 'utf8'), 'resourceLibrary.ts', 'RESOURCE_ARTICLES');
  const modules = await Promise.all(LEGACY_MODULES.map(async (item) => {
    const source = await readFile(resolve(root, item.file), 'utf8');
    const hash = contentHash(source);
    const path = legacyModulePath(item.file);
    return { ...item, title: item.title ?? library.find((article) => article.to === item.route)?.title ?? 'Study resource', source, hash, path,
      approved: hasExactContentApproval(entries.get(path), hash) };
  }));
  const sections = await Promise.all([...TEACHING_SECTIONS, ...TEACHING_FUNCTIONS].map(async (item) => {
    const source = await readFile(resolve(root, item.file), 'utf8');
    const value = item.replacement ? teachingFunctionDeclaration(source, item).value : await readLiteral(source, item.file, item.name);
    const hash = contentHash(item.replacement ? value : JSON.stringify(value));
    const path = sectionPath(item);
    return { ...item, value, hash, path, approved: hasExactContentApproval(entries.get(path), hash) };
  }));
  const archive = modules.find((item) => item.file === ARCHIVE_FILE);
  const archiveSamples = await readLiteral(archive.source, ARCHIVE_FILE, 'ARCHIVE_SAMPLES');
  return { modules, sections, archiveSamples, heldRoutes: new Set([
    ...modules.filter((item) => item.kind === 'editorial-article' && !item.approved).map((item) => item.route),
    ...(!archive.approved ? ARCHIVE_ROUTES : []),
  ]) };
}

export function heldModuleSource(item) {
  // Replace the entire module, including imports and JSON-LD. No held JSX or teaching dependency reaches a public chunk.
  const links = item.links ? `<nav aria-label="Study tools" className="mx-auto flex max-w-4xl flex-wrap gap-6 px-6 pb-8">${item.links.map(([title, to]) => `<Link to=${JSON.stringify(to)}>${title}</Link>`).join('')}</nav>` : '';
  return `import ContentReviewNotice from '@/components/ContentReviewNotice';\n${item.links ? "import { Link } from 'react-router';" : ''}\nexport default function HeldContent(props: { title?: string; className?: string; id?: string } = {}) { return <><ContentReviewNotice id={props.id ?? ${JSON.stringify(item.id)}} headingId={${JSON.stringify(item.headingId)}} title={props.title ?? ${JSON.stringify(item.title)}} page={${!item.component}} />${links}</>; }\n`;
}
