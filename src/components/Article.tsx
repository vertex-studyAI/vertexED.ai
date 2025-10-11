import React from "react";

type ArticleProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  children: React.ReactNode;
};

export default function Article({ title, subtitle, kicker, children }: ArticleProps) {
  return (
    <section className="relative py-10 md:py-14">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <header className="mb-8 md:mb-10">
          {kicker && (
            <div className="inline-block text-xs tracking-wide uppercase text-slate-300 bg-white/5 px-3 py-1 rounded-full mb-3">
              {kicker}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight brand-text-gradient">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-slate-300 text-base md:text-lg leading-relaxed">
              {subtitle}
            </p>
          )}
        </header>

        <article className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-blockquote:text-slate-200 prose-code:text-slate-200 prose-pre:bg-slate-900/80 prose-pre:text-slate-100 prose-a:text-blue-300 hover:prose-a:text-blue-200 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-hr:border-white/10 prose-h1:text-4xl md:prose-h1:text-5xl prose-h2:text-2xl md:prose-h2:text-3xl prose-h3:text-xl md:prose-h3:text-2xl">
          {children}
        </article>
      </div>
    </section>
  );
}
