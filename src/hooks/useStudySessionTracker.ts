import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { getStudyContext } from '@/lib/studyContext';
import { rememberStudySession } from '@/lib/studyActivity';

const TRACKED_PREFIXES = [
  '/main',
  '/learning-hub',
  '/study-zone',
  '/notetaker',
  '/planner',
  '/chatbot',
  '/paper-maker',
  '/answer-reviewer',
];

export function useStudySessionTracker(enabled: boolean): void {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!enabled) return;
    const tracked = TRACKED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (!tracked) return;
    const context = getStudyContext(pathname);
    rememberStudySession(pathname, context.label);
  }, [enabled, pathname]);
}
