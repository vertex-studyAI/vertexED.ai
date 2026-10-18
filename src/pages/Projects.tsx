import React, { useMemo } from "react";
import { ArrowLeft, ArrowUpRight, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import PageSection from "@/components/PageSection";
import SEO from "@/components/SEO";
import {
  BU1LD_PROJECT_PAGES,
  FOUNDER_PORTFOLIO_REVIEWED_ON,
  FOUNDER_PROJECT_DESTINATIONS,
  FOUNDER_PROJECT_LINKS,
  type FounderProjectGroup,
} from "@/content/founderPortfolio";
import "@/styles/projects.css";

type DirectoryFilter = "all" | FounderProjectGroup;
type DirectorySort = "catalog" | "az";

const FILTERS: Array<{ value: DirectoryFilter; label: string; count: number }> = [
  { value: "all", label: "All pages", count: FOUNDER_PROJECT_LINKS.length },
  { value: "organisations", label: "Products and organisations", count: FOUNDER_PROJECT_DESTINATIONS.length },
  { value: "bu1ld", label: "BU1LD projects", count: BU1LD_PROJECT_PAGES.length },
];

const groupLabel: Record<FounderProjectGroup, string> = {
  organisations: "Product or organisation",
  bu1ld: "BU1LD project page",
};

function displayDestination(href: string): string {
  const url = new URL(href);
  const path = url.pathname === "/" ? "" : url.pathname.replace(/\/$/, "");
  return `${url.hostname.replace("www.", "")}${path}`;
}

export default function Projects(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const requestedFilter = searchParams.get("group");
  const filter: DirectoryFilter =
    requestedFilter === "organisations" || requestedFilter === "bu1ld" ? requestedFilter : "all";
  const sort: DirectorySort = searchParams.get("sort") === "az" ? "az" : "catalog";
  const normalisedQuery = query.trim().toLocaleLowerCase();

  const visibleProjects = useMemo(
    () =>
      FOUNDER_PROJECT_LINKS
        .filter((project) => {
          const matchesGroup = filter === "all" || project.group === filter;
          const matchesQuery =
            !normalisedQuery ||
            [project.name, project.descriptor, displayDestination(project.href)]
              .join(" ")
              .toLocaleLowerCase()
              .includes(normalisedQuery);
          return matchesGroup && matchesQuery;
        })
        .sort((left, right) => sort === "az" ? left.name.localeCompare(right.name) : 0),
    [filter, normalisedQuery, sort],
  );

  const updateDirectory = (
    update: { query?: string; filter?: DirectoryFilter; sort?: DirectorySort },
    replace = false,
  ) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (update.query !== undefined) {
        if (update.query) next.set("q", update.query);
        else next.delete("q");
      }
      if (update.filter !== undefined) {
        if (update.filter !== "all") next.set("group", update.filter);
        else next.delete("group");
      }
      if (update.sort !== undefined) {
        if (update.sort !== "catalog") next.set("sort", update.sort);
        else next.delete("sort");
      }
      return next;
    }, { replace });
  };

  const resetDirectory = () => updateDirectory({ query: "", filter: "all", sort: "catalog" });

  return (
    <>
      <SEO
        title="Project webpages | VertexED"
        description="Search the public product, organisation and BU1LD project pages linked from the VertexED founder profile."
        canonical="https://www.vertexed.app/projects"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Founder-linked project webpages",
          numberOfItems: FOUNDER_PROJECT_LINKS.length,
          itemListElement: FOUNDER_PROJECT_LINKS.map((project, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: project.name,
            url: project.href,
          })),
        }}
      />

      <PageSection className="project-index relative px-6 md:px-12">
        <header className="project-index-hero">
          <div>
            <p className="project-index-kicker">Linked project index</p>
            <h1>Public work.<br /><em>Clearly routed.</em></h1>
          </div>
          <div className="project-index-intro">
            <p>Search the public destinations linked from Ryan Gomez&apos;s founder profile and the BU1LD project catalog. Every result opens the project&apos;s own page.</p>
            <Link to="/about"><ArrowLeft aria-hidden /> Return to the founder story</Link>
          </div>
        </header>

        <dl className="project-index-summary" aria-label="Directory summary">
          <div><dt>Linked pages</dt><dd>{FOUNDER_PROJECT_LINKS.length}</dd></div>
          <div><dt>Products and organisations</dt><dd>{FOUNDER_PROJECT_DESTINATIONS.length}</dd></div>
          <div><dt>BU1LD project pages</dt><dd>{BU1LD_PROJECT_PAGES.length}</dd></div>
        </dl>

        <section className="project-index-directory" aria-labelledby="project-index-directory-title">
          <header>
            <div>
              <p className="project-index-kicker">Browse the directory</p>
              <h2 id="project-index-directory-title">Find the page you need.</h2>
            </div>
            <p>Reviewed {FOUNDER_PORTFOLIO_REVIEWED_ON}. Availability can change after review.</p>
          </header>

          <div className="project-index-controls">
            <label className="project-index-search">
              <span>Search project webpages</span>
              <span>
                <Search aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => updateDirectory({ query: event.target.value }, true)}
                  placeholder="Search names or descriptions"
                />
                {query && (
                  <button type="button" onClick={() => updateDirectory({ query: "" }, true)} aria-label="Clear project search">
                    <X aria-hidden />
                  </button>
                )}
              </span>
            </label>

            <label className="project-index-sort">
              <span>Order</span>
              <select
                value={sort}
                onChange={(event) => updateDirectory({ sort: event.target.value as DirectorySort })}
              >
                <option value="catalog">Catalog order</option>
                <option value="az">Name, A to Z</option>
              </select>
            </label>

            <div className="project-index-filters" aria-label="Filter project webpages">
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filter === option.value}
                  onClick={() => updateDirectory({ filter: option.value })}
                >
                  {option.label} <span>{option.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="project-index-results-heading">
            <p aria-live="polite">{visibleProjects.length} {visibleProjects.length === 1 ? "page" : "pages"} shown</p>
            {(query || filter !== "all" || sort !== "catalog") && <button type="button" onClick={resetDirectory}>Reset directory</button>}
          </div>

          {visibleProjects.length ? (
            <ol className="project-index-grid">
              {visibleProjects.map((project, index) => (
                <li key={project.href}>
                  <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name} in a new tab`}>
                    <span className="project-index-card-meta">
                      <small>{groupLabel[project.group]}</small>
                      <span aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                    </span>
                    <strong>{project.name}</strong>
                    <span className="project-index-card-description">{project.descriptor}</span>
                    <span className="project-index-card-destination">
                      <small>{displayDestination(project.href)}</small>
                      <ArrowUpRight aria-hidden />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <div className="project-index-empty" role="status">
              <h3>No matching page.</h3>
              <p>Try another name or return to the full directory.</p>
              <button type="button" onClick={resetDirectory}>Show every page</button>
            </div>
          )}
        </section>

        <aside className="project-index-boundary" aria-labelledby="project-index-boundary-title">
          <p className="project-index-kicker">Reading the list</p>
          <h2 id="project-index-boundary-title">A link is a route, not a result.</h2>
          <p>Inclusion records a reachable public destination at the review date. It does not establish personal authorship, production readiness, scientific validity, independent reproduction or institutional endorsement.</p>
          <a href="https://thebu1ld.com/projects" target="_blank" rel="noopener noreferrer">Open the source BU1LD catalog <ArrowUpRight aria-hidden /></a>
        </aside>
      </PageSection>
    </>
  );
}
