// src/pages/ArchivesGeography.tsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const TABS = [
  "Overview",
  "Case Studies",
  "Maps & Diagrams",
  "Practice Questions",
];

export default function ArchivesGeography(): JSX.Element {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <>
      <Helmet>
        <title>Geography — Archives</title>
        <meta
          name="description"
          content="Geography archive: case studies, diagrams, and exemplar answers (IB MYP)."
        />
      </Helmet>

      <section className="min-h-screen px-6 py-14 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Geography</h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Case studies, spatial thinking, and exam-focused explanations.
              </p>
            </div>

            <nav className="text-sm text-slate-400">
              <Link to="/archives" className="hover:underline">
                Archives
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-200">Geography</span>
            </nav>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-700 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-t-md transition
                  ${
                    activeTab === tab
                      ? "bg-slate-800 text-slate-100 border border-slate-700 border-b-0"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="rounded-md border border-slate-700 bg-slate-900 p-8">
            <h2 className="text-lg font-medium mb-2">{activeTab}</h2>
            <p className="text-sm text-slate-400">
              This section will later expand into detailed Geography notes,
              diagrams, and curated question banks.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
