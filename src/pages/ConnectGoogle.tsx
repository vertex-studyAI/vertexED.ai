import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import PageSection from "@/components/PageSection";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";

export default function ConnectGoogle() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);

  const connectGoogle = async () => {
    if (!supabase) return;
    setConnecting(true);
    sessionStorage.setItem("vertex_google_link_return", "/onboarding");
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      sessionStorage.removeItem("vertex_google_link_return");
      setConnecting(false);
      toast({ title: "Could not connect Google", description: error.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Helmet><title>Connect Google sign-in | VertexED</title><meta name="robots" content="noindex, nofollow" /></Helmet>
      <PageSection className="flex min-h-[60vh] items-center justify-center px-4">
        <section className="glass-panel w-full max-w-lg p-8 text-center">
          <p className="text-sm font-semibold text-primary">One more option</p>
          <h1 className="mt-2 text-3xl font-semibold">Connect Google sign-in?</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Connect the same Google account now to sign in with either Google or your new email and password. You can also do this later in Account Settings.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => void connectGoogle()} disabled={connecting} className="btn-solid px-5 py-3 disabled:opacity-60">
              {connecting ? "Connecting…" : "Connect Google"}
            </button>
            <button type="button" onClick={() => navigate("/onboarding", { replace: true })} disabled={connecting} className="btn-glass px-5 py-3 disabled:opacity-60">
              Skip for now
            </button>
          </div>
        </section>
      </PageSection>
    </>
  );
}
