import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      aria-label="Toggle theme"
      className="neu-toggle group transition-all duration-300 hover:-rotate-[15deg] hover:shadow-2xl hover:shadow-primary/30"
      onClick={() => setDark((v) => !v)}
    >
      <Sun className={`h-4 w-4 transition-all duration-300 group-hover:rotate-12 ${dark ? 'opacity-40 scale-90' : 'opacity-100 scale-100'}`} />
      <Moon className={`h-4 w-4 transition-all duration-300 group-hover:-rotate-12 ${dark ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`} />
    </button>
  );
}
