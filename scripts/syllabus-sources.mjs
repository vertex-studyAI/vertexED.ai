import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';

const officialHosts = new Set(['www.aqa.org.uk', 'www.cambridgeinternational.org', 'satsuite.collegeboard.org', 'apcentral.collegeboard.org', 'ibo.org', 'www.ibo.org']);
const officialUrl = z.string().url().refine(value => {
  const url = new URL(value);
  return url.protocol === 'https:' && officialHosts.has(url.hostname) && !url.username && !url.password && !url.port;
}, 'Only inspected official specification hosts are accepted.');
const text = z.string().trim().min(1);
export const syllabusSourcesSchema = z.object({ schemaVersion: z.literal(1), sources: z.array(z.object({
  id: text, programme: z.enum(['GCSE', 'IGCSE', 'SAT', 'AP', 'A_LEVELS', 'IB_DP', 'IB_MYP']), board: text, subject: text,
  specification: text, version: text, versionKind: z.enum(['published-edition', 'dated-web-snapshot']),
  url: officialUrl, supplementUrl: officialUrl.optional(), checkedOn: z.string().date(), locator: text,
  documentHash: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
  inspectionMode: z.enum(['official-indexed-excerpt', 'official-web-text', 'full-document']).optional(),
  mappingKind: z.enum(['syllabus-point', 'framework-skill']).optional(),
  points: z.array(text).min(1), limitations: text,
}).strict()).min(1) }).strict().superRefine((register, ctx) => {
  if (new Set(register.sources.map(source => source.id)).size !== register.sources.length) ctx.addIssue({ code: 'custom', message: 'Duplicate source identity.' });
  for (const source of register.sources) if (new Set(source.points).size !== source.points.length) ctx.addIssue({ code: 'custom', message: 'Duplicate specification point.' });
  for (const source of register.sources) if (source.inspectionMode === 'official-indexed-excerpt' && source.documentHash) ctx.addIssue({ code: 'custom', message: 'An indexed excerpt cannot claim a verified document hash.' });
});

export async function readSyllabusSources() {
  return syllabusSourcesSchema.parse(JSON.parse(await readFile(resolve(import.meta.dirname, '../src/content/syllabus-sources.json'), 'utf8'))).sources;
}

export function validateLessonMappings(lessons, sources) {
  for (const lesson of lessons) for (const mapping of lesson.syllabusMappings ?? []) {
    const source = sources.find(source => source.id === mapping.sourceId);
    if (!source || !source.points.includes(mapping.point)) throw new Error(`Unregistered syllabus point: ${lesson.id}/${mapping.sourceId}/${mapping.point}`);
    if (lesson.subject !== source.subject && !(lesson.subject === 'Mathematics' && source.subject === 'Calculus AB') &&
      !(lesson.subject === 'English' && source.subject === 'Reading and Writing')) throw new Error(`Syllabus subject mismatch: ${lesson.id}/${source.id}`);
  }
}
