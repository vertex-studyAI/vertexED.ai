import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface NeumorphicCardProps {
  className?: string;
  title?: string;
  onClick?: () => void;
}

export default function NeumorphicCard({ className, title, children, onClick }: PropsWithChildren<NeumorphicCardProps>) {
  return (
    <section onClick={onClick} className={cn("neu-card hover:neu-lift hover-scale transition-transform", className)}>
      {title && <h2 className="text-lg font-medium mb-2">{title}</h2>}
      <div>{children}</div>
    </section>
  );
}
