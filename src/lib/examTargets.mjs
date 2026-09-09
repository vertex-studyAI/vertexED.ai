import { localDayKey } from './studyDates.mjs';

export function validExamDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function normalizeExamTargets(value, subjects) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter((item) => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id || item.id.length > 100
      || seen.has(item.id) || !subjects.includes(item.subject)
      || typeof item.paper !== 'string' || item.paper.length > 100 || !validExamDate(item.date)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 50).map(({ id, subject, paper, date }) => ({ id, subject, paper: paper.trim(), date }));
}

export function nextExamTarget(targets, subject, today = localDayKey()) {
  const matching = targets.filter((target) => (!subject || target.subject === subject) && validExamDate(target.date));
  return matching.filter((target) => target.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0]
    ?? matching.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}
