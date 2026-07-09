import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";
import { authFetch, getAccessToken } from "@/lib/apiAuth";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  cardsFromFlashcards,
  dueCards,
  rateCard,
  type SrCard,
  type SrRating,
} from "@/lib/spacedRepetition";
import { recordStudySession } from "@/lib/studyStats";
import { saveStudyArtifact, consumeArtifactRestore } from "@/lib/userContent";
import { toast } from "@/hooks/use-toast";
import {
  FileText,
  Edit3,
  Copy,
  DownloadCloud,
  UploadCloud,
  Eye,
  ArrowLeft,
  Mic,
  StopCircle,
  ChevronsLeft,
  ChevronsRight,
  BarChart2,
  CheckCircle,
  X,
  RotateCcw,
  Sparkles,
  Wand2,
  Play,
  Save,
  ChevronDown,
  Trash2,
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Flashcard = {
  front: string;
  back: string;
};

type QuizQuestion = {
  id: string | number;
  type: "multiple_choice" | "frq" | "interactive" | string;
  prompt?: string;
  question?: string;
  choices?: string[];
  options?: string[];
  answer?: any;
  expected?: any;
  maxScore?: number;
};

type QuizResult = {
  id: string | number;
  selected?: any;
  correctAnswer?: any;
  score?: number;
  maxScore?: number;
  feedback?: string;
  includes?: string;
  isCorrect?: boolean;
  type?: string;
};

const NOTE_FORMATS = [
  "Quick Notes",
  "Cornell Notes",
  "Research Oriented",
  "Detailed Overview",
  "Bullet points/Summary",
  "Mapping",
  "Custom",
] as const;

const QUIZ_TYPES = [
  "Adaptive Learning",
  "Knowledge Application Based",
  "Fundamental Oriented",
  "Exam Oriented",
] as const;

const QUIZ_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
const FRQ_LENGTHS = [
  { value: "short", label: "Short FRQ" },
  { value: "medium", label: "Long FRQ" },
  { value: "long", label: "Mixed / MCQ-heavy" },
] as const;

const MAX_HISTORY = 50;
const MAX_RECORDED_SECONDS = 3600;

const isTruthyString = (value: unknown) => typeof value === "string" && value.trim().length > 0;

const safeText = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
};

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const fmtTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const markdownComponents = {
  table: ({ children }: any) => (
    <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-950/40">
      <table className="min-w-full border-collapse text-sm text-white">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-white/5">{children}</thead>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => <tr className="border-b border-white/10 last:border-b-0">{children}</tr>,
  th: ({ children }: any) => <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-white/85">{children}</th>,
  td: ({ children }: any) => <td className="px-3 py-2 align-top text-white/90">{children}</td>,
  pre: ({ children }: any) => <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-white shadow-inner">{children}</pre>,
  code: ({ className, children }: any) => (
    <code className={`rounded-md bg-white/10 px-1.5 py-0.5 text-[0.85em] text-white ${className || ""}`}>{children}</code>
  ),
  p: ({ children }: any) => <p className="leading-relaxed text-white/95">{children}</p>,
};

function getApiError(err: unknown) {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export default function NotetakerQuiz(): JSX.Element {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<(typeof NOTE_FORMATS)[number]>("Quick Notes");
  const [customFormatText, setCustomFormatText] = useState("");
  const [notes, setNotes] = useState("");
  const [notesLength, setNotesLength] = useState<"short" | "medium" | "long">("medium");
  const [flashCount, setFlashCount] = useState(8);
  const [quizType, setQuizType] = useState<(typeof QUIZ_TYPES)[number]>("Adaptive Learning");
  const [quizDifficulty, setQuizDifficulty] = useState<(typeof QUIZ_DIFFICULTIES)[number]>("Medium");
  const [frqLength, setFrqLength] = useState<"short" | "medium" | "long">("short");
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[] | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef<number | null>(null);
  const [notesHistory, setNotesHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDirty, setIsDirty] = useState(false);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState(false);
  const [flashFullscreen, setFlashFullscreen] = useState(false);
  const [studyModeOpen, setStudyModeOpen] = useState(false);
  const [studyRevealed, setStudyRevealed] = useState(false);
  const [studyQueue, setStudyQueue] = useState<SrCard[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [srDeck, setSrDeck] = useLocalStorage<SrCard[]>("vertex_sr_deck", []);
  const [hideNotesArea, setHideNotesArea] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const autosaveTimer = useRef<number | null>(null);
  const [gradingLeniency, setGradingLeniency] = useState(3);
  const [examStyle, setExamStyle] = useState("Generic");
  const [mounted, setMounted] = useState(false);
  const [quizHistory, setQuizHistory] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [recording, setRecording] = useState(false);
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [mcqOptionCount, setMcqOptionCount] = useState<number>(4);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<number | null>(null);
  const [targetMin, setTargetMin] = useState<number>(70);
  const [targetMax, setTargetMax] = useState<number>(90);
  const [showQuizPanel, setShowQuizPanel] = useState(true);
  const [showFlashPanel, setShowFlashPanel] = useState(true);
  const [showAudioPanel, setShowAudioPanel] = useState(true);
  const [showProgressPanel, setShowProgressPanel] = useState(true);
  const [notesCollapsedMobile, setNotesCollapsedMobile] = useState(false);

  const displayFormatLabel = format === "Custom" ? (customFormatText.trim() || "Custom") : format;

  useEffect(() => {
    setMounted(true);
    const restored = consumeArtifactRestore();
    if (restored?.kind === "note") {
      const payload = restored.payload;
      if (typeof payload.notes === "string") setNotes(payload.notes);
      if (Array.isArray(payload.flashcards)) {
        setFlashcards(payload.flashcards as Flashcard[]);
      }
      if (restored.title) setTopic(restored.title);
      toast({ title: "Notes restored", description: "Your saved notes are ready to study." });
    }
    timerRef.current = window.setInterval(() => setTimeSpent((t) => t + 1), 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
      if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
      stopVisualizer();
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => {
      pushNotesSnapshot(notes);
    }, 1800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, isDirty]);

  useEffect(() => {
    if (!flashcards.length) {
      setCurrentFlashIndex(0);
      setFlashRevealed(false);
      return;
    }
    if (currentFlashIndex >= flashcards.length) setCurrentFlashIndex(0);
  }, [flashcards, currentFlashIndex]);

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;

    try {
      analyserRef.current?.disconnect();
    } catch {}
    analyserRef.current = null;

    try {
      audioCtxRef.current?.close();
    } catch {}
    audioCtxRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const pushNotesSnapshot = (snapshot: string = notes) => {
    setNotesHistory((h) => {
      const next = h.slice(0, Math.max(historyIndex + 1, 0));
      if (next[next.length - 1] !== snapshot) next.push(snapshot);
      return next.slice(-MAX_HISTORY);
    });
    setHistoryIndex((i) => Math.min((i < 0 ? 0 : i + 1), MAX_HISTORY - 1));
    setIsDirty(false);
  };

  const undoNotes = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setNotes(notesHistory[newIndex] ?? "");
    setIsDirty(false);
  };

  const redoNotes = () => {
    if (historyIndex >= notesHistory.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setNotes(notesHistory[newIndex] ?? "");
    setIsDirty(false);
  };

  const handleNotesBlur = () => {
    if (isDirty) pushNotesSnapshot(notes);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setIsDirty(true);
  };

  const insertAtCursor = (text: string) => {
    const ta = notesRef.current;
    if (!ta) {
      setNotes((n) => (n ? `${n}\n\n${text}` : text));
      setIsDirty(true);
      return;
    }

    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const before = notes.slice(0, start);
    const after = notes.slice(end);
    const newNotes = `${before}${text}${after}`;
    setNotes(newNotes);
    setIsDirty(true);
    requestAnimationFrame(() => {
      try {
        ta.focus();
        const pos = start + text.length;
        ta.setSelectionRange(pos, pos);
      } catch {}
    });
  };

  const exportToWord = async (notesText: string, cards: Flashcard[]) => {
    try {
      const children: Paragraph[] = [
        new Paragraph({ children: [new TextRun({ text: "Study Notes", bold: true, size: 28 })] }),
        new Paragraph(notesText || "No notes available."),
      ];

      if (cards.length) {
        children.push(new Paragraph({ children: [new TextRun({ text: "Flashcards", bold: true, size: 24 })] }));
        cards.forEach((f, i) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `Q${i + 1}: `, bold: true }),
                new TextRun({ text: safeText(f.front) }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "A: ", bold: true }),
                new TextRun({ text: safeText(f.back) }),
              ],
            })
          );
        });
      }

      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "vertexed-notes.docx");
    } catch (err) {
      console.error("Word export failed", err);
      alert("Word export failed");
    }
  };

  const exportToPDF = async (elementId: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        alert("Nothing to export");
        return;
      }

      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: null });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeightMm <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightMm);
        pdf.save("vertexed-notes.pdf");
        return;
      }

      const pxPerMm = canvas.height / imgHeightMm;
      const pageHeightPx = Math.floor(pdfHeight * pxPerMm);
      let yPosPx = 0;

      while (yPosPx < canvas.height) {
        const sliceHeight = Math.min(pageHeightPx, canvas.height - yPosPx);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const ctx = pageCanvas.getContext("2d");
        if (!ctx) break;

        ctx.drawImage(canvas, 0, yPosPx, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        const pageImg = pageCanvas.toDataURL("image/png");
        const pageImgHeightMm = (sliceHeight * pdfWidth) / canvas.width;
        pdf.addImage(pageImg, "PNG", 0, 0, pdfWidth, pageImgHeightMm);
        yPosPx += sliceHeight;
        if (yPosPx < canvas.height) pdf.addPage();
      }

      pdf.save("vertexed-notes.pdf");
    } catch (err) {
      console.error("PDF export failed", err);
      alert("PDF export failed");
    }
  };

  const generateNotesPayload = () => ({
    topic,
    format: displayFormatLabel,
    length: notesLength,
    flashCount,
    additionalInfo: additionalInfo.trim(),
  });

  const handleGenerateNotes = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateNotesPayload()),
      });

      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const plainNotes = safeText(data?.result).trim();
      const prefix = notes.trim();
      const divider = prefix
        ? `\n\n---\n\n### AI-generated Notes (${displayFormatLabel})\n\n`
        : "";
      const nextNotes = `${prefix}${divider}${plainNotes}`.trim();

      setNotes(nextNotes);
      setFlashcards(Array.isArray(data?.flashcards) ? data.flashcards.slice(0, flashCount) : []);
      setCurrentFlashIndex(0);
      setGeneratedQuestions([]);
      setUserAnswers({});
      setQuizSubmitted(false);
      setQuizResults(null);
      setFlashRevealed(false);
      pushNotesSnapshot(nextNotes);
      recordStudySession();
      void saveStudyArtifact("note", topic.trim(), {
        notes: nextNotes,
        format: displayFormatLabel,
        flashcards: data?.flashcards ?? [],
      }).then((r) => {
        if (r.ok) {
          toast({
            title: r.localOnly ? "Saved on this device" : "Notes saved",
            description: r.localOnly
              ? "Cloud sync pending — your notes are stored locally for now."
              : "Your notes are stored in your account.",
          });
        } else if (r.error) {
          toast({
            title: "Save failed",
            description: r.error,
            variant: "destructive",
          });
        }
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!notes.trim()) {
      alert("Please generate or write notes first");
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          notes,
          quizType,
          difficulty: quizDifficulty,
          frqLength,
          gradingLeniency,
          examStyle,
          mcqOptionCount,
        }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const questions = Array.isArray(data.questions) ? data.questions : [];
      setGeneratedQuestions(questions);
      setUserAnswers({});
      setQuizSubmitted(false);
      setQuizResults(null);
    } catch (err) {
      console.error(err);
      alert("Failed to generate quiz. Please try again.");
      setGeneratedQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!generatedQuestions.length) return;

    const localResults: QuizResult[] = generatedQuestions.map((q) => {
      const id = q.id;
      const user = userAnswers[id] ?? "";
      if (q.type === "multiple_choice") {
        const correct = q.answer ?? q.expected;
        const isCorrect = String(user) === String(correct);
        return {
          id,
          selected: user,
          correctAnswer: correct,
          isCorrect,
          score: isCorrect ? (q.maxScore ?? 2) : 0,
          maxScore: q.maxScore ?? 2,
          type: q.type,
        };
      }
      return {
        id,
        selected: user,
        correctAnswer: q.answer ?? q.expected ?? "",
        type: q.type,
      };
    });

    const requiresAI = generatedQuestions.some((q) => q.type === "frq" || q.type === "interactive");
    if (!requiresAI) {
      setQuizResults(localResults);
      setQuizSubmitted(true);
      const totalScore = localResults.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
      const totalMax = localResults.reduce((sum, r) => sum + (Number(r.maxScore) || 0), 0);
      if (totalMax > 0) setQuizHistory((h) => [...h, Math.round((totalScore / totalMax) * 100)]);
      return;
    }

    setLoading(true);
    try {
      const gradeRes = await authFetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          questions: generatedQuestions,
          userAnswers,
          gradingLeniency,
          examStyle,
        }),
      });

      if (!gradeRes.ok) throw new Error(`Grade failed: ${gradeRes.status}`);
      const gradeData = await gradeRes.json();
      const grades = Array.isArray(gradeData?.grades) ? gradeData.grades : [];

      const merged = localResults.map((r) => {
        const g = grades.find((x: any) => x.id === r.id);
        if (!g) return r;
        const maxScore = g.maxScore ?? g.max_points ?? r.maxScore ?? 2;
        const score = typeof g.score === "number" ? g.score : 0;
        return {
          ...r,
          score,
          maxScore,
          feedback: g.feedback,
          includes: g.includes || g.whatIncluded || "",
          isCorrect: score >= Math.max(0.1, (gradingLeniency / 5) * maxScore * 0.5),
        };
      });

      setQuizResults(merged);
      setQuizSubmitted(true);
      const totalScore = merged.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
      const totalMax = merged.reduce((sum, r) => sum + (Number(r.maxScore) || 0), 0);
      if (totalMax > 0) setQuizHistory((h) => [...h, Math.round((totalScore / totalMax) * 100)]);
    } catch (err) {
      console.error("Grading failed:", err);
      alert("Failed to grade FRQ. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopyToastVisible(true);
      window.setTimeout(() => setCopyToastVisible(false), 1800);
    } catch (err) {
      console.error("Clipboard failed:", err);
      alert("Failed to copy to clipboard.");
    }
  };

  const toggleTimer = () => setShowTimer((s) => !s);
  const nextFlash = () => {
    if (!flashcards.length) return;
    setFlashRevealed(false);
    setCurrentFlashIndex((i) => (i + 1) % flashcards.length);
  };
  const prevFlash = () => {
    if (!flashcards.length) return;
    setFlashRevealed(false);
    setCurrentFlashIndex((i) => (i - 1 + flashcards.length) % flashcards.length);
  };
  const revealFlash = () => setFlashRevealed(true);
  const handleFlashClick = (i: number) => {
    setCurrentFlashIndex(i);
    setFlashRevealed(false);
  };

  useEffect(() => {
    if (!flashcards.length) return;
    const deckId = topic.trim() || "default";
    setSrDeck((prev) => {
      if (
        prev.length === flashcards.length &&
        prev.every((c, i) => c.front === flashcards[i]?.front && c.back === flashcards[i]?.back)
      ) {
        return prev;
      }
      return cardsFromFlashcards(flashcards, deckId);
    });
  }, [flashcards, topic, setSrDeck]);

  const dueCount = useMemo(() => dueCards(srDeck).length, [srDeck]);

  const startStudyMode = () => {
    const due = dueCards(srDeck);
    const queue = due.length ? due : srDeck;
    if (!queue.length) return;
    setStudyQueue(queue);
    setStudyIndex(0);
    setStudyRevealed(false);
    setStudyModeOpen(true);
    recordStudySession();
  };

  const rateStudyCard = (rating: SrRating) => {
    const current = studyQueue[studyIndex];
    if (!current) return;
    const updated = rateCard(current, rating);
    setSrDeck((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (studyIndex + 1 >= studyQueue.length) {
      setStudyModeOpen(false);
      setStudyQueue([]);
      return;
    }
    setStudyIndex((i) => i + 1);
    setStudyRevealed(false);
  };

  const startVisualizer = (stream: MediaStream) => {
    stopVisualizer();
    mediaStreamRef.current = stream;

    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx: AudioContext = new AudioContextClass();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    source.connect(analyser);

    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(dataArray);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "#60a5fa";
      canvasCtx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128;
        const y = (v * canvas.height) / 2;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
  };

  const applyTranscriptionResult = (json: Record<string, unknown>) => {
    const text = safeText(json.notes || json.transcription || json.summary).trim();
    if (!text) return;

    const time = new Date().toLocaleString();
    const insertText = `\n\n---\n\n[Audio recorded ${time}]\n\n${text}\n\n`;
    setNotes((prev) => {
      const next = prev ? `${prev}${insertText}` : insertText;
      pushNotesSnapshot(next);
      return next;
    });

    if (Array.isArray(json.flashcards) && json.flashcards.length) {
      setFlashcards((prev) => {
        const incoming = (json.flashcards as Flashcard[]).slice(0, flashCount);
        const merged = [...incoming, ...prev];
        return merged.slice(0, Math.max(flashCount, prev.length));
      });
    }
    setIsDirty(true);
  };

  const uploadAudioBlob = async (blob: Blob) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, `recording_${Date.now()}.webm`);
      fd.append("createCards", "true");
      fd.append("createNotes", "true");
      fd.append("noteFormat", displayFormatLabel);
      fd.append("length", notesLength);
      fd.append("flashCount", String(flashCount));

      const token = await getAccessToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const r = await fetch("/api/transcribe", { method: "POST", headers, body: fd });
      if (!r.ok) {
        console.error("Transcribe upload failed", await r.text().catch(() => ""));
        alert("Upload failed. You can still download the audio locally.");
        return;
      }

      const json = await r.json();
      applyTranscriptionResult(json);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      setRecording(true);
      setRecordingSeconds(0);

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data?.size) audioChunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        setRecording(false);
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setLastAudioBlob(blob);

        const oldUrl = audioURL;
        const url = URL.createObjectURL(blob);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        setAudioURL(url);

        try {
          await uploadAudioBlob(blob);
        } finally {
          mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
      };

      recorder.start();
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_RECORDED_SECONDS) {
            try {
              mediaRecorderRef.current?.stop();
            } catch {}
            alert("Maximum recording time reached (1 hour). Recording stopped automatically.");
            return MAX_RECORDED_SECONDS;
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error("Audio start failed", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    setRecording(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    try {
      audioCtxRef.current?.suspend();
    } catch {}

    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingSeconds(0);
  };

  const downloadAudio = () => {
    if (!lastAudioBlob) {
      alert("No audio recorded");
      return;
    }
    const url = URL.createObjectURL(lastAudioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording_${Date.now()}.webm`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const sendNotesToCards = async (count = 6) => {
    if (!notes.trim()) {
      alert("No notes available to convert.");
      return;
    }

    try {
      const res = await authFetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "flashcards",
          source: "notes",
          text: notes,
          flashCount: count,
        }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.flashcards)) throw new Error("Invalid flashcard response");

      setFlashcards(data.flashcards.slice(0, count));
      setCurrentFlashIndex(0);
      pushNotesSnapshot(notes);
      alert("Flashcards generated successfully.");
    } catch (err) {
      console.error("sendNotesToCards error:", err);
      alert("Failed to generate flashcards.");
    }
  };

  const totalQuestions = generatedQuestions.length;
  const answeredCount = generatedQuestions.filter((q) => isTruthyString(userAnswers[q.id])).length;
  const notesWordCount = wordCount(notes);

  const accuracy = useMemo(() => {
    if (!quizSubmitted || !quizResults?.length) return null;
    const totalScore = quizResults.reduce((sum, r) => sum + (Number(r.score) || 0), 0);
    const totalMax = quizResults.reduce((sum, r) => sum + (Number(r.maxScore) || 0), 0);
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
  }, [quizSubmitted, quizResults]);

  const recordingTimeDisplay = useMemo(() => {
    const remaining = Math.max(0, MAX_RECORDED_SECONDS - recordingSeconds);
    return {
      elapsed: fmtTime(recordingSeconds),
      remaining: fmtTime(remaining),
    };
  }, [recordingSeconds]);

  const chartData = useMemo(
    () => ({
      labels: quizHistory.map((_, i) => `S${i + 1}`),
      datasets: [
        {
          label: "Accuracy (%)",
          data: quizHistory,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37,99,235,0.12)",
          fill: true,
          tension: 0.28,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2,
        },
      ],
    }),
    [quizHistory]
  );

  const targetZonePlugin: Plugin<"line", { min: number; max: number }> = useMemo(
    () => ({
      id: "targetZonePlugin",
      beforeDatasetsDraw: (chart, _args, options) => {
        const min = options?.min ?? 0;
        const max = options?.max ?? 100;
        const yScale = chart.scales.y;
        const area = chart.chartArea;
        if (!yScale || !area) return;
        const y1 = yScale.getPixelForValue(max);
        const y2 = yScale.getPixelForValue(min);
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(34,197,94,0.12)";
        ctx.fillRect(area.left, y1, area.right - area.left, y2 - y1);
        ctx.restore();
      },
    }),
    []
  );

  const chartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true, mode: "index", intersect: false },
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, color: "rgba(255,255,255,0.65)" } },
        y: { beginAtZero: true, max: 100, ticks: { stepSize: 10, color: "rgba(255,255,255,0.65)" } },
      },
    }),
    []
  );

  const quizResultsById = useMemo(() => new Map(quizResults?.map((r) => [r.id, r]) ?? []), [quizResults]);

  return (
    <>
      <Helmet>
        <title>AI Notes, Flashcards, and Quizzes — VertexED</title>
        <meta name="description" content="Turn notes into smart summaries, flashcards, quizzes, and audio-assisted study material." />
        <link rel="canonical" href="https://www.vertexed.app/notetaker" />
      </Helmet>

      <PageSection>
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link to="/main" className="neu-button inline-flex items-center gap-2 px-4 py-2 text-sm transition-transform hover:scale-105">
            <ArrowLeft size={16} />
            <span>Back to Main</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button className="neu-button px-3 py-2 text-sm transition-colors" title={showTimer ? "Hide timer" : "Show timer"} onClick={toggleTimer}>
              {showTimer ? "Hide Timer" : "Show Timer"}
            </button>
            {showTimer && <div className="text-sm text-muted-foreground">Time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</div>}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 18 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-8 font-sans"
        >
          <NeumorphicCard className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="mb-2 flex items-center gap-2 text-xl font-medium">
                  <FileText size={18} />
                  Topic and Format
                </h2>
                <div className="text-sm text-muted-foreground">Drop in a topic and we'll turn it into notes, flashcards, and quizzes you can export.</div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="neu-button inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => pushNotesSnapshot(notes)}>
                  <Save size={14} />
                  <span>Save Snapshot</span>
                </button>
                <button className="neu-button inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => setNotesHistory([])}>
                  <Trash2 size={14} />
                  <span>Clear History</span>
                </button>
                <div className="text-sm text-muted-foreground">Autosave: on</div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3 items-end">
              <div className="neu-input">
                <input className="neu-input-el h-11" placeholder="Enter your study topic..." value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>

              <div className="neu-input">
                <select className="neu-input-el h-11" value={format} onChange={(e) => setFormat(e.target.value as any)}>
                  {NOTE_FORMATS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {format === "Custom" && (
                  <div className="mt-2">
                    <input className="neu-input-el h-10 text-sm" placeholder="Describe custom format (max 64 chars)" maxLength={64} value={customFormatText} onChange={(e) => setCustomFormatText(e.target.value)} />
                    <div className="mt-1 text-xs text-muted-foreground">{customFormatText.length}/64</div>
                  </div>
                )}
              </div>

              <div className="neu-input">
                <div className="flex gap-2 items-center">
                  <select className="neu-input-el h-11" value={notesLength} onChange={(e) => setNotesLength(e.target.value as any)}>
                    <option value="short">Short notes</option>
                    <option value="medium">Medium notes</option>
                    <option value="long">Long notes</option>
                  </select>

                  <select className="neu-input-el h-11" value={flashCount} onChange={(e) => setFlashCount(Number(e.target.value))}>
                    {Array.from({ length: 13 }, (_, i) => 4 + i).map((v) => (
                      <option key={v} value={v}>
                        {v} flashcards
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Output length depends on the topic — we'll do our best.</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <button className="neu-button inline-flex items-center gap-2 px-4 py-2" onClick={handleGenerateNotes} disabled={loading}>
                <Wand2 size={16} />
                <span>{loading ? "Generating..." : "Generate Notes"}</span>
              </button>

              <button className="neu-button inline-flex items-center gap-2 px-4 py-2" onClick={handleGenerateQuiz} disabled={loading || !notes.trim()}>
                <Sparkles size={16} />
                <span>{loading ? "..." : "Generate Quiz"}</span>
              </button>

              <button className="neu-button px-4 py-2" onClick={undoNotes} disabled={historyIndex <= 0}>
                Undo
              </button>
              <button className="neu-button px-4 py-2" onClick={redoNotes} disabled={historyIndex >= notesHistory.length - 1}>
                Redo
              </button>

              <button className="neu-button px-4 py-2" onClick={() => setHideNotesArea((s) => !s)}>
                {hideNotesArea ? "Show Notes" : "Hide Notes"}
              </button>

              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <div>
                  Format: <strong>{displayFormatLabel}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">Additional Information (optional)</label>
              <textarea className="neu-input-el mt-2 w-full min-h-20" placeholder="Anything extra for the generator? (focus, equations, exam style, etc.)" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
            </div>
          </NeumorphicCard>

          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: hideNotesArea ? 0.35 : 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`lg:col-span-2 transition-all duration-300 ${hideNotesArea ? "max-h-0 overflow-hidden" : ""}`}
            >
              <NeumorphicCard className="p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xl font-medium">
                    Notes <FileText size={16} />
                  </h2>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm text-muted-foreground">Words: {notesWordCount}</div>

                    <div className="relative">
                      <button className="neu-button inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={copyNotes} title="Copy notes" aria-label="Copy notes">
                        <Copy size={16} />
                        <span>Copy</span>
                      </button>
                      <AnimatePresence>
                        {copyToastVisible && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="absolute right-0 -top-10 rounded-lg bg-slate-900 px-3 py-1 text-xs text-white shadow-lg"
                          >
                            Copied!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button className="neu-button inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => exportToWord(notes, flashcards)}>
                        <DownloadCloud size={16} />
                        <span>Word</span>
                      </button>
                      <button className="neu-button inline-flex items-center gap-2 px-3 py-2 text-sm" onClick={() => exportToPDF("notes-section-export") }>
                        <DownloadCloud size={16} />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div id="notes-section-export" className="rounded-3xl bg-slate-950/95 p-4 text-white shadow-inner">
                  <textarea
                    ref={notesRef}
                    className="neu-input-el w-full min-h-[20rem] resize-y bg-transparent p-4 font-sans text-white placeholder:text-white/40"
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Your notes will appear here. Type or generate..."
                  />

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="text-sm text-white/70">Insert:</div>
                    <button className="neu-button px-3 py-2 text-sm" onClick={() => insertAtCursor("$$E = mc^2$$")}>LaTeX</button>
                    <button className="neu-button px-3 py-2 text-sm" onClick={() => insertAtCursor("$$\\int_a^b f(x)\\,dx$$")}>Integral</button>
                    <button className="neu-button px-3 py-2 text-sm" onClick={() => insertAtCursor("**Table (Markdown)**\n\n| Header 1 | Header 2 |\n|---|---|\n| Row1Col1 | Row1Col2 |\n")}>Table</button>
                    <button className="neu-button px-3 py-2 text-sm" onClick={() => insertAtCursor("• Bullet 1\n• Bullet 2\n")}>Bullets</button>

                    <div className="ml-auto flex items-center gap-2">
                      <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700" onClick={() => setShowPreview((s) => !s)}>
                        <Eye size={14} />
                        <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showPreview && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-sm font-medium text-white">Preview</div>
                          <div className="text-xs text-white/45">Rendered Markdown and LaTeX</div>
                        </div>
                        <div className="max-h-[28rem] overflow-auto rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-white">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents as any}>
                            {notes || "_No content yet_"}
                          </ReactMarkdown>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-3 flex items-center gap-2 text-xs text-white/45">
                    <div>Tip: Use $$...$$ for LaTeX.</div>
                    <div className="ml-auto flex items-center gap-2">
                      <span>Autosave</span>
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                </div>
              </NeumorphicCard>
            </motion.div>

            <div className="space-y-4">
              <NeumorphicCard className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="flex items-center gap-2 text-xl font-medium">
                    Flashcards <CheckCircle size={16} />
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="opacity-70">{flashcards.length} cards</span>
                    {dueCount > 0 && (
                      <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-xs font-medium">
                        {dueCount} due
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm" style={{ minHeight: 180 }}>
                  {flashcards.length ? (
                    <>
                      <div className="text-base font-semibold text-foreground break-words whitespace-pre-wrap">
                        {safeText(flashcards[currentFlashIndex]?.front)}
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${currentFlashIndex}-${flashRevealed ? "back" : "front"}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          className="mt-3 min-h-10 text-sm text-muted-foreground"
                        >
                          {flashRevealed ? safeText(flashcards[currentFlashIndex]?.back) : <span>Reveal the answer</span>}
                        </motion.div>
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No flashcards yet — generate notes first and we'll build them for you.</div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button className="neu-button px-3 py-2 text-sm" onClick={prevFlash} disabled={!flashcards.length}>
                      <ChevronsLeft size={14} /> Prev
                    </button>

                    <button className="neu-button px-3 py-2 text-sm" onClick={() => (flashRevealed ? nextFlash() : revealFlash())} disabled={!flashcards.length}>
                      {flashRevealed ? "Next" : "Reveal"}
                    </button>

                    <button className="neu-button px-3 py-2 text-sm" onClick={nextFlash} disabled={!flashcards.length}>
                      <ChevronsRight size={14} /> Next
                    </button>

                    <button
                      className="neu-button px-3 py-2 text-sm bg-primary/15 border-primary/25"
                      onClick={startStudyMode}
                      disabled={!srDeck.length}
                    >
                      Study Mode
                    </button>

                    <button
                      className={`neu-button px-3 py-2 text-sm ${!notes.trim() ? "opacity-60 cursor-not-allowed" : ""}`}
                      onClick={() => {
                        if (!notes.trim()) return;
                        setFlashFullscreen(true);
                        setFlashRevealed(false);
                      }}
                    >
                      Enlarge
                    </button>

                    <div className="ml-auto text-sm text-muted-foreground">
                      Card {Math.min(currentFlashIndex + 1, Math.max(1, flashcards.length))}/{Math.max(1, flashcards.length)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-auto pb-1">
                  {flashcards.length ? (
                    flashcards.map((f, i) => (
                      <button
                        key={`${i}_${safeText(f.front).slice(0, 10)}`}
                        className={`rounded-xl border border-white/10 px-3 py-2 text-sm text-foreground transition hover:scale-105 ${i === currentFlashIndex ? "bg-primary/20 border-primary/30" : "bg-white/5"}`}
                        onClick={() => handleFlashClick(i)}
                      >
                        {i + 1}
                      </button>
                    ))
                  ) : notes.trim() ? (
                    <div className="flex gap-2">
                      <button className="neu-button px-3 py-2" onClick={() => sendNotesToCards(flashCount)}>
                        Generate Flashcards
                      </button>
                      <div className="self-center text-sm text-muted-foreground">Or just generate notes — cards come along for the ride.</div>
                    </div>
                  ) : null}
                </div>
              </NeumorphicCard>

              <NeumorphicCard className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-lg font-medium">
                    Audio → Notes <Mic size={16} />
                  </h3>
                  <button className="neu-button px-3 py-2 text-sm" onClick={() => setShowAudioPanel((s) => !s)}>
                    {showAudioPanel ? "Collapse" : "Expand"}
                  </button>
                </div>

                <AnimatePresence>
                  {showAudioPanel && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                      <div className="flex flex-wrap items-center gap-3">
                        {!recording ? (
                          <button className="neu-button inline-flex items-center gap-2 bg-rose-500 px-4 py-2 text-white" onClick={startRecording}>
                            <Mic size={16} />
                            <span>Start</span>
                          </button>
                        ) : (
                          <button className="neu-button inline-flex items-center gap-2 bg-red-600 px-4 py-2 text-white" onClick={stopRecording}>
                            <StopCircle size={16} />
                            <span>Stop</span>
                          </button>
                        )}

                        {audioURL && <audio controls src={audioURL} className="max-w-full" />}

                        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div>Recording</div>
                          <div className="font-medium">{recording ? `Elapsed ${recordingTimeDisplay.elapsed}` : "Idle"}</div>
                          {recording && <div className="text-xs text-muted-foreground">Remaining {recordingTimeDisplay.remaining}</div>}
                          <button className="neu-button inline-flex items-center gap-2 px-3 py-2" onClick={downloadAudio} disabled={!lastAudioBlob}>
                            <DownloadCloud size={16} /> Download
                          </button>
                          <button
                            className="neu-button inline-flex items-center gap-2 px-3 py-2"
                            onClick={() => lastAudioBlob && uploadAudioBlob(lastAudioBlob)}
                            disabled={!lastAudioBlob || loading}
                          >
                            <UploadCloud size={16} /> Upload
                          </button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <canvas ref={audioCanvasRef} width={900} height={90} className="h-24 w-full rounded-2xl border border-white/10 bg-slate-950" />
                      </div>

                      <div className="mt-3 text-xs text-muted-foreground">Record a lecture and we'll help turn it into study material.</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </NeumorphicCard>

              <NeumorphicCard className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-md font-medium">
                    Progress <BarChart2 size={16} />
                  </h3>
                  <button className="neu-button px-3 py-2 text-sm" onClick={() => setShowProgressPanel((s) => !s)}>
                    {showProgressPanel ? "Collapse" : "Expand"}
                  </button>
                </div>

                <AnimatePresence>
                  {showProgressPanel && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                      {quizHistory.length ? (
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <label className="text-xs text-foreground">Target min</label>
                            <input className="neu-input-el h-9 w-16" type="number" value={targetMin} onChange={(e) => setTargetMin(Number(e.target.value))} />
                            <label className="ml-2 text-xs text-foreground">Target max</label>
                            <input className="neu-input-el h-9 w-16" type="number" value={targetMax} onChange={(e) => setTargetMax(Number(e.target.value))} />
                            <div className="ml-auto text-xs text-muted-foreground">Set a target zone on the chart</div>
                          </div>
                          <div style={{ height: 170 }}>
                            <Line data={chartData} options={chartOptions} plugins={[targetZonePlugin]} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Take a few quizzes and your progress will show up here.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </NeumorphicCard>
            </div>
          </div>

          <AnimatePresence>
            {flashFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
              >
                <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.18 }} className="relative w-full max-w-3xl rounded-3xl glass-panel border border-white/10 p-6 font-sans shadow-2xl">
                  <button className="absolute right-4 top-4 neu-button px-3 py-2" onClick={() => setFlashFullscreen(false)}>
                    <X size={14} />
                  </button>

                  <div className="text-center">
                    <div className="mb-4 text-2xl font-semibold text-foreground">{safeText(flashcards[currentFlashIndex]?.front) || "No card"}</div>
                    <div className={`mb-6 text-lg leading-relaxed text-foreground transition-opacity ${flashRevealed ? "opacity-100" : "opacity-50"}`}>
                      {flashRevealed ? safeText(flashcards[currentFlashIndex]?.back) : "Click Reveal to see the answer"}
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button className="neu-button px-4 py-2" onClick={prevFlash}>Previous</button>
                      <button className="neu-button px-4 py-2" onClick={() => (flashRevealed ? nextFlash() : revealFlash())}>{flashRevealed ? "Next" : "Reveal"}</button>
                      <button className="neu-button px-4 py-2" onClick={nextFlash}>Next</button>
                    </div>
                    <div className="mt-6 text-sm text-muted-foreground">Card {currentFlashIndex + 1}/{flashcards.length}</div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {studyModeOpen && studyQueue[studyIndex] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  className="relative w-full max-w-lg rounded-3xl glass-panel border border-primary/20 p-6 shadow-2xl"
                >
                  <button
                    type="button"
                    className="absolute right-4 top-4 neu-button px-3 py-2"
                    onClick={() => setStudyModeOpen(false)}
                  >
                    <X size={14} />
                  </button>

                  <p className="text-xs text-primary mb-2 uppercase tracking-wider">Spaced Repetition · Study Mode</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Card {studyIndex + 1} of {studyQueue.length}
                  </p>

                  <div className="text-xl font-semibold text-foreground mb-4 min-h-[4rem]">
                    {studyQueue[studyIndex].front}
                  </div>

                  {studyRevealed ? (
                    <div className="text-base text-muted-foreground mb-6 border-t border-white/10 pt-4">
                      {studyQueue[studyIndex].back}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="neu-button w-full py-3 mb-6"
                      onClick={() => setStudyRevealed(true)}
                    >
                      Show answer
                    </button>
                  )}

                  {studyRevealed && (
                    <div className="grid grid-cols-2 gap-2">
                      {(["again", "hard", "good", "easy"] as SrRating[]).map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          className="neu-button py-2.5 text-sm capitalize"
                          onClick={() => rateStudyCard(rating)}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <NeumorphicCard className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-medium">Quiz</h2>
              <div className="text-sm text-muted-foreground">{totalQuestions} questions • {answeredCount} answered</div>
            </div>

            <div className="space-y-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <select className="neu-input-el h-11" value={quizType} onChange={(e) => setQuizType(e.target.value as any)}>
                  {QUIZ_TYPES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <select className="neu-input-el h-11" value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value as any)}>
                  {QUIZ_DIFFICULTIES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                <select className="neu-input-el h-11" value={frqLength} onChange={(e) => setFrqLength(e.target.value as any)}>
                  {FRQ_LENGTHS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">MCQ options</label>
                  <select className="neu-input-el h-11" value={mcqOptionCount} onChange={(e) => setMcqOptionCount(Number(e.target.value))}>
                    {[2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <button className="neu-button inline-flex items-center gap-2 px-4 py-2" onClick={handleGenerateQuiz} disabled={loading || !notes.trim()}>
                    <Play size={16} />
                    <span>{loading ? "Generating..." : "Generate"}</span>
                  </button>
                  <button className="neu-button px-4 py-2" onClick={handleSubmitQuiz} disabled={!generatedQuestions.length || loading}>
                    Submit
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {generatedQuestions.length ? (
                  generatedQuestions.map((q, idx) => {
                    const res = quizResultsById.get(q.id);
                    const currentAnswer = userAnswers[q.id] ?? "";
                    const choices = (q.choices || q.options || []).slice(0, clamp(mcqOptionCount, 2, 5));
                    return (
                      <div key={q.id ?? idx} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="text-sm font-medium text-foreground">Q{idx + 1}.</div>
                          <div className="flex-1 text-foreground">
                            <div className="mb-3 break-words text-sm">{q.prompt || q.question || "Question text unavailable."}</div>

                            {q.type === "multiple_choice" && (
                              <div className="space-y-2">
                                {choices.length ? choices.map((choice, i) => (
                                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 transition hover:bg-white/5" key={`${q.id}_${i}`}>
                                    <input
                                      type="radio"
                                      name={`q_${q.id}`}
                                      value={choice}
                                      checked={String(currentAnswer) === String(choice)}
                                      onChange={(e) => setUserAnswers((u) => ({ ...u, [q.id]: e.target.value }))}
                                    />
                                    <span className="text-sm">{choice}</span>
                                  </label>
                                )) : <div className="text-xs text-muted-foreground">No choices available for this question.</div>}
                              </div>
                            )}

                            {q.type === "frq" && (
                              <textarea className="neu-input-el mt-2 w-full font-sans text-foreground" rows={4} placeholder="Write your answer..." value={currentAnswer} onChange={(e) => setUserAnswers((u) => ({ ...u, [q.id]: e.target.value }))} />
                            )}

                            {q.type === "interactive" && (
                              <div className="space-y-2">
                                <textarea className="neu-input-el mt-2 w-full font-sans text-foreground" rows={3} placeholder="Interact with the prompt..." value={currentAnswer} onChange={(e) => setUserAnswers((u) => ({ ...u, [q.id]: e.target.value }))} />
                                <div className="text-xs text-muted-foreground">This item will be graded by the AI after submission.</div>
                              </div>
                            )}

                            {quizSubmitted && res && (
                              <div className="mt-3 space-y-1 text-sm">
                                {typeof res.score !== "undefined" && (
                                  <div>
                                    Score: <strong>{res.score}/{res.maxScore}</strong>
                                  </div>
                                )}
                                {res.feedback && <div className="text-xs text-muted-foreground">Feedback: {res.feedback}</div>}
                                {res.includes && <div className="text-xs text-muted-foreground">Includes: {res.includes}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">No questions yet — generate a quiz from your notes to get started.</div>
                )}
              </div>

              {quizSubmitted && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="text-sm">Accuracy: <strong>{accuracy ?? "—"}%</strong></div>
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <button className="neu-button px-3 py-2" onClick={() => { setGeneratedQuestions([]); setQuizSubmitted(false); setQuizResults(null); }}>Reset</button>
                    <button className="neu-button px-3 py-2" onClick={() => exportToWord(JSON.stringify(quizResults ?? [], null, 2), [])}>Export Results</button>
                    <button className="neu-button px-3 py-2" onClick={() => exportToPDF("notes-section-export")}>Export PDF</button>
                  </div>
                </div>
              )}
            </div>
          </NeumorphicCard>
        </motion.div>
      </PageSection>
    </>
  );
}
