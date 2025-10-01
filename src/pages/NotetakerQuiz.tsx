// NotetakerQuiz.tsx
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

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
} from "chart.js";
import { Line } from "react-chartjs-2";

import { motion } from "framer-motion";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function NotetakerQuiz(): JSX.Element {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Smart Notes");
  const [customFormatText, setCustomFormatText] = useState("");
  const [notes, setNotes] = useState("");
  const [notesLength, setNotesLength] = useState("medium");
  const [flashCount, setFlashCount] = useState(8);
  const [quizType, setQuizType] = useState("Interactive Quiz");
  const [quizDifficulty, setQuizDifficulty] = useState("Medium");
  const [frqLength, setFrqLength] = useState("short");
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, any>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any[] | null>(null);

  const [timeSpent, setTimeSpent] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef<any>(null);

  const [notesHistory, setNotesHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDirty, setIsDirty] = useState(false);

  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState(false);
  const [flashFullscreen, setFlashFullscreen] = useState(false);

  const [hideNotesArea, setHideNotesArea] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const autosaveTimer = useRef<any>(null);

  const [gradingLeniency, setGradingLeniency] = useState(3);
  const [examStyle, setExamStyle] = useState("Generic");

  const [mounted, setMounted] = useState(false);
  const [quizHistory, setQuizHistory] = useState<number[]>([]);

  // audio recorder + visualizer
// --- frontend patch: replace old audio code with this ---
// add these new state refs near other hooks:
const audioCtxRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const animationRef = useRef<number | null>(null);
const canvasRef = useRef<HTMLCanvasElement | null>(null);
const mediaStreamRef = useRef<MediaStream | null>(null);

// new startRecording with analyser + waveform
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    // setup AudioContext + analyser
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    src.connect(analyser);

    // draw waveform to canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const draw = () => {
        const w = canvas.width;
        const h = canvas.height;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(data);
        const ctx2 = canvas.getContext("2d");
        if (ctx2) {
          ctx2.clearRect(0, 0, w, h);
          ctx2.fillStyle = "transparent";
          ctx2.fillRect(0, 0, w, h);
          ctx2.lineWidth = 2;
          ctx2.strokeStyle = "#60a5fa"; // sky-400
          ctx2.beginPath();
          const slice = w / data.length;
          for (let i = 0; i < data.length; i++) {
            const v = data[i] / 128.0;
            const y = (v * h) / 2;
            if (i === 0) ctx2.moveTo(0, y);
            else ctx2.lineTo(i * slice, y);
          }
          ctx2.lineTo(w, h / 2);
          ctx2.stroke();
        }
        animationRef.current = requestAnimationFrame(draw);
      };
      animationRef.current = requestAnimationFrame(draw);
    }

    // start MediaRecorder
    const mr = new MediaRecorder(stream);
    mediaRecorderRef.current = mr;
    audioChunksRef.current = [];
    mr.ondataavailable = (ev: BlobEvent) => {
      if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
    };
    mr.onstop = async () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      try { analyserRef.current?.disconnect(); } catch (e) {}
      try { audioCtxRef.current?.close(); } catch (e) {}
      audioCtxRef.current = null;
      analyserRef.current = null;

      // build blob
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setLastAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioURL(url);

      // auto-upload via multipart form to /api/transcribe to get transcription + cards
      try {
        const fd = new FormData();
        fd.append("file", blob, `recording_${Date.now()}.webm`);
        fd.append("createCards", "true");
        fd.append("flashCount", String(flashCount || 6));
        // optional: fd.append("language", "en");
        const r = await fetch("/api/transcribe", { method: "POST", body: fd });
        if (r.ok) {
          const json = await r.json();
          // put transcript into notes (append)
          const time = new Date().toLocaleString();
          const text = json.transcription || json.summary || "";
          if (text) {
            const insertText = `\n\n---\n\n[Audio recorded ${time}]${text ? `\n\n${text}\n\n` : ""}`;
            setNotes((prev) => (prev ? `${prev}${insertText}` : insertText));
            setFlashcards((prev) => {
              // merge server flashcards if present
              const serverCards = Array.isArray(json.flashcards) ? json.flashcards : [];
              if (!serverCards.length) return prev;
              // replace or append (choose to append)
              return [...serverCards.slice(0, flashCount), ...prev];
            });
            setIsDirty(true);
          }
        } else {
          console.error("Transcribe upload failed", await r.text().catch(() => ""));
          alert("Upload failed. You can still download the audio locally.");
        }
      } catch (err) {
        console.error("Upload error:", err);
      }

      // stop tracks
      try { mediaStreamRef.current?.getTracks().forEach(t => t.stop()); } catch (e) {}
      mediaStreamRef.current = null;
    };

    mr.start();
    setRecording(true);
  } catch (err) {
    console.error("Audio start failed", err);
    alert("Could not access microphone. Please check permissions.");
  }
};

