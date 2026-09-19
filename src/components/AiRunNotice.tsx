import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AiRunNotice() {
  const [degraded, setDegraded] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    setDegraded(false);
    const update = (event: Event) => {
      const detail = (event as CustomEvent<{ degraded: boolean }>).detail;
      if (detail?.degraded) setDegraded(true);
    };
    window.addEventListener('vertexed:ai-result', update);
    return () => window.removeEventListener('vertexed:ai-result', update);
  }, [location.pathname, user?.id]);
  if (!degraded) return null;
  return <aside role="status" className="mb-5 rounded-xl border border-amber-600/50 bg-amber-50 p-5 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
    <p className="font-semibold">Degraded mode: a result on this page uses a basic fallback.</p>
    <p className="mt-2 text-base">This is not a successful AI response or a verified grade. Check the result before using it; your original input is unchanged.</p>
    <button type="button" className="mt-3 min-h-11 underline" onClick={() => setDegraded(false)}>Dismiss this notice</button>
  </aside>;
}
