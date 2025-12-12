import { Helmet } from "react-helmet-async";
import React, { useEffect, useRef, useState } from "react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Sliders, ArrowRight, FileText, Copy, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const responseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Build a single input_as_text that matches the workflow's expected single input
  const buildInputAsText = () => {
    const parts: string[] = [];

    if (formData.curriculum) parts.push(`Curriculum: ${formData.curriculum}`);
    if (formData.subject) parts.push(`Subject: ${formData.subject}`);
    if (formData.grade) parts.push(`Grade: ${formData.grade}`);
    if (formData.marks) parts.push(`Marks (out of): ${formData.marks}`);

    parts.push("Question:");
    parts.push(formData.question || "[No question provided]");

    parts.push("\nStudent Answer:");
    parts.push(formData.answer || "[No answer provided]");

    if (formData.additional) {
      parts.push("\nAdditional Information:");
      parts.push(formData.additional);
    }

    parts.push(`\nDesired strictness (1-10): ${formData.strictness}`);

    return parts.join("\n\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    const input_as_text = buildInputAsText();
    const strictnessNum = Number(formData.strictness || 5);

    try {
      // POST to /api/review using the workflow schema: input_as_text, register, strictness
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_as_text,
          // register is included so your workflow state var 'register' is set if needed.
          // Keep it false if you don't want the workflow to create persistent posts automatically.
          register: false,
          strictness: strictnessNum,
        }),
      });

      // read body safely
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        // non-JSON body — keep raw text
        data = { raw: text };
      }

      if (!res.ok) {
        // prefer returned details if available
        const details = data?.details ?? data?.raw ?? data;
        console.error("Review API returned error:", res.status, details);
        setResponse(`Error: Workflow call failed (${res.status}).\n\n${JSON.stringify(details, null, 2)}`);
        return;
      }

      // Accept multiple output shapes: { output }, { result: { output } }, or raw text
      const out =
        data?.output ??
        data?.result?.output ??
        data?.data ??
        data?.raw ??
        (typeof data === "string" ? data : JSON.stringify(data, null, 2));

      // slight delay so spinner shows briefly
      setTimeout(() => setResponse(out ?? "No response received."), 150);

      // Attempt to attach post (separate endpoint). If it 404s or fails, don't break the user flow.
      try {
        const attachRes = await fetch("/api/review-post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            review: out,
            strictness: strictnessNum,
            metadata: {
              curriculum: formData.curriculum,
              subject: formData.subject,
              grade: formData.grade,
            },
          }),
        });

        if (!attachRes.ok) {
          const rawAttach = await attachRes.text();
          console.warn("Attach post failed:", attachRes.status, rawAttach);
          // optional: show lightweight non-blocking message to user (kept console-only here)
        }
      } catch (err) {
        console.warn("Attach post failed (network):", err);
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setResponse("Error: Could not get review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      // micro-feedback (could be replaced with a toast)
      const el = document.createElement("div");
      el.textContent = "Copied!";
      el.className = "fixed right-6 bottom-6 bg-slate-900 text-white px-3 py-2 rounded shadow-lg";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    } catch (e) {
      console.warn("Copy failed", e);
    }
  };

  const handleDownload = () => {
    const el = document.createElement("a");
    const blob = new Blob([response], { type: "text/markdown" });
    el.href = URL.createObjectURL(blob);
    el.download = "review.md";
    el.click();
    setTimeout(() => URL.revokeObjectURL(el.href), 1000);
  };

  return (
    <>
      <Helmet>
        <title>A.I Answer Review — Vertex AI Study Tools</title>
        <meta name="description" content="Submit your answers for AI-powered review with strict teacher-style feedback." />
      </Helmet>

      <PageSection>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <NeumorphicCard className="p-8 max-w-6xl mx-auto relative overflow-hidden">
            {/* subtle animated gradient "shine" */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#041226] via-[#07182a] to-[#031022]"
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 8 }}
            />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.06 }} className="p-2 rounded-full bg-gradient-to-br from-sky-700 to-indigo-600 text-white">
                  <FileText size={20} />
                </motion.div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold">A.I Answer Review</h1>
                  <p className="text-sm text-gray-400">Teacher-style feedback & concise rubrics</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                  <Sliders size={14} />
                  <span>Teacher strictness</span>
                </div>
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 py-1 rounded-full bg-slate-800 text-sm text-white"
                >
                  {formData.strictness}/10
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Curriculum</label>
                    <select
                      name="curriculum"
                      value={formData.curriculum}
                      onChange={handleChange}
                      className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    >
                      <option value="">Select Curriculum</option>
                      <option value="IB">IB</option>
                      <option value="IGCSE">IGCSE</option>
                      <option value="CBSE">CBSE</option>
                      <option value="AP">AP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    >
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
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    >
                      <option value="">Select Grade</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Marks (out of)</label>
                    <input
                      type="number"
                      name="marks"
                      value={formData.marks}
                      onChange={handleChange}
                      placeholder="Enter maximum marks"
                      className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Question Segment</label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    placeholder="Paste or type the question here..."
                    rows={4}
                    className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Student Answer</label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    placeholder="Paste or type the student's answer here..."
                    rows={6}
                    className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Information</label>
                  <textarea
                    name="additional"
                    value={formData.additional}
                    onChange={handleChange}
                    placeholder="Provide any context or notes here..."
                    rows={3}
                    className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium mb-2">Strictness (1-10)</label>
                    <div className="flex gap-3 items-center">
                      <select
                        name="strictness"
                        value={formData.strictness}
                        onChange={handleChange}
                        className="p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                      >
                        {Array.from({ length: 10 }).map((_, i) => {
                          const v = i + 1;
                          return (
                            <option key={v} value={String(v)}>
                              {v}
                            </option>
                          );
                        })}
                      </select>
                      <div className="text-sm text-gray-400">Controls how strict the AI grades</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <motion.button
                      type="submit"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl shadow-2xl hover:opacity-95 focus:outline-none"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      disabled={loading}
                    >
                      <span className="flex items-center gap-2">
                        {loading ? (
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                        ) : (
                          <ArrowRight size={16} />
                        )}
                        <span>{loading ? "Reviewing..." : "Submit for Review"}</span>
                      </span>
                    </motion.button>
                  </div>
                </div>
              </form>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">AI Review</h2>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400">Strictness</div>
                    <div className="px-2 py-1 rounded bg-slate-800 text-sm text-white">{formData.strictness}/10</div>
                  </div>
                </div>

                <div className="flex-1 p-6 rounded-2xl overflow-y-auto bg-[#031827]" ref={responseRef} style={{ minHeight: 240 }}>
                  <AnimatePresence>
                    {response ? (
                      <motion.div
                        key="response"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.32 }}
                        className="max-w-full px-4 py-3 bg-[#07182a] text-sky-200 rounded-2xl shadow-md"
                      >
                        <ReactMarkdown children={response} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />

                        <div className="mt-4 flex items-center gap-3">
                          <button onClick={handleCopy} className="neu-button inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#07172a] hover:scale-102 transition">
                            <Copy size={14} /> Copy Review
                          </button>

                          <button onClick={handleDownload} className="neu-button inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#07172a] hover:scale-102 transition">
                            <Download size={14} /> Download
                          </button>

                          <div className="ml-auto text-sm text-gray-400">Attached post created</div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-gray-400 italic">AI feedback will appear here after submission...</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </NeumorphicCard>
        </motion.div>
      </PageSection>
    </>
  );
}
