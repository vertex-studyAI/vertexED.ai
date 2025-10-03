// File: /src/pages/home.tsx
</div>
</div>
))}
</div>
</section>


{/* Mission Paragraph */}
<section className="max-w-4xl mx-auto mt-24 px-6 text-center fade-up">
<div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-10">
<p className="text-lg md:text-xl leading-relaxed">
Studying has become harder than ever. With too much information to know what to do with,
resources which never seem to construct real progress, tools which just seem to make
problems worse and the lack of a space which not only adapts to your learning, but
constructs an environment where learning never stops is a problem we all face today.
</p>
<p className="text-lg md:text-xl mt-6 leading-relaxed">
Marks aren't everything and we agree. But in today's world if learning requires people to
score arbitrary marks on a piece of paper, we might as well take out 2 birds with 1 stone.
</p>
<p className="text-lg md:text-xl mt-6 leading-relaxed">
We aim to not only improve your score on a paper with evidence based tools but also
foster an environment for learning like no other.
</p>
</div>
</section>


{/* Features */}
<section className="max-w-6xl mx-auto px-6 mt-28">
<h3 className="text-3xl md:text-4xl font-semibold text-white mb-16 text-center">
Explore Our Features
</h3>
<div className="space-y-20">
{features.map((f, i) => (
<div
key={i}
className={`feature-row flex flex-col md:flex-row items-center gap-10 ${
i % 2 !== 0 ? "md:flex-row-reverse" : ""
}`}
>
<div className="flex-1 bg-white rounded-2xl shadow-xl p-6 text-slate-800">
<h4 className="text-xl font-bold mb-3">{f.title}</h4>
<p>{f.desc}</p>
</div>
<div className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left">
{featureSideText[i]}
</div>
</div>
))}
</div>
</section>


{/* CTA */}
<section className="mt-28 text-center px-6 fade-up">
<h3 className="text-3xl md:text-4xl font-semibold text-white mb-6">
Ready to get started?
<br />
We guarantee a change!
</h3>
<button
onClick={scrollToTop}
className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500 ease-in-out"
>
Back to the Top?
</button>
</section>
</>
);
}
