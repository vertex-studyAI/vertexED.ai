import { Helmet } from "react-helmet-async";
import { useState } from "react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Sliders, ArrowRight, FileText } from "lucide-react";

export default function AIAnswerReview() {
  const [formData, setFormData] = useState({
    curriculum: "",
    subject: "",
    grade: "",
    marks: "",
    question: "",
    answer: "",
    additional: "",
    strictness: "5",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    const prompt = `You are an expert teacher. Review the student's answer.
Curriculum: ${formData.curriculum}
Subject: ${formData.subject}
Grade: ${formData.grade}
Marks: Out of ${formData.marks}
Desired strictness (1-10): ${formData.strictness}
Question: ${formData.question}
Student Answer: ${formData.answer}
Additional Information: ${formData.additional}

Provide:
1. Strict teacher-style feedback (clarity, depth, accuracy).
2. Suggested marks (out of ${formData.marks}).
3. Key improvements the student can make.
4. A concise rubric bullet list.
`;

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, strictness: formData.strictness }),
      });
      const data = await res.json();
      const out = data.output || "No response received.";
      setResponse(out);

      try {
        await fetch("/api/review-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review: out, strictness: formData.strictness, metadata: { curriculum: formData.curriculum, subject: formData.subject, grade: formData.grade } }),
        });
      } catch (err) {
        console.warn("Attach post failed", err);
      }
    } catch (err: any) {
      console.error(err);
      setResponse("Error: Could not get review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>A.I Answer Review — Vertex AI Study Tools</title>
        <meta name="description" content="Submit your answers for AI-powered review with strict teacher-style feedback." />
        <link rel="canonical" href="https://www.vertexed.app/answer-reviewer" />
        <meta property="og:title" content="A.I Answer Review — Vertex AI Study Tools" />
        <meta property="og:description" content="Submit your answers for AI-powered review with strict teacher-style feedback." />
        <meta property="og:url" content="https://www.vertexed.app/answer-reviewer" />
        <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{`
        {
          "@context":"https://schema.org",
          "@type":"WebPage",
          "name":"AI Answer Reviewer",
          "url":"https://www.vertexed.app/answer-reviewer",
          "description":"Submit your answers for AI-powered review with strict teacher-style feedback."
        }`}</script>
      </Helmet>

      <PageSection>
        <NeumorphicCard className="p-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText size={22} className="text-sky-400" />
              <h1 className="text-2xl font-semibold">A.I Answer Review</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">Teacher strictness</div>
              <div className="px-3 py-1 rounded-full bg-slate-800 text-sm text-white">{formData.strictness}/10</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Curriculum</label>
                  <select name="curriculum" value={formData.curriculum} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-700 bg-[#0b1220] text-white focus:ring-2 focus:ring-sky-500">
                    <option value="">Select Curriculum</option>
                    <option value="IB">IB</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="CBSE">CBSE</option>
                    <option value="AP">AP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <select name="subject" value={formData.subject} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-700 bg-[#0b1220] text-white focus:ring-2 focus:ring-sky-500">
                    <option value="">Select Subject</option>
                    <option value="Math">Math</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Economics">Economics</option>
                    <option value="History">History</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Grade</label>
                  <select name="grade" value={formData.grade} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-700 bg-[#0b1220] text-white focus:ring-2 focus:ring-sky-500">
                    <option value="">Select Grade</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Marks (out of)</label>
                  <input type="number" name="marks" value={formData.marks} onChange={handleChange} placeholder="Enter maximum marks" className="w-full p-3 rounded-xl border border-slate-700 bg-[#0b1220] text-white focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Question Segment</label>
                <textarea name="question" value={formData.question} onChange={handleChange} placeholder="Paste or type the question here..." rows={4} className="w-full p-3 rounded-xl border border-slate-700 bg-[#0b1220] text-white focus:ring-2 focus:ring-sky-500" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Student Answer</label>
                <textarea name="answer" value={formData.answer} onChange={handleChange} placeholder="Paste or type the student's answer here..." rows={6} className="w-full p-3 rounded-xl border border-slate-700 bg-[#0b1220] text-white focus:ring-2 focus:ring-sky-500" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Information</label>
                <textarea name="additional" value={formData.additional} onChange={handleChange} placeholder="Provide any context or notes here..." rows={3} className="w-full p-3 rounded-xl border border-slate-700 bg-[#0b1220] text-white focus:ring-2 focus:ring-sky-500" />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium mb-2">Strictness (1-10)</label>
                  <div className="flex gap-2 items-center">
                    <select name="strictness" value={formData.strictness} onChange={handleChange} className="p-3 rounded-xl border border-slate-700 bg-[#0b1220] text-white focus:ring-2 focus:ring-sky-500">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const v = i + 1;
                        return (
                          <option key={v} value={String(v)}>{v}</option>
                        );
                      })}
                    </select>
                    <div className="text-sm text-gray-400">Controls how strict the AI grades</div>
                  </div>
                </div>

                <div className="text-right">
                  <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-full shadow-md hover:opacity-95 transition">
                    <span>{loading ? "Reviewing..." : "Submit for Review"}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">AI Review</h2>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-400">Strictness</div>
                  <div className="px-2 py-1 rounded bg-slate-800 text-sm text-white">{formData.strictness}/10</div>
                </div>
              </div>

              <div className="flex-1 p-6 rounded-2xl overflow-y-auto bg-[#071026]">
                {response ? (
                  <div className="max-w-full px-4 py-3 bg-[#07182a] text-sky-200 rounded-2xl shadow-md">
                    <ReactMarkdown children={response} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
                  </div>
                ) : (
                  <div className="text-gray-400 italic">AI feedback will appear here after submission...</div>
                )}

                {response && (
                  <div className="mt-4 flex items-center gap-3">
                    <button onClick={() => navigator.clipboard.writeText(response)} className="neu-button px-3 py-1">Copy Review</button>
                    <a href="#" onClick={(e) => { e.preventDefault(); const el = document.createElement('a'); const blob = new Blob([response], { type: 'text/markdown' }); el.href = URL.createObjectURL(blob); el.download = 'review.md'; el.click(); setTimeout(() => URL.revokeObjectURL(el.href), 1000); }} className="neu-button px-3 py-1">Download</a>
                    <div className="ml-auto text-sm text-gray-400">Attached post created</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
