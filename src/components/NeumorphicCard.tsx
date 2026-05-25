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
    <section
      onClick={onClick}
      className={cn(
        "relative overflow-hidden neu-card border border-white/6 bg-white/4 backdrop-blur-xl shadow-[0_18px_80px_rgba(0,0,0,0.28)] hover:neu-lift hover-scale transition-transform",
        className,
      )}
    >
      {title && (
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="text-lg font-medium">{title}</h2>
          {info && (
            <button
              aria-label={`Info about ${title}`}
              onClick={(e) => { e.stopPropagation(); setShowInfo((v) => !v); }}
              className="neu-button px-2 py-1 text-xs"
            >i</button>
          )}
        </div>
      )}
      {showInfo && info && (
        <div className="mb-2 rounded-md border border-white/8 bg-black/30 px-3 py-2 text-xs text-white/75">
          {info}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
