import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/lib/apiAuth';
import { isAdminUser } from '@/lib/admin';
import { resolveAdminAccess } from '@/lib/adminAccessPolicy.mjs';

function getApiBase() {
  const override = import.meta.env.VITE_CHATBOT_API_URL;
  if (override) {
    return override.replace(/\/ask\/?$/, '');
  }
  return '/api';
}

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolveAdmin() {
      if (authLoading) return;
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authFetch(`${getApiBase()}/admin-status`);
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setIsAdmin(resolveAdminAccess({
              apiDecision: Boolean(data.admin),
              isDevelopment: import.meta.env.DEV,
              clientAllowlistMatch: isAdminUser(user),
            }));
            setLoading(false);
          }
          return;
        }
      } catch {
        // Production must fail closed. Development can still use the mirrored
        // client allowlist when the local API is intentionally unavailable.
      }

      if (!cancelled) {
        setIsAdmin(resolveAdminAccess({
          apiDecision: null,
          isDevelopment: import.meta.env.DEV,
          clientAllowlistMatch: isAdminUser(user),
        }));
        setLoading(false);
      }
    }

    setLoading(true);
    void resolveAdmin();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  return { isAdmin, loading: authLoading || loading };
}
