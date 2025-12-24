import { Helmet } from "react-helmet-async";
import React, { useEffect, useRef, useState } from "react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Sliders, ArrowRight, FileText, Copy, Download, Image as ImageIcon, X } from "lucide-react";
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

  const [questionImages, setQuestionImages] = useState<string[]>([]);
  const [answerImages, setAnswerImages] = useState<string[]>([]);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'question' | 'answer') => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (type === 'question') {
            setQuestionImages((prev) => [...prev, reader.result as string]);
          } else {
            setAnswerImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent, type: 'question' | 'answer') => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (type === 'question') {
              setQuestionImages((prev) => [...prev, reader.result as string]);
            } else {
              setAnswerImages((prev) => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(blob);
          e.preventDefault();
        }
      }
    }
  };

  const removeImage = (index: number, type: 'question' | 'answer') => {
    if (type === 'question') {
      setQuestionImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAnswerImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Build a single, consistent input string containing all form fields.
  const buildInputAsText = () => {
    // Use safe defaults and trim text fields for cleanliness
    const curriculum = formData.curriculum?.trim() || "N/A";
    const subject = formData.subject?.trim() || "N/A";
    const grade = formData.grade?.trim() || "N/A";
    const marks = formData.marks?.toString().trim() || "N/A";
    const question = formData.question?.trim() || "[No question provided]";
    const answer = formData.answer?.trim() || "[No answer provided]";
    const additional = formData.additional?.trim() || "None";
    const strictness = formData.strictness?.trim() || "5";

    return `
Curriculum: ${curriculum}
Subject: ${subject}
Grade: ${grade}
Marks (out of): ${marks}

------------------------------
QUESTION
------------------------------
${question}

------------------------------
STUDENT ANSWER
------------------------------
${answer}

------------------------------
ADDITIONAL INFORMATION
------------------------------
${additional}

------------------------------
STRICTNESS LEVEL
------------------------------
${strictness}

END OF INPUT
`.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    const input_as_text = buildInputAsText();

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only send one field called input_as_text to match the workflow requirement.
        body: JSON.stringify({ input_as_text, questionImages, answerImages }),
      });

      // Read raw text first to avoid json.parse exceptions on HTML/error pages.
      const text = await res.text();
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // not valid json — keep raw text so we can display it
        data = { _raw: text };
      }

      if (!res.ok) {
        // Provide helpful debug info: status + any parsed fields or raw text
        const statusInfo = `Status: ${res.status} ${res.statusText || ""}`.trim();
        const details =
          data && typeof data === "object"
            ? JSON.stringify(data, null, 2)
            : String(data);
        setResponse(`Error: ${data?.error ?? "Unknown error"}\n\n${statusInfo}\n\n${details}`);
        return;
      }

      // Prefer widely-used fields but fall back to sensible alternatives
      const out =
        data?.safe_text ??
        data?.passOutput?.safe_text ??
        data?.output ??
        data?.result?.output ??
        data?.data ??
        data?.review ??
        (typeof data === "string" ? data : JSON.stringify(data, null, 2)) ??
        data?._raw ??
        "No response received.";

      // Give a tiny delay to make UI feel smoother (keeps your previous behavior)
      setTimeout(() => setResponse(out ?? "No response received."), 150);

      // Post-process: if we received an actual string result, save a post record.
      // Only attempt if `out` is a non-empty string.
      try {
        if (out && typeof out === "string" && out.trim().length > 0) {
          await fetch("/api/review-post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // keep the stored review as the server response (not the form fields)
              review: out,
              // also include minimal metadata for your DB (optional but useful)
              metadata: {
                curriculum: formData.curriculum,
                subject: formData.subject,
                grade: formData.grade,
              },
            }),
          });
        }
      } catch (err) {
        // Do not crash UI if post saving fails; just log silently
        // eslint-disable-next-line no-console
        console.warn("Failed to save review post:", err);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Submit error:", err);
      setResponse("Error: Could not get review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      const el = document.createElement("div");
      el.textContent = "Copied!";
      el.className =
        "fixed right-6 bottom-6 bg-slate-900 text-white px-3 py-2 rounded shadow-lg";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    } catch {}
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
        <meta
          name="description"
          content="Submit your answers for AI-powered review with strict teacher-style feedback."
        />
      </Helmet>

      <PageSection>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <NeumorphicCard className="p-8 max-w-6xl mx-auto relative overflow-hidden">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#041226] via-[#07182a] to-[#031022]"
              initial={{ scale: 1.02 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 8 }}
            />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  className="p-2 rounded-full bg-gradient-to-br from-sky-700 to-indigo-600 text-white"
                >
                  <FileText size={20} />
                </motion.div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold">
                    A.I Answer Review
                  </h1>
                  <p className="text-sm text-gray-400">
                    Teacher-style feedback & concise rubrics
                  </p>
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
              {/* LEFT FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Curriculum
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Subject
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Grade
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Marks (out of)
                    </label>
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
                  <label className="block text-sm font-medium mb-2">
                    Question Segment
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    onPaste={(e) => handlePaste(e, 'question')}
                    placeholder="Paste or type the question here..."
                    rows={4}
                    className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
                  />
                  <div className="flex flex-wrap gap-3 mt-3">
                    {questionImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 group">
                        <img src={img} alt={`Question Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, 'question')}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 bg-[#071126] hover:bg-slate-800 cursor-pointer transition text-gray-400 hover:text-white">
                      <ImageIcon size={20} />
                      <span className="text-[10px] mt-1">Upload Q</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, 'question')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Student Answer
                  </label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    onPaste={(e) => handlePaste(e, 'answer')}
                    placeholder="Paste or type the student's answer here..."
                    rows={6}
                    className="w-full p-3 rounded-2xl border border-slate-700 bg-[#071126] text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition resize-none"
                  />
                  <div className="flex flex-wrap gap-3 mt-3">
                    {answerImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 group">
                        <img src={img} alt={`Answer Upload ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, 'answer')}
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-600 bg-[#071126] hover:bg-slate-800 cursor-pointer transition text-gray-400 hover:text-white">
                      <ImageIcon size={20} />
                      <span className="text-[10px] mt-1">Upload A</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, 'answer')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Paste images directly into the text areas or use the upload buttons.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Information
                  </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Strictness (1-10)
                    </label>
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
                      <div className="text-sm text-gray-400">
                        Controls how strict the AI grades
                      </div>
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
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="white"
                              strokeWidth="4"
                              fill="none"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="white"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
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

              {/* RIGHT PANEL */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    AI Review
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400">Strictness</div>
                    <div className="px-2 py-1 rounded bg-slate-800 text-sm text-white">
                      {formData.strictness}/10
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 p-6 rounded-2xl overflow-y-auto bg-[#031827]"
                  ref={responseRef}
                  style={{ minHeight: 240 }}
                >
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
                        <ReactMarkdown
                          children={response}
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        />

                        <div className="mt-4 flex items-center gap-3">
                          <button
                            onClick={handleCopy}
                            className="neu-button inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#07172a] hover:scale-102 transition"
                          >
                            <Copy size={14} /> Copy Review
                          </button>

                          <button
                            onClick={handleDownload}
                            className="neu-button inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#07172a] hover:scale-102 transition"
                          >
                            <Download size={14} /> Download
                          </button>

                          <div className="ml-auto text-sm text-gray-400">
                            Attached post created
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="text-gray-400 italic">
                          AI feedback will appear here after submission...
                        </div>
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
