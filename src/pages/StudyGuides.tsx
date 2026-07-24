import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronRight, FileText, GraduationCap, Loader2, LockKeyhole, Search } from "lucide-react";

import LiquidGlass from "@/components/LiquidGlass";
import PageSection from "@/components/PageSection";
import RichMarkdown from "@/components/RichMarkdown";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

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

type GuideSeo = {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
};

const GUIDE_ACCESS_KEY = "vertexed-myp-study-guides-access";
const GUIDE_PASSWORD = "whotfstudies";
const SITE_URL = "https://www.vertexed.app";

function displayGroup(group: string) {
  if (group === "index.md") return "Start here";
  return group.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function titleFromSegment(segment: string) {
  if (/^[mn]\d{2}$/i.test(segment)) return segment.toUpperCase();
  return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function guideUrl(subject: GuideSubject, page: GuidePage) {
  const routePath = page.relativePath
    .replace(/\.md$/i, "")
    .split("/")
    .map((part) => encodeURIComponent(part.toLowerCase()))
    .join("/");
  return `/study-guides/myp/${subject.slug}/${routePath}`;
}

function seoForPage(subject: GuideSubject, page: GuidePage): GuideSeo {
  const isSession = /^[MN]\d{2}$/i.test(page.title);
  const guideName = isSession ? `MYP ${subject.name} ${page.title.toUpperCase()} paper` : `MYP ${subject.name} ${page.title}`;
  const canonical = `${SITE_URL}${guideUrl(subject, page)}`;
  return {
    title: `${guideName} study guide | VertexED`,
    description: `MYP ${subject.name} ${page.title}${isSession ? " paper" : ""} study guide with exam-linked revision notes, questions, and key concepts.`,
    keywords: `${subject.name} MYP ${page.title}, MYP ${subject.name}${isSession ? ` ${page.title.toUpperCase()} paper` : ""}, ${subject.name} MYP study guide, MYP revision, MYP past paper`,
    canonical,
  };
}
function seoForRoute(routePath?: string): GuideSeo {
  const segments = (routePath ?? "").split("/").filter(Boolean);
  const [programme, subject, ...pageParts] = segments;
  if (programme?.toLowerCase() === "myp" && subject) {
    const subjectName = titleFromSegment(subject);
    const pageName = pageParts.map(titleFromSegment).join(" ");
    const session = pageParts.at(-1);
    const label = session && /^[mn]\d{2}$/i.test(session)
      ? `MYP ${subjectName} ${session.toUpperCase()} paper`
      : pageName ? `MYP ${subjectName} ${pageName}` : `MYP ${subjectName}`;
    const canonical = `${SITE_URL}/study-guides/${segments.map(encodeURIComponent).join("/")}`;
    return {
      title: `${label} study guide | VertexED`,
      description: `${label} study guide with revision notes, exam questions, and MYP learning resources.`,
      keywords: `${label}, ${subjectName} MYP study guide, MYP revision, MYP past paper`,
      canonical,
    };
  }
  return {
    title: "MYP Study Guides | VertexED",
    description: "Complete MYP study guides across Biology, Chemistry, English, Geography, History, Interdisciplinary Learning, Mathematics, and Physics.",
    keywords: "MYP study guides, MYP revision, MYP past papers",
    canonical: `${SITE_URL}/study-guides`,
  };
}
function studyGuideJsonLd(seo: GuideSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: seo.title.replace(" | VertexED", ""),
    description: seo.description,
    url: seo.canonical,
    educationalLevel: "MYP",
    learningResourceType: "Study guide",
    inLanguage: "en",
    isAccessibleForFree: false,
    provider: { "@type": "Organization", name: "VertexED", url: SITE_URL },
  };
}

function GuideAccessPrompt({ onUnlock, returnTo, compact = false }: { onUnlock: () => void; returnTo: string; compact?: boolean }) {
  const [password, setPassword] = useState("");
  const [invalid, setInvalid] = useState(false);
  const inputId = useId();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== GUIDE_PASSWORD) {
      setInvalid(true);
      return;
    }
    window.sessionStorage.setItem(GUIDE_ACCESS_KEY, "granted");
    onUnlock();
  };

  return (
    <div className={`study-guides-paywall ${compact ? "is-compact" : ""}`}>
      <LockKeyhole className="h-5 w-5" aria-hidden />
      <div>
        <strong>{compact ? "Guide index locked" : "Continue reading"}</strong>
        <p>{compact ? "Sign in or enter the guide password to browse all pages." : "Sign in to unlock the full guide, or use the access password."}</p>
      </div>
      <Link to="/login" state={{ from: returnTo }} className="study-guides-login-link">Sign in</Link>
      <span className="study-guides-access-or">or</span>
      <form onSubmit={submit} className="study-guides-inline-access-form">
        <label className="sr-only" htmlFor={inputId}>Study guide access password</label>
        <input id={inputId} type="password" value={password} onChange={(event) => { setPassword(event.target.value); setInvalid(false); }} placeholder="Access password" autoComplete="current-password" required />
        <button type="submit">Unlock</button>
      </form>
      {invalid && <p className="study-guides-access-error" role="alert">That password is not correct.</p>}
    </div>
  );
}

