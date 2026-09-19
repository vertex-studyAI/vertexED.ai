export const EXAM_MATERIAL_KINDS = [
  'Past paper',
  'Task',
  'Mark scheme',
  'Notes',
  'Rubric',
  'Teacher feedback',
  'Syllabus extract',
];

export const EXAM_UPLOAD_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'txt', 'md', 'csv', 'png', 'jpg', 'jpeg',
];

export const EXAM_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

export function validateExamUpload(file, existing = []) {
  const name = typeof file?.name === 'string' ? file.name.trim() : '';
  const size = Number(file?.size);
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  if (!name) return { ok: false, error: 'Choose a file with a valid name.' };
  if (!EXAM_UPLOAD_EXTENSIONS.includes(extension)) {
    return { ok: false, error: `Unsupported file type. Use ${EXAM_UPLOAD_EXTENSIONS.join(', ')}.` };
  }
  if (!Number.isFinite(size) || size <= 0) return { ok: false, error: 'The selected file is empty.' };
  if (size > EXAM_UPLOAD_MAX_BYTES) return { ok: false, error: 'Files must be 10 MB or smaller.' };
  if (existing.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.size === size)) {
    return { ok: false, error: 'This file is already in the assessment setup.' };
  }
  return { ok: true, extension };
}

export function validateExamMaterialLink(value) {
  try {
    const url = new URL(String(value));
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('protocol');
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, error: 'Enter a complete http or https link.' };
  }
}

export function validateExamSetup(setup) {
  const missing = [];
  if (!String(setup?.assessmentType ?? '').trim()) missing.push('assessment type');
  if (!String(setup?.programme ?? '').trim()) missing.push('board or programme');
  if (!String(setup?.subject ?? '').trim()) missing.push('subject');
  if (!String(setup?.date ?? '').trim()) missing.push('date');
  if (!(Number(setup?.durationMinutes) > 0)) missing.push('duration');
  if (!(Number(setup?.totalMarks) > 0)) missing.push('total marks');
  return { ok: missing.length === 0, missing };
}

export function summarizeConfirmedResults(results, setup) {
  const confirmed = (Array.isArray(results) ? results : []).filter((result) => (
    result?.humanConfirmed === true
    && result.subject === setup.subject
    && result.assessmentType === setup.assessmentType
    && result.paper === setup.paper
    && Number(result.maxScore) === Number(setup.totalMarks)
    && Number(result.maxScore) > 0
    && Number(result.score) >= 0
    && Number(result.score) <= Number(result.maxScore)
  ));
  const averagePercent = confirmed.length >= 2
    ? confirmed.reduce((sum, result) => sum + (Number(result.score) / Number(result.maxScore)) * 100, 0) / confirmed.length
    : null;

  const countBy = (key) => confirmed.reduce((counts, result) => {
    const value = String(result[key] ?? '').trim();
    if (value) counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});

  return {
    confirmed,
    averagePercent,
    questionTypes: countBy('questionType'),
    topics: countBy('topic'),
    commandTerms: countBy('commandTerm'),
    averageMinutes: confirmed.some((result) => Number(result.durationMinutes) > 0)
      ? confirmed.reduce((sum, result) => sum + Math.max(0, Number(result.durationMinutes) || 0), 0)
        / confirmed.filter((result) => Number(result.durationMinutes) > 0).length
      : null,
  };
}
