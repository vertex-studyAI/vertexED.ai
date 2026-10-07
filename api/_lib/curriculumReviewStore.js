import { createHash } from 'node:crypto';
import { lstat, readFile, realpath, stat } from 'node:fs/promises';
import { basename, extname, isAbsolute, relative, resolve, sep } from 'node:path';

const DIGEST_RE = /^[a-f0-9]{64}$/;
const MAX_METADATA_BYTES = 16 * 1024 * 1024;
const MAX_RESOURCE_BYTES = 24 * 1024 * 1024;

const MIME_TYPES = new Map([
  ['.md', 'text/markdown; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.pdf', 'application/pdf'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
]);

function fail(message) {
  const error = new Error(message);
  error.code = 'CURRICULUM_REVIEW_STORE_INVALID';
  return error;
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function serialize(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function isInside(root, candidate) {
  const path = relative(root, candidate);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

async function safeFile(root, path, maxBytes) {
  const lexical = resolve(root, path);
  if (!isInside(root, lexical)) throw fail('Review resource path leaves the configured store.');
  const real = await realpath(lexical);
  if (!isInside(root, real)) throw fail('Review resource resolves outside the configured store.');
  const info = await lstat(real);
  if (!info.isFile() || info.size > maxBytes) throw fail('Review resource is missing or exceeds its size bound.');
  return { path: real, size: info.size };
}

async function readJson(root, path) {
  const file = await safeFile(root, path, MAX_METADATA_BYTES);
  try {
    return JSON.parse(await readFile(file.path, 'utf8'));
  } catch {
    throw fail(`Invalid review metadata: ${basename(path)}.`);
  }
}

async function readJsonWithBytes(root, path) {
  const file = await safeFile(root, path, MAX_METADATA_BYTES);
  try {
    const bytes = await readFile(file.path);
    return { value: JSON.parse(bytes.toString('utf8')), bytes };
  } catch {
    throw fail(`Invalid review metadata: ${basename(path)}.`);
  }
}

function resourceKind(path) {
  const extension = extname(path).toLowerCase();
  if (extension === '.md' || extension === '.txt') return 'text';
  if (extension === '.json') return 'structured-text';
  if (extension === '.pdf') return 'pdf';
  if (['.png', '.jpg', '.jpeg'].includes(extension)) return 'image';
  if (extension === '.docx') return 'document';
  return 'download';
}

function lessonResourceScore(resource) {
  const value = `${resource.id} ${resource.path}`.toLowerCase();
  const extension = extname(resource.path).toLowerCase();
  let score = 0;
  if (/lesson|learner[_ -]?pack/.test(value)) score += 100;
  if (/learner[_ -]?source[_ -]?paragraph/.test(value)) score += 130;
  if (/teacher|worksheet|answer|key/.test(value)) score -= 80;
  if (extension === '.md') score += 30;
  else if (extension === '.pdf') score += 20;
  else if (extension === '.json') score += 15;
  else if (extension === '.docx') score += 10;
  return score;
}

function publicResource(resource) {
  return {
    id: resource.id,
    path: resource.path,
    sha256: resource.sha256,
    kind: resourceKind(resource.path),
    mimeType: MIME_TYPES.get(extname(resource.path).toLowerCase()) || 'application/octet-stream',
  };
}

export async function loadCurriculumReviewStore(env = process.env) {
  const configured = env.VERTEXED_CURRICULUM_REVIEW_STORE;
  if (!configured || !isAbsolute(configured)) {
    throw fail('Private curriculum review store is not configured.');
  }

  const root = await realpath(configured);
  const rootInfo = await stat(root);
  if (!rootInfo.isDirectory()) throw fail('Configured curriculum review store is not a directory.');
  const digest = basename(root);
  if (!DIGEST_RE.test(digest)) throw fail('Configured curriculum review store is not digest-addressed.');

  const [catalog, learnerPreview, receipt, sourceBatchFile] = await Promise.all([
    readJson(root, 'review-catalog.json'),
    readJson(root, 'learner-preview.json'),
    readJson(root, 'import-receipt.json'),
    readJsonWithBytes(root, 'source-batch.json'),
  ]);
  const sourceBatch = sourceBatchFile.value;
  const summary = {
    packets: receipt.packets,
    records: receipt.records,
    lessons: receipt.lessons,
    workedExamples: receipt.workedExamples,
    questions: receipt.questions,
    guidedRepeatQuestions: receipt.guidedRepeatQuestions,
    repairedPrompts: receipt.repairedPrompts,
    sourceResourcesVerified: receipt.sourceResourcesVerified,
    unsupportedRuntimeSubjectRecords: receipt.unsupportedRuntimeSubjectRecords,
    teacherApproved: receipt.teacherApproved,
    runtimeExportRecords: receipt.runtimeExportRecords,
    productionImported: receipt.productionImported,
  };

  if (receipt.bundleSha256 !== digest) {
    throw fail('Curriculum review metadata does not match the configured store digest.');
  }
  if (sha256(Buffer.from(serialize({ reviewCatalog: catalog, learnerPreview, summary }))) !== digest) {
    throw fail('Curriculum review projections or receipt counts failed the bundle hash check.');
  }
  if (!DIGEST_RE.test(catalog.sourceBatchSha256 || '')
    || sha256(sourceBatchFile.bytes) !== catalog.sourceBatchSha256) {
    throw fail('Curriculum source batch metadata failed its hash check.');
  }
  if (!Array.isArray(catalog.records) || catalog.records.length !== receipt.records) {
    throw fail('Curriculum review record count does not match its receipt.');
  }
  if (!Array.isArray(learnerPreview.records) || learnerPreview.records.length !== receipt.records) {
    throw fail('Curriculum learner preview count does not match its receipt.');
  }
  if (!Array.isArray(sourceBatch.packets) || sourceBatch.packets.length !== receipt.packets
    || sourceBatch.expectedRecords !== receipt.records) {
    throw fail('Curriculum source packet count does not match its receipt.');
  }
  if (receipt.state !== 'IMPORTED_TO_PRIVATE_REVIEW_STORE' || receipt.teacherApproved !== 0
    || receipt.productionImported !== 0 || receipt.runtimeExportRecords !== 0) {
    throw fail('Private review receipt contains a prohibited approval or release state.');
  }
  if (catalog.records.some((record) => record.review?.teacherApproved !== false
    || record.review?.productionImportPerformed !== false
    || record.review?.publicationStatus !== 'held-from-index')) {
    throw fail('Private review catalog contains a prohibited approval or publication state.');
  }

  const packetKeys = new Set();
  const resources = new Map();
  for (const packet of sourceBatch.packets) {
    if (!packet?.key || packetKeys.has(packet.key)) throw fail('Curriculum packet keys must be unique.');
    packetKeys.add(packet.key);
    const packetResources = Array.isArray(packet.resources) ? packet.resources : [];
    const ids = new Set();
    for (const resource of packetResources) {
      if (!resource?.id || ids.has(resource.id) || !DIGEST_RE.test(resource.sha256 || '')) {
        throw fail(`Invalid resource metadata in packet ${packet.key}.`);
      }
      ids.add(resource.id);
    }
    resources.set(packet.key, packetResources);
  }

  const lessons = catalog.records.filter((record) => record.kind === 'lesson');
  const workedExamples = catalog.records.filter((record) => record.kind === 'worked_example');
  const questions = catalog.records.filter((record) => record.kind === 'question');
  const resourceCount = [...resources.values()].reduce((total, items) => total + items.length, 0);
  if (lessons.length !== receipt.lessons || workedExamples.length !== receipt.workedExamples
    || questions.length !== receipt.questions || resourceCount !== receipt.sourceResourcesVerified
    || lessons.some((record) => !packetKeys.has(record.packetKey))) {
    throw fail('Curriculum lesson records do not match source packets.');
  }

  const packets = sourceBatch.packets.map((packet) => {
    const lesson = lessons.find((record) => record.packetKey === packet.key);
    const packetResources = resources.get(packet.key).map(publicResource);
    const preferred = [...packetResources].sort((a, b) => lessonResourceScore(b) - lessonResourceScore(a))[0] || null;
    return {
      key: packet.key,
      curriculum: packet.curriculum,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        topic: lesson.topic,
        explanation: lesson.solution?.explanation || '',
        review: lesson.review,
        provenance: lesson.provenance,
      },
      resources: packetResources,
      preferredResourceId: preferred?.id || null,
    };
  });

  return {
    root,
    digest,
    receipt,
    catalog,
    learnerPreview,
    sourceBatch,
    packets,
    resources,
  };
}

export function getReviewRecord(store, id) {
  return store.catalog.records.find((record) => record.id === id) || null;
}

export async function readReviewResource(store, packetKey, resourceId) {
  const resource = store.resources.get(packetKey)?.find((item) => item.id === resourceId);
  if (!resource) return null;
  const file = await safeFile(store.root, resource.path, MAX_RESOURCE_BYTES);
  const bytes = await readFile(file.path);
  if (sha256(bytes) !== resource.sha256) throw fail('Review resource bytes do not match their source hash.');
  const extension = extname(resource.path).toLowerCase();
  return {
    bytes,
    filename: basename(resource.path).replace(/[^A-Za-z0-9._-]/g, '_'),
    mimeType: MIME_TYPES.get(extension) || 'application/octet-stream',
    kind: resourceKind(resource.path),
    sha256: resource.sha256,
  };
}
