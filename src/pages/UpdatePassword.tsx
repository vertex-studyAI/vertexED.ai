import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabaseClient";
import PageSection from "@/components/PageSection";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (!supabase) throw new Error("Supabase not initialized");

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      navigate("/main");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Vertex — Set Password</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageSection className="relative min-h-[70vh] flex items-center justify-center px-4">
        <form
          className="relative neu-card w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 animate-fade-in"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-semibold mb-2 text-center text-white">
            Set Password
          </h1>
          <p className="text-center mb-6 text-sm opacity-80">
            Please set a password for your account.
          </p>

          <div className="space-y-4">
            <div className="neu-input">
              <input
                aria-label="New Password"
                placeholder="New Password"
                type="password"
                className="neu-input-el"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="neu-input">
              <input
                aria-label="Confirm Password"
                placeholder="Confirm Password"
                type="password"
                className="neu-input-el"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full neu-button py-3 mt-2"
              disabled={loading}
            >
              {loading ? "Updating..." : "Set Password"}
            </button>
          </div>

          {error && (
            <p className="text-center mt-4 text-sm text-red-500">{error}</p>
          )}
        </form>
      </PageSection>
    </>
  );
}
