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
    <section onClick={onClick} className={cn("relative glass-tile p-5 hover-scale", className)}>
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
        <div className="mb-2 text-xs rounded-xl border border-white/15 px-3 py-2 bg-white/5 backdrop-blur-md">
          {info}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
