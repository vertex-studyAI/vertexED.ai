export const IB_PLAN_STATE_KEY = 'ib-diploma:plan';
export const IB_PLAN_VERSION = 1;

const SUBJECT_LEVELS = new Set(['HL', 'SL']);
const MILESTONE_KINDS = new Set(['IA', 'EE', 'Paper 1', 'Paper 2', 'Paper 3', 'Other']);
const MILESTONE_STATUSES = new Set(['not-started', 'in-progress', 'completed']);
const ID = /^[a-z][a-z0-9:-]{2,79}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(value, maximum) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, maximum) : '';
}

function isDate(value) {
  return DATE.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`));
}

export function emptyIbStudyPlan() {
  return { version: IB_PLAN_VERSION, subjects: [], milestones: [], updatedAt: null };
}

export function normaliseIbStudyPlan(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== IB_PLAN_VERSION) return null;
  if (!Array.isArray(value.subjects) || !Array.isArray(value.milestones) || value.subjects.length > 10 || value.milestones.length > 40) return null;
  if (value.updatedAt !== null && (typeof value.updatedAt !== 'string' || !Number.isFinite(Date.parse(value.updatedAt)))) return null;

  const subjectIds = new Set();
  const subjects = [];
  for (const subject of value.subjects) {
    const id = text(subject?.id, 80);
    const name = text(subject?.name, 80);
    const level = text(subject?.level, 2);
    const targetGrade = subject?.targetGrade === null || subject?.targetGrade === undefined ? null : Number(subject.targetGrade);
    if (!ID.test(id) || !name || !SUBJECT_LEVELS.has(level) || (targetGrade !== null && (!Number.isInteger(targetGrade) || targetGrade < 1 || targetGrade > 7)) || subjectIds.has(id)) return null;
    subjectIds.add(id);
    subjects.push({ id, name, level, targetGrade });
  }

  const milestoneIds = new Set();
  const milestones = [];
  for (const milestone of value.milestones) {
    const id = text(milestone?.id, 80);
    const title = text(milestone?.title, 140);
    const kind = text(milestone?.kind, 16);
    const subjectId = milestone?.subjectId === null ? null : text(milestone?.subjectId, 80);
    const dueDate = text(milestone?.dueDate, 10);
    const status = text(milestone?.status, 16);
    if (!ID.test(id) || !title || !MILESTONE_KINDS.has(kind) || !isDate(dueDate) || !MILESTONE_STATUSES.has(status) || milestoneIds.has(id)) return null;
    if (subjectId !== null && !subjectIds.has(subjectId)) return null;
    if (kind === 'EE' && subjectId !== null) return null;
    milestoneIds.add(id);
    milestones.push({ id, title, kind, subjectId, dueDate, status });
  }
  return { version: IB_PLAN_VERSION, subjects, milestones, updatedAt: value.updatedAt };
}

export function readIbStudyPlan(raw) {
  if (raw === null || raw === undefined) return { plan: emptyIbStudyPlan(), error: null };
  try {
    const plan = normaliseIbStudyPlan(JSON.parse(raw));
    if (!plan) throw new Error();
    return { plan, error: null };
  } catch {
    return { plan: null, error: 'Your existing IB plan could not be read. It has not been overwritten. Export account data before starting a new plan.' };
  }
}

export function ibPlanSummary(plan, today = new Date().toISOString().slice(0, 10)) {
  const valid = normaliseIbStudyPlan(plan);
  if (!valid) return null;
  const active = valid.milestones.filter((milestone) => milestone.status !== 'completed');
  // Use calendar keys rather than elapsed milliseconds so the displayed date is stable across time zones.
  const limit = new Date(`${today}T12:00:00Z`);
  limit.setUTCDate(limit.getUTCDate() + 14);
  const deadline = limit.toISOString().slice(0, 10);
  const upcoming = active.filter((milestone) => milestone.dueDate >= today && milestone.dueDate <= deadline).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return {
    subjectCount: valid.subjects.length,
    completedMilestones: valid.milestones.filter((milestone) => milestone.status === 'completed').length,
    openMilestones: active.length,
    upcoming,
    // Kept for a stable public shape. It is intentionally derived from dates, never a grade or readiness prediction.
    dueSoon: upcoming.length,
  };
}
