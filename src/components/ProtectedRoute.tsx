import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-300">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  // If user has no username yet, force onboarding (avoid loop when already on /onboarding)
  const needsOnboarding = !user.user_metadata?.username;
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}
