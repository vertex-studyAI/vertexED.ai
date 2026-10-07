import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOARD_CONFIGS } from '../src/lib/curriculum.ts';

// This is an offline private-review importer. It cannot write to a database,
// approve material, alter the subject catalogue, or publish learner content.
const QUESTION_TYPES = new Set([
  'question', 'practice_question', 'short_answer', 'evidence_explanation',
  'inference', 'attitude_tone', 'reformulation', 'comparison',
  'vocabulary_in_context', 'connectors', 'extended_writing', 'oral_presentation',
]);
const PUBLIC_SEGMENTS = new Set(['public', 'dist', 'dist-ssr', 'src', 'api', 'assets', 'static', 'build', '.vercel', '.git']);
const FORBIDDEN_PROMPT = /^(?:See (?:the )?(?:learner pack|worksheet|teacher key)|TBD\b|TODO\b|placeholder\b)/i;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const serialize = (value) => `${JSON.stringify(value, null, 2)}\n`;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function text(value, field, { nullable = false } = {}) {
  if (nullable && (value === undefined || value === null)) return null;
  requireValue(typeof value === 'string' && value.trim().length > 0, `${field}: nonempty text required`);
  return value;
}

function identifier(value, field) {
  text(value, field);
  requireValue(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(value), `${field}: invalid identifier`);
  return value;
}

