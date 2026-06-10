import { Helmet } from "react-helmet-async";
import PageSection from "@/components/PageSection";
import { useAnalyticsSnapshot, clearAnalytics } from "@/lib/analytics";

export default function AnalyticsPage() {
  const { total, pageviews, topPaths, topEvents, events } = useAnalyticsSnapshot();

  return (
    <>
      <Helmet>
        <title>Analytics — VertexED</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <PageSection className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-fade-in">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Insights</p>
              <h1 className="mt-1 text-3xl md:text-4xl font-semibold brand-text-gradient">
                Local analytics
              </h1>
              <p className="mt-2 text-sm text-white/65 max-w-xl">
                Privacy-friendly client-side telemetry. Events live in your browser only.
                Useful for spotting what students actually open.
              </p>
            </div>
            <button
              onClick={() => clearAnalytics()}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Clear events
            </button>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Total events" value={total} />
            <Stat label="Pageviews" value={pageviews} />
            <Stat label="Unique paths" value={topPaths.length} />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Panel title="Top paths">
              <BarList rows={topPaths} />
            </Panel>
            <Panel title="Top events">
              <BarList rows={topEvents} />
            </Panel>
          </div>

          <Panel title="Recent events" className="mt-6">
            <ul className="divide-y divide-white/5 text-sm">
              {events.slice(-20).reverse().map((e, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span className="font-medium text-white/85">{e.name}</span>
                  <span className="text-white/55 truncate max-w-[50%]">{e.path}</span>
                  <span className="text-xs text-white/45">
                    {new Date(e.ts).toLocaleTimeString()}
                  </span>
                </li>
              ))}
              {events.length === 0 && (
                <li className="py-4 text-center text-white/55">No events yet — navigate around to populate.</li>
              )}
            </ul>
          </Panel>
        </div>
      </PageSection>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-tile-translucent rounded-2xl p-5 fade-up">
      <div className="text-xs uppercase tracking-wider text-white/55">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white tabular-nums">{value}</div>
    </div>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`glass-panel p-5 ${className}`}>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/70">{title}</h2>
      {children}
    </section>
  );
}

function BarList({ rows }: { rows: [string, number][] }) {
  const max = rows.reduce((m, r) => Math.max(m, r[1]), 1);
  if (rows.length === 0) return <p className="text-sm text-white/55">No data yet.</p>;
  return (
    <ul className="space-y-2">
      {rows.map(([k, v]) => (
        <li key={k}>
          <div className="flex justify-between text-xs text-white/70">
            <span className="truncate pr-2">{k}</span>
            <span className="tabular-nums">{v}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] transition-[width] duration-500"
              style={{ width: `${(v / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
