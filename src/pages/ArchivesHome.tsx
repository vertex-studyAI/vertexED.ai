import { Link } from "react-router-dom";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ArchivesHome() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const els = gsap.utils.toArray(".fade-up");
    els.forEach((el: any) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } }
      );
    });

    // cleanup: kill ScrollTrigger instances created by this component
    return () => {
      try {
        const st = ScrollTrigger.getAll ? ScrollTrigger.getAll() : [];
        st.forEach((s: any) => s.kill && s.kill());
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, []);

  const curricula = [
    { id: "ib-myp", title: "IB MYP", desc: "Notes crafted for IB Middle Years Programme" },
    { id: "ib-dp", title: "IB DP", desc: "In-depth academic resources for Diploma Programme" },
  ];

  return (
    <section className="min-h-screen px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-center">
      <h1 className="text-5xl font-semibold text-white mb-12 fade-up">The Archives</h1>
      <p className="text-slate-300 mb-12 fade-up">
        Explore verified, formatted notes for the IB MYP and IB DP curriculums.
        Curated, organized, and beautifully presented.
      </p>

      <div className="grid sm:grid-cols-2 gap-10 max-w-4xl mx-auto fade-up">
        {curricula.map((c) => (
          <Link
            key={c.id}
            to={`/${c.id}`}                       // <-- use `to` for react-router
            className="bg-white text-slate-900 rounded-2xl p-10 shadow-xl hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(2,6,23,0.25)] transition-transform tilt-card"
          >
            <h2 className="text-3xl font-bold mb-3">{c.title}</h2>
            <p className="text-slate-600">{c.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
