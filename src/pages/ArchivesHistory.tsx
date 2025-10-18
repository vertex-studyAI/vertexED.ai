// src/pages/ArchivesHistory.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function ArchivesHistory(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Archives — History</title>
        <meta name="description" content="History archive: timelines, primary sources and model answers (IB MYP focus)." />
      </Helmet>

      <section className="min-h-screen px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold mb-4">History — Archives</h1>

          <p className="text-slate-300 mb-6">
            This page stores curated History notes and exemplar answers. Intended for IB MYP support.
            Add timelines, primary-source excerpts, source-analysis notes, and model responses here.
          </p>

          <div className="rounded-md border bg-slate-900 p-6 text-slate-300">
            <h3 className="text-lg font-medium mb-2">Content placeholder</h3>
            <p className="text-sm mb-4">No History content yet. Paste units, timelines and source analyses below when ready.</p>

            <ul className="list-disc list-inside text-slate-400 text-sm">
              <li>Unit overviews</li>
              <li>Timelines and key events</li>
              <li>Primary source notes</li>
              <li>Model answers and practice prompts</li>
            </ul>
          </div>

          <div className="mt-8 flex gap-3">
            <Link to="/archives" className="neu-button px-4 py-2">Back to Archives</Link>
            <Link to="/archives/lnl" className="neu-button px-4 py-2">LnL</Link>
            <Link to="/archives/geography" className="neu-button px-4 py-2">Geography</Link>
          </div>
        </div>
      </section>
    </>
  );
}
