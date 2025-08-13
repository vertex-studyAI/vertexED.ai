import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";

interface NeumorphicCardProps {
  className?: string;
  title?: string;
  onClick?: () => void;
  info?: string;
}

export default function NeumorphicCard({ className, title, children, onClick, info }: PropsWithChildren<NeumorphicCardProps>) {
  return (
    <section onClick={onClick} className={cn("relative neu-card hover:neu-lift hover-scale transition-transform", className)}>
      {title && (
        <div className="mb-2 flex items-start justify-between gap-2">
          <h2 className="text-lg font-medium">{title}</h2>
          {info && (
            <Popover>
              <PopoverTrigger asChild>
                <button aria-label={`Info about ${title}`} className="neu-button px-2 py-1 text-sm">
                  <Info className="h-4 w-4" aria-hidden="true" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-sm">{info}</PopoverContent>
            </Popover>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
