import { Helmet } from "react-helmet-async";
import React, { useEffect, useMemo, useRef, useState } from "react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";
import { authFetch } from "@/lib/apiAuth";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Sliders, ArrowRight, FileText, Copy, Download, Image as ImageIcon, X, Sparkles, Shield, MessageSquareQuote, CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Attachment = {
  id: string;
  src: string;
  name?: string;
};

type FormState = {
  curriculum: string;
  subject: string;
  grade: string;
  marks: string;
  question: string;
  answer: string;
  additional: string;
  strictness: string;
};

type ApiResponseLike = Record<string, any> | string | null;

const initialFormState: FormState = {
  curriculum: "",
  subject: "",
  grade: "",
  marks: "",
  question: "",
  answer: "",
  additional: "",
  strictness: "5",
};

const curriculumOptions = ["IB", "IGCSE", "CBSE", "AP"];
const subjectOptions = ["Math", "Physics", "Chemistry", "Biology", "Economics", "History", "English", "Computer Science", "Business"];
const gradeOptions = ["9", "10", "11", "12"];

const safeText = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
};

const buildInputAsText = (formData: FormState) => {
  const curriculum = formData.curriculum.trim() || "N/A";
  const subject = formData.subject.trim() || "N/A";
  const grade = formData.grade.trim() || "N/A";
  const marks = formData.marks?.trim() || "N/A";
  const question = formData.question.trim() || "[No question provided]";
  const answer = formData.answer.trim() || "[No answer provided]";
  const additional = formData.additional.trim() || "None";
  const strictness = formData.strictness.trim() || "5";

  return [
    `Curriculum: ${curriculum}`,
    `Subject: ${subject}`,
    `Grade: ${grade}`,
    `Marks (out of): ${marks}`,
    "",
    "------------------------------",
    "QUESTION",
    "------------------------------",
    question,
    "",
    "------------------------------",
    "STUDENT ANSWER",
    "------------------------------",
    answer,
    "",
    "------------------------------",
    "ADDITIONAL INFORMATION",
    "------------------------------",
    additional,
    "",
    "------------------------------",
    "STRICTNESS LEVEL",
    "------------------------------",
    strictness,
    "",
    "END OF INPUT",
  ].join("\n");
};

function toApiSafeString(data: ApiResponseLike) {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "";

  return (
    data.safe_text ??
    data.passOutput?.safe_text ??
    data.output ??
    data.result?.output ??
    data.data ??
    data.review ??
    data._raw ??
    ""
  );
}

