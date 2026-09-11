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
  const [resolvedUserId, setResolvedUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function resolveAdmin() {
      if (authLoading) return;
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setResolvedUserId(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authFetch(`${getApiBase()}/admin-status`);
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setIsAdmin(
              resolveAdminAccess({
                apiDecision: Boolean(data.admin),
                isDevelopment: import.meta.env.DEV,
                clientAllowlistMatch: isAdminUser(user),
              }),
            );
            setResolvedUserId(user.id);
            setLoading(false);
          }
          return;
        }
      } catch {
        // Production must fail closed. Local development can still use the
        // mirrored client allowlist when the API is intentionally unavailable.
      }

      if (!cancelled) {
        setIsAdmin(
          resolveAdminAccess({
            apiDecision: null,
            isDevelopment: import.meta.env.DEV,
            clientAllowlistMatch: isAdminUser(user),
          }),
        );
        setResolvedUserId(user.id);
        setLoading(false);
      }
    }

    setLoading(true);
    void resolveAdmin();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const currentUserId = user?.id ?? null;
  const adminDecisionIsCurrent = !authLoading && resolvedUserId === currentUserId;

  return {
    isAdmin: adminDecisionIsCurrent ? isAdmin : false,
    loading: authLoading || loading || !adminDecisionIsCurrent,
  };
}
