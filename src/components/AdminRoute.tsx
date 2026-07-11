import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (loading || adminLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          Loading…
        </span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/main" replace />;

  return children;
}