function uniqueId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function AIAnswerReview() {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [questionImages, setQuestionImages] = useState<Attachment[]>([]);
  const [answerImages, setAnswerImages] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedPost, setSavedPost] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const [showRaw, setShowRaw] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const responseRef = useRef<HTMLDivElement | null>(null);
  const fileInputQuestionRef = useRef<HTMLInputElement | null>(null);
  const fileInputAnswerRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    if (!savedPost) return;
    const id = window.setTimeout(() => setSavedPost(false), 1800);
    return () => window.clearTimeout(id);
  }, [savedPost]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const readFilesAsAttachments = (files: FileList | null) => {
    if (!files?.length) return Promise.resolve<Attachment[]>([]);

    return Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: uniqueId(),
                src: String(reader.result || ""),
                name: file.name,
              });
            reader.onerror = () => reject(new Error(`Failed reading ${file.name}`));
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "question" | "answer"
  ) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      const attachments = await readFilesAsAttachments(files);
      if (type === "question") setQuestionImages((prev) => [...prev, ...attachments]);
      else setAnswerImages((prev) => [...prev, ...attachments]);
    } catch (err) {
      console.error(err);
      setError("Some images could not be read.");
    } finally {
      e.target.value = "";
    }
  };

  const handlePaste = async (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    type: "question" | "answer"
  ) => {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter((item) => item.type.startsWith("image/"));
    if (!imageItems.length) return;

    const attachments: Attachment[] = [];
    for (const item of imageItems) {
      const blob = item.getAsFile();
      if (!blob) continue;
      const attachment = await new Promise<Attachment>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            id: uniqueId(),
            src: String(reader.result || ""),
            name: blob.name || "pasted-image",
          });
        reader.onerror = () => reject(new Error("Failed to read pasted image"));
        reader.readAsDataURL(blob);
      });
      attachments.push(attachment);
    }

    if (attachments.length) {
      e.preventDefault();
      if (type === "question") setQuestionImages((prev) => [...prev, ...attachments]);
      else setAnswerImages((prev) => [...prev, ...attachments]);
    }
  };

  const removeImage = (id: string, type: "question" | "answer") => {
    if (type === "question") setQuestionImages((prev) => prev.filter((img) => img.id !== id));
    else setAnswerImages((prev) => prev.filter((img) => img.id !== id));
  };

  const resetAll = () => {
    setFormData(initialFormState);
    setQuestionImages([]);
    setAnswerImages([]);
    setResponse("");
    setError(null);
    setSavedPost(false);
    setLastSubmittedAt(null);
  };

  const canSubmit = useMemo(() => {
    const hasQuestion = formData.question.trim().length > 0 || questionImages.length > 0;
    const hasAnswer = formData.answer.trim().length > 0 || answerImages.length > 0;
    return hasQuestion && hasAnswer && !loading;
  }, [formData.question, formData.answer, questionImages.length, answerImages.length, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    setError(null);
    setSavedPost(false);

    const input_as_text = buildInputAsText(formData);

    try {
      const res = await authFetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_as_text, questionImages, answerImages }),
      });

      const text = await res.text();
      let data: ApiResponseLike = null;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { _raw: text };
      }

      if (!res.ok) {
        const statusInfo = `Status: ${res.status} ${res.statusText || ""}`.trim();
        const details = data && typeof data === "object" ? JSON.stringify(data, null, 2) : String(data || text || "");
        const message = `Error: ${safeText((data as any)?.error) || "Unknown error"}\n\n${statusInfo}\n\n${details}`;
        setResponse(message);
        setError("The review service returned an error.");
        return;
      }

      const out = toApiSafeString(data).trim() || text.trim() || "No response received.";
      setTimeout(() => setResponse(out), 120);
      setLastSubmittedAt(new Date().toLocaleString());
      setSubmitCount((c) => c + 1);

      try {
        if (typeof out === "string" && out.trim()) {
          await authFetch("/api/review-post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              review: out,
              metadata: {
                curriculum: formData.curriculum,
                subject: formData.subject,
                grade: formData.grade,
                marks: formData.marks,
                strictness: formData.strictness,
              },
            }),
          });
          setSavedPost(true);
        }
      } catch (err) {
        console.warn("Failed to save review post:", err);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Could not get review. Please try again.");
      setResponse("Error: Could not get review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response || "");
      setCopied(true);
    } catch {
      setError("Copy failed.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([response || ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = "review.md";
    el.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const responseWordCount = useMemo(() => {
    return response.trim() ? response.trim().split(/\s+/).filter(Boolean).length : 0;
  }, [response]);

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 shadow-sm backdrop-blur">
      {children}
    </span>
  );

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
          <NeumorphicCard className="relative mx-auto max-w-7xl overflow-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.16),transparent_26%),linear-gradient(180deg,#04101f,#071626_44%,#03111f)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <motion.div whileHover={{ scale: 1.06, rotate: 3 }} className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-3 text-white shadow-lg shadow-sky-900/30">
                  <FileText size={22} />
                </motion.div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">A.I Answer Review</h1>
                    <Badge><Shield size={12} /> Teacher-style</Badge>
                    <Badge><Sparkles size={12} /> Strict feedback</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                    Submit a question and answer set for detailed grading, rubric-style feedback, and a polished review you can copy or download.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="hidden items-center gap-2 text-white/55 sm:flex">
                  <Sliders size={14} />
                  <span>Strictness</span>
                </div>
                <div className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-white shadow-sm backdrop-blur">
                  {formData.strictness}/10
                </div>
                <button type="button" className="neu-button px-4 py-2 text-sm" onClick={resetAll}>
                  Reset all
                </button>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Curriculum</label>
                    <select
                      name="curriculum"
                      value={formData.curriculum}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#071126] p-3 text-white shadow-inner outline-none transition focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Select curriculum</option>
                      {curriculumOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#071126] p-3 text-white shadow-inner outline-none transition focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Select subject</option>
                      {subjectOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Grade</label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-[#071126] p-3 text-white shadow-inner outline-none transition focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Select grade</option>
                      {gradeOptions.map((opt) => <option key={opt} value={opt}>Grade {opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Marks (out of)</label>
                    <input
                      type="number"
                      min={1}
                      name="marks"
                      value={formData.marks}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className="w-full rounded-2xl border border-white/10 bg-[#071126] p-3 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-white/80">Question Segment</label>
                    <button type="button" className="text-xs text-sky-300 hover:text-sky-200" onClick={() => fileInputQuestionRef.current?.click()}>
                      Upload images
                    </button>
                  </div>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    onPaste={(e) => handlePaste(e, "question")}
                    placeholder="Paste or type the question here..."
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-[#071126] p-3 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:ring-2 focus:ring-sky-500"
                  />

                  <input
                    ref={fileInputQuestionRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, "question")}
                    className="hidden"
                  />

                  <AnimatePresence>
                    {showImages && questionImages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-3 flex flex-wrap gap-3"
                      >
                        {questionImages.map((img) => (
                          <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-lg">
                            <img src={img.src} alt={img.name || "Question upload"} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id, "question")}
                              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-white/80">Student Answer</label>
                    <button type="button" className="text-xs text-sky-300 hover:text-sky-200" onClick={() => fileInputAnswerRef.current?.click()}>
                      Upload images
                    </button>
                  </div>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    onPaste={(e) => handlePaste(e, "answer")}
                    placeholder="Paste or type the student's answer here..."
                    rows={8}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-[#071126] p-3 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:ring-2 focus:ring-sky-500"
                  />

                  <input
                    ref={fileInputAnswerRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, "answer")}
                    className="hidden"
                  />

                  <AnimatePresence>
                    {showImages && answerImages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-3 flex flex-wrap gap-3"
                      >
                        {answerImages.map((img) => (
                          <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-lg">
                            <img src={img.src} alt={img.name || "Answer upload"} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id, "answer")}
                              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">Additional Information</label>
                  <textarea
                    name="additional"
                    value={formData.additional}
                    onChange={handleChange}
                    placeholder="Provide any context, rubric hints, or special instructions..."
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-[#071126] p-3 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">Strictness (1-10)</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        name="strictness"
                        value={formData.strictness}
                        onChange={handleChange}
                        className="rounded-2xl border border-white/10 bg-[#071126] p-3 text-white shadow-inner outline-none transition focus:ring-2 focus:ring-sky-500"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                          <option key={v} value={String(v)}>{v}</option>
                        ))}
                      </select>
                      <div className="text-sm text-white/55">Higher values make the AI harsher and more detail-focused.</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 md:justify-end">
                    <motion.button
                      type="button"
                      onClick={() => setShowImages((s) => !s)}
                      className="neu-button inline-flex items-center gap-2 rounded-2xl px-4 py-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ImageIcon size={16} />
                      <span>{showImages ? "Hide images" : "Show images"}</span>
                    </motion.button>

                    <motion.button
                      type="submit"
                      className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-2xl shadow-sky-950/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      disabled={!canSubmit}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                      <span>{loading ? "Reviewing..." : "Submit for Review"}</span>
                    </motion.button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                    {error}
                  </div>
                )}
              </form>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white md:text-xl">
                    <MessageSquareQuote size={18} /> AI Review
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <ClipboardCheck size={14} />
                    <span>{submitCount} submissions</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[rgba(3,24,39,0.88)] p-5 shadow-inner backdrop-blur-xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/50">
                    <Badge><Sliders size={12} /> Strict {formData.strictness}/10</Badge>
                    {lastSubmittedAt && <Badge><CheckCircle2 size={12} /> Updated {lastSubmittedAt}</Badge>}
                    <Badge>{responseWordCount} words</Badge>
                    {savedPost && <Badge><Sparkles size={12} /> Saved post</Badge>}
                  </div>

                  <div
                    ref={responseRef}
                    className="max-h-[42rem] overflow-y-auto rounded-2xl border border-white/10 bg-[#07182a] p-4 text-sky-100 shadow-lg"
                    style={{ minHeight: 280 }}
                  >
                    <AnimatePresence mode="wait">
                      {response ? (
                        <motion.div
                          key="response"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.28 }}
                          className="space-y-4"
                        >
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{
                            p: ({ children }) => <p className="leading-relaxed text-sky-100/95">{children}</p>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold text-white">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-semibold text-white">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-semibold text-white">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc space-y-2 pl-5 text-sky-100/95">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5 text-sky-100/95">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-sky-400/50 pl-4 italic text-sky-100/85">{children}</blockquote>,
                            code: ({ inline, children }) => inline ? (
                              <code className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-white">{children}</code>
                            ) : (
                              <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-white shadow-inner"><code>{children}</code></pre>
                            ),
                          }}>
                            {response}
                          </ReactMarkdown>

                          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                            <button onClick={handleCopy} className="neu-button inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm">
                              <Copy size={14} /> {copied ? "Copied" : "Copy Review"}
                            </button>
                            <button onClick={handleDownload} className="neu-button inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm">
                              <Download size={14} /> Download
                            </button>
                            <button onClick={() => setShowRaw((s) => !s)} className="neu-button px-3 py-2 text-sm">
                              {showRaw ? "Hide raw" : "Show raw"}
                            </button>
                            <div className="ml-auto text-sm text-white/50">Stored review is posted automatically</div>
                          </div>

                          <AnimatePresence>
                            {showRaw && (
                              <motion.pre
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/85"
                              >
                                {response}
                              </motion.pre>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[18rem] items-center justify-center text-center">
                          <div>
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80">
                              <Sparkles size={20} />
                            </div>
                            <div className="text-base font-medium text-white/80">Your AI feedback will appear here.</div>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/55">
                              Add a question and answer, choose a strictness level, and submit for teacher-style review.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </NeumorphicCard>
        </motion.div>
      </PageSection>
    </>
  );
}
