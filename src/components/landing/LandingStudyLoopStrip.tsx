import { Link } from 'react-router-dom';
import { STUDY_LOOP } from '@/content/features';
import LiquidGlass from '@/components/LiquidGlass';

export default function LandingStudyLoopStrip() {
  return (
    <section className="landing-loop-strip px-6 py-12 md:py-14 cinematic-section" aria-label="Study loop">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-primary text-center mb-3">One revision loop</p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
          Plan → focus → practise → review → remember
        </h2>
        <div className="landing-loop-grid" role="list">
          {STUDY_LOOP.map((item, i) => (
            <div key={item.step} className="landing-loop-item" role="listitem">
              <LiquidGlass variant="tile" className="landing-loop-tile h-full rounded-2xl">
                <Link to={item.href} className="block p-4 md:p-5 group">
                  <span className="loop-phase-chip mb-3">{item.step}</span>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.tool}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
                </Link>
              </LiquidGlass>
              {i < STUDY_LOOP.length - 1 && (
                <span className="landing-loop-arrow hidden lg:block" aria-hidden>→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
