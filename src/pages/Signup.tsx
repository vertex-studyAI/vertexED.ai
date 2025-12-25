import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <>
      <Helmet>
        <title>Vertex — Join Waitlist</title>
        <meta name="description" content="Join the waitlist for Vertex to unlock the AI-powered study toolkit." />
        <link rel="canonical" href="https://www.vertexed.app/signup" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PageSection className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4">
        <form
          className="relative neu-card w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 animate-fade-in"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            try {
              const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              });
              
              const data = await res.json();
              
              if (!res.ok) {
                throw new Error(data.error || 'Failed to join waitlist');
              }

              setSuccess(true);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <h1 className="text-3xl font-semibold mb-2 text-center text-white">Join Waitlist</h1>
          <p className="text-center mb-6 text-sm opacity-80">We are currently in private beta.</p>
          <p className="text-center mb-6 text-sm opacity-80">If you want, <a href="https://tally.so/r/ODD6b8" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100 transition">give us some more information here</a>.</p>
          
          {!success ? (
            <div className="space-y-4">
              <div className="neu-input">
                <input
                  aria-label="Email"
                  placeholder="Email"
                  className="neu-input-el"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
              <button className="w-full neu-button py-3 mt-2" disabled={loading}>
                {loading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </div>
          ) : (
             <div className="text-center py-4">
                <p className="text-emerald-500 font-medium mb-2">You're on the list!</p>
                <p className="text-sm opacity-80">We've added you to the waitlist. We'll email you as soon as a spot opens up.</p>
             </div>
          )}

          {error && (
            <p className="text-center mt-4 text-sm text-red-500">{error}</p>
          )}
          
          <p className="text-center mt-6 text-sm opacity-80">
            Already have an account? <Link to="/login" className="sketch-underline">Log in</Link>
          </p>
        </form>
      </PageSection>
    </>
  );
}
