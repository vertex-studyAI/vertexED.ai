import { PORTAL_FEATURES } from '@/content/portalCatalog';

function scrollToFeature(anchorId: string) {
  const el = document.getElementById(anchorId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.classList.add('portal-highlight-flash');
  window.setTimeout(() => el.classList.remove('portal-highlight-flash'), 1200);
}

export default function FeatureDiscoveryRibbon() {
  const handleSelect = (feature: (typeof PORTAL_FEATURES)[number]) => {
    if (feature.anchorId) {
      scrollToFeature(feature.anchorId);
    }
  };

  return (
    <section className="portal-discovery px-6 py-6 portal-rise" aria-label="Portal features">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="portal-eyebrow">Dashboard widgets</p>
            <h2 className="text-lg font-semibold text-foreground">Your study workspace</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Planner tasks, due cards, revision-loop activity, and verified evidence when available — tap a card to find the relevant panel or tool.
            </p>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">{PORTAL_FEATURES.length} panels</span>
        </div>
        <div className="portal-discovery-track">
          {PORTAL_FEATURES.map((f) => {
            const isInteractive = Boolean(f.anchorId);
            return (
              <button
                key={f.id}
                type="button"
                className="portal-discovery-card text-left"
                data-feature={f.id}
                disabled={!isInteractive}
                onClick={() => handleSelect(f)}
                aria-label={f.anchorId ? `Jump to ${f.name}` : f.name}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{f.name}</span>
                  {f.status === 'beta' && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/25">
                      beta
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
