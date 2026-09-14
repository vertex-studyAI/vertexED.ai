export type ApexAppearance = 'paper' | 'stack' | 'focus' | 'compass';

export const APEX_APPEARANCES: ReadonlyArray<{
  id: ApexAppearance;
  name: string;
  description: string;
  src: string;
}> = [
  {
    id: 'paper',
    name: 'Paper',
    description: 'The original open workbook.',
    src: '/companions/apex-paper-v3.png',
  },
  {
    id: 'stack',
    name: 'Stack',
    description: 'A set of revision cards.',
    src: '/companions/apex-stack-v1.png',
  },
  {
    id: 'focus',
    name: 'Focus',
    description: 'A study timer for focused work.',
    src: '/companions/apex-focus-v1.png',
  },
  {
    id: 'compass',
    name: 'Compass',
    description: 'A guide through your next study move.',
    src: '/companions/apex-compass-v1.png',
  },
];

export function getApexAppearance(value: ApexAppearance) {
  return APEX_APPEARANCES.find((appearance) => appearance.id === value) ?? APEX_APPEARANCES[0];
}
