import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  className?: string;
  surface?: "none" | "card" | "hero";
}

const surfaceMap = {
  none: "",
  card: "rounded-[28px] border border-white/8 bg-white/5 shadow-[0_24px_100px_rgba(0,0,0,0.24)] backdrop-blur-xl",
  hero: "rounded-[32px] border border-white/8 bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-[0_28px_120px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
} as const;

export default function PageSection({
  className,
  children,
  surface = "none",
}: PropsWithChildren<PageSectionProps>) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[1440px] px-0",
        surfaceMap[surface],
        surface !== "none" && "p-5 md:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}
