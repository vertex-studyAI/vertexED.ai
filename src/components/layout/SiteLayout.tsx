import { Outlet, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SiteLayout() {
  const rootClasses = "relative min-h-screen flex flex-col bg-gradient-to-b from-[#262626] to-[#181818] text-foreground overflow-hidden"; // fixed dark gradient
  const [menuOpen, setMenuOpen] = useState(false);

  // lock scroll when mobile menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { to: '/about', label: 'About' },
    { to: '/#features', label: 'Features' },
    { to: '/#pricing', label: 'Pricing' },
    { to: '/login', label: 'Login' },
  ];

  return (
    <div className={rootClasses}>
      {/* Single drifting blue orb */}
  <div className="pointer-events-none absolute inset-0 z-0">
        <div className="orb-single" />
      </div>
      {/* Navbar */}
  <header className="w-full bg-transparent z-50 sticky top-0 md:relative">
  <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Vertex AI Logo" className="w-9 h-9 rounded-full object-cover select-none" draggable={false} />
            <span className="font-semibold tracking-wide text-sm md:text-base text-[#ffffff]">Vertex AI</span>
          </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              {navLinks.map(l => (
                <Link key={l.label} to={l.to} className="text-white/90 hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
              <Link
                to="/signup"
                className="rounded-full px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#6D848D] transition-colors"
                style={{ background: 'linear-gradient(to right, #6D848D 0%, #FFFFFF 100%)', color: '#0f1416' }}
              >
                Try Now
              </Link>
            </nav>

            {/* Mobile actions */}
            <div className="flex md:hidden items-center gap-2 ml-auto">
              <Link
                to="/signup"
                className="rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm"
                style={{ background: 'linear-gradient(to right, #6D848D 0%, #FFFFFF 100%)', color: '#0f1416' }}
              >
                Try
              </Link>
              <button
                aria-label="Toggle navigation menu"
                onClick={() => setMenuOpen(o => !o)}
                className="relative w-10 h-10 inline-flex items-center justify-center rounded-lg border border-white/10 hover:border-white/25 transition-colors"
              >
                <span className="sr-only">Menu</span>
                <div className="flex flex-col gap-1.5">
                  <span className={`block h-0.5 w-5 bg-white transition-transform ${menuOpen ? 'translate-y-1.5 rotate-45' : ''}`}></span>
                  <span className={`block h-0.5 w-5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block h-0.5 w-5 bg-white transition-transform ${menuOpen ? '-translate-y-1.5 -rotate-45' : ''}`}></span>
                </div>
              </button>
            </div>
        </div>
        {/* Mobile panel */}
  <div className={`md:hidden fixed inset-x-0 top-14 origin-top shadow-lg border-t border-white/10 bg-[#1d1d1d]/95 backdrop-blur-lg transition-[max-height] overflow-hidden z-40 ${menuOpen ? 'max-h-[400px]' : 'max-h-0'}`}> 
          <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium">
            {navLinks.map(l => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="py-2 border-b border-white/5 last:border-b-0 text-white/90 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm text-[#0f1416]"
              style={{ background: 'linear-gradient(to right, #6D848D 0%, #FFFFFF 100%)' }}
            >
              Try Now
            </Link>
          </nav>
        </div>
      </header>

  <main className="relative z-10 flex-1 container mx-auto px-4 md:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
