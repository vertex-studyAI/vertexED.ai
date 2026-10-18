import { inputDateToPlanner } from './plannerTasks.mjs';

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value, max, required = false) => typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);
const identity = value => text(value, 100, true);
const unique = rows => new Set(rows.map(row => row.id)).size === rows.length;
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
export const COURSEWORK_STATUSES = ['planned', 'in-progress', 'complete'];

// Reject damaged collections as a whole. Never replace an unreadable record
// with an empty planner or silently discard revision/evidence history.
export function validateCoursework(value = []) {
  if (!Array.isArray(value) || value.length > 60 || !unique(value.filter(object))) throw new Error('Coursework records are invalid. Original data is preserved.');
  for (const project of value) {
    if (!object(project) || !identity(project.id) || !text(project.title, 160, true) || !text(project.subject, 100, true)
      || !text(project.course, 100) || !timestamp(project.createdAt) || !timestamp(project.updatedAt)
      || ('submitted' in project && typeof project.submitted !== 'boolean')
      || !Array.isArray(project.milestones) || project.milestones.length > 20 || !project.milestones.every(object) || !unique(project.milestones)) throw new Error('A coursework project is invalid. Original data is preserved.');
    inputDateToPlanner(project.deadline);
    for (const milestone of project.milestones) {
      if (!identity(milestone.id) || !text(milestone.title, 160, true) || !COURSEWORK_STATUSES.includes(milestone.status)
        || !text(milestone.evidence, 4000) || !Array.isArray(milestone.revisions) || milestone.revisions.length > 50
        || !milestone.revisions.every(entry => object(entry) && timestamp(entry.at) && text(entry.note, 2000, true))) throw new Error('A coursework milestone is invalid. Original data is preserved.');
      inputDateToPlanner(milestone.dueDate);
      if (milestone.dueDate > project.deadline) throw new Error('A milestone cannot be due after the project deadline.');
    }
  }
  return value;
}

export function courseworkDeadlines(projects, today) {
  return validateCoursework(projects).flatMap(project => [
    ...project.milestones.filter(milestone => milestone.status !== 'complete')
      .map(milestone => ({ projectId: project.id, milestoneId: milestone.id, title: `${project.title}: ${milestone.title}`, subject: project.subject, date: milestone.dueDate, overdue: milestone.dueDate < today })),
    ...(project.submitted === true ? [] : [{ projectId: project.id, milestoneId: `final:${project.id}`, title: `${project.title}: Final submission`, subject: project.subject, date: project.deadline, overdue: project.deadline < today }]),
  ])
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function removeCourseworkMilestone(projects, projectId, milestoneId, now = new Date().toISOString()) {
  validateCoursework(projects);
  const project = projects.find(row => row.id === projectId);
  if (!project?.milestones.some(row => row.id === milestoneId)) throw new Error('This milestone is no longer available. Reload the planner.');
  return validateCoursework(projects.map(row => row.id !== projectId ? row : { ...row, updatedAt: now, milestones: row.milestones.filter(item => item.id !== milestoneId) }));
}

export function updateCourseworkMilestone(projects, projectId, milestoneId, changes, revisionNote = '', now = new Date().toISOString()) {
  validateCoursework(projects);
  if (!object(changes) || Object.keys(changes).some(key => !['title', 'dueDate', 'status', 'evidence'].includes(key))) throw new Error('Unsupported milestone change.');
  if (!text(revisionNote, 2000)) throw new Error('Use at most 2,000 characters for a revision note.');
  const project = projects.find(row => row.id === projectId);
  const milestone = project?.milestones.find(row => row.id === milestoneId);
  if (!milestone) throw new Error('This milestone is no longer available. Reload the planner.');
  if (revisionNote.trim() && milestone.revisions.length >= 50) throw new Error('This milestone has 50 revision notes. Export your record before starting a new milestone.');
  const updated = { ...milestone, ...changes, revisions: revisionNote.trim() ? [...milestone.revisions, { at: now, note: revisionNote.trim() }] : milestone.revisions };
  return validateCoursework(projects.map(row => row.id !== projectId ? row : { ...row, updatedAt: now, milestones: row.milestones.map(item => item.id === milestoneId ? updated : item) }));
}

export function exportCoursework(projects) {
  validateCoursework(projects);
  return JSON.stringify({ format: 'vertexed-coursework', version: 1, projects }, null, 2);
}
