import { z } from 'zod';
import { validExamDate } from '../../src/lib/examTargets.mjs';

const Time12Schema = z.string().trim().regex(/^(?:0?[1-9]|1[0-2]):[0-5][0-9]\s+(?:AM|PM)$/i).max(11);
const DateSchema = z.string().trim().regex(/^(?:0?[1-9]|1[0-2])\/(?:0?[1-9]|[12][0-9]|3[01])\/(?:20[0-9]{2}|2100)$/).max(10);
const ShortText = z.string().trim().min(1).max(160);

const SingleRequestSchema = z.object({
  mode: z.literal('single').optional(),
  prompt: z.string().trim().min(1).max(2_000),
  tags: z.array(z.string()).max(30).default([]),
  existingTasks: z.array(z.unknown()).max(200).default([]),
}).strict();

const WeekRequestSchema = z.object({
  mode: z.literal('week'),
  weaknesses: z.array(z.string()).max(20).default([]),
  subjects: z.array(z.string()).max(20).default([]),
  examDaysLeft: z.number().int().min(0).max(3_650).nullable().default(null),
  examTargets: z.array(z.object({
    subject: ShortText,
    paper: z.string().trim().max(100),
    date: z.string().refine(validExamDate),
  }).strict()).max(50).optional(),
  hoursPerDay: z.number().min(1).max(6).optional(),
  existingTasks: z.array(z.unknown()).max(200).default([]),
}).strict();

const RawPlannerTaskSchema = z.object({
  'task name': ShortText.optional(),
  taskName: ShortText.optional(),
  'start time': Time12Schema.optional(),
  startTime: Time12Schema.optional(),
  'task duration': z.union([z.number(), z.string()]).optional(),
  taskDuration: z.union([z.number(), z.string()]).optional(),
  date: DateSchema.optional(),
  tag: z.string().trim().max(80).optional(),
}).passthrough();

function cleanStringArray(values, limit, itemLimit = 120) {
  return [...new Set(values.map((value) => value.trim().slice(0, itemLimit)).filter(Boolean))].slice(0, limit);
}

function summarizeExistingTask(value) {
  const parsed = RawPlannerTaskSchema.safeParse(value);
  if (!parsed.success) return null;
  const task = parsed.data;
  const name = task['task name'] ?? task.taskName;
  const start = task['start time'] ?? task.startTime;
  const duration = task['task duration'] ?? task.taskDuration;
  if (!name || !start || !task.date) return null;
  const numericDuration = Number.parseInt(String(duration ?? ''), 10);
  if (!Number.isInteger(numericDuration) || numericDuration < 1 || numericDuration > 1_440) return null;
  return { 'task name': name, date: task.date, 'start time': canonicalTime(start), 'task duration': numericDuration };
}

export function normalizePlannerRequest(body) {
  const schema = body?.mode === 'week' ? WeekRequestSchema : SingleRequestSchema;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return null;
  const value = parsed.data;
  const existingTasks = value.existingTasks.map(summarizeExistingTask).filter(Boolean);
  if (value.mode === 'week') {
    return {
      ...value,
      weaknesses: cleanStringArray(value.weaknesses, 20),
      subjects: cleanStringArray(value.subjects, 20),
      existingTasks,
    };
  }
  return {
    ...value,
    mode: 'single',
    tags: cleanStringArray(value.tags, 30, 80),
    existingTasks,
  };
}

export function timeToMinutes(value) {
  const match = Time12Schema.safeParse(value);
  if (!match.success) return null;
  const [, hourText, minuteText, meridiem] = match.data.match(/^(\d{1,2}):(\d{2})\s+(AM|PM)$/i);
  let hour = Number(hourText) % 12;
  if (meridiem.toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(minuteText);
}

export function minutesToTime12(minutes) {
  const bounded = ((Math.round(minutes) % 1_440) + 1_440) % 1_440;
  const hour24 = Math.floor(bounded / 60);
  const minute = bounded % 60;
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${hour24 >= 12 ? 'PM' : 'AM'}`;
}

function canonicalTime(value) {
  const minutes = timeToMinutes(value);
  return minutes === null ? null : minutesToTime12(minutes);
}

function validCalendarDate(value) {
  if (!DateSchema.safeParse(value).success) return false;
  const [month, day, year] = value.split('/').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function normalizePlannerTask(raw, { fallbackName, fallbackDate, allowedTags = [], maxDuration = 480 } = {}) {
  const parsed = RawPlannerTaskSchema.safeParse(raw);
  if (!parsed.success) return null;
  const task = parsed.data;
  const name = (task['task name'] ?? task.taskName ?? fallbackName ?? '').trim().slice(0, 160);
  const startMinutes = timeToMinutes(task['start time'] ?? task.startTime);
  const date = task.date ?? fallbackDate;
  const duration = Number.parseInt(String(task['task duration'] ?? task.taskDuration ?? ''), 10);
  if (!name || startMinutes === null || !validCalendarDate(date) || !Number.isInteger(duration)) return null;
  const boundedDuration = Math.max(15, Math.min(maxDuration, duration));
  const proposedTag = typeof task.tag === 'string' ? task.tag.trim().slice(0, 80) : '';
  const tag = allowedTags.length
    ? (allowedTags.includes(proposedTag) ? proposedTag : 'Other')
    : (proposedTag || 'Study');
  return {
    'task name': name,
    date,
    'start time': minutesToTime12(startMinutes),
    'task duration': boundedDuration,
    'end time': minutesToTime12(startMinutes + boundedDuration),
    tag,
  };
}
