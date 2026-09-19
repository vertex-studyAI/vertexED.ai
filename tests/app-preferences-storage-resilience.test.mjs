import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { normalizeAppPreferences } from '../src/lib/appPreferencesStorage.mjs';

const DEFAULTS = Object.freeze({
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
  dyslexiaFont: false,
  fontSize: 'base',
  simpleMode: false,
  studyCompanion: true,
  apexAppearance: 'paper',
  apexPosition: null,
});

const source = fs.readFileSync('src/contexts/AppPreferencesContext.tsx', 'utf8');

test('app preference normalization rejects malformed persisted roots and fields', () => {
  assert.deepEqual(normalizeAppPreferences(['bad'], DEFAULTS), DEFAULTS);
  assert.deepEqual(normalizeAppPreferences({
    theme: 'neon',
    reducedMotion: 'yes',
    highContrast: 1,
    dyslexiaFont: null,
    fontSize: 'giant',
    simpleMode: {},
    studyCompanion: 'true',
    apexAppearance: 'glass',
    apexPosition: { x: '10', y: 20 },
  }, DEFAULTS), DEFAULTS);
});

test('app preference normalization preserves only supported persisted values', () => {
  assert.deepEqual(normalizeAppPreferences({
    theme: 'dark',
    reducedMotion: true,
    highContrast: true,
    dyslexiaFont: true,
    fontSize: 'xlarge',
    simpleMode: true,
    studyCompanion: false,
    apexAppearance: 'ink',
    apexPosition: { x: 125.5, y: -24 },
    ignored: 'value',
  }, DEFAULTS), {
    theme: 'dark',
    reducedMotion: true,
    highContrast: true,
    dyslexiaFont: true,
    fontSize: 'xlarge',
    simpleMode: true,
    studyCompanion: false,
    apexAppearance: 'ink',
    apexPosition: { x: 125.5, y: -24 },
  });
});

test('app preference normalization rejects non-finite apex coordinates', () => {
  assert.deepEqual(normalizeAppPreferences({
    apexPosition: { x: Number.POSITIVE_INFINITY, y: 10 },
  }, DEFAULTS), DEFAULTS);
});

test('app preferences use the shared fail-closed browser storage boundary', () => {
  assert.match(source, /parseStoredObject/);
  assert.match(source, /resolveLocalStorage/);
  assert.match(source, /safeStorageGet/);
  assert.match(source, /safeStorageSet/);
  assert.doesNotMatch(source, /(?:window\.)?localStorage\.(?:getItem|setItem|removeItem)/);
});
