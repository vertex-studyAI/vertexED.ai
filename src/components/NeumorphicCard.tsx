import { cn } from "@/lib/utils";
import { PropsWithChildren, useState } from "react";

interface NeumorphicCardProps {
  className?: string;
  title?: string;
  onClick?: () => void;
  info?: string;
}

export default function NeumorphicCard({ className, title, children, onClick, info }: PropsWithChildren<NeumorphicCardProps>) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <section onClick={onClick} className={cn("relative neu-card p-5 hover-scale", className)}>
      {title && (
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="text-lg font-medium text-foreground">{title}</h2>
          {info && (
            <button
              type="button"
              aria-label={`Info about ${title}`}
              aria-expanded={showInfo}
              onClick={(e) => { e.stopPropagation(); setShowInfo((v) => !v); }}
              className="neu-button px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >i</button>
          )}
        </div>
      )}
      {showInfo && info && (
        <div className="mb-2 text-xs rounded-xl border border-border/60 px-3 py-2 bg-foreground/[0.04] text-muted-foreground backdrop-blur-md">
          {info}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
