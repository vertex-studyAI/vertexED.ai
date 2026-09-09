import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { getStudyContext } from '@/lib/studyContext';
import { rememberStudySession } from '@/lib/studyActivity';

const TRACKED_PREFIXES = [
  '/exam-prep',
  '/study-notebook',
  '/study-zone',
  '/notetaker',
  '/planner',
  '/chatbot',
  '/paper-maker',
  '/answer-reviewer',
];

export function useStudySessionTracker(enabled: boolean): void {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!enabled) return;
    const tracked = TRACKED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (!tracked) return;
    const context = getStudyContext(pathname);
    // Navigation records a resume location; completion is recorded by the
    // planner, timer, practice and review actions themselves.
    rememberStudySession(`${pathname}${search}`, context.label);
  }, [enabled, pathname, search]);
}
