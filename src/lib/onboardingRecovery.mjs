import { getUserContentStorageScope, userContentStorageKeys } from './userContentStorageScope.mjs';

const BOARDS = new Set(['IB_MYP', 'IB_DP', 'IGCSE', 'GCSE', 'A_LEVELS', 'AP', 'CBSE', 'ICSE']);
const STORAGE_ERROR = 'Your setup could not be saved on this device. Keep this page open until setup finishes.';
const CORRUPT_ERROR = 'Your saved setup could not be read. Original device data is preserved for export; new choices will not replace it.';

export function onboardingDraftKey(accountId) {
  return `${userContentStorageKeys(accountId).artifacts}:onboarding_draft`;
}

function validDate(value) {
  if (value === null) return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function validDraft(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) return false;
  const curriculum = value.curriculum;
  return typeof value.username === 'string' && value.username.length <= 20
    && typeof value.schoolName === 'string' && value.schoolName.length <= 160
    && [1, 2].includes(value.step)
    && curriculum && typeof curriculum === 'object' && !Array.isArray(curriculum)
    && (curriculum.board === null || BOARDS.has(curriculum.board))
    && (curriculum.grade === null || (Number.isInteger(curriculum.grade) && curriculum.grade >= 1 && curriculum.grade <= 13))
    && Array.isArray(curriculum.subjects) && curriculum.subjects.length <= 30
    && curriculum.subjects.every(subject => typeof subject === 'string' && subject.length <= 200)
    && validDate(curriculum.examDate)
    && (curriculum.examTargets === undefined || (Array.isArray(curriculum.examTargets) && curriculum.examTargets.length <= 100
      && curriculum.examTargets.every(target => target && typeof target === 'object'
        && ['id', 'subject', 'paper'].every(key => typeof target[key] === 'string' && target[key].length <= 200)
        && typeof target.date === 'string' && (target.date === '' || validDate(target.date)))));
}

export function readOnboardingDraft(storage, accountId) {
  if (!accountId || getUserContentStorageScope() !== accountId) return { draft: null, revision: null, error: null };
  try {
    if (!storage) return { draft: null, revision: null, error: STORAGE_ERROR };
    const raw = storage.getItem(onboardingDraftKey(accountId));
    if (raw === null) return { draft: null, revision: null, error: null };
    const draft = JSON.parse(raw);
    return validDraft(draft)
      ? { draft, revision: raw, error: null }
      : { draft: null, revision: raw, error: CORRUPT_ERROR };
  } catch {
    return { draft: null, revision: null, error: CORRUPT_ERROR };
  }
}

export function writeOnboardingDraft(storage, accountId, draft, expectedRevision) {
  if (!accountId || getUserContentStorageScope() !== accountId) return { ok: false, error: 'Account changed. Your previous setup was not copied to this account.' };
  if (!validDraft(draft)) return { ok: false, error: STORAGE_ERROR };
  const existing = readOnboardingDraft(storage, accountId);
  if (existing.error) return { ok: false, error: existing.error };
  if (existing.revision !== expectedRevision) return { ok: false, error: 'Setup changed in another tab. Refresh to restore the latest saved choices before continuing.' };
  try {
    const revision = JSON.stringify(draft);
    storage.setItem(onboardingDraftKey(accountId), revision);
    return { ok: true, revision };
  } catch { return { ok: false, error: STORAGE_ERROR }; }
}

export function clearOnboardingDraft(storage, accountId, expectedRevision) {
  if (!accountId || getUserContentStorageScope() !== accountId) return false;
  const existing = readOnboardingDraft(storage, accountId);
  if (existing.error || existing.revision !== expectedRevision) return false;
  try { storage.removeItem(onboardingDraftKey(accountId)); return true; }
  catch { return false; }
}
