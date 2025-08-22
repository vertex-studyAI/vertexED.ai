import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageSection from "@/components/PageSection";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageSection className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center neu-card p-10">
        <h1 className="text-4xl font-bold mb-4 brand-text-gradient">404</h1>
        <p className="text-xl opacity-80 mb-4">Oops! Page not found</p>
        <a href="/" className="neu-button">Return to Home</a>
      </div>
    </PageSection>
  );
};

export default NotFound;
