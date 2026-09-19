export type ApexAppearance = 'paper' | 'ink';

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
    id: 'ink',
    name: 'Ink',
    description: 'The midnight reading-surface version.',
    src: '/companions/apex-ink-v3.png',
  },
];

export function getApexAppearance(value: ApexAppearance) {
  return APEX_APPEARANCES.find((appearance) => appearance.id === value) ?? APEX_APPEARANCES[0];
}
