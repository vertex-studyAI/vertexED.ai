import { Navigate } from "react-router";
import { lazy } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageLoader from "@/components/PageLoader";
import { isOnboardingComplete } from "@/lib/onboardingStatus.js";

const Home = lazy(() => import("@/pages/Home"));

/** Skip the marketing Home page when signed in and route incomplete accounts straight to onboarding. */
export default function AuthLandingRedirect() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (isAuthenticated) {
    return <Navigate to={user && !isOnboardingComplete(user) ? "/onboarding" : "/main"} replace />;
  }

  return <Home />;
}
