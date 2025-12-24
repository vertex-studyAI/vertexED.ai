import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PageSection from "@/components/PageSection";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Vertex</title>
        <meta name="robots" content="noindex, nofollow" />
  <link rel="canonical" href={`https://www.vertexed.app${location.pathname}`} />
      </Helmet>
      <PageSection className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center neu-card p-10 max-w-lg w-full mx-auto">
          <h1 className="text-6xl font-bold mb-2 brand-text-gradient">404</h1>
          <h2 className="text-2xl font-semibold text-slate-200 mb-6">Page Not Found</h2>
          <p className="text-lg text-slate-400 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
            <Link to="/" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group">
              <span className="block text-sky-400 font-semibold mb-1 group-hover:text-sky-300">Home</span>
              <span className="text-sm text-slate-400">Return to the main page</span>
            </Link>
            <Link to="/features" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group">
              <span className="block text-purple-400 font-semibold mb-1 group-hover:text-purple-300">Features</span>
              <span className="text-sm text-slate-400">Explore our tools</span>
            </Link>
            <Link to="/resources" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group">
              <span className="block text-emerald-400 font-semibold mb-1 group-hover:text-emerald-300">Resources</span>
              <span className="text-sm text-slate-400">Study guides & tips</span>
            </Link>
            <Link to="/login" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group">
              <span className="block text-amber-400 font-semibold mb-1 group-hover:text-amber-300">Login</span>
              <span className="text-sm text-slate-400">Access your account</span>
            </Link>
          </div>

          <Link to="/" className="neu-button w-full justify-center">
            Back to Homepage
          </Link>
        </div>
      </PageSection>
    </>
  );
};

export default NotFound;
