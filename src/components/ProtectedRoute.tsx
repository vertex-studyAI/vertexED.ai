import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/apiAuth";
import PageLoader from "@/components/PageLoader";

function WaitlistPending() {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-lg items-center px-5">
      <section className="glass-panel w-full p-8 text-center">
        <p className="text-sm font-semibold text-primary">Private beta</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Your access is pending</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">We have your request. We will email an account-creation link once it is approved.</p>
      </section>
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [access, setAccess] = useState<"checking" | "approved" | "pending" | "rejected">("checking");

  useEffect(() => {
    if (!user) { setAccess("checking"); return; }
    // The waitlist backend is intentionally not required during local development,
    // so the product can be tested before Supabase access is available.
    if (import.meta.env.DEV) { setAccess("approved"); return; }
    let active = true;
    void authFetch("/api/waitlist-status")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) setAccess(data.status === "approved" ? "approved" : data.status === "rejected" ? "rejected" : "pending");
      })
      .catch(() => active && setAccess("pending"));
    return () => { active = false; };
  }, [user?.id]);

  if (loading || (user && access === "checking")) return <PageLoader label="Checking your access" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (access !== "approved") return <WaitlistPending />;
  if (!user.user_metadata?.username && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  return children;
}
