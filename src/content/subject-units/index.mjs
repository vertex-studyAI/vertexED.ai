import { scienceUnits } from './sciences.mjs';
import { historyUnits } from './history.mjs';
import { literatureUnits } from './literature.mjs';
import { computingUnits } from './computing.mjs';
import { socialScienceUnits } from './social-sciences.mjs';
import { languageUnits } from './language.mjs';
const groups = { sciences: scienceUnits, history: historyUnits, literature: literatureUnits,
  computing: computingUnits, 'social-sciences': socialScienceUnits, language: languageUnits };
export const subjectUnits = Object.values(groups).flat();
export function subjectUnitSource(id) {
  const file = Object.keys(groups).find(key => groups[key].some(lesson => lesson.id === id));
  if (!file) throw new Error(`Unknown subject unit: ${id}`);
  return `src/content/subject-units/${file}.mjs`;
}
