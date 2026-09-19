import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
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

type GuideProvenance = {
  path: string;
  license: string;
  editorialStatus: "approved" | "quarantined" | "unreviewed";
  publicationStatus: "published" | "held-from-index";
  factualReviewer: string | null;
  reviewedAt: string | null;
  riskFlags: string[];
};

type GuideProvenanceLedger = {
  evidenceBoundary: string;
  entries: GuideProvenance[];
};

type GuideSeo = {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
};

const SITE_URL = "https://www.vertexed.app";
const SUBJECT_SEARCH_ALIASES: Record<string, string[]> = {
  Biology: ["MYP Biology", "IB MYP Biology"],
  Chemistry: ["MYP Chemistry", "IB MYP Chemistry"],
  English: ["MYP English Language and Literature", "MYP English LAL"],
  Geography: ["MYP Geography", "MYP Geo", "IB MYP Geography"],
  History: ["MYP History", "IB MYP History"],
  "Interdisciplinary Learning": ["MYP Interdisciplinary Learning", "MYP IDL"],
  Mathematics: ["MYP Mathematics", "MYP Maths", "MYP Math", "IB MYP Mathematics"],
  Physics: ["MYP Physics", "IB MYP Physics"],
};

const GUIDE_GROUP_ORDER = ["Getting started", "Core resources", "Topics", "Sessions", "Additional resources"];

