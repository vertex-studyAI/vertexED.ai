import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Brain,
  Network,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

import PageSection from '@/components/PageSection';
import NeumorphicCard from '@/components/NeumorphicCard';
import { useAuth } from '@/contexts/AuthContext';
import { BOARD_CONFIGS, getCurriculumPreference } from '@/lib/curriculum';
import {
  buildWorldModel,
  getWorldModelPromptContext,
  type ConceptNode,
  type WorldModel,
} from '@/lib/worldModel';
import { authFetch } from '@/lib/apiAuth';

const LAYER_LABELS = {
  foundation: 'Foundation',
  core: 'Core concepts',
  exam: 'Exam ready',
};

const STATUS_COLORS: Record<ConceptNode['status'], string> = {
  strong: '#34d399',
  building: '#7dd3fc',
  weak: '#f87171',
  unknown: '#94a3b8',
};

function layoutNodes(nodes: ConceptNode[], width: number, height: number) {
  const layers: ConceptNode['layer'][] = ['foundation', 'core', 'exam'];
  const byLayer = layers.map((layer) => nodes.filter((n) => n.layer === layer));
  const positions = new Map<string, { x: number; y: number }>();

  byLayer.forEach((group, layerIdx) => {
    const y = height * (0.18 + layerIdx * 0.32);
    group.forEach((node, i) => {
      const x = ((i + 1) / (group.length + 1)) * width;
      positions.set(node.id, { x, y });
    });
  });

  return positions;
}