// stop recording
const stopRecording = () => {
  try { mediaRecorderRef.current?.stop(); } catch (e) { console.warn(e); }
  setRecording(false);
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }
  try { audioCtxRef.current?.suspend(); } catch (e) {}
};

// download audio (unchanged)
const downloadAudio = () => {
  if (!lastAudioBlob) return alert("No audio recorded");
  const url = URL.createObjectURL(lastAudioBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recording_${Date.now()}.webm`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// send current notes text to server /api/cards to generate flashcards
const sendNotesToCards = async (count = 6) => {
  if (!notes || !notes.trim()) return alert("No notes to convert");
  try {
    const r = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: notes, flashCount: count }),
    });
    if (!r.ok) throw new Error(`Cards failed: ${r.status}`);
    const json = await r.json();
    if (Array.isArray(json.flashcards) && json.flashcards.length) {
      setFlashcards(json.flashcards);
      // push snapshot
      pushNotesSnapshot(notes);
      alert("Flashcards generated from notes.");
    } else {
      alert("No flashcards generated.");
    }
  } catch (err) {
    console.error("sendNotesToCards error", err);
    alert("Failed to generate flashcards from notes.");
  }
};


  useEffect(() => {
    setMounted(true);
    timerRef.current = setInterval(() => setTimeSpent((t) => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      stopVisualizer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushNotesSnapshot = (snapshot?: string) => {
    setNotesHistory((h) => {
      const next = h.slice(0, historyIndex + 1);
      next.push(snapshot ?? "");
      if (next.length > 50) next.shift();
      return next;
    });
    setHistoryIndex((i) => {
      const base = i === -1 ? 0 : i + 1;
      return Math.min(base, 49);
    });
    setIsDirty(false);
  };

  const undoNotes = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNotes(notesHistory[newIndex] ?? "");
      setIsDirty(false);
    }
  };
  const redoNotes = () => {
    if (historyIndex < notesHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNotes(notesHistory[newIndex] ?? "");
      setIsDirty(false);
    }
  };

  const handleNotesBlur = () => {
    if (isDirty) pushNotesSnapshot(notes);
  };

  useEffect(() => {
    if (!isDirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => pushNotesSnapshot(notes), 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, isDirty]);

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
    const newNotes = before + text + after;
    setNotes(newNotes);
    setTimeout(() => {
      try {
        ta.focus();
        const pos = start + text.length;
        ta.setSelectionRange(pos, pos);
      } catch {}
    }, 10);
    setIsDirty(true);
  };

  const exportToWord = async (notesText: string, cards: any[]) => {
    try {
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ children: [new TextRun({ text: "Study Notes", bold: true })] }),
              new Paragraph(notesText || ""),
              ...(cards && cards.length
                ? [
                    new Paragraph({ children: [new TextRun({ text: "Flashcards", bold: true })] }),
                    ...cards.map((f: any, i: number) =>
                      new Paragraph({
                        children: [
                          new TextRun({ text: `Q${i + 1}: ${f.front}` }),
                          new TextRun({ text: `\nA: ${f.back}` }),
                        ],
                      })
                    ),
                  ]
                : []),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "notes.docx");
    } catch (err) {
      console.error("Word export failed", err);
      alert("Word export failed");
    }
  };

  const exportToPDF = async (elementId: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return alert("Nothing to export");
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("notes.pdf");
    } catch (err) {
      console.error("PDF export failed", err);
      alert("PDF export failed");
    }
  };

  const handleGenerateNotes = async () => {
    if (!topic) return alert("Please enter a topic");
    setLoading(true);
    try {
      const payload = {
        topic,
        format: format === "Custom" ? customFormatText || "Custom" : format,
        length: notesLength,
        flashCount,
        additionalInfo,
      };
      const res = await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const plainNotes = data?.result || "";
      setNotes((prev) => {
        const trimmedPrev = (prev ?? "").trim();
        const toInsert = plainNotes.trim();
        if (!trimmedPrev) return toInsert;
        const divider = `\n\n---\n\n### AI-generated Notes (${format === "Custom" ? (customFormatText || "Custom") : format})\n\n`;
        return `${trimmedPrev}${divider}${toInsert}`;
      });
      setFlashcards(Array.isArray(data?.flashcards) ? data.flashcards.slice(0, flashCount) : []);
      pushNotesSnapshot((notes ?? "") + "\n\n" + plainNotes);
      setGeneratedQuestions([]);
      setUserAnswers({});
      setQuizSubmitted(false);
      setQuizResults(null);
      setCurrentFlashIndex(0);
      setFlashRevealed(false);
    } catch (err) {
      console.error(err);
      alert("Failed to generate notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!notes) return alert("Please generate or write notes first");
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
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
    const localResults = generatedQuestions.map((q: any) => {
      const id = q.id;
      const user = userAnswers[id] ?? "";
      if (q.type === "multiple_choice") {
        const isCorrect = q.answer && user === q.answer;
        return {
          id,
          selected: user,
          correctAnswer: q.answer,
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

    const needAI = generatedQuestions.some((q: any) => q.type === "frq" || q.type === "interactive");

    if (!needAI) {
      setQuizResults(localResults);
      setQuizSubmitted(true);
      const totalScore = localResults.reduce((s: number, r: any) => s + (Number(r.score) || 0), 0);
      const totalMax = localResults.reduce((s: number, r: any) => s + (Number(r.maxScore) || 0), 0) || 0;
      const acc = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
      if (acc !== null) setQuizHistory((h) => [...h, acc]);
      return;
    }

    setLoading(true);
    try {
      const gradeRes = await fetch("/api/quiz", {
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
      const grades = gradeData.grades || [];
      const merged = localResults.map((r: any) => {
        const g = grades.find((x: any) => x.id === r.id);
        if (g) {
          const maxScore = g.maxScore ?? g.max_points ?? r.maxScore ?? 2;
          const score = typeof g.score === "number" ? g.score : 0;
          return {
            ...r,
            score,
            maxScore,
            feedback: g.feedback,
            isCorrect: score >= Math.max(0.1, (gradingLeniency / 5) * maxScore * 0.5),
            includes: g.includes || g.whatIncluded || "",
          };
        }
        return r;
      });

      setQuizResults(merged);
      setQuizSubmitted(true);
      const totalScore = merged.reduce((s: number, r: any) => s + (Number(r.score) || 0), 0);
      const totalMax = merged.reduce((s: number, r: any) => s + (Number(r.maxScore) || 0), 0) || 0;
      const acc = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
      if (acc !== null) setQuizHistory((h) => [...h, acc]);
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
      setTimeout(() => setCopyToastVisible(false), 3000);
    } catch (err) {
      console.error("Clipboard failed:", err);
      alert("Failed to copy to clipboard.");
    }
  };

  const toggleTimer = () => setShowTimer((s) => !s);

  const nextFlash = () => {
    setFlashRevealed(false);
    setCurrentFlashIndex((i) => (i + 1 >= flashcards.length ? 0 : i + 1));
  };
  const prevFlash = () => {
    setFlashRevealed(false);
    setCurrentFlashIndex((i) => (i - 1 < 0 ? Math.max(0, flashcards.length - 1) : i - 1));
  };
  const revealFlash = () => setFlashRevealed(true);

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleNotesChange = (val: string) => {
    setNotes(val);
    setIsDirty(true);
  };

  const totalQuestions = generatedQuestions.length;
  const answeredCount = generatedQuestions.filter((q) => {
    const a = userAnswers[q.id];
    return typeof a !== "undefined" && String(a).trim() !== "";
  }).length;

  let accuracy = null;
  if (quizSubmitted && quizResults && Array.isArray(quizResults)) {
    const totalScore = quizResults.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const totalMax = quizResults.reduce((s, r) => s + (Number(r.maxScore) || 0), 0) || 0;
    accuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
  }

  const displayFormatLabel = format === "Custom" ? (customFormatText || "Custom") : format;
  const appearClass = mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2";

  // Audio visualizer helpers
  const startVisualizer = (stream: MediaStream) => {
    stopVisualizer();
    mediaStreamRef.current = stream;
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    source.connect(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const canvasCtx = canvas.getContext("2d");
    const draw = () => {
      if (!analyserRef.current || !canvasCtx) return;
      analyserRef.current.getByteTimeDomainData(dataArray);
      canvasCtx.fillStyle = "rgba(0,0,0,0)";
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "#2563EB";
      canvasCtx.beginPath();
      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
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

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    if (analyserRef.current) analyserRef.current.disconnect();
    analyserRef.current = null;
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
    }
    audioCtxRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setLastAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stopVisualizer();

        // attempt to upload to /api/transcribe if available
        try {
          const fd = new FormData();
          fd.append("file", blob, `recording_${Date.now()}.webm`);
          const resp = await fetch("/api/transcribe", { method: "POST", body: fd });
          if (resp.ok) {
            const j = await resp.json();
            const transcript = j.transcript || j.text || "";
            if (transcript) {
              setNotes((prev) => {
                const time = new Date().toLocaleString();
                const block = `\n\n---\n\n[Audio transcription ${time}]\n\n${transcript}\n\n`;
                return prev ? `${prev}${block}` : block;
              });
            } else {
              // fallback placeholder
              const time = new Date().toLocaleString();
              const placeholder = `\n\n---\n\n[Audio recorded ${time} — transcription pending]\n\n`;
              setNotes((prev) => (prev ? `${prev}${placeholder}` : placeholder));
            }
          } else {
            const time = new Date().toLocaleString();
            const placeholder = `\n\n---\n\n[Audio recorded ${time} — transcription unavailable]\n\n`;
            setNotes((prev) => (prev ? `${prev}${placeholder}` : placeholder));
          }
        } catch (err) {
          console.warn("Transcription API not available or failed", err);
          const time = new Date().toLocaleString();
          const placeholder = `\n\n---\n\n[Audio recorded ${time} — placeholder transcript]\n\n`;
          setNotes((prev) => (prev ? `${prev}${placeholder}` : placeholder));
        }
        setIsDirty(true);
      };
      mr.start();
      setRecording(true);
      startVisualizer(stream);
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
  };

  const downloadAudio = () => {
    if (!lastAudioBlob) return alert("No audio recorded");
    const url = URL.createObjectURL(lastAudioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording_${Date.now()}.webm`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const flashBtnTextColor = (bgIsLight: boolean) => (bgIsLight ? "text-slate-800" : "text-white");

  const chartData = {
    labels: quizHistory.map((_, i) => `S${i + 1}`),
    datasets: [
      {
        label: "Accuracy (%)",
        data: quizHistory,
        borderColor: "#2563EB",
        backgroundColor: "rgba(37,99,235,0.15)",
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  const sectionVariant = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  // Markdown render components to style tables and code blocks
  const markdownComponents = {
    table: (props: any) => (
      <div className="overflow-auto rounded-md border">
        <table className="min-w-full table-auto text-sm divide-y">
          <thead className="bg-slate-50">
            {props.children.props?.children?.[0]}
          </thead>
          <tbody className="bg-white">{props.children.props?.children?.[1]}</tbody>
        </table>
      </div>
    ),
    th: (props: any) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">{props.children}</th>,
    td: (props: any) => <td className="px-3 py-2 align-top text-slate-800">{props.children}</td>,
    pre: (props: any) => <pre className="p-3 bg-slate-900 text-white rounded-md overflow-auto">{props.children}</pre>,
    code: (props: any) => <code className="rounded px-1 py-0.5 bg-slate-100 text-xs text-slate-900">{props.children}</code>,
  };

  return (
    <>
      <Helmet>
        <title>AI Notetaker, Flashcards & Quiz Generator | Vertex</title>
        <meta name="description" content="Create AI-powered notes, generate flashcards, and practice with quizzes in one place." />
      </Helmet>

      <PageSection>
        <div className="mb-6 flex items-center justify-between">
          <Link to="/main" className="neu-button px-4 py-2 text-sm transition-transform hover:scale-105">
            ← Back to Main
          </Link>

          <div className="flex items-center gap-3">
            <button className="neu-button px-3 py-1 text-sm transition-colors" title={showTimer ? "Hide timer" : "Show timer"} onClick={toggleTimer}>
              {showTimer ? "Hide Timer" : "Show Timer"}
            </button>
            {showTimer && <div className="text-sm text-gray-500"> Time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s </div>}
          </div>
        </div>

        <motion.div initial="hidden" animate="visible" variants={sectionVariant} className={`space-y-8 transition-all duration-300 ${appearClass}`}>
          <NeumorphicCard className="p-8">
            <h2 className="text-xl font-medium mb-4">Topic and Format</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="neu-input">
                <input className="neu-input-el" placeholder="Enter your study topic..." value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>

              <div className="neu-input">
                <select className="neu-input-el" value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option>Smart Notes</option>
                  <option>Quick Notes</option>
                  <option>Cornell Notes</option>
                  <option>Research Oriented</option>
                  <option>Detailed Overview</option>
                  <option>Bullet points/Summary</option>
                  <option>Mapping</option>
                  <option value="Custom">Custom...</option>
                </select>

                {format === "Custom" && (
                  <div className="mt-2">
                    <input className="neu-input-el text-sm" placeholder="Describe custom format (max 64 chars)" maxLength={64} value={customFormatText} onChange={(e) => setCustomFormatText(e.target.value)} />
                    <div className="text-xs text-gray-500 mt-1">{customFormatText.length}/64</div>
                  </div>
                )}
              </div>

              <div className="neu-input">
                <div className="flex gap-2 items-center">
                  <select className="neu-input-el" value={notesLength} onChange={(e) => setNotesLength(e.target.value)} title="Choose short, medium or long — generator will adjust content density accordingly">
                    <option value="short">Short notes</option>
                    <option value="medium">Medium notes</option>
                    <option value="long">Long notes</option>
                  </select>

                  <select className="neu-input-el" value={flashCount} onChange={(e) => setFlashCount(Number(e.target.value))}>
                    {Array.from({ length: 13 }).map((_, i) => {
                      const v = 4 + i;
                      return (
                        <option key={v} value={v}>
                          {v} flashcards
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="mt-2 text-xs text-gray-500">Length adjusts based on selected option and the generator's heuristics.</div>
              </div>
            </div>

            <div className="mt-3 flex gap-3 flex-wrap">
              <button className="neu-button px-4 py-2" onClick={handleGenerateNotes} disabled={loading}>
                {loading ? "Generating..." : "Generate Notes"}
              </button>

              <button className="neu-button px-4 py-2" onClick={handleGenerateQuiz} disabled={loading || !notes} title="Quick generate quiz">
                {loading ? "..." : "Generate Quiz"}
              </button>

              <button className="neu-button px-4 py-2" onClick={() => { pushNotesSnapshot(notes); alert("Snapshot saved."); }}>
                Save Snapshot
              </button>

              <button className="neu-button px-4 py-2" onClick={undoNotes} disabled={historyIndex <= 0}>
                Undo
              </button>
              <button className="neu-button px-4 py-2" onClick={redoNotes} disabled={historyIndex >= notesHistory.length - 1}>
                Redo
              </button>

              <button className="neu-button px-4 py-2" onClick={() => setHideNotesArea((s) => !s)} title="Hide or show the notes editor">
                {hideNotesArea ? "Show Notes" : "Hide Notes"}
              </button>

              <div className="ml-auto text-sm text-gray-500 flex items-center gap-3">
                <div>Format: <strong>{displayFormatLabel}</strong></div>
                <div className="text-xs">Autosave: on</div>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Additional Information (optional)</label>
              <textarea className="neu-input-el mt-2 w-full" rows={2} placeholder="Anything extra for the generator? (e.g., focus on dates, include equations, exam-style hints)" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
            </div>
          </NeumorphicCard>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: hideNotesArea ? 0.3 : 1, y: 0 }} transition={{ duration: 0.45 }} className={`lg:col-span-2 transition-all duration-300 ${hideNotesArea ? "max-h-0 overflow-hidden" : ""}`}>
              <NeumorphicCard className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-medium">Notes</h2>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500 mr-2">Words: {wordCount}</div>

                    <div className="relative">
                      <button className="neu-button px-3 py-1 text-sm flex items-center gap-2" onClick={copyNotes} title="Copy notes" aria-label="Copy notes">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block">
                          <rect x="9" y="4" width="10" height="14" rx="2" ry="2"></rect>
                          <path d="M5 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"></path>
                        </svg>
                        <span className="sr-only">Copy</span>
                      </button>
                      {copyToastVisible && <div className="absolute right-0 -top-10 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-sm">Copied!</div>}
                    </div>
                  </div>
                </div>

                <div id="notes-section" className="neu-textarea max-h-[128rem] overflow-auto p-4 bg-white rounded">
                  <div className="grid md:grid-cols-2 gap-4">
                    <textarea ref={notesRef} className="neu-input-el w-full h-[32rem] p-4 transition-transform duration-150 whitespace-pre-wrap" value={notes} onChange={(e) => handleNotesChange(e.target.value)} onBlur={handleNotesBlur} placeholder="Your notes will appear here. Type or generate..." />
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Preview</div>
                        <div className="text-xs text-gray-500">Rendered Markdown (tables, LaTeX)</div>
                      </div>
                      <div className="overflow-auto rounded border p-3 bg-white" style={{ minHeight: "32rem" }}>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
                          {notes || "_No content yet_"}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 items-center">
                  <span className="text-sm text-gray-600 mr-2">Insert:</span>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("$$E = mc^2$$")}>LaTeX</button>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("$$\\int_a^b f(x)\\,dx$$")}>Integral</button>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("**Table (Markdown)**\n\n| Header 1 | Header 2 |\n|---|---|\n| Row1Col1 | Row1Col2 |\n")}>Table</button>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("• Bullet 1\n• Bullet 2\n")}>Bullets</button>
                  <div className="ml-auto text-sm text-gray-500">Tip: Use $$...$$ for LaTeX.</div>
                </div>

                <div className="mt-4 flex gap-2 items-center">
                  <button onClick={() => exportToWord(notes, flashcards)} className="neu-button px-4 py-2 bg-blue-600 text-white hover:shadow-md">
                    Export Word
                  </button>
                  <button onClick={() => exportToPDF("notes-section")} className="neu-button px-4 py-2 bg-red-600 text-white hover:shadow-md">
                    Export PDF
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <div className="text-sm text-gray-500">Autosave</div>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                </div>
              </NeumorphicCard>
            </motion.div>

            <div className="lg:col-span-1 space-y-4">
              <NeumorphicCard className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-medium">Flashcards</h2>
                  <div className="text-sm opacity-70">{flashcards.length} cards</div>
                </div>

                {flashcards.length ? (
                  <>
                    <div className="relative">
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="p-4 rounded-lg border shadow-sm bg-white" style={{ minHeight: 140 }}>
                        <div className="text-base font-semibold text-slate-900 break-words">{flashcards[currentFlashIndex]?.front}</div>
                        <div className={`text-sm mt-3 transition-opacity duration-200 ${flashRevealed ? "opacity-100" : "opacity-0"}`}>{flashRevealed ? flashcards[currentFlashIndex]?.back : ""}</div>

                        <div className="mt-4 flex items-center gap-2">
                          <button className={`neu-button px-3 py-1 ${flashBtnTextColor(true)}`} onClick={prevFlash}>Previous</button>
                          <button className={`neu-button px-3 py-1 ${flashBtnTextColor(true)}`} onClick={() => (flashRevealed ? nextFlash() : revealFlash())}>
                            {flashRevealed ? "Next (revealed)" : "Reveal"}
                          </button>
                          <button className={`neu-button px-3 py-1 ${flashBtnTextColor(true)}`} onClick={nextFlash}>Next</button>

                          <button className="neu-button px-3 py-1 ml-2 text-sky-700" onClick={() => { setFlashFullscreen(true); setTimeout(() => setFlashRevealed(false), 50); }} title="Enlarge flashcard">
                            Enlarge
                          </button>

                          <div className="ml-auto text-sm text-gray-500">Card {currentFlashIndex + 1}/{flashcards.length}</div>
                        </div>
                      </motion.div>

                      <div className="mt-3 flex gap-2 items-center overflow-auto">
                        {flashcards.map((f, i) => {
                          const selected = i === currentFlashIndex;
                          const bg = selected ? "bg-sky-100" : "bg-white";
                          const txt = selected ? "text-sky-800" : "text-slate-800";
                          return (
                            <button key={i} className={`py-2 px-3 rounded-md border text-sm ${bg} hover:scale-105 transition-transform ${txt}`} onClick={() => { setCurrentFlashIndex(i); setFlashRevealed(false); }}>
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm opacity-70">Flashcards will appear here after generating notes.</p>
                )}
              </NeumorphicCard>

              <NeumorphicCard className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Audio → Notes</h3>
                  <div className="text-sm text-gray-500">Record, visualize & transcribe</div>
                </div>

                <div className="flex items-center gap-3">
                  {!recording ? (
                    <button className="neu-button px-4 py-2 bg-rose-500 text-white" onClick={startRecording}>🎙️ Start</button>
                  ) : (
                    <button className="neu-button px-4 py-2 bg-red-600 text-white" onClick={stopRecording}>⏹ Stop</button>
                  )}

                  {audioURL && <audio controls src={audioURL} className="ml-2" />}

                  <div className="ml-auto flex gap-2">
                    <button className="neu-button px-3 py-1" onClick={downloadAudio} disabled={!lastAudioBlob}>Download</button>
                    <button className="neu-button px-3 py-1" onClick={() => { if (lastAudioBlob) alert("Upload handled via /api/transcribe (implement server)."); }} disabled={!lastAudioBlob}>Upload</button>
                  </div>
                </div>

                <div className="mt-3">
                  <canvas ref={audioCanvasRef} width={400} height={60} className="w-full rounded border" />
                </div>

                <p className="text-xs mt-3 text-gray-500">Recording stored locally. If you implement <code>/api/transcribe</code>, the file will be uploaded automatically and the returned transcript appended to notes.</p>
              </NeumorphicCard>

              <NeumorphicCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-medium">Progress</h3>
                  <div className="text-sm text-gray-500">{quizHistory.length} sessions</div>
                </div>

                {quizHistory.length ? <div style={{ height: 140 }}><Line data={chartData} options={chartOptions} /></div> : <p className="text-sm text-gray-500">No quiz history yet. Take some quizzes to track progress.</p>}
              </NeumorphicCard>
            </div>
          </div>

          {flashFullscreen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative">
                <button className="absolute right-4 top-4 neu-button px-3 py-1" onClick={() => setFlashFullscreen(false)}>Close</button>

                <div className="text-center">
                  <div className="text-3xl font-semibold mb-4">{flashcards[currentFlashIndex]?.front}</div>
                  <div className={`text-lg leading-relaxed mb-6 ${flashRevealed ? "opacity-100" : "opacity-0"}`}>{flashRevealed ? flashcards[currentFlashIndex]?.back : "Click Reveal to see the answer"}</div>

                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button className="neu-button px-4 py-2" onClick={prevFlash}>Previous</button>
                    <button className="neu-button px-4 py-2" onClick={() => (flashRevealed ? nextFlash() : revealFlash())}>{flashRevealed ? "Next" : "Reveal"}</button>
                    <button className="neu-button px-4 py-2" onClick={nextFlash}>Next</button>
                  </div>

                  <div className="mt-6 text-sm text-gray-600">Card {currentFlashIndex + 1}/{flashcards.length}</div>
                </div>
              </motion.div>
            </div>
          )}

          <NeumorphicCard className="p-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-medium">Quiz</h2>
              <div className="text-sm opacity-70">Type: <span className="font-medium">{quizType}</span></div>
            </div>

            <div className="flex gap-3 flex-wrap mb-4">
              {["Interactive Quiz", "Multiple Choice", "FRQ"].map((type) => (
                <button key={type} className={`neu-button px-4 py-3 ${quizType === type ? "bg-sky-100 text-sky-800" : "bg-white text-slate-800"} hover:shadow-sm`} onClick={() => setQuizType(type)}>
                  {type}
                </button>
              ))}
            </div>

            <div className="flex gap-3 items-center mb-4 flex-wrap">
              <label className="text-sm">Difficulty:</label>
              <select className="neu-input-el" value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

              <label className="text-sm ml-3">FRQ length:</label>
              <select className="neu-input-el" value={frqLength} onChange={(e) => setFrqLength(e.target.value)}>
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>

              <label className="text-sm ml-3">Leniency:</label>
              <div className="flex items-center gap-2">
                <input type="range" min={1} max={5} value={gradingLeniency} onChange={(e) => setGradingLeniency(Number(e.target.value))} />
                <div className="text-sm w-6 text-center">{gradingLeniency}</div>
              </div>

              <label className="text-sm ml-3">Exam style:</label>
              <select className="neu-input-el" value={examStyle} onChange={(e) => setExamStyle(e.target.value)}>
                <option>Generic</option>
                <option>IGCSE</option>
                <option>IB</option>
                <option>CBSE</option>
                <option>AP</option>
                <option>A level</option>
              </select>
            </div>

            <div className="mb-3 text-sm text-gray-600">Progress: {answeredCount}/{totalQuestions} answered</div>

            <div>
              {generatedQuestions.length ? (
                <div className="space-y-4">
                  {generatedQuestions.map((q) => (
                    <div key={q.id} className="p-3 border rounded-md transition-shadow hover:shadow-md">
                      <div className="font-medium text-white bg-gray-800 inline-block px-2 py-1 rounded-md break-words">
                        {`Q${q.id}: ${q.question}`}
                      </div>

                      {q.type === "multiple_choice" && q.options?.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                          {q.options.map((opt: string, idx: number) => (
                            <label key={idx} className="flex items-center gap-3">
                              <input type="radio" name={`q${q.id}`} value={opt} checked={userAnswers[q.id] === opt} onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })} />
                              <span className="ml-1 text-slate-800">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {(q.type === "interactive" || q.type === "frq") && (
                        <textarea placeholder="Write your answer..." value={userAnswers[q.id] || ""} onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })} className="neu-input-el mt-2 w-full" />
                      )}

                      {quizSubmitted && quizResults && (
                        <div className="mt-2">
                          {(() => {
                            const r = quizResults.find((x) => x.id === q.id);
                            if (!r) return null;
                            if (q.type === "multiple_choice") {
                              return (
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${r.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                  {r.isCorrect ? "Correct ✅" : `Incorrect ❌ — Correct: ${r.correctAnswer}`}
                                  {r.explanation && <div className="ml-3 text-sm text-gray-700">({r.explanation})</div>}
                                </div>
                              );
                            } else {
                              return (
                                <div className="mt-1">
                                  <div className="text-sm font-semibold">Score: {r.score}/{r.maxScore}</div>
                                  <div className="text-sm text-gray-700 mt-1">Feedback: {r.feedback}</div>
                                  {r.includes && (
                                    <div className="text-sm text-gray-600 mt-1"><strong>Should include:</strong> {r.includes}</div>
                                  )}
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <div className="mt-4 flex gap-3">
                      <button className="neu-button px-4 py-2" onClick={handleSubmitQuiz} disabled={loading}>{loading ? "Grading..." : "Submit Quiz"}</button>
                      <button className="neu-button px-4 py-2" onClick={() => { setUserAnswers({}); setQuizSubmitted(false); setQuizResults(null); }}>Reset</button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="text-sm">Quiz completed.</div>
                      {accuracy !== null && <div className="text-sm mt-1">Accuracy: {accuracy}%</div>}
                      <button className="neu-button mt-2 px-4 py-2" onClick={() => { setQuizSubmitted(false); setQuizResults(null); }}>Retake / Clear Results</button>

                      {quizHistory.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-md font-medium mb-2">Progress Over Time</h3>
                          <div style={{ height: 220 }}><Line data={chartData} options={chartOptions} /></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm opacity-70">Generate a quiz to see questions here.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button className="neu-button px-6 py-3" onClick={handleGenerateQuiz} disabled={loading || !notes}>{loading ? "Generating..." : "Generate Quiz"}</button>
            </div>
          </NeumorphicCard>
        </motion.div>
      </PageSection>
    </>
  );
}
