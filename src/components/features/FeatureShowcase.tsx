import { Link } from "react-router-dom";
import type { Feature } from "@/content/features";

type Props = {
  feature: Feature;
  index: number;
  compact?: boolean;
};

export default function FeatureShowcase({ feature, index, compact = false }: Props) {
  const num = String(index + 1).padStart(2, "0");
  const reversed = index % 2 === 1;

  if (compact) {
    return (
      <article className="feature-strip glass-panel p-8 md:p-10 reveal-card">
        <div className="flex gap-6 items-start">
          <span className="text-5xl font-bold text-primary/20 tabular-nums shrink-0">{num}</span>
          <div>
            <p className="text-sm font-medium text-primary mb-1">{feature.tagline}</p>
            <h3 className="text-2xl font-semibold text-foreground mb-3">{feature.title}</h3>
            <p className="text-foreground/90 leading-relaxed mb-3">{feature.lead}</p>
            <p className="text-muted-foreground leading-relaxed text-sm">{feature.body}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      id={feature.id}
      className={`feat-block scroll-mt-28 reveal-section ${reversed ? "feat-block-reverse" : ""}`}
    >
      <div className="feat-block-inner glass-panel overflow-hidden">
        <div className={`feat-block-grid ${reversed ? "md:grid-flow-dense" : ""}`}>
          <div className={`feat-block-aside ${reversed ? "md:col-start-2" : ""}`}>
            <span className="feat-index-num" aria-hidden>{num}</span>
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium mb-2">{feature.tagline}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">{feature.title}</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">{feature.lead}</p>
            {feature.href && (
              <Link to={feature.href} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                Open {feature.title.split(" · ")[0]} →
              </Link>
            )}
          </div>

          <div className={`feat-block-body space-y-6 ${reversed ? "md:col-start-1 md:row-start-1" : ""}`}>
            <p className="text-muted-foreground leading-relaxed">{feature.body}</p>
            <p className="text-foreground/85 leading-relaxed">{feature.detail}</p>

            <blockquote className="feat-scenario">
              <p className="text-sm font-medium text-primary mb-2">A real session</p>
              <p className="text-foreground/90 leading-relaxed italic">{feature.scenario}</p>
            </blockquote>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">What changes</p>
              <ul className="feat-outcomes">
                {feature.outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>

            <ul className="space-y-2.5 text-sm text-foreground/85 border-t border-border/60 pt-5">
              {feature.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="text-primary shrink-0 mt-0.5">—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