export default function WorldModelPage() {
  const { user } = useAuth();
  const pref = getCurriculumPreference(user);
  const [model, setModel] = useState<WorldModel | null>(null);
  const [selected, setSelected] = useState<ConceptNode | null>(null);
  const [simulation, setSimulation] = useState<string | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    setModel(buildWorldModel(pref.board, pref.subjects, pref.grade));
  }, [pref.board, pref.grade, pref.subjects]);

  const positions = useMemo(() => {
    if (!model) return new Map();
    return layoutNodes(model.nodes, 640, 360);
  }, [model]);

  const runSimulation = async () => {
    if (!model) return;
    setSimLoading(true);
    setSimulation(null);
    try {
      const context = getWorldModelPromptContext(model);
      const res = await authFetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `World Model exam simulation. ${context}\n\nWrite a vivid 3-paragraph "what happens in the exam hall" scenario for this student. Include one surprise question linked to a weak node and how to recover marks using board technique.`,
          mode: 'coach',
          learnerContext: context,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setSimulation(data.reply ?? data.error ?? 'Simulation unavailable.');
    } catch {
      setSimulation(model.examScenario);
    } finally {
      setSimLoading(false);
    }
  };

  if (!model) return null;

  const boardLabel = pref.board ? BOARD_CONFIGS[pref.board].label : 'Your exams';

  return (
    <>
      <Helmet>
        <title>World Model Learning — VertexED</title>
        <meta
          name="description"
          content="Interactive concept graph — see how foundations, core topics, and exam readiness connect for your board."
        />
        <link rel="canonical" href="https://www.vertexed.app/world-model" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <PageSection className="max-w-6xl space-y-8 portal-rise">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/learning-hub"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-foreground/[0.04] px-4 py-2 text-sm hover:border-primary/30 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Learning Hub
          </Link>
        </div>

        <header className="immersive-hero rounded-2xl border border-violet-400/20 p-8 md:p-10 world-model-glow">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-violet-300/90 mb-3">
            <Network className="h-4 w-4" />
            World Model Learning
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {boardLabel} concept map
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            {model.narrative} Each node reflects a topic layer — foundation, core, or exam-ready — coloured by your recent mock and review scores.
            Weak nodes show where to drill before sitting a full paper.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <NeumorphicCard className="p-4 md:p-6 overflow-hidden" title="Concept constellation">
            <svg
              viewBox="0 0 640 360"
              className="w-full h-auto world-model-svg"
              role="img"
              aria-label="Concept graph showing subject topics and mastery"
            >
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </radialGradient>
              </defs>

              {model.edges.map((edge, i) => {
                const from = positions.get(edge.from);
                const to = positions.get(edge.to);
                if (!from || !to) return null;
                return (
                  <line
                    key={`${edge.from}-${edge.to}-${i}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={
                      edge.relation === 'feeds-exam'
                        ? 'rgba(167,139,250,0.45)'
                        : 'rgba(125,211,252,0.25)'
                    }
                    strokeWidth={edge.relation === 'interleave' ? 2 : 1}
                    strokeDasharray={edge.relation === 'interleave' ? '4 4' : undefined}
                  />
                );
              })}

              {model.nodes.map((node) => {
                const pos = positions.get(node.id);
                if (!pos) return null;
                const color = STATUS_COLORS[node.status];
                const r = node.layer === 'exam' ? 22 : 16;
                return (
                  <g
                    key={node.id}
                    className="world-model-node cursor-pointer"
                    onClick={() => setSelected(node)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelected(node)}
                    role="button"
                    tabIndex={0}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r + 12}
                      fill="url(#nodeGlow)"
                      style={{ color }}
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={r}
                      fill={`${color}33`}
                      stroke={color}
                      strokeWidth={selected?.id === node.id ? 3 : 1.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + r + 14}
                      textAnchor="middle"
                      fill="rgba(248,250,252,0.85)"
                      fontSize="9"
                    >
                      {node.label.length > 22 ? `${node.label.slice(0, 20)}…` : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
              {Object.entries(LAYER_LABELS).map(([key, label]) => (
                <span key={key} className="inline-flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background:
                        key === 'exam' ? '#a78bfa' : key === 'core' ? '#7dd3fc' : '#64748b',
                    }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </NeumorphicCard>

          <div className="space-y-6">
            <NeumorphicCard className="p-6" title={selected ? selected.label : 'Explore a node'}>
              {selected ? (
                <div className="space-y-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Subject:</span> {selected.subject}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Layer:</span>{' '}
                    {LAYER_LABELS[selected.layer]}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Mastery signal:</span>{' '}
                    <strong style={{ color: STATUS_COLORS[selected.status] }}>
                      {selected.mastery}%
                    </strong>
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {selected.status === 'weak'
                      ? 'Priority retrieval target — run a 15-minute weak sprint, then check the mark scheme.'
                      : selected.status === 'strong'
                        ? 'Maintain with interleaved practice — teach this topic aloud to lock it in.'
                        : 'Build with spaced flashcards and one timed question per session.'}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link
                      to="/paper-maker"
                      className="rounded-full border border-border/60 px-3 py-1.5 text-xs hover:border-primary/30 transition"
                    >
                      Practice paper
                    </Link>
                    <Link
                      to="/notetaker"
                      className="rounded-full border border-border/60 px-3 py-1.5 text-xs hover:border-primary/30 transition"
                    >
                      Flashcards
                    </Link>
                    <Link
                      to="/study-notebook"
                      className="rounded-full border border-border/60 px-3 py-1.5 text-xs hover:border-primary/30 transition"
                    >
                      Notebook
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tap any node to see mastery, layer, and suggested next actions.
                </p>
              )}
            </NeumorphicCard>

            <NeumorphicCard className="p-6" title="Exam hall simulation">
              <p className="text-sm text-muted-foreground mb-4">{model.examScenario}</p>
              <button
                type="button"
                onClick={() => void runSimulation()}
                disabled={simLoading}
                className="inline-flex items-center gap-2 rounded-full bg-violet-500/20 border border-violet-400/30 px-4 py-2 text-sm hover:bg-violet-500/30 transition disabled:opacity-50"
              >
                {simLoading ? (
                  <Brain className="h-4 w-4 animate-pulse" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Run immersive scenario
              </button>
              {simulation && (
                <div className="mt-4 text-sm leading-relaxed border-t border-border/60 pt-4 immersive-reading">
                  {simulation}
                </div>
              )}
            </NeumorphicCard>

            <NeumorphicCard className="p-6" title="Quick actions">
              <div className="grid gap-2">
                <Link
                  to="/resource-library"
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-foreground/[0.04] px-3 py-2.5 hover:border-primary/25 transition text-sm"
                >
                  <Target className="h-4 w-4 text-primary" />
                  Board deep-dive guides (1000+ words)
                </Link>
                <Link
                  to="/study-zone?focus=sketch"
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-foreground/[0.04] px-3 py-2.5 hover:border-primary/25 transition text-sm"
                >
                  <Zap className="h-4 w-4 text-primary" />
                  Sketch pad (iPad / Pencil)
                </Link>
              </div>
            </NeumorphicCard>
          </div>
        </div>
      </PageSection>
    </>
  );
}
