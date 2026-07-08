import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  className?: string;
  surface?: "none" | "card" | "hero";
}

export default function PageSection({ className, children, surface = "none" }: PropsWithChildren<PageSectionProps>) {
  const surfaceClass =
    surface === "card"
      ? "glass-panel p-6 md:p-8"
      : surface === "hero"
        ? "glass-card p-6 md:p-10"
        : "";
  return (
    <section className={cn("max-w-6xl mx-auto w-full", surfaceClass, className)}>
      {children}
    </section>
  );
}
