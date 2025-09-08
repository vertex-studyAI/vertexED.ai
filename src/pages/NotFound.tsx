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
        <div className="text-center neu-card p-10">
          <h1 className="text-4xl font-bold mb-4 brand-text-gradient">404</h1>
          <p className="text-xl opacity-80 mb-4">Oops! Page not found</p>
          <Link to="/" className="neu-button">Return to Home</Link>
        </div>
      </PageSection>
    </>
  );
};

export default NotFound;
