/** Dashboard capabilities advertised only at the level the product can evidence. */
export type PortalFeature = {
  id: string;
  anchorId?: string;
  name: string;
  tagline: string;
  size: 'small' | 'medium' | 'large';
  status: 'live' | 'beta';
};

export const PORTAL_FEATURES: PortalFeature[] = [
  { id: 'today-plan', anchorId: 'today-plan', name: "Today's plan", tagline: 'Your planned tasks, due cards, and next study action in one place.', size: 'medium', status: 'live' },
  { id: 'retrieval-pulse', anchorId: 'retrieval-pulse', name: 'Study pulse', tagline: 'A practical nudge from scheduled work, due cards, and revision-loop activity.', size: 'large', status: 'live' },
  { id: 'flashcard-heatmap', anchorId: 'flashcard-heatmap', name: 'Due flashcards', tagline: 'See which locally saved flashcard decks are due for retrieval practice.', size: 'small', status: 'live' },
  { id: 'interleave-mixer', anchorId: 'interleave-mixer', name: 'Interleave suggestion', tagline: 'A simple two-subject study suggestion based on the subjects you selected.', size: 'small', status: 'live' },
  { id: 'exam-night', anchorId: 'exam-night', name: 'Exam-night checklist', tagline: 'A practical last-72-hours reminder for materials, rest, and light review.', size: 'medium', status: 'live' },
  { id: 'confidence-checkin', anchorId: 'confidence-checkin', name: 'Confidence check-in', tagline: 'Your self-reported confidence; it is never presented as mastery or a grade.', size: 'small', status: 'live' },
  { id: 'data-export', name: 'Data portability', tagline: 'Download cloud profile, saved work, and verified learning records from Account Settings.', size: 'small', status: 'live' },
  { id: 'world-model', name: 'Verified concept evidence', tagline: 'A concept map and prerequisite links appear only after verified practice produces deterministic evidence.', size: 'large', status: 'live' },
  { id: 'study-notebook', name: 'Study notebook', tagline: 'A workspace for notes and source-based study materials you choose to save.', size: 'large', status: 'live' },
];
