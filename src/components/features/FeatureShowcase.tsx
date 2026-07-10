import { Link } from "react-router-dom";
import type { Feature } from "@/content/features";
import { getFeatureById } from "@/content/features";

type Props = {
  feature: Feature;
  index: number;
  compact?: boolean;
};

export default function FeatureShowcase({ feature, index, compact = false }: Props) {
  const num = String(index + 1).padStart(2, "0");
  const reversed = index % 2 === 1;
  const Icon = feature.icon;

  if (compact) {
    return (
      <article className="feature-strip glass-panel p-8 md:p-10 reveal-card">
        <div className="flex gap-6 items-start">
          <span className="feat-eco-icon shrink-0">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
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
            <div className="flex items-center gap-3 mb-4">
              <span className="feat-eco-icon">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="feat-index-num !text-3xl !mb-0" aria-hidden>{num}</span>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium mb-2">{feature.tagline}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">{feature.title}</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">{feature.lead}</p>

            {feature.boards && feature.boards.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {feature.boards.map((b) => (
                  <span key={b} className="glass-chip text-[10px] py-0.5">{b}</span>
                ))}
              </div>
            )}

            {feature.href && (
              <Link to={feature.href} className="btn-glass text-sm px-4 py-2 inline-flex">
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

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="feat-callout feat-callout-use">
                <p className="text-xs uppercase tracking-widest text-primary mb-2">Reach for this when</p>
                <ul className="space-y-1.5 text-sm text-foreground/85">
                  {feature.whenToUse.map((w) => (
                    <li key={w} className="flex gap-2">
                      <span className="text-primary shrink-0">+</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="feat-callout feat-callout-not">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Not trying to be</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.notFor}</p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">What changes</p>
              <ul className="feat-outcomes">
                {feature.outcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>

            {feature.connectsTo.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Connects to</p>
                <div className="flex flex-wrap gap-2">
                  {feature.connectsTo.map((c) => {
                    const target = getFeatureById(c.id);
                    return target?.href ? (
                      <a key={c.id} href={`#${c.id}`} className="glass-chip text-xs hover:border-primary/40 transition-colors">
                        {c.label}
                      </a>
                    ) : (
                      <span key={c.id} className="glass-chip text-xs">{c.label}</span>
                    );
                  })}
                </div>
              </div>
            )}

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
