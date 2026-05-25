import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PageSection from "@/components/PageSection";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Vertex</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://www.vertexed.app${location.pathname}`} />
      </Helmet>
      <PageSection className="grid min-h-[72vh] place-items-center px-4 py-8">
        <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
            Page not found
          </div>
          <h1 className="mt-4 text-6xl font-bold brand-text-gradient">404</h1>
          <h2 className="mt-3 text-2xl font-semibold text-white">We could not find that page</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm md:text-base text-white/65">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 text-left">
            <Link to="/" className="rounded-3xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/8">
              <span className="block font-semibold text-white">Home</span>
              <span className="text-sm text-white/55">Return to the main page</span>
            </Link>
            <Link to="/features" className="rounded-3xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/8">
              <span className="block font-semibold text-white">Features</span>
              <span className="text-sm text-white/55">Explore our tools</span>
            </Link>
            <Link to="/resources" className="rounded-3xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/8">
              <span className="block font-semibold text-white">Resources</span>
              <span className="text-sm text-white/55">Study guides & tips</span>
            </Link>
            <Link to="/login" className="rounded-3xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/8">
              <span className="block font-semibold text-white">Login</span>
              <span className="text-sm text-white/55">Access your account</span>
            </Link>
          </div>

          <Link to="/" className="mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark">
            Back to homepage
          </Link>
        </div>
      </PageSection>
    </>
  );
};

export default NotFound;
