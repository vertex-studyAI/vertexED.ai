import { useState, type ReactNode } from "react";
import type { LandingProblem } from "@/content/landing";

function DispersiveFace({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`problem-card-face liquid-glass-dispersive absolute inset-0 ${className ?? ""}`} style={style}>
      <span className="liquid-caustic liquid-caustic-a" aria-hidden />
      <span className="liquid-caustic liquid-caustic-b" aria-hidden />
      <span className="liquid-prism-ring" aria-hidden />
      <div className="liquid-glass-content h-full flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

type Props = {
  problem: LandingProblem;
  index: number;
};

export default function ProblemFlipCard({ problem, index }: Props) {
  const [flipped, setFlipped] = useState(false);

  const toggle = () => setFlipped((f) => !f);

  return (
    <div className="problem-card-container">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`${problem.stat} — ${problem.title}. Click to read more.`}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="group relative h-64 rounded-3xl perspective tilt-card cursor-pointer"
      >
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-600 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <DispersiveFace className="problem-card-front gap-4 p-6 text-center">
            <span className="stat-number text-5xl md:text-6xl font-bold tabular-nums text-foreground">
              {problem.stat}
            </span>
            <span className="text-sm font-medium text-foreground/80 max-w-[14rem] leading-snug">
              {problem.title}
            </span>
            <span className="text-xs italic text-muted-foreground">Tap to read</span>
          </DispersiveFace>

          <DispersiveFace
            className="problem-card-back p-7"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div className="text-left w-full">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">Insight {index + 1}</p>
              <p className="text-base leading-relaxed text-foreground/90">{problem.text}</p>
            </div>
          </DispersiveFace>
        </div>
      </div>
    </div>
  );
}
