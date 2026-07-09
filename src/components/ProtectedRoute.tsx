import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-300">
        <div className="h-8 w-8 rounded-full border-2 border-white/25 border-t-white animate-spin" />
        <p className="text-sm text-slate-300/90">Hang on — checking your session…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  // If user has no username yet, force onboarding (avoid loop when already on /onboarding)
  const needsOnboarding = !user.user_metadata?.username;
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}
