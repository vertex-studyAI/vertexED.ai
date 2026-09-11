import { useEffect, useMemo, useState } from "react";
import { CloudOff, X } from "lucide-react";
import { useLocation } from "react-router";

import { useAuth } from "@/contexts/AuthContext";
import {
  resolveSessionStorage,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from "@/lib/browserStorage.mjs";
import { listStudyArtifactsDetailed } from "@/lib/userContent";

const DISMISS_KEY_PREFIX = "vertex_cloud_banner_dismissed";
const LEGACY_DISMISS_KEY = DISMISS_KEY_PREFIX;

function cloudBannerDismissKey(userId?: string | null) {
  const accountId = typeof userId === "string" ? userId.trim() : "";
  return accountId ? `${DISMISS_KEY_PREFIX}:${encodeURIComponent(accountId)}` : null;
}

export default function CloudSaveBanner() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(null);
  const [dismissedForKey, setDismissedForKey] = useState<string | null>(null);
  const dismissKey = useMemo(() => cloudBannerDismissKey(user?.id), [user?.id]);
  const dismissed = Boolean(dismissKey && dismissedForKey === dismissKey);

  useEffect(() => {
    if (typeof window === "undefined" || !dismissKey) {
      setDismissedForKey(null);
      return;
    }

    const storage = resolveSessionStorage(window);
    setDismissedForKey(safeStorageGet(storage, dismissKey) === "1" ? dismissKey : null);
    // A historical unscoped dismissal cannot be attributed to the current account.
    // Its cleanup is independent from the current account-scoped dismissal read.
    safeStorageRemove(storage, LEGACY_DISMISS_KEY);
  }, [dismissKey]);

  const showOnRoute =
    isAuthenticated &&
    Boolean(user?.id) &&
    !["/", "/login", "/signup", "/home", "/about", "/features"].includes(location.pathname) &&
    !location.pathname.startsWith("/resources");

  useEffect(() => {
    let cancelled = false;

    if (!showOnRoute || dismissed) {
      setMessage(null);
      return () => {
        cancelled = true;
      };
    }

    setMessage(null);
    void listStudyArtifactsDetailed()
      .then((result) => {
        if (cancelled) return;
        if (result.cloudUnavailable) {
          setMessage(
            result.error ||
              "Cloud sync isn't available right now. Your notes, papers, and reviews still save on this device.",
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setMessage(
          "Cloud sync status couldn't be verified. Your notes, papers, and reviews still save on this device.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [showOnRoute, dismissed, location.pathname, user?.id]);

  if (!showOnRoute || dismissed || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mx-4 mt-3 max-w-6xl lg:mx-auto rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 flex items-start gap-3 text-sm text-sky-100"
    >
      <CloudOff className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sky-200">Working in device-save mode</p>
        <p className="mt-1 text-sky-100/90">{message}</p>
        <p className="mt-1 text-xs text-sky-100/70">
          You can keep studying here. Cloud sync will resume when the service is available again.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          if (dismissKey) {
            const storage = typeof window === "undefined" ? null : resolveSessionStorage(window);
            safeStorageSet(storage, dismissKey, "1");
            setDismissedForKey(dismissKey);
          }
        }}
        className="shrink-0 rounded-lg p-1.5 hover:bg-sky-500/20 transition"
        aria-label="Dismiss sync notice"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
