import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { gsap } from "gsap";

const mockNotes = [
  {
    id: "1",
    title: "Trigonometric Identities Simplified",
    summary: "Understand and apply core trigonometric relationships easily.",
    content:
      "Trigonometric identities are mathematical equations involving trigonometric functions that are true for all values of the variable. They include reciprocal, Pythagorean, and cofunction identities...",
  },
  {
    id: "2",
    title: "Introduction to Calculus",
    summary: "A quick walkthrough of limits and derivatives.",
    content:
      "Calculus is the study of continuous change. The two main branches are differential calculus (derivatives) and integral calculus (integrals). The concept of limit forms its foundation...",
  },
];

export default function ArchivesNotes() {
  const router = useRouter();
  const { curriculum, subject } = router.query;
  const [openNote, setOpenNote] = useState<string | null>(null);

  useEffect(() => {
    gsap.utils.toArray(".fade-up").forEach((el: any) => {
      gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
    });
  }, []);

  return (
    <section className="min-h-screen px-6 py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-center">
      <h1 className="text-4xl font-semibold text-white mb-10 fade-up capitalize">
        {decodeURIComponent(subject as string)?.replace(/-/g, " ")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto fade-up">
        {mockNotes.map((note) => {
          const isOpen = openNote === note.id;
          return (
            <div
              key={note.id}
              className={`relative bg-white text-slate-900 rounded-2xl shadow-xl p-8 transition-all duration-500 cursor-pointer hover:scale-[1.02] ${
                isOpen ? "z-50 fixed top-0 left-0 w-full h-full p-10 overflow-y-auto bg-white" : ""
              }`}
              onClick={() => setOpenNote(isOpen ? null : note.id)}
            >
              <h3 className="text-2xl font-bold mb-2">{note.title}</h3>
              {!isOpen && <p className="text-slate-600">{note.summary}</p>}
              {isOpen && (
                <div className="mt-6 text-left text-lg leading-relaxed text-slate-800">
                  <p>{note.content}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenNote(null);
                    }}
                    className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-700 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
