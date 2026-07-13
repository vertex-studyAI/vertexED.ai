import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Brain, CalendarClock, Network, ShieldCheck, Target } from 'lucide-react';
import PageSection from '@/components/PageSection';
import NeumorphicCard from '@/components/NeumorphicCard';
import { useAuth } from '@/contexts/AuthContext';
import { BOARD_CONFIGS, boardToApiLabel, getCurriculumPreference } from '@/lib/curriculum';
import { authFetch } from '@/lib/apiAuth';

type ConceptNode = {
  id: string;
  title: string;
  nodeType: string;
  description: string | null;
  masteryPercent: number;
  evidenceCount: number;
  lastEvidenceAt: string | null;
  dueAt: string | null;
};

type Summary = {
  available: boolean;
  message: string;
  subject?: { id: string; title: string };
  nodes: ConceptNode[];
  edges: Array<{ prerequisite_node_id: string; dependent_node_id: string; relation: string }>;
  recommendations: Array<{
    id: string;
    curriculum_node_id: string | null;
    recommendation_type: string;
    priority: number;
    explanation: string;
  }>;
};

function masteryStatus(value: number) {
  if (value >= 80) return { label: 'Supported', color: 'text-emerald-400' };
  if (value >= 60) return { label: 'Building', color: 'text-sky-300' };
  return { label: 'Needs review', color: 'text-amber-300' };
}

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function WorldModelPage() {
  const { user } = useAuth();
  const preference = getCurriculumPreference(user);
  const [subject, setSubject] = useState(preference.subjects[0] ?? '');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setSubject(preference.subjects[0] ?? ''), [preference.board, preference.subjects]);

  useEffect(() => {
    if (!preference.board || !subject) {
      setSummary(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await authFetch('/api/exam-catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'learning_summary', board: boardToApiLabel(preference.board), subject }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Could not load your verified concept evidence.');
        if (!cancelled) setSummary(data.summary as Summary);
      } catch (loadError) {
        if (!cancelled) {
          setSummary(null);
          setError(loadError instanceof Error ? loadError.message : 'Could not load your verified concept evidence.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [preference.board, subject]);

  const nodesById = useMemo(() => new Map((summary?.nodes ?? []).map((node) => [node.id, node])), [summary]);
  const boardLabel = preference.board ? BOARD_CONFIGS[preference.board].label : 'your curriculum';

  return (
    <>
      <Helmet>
        <title>Verified Concept Evidence | VertexED</title>
        <meta name="description" content="A concept map built only from verified, deterministically scored VertexED assessment evidence." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <PageSection className="max-w-6xl space-y-7 portal-rise">
        <Link to="/learning-hub" className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-foreground/[0.04] px-4 py-2 text-sm hover:border-primary/30 transition">
          <ArrowLeft className="h-4 w-4" /> Learning Hub
        </Link>

        <header className="immersive-hero rounded-2xl border border-violet-400/20 p-8 md:p-10 world-model-glow">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-violet-300/90 mb-3"><Network className="h-4 w-4" /> Verified learning evidence</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{boardLabel} concept map</h1>
          <p className="max-w-3xl text-muted-foreground leading-relaxed">This view uses only answers that VertexED could score deterministically from reviewed, authorized content. It never turns self-confidence, AI feedback, or unverified answers into mastery.</p>
        </header>

        {preference.subjects.length > 1 && (
          <label className="block max-w-sm text-sm"><span className="mb-2 block text-muted-foreground">Subject</span>
            <select className="neu-input-el w-full" value={subject} onChange={(event) => setSubject(event.target.value)}>
              {preference.subjects.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        )}

        {loading && <NeumorphicCard className="p-7"><div className="h-5 w-56 rounded skeleton-shimmer" /><div className="mt-3 h-4 w-full rounded skeleton-shimmer" /></NeumorphicCard>}
        {error && <NeumorphicCard className="p-7" title="Evidence unavailable"><p className="text-sm text-destructive">{error}</p></NeumorphicCard>}
        {!loading && !error && (!summary || summary.nodes.length === 0) && (
          <NeumorphicCard className="p-8 text-center" title="No verified concept evidence yet">
            <Brain className="mx-auto h-8 w-8 text-primary" />
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{summary?.message || 'Choose a curriculum and subject in Account Settings to begin.'} Assistive answer feedback and generic quizzes remain useful for learning, but they do not populate this map.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/paper-maker" className="btn-solid text-sm">Find verified practice</Link><Link to="/user-settings" className="btn-glass text-sm">Set curriculum</Link></div>
          </NeumorphicCard>
        )}

        {!loading && !error && summary && summary.nodes.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <NeumorphicCard className="p-6" title={`${summary.subject?.title || subject} evidence`}>
              <div className="space-y-3">
                {summary.nodes.map((node) => {
                  const status = masteryStatus(node.masteryPercent);
                  return <article key={node.id} className="rounded-xl border border-border/60 bg-foreground/[0.03] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-medium">{node.title}</h2><p className="mt-1 text-xs text-muted-foreground">{node.nodeType.replace(/_/g, ' ')} · {node.evidenceCount} verified attempt{node.evidenceCount === 1 ? '' : 's'}</p></div><span className={`text-sm font-medium ${status.color}`}>{node.masteryPercent}% · {status.label}</span></div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${node.masteryPercent}%` }} /></div>
                    {node.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{node.description}</p>}
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarClock className="h-3.5 w-3.5" /> Next review: {formatDate(node.dueAt)}</p>
                  </article>;
                })}
              </div>
            </NeumorphicCard>
            <div className="space-y-6">
              <NeumorphicCard className="p-6" title="Why these priorities">
                {summary.recommendations.length ? <div className="space-y-3">{summary.recommendations.map((recommendation) => <div key={recommendation.id} className="rounded-xl border border-border/60 p-3"><p className="text-sm font-medium">{nodesById.get(recommendation.curriculum_node_id || '')?.title || 'Concept priority'}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{recommendation.explanation}</p></div>)}</div> : <p className="text-sm text-muted-foreground">Recommendations appear after enough verified evidence has been collected. They are rules-based, not guesses from chat or confidence ratings.</p>}
              </NeumorphicCard>
              <NeumorphicCard className="p-6" title="Verified prerequisite links">
                {summary.edges.length ? <ul className="space-y-2 text-sm text-muted-foreground">{summary.edges.map((edge) => <li key={`${edge.prerequisite_node_id}-${edge.dependent_node_id}`}><span className="text-foreground">{nodesById.get(edge.prerequisite_node_id)?.title || 'Prerequisite'}</span> → <span className="text-foreground">{nodesById.get(edge.dependent_node_id)?.title || 'Dependent concept'}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">No verified prerequisite link connects two concepts with evidence yet.</p>}
              </NeumorphicCard>
              <NeumorphicCard className="p-6" title="Evidence boundary"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><p className="text-sm leading-relaxed text-muted-foreground">A percentage here is a model estimate from scored attempts, not a grade prediction or a statement of what you know. Low evidence counts should be treated as especially uncertain.</p></div><Link to="/paper-maker" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"><Target className="h-4 w-4" /> Continue with verified practice</Link></NeumorphicCard>
            </div>
          </div>
        )}
      </PageSection>
    </>
  );
}