function markdownPreview(markdown: string) {
  const blocks = markdown.trim().split(/\n\s*\n/);
  const visible = blocks.slice(0, 4).join("\n\n");
  const blurred = blocks.slice(4, 7).join("\n\n");
  return { visible: visible || markdown, blurred };
}
export default function StudyGuides() {
  const { "*": routePath } = useParams();
  const { user } = useAuth();
  const [passwordUnlocked, setPasswordUnlocked] = useState(() => (
    typeof window !== "undefined" && window.sessionStorage.getItem(GUIDE_ACCESS_KEY) === "granted"
  ));

  return <StudyGuidesLibrary routePath={routePath} hasAccess={Boolean(user) || passwordUnlocked} onUnlock={() => setPasswordUnlocked(true)} />;
}
function StudyGuidesLibrary({ routePath, hasAccess, onUnlock }: { routePath?: string; hasAccess: boolean; onUnlock: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
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
      .then(setManifest)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "The MYP guide index could not be loaded.");
      })
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!manifest) return;
    const parts = (routePath ?? "").split("/").filter(Boolean).map((part) => decodeURIComponent(part).toLowerCase());
    const requestedSubject = parts[0] === "myp" ? parts[1] : undefined;
    const requestedPage = parts[0] === "myp" ? parts.slice(2).join("/") : "";
    const nextSubject = manifest.subjects.find((item) => item.slug === requestedSubject) ?? manifest.subjects[0];
    const nextPage = nextSubject?.pages.find((page) => page.relativePath.replace(/\.md$/i, "").toLowerCase() === requestedPage)
      ?? nextSubject?.pages.find((page) => page.relativePath === "overview.md")
      ?? nextSubject?.pages[0];
    setSubjectSlug(nextSubject?.slug ?? null);
    setPagePath(nextPage?.path ?? null);
  }, [manifest, routePath]);

  const subject = manifest?.subjects.find((item) => item.slug === subjectSlug) ?? null;
  const activePage = subject?.pages.find((page) => page.path === pagePath) ?? null;
  const seo = subject && activePage ? seoForPage(subject, activePage) : seoForRoute(routePath);
  const preview = useMemo(() => markdownPreview(content), [content]);

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
        if (/^\s*<!doctype html/i.test(text) || /^\s*<html[\s>]/i.test(text)) throw new Error("The guide page was not served as Markdown. Please refresh and try again.");
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

  const openPage = (nextSubject: GuideSubject, nextPage: GuidePage) => {
    navigate(guideUrl(nextSubject, nextPage));
    setQuery("");
  };

  const selectSubject = (nextSubject: GuideSubject) => {
    const firstPage = nextSubject.pages.find((page) => page.relativePath === "overview.md") ?? nextSubject.pages[0];
    if (firstPage) openPage(nextSubject, firstPage);
    setExpandedGroups(new Set());
  };

  return (
    <>
      <SEO {...seo} ogType="article" jsonLd={studyGuideJsonLd(seo)} />
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
          <Link to="/main">Dashboard</Link><ChevronRight className="h-3.5 w-3.5" aria-hidden /><Link to="/study-guides">Study guides</Link><ChevronRight className="h-3.5 w-3.5" aria-hidden /><span>MYP</span>{subject && <><ChevronRight className="h-3.5 w-3.5" aria-hidden /><strong>{subject.name}</strong></>}
        </nav>

        {loading && <div className="study-guides-loading"><Loader2 className="h-5 w-5 animate-spin" /> Loading MYP guides...</div>}
        {error && !manifest && <div className="study-guides-error">{error}</div>}

        {manifest && (
          <>
            <section className="study-guides-subjects" aria-label="MYP subjects">
              {manifest.subjects.map((item) => (
                <button key={item.slug} type="button" onClick={() => selectSubject(item)} className={`study-guides-subject ${item.slug === subjectSlug ? "is-active" : ""}`}>
                  <BookOpen className="h-4 w-4" aria-hidden /><span>{item.name}</span><small>{item.pages.length}</small>
                </button>
              ))}
            </section>

            <div className="study-guides-layout">
              <aside className="study-guides-sidebar">
                {hasAccess ? <>
                  <label className="study-guides-search"><Search className="h-4 w-4" aria-hidden /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${subject?.name ?? "guide"} pages`} /></label>
                  <div className="study-guides-page-list">
                    {Object.entries(groupedPages).map(([group, pages]) => {
                      const isCollapsible = group === "Sessions" || group === "Topics";
                      const groupKey = `${subject?.slug ?? "myp"}:${group}`;
                      const isOpen = !isCollapsible || query.trim().length > 0 || expandedGroups.has(groupKey);
                      return <section key={group} className={isCollapsible ? "is-collapsible" : undefined}>
                        {isCollapsible ? <button type="button" className="study-guides-group-toggle" aria-expanded={isOpen} onClick={() => setExpandedGroups((current) => { const next = new Set(current); if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey); return next; })}><span>{group}</span><small>{pages.length} pages</small><ChevronDown className={isOpen ? "is-open" : undefined} aria-hidden /></button> : <h2>{group}</h2>}
                        {isOpen && pages.map((page) => <button key={page.path} type="button" onClick={() => subject && openPage(subject, page)} className={page.path === activePage?.path ? "is-active" : ""}><FileText className="h-3.5 w-3.5" aria-hidden /> {page.title}</button>)}
                      </section>;
                    })}
                    {visiblePages.length === 0 && <p className="study-guides-empty">No guide pages match that search.</p>}
                  </div>
                </> : <div className="study-guides-sidebar-paywall"><GuideAccessPrompt compact returnTo={location.pathname} onUnlock={onUnlock} /></div>}
              </aside>

              <LiquidGlass as="article" variant="panel" className="study-guides-reader">
                <div className="study-guides-reader-header"><div><p className="study-guides-eyebrow">{subject?.name} - {activePage && displayGroup(activePage.group)}</p><h2>{activePage?.title ?? "Select a guide page"}</h2></div>{pageLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Loading guide page" />}</div>
                {error && <div className="study-guides-error">{error}</div>}
                {!error && (hasAccess ? <RichMarkdown className="study-guides-markdown">{content}</RichMarkdown> : <div className="study-guides-preview">
                  <RichMarkdown className="study-guides-markdown">{preview.visible}</RichMarkdown>
                  <div className="study-guides-preview-blur" aria-hidden>{preview.blurred && <RichMarkdown className="study-guides-markdown">{preview.blurred}</RichMarkdown>}</div>
                  <div className="study-guides-preview-paywall"><GuideAccessPrompt returnTo={location.pathname} onUnlock={onUnlock} /></div>
                </div>)}
              </LiquidGlass>
            </div>
          </>
        )}
      </PageSection>
    </>
  );
}