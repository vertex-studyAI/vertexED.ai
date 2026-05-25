import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/75 shadow-2xl backdrop-blur-xl">
          Loading your workspace…
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const needsOnboarding = !user.user_metadata?.username;
  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
