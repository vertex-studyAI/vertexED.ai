import { useEffect, useState } from "react";
import { CloudOff, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { listStudyArtifactsDetailed } from "@/lib/userContent";

const DISMISS_KEY = "vertex_cloud_banner_dismissed";

export default function CloudSaveBanner() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY) === "1",
  );

  const showOnRoute =
    isAuthenticated &&
    !["/", "/login", "/signup", "/home", "/about", "/features"].includes(location.pathname) &&
    !location.pathname.startsWith("/resources");

  useEffect(() => {
    if (!showOnRoute || dismissed) return;
    void listStudyArtifactsDetailed().then((result) => {
      if (result.cloudUnavailable) {
        setMessage(
          result.error ||
            "Cloud sync isn't configured yet. Your notes, papers, and reviews still save on this device.",
        );
      }
    });
  }, [showOnRoute, dismissed, location.pathname]);

  if (!showOnRoute || dismissed || !message) return null;

  return (
    <div
      role="status"
      className="mx-4 mt-3 max-w-6xl lg:mx-auto rounded-xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 flex items-start gap-3 text-sm text-sky-100"
    >
      <CloudOff className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sky-200">Working in device-save mode</p>
        <p className="mt-1 text-sky-100/90">{message}</p>
        <p className="mt-1 text-xs text-sky-100/70">
          Cloud sync is not active yet — your work is still saved on this device. An admin needs to finish
          the one-time Supabase + Vercel setup.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        className="shrink-0 rounded-lg p-1.5 hover:bg-sky-500/20 transition"
        aria-label="Dismiss sync notice"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
