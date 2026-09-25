import { Navigate } from "react-router";
import { lazy } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageLoader from "@/components/PageLoader";

const Home = lazy(() => import("@/pages/Home"));

/** Skip the marketing Home page when signed in — avoids landing-page crashes blocking /main. */
export default function AuthLandingRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/main" replace />;
  }

  return <Home />;
}
