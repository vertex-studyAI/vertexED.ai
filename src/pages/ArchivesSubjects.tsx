import { useNavigate } from "react-router-dom";
import Link from "next/link";
import { useEffect } from "react";
import { gsap } from "gsap";

const mockSubjects = {
  "ib-myp": ["Mathematics", "Science", "English", "Individuals & Societies"],
  "ib-dp": ["Mathematics AA HL", "Physics HL", "Economics SL", "Language A HL"],
};

export default function ArchivesSubjects() {
  const router = useRouter();
  const { curriculum } = router.query;

  useEffect(() => {
    gsap.utils.toArray(".fade-up").forEach((el: any) => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    });
  }, []);

  if (!curriculum) return null;
  const subjects = mockSubjects[curriculum as keyof typeof mockSubjects] || [];

  return (
    <section className="min-h-screen px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-center">
      <h1 className="text-4xl font-semibold text-white mb-10 fade-up">
        {curriculum.toString().toUpperCase()} Subjects
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto fade-up">
        {subjects.map((subject, i) => (
          <Link
            key={i}
            href={`/${curriculum}/${encodeURIComponent(subject.toLowerCase().replace(/\s+/g, "-"))}`}
            className="bg-white text-slate-900 rounded-2xl p-8 shadow-xl hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(2,6,23,0.25)] transition-transform tilt-card"
          >
            <h3 className="text-xl font-bold">{subject}</h3>
            <p className="text-slate-600 mt-2">Explore verified notes</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