function inside(root, candidate) {
  const rel = relative(root, candidate);
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

async function verifiedFile(root, ref, field) {
  requireValue(ref && typeof ref === 'object', `${field}: source reference required`);
  text(ref.path, `${field}.path`);
  requireValue(!isAbsolute(ref.path), `${field}: use a relative source path`);
  requireValue(!ref.path.includes('\\') && ref.path.split('/').every((part) => part && part !== '.' && part !== '..'), `${field}: canonical relative source path required`);
  requireValue(/^[a-f0-9]{64}$/.test(ref.sha256), `${field}: SHA-256 required`);
  const path = await realpath(resolve(root, ref.path));
  requireValue(inside(root, path), `${field}: source path leaves the batch directory`);
  const info = await lstat(path);
  requireValue(info.isFile() && info.size <= 25_000_000, `${field}: regular source file under 25 MB required`);
  const bytes = await readFile(path);
  requireValue(sha256(bytes) === ref.sha256, `${field}: source checksum mismatch`);
  return bytes;
}

function kindOf(sourceType) {
  if (sourceType === 'lesson' || sourceType === 'worked_example') return sourceType;
  requireValue(QUESTION_TYPES.has(sourceType), `Unknown record type: ${sourceType}`);
  return 'question';
}

function declaredCount(data, rows, label) {
  for (const key of ['record_count', 'item_count']) {
    if (data[key] !== undefined) requireValue(data[key] === rows.length, `${label}: ${key} mismatch`);
  }
}

export async function loadCurriculumBatch(batchPath, boardConfigs = BOARD_CONFIGS) {
  const absolute = await realpath(batchPath);
  const root = await realpath(dirname(absolute));
  const inputBytes = await readFile(absolute);
  const batch = JSON.parse(inputBytes.toString('utf8'));
  requireValue(batch.schemaVersion === 1, 'Unsupported batch schemaVersion');
  identifier(batch.batchId, 'batchId');
  requireValue(Array.isArray(batch.packets) && batch.packets.length > 0, 'At least one packet required');
  requireValue(Number.isSafeInteger(batch.expectedRecords) && batch.expectedRecords > 0, 'expectedRecords required');
  const records = [];
  const packets = [];
  const contexts = [];
  const recordIds = new Set();
  const packetKeys = new Set();
  const sourceFiles = new Map([['source-batch.json', inputBytes]]);
  function retainSource(path, bytes) {
    requireValue(!sourceFiles.has(path) || sourceFiles.get(path).equals(bytes), `Conflicting source path: ${path}`);
    sourceFiles.set(path, bytes);
  }

  for (const packet of batch.packets) {
    identifier(packet.key, 'packet.key');
    requireValue(!packetKeys.has(packet.key), `Duplicate packet key: ${packet.key}`);
    packetKeys.add(packet.key);
    const curriculum = packet.curriculum;
    requireValue(curriculum && Object.hasOwn(boardConfigs, curriculum.board), `${packet.key}: unknown board`);
    text(curriculum.subject, 'curriculum.subject');
    text(curriculum.level, 'curriculum.level');
    text(curriculum.language, 'curriculum.language');
    const runtimeSubjectSupported = boardConfigs[curriculum.board].subjects.includes(curriculum.subject);
    const bytes = await verifiedFile(root, packet.manifest, `${packet.key}.manifest`);
    retainSource(packet.manifest.path, bytes);
    const manifest = JSON.parse(bytes.toString('utf8'));
    requireValue(Array.isArray(manifest) || (manifest && typeof manifest === 'object' && manifest.schema_version === '1.0'), `${packet.key}: unsupported manifest schema`);
    const rows = Array.isArray(manifest) ? manifest : manifest.records;
    requireValue(Array.isArray(rows) && rows.length > 0, `${packet.key}: records array required`);
    requireValue(rows.length === packet.expectedRecords, `${packet.key}: expectedRecords mismatch`);
    declaredCount(manifest, rows, packet.key);

    requireValue(Array.isArray(packet.resources) && packet.resources.length > 0, `${packet.key}: source resources required`);
    const resources = [];
    const resourceIds = new Set();
    const resourceBytesById = new Map();
    for (const resource of packet.resources) {
      text(resource.id, 'resource.id');
      requireValue(!resourceIds.has(resource.id), `${packet.key}: duplicate resource id`);
      resourceIds.add(resource.id);
      const resourceBytes = await verifiedFile(root, resource, `${packet.key}.resource:${resource.id}`);
      resourceBytesById.set(resource.id, resourceBytes);
      retainSource(resource.path, resourceBytes);
      resources.push({ ...resource, sizeBytes: resourceBytes.length, audience: 'private-reviewers' });
    }

    function sourceParagraphs(reference, indices) {
      requireValue(resourceIds.has(reference.paragraphSourceResourceId), `${packet.key}: paragraph source required`);
      const source = JSON.parse(resourceBytesById.get(reference.paragraphSourceResourceId).toString('utf8'));
      requireValue(source.schemaVersion === 1 && source.sourceDocumentResourceId === reference.resourceId, `${packet.key}: paragraph source binding mismatch`);
      requireValue(source.sourceDocumentSha256 === sha256(resourceBytesById.get(reference.resourceId)), `${packet.key}: paragraph document checksum mismatch`);
      requireValue(Array.isArray(source.paragraphs) && source.paragraphs.every((paragraph) => typeof paragraph === 'string'), `${packet.key}: invalid source paragraphs`);
      requireValue(Array.isArray(indices) && indices.length > 0 && indices.every((index) => Number.isInteger(index) && index >= 0 && index < source.paragraphs.length), `${packet.key}: invalid source paragraph index`);
      const separator = reference.joinWith ?? '\n\n';
      requireValue(separator === '\n' || separator === '\n\n', `${packet.key}: invalid paragraph separator`);
      return indices.map((index) => source.paragraphs[index]).join(separator);
    }

    const contextIds = new Set();
    for (const context of packet.contexts ?? []) {
      identifier(context.id, 'context.id');
      requireValue(!contextIds.has(context.id), `${packet.key}: duplicate context id`);
      requireValue(resourceIds.has(context.resourceId), `${packet.key}: unresolved context resource`);
      requireValue(context.text === sourceParagraphs(context, context.sourceParagraphsZeroIndexed), `${packet.key}: context differs from source paragraphs`);
      contextIds.add(context.id);
      contexts.push({ id: `${packet.key}:${context.id}`, packetKey: packet.key,
        title: text(context.title, 'context.title'), text: text(context.text, 'context.text'),
        usageNote: text(context.usageNote, 'context.usageNote', { nullable: true }),
        provenance: { resourceId: context.resourceId, sourceParagraphsZeroIndexed: context.sourceParagraphsZeroIndexed ?? null,
          joinWith: context.joinWith ?? '\n\n' } });
    }
    const repairs = new Map();
    for (const repair of packet.promptRepairs ?? []) {
      identifier(repair.recordId, 'repair.recordId');
      requireValue(!repairs.has(repair.recordId), `${packet.key}: duplicate prompt repair`);
      requireValue(resourceIds.has(repair.resourceId), `${packet.key}: unresolved repair resource`);
      requireValue((repair.contextIds ?? []).every((id) => contextIds.has(id)), `${packet.key}: unresolved prompt context`);
      text(repair.from, 'repair.from');
      text(repair.to, 'repair.to');
      requireValue(repair.to === sourceParagraphs(repair, [repair.sourceParagraphZeroIndexed]), `${packet.key}: repaired prompt differs from source paragraph`);
      repairs.set(repair.recordId, repair);
    }
    const bindings = new Map();
    for (const binding of packet.recordContextBindings ?? []) {
      identifier(binding.recordId, 'binding.recordId');
      requireValue(!bindings.has(binding.recordId), `${packet.key}: duplicate record context binding`);
      requireValue((binding.contextIds ?? []).every((id) => contextIds.has(id)), `${packet.key}: unresolved record context`);
      requireValue(Array.isArray(binding.dependencyIds ?? []), `${packet.key}: dependencyIds must be an array`);
      (binding.dependencyIds ?? []).forEach((id) => identifier(id, 'dependencyId'));
      bindings.set(binding.recordId, binding);
    }

    const counts = { lesson: 0, worked_example: 0, question: 0 };
    const usedRepairs = new Set();
    const usedBindings = new Set();
    for (const [sourceIndex, row] of rows.entries()) {
      requireValue(row && typeof row === 'object' && !Array.isArray(row), `${packet.key}: invalid record`);
      if (row.id !== undefined && row.item_id !== undefined) requireValue(row.id === row.item_id, `${packet.key}: conflicting id aliases`);
      const id = identifier(row.id ?? row.item_id, 'record.id');
      requireValue(!recordIds.has(id), `Duplicate record id: ${id}`);
      recordIds.add(id);
      const kind = kindOf(row.type);
      counts[kind] += 1;
      let prompt = text(row.prompt, `${id}.prompt`, { nullable: kind === 'lesson' });
      const repair = repairs.get(id);
      const binding = bindings.get(id);
      if (binding) usedBindings.add(id);
      if (repair) {
        requireValue(prompt === repair.from, `${id}: prompt changed since source repair was prepared`);
        prompt = repair.to;
        usedRepairs.add(id);
      }
      requireValue(prompt === null || !FORBIDDEN_PROMPT.test(prompt.trim()), `${id}: unresolved prompt reference`);
      const solution = {
        answer: text(row.answer, `${id}.answer`, { nullable: kind === 'lesson' }),
        explanation: text(row.explanation, `${id}.explanation`),
      };
      const record = {
        id, packetKey: packet.key, kind, sourceType: row.type,
        title: text(row.title ?? row.topic, `${id}.title`),
        topic: text(row.topic, `${id}.topic`), difficulty: row.difficulty ?? null,
        curriculum: { ...curriculum, runtimeSubjectSupported },
        prompt, contextIds: [...new Set([...(repair?.contextIds ?? []), ...(binding?.contextIds ?? [])])].map((key) => `${packet.key}:${key}`),
        dependencyIds: binding?.dependencyIds ?? [],
        contextUsageNote: binding?.usageNote ?? null,
        solution,
        review: { editorialStatus: 'unreviewed', publicationStatus: 'held-from-index',
          teacherApproved: false, learnerEfficacyVerified: false, productionImportPerformed: false,
          requiredActions: ['qualified-teacher-review', 'rights-and-source-review', 'product-integration-review',
            ...(!runtimeSubjectSupported ? ['runtime-subject-mapping-review'] : [])] },
        provenance: { manifestLibraryFileId: packet.manifest.libraryFileId ?? null,
          manifestPath: packet.manifest.path, manifestSha256: packet.manifest.sha256,
          sourceRecordIndex: sourceIndex, sourceRecordSha256: sha256(JSON.stringify(row)),
          sourceReviewClaim: row.source_review_status ?? null,
          sourcePublicationClaim: row.publication_status ?? manifest.publication_status ?? null,
          promptRepair: repair ?? null },
      };
      records.push(record);
    }
    requireValue(usedRepairs.size === repairs.size, `${packet.key}: repair references an absent record`);
    requireValue(usedBindings.size === bindings.size, `${packet.key}: context binding references an absent record`);
    if (packet.expectedTypeCounts) {
      requireValue(Object.keys(counts).every((kind) => packet.expectedTypeCounts[kind] === counts[kind]), `${packet.key}: record type counts mismatch`);
    }
    packets.push({ key: packet.key, curriculum: { ...curriculum, runtimeSubjectSupported }, derivation: packet.derivation ?? null,
      manifest: packet.manifest, archive: packet.archive ?? null, resources,
      recordCount: rows.length, typeCounts: counts, repairedPrompts: usedRepairs.size });
  }
  requireValue(records.length === batch.expectedRecords, 'Batch expectedRecords mismatch');
  const byId = new Map(records.map((record) => [record.id, record]));
  const visited = new Set();
  const visiting = new Set();
  function visit(id) {
    requireValue(byId.has(id), `Unresolved exercise dependency: ${id}`);
    requireValue(!visiting.has(id), `Cyclic exercise dependency: ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    byId.get(id).dependencyIds.forEach(visit);
    visiting.delete(id);
    visited.add(id);
  }
  records.forEach((record) => visit(record.id));
  const worked = records.filter((record) => record.kind === 'worked_example');
  for (const record of records) {
    if (record.kind !== 'question') continue;
    const matches = worked.filter((example) => example.prompt.trim() === record.prompt.trim()
      && example.solution.answer.trim() === record.solution.answer.trim()).map((example) => example.id);
    record.review.practiceMode = matches.length ? 'guided-repetition' : 'practice-awaiting-teacher-review';
    record.review.answerSharedWithWorkedExampleIds = matches;
    if (matches.length) record.review.requiredActions.push('replace-or-label-repeated-worked-answer-before-assessment');
  }
  const reviewCatalog = { schemaVersion: 1, batchId: batch.batchId, audience: 'private-reviewers',
    sourceRepository: { repository: batch.repository ?? null, commit: batch.sourceCommit ?? null },
    sourceBatchSha256: sha256(inputBytes), packets, contexts, records };
  // Explicit allow-list: raw source rows, review metadata and question solutions
  // must never leak through the future learner-facing projection.
  const learnerPreview = { schemaVersion: 1, batchId: batch.batchId,
    status: 'PRIVATE_REVIEW_PREVIEW_NOT_PUBLISHED', contexts: contexts.map(({ id, title, text: body, usageNote }) => ({ id, title, text: body, usageNote })),
    records: records.map((record) => ({ id: record.id, packetKey: record.packetKey, kind: record.kind,
      sourceType: record.sourceType, title: record.title, topic: record.topic,
      curriculum: { board: record.curriculum.board, subject: record.curriculum.subject,
        level: record.curriculum.level, language: record.curriculum.language },
      prompt: record.prompt, contextIds: record.contextIds, dependencyIds: record.dependencyIds, contextUsageNote: record.contextUsageNote,
      ...(record.kind === 'question' ? { practiceMode: record.review.practiceMode } : {}),
      ...(record.kind === 'lesson' ? { contentScope: 'metadata-only; full source document available to private reviewers' } : {}),
      ...(record.kind === 'worked_example' ? { workedSolution: record.solution } : {}) })) };
  const summary = { packets: packets.length, records: records.length,
    lessons: records.filter((record) => record.kind === 'lesson').length,
    workedExamples: records.filter((record) => record.kind === 'worked_example').length,
    questions: records.filter((record) => record.kind === 'question').length,
    guidedRepeatQuestions: records.filter((record) => record.review.practiceMode === 'guided-repetition').length,
    repairedPrompts: packets.reduce((sum, packet) => sum + packet.repairedPrompts, 0),
    sourceResourcesVerified: packets.reduce((sum, packet) => sum + packet.resources.length, 0),
    unsupportedRuntimeSubjectRecords: records.filter((record) => !record.curriculum.runtimeSubjectSupported).length,
    teacherApproved: 0, runtimeExportRecords: 0, productionImported: 0 };
  const bundleSha256 = sha256(serialize({ reviewCatalog, learnerPreview, summary }));
  return { reviewCatalog, learnerPreview, summary, bundleSha256, sourceFiles };
}

function privatePath(path) {
  requireValue(!resolve(path).split(sep).some((part) => PUBLIC_SEGMENTS.has(part)), 'Refusing an application, public, build, or Git output directory');
}

export async function stageCurriculumBatch(bundle, stageDirectory) {
  requireValue(/^[a-f0-9]{64}$/.test(bundle.bundleSha256), 'Invalid bundle SHA-256');
  requireValue(sha256(serialize({ reviewCatalog: bundle.reviewCatalog, learnerPreview: bundle.learnerPreview, summary: bundle.summary })) === bundle.bundleSha256, 'Bundle changed after validation');
  const expectedSources = new Map([['source-batch.json', bundle.reviewCatalog.sourceBatchSha256]]);
  for (const packet of bundle.reviewCatalog.packets) {
    expectedSources.set(packet.manifest.path, packet.manifest.sha256);
    for (const resource of packet.resources) expectedSources.set(resource.path, resource.sha256);
  }
  requireValue(bundle.sourceFiles instanceof Map && bundle.sourceFiles.size === expectedSources.size, 'Missing verified source files');
  for (const [path, hash] of expectedSources) {
    requireValue(bundle.sourceFiles.has(path) && sha256(bundle.sourceFiles.get(path)) === hash, 'Source bytes changed after validation');
  }
  privatePath(stageDirectory);
  // Resolve existing ancestry first so a symlink into public/ cannot create
  // even an empty staging directory there before the boundary is checked.
  let ancestor = resolve(stageDirectory);
  const suffix = [];
  while (true) {
    try { ancestor = await realpath(ancestor); break; }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      suffix.unshift(basename(ancestor));
      const parent = dirname(ancestor);
      requireValue(parent !== ancestor, 'Cannot resolve staging parent');
      ancestor = parent;
    }
  }
  privatePath(ancestor);
  const resolvedDirectory = resolve(ancestor, ...suffix);
  privatePath(resolvedDirectory);
  await mkdir(resolvedDirectory, { recursive: true, mode: 0o700 });
  const root = await realpath(resolvedDirectory);
  privatePath(root);
  const target = resolve(root, bundle.bundleSha256);
  const receipt = { schemaVersion: 1, state: 'IMPORTED_TO_PRIVATE_REVIEW_STORE',
    bundleSha256: bundle.bundleSha256, ...bundle.summary };
  const files = {
    'review-catalog.json': serialize(bundle.reviewCatalog),
    'learner-preview.json': serialize(bundle.learnerPreview),
    'import-receipt.json': serialize(receipt),
  };
  for (const [path, bytes] of bundle.sourceFiles) {
    requireValue(!Object.hasOwn(files, path) && inside(target, resolve(target, path)), 'Invalid or conflicting import source path');
    files[path] = bytes;
  }
  async function fileNames(directory, prefix = '') {
    const names = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      requireValue(!entry.isSymbolicLink(), 'Existing import contains a symbolic link');
      const name = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) names.push(...await fileNames(resolve(directory, entry.name), name));
      else { requireValue(entry.isFile(), 'Existing import contains a nonregular file'); names.push(name); }
    }
    return names.sort();
  }
  async function sameExisting() {
    try {
      const info = await lstat(target);
      requireValue(info.isDirectory() && !info.isSymbolicLink(), 'Existing import target is not a regular directory');
      const names = await fileNames(target);
      requireValue(JSON.stringify(names) === JSON.stringify(Object.keys(files).sort()), 'Existing import has unexpected or missing files');
      for (const [name, value] of Object.entries(files)) {
        const file = resolve(target, name);
        const info = await lstat(file);
        requireValue(info.isFile() && !info.isSymbolicLink(), 'Existing import contains a nonregular file');
        requireValue((await readFile(file)).equals(Buffer.isBuffer(value) ? value : Buffer.from(value)), 'Existing immutable import differs; refusing overwrite');
      }
      return true;
    } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
  }
  if (await sameExisting()) return { ...receipt, directory: target, idempotentReuse: true };
  const temporary = resolve(root, `.${bundle.bundleSha256}.${randomUUID()}`);
  await mkdir(temporary, { mode: 0o700 });
  try {
    for (const [name, value] of Object.entries(files)) {
      const path = resolve(temporary, name);
      await mkdir(dirname(path), { recursive: true, mode: 0o700 });
      await writeFile(path, value, { flag: 'wx', mode: 0o600 });
    }
    try { await rename(temporary, target); }
    catch (error) {
      if (!['EEXIST', 'ENOTEMPTY'].includes(error.code) || !(await sameExisting())) throw error;
      return { ...receipt, directory: target, idempotentReuse: true };
    }
    return { ...receipt, directory: target, idempotentReuse: false };
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

async function main() {
  const args = process.argv.slice(2);
  let batchPath;
  let stageDirectory;
  let check = false;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--batch') batchPath = args[++i];
    else if (args[i] === '--stage-dir') stageDirectory = args[++i];
    else if (args[i] === '--check') check = true;
    else throw new Error(`Unknown argument: ${args[i]}`);
  }
  requireValue(batchPath && (check !== Boolean(stageDirectory)), 'Usage: --batch <batch.json> (--check | --stage-dir <private-directory>)');
  const bundle = await loadCurriculumBatch(batchPath);
  const result = check ? { state: 'VALIDATED_NO_WRITES', bundleSha256: bundle.bundleSha256, ...bundle.summary }
    : await stageCurriculumBatch(bundle, stageDirectory);
  process.stdout.write(serialize(result));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
