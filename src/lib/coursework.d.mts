export type CourseworkMilestone = { id: string; title: string; dueDate: string; status: 'planned' | 'in-progress' | 'complete'; evidence: string; revisions: Array<{ at: string; note: string }> };
export type CourseworkProject = { id: string; title: string; subject: string; course: string; deadline: string; submitted?: boolean; createdAt: string; updatedAt: string; milestones: CourseworkMilestone[] };
export const COURSEWORK_STATUSES: CourseworkMilestone['status'][];
export function validateCoursework(value?: unknown): CourseworkProject[];
export function courseworkDeadlines(projects: CourseworkProject[], today: string): Array<{ projectId: string; milestoneId: string; title: string; subject: string; date: string; overdue: boolean }>;
export function removeCourseworkMilestone(projects: CourseworkProject[], projectId: string, milestoneId: string, now?: string): CourseworkProject[];
export function updateCourseworkMilestone(projects: CourseworkProject[], projectId: string, milestoneId: string, changes: Partial<Pick<CourseworkMilestone, 'title' | 'dueDate' | 'status' | 'evidence'>>, revisionNote?: string, now?: string): CourseworkProject[];
export function exportCoursework(projects: CourseworkProject[]): string;
