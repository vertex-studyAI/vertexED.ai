import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(email, password); 
      navigate("/main"); 
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <Helmet>
        <title>Vertex — Log in</title>
        <meta
          name="description"
          content="Log into Vertex to access your unified AI study workspace."
        />
  <link rel="canonical" href="https://www.vertexed.app/login" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection className="relative min-h-[70vh] flex items-center justify-center px-4">
        <form
          className="relative neu-card w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 animate-fade-in"
          onSubmit={handleSubmit}
        >
          <h1 className="text-3xl font-semibold mb-2 text-center text-white">
            Log in
          </h1>
          <p className="text-center mb-6 text-sm opacity-80">Welcome back</p>

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
              aria-label="Continue with Google"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5" aria-hidden>
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 31.18 29.197 34 24 34c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.058 0 5.842 1.153 7.961 3.039l5.657-5.657C33.643 4.346 29.084 2 24 2 12.955 2 4 10.955 4 22s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.312 16.019 18.78 14 24 14c3.058 0 5.842 1.153 7.961 3.039l5.657-5.657C33.643 4.346 29.084 2 24 2 16.318 2 9.656 6.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 42c5.138 0 9.642-1.977 12.999-5.184l-5.999-4.999C29.86 33.876 27.08 35 24 35c-5.174 0-9.571-3.291-11.15-7.889l-6.57 5.061C9.607 37.556 16.227 42 24 42z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.363 3.18-5.768 6-11.303 6-5.174 0-9.571-3.291-11.15-7.889l-6.57 5.061C9.607 37.556 16.227 42 24 42c8.822 0 16.245-5.987 18.611-14.083.563-1.953.889-4.028.889-6.083 0-1.341-.138-2.651-.389-3.917z"/>
              </svg>
              <span>Continue with Google</span>
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
            <button type="submit" className="w-full neu-button py-3 mt-2">
              Continue
            </button>
          </div>

          {error && (
            <p className="text-center mt-4 text-sm text-red-500">{error}</p>
          )}

          <p className="text-center mt-4 text-sm opacity-80">
            No account?{" "}
            <Link to="/signup" className="sketch-underline">
              Sign up
            </Link>
          </p>
        </form>
      </PageSection>
    </>
  );
}
