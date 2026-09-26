function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

const VALID_BOARDS = new Set([
  'IB_MYP',
  'IB_DP',
  'IGCSE',
  'GCSE',
  'A_LEVELS',
  'AP',
  'CBSE',
  'ICSE',
]);

function metadataValue(metadata, flatKey, nestedKey) {
  if (!metadata || typeof metadata !== 'object') return undefined;
  if (metadata[flatKey] !== undefined) return metadata[flatKey];
  const preferences = metadata.preferences;
  return preferences && typeof preferences === 'object'
    ? preferences[nestedKey]
    : undefined;
}

// Validate the calendar day instead of accepting an ISO-looking string. Invalid
// optional metadata must not make an otherwise valid curriculum update fail.
function calendarDateOrNull(value) {
  if (typeof value !== 'string') return null;
  const date = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1] ? date : null;
}

function recoverableCurriculum(user) {
  const metadata = user?.user_metadata ?? {};
  const board = metadataValue(metadata, 'board', 'board');
  const rawGrade = metadataValue(metadata, 'grade', 'grade');
  const grade = typeof rawGrade === 'number' && Number.isInteger(rawGrade)
    ? rawGrade
    : typeof rawGrade === 'string' && /^\d{1,2}$/.test(rawGrade.trim())
      ? Number.parseInt(rawGrade.trim(), 10)
      : null;
  const rawSubjects = metadataValue(metadata, 'subjects', 'subjects');
  const subjects = Array.isArray(rawSubjects)
    ? [...new Set(rawSubjects.flatMap(subject => (
        typeof subject === 'string' && subject.trim() ? [subject.trim()] : []
      )))]
    : [];

  if (typeof board !== 'string' || !VALID_BOARDS.has(board) || grade === null || subjects.length === 0) {
    return null;
  }

  const rawExamDate = metadataValue(metadata, 'exam_date', 'examDate');
  const examDate = calendarDateOrNull(rawExamDate);

  return { board, grade, subjects, exam_date: examDate };
}

/**
 * Recover only missing durable curriculum fields from already-complete Auth
 * metadata. Never overwrite learner-edited profile curriculum with Auth data.
 */
export function buildMissingCurriculumRecovery(profile, user) {
  const curriculum = recoverableCurriculum(user);
  if (!curriculum) return {};

  const recovery = {};
  if (typeof profile?.board !== 'string' || !profile.board.trim()) recovery.board = curriculum.board;
  if (!Number.isInteger(profile?.grade)) recovery.grade = curriculum.grade;
  if (!Array.isArray(profile?.subjects) || profile.subjects.length === 0) recovery.subjects = curriculum.subjects;
  if ((!profile?.exam_date || typeof profile.exam_date !== 'string') && curriculum.exam_date) {
    recovery.exam_date = curriculum.exam_date;
  }
  return recovery;
}

export function getProfileIdentityFields(user, metadata = {}) {
  return {
    email: typeof user?.email === 'string' && user.email.trim() ? user.email.trim() : null,
    fullName: firstNonEmptyString(
      metadata?.full_name,
      user?.user_metadata?.full_name,
      user?.user_metadata?.name,
    ),
    avatarUrl: firstNonEmptyString(
      metadata?.avatar_url,
      user?.user_metadata?.avatar_url,
    ),
  };
}

export function buildProfileUpdate(user, metadata = {}, updatedAt = new Date().toISOString()) {
  const fields = getProfileIdentityFields(user, metadata);
  const update = {
    email: fields.email,
    updated_at: updatedAt,
  };

  // Preserve learner-edited profile values when Auth metadata has no value.
  if (fields.fullName) update.full_name = fields.fullName;
  if (fields.avatarUrl) update.avatar_url = fields.avatarUrl;

  return update;
}

export function buildMissingProfileInsert(user, metadata = {}, updatedAt = new Date().toISOString()) {
  const fields = getProfileIdentityFields(user, metadata, updatedAt);
  return {
    id: user.id,
    email: fields.email,
    full_name: fields.fullName || 'Learner',
    avatar_url: fields.avatarUrl,
    updated_at: updatedAt,
  };
}

export function buildCurriculumProfileUpsert(
  user,
  curriculum,
  metadata = {},
  updatedAt = new Date().toISOString(),
) {
  return {
    ...buildMissingProfileInsert(user, metadata, updatedAt),
    board: curriculum?.board ?? null,
    grade: curriculum?.grade ?? null,
    subjects: Array.isArray(curriculum?.subjects) ? [...new Set(curriculum.subjects)] : [],
    exam_date: curriculum?.examDate ?? null,
  };
}