function displayGroup(group: string) {
  return group.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizedGroup(page: GuidePage) {
  if (page.relativePath === "index.md" || page.relativePath === "overview.md") return "Getting started";
  if (["command-terms.md", "question-bank.md", "revision-plan.md"].includes(page.relativePath)) return "Core resources";
  if (page.group === "topics") return "Topics";
  if (page.group === "sessions") return "Sessions";
  return "Additional resources";
}

function pageLabel(page: GuidePage) {
  if (page.relativePath === "index.md") return "Guide index";
  if (page.relativePath === "overview.md") return "Overview";
  return titleFromSegment(page.title);
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

function subjectTerms(subject: GuideSubject) {
  return SUBJECT_SEARCH_ALIASES[subject.name] ?? [`MYP ${subject.name}`, `IB MYP ${subject.name}`];
}

function seoForSubject(subject: GuideSubject): GuideSeo {
  const primaryTerm = subjectTerms(subject)[0];
  const canonical = `${SITE_URL}/study-guides/myp/${subject.slug}`;
  return {
    title: `${primaryTerm} study guide, notes and revision | VertexED`,
    description: `${primaryTerm} study guide with topic notes, past eAssessment paper analysis, command terms, question banks, and revision planning resources.`,
    keywords: `${subjectTerms(subject).join(", ")}, ${primaryTerm} study guide, ${primaryTerm} notes, ${primaryTerm} revision, ${primaryTerm} past papers`,
    canonical,
  };
}

function seoForPage(subject: GuideSubject, page: GuidePage): GuideSeo {
  const isSession = /^[MN]\d{2}$/i.test(page.title);
  const primaryTerm = subjectTerms(subject)[0];
  const pageName = pageLabel(page);
  const guideName = isSession ? `${primaryTerm} ${page.title.toUpperCase()} eAssessment paper` : `${primaryTerm} ${pageName} study guide`;
  const canonical = `${SITE_URL}${guideUrl(subject, page)}`;
  return {
    title: `${guideName} | VertexED`,
    description: isSession
      ? `${primaryTerm} ${page.title.toUpperCase()} eAssessment paper study guide with question analysis, topics tested, mark distribution, and revision notes.`
      : `${primaryTerm} ${pageName} guide with exam-linked notes, questions, and revision support for MYP students.`,
    keywords: isSession
      ? `${primaryTerm} ${page.title.toUpperCase()} paper, ${primaryTerm} ${page.title.toUpperCase()} eAssessment, ${subjectTerms(subject).join(", ")}, MYP past papers, MYP revision`
      : `${primaryTerm} ${pageName}, ${subjectTerms(subject).join(", ")}, ${primaryTerm} study guide, MYP revision`,
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
    description: "MYP revision guides across Biology, Chemistry, English, Geography, History, Interdisciplinary Learning, Mathematics, and Physics.",
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
    isAccessibleForFree: true,
    provider: { "@type": "Organization", name: "VertexED", url: SITE_URL },
    about: { "@type": "Thing", name: seo.title.replace(" | VertexED", "") },
    keywords: seo.keywords,
  };
}

export default function StudyGuides() {
  const { "*": routePath } = useParams();
  return <StudyGuidesLibrary routePath={routePath} />;
}
function StudyGuidesLibrary({ routePath }: { routePath?: string }) {
  const navigate = useNavigate();
  const [manifest, setManifest] = useState<GuideManifest | null>(null);
  const [provenance, setProvenance] = useState<Map<string, GuideProvenance>>(() => new Map());
  const [subjectSlug, setSubjectSlug] = useState<string | null>(null);
  const [pagePath, setPagePath] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeNotFound, setRouteNotFound] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const pageCache = useRef(new Map<string, string>());

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      fetch("/study-guides/myp/manifest.json", { signal: controller.signal }),
      fetch("/study-guides/myp/provenance-ledger.json", { signal: controller.signal }),
    ])
      .then(async ([manifestResponse, provenanceResponse]) => {
        if (!manifestResponse.ok) throw new Error("The MYP guide index could not be loaded.");
        if (!provenanceResponse.ok) throw new Error("The guide review ledger could not be loaded.");
        const nextManifest = await manifestResponse.json() as GuideManifest;
        const nextProvenance = await provenanceResponse.json() as GuideProvenanceLedger;
        return { nextManifest, nextProvenance };
      })
      .then(({ nextManifest, nextProvenance }) => {
        setManifest(nextManifest);
        setProvenance(new Map(nextProvenance.entries.map((entry) => [entry.path, entry])));
      })
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
    if (parts.length > 0 && parts[0] !== "myp") {
      setRouteNotFound(true);
      setSubjectSlug(null);
      setPagePath(null);
      return;
    }
    const requestedSubject = parts[0] === "myp" ? parts[1] : undefined;
    const requestedPage = parts[0] === "myp" ? parts.slice(2).join("/") : "";
    const nextSubject = requestedSubject
      ? manifest.subjects.find((item) => item.slug === requestedSubject)
      : manifest.subjects[0];
    if (!nextSubject || (parts[0] === "myp" && !requestedSubject)) {
      setRouteNotFound(true);
      setSubjectSlug(null);
      setPagePath(null);
      return;
    }
    const isSubjectRoute = parts.length === 2;
    const requestedPageEntry = requestedPage
      ? nextSubject.pages.find((page) => page.relativePath.replace(/\.md$/i, "").toLowerCase() === requestedPage)
      : null;
    if (requestedPage && !requestedPageEntry) {
      setRouteNotFound(true);
      setSubjectSlug(null);
      setPagePath(null);
      return;
    }
    const nextPage = requestedPageEntry
      ?? nextSubject.pages.find((page) => page.relativePath === "overview.md")
      ?? nextSubject.pages[0];
    setRouteNotFound(parts.length > 0 && !isSubjectRoute && !requestedPageEntry);
    setSubjectSlug(nextSubject?.slug ?? null);
    setPagePath(nextPage?.path ?? null);
  }, [manifest, routePath]);

  const subject = manifest?.subjects.find((item) => item.slug === subjectSlug) ?? null;
  const activePage = subject?.pages.find((page) => page.path === pagePath) ?? null;
  const activeProvenance = activePage ? provenance.get(activePage.path) ?? null : null;
  const activePagePath = activePage?.path;
  const routeParts = (routePath ?? "").split("/").filter(Boolean);
  const isSubjectHub = routeParts[0]?.toLowerCase() === "myp" && routeParts.length === 2;
  const seo = subject && activePage
    ? isSubjectHub ? seoForSubject(subject) : routeParts.length === 0 ? seoForRoute(routePath) : seoForPage(subject, activePage)
    : seoForRoute(routePath);
  useEffect(() => {
    if (!activePagePath) return;
    const controller = new AbortController();
    const cached = pageCache.current.get(activePagePath);
    setError(null);
    setContent(cached ?? "");
    if (cached !== undefined) {
      setPageLoading(false);
      return () => controller.abort();
    }

    setPageLoading(true);
    void fetch(activePagePath, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("This guide page could not be loaded.");
        const text = (await response.text()).replace(/^\uFEFF/, "");
        if (/^\s*<!doctype html/i.test(text) || /^\s*<html[\s>]/i.test(text)) throw new Error("The guide page was not served as Markdown. Please refresh and try again.");
        return text;
      })
      .then((text) => {
        pageCache.current.set(activePagePath, text);
        setContent(text);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "This guide page could not be loaded.");
      })
      .finally(() => !controller.signal.aborted && setPageLoading(false));
    return () => controller.abort();
  }, [activePagePath]);

  const visiblePages = useMemo(() => {
    if (!subject) return [];
    const search = query.trim().toLowerCase();
    return subject.pages.filter((page) => !search || page.title.toLowerCase().includes(search) || page.relativePath.toLowerCase().includes(search));
  }, [query, subject]);

  const groupedPages = useMemo(() => visiblePages.reduce<Record<string, GuidePage[]>>((groups, page) => {
    const group = normalizedGroup(page);
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

  if (manifest && routeNotFound) {
    return (
      <>
        <SEO
          title="Study guide not found | VertexED"
          description="That study-guide URL does not match an available VertexED guide."
          canonical={`${SITE_URL}/study-guides`}
          robots="noindex, nofollow"
        />
        <PageSection className="flex min-h-[60vh] items-center justify-center">
          <div className="glass-panel mx-auto w-full max-w-lg p-8 text-center">
            <p className="study-guides-eyebrow">Study guides</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Guide page not found</h1>
            <p className="mt-3 text-muted-foreground">The link may be outdated or mistyped. Open the guide library to choose an available subject and page.</p>
            <Link to="/study-guides" className="btn-solid mt-6 inline-flex">Open study guides</Link>
          </div>
        </PageSection>
      </>
    );
  }

  return (
    <>
      <SEO
        {...seo}
        ogType="article"
        robots={routeParts.length === 0 ? "index, follow" : "noindex, follow"}
        jsonLd={studyGuideJsonLd(seo)}
      />
      <PageSection className="max-w-7xl space-y-6">
        <LiquidGlass as="section" variant="hero" className="study-guides-hero">
          <div className="study-guides-hero-content">
            <p className="study-guides-eyebrow"><GraduationCap className="h-4 w-4" /> Study guides</p>
            <h1>MYP subject guides</h1>
            <p>Revision material from the repository&apos;s guide corpus is available here by subject. It is independent study support, not an official IB publication or verified mark scheme.</p>
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
                <>
                  <label className="study-guides-search"><Search className="h-4 w-4" aria-hidden /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${subject?.name ?? "guide"} pages`} /></label>
                  <div className="study-guides-page-list">
                    {Object.entries(groupedPages).sort(([a], [b]) => GUIDE_GROUP_ORDER.indexOf(a) - GUIDE_GROUP_ORDER.indexOf(b)).map(([group, pages]) => {
                      const isCollapsible = group === "Sessions" || group === "Topics";
                      const groupKey = `${subject?.slug ?? "myp"}:${group}`;
                      const isOpen = !isCollapsible || query.trim().length > 0 || expandedGroups.has(groupKey);
                      return <section key={group} className={isCollapsible ? "is-collapsible" : undefined}>
                        {isCollapsible ? <button type="button" className="study-guides-group-toggle" aria-expanded={isOpen} onClick={() => setExpandedGroups((current) => { const next = new Set(current); if (next.has(groupKey)) next.delete(groupKey); else next.add(groupKey); return next; })}><span>{group}</span><small>{pages.length} pages</small><ChevronDown className={isOpen ? "is-open" : undefined} aria-hidden /></button> : <h2>{group}</h2>}
                        {isOpen && pages.map((page) => <button key={page.path} type="button" onClick={() => subject && openPage(subject, page)} className={page.path === activePage?.path ? "is-active" : ""}><FileText className="h-3.5 w-3.5" aria-hidden /> {pageLabel(page)}</button>)}
                      </section>;
                    })}
                    {visiblePages.length === 0 && <p className="study-guides-empty">No guide pages match that search.</p>}
                  </div>
                </>
              </aside>

              <LiquidGlass as="article" variant="panel" className="study-guides-reader">
                <div className="study-guides-reader-header"><div><p className="study-guides-eyebrow">{subject?.name} - {activePage && normalizedGroup(activePage)}</p><h2>{activePage ? pageLabel(activePage) : "Select a guide page"}</h2></div>{pageLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="Loading guide page" />}</div>
                <section className="study-guides-review-status" aria-label="Content review status">
                  <div>
                    <strong>{activeProvenance?.editorialStatus === "approved" ? "Editorially reviewed" : "Held for editorial review"}</strong>
                    <span>{activeProvenance?.editorialStatus === "quarantined" ? "Automated checks found wording that needs human review." : "Source, licence, curriculum version, and factual accuracy have not all been verified."}</span>
                  </div>
                  <span className={`study-guides-review-badge is-${activeProvenance?.editorialStatus ?? "unreviewed"}`}>
                    {activeProvenance?.editorialStatus ?? "unreviewed"}
                  </span>
                </section>
                <p className="mb-4 text-sm text-foreground">
                  Independent revision notes. Verify exact questions, marks, syllabus details, and command-term guidance against your teacher and official exam-board material.
                </p>
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
