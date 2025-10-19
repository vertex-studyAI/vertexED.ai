// src/pages/ArchivesHistory.tsx
<meta name="description" content="History archive: timelines, primary sources and model answers (IB MYP focus)." />
</Helmet>


<section className="min-h-screen px-6 py-16 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
<div className="max-w-4xl mx-auto">
<div className="flex items-center justify-between mb-6">
<h1 className="text-3xl sm:text-4xl font-semibold">History — Archives</h1>
<nav aria-label="breadcrumb" className="text-sm text-slate-400">
<Link to="/archives" className="hover:underline">Archives</Link>
<span className="mx-2">/</span>
<span className="text-slate-200">History</span>
</nav>
</div>


<p className="text-slate-300 mb-6 text-sm">
Curated History notes and exemplar answers for IB MYP support. Add timelines, primary-source
excerpts, source analysis notes, and model responses.
</p>


<div className="rounded-md border border-slate-700 bg-slate-900 p-6 text-slate-300">
<h3 className="text-lg font-medium mb-2">Content placeholder</h3>
<p className="text-sm mb-4">No History content yet. Paste units, timelines and source analyses below when ready.</p>


<ul className="list-disc list-inside text-slate-400 text-sm space-y-1">
<li>Unit overviews and learning objectives</li>
<li>Timelines and key events (annotated)</li>
<li>Primary source excerpts with guided questions</li>
<li>Model responses and practice prompts</li>
</ul>


<div className="mt-6 flex flex-wrap gap-3">
<Link
to="/archives"
className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
>
Back to Archives
</Link>


<Link
to="/archives/lnl"
className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
>
LnL
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
