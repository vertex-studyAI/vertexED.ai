import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";

type Subject = {
  id: string;
  name: string;
  brief: string;
  curriculum?: string;
};

const DEFAULT_SUBJECTS: Subject[] = [
  { id: "math", name: "Mathematics", brief: "Worked examples, formula sheets and curated past questions", curriculum: "ib-dp" },
  { id: "physics", name: "Physics", brief: "Concise derivations, key experiments and solved problems", curriculum: "ib-dp" },
  { id: "chemistry", name: "Chemistry", brief: "Mechanisms, reactions and recommended paper-practice", curriculum: "ib-dp" },
  { id: "biology", name: "Biology", brief: "Organized topic notes and diagram practice", curriculum: "ib-myp" },
  { id: "history", name: "History", brief: "Timelines, source-analysis and exam-style prompts", curriculum: "ib-dp" },
  { id: "economics", name: "Economics", brief: "Key models, graphs and past-paper walkthroughs", curriculum: "ib-dp" },
];

export default function ArchivesSubjects(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [curriculumFilter, setCurriculumFilter] = useState<string | null>(() => searchParams.get("curriculum") ?? null);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);

  // Keep URL sync: when query or curriculumFilter change, update the search params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (curriculumFilter) params.curriculum = curriculumFilter;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, curriculumFilter]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return subjects.filter((s) => {
      if (curriculumFilter && s.curriculum !== curriculumFilter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.brief.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    });
  }, [subjects, query, curriculumFilter]);

  // Example: go to notes page for a subject
  const openNotes = (subjectId: string) => {
    // Navigate to /archives/notes?subject=math (keeps it consistent with your ArchivesNotes component)
    navigate(`/archives/notes?subject=${encodeURIComponent(subjectId)}`);
  };

  return (
    <>
      <Helmet>
        <title>Archives — Subjects</title>
        <meta name="description" content="Browse archived subject notes, past-paper collections and curated study resources." />
      </Helmet>

      <section className="min-h-screen px-6 py-16 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold">Archived Subjects</h1>
              <p className="text-slate-400 mt-2 max-w-xl">Browse subject-wise archived papers and notes, curated by topic and difficulty.</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300 mr-2">Curriculum:</label>
              <select
                className="neu-input-el"
                value={curriculumFilter ?? ""}
                onChange={(e) => setCurriculumFilter(e.target.value || null)}
                aria-label="Filter by curriculum"
              >
                <option value="">All</option>
                <option value="ib-myp">IB MYP</option>
                <option value="ib-dp">IB DP</option>
              </select>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            <input
              className="neu-input-el flex-1"
              placeholder="Search subjects (e.g., 'math', 'physics')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search subjects"
            />
            <button
              className="neu-button px-4 py-2"
              onClick={() => {
                setQuery("");
                setCurriculumFilter(null);
              }}
              title="Clear filters"
            >
              Clear
            </button>
            <Link to="/archives" className="neu-button px-4 py-2">
              Back to Archives Home
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length ? (
              filtered.map((s) => (
                <NeumorphicCard key={s.id} className="p-6 h-full flex flex-col justify-between" title={s.name} info={s.brief}>
                  <div>
                    <div className="text-slate-300 text-sm mb-3">Curriculum: <strong className="text-slate-100">{s.curriculum ?? "General"}</strong></div>
                    <p className="text-slate-300">{s.brief}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button className="neu-button px-3 py-1" onClick={() => openNotes(s.id)}>Open notes</button>
                    <Link to={`/archives/notes?subject=${encodeURIComponent(s.id)}`} className="text-sm text-indigo-300">Open (link)</Link>
                    <div className="ml-auto text-xs text-slate-400">ID: {s.id}</div>
                  </div>
                </NeumorphicCard>
              ))
            ) : (
              <div className="col-span-full p-6 rounded border bg-slate-900 text-slate-400 text-center">
                No subjects found. Try a broader search or clear filters.
              </div>
            )}
          </div>

          <div className="mt-10 text-sm text-slate-400">
            Tip: click <em>Open notes</em> to view curated notes for a subject. The notes page supports the `subject` query parameter.
          </div>
        </div>
      </section>
    </>
  );
}
