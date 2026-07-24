import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronRight, FileText, GraduationCap, Loader2, Search } from "lucide-react";

import LiquidGlass from "@/components/LiquidGlass";
import PageSection from "@/components/PageSection";
import RichMarkdown from "@/components/RichMarkdown";
import SEO from "@/components/SEO";

type GuidePage = {
  title: string;
  path: string;
  group: string;
  relativePath: string;
};

type GuideSubject = {
  name: string;
  slug: string;
  pages: GuidePage[];
};

type GuideManifest = {
  programme: string;
  subjects: GuideSubject[];
};

function displayGroup(group: string) {
  if (group === "index.md") return "Start here";
  return group.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StudyGuides() {
  const [manifest, setManifest] = useState<GuideManifest | null>(null);
  const [subjectSlug, setSubjectSlug] = useState<string | null>(null);
  const [pagePath, setPagePath] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const pageCache = useRef(new Map<string, string>());

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/study-guides/myp/manifest.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("The MYP guide index could not be loaded.");
        return response.json() as Promise<GuideManifest>;
      })
      .then((data) => {
        setManifest(data);
        const firstSubject = data.subjects[0];
        const firstPage = firstSubject?.pages.find((page) => page.relativePath === "overview.md") ?? firstSubject?.pages[0];
        setSubjectSlug(firstSubject?.slug ?? null);
        setPagePath(firstPage?.path ?? null);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "The MYP guide index could not be loaded.");
      })
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, []);

  const subject = manifest?.subjects.find((item) => item.slug === subjectSlug) ?? null;
  const activePage = subject?.pages.find((page) => page.path === pagePath) ?? null;

  useEffect(() => {
    if (!activePage) return;
    const controller = new AbortController();
    const cached = pageCache.current.get(activePage.path);
    setError(null);
    setContent(cached ?? "");
    if (cached !== undefined) {
      setPageLoading(false);
      return () => controller.abort();
    }

    setPageLoading(true);
    void fetch(activePage.path, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("This guide page could not be loaded.");
        const text = (await response.text()).replace(/^\uFEFF/, "");
        if (/^\s*<!doctype html/i.test(text) || /^\s*<html[\s>]/i.test(text)) {
          throw new Error("The guide page was not served as Markdown. Please refresh and try again.");
        }
        return text;
      })
      .then((text) => {
        pageCache.current.set(activePage.path, text);
        setContent(text);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "This guide page could not be loaded.");
      })
      .finally(() => !controller.signal.aborted && setPageLoading(false));
    return () => controller.abort();
  }, [activePage?.path]);

  const visiblePages = useMemo(() => {
    if (!subject) return [];
    const search = query.trim().toLowerCase();
    return subject.pages.filter((page) => !search || page.title.toLowerCase().includes(search) || page.relativePath.toLowerCase().includes(search));
  }, [query, subject]);

  const groupedPages = useMemo(() => visiblePages.reduce<Record<string, GuidePage[]>>((groups, page) => {
    const group = displayGroup(page.group);
    groups[group] = [...(groups[group] ?? []), page];
    return groups;
  }, {}), [visiblePages]);

  const selectSubject = (nextSubject: GuideSubject) => {
    setSubjectSlug(nextSubject.slug);
    const firstPage = nextSubject.pages.find((page) => page.relativePath === "overview.md") ?? nextSubject.pages[0];
    setPagePath(firstPage?.path ?? null);
    setQuery("");
  };

  return (
    <>
      <SEO title="MYP Study Guides | VertexED" description="Complete MYP subject guides across Biology, Chemistry, English, Geography, History, Interdisciplinary Learning, Mathematics, and Physics." canonical="https://www.vertexed.app/study-guides" />
      <PageSection className="max-w-7xl space-y-6">
        <LiquidGlass as="section" variant="hero" className="study-guides-hero">
          <div className="study-guides-hero-content">
            <p className="study-guides-eyebrow"><GraduationCap className="h-4 w-4" /> Study guides</p>
            <h1>MYP subject guides</h1>
            <p>Every imported guide page is available here by subject. The guide text is preserved from the source material; only the presentation has been adapted to VertexED.</p>
            {manifest && <span className="study-guides-count">{manifest.subjects.length} subjects - {manifest.subjects.reduce((total, item) => total + item.pages.length, 0)} guide pages</span>}
          </div>
        </LiquidGlass>

        <nav className="study-guides-breadcrumbs" aria-label="Study guide location">
          <Link to="/main">Dashboard</Link><ChevronRight className="h-3.5 w-3.5" aria-hidden /><span>Study guides</span><ChevronRight className="h-3.5 w-3.5" aria-hidden /><span>MYP</span>{subject && <><ChevronRight className="h-3.5 w-3.5" aria-hidden /><strong>{subject.name}</strong></>}
        </nav>

        {loading && <div className="study-guides-loading"><Loader2 className="h-5 w-5 animate-spin" /> Loading MYP guides...</div>}
        {error && !manifest && <div className="study-guides-error">{error}</div>}

        {manifest && (
          <>
            <section className="study-guides-subjects" aria-label="MYP subjects">
              {manifest.subjects.map((item) => (
                <button key={item.slug} type="button" onClick={() => selectSubject(item)} className={`study-guides-subject ${item.slug === subjectSlug ? "is-active" : ""}`}>
                  <BookOpen className="h-4 w-4" aria-hidden />
                  <span>{item.name}</span>
                  <small>{item.pages.length}</small>
                </button>
              ))}
            </section>

            <div className="study-guides-layout">
              <aside className="study-guides-sidebar">
                <label className="study-guides-search">
                  <Search className="h-4 w-4" aria-hidden />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${subject?.name ?? "guide"} pages`} />
                </label>
                <div className="study-guides-page-list">
                  {Object.entries(groupedPages).map(([group, pages]) => {
                    const isCollapsible = group === "Sessions" || group === "Topics";
                    const groupKey = `${subject?.slug ?? "myp"}:${group}`;
                    const isOpen = !isCollapsible || query.trim().length > 0 || expandedGroups.has(groupKey);
                    return (
                      <section key={group} className={isCollapsible ? "is-collapsible" : undefined}>
                        {isCollapsible ? (
                          <button
                            type="button"
                            className="study-guides-group-toggle"
                            aria-expanded={isOpen}
                            onClick={() => setExpandedGroups((current) => {
                              const next = new Set(current);
                              if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey);
                              return next;
                            })}
                          >
                            <span>{group}</span><small>{pages.length} pages</small><ChevronDown className={isOpen ? "is-open" : undefined} aria-hidden />
                          </button>
                        ) : <h2>{group}</h2>}
                        {isOpen && pages.map((page) => (
                          <button key={page.path} type="button" onClick={() => setPagePath(page.path)} className={page.path === activePage?.path ? "is-active" : ""}>
                            <FileText className="h-3.5 w-3.5" aria-hidden /> {page.title}
                          </button>
                        ))}
                      </section>
                    );
                  })}
                  {visiblePages.length === 0 && <p className="study-guides-empty">No guide pages match that search.</p>}
                </div>
              </aside>

              <LiquidGlass as="article" variant="panel" className="study-guides-reader">
                <div className="study-guides-reader-header">
                  <div><p className="study-guides-eyebrow">{subject?.name} - {activePage && displayGroup(activePage.group)}</p><h2>{activePage?.title ?? "Select a guide page"}</h2></div>
                  {pageLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Loading guide page" />}
                </div>
                {error && <div className="study-guides-error">{error}</div>}
                {!error && <RichMarkdown className="study-guides-markdown">{content}</RichMarkdown>}
              </LiquidGlass>
            </div>
          </>
        )}
      </PageSection>
    </>
  );
}