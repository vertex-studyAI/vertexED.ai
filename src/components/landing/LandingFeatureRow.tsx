import { Link } from "react-router-dom";
import type { LandingFeature } from "@/content/landing";

type Props = {
  feature: LandingFeature;
  index: number;
};

export default function LandingFeatureRow({ feature, index }: Props) {
  const reversed = index % 2 !== 0;

  return (
    <div
      className={`feature-row flex flex-col md:flex-row items-center gap-10 md:gap-14 pop-up ${
        reversed ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="flex-1 neu-card rounded-3xl p-8 md:p-9 tilt-card feature-card w-full">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{feature.title}</h3>
        <p className="text-lg leading-relaxed text-foreground/88">{feature.desc}</p>
        <div className="feature-card-glow" aria-hidden />
      </div>

      <div className="flex-1 text-lg md:text-xl leading-relaxed text-muted-foreground cinematic-text">
        <p className="text-foreground/90 font-medium mb-3">{feature.side}</p>
        <Link to="/features" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2">
          See how it works →
        </Link>
      </div>
    </div>
  );
}
