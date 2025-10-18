// src/pages/archives/LnL.tsx
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

      <section className="min-h-screen px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold mb-4">Language &amp; Literature — Archives</h1>

          <p className="text-slate-300 mb-6">
            This page is a repository for Language &amp; Literature notes and curated sample answers.
            It is primarily prepared to support IB MYP students. Paste topic notes, annotated excerpts,
            sample essays and practice questions into the content area below.
          </p>

          <div className="rounded-md border bg-slate-900 p-6 text-slate-300">
            <h3 className="text-lg font-medium mb-2">Content placeholder</h3>
            <p className="text-sm mb-4">
              No LnL content yet. When ready, add headings, excerpts, and model responses here. Use
              clear subheadings to keep the archive organized.
            </p>

            <ul className="list-disc list-inside text-slate-400 text-sm">
              <li>Topic overviews</li>
              <li>Close reading notes</li>
              <li>Annotated sample responses</li>
              <li>Practice questions</li>
            </ul>
          </div>

          <div className="mt-8 flex gap-3">
            <Link to="/archives" className="neu-button px-4 py-2">Back to Archives</Link>
            <Link to="/archives/history" className="neu-button px-4 py-2">History</Link>
            <Link to="/archives/geography" className="neu-button px-4 py-2">Geography</Link>
          </div>
        </div>
      </section>
    </>
  );
}
