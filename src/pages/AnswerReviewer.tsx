import { Helmet } from "react-helmet-async";
import React, { useEffect, useMemo, useRef, useState } from "react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";
import { authFetch } from "@/lib/apiAuth";
import { setChatHandoff, saveStudyArtifact, consumeArtifactRestore, localSaveMessage } from "@/lib/userContent";
import { toast } from "@/hooks/use-toast";
import { recordStudySession } from "@/lib/studyStats";
import { recordLoopStep } from "@/lib/studyLoopTracker";
import { logStudyActivity } from "@/lib/studyActivity";
import { consumeMockReviewHandoff } from "@/lib/examFlow";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  boardToApiLabel,
  getGradesForBoard,
  getSubjectsForBoard,
  BOARD_CONFIGS,
  EXAM_BOARDS,
} from "@/lib/curriculum";
import type { ExamBoard } from "@/types/curriculum";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { enrichMathInText } from "@/lib/mathText";
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

  if (data.blocked === true && typeof data.safe_text === "string") {
    return data.safe_text;
  }

  return (
    data.safe_text ??
    data.output ??
    data.passOutput?.safe_text ??
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<ExamBoard | "">("");
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
  const [examImportNote, setExamImportNote] = useState<string | null>(null);
  const responseRef = useRef<HTMLDivElement | null>(null);
  const fileInputQuestionRef = useRef<HTMLInputElement | null>(null);
  const fileInputAnswerRef = useRef<HTMLInputElement | null>(null);

  const gradeNum = formData.grade ? parseInt(formData.grade, 10) : null;
  const subjectOptions = useMemo(
    () => (board ? getSubjectsForBoard(board, gradeNum) : []),
    [board, gradeNum],
  );
  const gradeOptions = useMemo(
    () => (board ? getGradesForBoard(board).map(String) : []),
    [board],
  );

  useEffect(() => {
    const pref = user?.user_metadata;
    if (!pref) return;
    const rawBoard = pref.board ?? (pref.preferences as Record<string, unknown> | undefined)?.board;
    if (typeof rawBoard === "string" && EXAM_BOARDS.includes(rawBoard as ExamBoard)) {
      const b = rawBoard as ExamBoard;
      setBoard(b);
      setFormData((prev) => ({ ...prev, curriculum: boardToApiLabel(b) }));
    }
    const rawGrade = pref.grade ?? (pref.preferences as Record<string, unknown> | undefined)?.grade;
    if (rawGrade) setFormData((prev) => ({ ...prev, grade: String(rawGrade) }));
    const rawSubjects = pref.subjects ?? (pref.preferences as Record<string, unknown> | undefined)?.subjects;
    if (Array.isArray(rawSubjects) && rawSubjects[0]) {
      setFormData((prev) => ({ ...prev, subject: String(rawSubjects[0]) }));
    }
  }, [user]);

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    const topicParam = searchParams.get("topic");
    if (!subjectParam && !topicParam) return;
    setFormData((prev) => ({
      ...prev,
      subject: subjectParam || prev.subject,
      question: topicParam
        ? prev.question || `Review my understanding of: ${topicParam}`
        : prev.question,
      additional: topicParam
        ? prev.additional || `Adaptive focus topic: ${topicParam}`
        : prev.additional,
    }));
  }, [searchParams]);

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

  useEffect(() => {
    const restored = consumeArtifactRestore();
    if (restored?.kind === "review") {
      const payload = restored.payload;
      const reviewText = typeof payload.review === "string" ? payload.review : "";
      const metadata = (payload.metadata ?? {}) as Record<string, string>;
      if (reviewText) setResponse(reviewText);
      setFormData((prev) => ({
        ...prev,
        curriculum: metadata.curriculum || prev.curriculum,
        subject: metadata.subject || prev.subject,
        question: metadata.question || prev.question,
        answer: metadata.answer || prev.answer,
      }));
      setExamImportNote("Saved review restored — you can re-run or discuss in chat.");
      return;
    }

    const handoff = consumeMockReviewHandoff();
    if (handoff?.questions?.length) {
      const questionText = handoff.questions
        .map((q, i) => `${i + 1}. ${q.question}`)
        .join("\n\n");
      setFormData((prev) => ({
        ...prev,
        curriculum: handoff.boardLabel ?? prev.curriculum,
        subject: handoff.subject || prev.subject,
        grade: handoff.grade ? String(handoff.grade) : prev.grade,
        question: `Mock exam: ${handoff.paperTitle || "Practice paper"}\n\n${questionText}`,
        additional: "Imported from Paper Maker mock exam.",
      }));
      if (handoff.board) setBoard(handoff.board);
      setExamImportNote("Mock paper imported — add your answers and submit for rubric feedback.");
      return;
    }

    const raw = sessionStorage.getItem("vertex_exam_answers");
    if (!raw) return;
    sessionStorage.removeItem("vertex_exam_answers");
    try {
      const data = JSON.parse(raw) as {
        paperTitle?: string;
        questions?: { id?: string; question?: string }[];
        answers?: Record<string, string>;
        rubricNotes?: string[];
      };
      const questions = data.questions ?? [];
      const questionText = questions
        .map((q, i) => `${i + 1}. ${q.question || "Question"}`)
        .join("\n\n");
      const answerText = questions
        .map((q, i) => {
          const id = q.id ?? String(i);
          const answer = data.answers?.[id]?.trim();
          return `Answer ${i + 1}:\n${answer || "[No answer written]"}`;
        })
        .join("\n\n");
      setFormData((prev) => ({
        ...prev,
        question: `Mock exam: ${data.paperTitle || "Practice paper"}\n\n${questionText}`,
        answer: answerText,
        additional: [
          "Imported from timed mock exam in Paper Maker.",
          data.rubricNotes?.length
            ? `\nMark scheme notes:\n${data.rubricNotes.map((n) => `• ${n}`).join("\n")}`
            : "",
        ].join(""),
      }));
      setExamImportNote("Mock exam answers imported — run a review when you're ready.");
    } catch {
      setError("Could not import mock exam answers.");
    }
  }, []);

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
          const title = `${formData.curriculum || "Review"} ${formData.subject || ""}`.trim() || "Answer review";
          const saved = await saveStudyArtifact("review", title, {
            review: out,
            metadata: {
              curriculum: formData.curriculum,
              subject: formData.subject,
              grade: formData.grade,
              marks: formData.marks,
              strictness: formData.strictness,
              question: formData.question,
              answer: formData.answer,
            },
          });
          if (saved.ok) {
            setSavedPost(true);
            recordStudySession();
            recordLoopStep("review");
            logStudyActivity(`Reviewed ${formData.subject || "answer"} with AI feedback`);
            const localMsg = localSaveMessage(saved);
            if (localMsg) {
              toast({
                title: "Saved on this device",
                description: localMsg,
              });
            } else {
              toast({
                title: "Review saved",
                description: "Your feedback is stored in your account.",
              });
            }
          }
        }
      } catch (err) {
        console.warn("Failed to save review:", err);
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
    <span className="glass-badge">
      {children}
    </span>
  );

  const fieldClass = "form-control";
  const selectClass = "form-control-select";
  const textareaClass = "form-textarea";

  return (
    <>
      <Helmet>
        <title>Answer Reviewer — VertexED</title>
        <meta name="description" content="Submit handwritten or typed answers for mark-scheme feedback — structure, command terms, evidence, and what to rewrite before the next attempt." />
      </Helmet>

      <PageSection>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <NeumorphicCard className="relative mx-auto max-w-7xl overflow-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_30%),radial-gradient(circle_at_80%_10%,hsl(var(--accent)/0.08),transparent_26%)]" />

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <motion.div whileHover={{ scale: 1.06, rotate: 3 }} className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-3 text-primary-foreground shadow-lg shadow-primary/20">
                  <FileText size={22} />
                </motion.div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Answer Reviewer</h1>
                    <Badge><Shield size={12} /> Teacher-style</Badge>
                    <Badge><Sparkles size={12} /> Strict feedback</Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Paste the question and your answer — typed or from a photo. Feedback names marks earned and lost,
                    flags command-term gaps, and suggests what to change before you retry. Adjust strictness to match your board.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="hidden items-center gap-2 text-muted-foreground sm:flex">
                  <Sliders size={14} />
                  <span>Strictness</span>
                </div>
                <div className="rounded-full border border-border/60 bg-foreground/[0.04] px-4 py-2 text-foreground shadow-sm backdrop-blur-sm tabular-nums">
                  {formData.strictness}/10
                </div>
                <button type="button" className="neu-button px-4 py-2 text-sm" onClick={resetAll}>
                  Reset all
                </button>
              </div>
            </div>

            {examImportNote && (
              <div className="alert-success mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{examImportNote}</span>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="form-label">Curriculum</label>
                    <select
                      name="curriculum"
                      value={board}
                      onChange={(e) => {
                        const next = e.target.value as ExamBoard | "";
                        setBoard(next);
                        setFormData((prev) => ({
                          ...prev,
                          curriculum: next ? boardToApiLabel(next) : "",
                          subject: "",
                          grade: "",
                        }));
                      }}
                      className={selectClass}
                    >
                      <option value="">Select curriculum</option>
                      {EXAM_BOARDS.map((b) => (
                        <option key={b} value={b}>{BOARD_CONFIGS[b].label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="">Select subject</option>
                      {subjectOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="form-label">Grade</label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="">Select grade</option>
                      {gradeOptions.map((opt) => <option key={opt} value={opt}>Grade {opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Marks (out of)</label>
                    <input
                      type="number"
                      min={1}
                      name="marks"
                      value={formData.marks}
                      onChange={handleChange}
                      placeholder="e.g. 10"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="form-label mb-0">Question Segment</label>
                    <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors" onClick={() => fileInputQuestionRef.current?.click()}>
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
                    className={textareaClass}
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
                          <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-lg">
                            <img src={img.src} alt={img.name || "Question upload"} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id, "question")}
                              className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label="Remove image"
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
                    <label className="form-label mb-0">Student Answer</label>
                    <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors" onClick={() => fileInputAnswerRef.current?.click()}>
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
                    className={textareaClass}
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
                          <div key={img.id} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-lg">
                            <img src={img.src} alt={img.name || "Answer upload"} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(img.id, "answer")}
                              className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-foreground opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label="Remove image"
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
                  <label className="form-label">Additional Information</label>
                  <textarea
                    name="additional"
                    value={formData.additional}
                    onChange={handleChange}
                    placeholder="Provide any context, rubric hints, or special instructions..."
                    rows={3}
                    className={textareaClass}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div>
                    <label className="form-label">Strictness (1-10)</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        name="strictness"
                        value={formData.strictness}
                        onChange={handleChange}
                        className={selectClass}
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                          <option key={v} value={String(v)}>{v}</option>
                        ))}
                      </select>
                      <div className="text-sm text-muted-foreground">Higher = tougher grading and more detail in the feedback.</div>
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
                      className="btn-solid inline-flex items-center gap-3 rounded-2xl px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <div className="alert-error" role="alert">
                    {error}
                  </div>
                )}
              </form>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground md:text-xl">
                    <MessageSquareQuote size={18} /> AI Review
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ClipboardCheck size={14} />
                    <span>{submitCount} submissions</span>
                  </div>
                </div>

                <div className="review-panel">
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge><Sliders size={12} /> Strict {formData.strictness}/10</Badge>
                    {lastSubmittedAt && <Badge><CheckCircle2 size={12} /> Updated {lastSubmittedAt}</Badge>}
                    <Badge>{responseWordCount} words</Badge>
                    {savedPost && <Badge><Sparkles size={12} /> Saved post</Badge>}
                  </div>

                  <div
                    ref={responseRef}
                    className="review-output"
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
                            p: ({ children }) => <p className="leading-relaxed text-muted-foreground">{children}</p>,
                            h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc space-y-2 pl-5 text-muted-foreground">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 pl-4 italic text-foreground/90">{children}</blockquote>,
                            code: ({ inline, children }) => inline ? (
                              <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-[0.9em] text-foreground">{children}</code>
                            ) : (
                              <pre className="overflow-auto rounded-2xl bg-muted p-4 text-foreground shadow-inner"><code>{children}</code></pre>
                            ),
                          }}>
                            {enrichMathInText(response)}
                          </ReactMarkdown>

                          <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-4">
                            <button onClick={handleCopy} className="neu-button inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm">
                              <Copy size={14} /> {copied ? "Copied" : "Copy Review"}
                            </button>
                            <button onClick={handleDownload} className="neu-button inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm">
                              <Download size={14} /> Download
                            </button>
                            <button
                              type="button"
                              className="neu-button inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm bg-primary/15 border-primary/25"
                              onClick={() => {
                                setChatHandoff({
                                  source: "answer-reviewer",
                                  subject: formData.subject,
                                  question: formData.question,
                                  answer: formData.answer,
                                  feedback: response.slice(0, 2000),
                                });
                                navigate("/chatbot");
                              }}
                            >
                              <MessageSquareQuote size={14} /> Discuss with Apex
                            </button>
                            <button onClick={() => setShowRaw((s) => !s)} className="neu-button px-3 py-2 text-sm">
                              {showRaw ? "Hide raw" : "Show raw"}
                            </button>
                            <div className="ml-auto text-sm text-muted-foreground">Stored review is posted automatically</div>
                          </div>

                          <AnimatePresence>
                            {showRaw && (
                              <motion.pre
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="overflow-auto rounded-2xl border border-border/60 bg-muted/50 p-4 text-xs text-muted-foreground"
                              >
                                {response}
                              </motion.pre>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[18rem] items-center justify-center text-center">
                          <div>
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-foreground/[0.04] text-muted-foreground">
                              <Sparkles size={20} />
                            </div>
                            <div className="text-base font-medium text-foreground">Your AI feedback will appear here.</div>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                              Add your question and answer, choose how strict you want the feedback, and hit submit.
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
