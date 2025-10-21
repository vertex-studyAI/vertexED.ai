// src/pages/ArchivesLnL.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function ArchivesLnL(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Archives — Language &amp; Literature (LnL)</title>
        <meta
          name="description"
          content="Language & Literature archive: notes, model responses and curated close readings (IB MYP focus)."
        />
      </Helmet>

      <section className="min-h-screen px-6 py-16 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl sm:text-4xl font-semibold">
              Language &amp; Literature — Archives
            </h1>
            <nav aria-label="breadcrumb" className="text-sm text-slate-400">
              <Link to="/archives" className="hover:underline">
                Archives
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-200">LnL</span>
            </nav>
          </div>

          <p className="text-slate-300 mb-6 text-sm">
            Repository for Language &amp; Literature notes and curated sample
            answers — close readings, annotated excerpts and sample essays for
            IB MYP support.
          </p>

          <div className="rounded-md border border-slate-700 bg-slate-900 p-6 text-slate-300">
            <h3 className="text-lg font-medium mb-2">Content placeholder</h3>
            <p className="text-sm mb-4">
              No LnL content yet. Add headings, excerpts, and model responses
              here. Use clear subheadings to keep the archive organized.
            </p>

            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
              <li>Topic overviews and skills</li>
              <li>Close reading notes and annotations</li>
              <li>Annotated sample responses and marking tips</li>
              <li>Practice questions and model answers</li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/archives"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                Back to Archives
              </Link>
              <Link
                to="/archives/history"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                History
              </Link>
              <Link
                to="/archives/geography"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                Geography
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
