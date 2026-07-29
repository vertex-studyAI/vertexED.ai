import { Navigate, useLocation } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import PageLoader from "@/components/PageLoader";

/**
 * Route guard for paid features. Compose inside ProtectedRoute:
 *
 *   <ProtectedRoute><RequirePro><Chatbot /></RequirePro></ProtectedRoute>
 *
 * ProtectedRoute settles auth first, so by the time this renders there is a user.
 * This is a UX affordance, not the paywall itself — the matching API routes
 * enforce the same check server-side via requireActiveSubscription().
 */
export default function RequirePro({ children }: { children: JSX.Element }) {
  const { subscription, loading } = useSubscription();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your subscription" />;

  if (!subscription.active) {
    return <Navigate to="/pricing" replace state={{ from: location.pathname }} />;
  }

  return children;
}
