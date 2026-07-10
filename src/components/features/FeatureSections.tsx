import { Link } from "react-router-dom";
import {
  BOARD_SPOTLIGHTS,
  ECOSYSTEM_EXTRAS,
  FEATURE_FAQ,
  REVISION_WEEK,
  SCATTERED_VS_VERTEX,
  STUDY_LOOP,
} from "@/content/features";

export function StudyLoopRail() {
  return (
    <div className="feat-loop-rail" role="list" aria-label="Study loop steps">
      {STUDY_LOOP.map((item, i) => (
        <div key={item.step} className="feat-loop-rail-item" role="listitem">
          <Link to={item.href} className="feat-loop-rail-link group">
            <span className="feat-loop-index">{i + 1}</span>
            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {item.step}
            </span>
            <span className="text-xs text-muted-foreground mt-1 block">{item.tool}</span>
          </Link>
          {i < STUDY_LOOP.length - 1 && (
            <span className="feat-loop-connector hidden md:block" aria-hidden>→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function RevisionWeekTimeline() {
  return (
    <section className="reveal-section px-4 md:px-6 pb-20" aria-labelledby="revision-week-heading">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">A real revision week</p>
        <h2 id="revision-week-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4 max-w-2xl">
          What using the full loop actually looks like
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl mb-10">
          Not a fantasy schedule — a plausible five days with school, sport, and a mock on Thursday.
          Each step uses a different part of VertexED; none of it requires heroic discipline.
        </p>

        <div className="feat-timeline-rail">
          {REVISION_WEEK.map((item, i) => (
            <article key={item.day} className="feat-timeline-card glass-tile">
              <div className="feat-timeline-marker">
                <span className="feat-timeline-dot" />
                {i < REVISION_WEEK.length - 1 && <span className="feat-timeline-line" aria-hidden />}
              </div>
              <div className="pb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{item.day}</p>
                <h3 className="text-lg font-semibold text-foreground mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScatterCompare() {
  return (
    <section className="reveal-section px-4 md:px-6 pb-20" aria-labelledby="compare-heading">
      <div className="max-w-6xl mx-auto glass-panel p-8 md:p-10">
        <h2 id="compare-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Twelve tabs vs one loop
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl leading-relaxed">
          Most students already have the apps. What&apos;s missing is the connection between them — and feedback
          that actually changes the next session.
        </p>
        <div className="feat-compare-grid">
          <div className="feat-compare-head text-muted-foreground">Scattered stack</div>
          <div className="feat-compare-head text-primary">VertexED</div>
          {SCATTERED_VS_VERTEX.map((row) => (
            <div key={row.scattered} className="contents">
              <div className="feat-compare-cell feat-compare-muted">{row.scattered}</div>
              <div className="feat-compare-cell">{row.vertex}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BoardSpotlights() {
  return (
    <section className="reveal-section px-4 md:px-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Board-aware, not board-owned</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOARD_SPOTLIGHTS.map((b) => (
            <article key={b.board} className="glass-tile p-6">
              <p className="text-sm font-semibold text-primary mb-2">{b.board}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EcosystemExtras() {
  return (
    <section className="reveal-section px-4 md:px-6 pb-20" aria-labelledby="ecosystem-heading">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Beyond the core six</p>
        <h2 id="ecosystem-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          The rest of the ecosystem
        </h2>
        <p className="text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Learning Hub, Archives, Study Tools, and Resources handle the parts of studying that happen
          before and between sessions.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {ECOSYSTEM_EXTRAS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.id} to={item.href} className="feat-eco-card glass-tile p-6 group">
                <div className="flex items-start gap-4">
                  <span className="feat-eco-icon">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-foreground/85 mt-1">{item.summary}</p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function FeatureFAQ() {
  return (
    <section className="reveal-section px-4 md:px-6 pb-24" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto">
        <h2 id="faq-heading" className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
          Questions students actually ask
        </h2>
        <div className="space-y-4">
          {FEATURE_FAQ.map((item) => (
            <details key={item.q} className="feat-faq-item glass-tile group">
              <summary className="feat-faq-summary">{item.q}</summary>
              <p className="feat-faq-answer">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
