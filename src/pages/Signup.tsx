import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function Signup() {
  const { signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Vertex — Sign up</title>
        <meta name="description" content="Create your Vertex account to unlock the AI-powered study toolkit." />
  <link rel="canonical" href="https://vertex-ai-rho.vercel.app/signup" />
  <meta name="robots" content="noindex, nofollow" />
      </Helmet>
  <PageSection className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
        <form
          className="relative neu-card w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 animate-fade-in"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setInfo(null);
            try {
              const res = await signUp(email, password);
              if (res.needsConfirmation) {
                setInfo("Check your email to confirm your account.");
              } else {
                navigate("/main");
              }
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <h1 className="text-3xl font-semibold mb-2 text-center text-white">Sign up</h1>
          <p className="text-center mb-6 text-sm opacity-80">Create your account</p>
          <div className="space-y-4">
            <button
              type="button"
              onClick={async () => {
                try {
                  await loginWithGoogle();
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
              className="w-full neu-button py-3 flex items-center justify-center gap-2"
            >
              <img src="/logo.png" alt="Google" className="w-5 h-5 rounded-full" />
              Continue with Google
            </button>
            <div className="text-center text-xs opacity-60">or</div>
            <div className="neu-input">
              <input
                aria-label="Email"
                placeholder="Email"
                className="neu-input-el"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="neu-input">
              <input
                aria-label="Password"
                placeholder="Password"
                type="password"
                className="neu-input-el"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button className="w-full neu-button py-3 mt-2">Create account</button>
          </div>
          {error && (
            <p className="text-center mt-4 text-sm text-red-500">{error}</p>
          )}
          {info && (
            <p className="text-center mt-4 text-sm text-emerald-500">{info}</p>
          )}
          <p className="text-center mt-4 text-sm opacity-80">
            Already have an account? <Link to="/login" className="sketch-underline">Log in</Link>
          </p>
  </form>
  </PageSection>
    </>
  );
}
