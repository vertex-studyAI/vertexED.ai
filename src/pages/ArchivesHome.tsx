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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4">The Archives</h1>

          <p className="text-slate-300 max-w-3xl mx-auto mb-8 text-sm sm:text-base">
            A curated collection of notes and exemplar answers for common classroom and exam
            questions. Primarily built to support IB MYP students — subject notes, model responses
            and organized reference material.
          </p>

          <div className="grid gap-6 sm:grid-cols-3 mt-6">
            <Link
              to="/archives/lnl"
              aria-label="Open Language & Literature archives"
              className="group block rounded-2xl bg-white/5 backdrop-blur-sm p-6 shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Language &amp; Literature</h2>
                  <p className="text-sm text-slate-300 mt-1">Notes, sample responses and close readings (LnL).</p>
                </div>
                <svg className="w-10 h-10 text-slate-400 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>

            <Link
              to="/archives/history"
              aria-label="Open History archives"
              className="group block rounded-2xl bg-white/5 backdrop-blur-sm p-6 shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">History</h2>
                  <p className="text-sm text-slate-300 mt-1">Timelines, primary-source notes and model answers.</p>
                </div>
                <svg className="w-10 h-10 text-slate-400 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>

            <Link
              to="/archives/geography"
              aria-label="Open Geography archives"
              className="group block rounded-2xl bg-white/5 backdrop-blur-sm p-6 shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Geography</h2>
                  <p className="text-sm text-slate-300 mt-1">Case studies, maps, and practice prompts.</p>
                </div>
                <svg className="w-10 h-10 text-slate-400 opacity-80 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 2l4 7h-8l4-7zM4 22h16v-2H4v2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
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
