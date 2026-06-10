import { useTheme } from "@/contexts/ThemeContext";
import { Check, Laptop, Moon, Palette, Sun, Zap } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "amoled", label: "AMOLED", icon: Zap },
  { value: "system", label: "System", icon: Laptop },
] as const;

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const current = THEME_OPTIONS.find((option) => option.value === theme);
  const Icon = current?.icon ?? (resolvedTheme === "light" ? Sun : Moon);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Change appearance"
          title={`Appearance: ${current?.label ?? "System"}`}
          className={`relative inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 text-sm font-medium text-white/85 backdrop-blur-xl transition-all hover:bg-white/15 hover:border-white/25 active:scale-95 ${className}`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white transition-colors`}
            aria-hidden
          >
            <Icon size={15} />
          </span>
          <span className="hidden md:inline">
            {current?.label ?? "Theme"}
          </span>
          <Palette size={14} className="hidden md:block text-white/50" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/10 bg-[#0f172a]/96 text-white shadow-2xl backdrop-blur-xl">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.16em] text-white/45">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/8" />
        {THEME_OPTIONS.map((option) => {
          const OptionIcon = option.icon;
          const active = theme === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => {
                track("theme_set", { to: option.value });
                setTheme(option.value);
              }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/85 focus:bg-white/10 focus:text-white"
            >
              <span className="flex items-center gap-2">
                <OptionIcon size={14} className="text-white/60" />
                {option.label}
              </span>
              {active ? <Check size={14} className="text-[hsl(var(--primary))]" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
