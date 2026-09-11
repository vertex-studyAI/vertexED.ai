import {
  parseStoredArray,
  resolveLocalStorage,
  safeStorageGet,
  safeStorageSet,
} from './browserStorage.mjs';

export const MAX_SKETCH_STROKES = 400;
export const MAX_POINTS_PER_STROKE = 20_000;

function normalizePoint(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const { x, y, pressure } = value;
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(pressure)) return null;
  if (pressure < 0 || pressure > 1) return null;
  return { x, y, pressure };
}

function normalizeStroke(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (value.tool !== 'pen' && value.tool !== 'eraser') return null;
  if (typeof value.color !== 'string' || !value.color.trim() || value.color.length > 32) return null;
  if (!Number.isFinite(value.width) || value.width <= 0 || value.width > 64) return null;
  if (!Array.isArray(value.points)) return null;

  const points = [];
  for (const point of value.points.slice(0, MAX_POINTS_PER_STROKE)) {
    const normalized = normalizePoint(point);
    if (normalized) points.push(normalized);
  }
  if (points.length === 0) return null;

  return {
    color: value.color,
    width: value.width,
    tool: value.tool,
    points,
  };
}

export function normalizeSketchStrokes(value) {
  if (!Array.isArray(value)) return [];
  const normalized = [];
  for (const item of value.slice(-MAX_SKETCH_STROKES)) {
    const stroke = normalizeStroke(item);
    if (stroke) normalized.push(stroke);
  }
  return normalized;
}

export function readSketchStrokes(owner, key) {
  const raw = safeStorageGet(resolveLocalStorage(owner), key);
  return normalizeSketchStrokes(parseStoredArray(raw));
}

export function writeSketchStrokes(owner, key, strokes) {
  const normalized = normalizeSketchStrokes(strokes);
  return safeStorageSet(resolveLocalStorage(owner), key, JSON.stringify(normalized));
}
