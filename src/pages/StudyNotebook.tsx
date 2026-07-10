import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookMarked,
  BookOpen,
  ChevronRight,
  Download,
  Eye,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  MessageCircle,
  Mic,
  Network,
  GraduationCap,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudyContext } from '@/lib/studyContext';
import { useApexChat } from '@/hooks/useApexChat';
import { recordStudySession } from '@/lib/studyStats';
import { listStudyArtifactsDetailed } from '@/lib/userContent';
import { generateNotebookOutput } from '@/lib/notebookApi';
import {
  NOTEBOOK_OUTPUT_META,
  NOTEBOOK_STUDIO_GROUPS,
  addTextSource,
  buildGroundingPayload,
  createNotebook,
  deleteNotebook,
  exportNotebookJson,
  getNotebook,
  getOutputByKind,
  listNotebooks,
  removeSource,
  saveOutput,
  sourceFromArtifact,
  toggleSource,
  totalSourceWords,
  updateNotebook,
  type NotebookOutputKind,
  type StudyNotebook,
} from '@/lib/notebook';
import NotebookOutputPanel from '@/components/notebook/NotebookOutputPanel';
import ApexMessageList from '@/components/chat/ApexMessageList';
import ApexChatInput from '@/components/chat/ApexChatInput';
import LiquidGlass from '@/components/LiquidGlass';
import { toast } from '@/hooks/use-toast';
import { logStudyActivity } from '@/lib/studyActivity';

const OUTPUT_ICONS: Partial<Record<NotebookOutputKind, typeof BookOpen>> = {
  'study-guide': BookOpen,
  briefing: FileText,
  faq: HelpCircle,
  'audio-script': Mic,
  'audio-brief': Mic,
  'audio-critique': Mic,
  'audio-debate': Mic,
  flashcards: Layers,
  'world-model': Network,
  'board-deep-dive': GraduationCap,
};

type StudioTab = 'chat' | NotebookOutputKind;

