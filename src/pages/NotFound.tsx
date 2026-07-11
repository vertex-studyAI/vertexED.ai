import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PageSection from "@/components/PageSection";
import { Helmet } from "react-helmet-async";
import { Home, Sparkles, BookOpen, LogIn } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const shortcuts = [
    { to: "/", icon: Home, label: "Home", desc: "Landing page and product overview", color: "text-primary" },
    { to: "/features", icon: Sparkles, label: "Features", desc: "Full walkthrough of the revision loop and tools", color: "text-primary" },
    { to: "/resources", icon: BookOpen, label: "Resources", desc: "Guides on methods, subjects, and VertexED tools", color: "text-primary" },
    { to: "/login", icon: LogIn, label: "Log in", desc: "Return to your dashboard and saved work", color: "text-primary" },
  ];

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | VertexED</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`https://www.vertexed.app${location.pathname}`} />
      </Helmet>
      <PageSection className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-panel p-10 max-w-lg w-full mx-auto animate-fade-in">
          <p className="text-6xl font-bold mb-2 brand-text-gradient tracking-tight">404</p>
          <h1 className="text-2xl font-semibold text-foreground mb-4">Page not found</h1>
          <p className="text-base text-muted-foreground mb-8 leading-relaxed">
            That URL isn&apos;t on VertexED — the page may have moved, or the link might be mistyped.
            Use one of the shortcuts below, or return to the homepage.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
            {shortcuts.map(({ to, icon: Icon, label, desc, color }) => (
              <Link
                key={to}
                to={to}
                className="glass-tile p-4 transition-all duration-200 group hover:border-primary/25 hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={`flex items-center gap-2 font-semibold mb-1 ${color} group-hover:opacity-90`}>
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </span>
                <span className="text-sm text-muted-foreground">{desc}</span>
              </Link>
            ))}
          </div>

          <Link to="/" className="btn-solid w-full justify-center inline-flex">
            Back to homepage
          </Link>
        </div>
      </PageSection>
    </>
  );
};

export default NotFound;
