// src/pages/ArchivesHome.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function ArchivesHome(): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Archives — VertexED</title>
        <meta
          name="description"
          content="Repository of archived notes and curated answers (primarily IB MYP support). Browse LnL, History and Geography."
        />
      </Helmet>

      <section className="min-h-screen px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-center text-slate-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-semibold mb-6">The Archives</h1>

          <p className="text-slate-300 max-w-2xl mx-auto mb-8">
            This repository is a curated collection of existing notes and exemplar answers
            for common classroom and exam questions. Content is intended primarily to support IB
            MYP students at the moment — focused subject notes, model responses and organized
            reference material.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mt-6">
            <Link
              to="/archives/lnl"
              className="block rounded-2xl bg-white text-slate-900 p-6 shadow-md hover:scale-[1.02] transition-transform"
            >
              <h2 className="text-2xl font-semibold mb-1">Language &amp; Literature</h2>
              <p className="text-sm text-slate-600 mt-1">Notes, sample responses and close readings (LnL).</p>
            </Link>

            <Link
              to="/archives/history"
              className="block rounded-2xl bg-white text-slate-900 p-6 shadow-md hover:scale-[1.02] transition-transform"
            >
              <h2 className="text-2xl font-semibold mb-1">History</h2>
              <p className="text-sm text-slate-600 mt-1">Timelines, primary-source notes and model answers.</p>
            </Link>

            <Link
              to="/archives/geography"
              className="block rounded-2xl bg-white text-slate-900 p-6 shadow-md hover:scale-[1.02] transition-transform"
            >
              <h2 className="text-2xl font-semibold mb-1">Geography</h2>
              <p className="text-sm text-slate-600 mt-1">Case studies, maps, and practice prompts.</p>
            </Link>
          </div>

          <div className="mt-12 text-sm text-slate-400">
            <p>
              These pages are placeholders ready for content. Paste topic notes, exemplar answers,
              and organized support materials into the subject pages when you're ready.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
