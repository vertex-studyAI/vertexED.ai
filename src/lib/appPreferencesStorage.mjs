const THEMES = new Set(['light', 'dark', 'system']);
const FONT_SIZES = new Set(['base', 'large', 'xlarge']);
const APEX_APPEARANCES = new Set(['paper', 'ink']);
const BOOLEAN_KEYS = Object.freeze([
  'reducedMotion',
  'highContrast',
  'dyslexiaFont',
  'simpleMode',
  'studyCompanion',
]);

function isPlainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isFiniteCoordinate(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function normalizeAppPreferences(value, defaults) {
  const next = { ...defaults };
  if (!isPlainRecord(value)) return next;

  if (THEMES.has(value.theme)) next.theme = value.theme;
  if (FONT_SIZES.has(value.fontSize)) next.fontSize = value.fontSize;
  if (APEX_APPEARANCES.has(value.apexAppearance)) next.apexAppearance = value.apexAppearance;

  for (const key of BOOLEAN_KEYS) {
    if (typeof value[key] === 'boolean') next[key] = value[key];
  }

  if (value.apexPosition === null) {
    next.apexPosition = null;
  } else if (
    isPlainRecord(value.apexPosition)
    && isFiniteCoordinate(value.apexPosition.x)
    && isFiniteCoordinate(value.apexPosition.y)
  ) {
    next.apexPosition = { x: value.apexPosition.x, y: value.apexPosition.y };
  }

  return next;
}
