import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 px-6 py-6 text-sm text-white/75 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
            <div>
              <p className="font-medium text-white">Loading your workspace</p>
              <p className="mt-1 text-white/55">Checking your session and restoring preferences…</p>
            </div>
          </div>
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
