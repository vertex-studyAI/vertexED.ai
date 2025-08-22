import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageSection from "@/components/PageSection";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Vertex — Log in</title>
        <meta name="description" content="Log into Vertex to access your unified AI study workspace." />
        <link rel="canonical" href={typeof window!== 'undefined' ? window.location.href : '/login'} />
      </Helmet>
  <PageSection className="relative min-h-[70vh] flex items-center justify-center px-4">
        <form
          className="relative neu-card w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/5 animate-fade-in"
          onSubmit={(e) => {
            e.preventDefault();
            login();
            navigate("/main");
          }}
        >
          <h1 className="text-3xl font-semibold mb-2 text-center text-white">Log in</h1>
          <p className="text-center mb-6 text-sm opacity-80">Welcome back</p>
          <div className="space-y-4">
            <div className="neu-input">
              <input aria-label="Email" placeholder="Email" className="neu-input-el" />
            </div>
            <div className="neu-input">
              <input aria-label="Password" placeholder="Password" type="password" className="neu-input-el" />
            </div>
            <button className="w-full neu-button py-3 mt-2">Continue</button>
          </div>
          <p className="text-center mt-4 text-sm opacity-80">
            No account? <a href="/signup" className="sketch-underline">Sign up</a>
          </p>
  </form>
  </PageSection>
    </>
  );
}
