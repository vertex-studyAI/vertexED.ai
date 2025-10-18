// src/pages/ArchivesGeography.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function ArchivesGeography(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Archives — Geography</title>
        <meta name="description" content="Geography archive: case studies, maps and model answers (IB MYP focus)." />
      </Helmet>

      <section className="min-h-screen px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold mb-4">Geography — Archives</h1>

          <p className="text-slate-300 mb-6">
            This page contains Geography notes and curated answers. Designed for IB MYP support.
            Add case studies, annotated maps, practice questions and model answers here.
          </p>

          <div className="rounded-md border bg-slate-900 p-6 text-slate-300">
            <h3 className="text-lg font-medium mb-2">Content placeholder</h3>
            <p className="text-sm mb-4">No Geography content yet. Paste case studies, diagrams and question banks here when ready.</p>

            <ul className="list-disc list-inside text-slate-400 text-sm">
              <li>Key concepts and definitions</li>
              <li>Case studies</li>
              <li>Maps / diagrams (annotated)</li>
              <li>Model answers & practice prompts</li>
            </ul>
          </div>

          <div className="mt-8 flex gap-3">
            <Link to="/archives" className="neu-button px-4 py-2">Back to Archives</Link>
            <Link to="/archives/lnl" className="neu-button px-4 py-2">LnL</Link>
            <Link to="/archives/history" className="neu-button px-4 py-2">History</Link>
          </div>
        </div>
      </section>
    </>
  );
}