export default function StudyNotebook() {
  const { user } = useAuth();
  const studyContext = useMemo(() => getStudyContext('/study-notebook', user), [user]);

  const [notebooks, setNotebooks] = useState<StudyNotebook[]>(() => listNotebooks());
  const [activeId, setActiveId] = useState<string | null>(() => listNotebooks()[0]?.id ?? null);
  const [studioTab, setStudioTab] = useState<StudioTab>('chat');
  const [studioGroup, setStudioGroup] = useState(NOTEBOOK_STUDIO_GROUPS[0].id);
  const [generating, setGenerating] = useState<NotebookOutputKind | null>(null);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importable, setImportable] = useState<Array<{ id: string; title: string; content: string }>>([]);
  const [previewSourceId, setPreviewSourceId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const active = activeId ? getNotebook(activeId) : null;
  const previewSource = active?.sources.find((s) => s.id === previewSourceId) ?? null;

  const groundingSources = useMemo(
    () => (active ? buildGroundingPayload(active) : []),
    [active],
  );

  const { messages, input, setInput, loading, sendMessage } = useApexChat({
    context: studyContext,
    sources: groundingSources.length > 0 ? groundingSources : undefined,
    onSessionRecord: recordStudySession,
  });

  const refresh = useCallback(() => {
    const list = listNotebooks();
    setNotebooks(list);
    if (activeId && !list.find((n) => n.id === activeId)) {
      setActiveId(list[0]?.id ?? null);
    }
  }, [activeId]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const ensureNotebook = () => {
    if (active) return active;
    const nb = createNotebook('My study notebook');
    setActiveId(nb.id);
    refresh();
    return nb;
  };

  const handleAddPaste = () => {
    const nb = ensureNotebook();
    if (!pasteContent.trim()) return;
    addTextSource(nb.id, pasteTitle || 'Pasted text', pasteContent, 'paste');
    setPasteTitle('');
    setPasteContent('');
    refresh();
    toast({ title: 'Source added' });
    logStudyActivity('Added a source to Study Notebook');
  };

  const handleFileUpload = (file: File) => {
    const allowed = /\.(txt|md|markdown|csv)$/i;
    if (!allowed.test(file.name)) {
      toast({
        title: 'Unsupported file',
        description: 'Upload .txt, .md, or .csv files for now.',
        variant: 'destructive',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const nb = ensureNotebook();
      addTextSource(nb.id, file.name.replace(/\.[^.]+$/, ''), text, 'file');
      refresh();
      toast({ title: `Imported ${file.name}` });
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (kind: NotebookOutputKind) => {
    if (!active) return;
    const sources = buildGroundingPayload(active);
    if (sources.length === 0) {
      toast({
        title: 'Add sources first',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(kind);
    setStudioTab(kind);
    try {
      const result = await generateNotebookOutput({
        mode: kind,
        sources,
        notebookTitle: active.title,
      });
      saveOutput(active.id, {
        kind,
        title: result.title,
        content: result.content,
        generatedAt: result.generatedAt,
        flashcards: result.flashcards,
        quiz: result.quiz,
        suggestedQuestions: result.suggestedQuestions,
        isAudioScript: result.isAudioScript,
      });
      refresh();
      logStudyActivity(`Generated ${NOTEBOOK_OUTPUT_META[kind].label} in Study Notebook`);
      toast({ title: `${NOTEBOOK_OUTPUT_META[kind].label} ready` });
    } catch (e) {
      toast({
        title: 'Generation failed',
        description: e instanceof Error ? e.message : 'Try again shortly.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const loadImportable = async () => {
    setShowImport(true);
    const result = await listStudyArtifactsDetailed();
    const items = result.items
      .map((a) => {
        const parsed = sourceFromArtifact(a);
        return parsed ? { id: a.id, title: parsed.title, content: parsed.content } : null;
      })
      .filter(Boolean) as Array<{ id: string; title: string; content: string }>;
    setImportable(items);
  };

  const importArtifact = (item: { title: string; content: string }) => {
    const nb = ensureNotebook();
    addTextSource(nb.id, item.title, item.content, 'artifact');
    refresh();
    setShowImport(false);
    toast({ title: 'Imported from saved work' });
  };

  const downloadOutput = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const askSuggested = (q: string) => {
    setStudioTab('chat');
    void sendMessage(q);
  };

  const currentOutput = active && studioTab !== 'chat' ? getOutputByKind(active, studioTab) : null;
  const activeGroup = NOTEBOOK_STUDIO_GROUPS.find((g) => g.id === studioGroup) ?? NOTEBOOK_STUDIO_GROUPS[0];
  const suggestedForChat = active?.suggestedQuestions ?? [];

  return (
    <>
      <Helmet>
        <title>Study Notebook — VertexED</title>
        <meta
          name="description"
          content="NotebookLM-style workspace — sources, grounded chat, study guides, quizzes, concept maps, four audio formats, and flashcard sync."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="notebook-shell px-4 md:px-6 py-6 md:py-8 max-w-[90rem] mx-auto">
        <header className="notebook-hero portal-rise mb-6">
          <LiquidGlass variant="hero" className="px-6 py-8 md:px-10">
            <p className="portal-eyebrow mb-2">
              <Sparkles className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" aria-hidden />
              NotebookLM-class studio
            </p>
            <h1 className="portal-hero-title text-3xl md:text-4xl">Study Notebook</h1>
            <p className="portal-hero-brief mt-3 text-sm md:text-base max-w-3xl">
              Collect sources, chat with citations, and generate study guides, quizzes, concept maps, glossaries,
              source comparisons, and four audio overview formats — Brief, Deep Dive, Critique, and Debate.
            </p>
          </LiquidGlass>
        </header>

        <div className="notebook-layout grid lg:grid-cols-[220px_260px_1fr] gap-4 md:gap-5">
          <aside className="notebook-sidebar portal-rise portal-stagger-1">
            <LiquidGlass variant="panel" className="h-full">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Notebooks</p>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg hover:bg-foreground/5 text-primary"
                    aria-label="New notebook"
                    onClick={() => {
                      const nb = createNotebook(`Notebook ${notebooks.length + 1}`);
                      setActiveId(nb.id);
                      refresh();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {notebooks.map((nb) => (
                    <li key={nb.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(nb.id)}
                        className={`notebook-list-item w-full text-left ${nb.id === activeId ? 'notebook-list-item-active' : ''}`}
                      >
                        <BookMarked className="h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="truncate text-sm">{nb.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </LiquidGlass>
          </aside>

          <aside className="notebook-sources portal-rise portal-stagger-2">
            <LiquidGlass variant="panel" className="h-full flex flex-col max-h-[calc(100vh-10rem)]">
              <div className="p-4 border-b border-border/50">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Sources</p>
                {active ? (
                  <p className="text-xs text-muted-foreground">
                    {active.sources.filter((s) => s.enabled).length} active ·{' '}
                    {totalSourceWords(active).toLocaleString()} words
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Create a notebook to begin</p>
                )}
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {active?.sources.map((src) => (
                  <div key={src.id} className="notebook-source-card">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={src.enabled}
                        onChange={(e) => {
                          toggleSource(active!.id, src.id, e.target.checked);
                          refresh();
                        }}
                        className="mt-1"
                        aria-label={`Include ${src.title}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{src.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {src.wordCount.toLocaleString()} words · {src.type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewSourceId(src.id)}
                        className="text-muted-foreground hover:text-primary p-1"
                        aria-label="Preview source"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeSource(active!.id, src.id);
                          refresh();
                        }}
                        className="text-muted-foreground hover:text-rose-400 p-1"
                        aria-label="Remove source"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="notebook-paste-area">
                  <input
                    type="text"
                    placeholder="Source title (optional)"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    className="notebook-input text-sm mb-2"
                  />
                  <textarea
                    placeholder="Paste notes, excerpts, or lecture transcripts…"
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    className="notebook-input min-h-[4rem] text-sm resize-y"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={handleAddPaste} className="btn-solid text-xs flex-1">
                      Add
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-glass text-xs px-2.5" title="Upload .txt or .md">
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => void loadImportable()} className="btn-glass text-xs px-2.5" title="Import saved work">
                      <BookOpen className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.markdown,.csv,text/plain,text/markdown"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                      e.target.value = '';
                    }}
                  />
                </div>

                {showImport && (
                  <div className="rounded-xl border border-border/60 bg-foreground/[0.03] p-3 space-y-2">
                    <p className="text-xs font-medium">Import saved work</p>
                    {importable.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No importable artifacts yet.</p>
                    ) : (
                      importable.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => importArtifact(item)}
                          className="w-full text-left text-xs py-1.5 px-2 rounded-lg hover:bg-foreground/5 truncate"
                        >
                          {item.title}
                        </button>
                      ))
                    )}
                    <button type="button" className="text-xs text-muted-foreground" onClick={() => setShowImport(false)}>
                      Close
                    </button>
                  </div>
                )}
              </div>
            </LiquidGlass>
          </aside>

          <main className="notebook-studio portal-rise portal-stagger-3 min-h-[36rem]">
            <LiquidGlass variant="panel" className="h-full flex flex-col min-h-[36rem]">
              {active && (
                <div className="p-4 border-b border-border/50 flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={active.title}
                    onChange={(e) => {
                      updateNotebook(active.id, { title: e.target.value });
                      refresh();
                    }}
                    className="notebook-title-input text-lg font-semibold bg-transparent border-none outline-none flex-1 min-w-[10rem]"
                  />
                  <button
                    type="button"
                    className="btn-glass text-xs"
                    onClick={() => exportNotebookJson(active)}
                  >
                    Export JSON
                  </button>
                  <button
                    type="button"
                    className="text-xs text-rose-400 hover:underline"
                    onClick={() => {
                      if (!confirm('Delete this notebook?')) return;
                      deleteNotebook(active.id);
                      refresh();
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className="border-b border-border/40">
                <div className="flex gap-1 p-2 overflow-x-auto">
                  <StudioTabButton
                    active={studioTab === 'chat'}
                    onClick={() => setStudioTab('chat')}
                    icon={MessageCircle}
                    label="Chat"
                  />
                </div>
                <div className="flex gap-1 px-2 pb-2 overflow-x-auto">
                  {NOTEBOOK_STUDIO_GROUPS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setStudioGroup(g.id)}
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition ${
                        studioGroup === g.id
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <div className="notebook-studio-tabs flex flex-wrap gap-1 px-2 pb-2 max-h-24 overflow-y-auto">
                  {activeGroup.kinds.map((kind) => {
                    const Icon = OUTPUT_ICONS[kind] ?? Sparkles;
                    const meta = NOTEBOOK_OUTPUT_META[kind];
                    return (
                      <StudioTabButton
                        key={kind}
                        active={studioTab === kind}
                        onClick={() => setStudioTab(kind)}
                        icon={Icon}
                        label={meta.label}
                        hasOutput={!!active && !!getOutputByKind(active, kind)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {studioTab === 'chat' ? (
                  <>
                    <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4">
                      {groundingSources.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-sm max-w-md mx-auto">
                          <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
                          <p className="font-medium text-foreground mb-1">Grounded chat</p>
                          <p>Add sources, then ask anything — Apex cites [Source: title] in answers.</p>
                        </div>
                      ) : (
                        <>
                          {(suggestedForChat.length > 0 || getOutputByKind(active!, 'suggested-questions')) && (
                            <div className="mb-4 pb-4 border-b border-border/40">
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                                Suggested questions
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(suggestedForChat.length > 0
                                  ? suggestedForChat
                                  : getOutputByKind(active!, 'suggested-questions')?.suggestedQuestions ?? []
                                )
                                  .slice(0, 6)
                                  .map((q) => (
                                    <button
                                      key={q}
                                      type="button"
                                      onClick={() => askSuggested(q)}
                                      className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition text-left max-w-full truncate"
                                    >
                                      {q}
                                    </button>
                                  ))}
                                {!suggestedForChat.length && (
                                  <button
                                    type="button"
                                    className="text-xs text-primary hover:underline"
                                    onClick={() => void handleGenerate('suggested-questions')}
                                  >
                                    Generate questions →
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                          <ApexMessageList messages={messages} loading={loading} />
                        </>
                      )}
                    </div>
                    <div className="p-4 border-t border-border/40">
                      <ApexChatInput
                        value={input}
                        onChange={setInput}
                        onSend={() => void sendMessage()}
                        loading={loading}
                        disabled={groundingSources.length === 0}
                        placeholder={
                          groundingSources.length > 0 ? 'Ask about your sources…' : 'Add sources to enable chat'
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">{NOTEBOOK_OUTPUT_META[studioTab].label}</h2>
                        <p className="text-xs text-muted-foreground">{NOTEBOOK_OUTPUT_META[studioTab].description}</p>
                      </div>
                      <div className="flex gap-2">
                        {currentOutput && (
                          <button
                            type="button"
                            className="btn-glass text-xs inline-flex items-center gap-1"
                            onClick={() =>
                              downloadOutput(currentOutput.content, `${studioTab}-${active?.title ?? 'notebook'}.md`)
                            }
                          >
                            <Download className="h-3.5 w-3.5" />
                            Export
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-solid text-xs inline-flex items-center gap-1.5"
                          disabled={!!generating}
                          onClick={() => void handleGenerate(studioTab)}
                        >
                          {generating === studioTab ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                          {currentOutput ? 'Regenerate' : 'Generate'}
                        </button>
                      </div>
                    </div>

                    {generating === studioTab ? (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                        <p className="text-sm">Synthesizing from {groundingSources.length} source(s)…</p>
                      </div>
                    ) : currentOutput ? (
                      <NotebookOutputPanel
                        output={currentOutput}
                        notebookTitle={active?.title ?? 'notebook'}
                        onAskQuestion={askSuggested}
                      />
                    ) : (
                      <div className="text-center py-16 text-muted-foreground text-sm">
                        <ChevronRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>Generate a {NOTEBOOK_OUTPUT_META[studioTab].label.toLowerCase()} from your sources.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </LiquidGlass>
          </main>
        </div>
      </div>

      {previewSource && (
        <div className="notebook-modal-backdrop" role="dialog" aria-modal="true" aria-label="Source preview">
          <div className="notebook-modal">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold truncate">{previewSource.title}</h3>
              <button type="button" onClick={() => setPreviewSourceId(null)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="text-xs text-foreground/85 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed">
              {previewSource.content}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

function StudioTabButton({
  active,
  onClick,
  icon: Icon,
  label,
  hasOutput,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof BookOpen;
  label: string;
  hasOutput?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className={`notebook-tab ${active ? 'notebook-tab-active' : ''}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate max-w-[7rem]">{label}</span>
      {hasOutput && <span className="notebook-tab-dot shrink-0" aria-hidden />}
    </button>
  );
}
