const CURRICULA = new Set(['IB MYP', 'IB DP', 'AP', 'IGCSE', 'GCSE', 'A levels', 'CBSE', 'ICSE', 'Other']);

export function normalizeWaitlistProfile(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Please complete your study profile.');
  const text = (key, limit, required = true) => {
    const raw = value[key] === undefined && !required ? '' : value[key];
    if (typeof raw !== 'string' || raw.trim().length > limit || [...raw].some(character => character.charCodeAt(0) < 32)) throw new Error(`Please enter a valid ${key}.`);
    if (required && !raw.trim()) throw new Error(`Please enter your ${key}.`);
    return raw.trim();
  };
  const school = text('school', 160, false);
  const country = text('country', 80);
  const curriculum = text('curriculum', 40);
  const grade = text('grade', 40);
  const age = value.age;
  if (!CURRICULA.has(curriculum)) throw new Error('Please choose a curriculum.');
  if (!Number.isInteger(age) || age < 13 || age > 100) throw new Error('The private beta is available to learners aged 13 or older. Enter your age in whole years.');
  if (value.consent !== true) throw new Error('Please confirm that we may store your application profile.');
  const curriculumOther = curriculum === 'Other' ? text('curriculumOther', 100) : '';
  return { version: 1, school, country, curriculum, grade, age, consent: true, ...(curriculumOther ? { curriculumOther } : {}) };
}
