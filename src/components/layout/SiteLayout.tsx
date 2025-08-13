import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function SiteLayout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = isAuthenticated
    ? [
        { to: "/main", label: "Main" },
        { to: "/notetaker", label: "AI Notetaker" },
        { to: "/study-zone", label: "Study Zone" },
        { to: "/chatbot", label: "AI Chat" },
        { to: "/planner", label: "Planner" },
        { to: "/image-answer", label: "Image Answer" },
        { to: "/paper-maker", label: "Paper Maker" },
        { to: "/about", label: "About" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/about", label: "About" },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40">
        <nav className="neu-surface/blur border-b backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="container mx-auto flex items-center justify-between py-2">
            <Link to={isAuthenticated ? "/main" : "/"} className="flex items-center gap-2 hover-scale">
              <span className="text-lg font-semibold tracking-wide sketch-underline">Vertex</span>
            </Link>

            <ul className="hidden md:flex items-center gap-4 overflow-x-auto">
              {navItems.map((item) => (
                <li key={item.to} className="shrink-0">
                  <NavLink
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      `px-2 py-1 text-sm rounded-full sketch-underline transition-all ${isActive ? "neu-pressed" : "hover:neu-raised hover:-translate-y-0.5"}`
                    }
                    aria-label={item.label}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" className="hidden md:inline-block neu-button text-sm px-3 py-1.5">Log in</NavLink>
                  <NavLink to="/signup" className="hidden md:inline-block neu-button text-sm px-3 py-1.5">Sign up</NavLink>
                </>
              ) : (
                <NavLink
                  to="/settings"
                  className="hidden md:inline-block neu-button text-sm px-3 py-1.5"
                >
                  Account
                </NavLink>
              )}
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <Outlet />
      </main>

      <footer className="mt-auto">
        <div className="neu-surface border-t">
          <div className="container mx-auto py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
            <p className="opacity-80">© {new Date().getFullYear()} Vertex. All rights reserved.</p>
            <div className="flex gap-4">
              <NavLink to="/about" className="sketch-underline">About</NavLink>
              <NavLink to="/" className="sketch-underline">Home</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
