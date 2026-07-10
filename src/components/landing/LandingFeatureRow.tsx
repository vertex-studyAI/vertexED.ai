import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { LandingFeature } from '@/content/landing';
import LiquidGlass from '@/components/LiquidGlass';

const LOOP_LABELS: Record<LandingFeature['loop'], string> = {
  plan: 'Plan',
  focus: 'Focus',
  practise: 'Practise',
  review: 'Review',
  remember: 'Remember',
};

type Props = {
  feature: LandingFeature;
  index: number;
};

export default function LandingFeatureRow({ feature, index }: Props) {
  const reversed = index % 2 !== 0;

  return (
    <div
      className={`feature-row flex flex-col md:flex-row items-stretch gap-8 md:gap-12 pop-up ${
        reversed ? 'md:flex-row-reverse' : ''
      }`}
    >
      <LiquidGlass variant="card" className="flex-1 rounded-3xl tilt-card feature-card w-full">
        <div className="p-8 md:p-9">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="loop-phase-chip">{LOOP_LABELS[feature.loop]}</span>
            <span className="text-xs text-muted-foreground">· revision loop</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{feature.title}</h3>
          <p className="text-lg leading-relaxed text-foreground/90 mb-4">{feature.desc}</p>
          <p className="text-sm text-primary/90 font-medium mb-5">{feature.outcome}</p>
          <Link
            to={feature.href}
            className="btn-glass text-sm inline-flex items-center gap-1.5"
          >
            Open {feature.title.split(' ')[0]}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </LiquidGlass>

      <div className="flex-1 flex flex-col justify-center text-lg md:text-xl leading-relaxed text-muted-foreground cinematic-text px-1">
        <p className="text-foreground/90 font-medium mb-4">{feature.side}</p>
        <Link to="/features" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          Full walkthrough →
        </Link>
      </div>
    </div>
  );
}
