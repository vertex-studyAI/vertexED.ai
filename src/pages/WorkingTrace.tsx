import PageSection from '@/components/PageSection';
import SEO from '@/components/SEO';
import WorkingTracePanel from '@/components/WorkingTracePanel';
import '@/styles/working-trace.css';
export default function WorkingTrace() {
  return <PageSection className="max-w-6xl"><SEO title="Check your maths working | VertexED" description="Check polynomial expressions, linear equations and physics dimensions, one step at a time." /><p className="text-sm text-primary mb-3">Maths and Physics / Working Trace</p><h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Keep the working. Find the gap.</h1><p className="text-base text-muted-foreground max-w-2xl leading-relaxed mb-8">Check algebra locally, inspect the first changed step and practise the underlying idea. Unsupported steps stay unverified.</p><WorkingTracePanel /></PageSection>;
}
