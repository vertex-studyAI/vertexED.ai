import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  Download,
  Loader2,
  Sparkles,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';

import PageSection from '@/components/PageSection';
import NeumorphicCard from '@/components/NeumorphicCard';
import RichMarkdown from '@/components/RichMarkdown';
import { useAuth } from '@/contexts/AuthContext';
import { BOARD_CONFIGS, getCurriculumPreference } from '@/lib/curriculum';
import type { ExamBoard } from '@/types/curriculum';
import { getGuidesForBoard, type BoardGuideTopic } from '@/content/boardResourceCatalog';
import {
  exportGuideMarkdown,
  generateBoardGuide,
  getCachedGuide,
  type BoardGuide,
} from '@/lib/boardResources';

const ALL_BOARDS: ExamBoard[] = [
  'IB_DP',
  'IB_MYP',
  'IGCSE',
  'GCSE',
  'A_LEVELS',
  'AP',
  'ICSE',
  'CBSE',
];

export default function ResourceLibrary() {
  const { user } = useAuth();
  const pref = getCurriculumPreference(user);
  const [board, setBoard] = useState<ExamBoard | null>(pref.board);
  const [activeTopic, setActiveTopic] = useState<BoardGuideTopic | null>(null);
  const [guide, setGuide] = useState<BoardGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topics = useMemo(() => getGuidesForBoard(board), [board]);

  const openTopic = async (topic: BoardGuideTopic) => {
    if (!board) {
      setError('Pick your exam board first.');
      return;
    }
    setActiveTopic(topic);
    setError(null);

    const cached = getCachedGuide(board, topic.id);
    if (cached) {
      setGuide(cached);
      return;
    }

    setLoading(true);
    setGuide(null);
    try {
      const generated = await generateBoardGuide(board, topic, pref.grade);
      setGuide(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate guide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Board Resource Library — VertexED</title>
        <meta
          name="description"
          content="In-depth IB, AP, IGCSE, ICSE, GCSE, and A Level study guides — 1000+ words each, tailored to your exam board."
        />
        <link rel="canonical" href="https://www.vertexed.app/resource-library" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <PageSection className="max-w-5xl space-y-8 portal-rise">
        <div className="flex flex-wrap gap-3 items-center">
          <Link
            to="/learning-hub"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:border-primary/30 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Learning Hub
          </Link>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:border-primary/30 transition"
          >
            <BookOpen className="h-4 w-4" />
            Articles
          </Link>
        </div>

        <header className="immersive-hero rounded-2xl border border-white/10 p-8 md:p-10">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary/80 mb-3">
            <GraduationCap className="h-4 w-4" />
            Board Resource Library
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Deep guides for IB, AP, IGCSE & ICSE
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
            Each guide is 1,000+ words of original, board-specific exam technique — mark schemes,
            pacing, common traps, and a revision schedule. Generated once per topic and cached on your
            device.
          </p>
        </header>

        <NeumorphicCard className="p-6" title="Your exam board">
          <div className="flex flex-wrap gap-2">
            {ALL_BOARDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setBoard(b);
                  setActiveTopic(null);
                  setGuide(null);
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm border transition ${
                  board === b
                    ? 'border-primary/50 bg-primary/15 text-foreground'
                    : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                }`}
              >
                {BOARD_CONFIGS[b].label}
              </button>
            ))}
          </div>
          {!pref.board && (
            <p className="text-xs text-muted-foreground mt-4">
              <Link to="/user-settings" className="text-primary hover:underline">
                Save your board in settings
              </Link>{' '}
              so guides open pre-filtered.
            </p>
          )}
        </NeumorphicCard>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <NeumorphicCard className="p-6" title={board ? `${BOARD_CONFIGS[board].label} topics` : 'Pick a board'}>
            <div className="space-y-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => void openTopic(topic)}
                  className={`w-full text-left rounded-xl border p-4 transition hover:border-primary/30 ${
                    activeTopic?.id === topic.id
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {topic.subject}
                      </p>
                      <h3 className="font-medium mt-0.5">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                    </div>
                    <span className="shrink-0 text-[10px] rounded-full border border-white/10 px-2 py-0.5 text-muted-foreground">
                      ~{topic.estimatedWords}w
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {topic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 min-h-[420px]" title={activeTopic?.title ?? 'Select a topic'}>
            {!activeTopic && (
              <p className="text-sm text-muted-foreground">
                Choose a topic on the left. Guides are written for your board&apos;s command terms,
                paper structure, and marking logic.
              </p>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Writing your {activeTopic?.estimatedWords ?? 1200}-word guide…</p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 border border-red-400/20 rounded-lg p-3 bg-red-400/5">
                {error}
              </p>
            )}

            {guide && !loading && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    {guide.wordCount.toLocaleString()} words
                  </span>
                  <button
                    type="button"
                    onClick={() => exportGuideMarkdown(guide)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 hover:border-primary/30 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export .md
                  </button>
                  <Link
                    to="/study-notebook"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 hover:border-primary/30 transition"
                  >
                    Add to Notebook →
                  </Link>
                </div>
                <article className="prose-scroll max-h-[70vh] overflow-y-auto pr-2 immersive-reading">
                  <RichMarkdown>{guide.content}</RichMarkdown>
                </article>
              </div>
            )}
          </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}
