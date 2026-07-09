import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { listStudyArtifactsDetailed } from "@/lib/userContent";

const DISMISS_KEY = "vertex_cloud_banner_dismissed";

export default function CloudSaveBanner() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
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
      if (!result.ok) setError(result.error || "Cloud save is unavailable right now.");
    });
  }, [showOnRoute, dismissed, location.pathname]);

  if (!showOnRoute || dismissed || !error) return null;

  return (
    <div
      role="status"
      className="mx-4 mt-3 max-w-6xl lg:mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3 text-sm text-amber-100"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-amber-200">Cloud save needs setup</p>
        <p className="mt-1 text-amber-100/90">{error}</p>
        <p className="mt-1 text-xs text-amber-100/70">
          Run <code className="rounded bg-black/20 px-1">supabase/migrations/20260709_user_study_artifacts.sql</code>{" "}
          in Supabase and confirm Vercel has <code className="rounded bg-black/20 px-1">SUPABASE_SERVICE_ROLE_KEY</code>.
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        className="shrink-0 rounded-lg p-1.5 hover:bg-amber-500/20 transition"
        aria-label="Dismiss cloud save notice"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
