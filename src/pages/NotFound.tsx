import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageSection from "@/components/PageSection";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
    }, 2400);
    return () => clearInterval(id);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | Vertex</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://www.vertexed.app${location.pathname}`} />
      </Helmet>
      <PageSection className="grid min-h-[72vh] place-items-center px-4 py-8">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-10 text-center shadow-[0_30px_120px_rgba(0,0,0,0.24)] backdrop-blur-2xl animate-fade-in">
          {/* animated aurora */}
          <div aria-hidden className="pointer-events-none absolute -inset-1 opacity-50">
            <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.45),transparent_70%)] animate-drift-slow" />
            <div className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.45),transparent_70%)] animate-drift-medium" />
          </div>

          <div className="relative inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
            Page not found
          </div>

          <h1
            className={`relative mt-4 text-[88px] md:text-[120px] leading-none font-bold brand-text-gradient ${
              glitch ? "translate-x-[2px] skew-x-1" : ""
            } transition-transform duration-150`}
            style={{
              textShadow: glitch
                ? "2px 0 rgba(255,80,120,0.6), -2px 0 rgba(80,200,255,0.6)"
                : "none",
            }}
          >
            404
          </h1>
          <h2 className="relative mt-2 text-2xl font-semibold text-white">We could not find that page</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm md:text-base text-white/65">
            The Exam Hub is brewing — until then, every lost route opens this calm void.
            Pick a path below to teleport back.
          </p>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-2 text-left">
            {[
              { to: "/", t: "Home", d: "Return to the main page" },
              { to: "/main", t: "Dashboard", d: "Jump into your tools" },
              { to: "/features", t: "Features", d: "Explore the toolkit" },
              { to: "/resources", t: "Resources", d: "Study guides & tips" },
            ].map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                style={{ animationDelay: `${100 + i * 80}ms` }}
                className="fade-up rounded-3xl border border-white/10 bg-black/20 p-4 transition-all hover:-translate-y-0.5 hover:bg-white/8 hover:border-white/20"
              >
                <span className="block font-semibold text-white">{l.t}</span>
                <span className="text-sm text-white/55">{l.d}</span>
              </Link>
            ))}
          </div>

          <Link
            to="/"
            className="relative mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark transition-transform hover:-translate-y-0.5"
          >
            Back to homepage
          </Link>
        </div>
      </PageSection>
    </>
  );
};

export default NotFound;
