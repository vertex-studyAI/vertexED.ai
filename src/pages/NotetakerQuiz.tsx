import React, { useEffect, useRef, useState, useMemo } from "react";
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
  Play,
  BarChart2,
  CheckCircle,
  X,
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function NotetakerQuiz(): JSX.Element {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Quick Notes");
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
  const recordingTimerRef = useRef<any>(null);
  const RECORDING_MAX_SECONDS = 3600;
  const [targetMin, setTargetMin] = useState<number>(70);
  const [targetMax, setTargetMax] = useState<number>(90);

  useEffect(() => {
    setMounted(true);
    timerRef.current = setInterval(() => setTimeSpent((t) => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      stopVisualizer();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
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
      const children: any[] = [
        new Paragraph({ children: [new TextRun({ text: "Study Notes", bold: true })] }),
        new Paragraph(notesText || ""),
      ];
      if (cards && cards.length) {
        children.push(new Paragraph({ children: [new TextRun({ text: "Flashcards", bold: true })] }));
        cards.forEach((f: any, i: number) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `Q${i + 1}: ${f.front}` }),
                new TextRun({ text: `\nA: ${f.back}` }),
              ],
            })
          );
        });
      }
      const doc = new Document({ sections: [{ children }] });
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
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;
      if (imgHeightMm <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightMm);
        pdf.save("notes.pdf");
        return;
      }
      const pxPerMm = canvas.height / imgHeightMm;
      const pageHeightPx = Math.floor(pdfHeight * pxPerMm);
      let yPosPx = 0;
      while (yPosPx < canvas.height) {
        const sliceHeight = Math.min(pageHeightPx, canvas.height - yPosPx);
        const canvasPage = document.createElement("canvas");
        canvasPage.width = canvas.width;
        canvasPage.height = sliceHeight;
        const ctx = canvasPage.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(canvas, 0, yPosPx, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        const imgPage = canvasPage.toDataURL("image/png");
        const imgPageHeightMm = (sliceHeight * pdfWidth) / canvas.width;
        pdf.addImage(imgPage, "PNG", 0, 0, pdfWidth, imgPageHeightMm);
        yPosPx += sliceHeight;
        if (yPosPx < canvas.height) pdf.addPage();
      }
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
      let newNotesFinal = "";
      setNotes((prev) => {
        const trimmedPrev = (prev ?? "").trim();
        const toInsert = plainNotes.trim();
        if (!trimmedPrev) {
          newNotesFinal = toInsert;
          return toInsert;
        }
        const divider = `\n\n---\n\n### AI-generated Notes (${format === "Custom" ? (customFormatText || "Custom") : format})\n\n`;
        newNotesFinal = `${trimmedPrev}${divider}${toInsert}`;
        return newNotesFinal;
      });
      const serverCards = Array.isArray(data?.flashcards) ? data.flashcards.slice(0, flashCount) : [];
      setFlashcards(serverCards);
      setCurrentFlashIndex(0);
      pushNotesSnapshot(newNotesFinal);
      setGeneratedQuestions([]);
      setUserAnswers({});
      setQuizSubmitted(false);
      setQuizResults(null);
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
        const isCorrect = q.answer && String(user) === String(q.answer);
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

  let accuracy: number | null = null;
  if (quizSubmitted && quizResults && Array.isArray(quizResults)) {
    const totalScore = quizResults.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const totalMax = quizResults.reduce((s, r) => s + (Number(r.maxScore) || 0), 0) || 0;
    accuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
  }

  const displayFormatLabel = format === "Custom" ? (customFormatText || "Custom") : format;
  const appearClass = mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2";

  useEffect(() => {
    if (!flashcards || flashcards.length === 0) {
      setCurrentFlashIndex(0);
      setFlashRevealed(false);
      return;
    }
    if (currentFlashIndex >= flashcards.length) setCurrentFlashIndex(0);
  }, [flashcards]);

  const startVisualizer = (stream: MediaStream) => {
    stopVisualizer();
    mediaStreamRef.current = stream;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
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
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {}
    }
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

  const flashBtnTextColor = () => "text-slate-900";

  const chartData = useMemo(() => {
    return {
      labels: quizHistory.map((_, i) => `S${i + 1}`),
      datasets: [
        {
          label: "Accuracy (%)",
          data: quizHistory,
          borderColor: "#2563EB",
          backgroundColor: "rgba(37,99,235,0.12)",
          tension: 0.25,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2,
        },
      ],
    };
  }, [quizHistory]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true, mode: "index", intersect: false },
        targetZone: {
          min: Math.min(targetMin, targetMax),
          max: Math.max(targetMin, targetMax),
        },
      },
      elements: { line: { borderWidth: 2 } },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true } },
        y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 } },
      },
    };
  }, [targetMin, targetMax]);

  const targetZonePlugin = useMemo(() => {
    return {
      id: "targetZonePlugin",
      beforeDatasetsDraw: (chart: any, args: any, options: any) => {
        const min = options.min ?? 0;
        const max = options.max ?? 100;
        const yScale = chart.scales?.y;
        const chartArea = chart.chartArea;
        if (!yScale || !chartArea) return;
        const y1 = yScale.getPixelForValue(max);
        const y2 = yScale.getPixelForValue(min);
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = "rgba(34,197,94,0.12)";
        ctx.fillRect(chartArea.left, y1, chartArea.right - chartArea.left, y2 - y1);
        ctx.restore();
      },
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      src.connect(analyser);
      const canvas = audioCanvasRef.current;
      if (canvas) {
        const draw = () => {
          const w = canvas.width;
          const h = canvas.height;
          const data = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteTimeDomainData(data);
          const ctx2 = canvas.getContext("2d");
          if (ctx2) {
            ctx2.clearRect(0, 0, w, h);
            ctx2.lineWidth = 2;
            ctx2.strokeStyle = "#60a5fa";
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
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      mr.onstop = async () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        try {
          analyserRef.current?.disconnect();
        } catch {}
        try {
          audioCtxRef.current?.close();
        } catch {}
        audioCtxRef.current = null;
        analyserRef.current = null;
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingSeconds(0);
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setLastAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        try {
          const fd = new FormData();
          fd.append("file", blob, `recording_${Date.now()}.webm`);
          fd.append("createCards", "true");
          fd.append("createNotes", "true");
          fd.append("noteFormat", displayFormatLabel);
          fd.append("length", notesLength);
          fd.append("flashCount", String(flashCount || 6));
          const r = await fetch("/api/transcribe", { method: "POST", body: fd });
          if (r.ok) {
            const json = await r.json();
            const time = new Date().toLocaleString();
            const text = json.notes || json.transcription || json.summary || "";
            if (text) {
              const insertText = `\n\n---\n\n[Audio recorded ${time}]\n\n${text}\n\n`;
              setNotes((prev) => (prev ? `${prev}${insertText}` : insertText));
              setFlashcards((prev) => {
                const serverCards = Array.isArray(json.flashcards) ? json.flashcards : [];
                if (!serverCards.length) return prev;
                return [...serverCards.slice(0, flashCount), ...prev].slice(0, Math.max(flashCount, prev.length));
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
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      };
      mr.start();
      setRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          const next = s + 1;
          if (next >= RECORDING_MAX_SECONDS) {
            try {
              mediaRecorderRef.current?.stop();
            } catch {}
            setRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
            alert("Maximum recording time reached (1 hour). Recording stopped automatically.");
            return RECORDING_MAX_SECONDS;
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
    } catch (e) {
      console.warn(e);
    }
    setRecording(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    try {
      audioCtxRef.current?.suspend();
    } catch {}
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingSeconds(0);
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

  const sendNotesToCards = async (count = 6) => {
    if (!notes || !notes.trim()) return alert("No notes to convert");
    try {
      const r = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notes, flashCount: count }),
      });
      if (!r.ok) throw new Error(`Notes request failed: ${r.status}`);
      const json = await r.json();
      if (Array.isArray(json.flashcards) && json.flashcards.length) {
        setFlashcards(json.flashcards.slice(0, flashCount));
        pushNotesSnapshot(notes);
        setCurrentFlashIndex(0);
        alert("Flashcards generated from notes.");
      } else {
        alert("No flashcards generated.");
      }
    } catch (err) {
      console.error("sendNotesToCards error", err);
      alert("Failed to generate flashcards from notes.");
    }
  };

  const handleFlashClick = (i: number) => {
    setCurrentFlashIndex(i);
    setFlashRevealed(false);
  };

  const recordingTimeDisplay = useMemo(() => {
    const sec = recordingSeconds || 0;
    const mm = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    const remaining = Math.max(0, RECORDING_MAX_SECONDS - sec);
    const rmm = Math.floor(remaining / 60)
      .toString()
      .padStart(2, "0");
    const rss = (remaining % 60).toString().padStart(2, "0");
    return { elapsed: `${mm}:${ss}`, remaining: `${rmm}:${rss}`, elapsedSec: sec };
  }, [recordingSeconds]);

  const markdownComponents = {
    table: (props: any) => (
      <div className="overflow-auto rounded-md border">
        <table className="min-w-full table-auto text-sm divide-y">
          <thead className="bg-slate-50">{props.children.props?.children?.[0]}</thead>
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
        <title>AI Notes, Flashcards, and Quizzes — VertexED</title>
        <meta name="description" content="Turn notes into smart summaries, flashcards, and quizzes. Includes audio transcription and interactive practice." />
        <link rel="canonical" href="https://www.vertexed.app/notetaker" />
      </Helmet>

      <PageSection>
        <div className="mb-6 flex items-center justify-between">
          <Link to="/main" className="neu-button px-4 py-2 text-sm transition-transform hover:scale-105 flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>Back to Main</span>
          </Link>

          <div className="flex items-center gap-3">
            <button className="neu-button px-3 py-1 text-sm transition-colors" title={showTimer ? "Hide timer" : "Show timer"} onClick={toggleTimer}>
              {showTimer ? "Hide Timer" : "Show Timer"}
            </button>
            {showTimer && <div className="text-sm text-gray-500"> Time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s </div>}
          </div>
        </div>

        <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }} className={`space-y-8 transition-all duration-300 ${appearClass}`}>
          <NeumorphicCard className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-medium mb-2 flex items-center gap-2">
                  <FileText size={18} />
                  Topic and Format
                </h2>
                <div className="text-sm text-gray-500">Create structured AI notes and exportable study material.</div>
              </div>

              <div className="ml-auto flex items-center gap-3">
                <button className="neu-button px-3 py-1 text-sm" onClick={() => pushNotesSnapshot(notes)}>
                  <Edit3 size={14} />
                  <span className="ml-2">Save Snapshot</span>
                </button>
                <div className="text-sm text-gray-500">Autosave: on</div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="neu-input">
                <input className="neu-input-el" placeholder="Enter your study topic..." value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>

              <div className="neu-input">
                <select className="neu-input-el" value={format} onChange={(e) => setFormat(e.target.value)}>
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
                <div className="mt-2 text-xs text-gray-500">Length per output may vary</div>
              </div>
            </div>

            <div className="mt-3 flex gap-3 flex-wrap">
              <button className="neu-button px-4 py-2" onClick={handleGenerateNotes} disabled={loading}>
                {loading ? "Generating..." : "Generate Notes"}
              </button>

              <button className="neu-button px-4 py-2" onClick={handleGenerateQuiz} disabled={loading || !notes} title="Quick generate quiz">
                {loading ? "..." : "Generate Quiz"}
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
                  <h2 className="text-xl font-medium flex items-center gap-2">Notes <FileText size={16} /></h2>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-sm text-gray-500 mr-2">Words: {wordCount}</div>

                    <div className="relative">
                      <button className="neu-button px-3 py-1 text-sm flex items-center gap-2" onClick={copyNotes} title="Copy notes" aria-label="Copy notes">
                        <Copy size={16} />
                        <span className="sr-only">Copy</span>
                      </button>
                      {copyToastVisible && <div className="absolute right-0 -top-10 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-sm">Copied!</div>}
                    </div>

                    <div className="ml-2 flex items-center gap-2">
                      <button className="neu-button px-3 py-1 text-sm flex items-center gap-2" onClick={() => exportToWord(notes, flashcards)}>
                        <DownloadCloud size={16} />
                        <span className="ml-1">Word</span>
                      </button>
                      <button className="neu-button px-3 py-1 text-sm flex items-center gap-2" onClick={() => exportToPDF("notes-section-export")}>
                        <DownloadCloud size={16} />
                        <span className="ml-1">PDF</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="neu-textarea max-h-[128rem] overflow-auto p-4 bg-white rounded">
                  <textarea
                    ref={notesRef}
                    className="neu-input-el w-full h-[28rem] p-4 transition-transform duration-150 whitespace-pre-wrap text-slate-900"
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Your notes will appear here. Type or generate..."
                  />

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mr-2">Insert:</div>
                    <button className="neu-button px-3 py-1 text-sm flex items-center gap-2" onClick={() => insertAtCursor("$$E = mc^2$$")}>LaTeX</button>
                    <button className="neu-button px-3 py-1 text-sm flex items-center gap-2" onClick={() => insertAtCursor("$$\\int_a^b f(x)\\,dx$$")}>Integral</button>
                    <button className="neu-button px-3 py-1 text-sm flex items-center gap-2" onClick={() => insertAtCursor("**Table (Markdown)**\n\n| Header 1 | Header 2 |\n|---|---|\n| Row1Col1 | Row1Col2 |\n")}>Table</button>
                    <button className="neu-button px-3 py-1 text-sm flex items-center gap-2" onClick={() => insertAtCursor("• Bullet 1\n• Bullet 2\n")}>Bullets</button>

                    <div className="ml-auto flex items-center gap-2">
                      <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-2">
                        <Eye size={14} />
                        <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
                      </button>
                    </div>
                  </div>

                  {showPreview && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-black">Preview</div>
                        <div className="text-xs text-gray-500">Rendered Markdown (tables, LaTeX)</div>
                      </div>
                      <div id="notes-section-export" className="overflow-auto rounded border p-3 bg-white text-black" style={{ minHeight: "24rem" }}>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>{notes || "_No content yet_"}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2 items-center">
                    <div className="text-xs text-gray-500">Tip: Use $$...$$ for LaTeX.</div>
                    <div className="ml-auto text-sm text-gray-500">Autosave</div>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                </div>
              </NeumorphicCard>
            </motion.div>

            <div className="lg:col-span-1 space-y-4">
              <NeumorphicCard className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-medium flex items-center gap-2">Flashcards <CheckCircle size={16} /></h2>
                  <div className="text-sm opacity-70">{flashcards.length} cards</div>
                </div>

                {flashcards.length ? (
                  <div className="relative">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="p-4 rounded-lg border shadow-sm bg-white" style={{ minHeight: 160 }}>
                      <div className="text-base font-semibold text-black break-words whitespace-pre-wrap">{flashcards[currentFlashIndex]?.front}</div>
                      <div className={`text-sm mt-3 transition-opacity duration-200 ${flashRevealed ? "opacity-100" : "opacity-0"}`} style={{ minHeight: 36 }}>
                        {flashRevealed ? <div className="text-black">{flashcards[currentFlashIndex]?.back}</div> : ""}
                      </div>

                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <button className="py-2 px-3 rounded-md border text-sm bg-slate-100 text-slate-900 hover:shadow-md transition-transform" onClick={prevFlash}><ChevronsLeft size={14} /> Prev</button>
                        <button className="py-2 px-3 rounded-md border text-sm bg-slate-100 text-slate-900 hover:shadow-md transition-transform" onClick={() => (flashRevealed ? nextFlash() : revealFlash())}>{flashRevealed ? "Next (revealed)" : "Reveal"}</button>
                        <button className="py-2 px-3 rounded-md border text-sm bg-slate-100 text-slate-900 hover:shadow-md transition-transform" onClick={nextFlash}><ChevronsRight size={14} /> Next</button>

                        <button className="py-2 px-3 rounded-md border text-sm bg-slate-100 text-slate-900 hover:shadow-md transition-transform ml-2" onClick={() => { setFlashFullscreen(true); setTimeout(() => setFlashRevealed(false), 50); }} title="Enlarge flashcard">Enlarge</button>

                        <div className="ml-auto text-sm text-gray-500">Card {currentFlashIndex + 1}/{flashcards.length}</div>
                      </div>
                    </motion.div>

                    <div className="mt-3 flex gap-2 items-center overflow-auto">
                      {flashcards.map((f, i) => {
                        const selected = i === currentFlashIndex;
                        const bg = selected ? "bg-sky-100" : "bg-white";
                        return (
                          <button key={`${i}_${String(f.front).slice(0, 8)}`} className={`py-2 px-3 rounded-md border text-sm ${bg} hover:scale-105 transition-transform text-slate-900`} onClick={() => handleFlashClick(i)}>{i + 1}</button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm opacity-70">Flashcards will appear here after generating notes.</p>
                )}
              </NeumorphicCard>

              <NeumorphicCard className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium flex items-center gap-2">Audio → Notes <Mic size={16} /></h3>
                  <div className="text-sm text-gray-500">Record, visualize & transcribe</div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {!recording ? (
                    <button className="neu-button px-4 py-2 bg-rose-500 text-white flex items-center gap-2" onClick={startRecording}>
                      <Mic size={16} />
                      <span>Start</span>
                    </button>
                  ) : (
                    <button className="neu-button px-4 py-2 bg-red-600 text-white flex items-center gap-2" onClick={stopRecording}>
                      <StopCircle size={16} />
                      <span>Stop</span>
                    </button>
                  )}

                  {audioURL && <audio controls src={audioURL} className="ml-2" />}

                  <div className="ml-auto flex gap-2 items-center">
                    <div className="text-xs text-gray-600 mr-2">Recording</div>
                    <div className="text-sm font-medium">{recording ? `Elapsed ${recordingTimeDisplay.elapsed}` : "Idle"}</div>
                    <div className="text-xs text-gray-500 ml-2">{recording ? `Remaining ${recordingTimeDisplay.remaining}` : ""}</div>
                    <button className="neu-button px-3 py-1 flex items-center gap-2" onClick={downloadAudio} disabled={!lastAudioBlob}><DownloadCloud size={16} /> Download</button>
                    <button className="neu-button px-3 py-1 flex items-center gap-2" onClick={() => { if (lastAudioBlob) alert("Upload handled via /api/transcribe (implement server)."); }} disabled={!lastAudioBlob}><UploadCloud size={16} /> Upload</button>
                  </div>
                </div>

                <div className="mt-3">
                  <canvas ref={audioCanvasRef} width={400} height={60} className="w-full rounded border" />
                </div>

                <div className="mt-3 text-xs text-gray-500">Recording stored locally. Record lectures and receive key points or full transcriptions.</div>
              </NeumorphicCard>

              <NeumorphicCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-medium flex items-center gap-2">Progress <BarChart2 size={16} /></h3>
                  <div className="text-sm text-gray-500">{quizHistory.length} sessions</div>
                </div>

                {quizHistory.length ? (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <label className="text-xs text-gray-700">Target min</label>
                      <input className="neu-input-el w-16" type="number" value={targetMin} onChange={(e) => setTargetMin(Number(e.target.value))} />
                      <label className="text-xs text-gray-700 ml-2">Target max</label>
                      <input className="neu-input-el w-16" type="number" value={targetMax} onChange={(e) => setTargetMax(Number(e.target.value))} />
                      <div className="text-xs text-gray-500 ml-auto">Set a target zone on the chart</div>
                    </div>
                    <div style={{ height: 140 }}>
                      <Line data={chartData} options={chartOptions} plugins={[targetZonePlugin]} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No quiz history yet. Take some quizzes to track progress.</p>
                )}
              </NeumorphicCard>
            </div>
          </div>

          {flashFullscreen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative">
                <button className="absolute right-4 top-4 neu-button px-3 py-1" onClick={() => setFlashFullscreen(false)}><X size={14} /></button>

                <div className="text-center">
                  <div className="text-3xl font-semibold mb-4 text-black">{flashcards[currentFlashIndex]?.front}</div>
                  <div className={`text-lg leading-relaxed mb-6 text-black ${flashRevealed ? "opacity-100" : "opacity-50"}`}>{flashRevealed ? flashcards[currentFlashIndex]?.back : "Click Reveal to see the answer"}</div>

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-medium">Quiz</h2>
              <div className="text-sm text-gray-500">{totalQuestions} questions • {answeredCount} answered</div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <select className="neu-input-el" value={quizType} onChange={(e) => setQuizType(e.target.value)}>
                  <option>Adaptive Learning</option>
                  <option>Knowledge Application Based</option>
                  <option>Fundemental Oriented</option>
                  <option>Exam Oriented</option>
                </select>
                <select className="neu-input-el" value={quizDifficulty} onChange={(e) => setQuizDifficulty(e.target.value)}>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <select className="neu-input-el" value={frqLength} onChange={(e) => setFrqLength(e.target.value)}>
                  <option value="short">Short FRQ</option>
                  <option value="medium">Long FRQ</option>
                  <option value="long">Multipul Choise Question</option>
                </select>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600">MCQ options</label>
                  <select className="neu-input-el" value={mcqOptionCount} onChange={(e) => setMcqOptionCount(Number(e.target.value))}>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>

                <div className="ml-auto flex items-center gap-2 flex-wrap">
                  <button className="neu-button px-4 py-2" onClick={handleGenerateQuiz} disabled={loading || !notes}>{loading ? "Generating..." : "Generate"}</button>
                  <button className="neu-button px-4 py-2" onClick={handleSubmitQuiz} disabled={!generatedQuestions.length || loading}>Submit</button>
                </div>
              </div>

              <div className="space-y-3">
                {generatedQuestions.length ? (
                  generatedQuestions.map((q: any, idx: number) => (
                    <div key={q.id || idx} className="p-4 rounded border bg-white">
                      <div className="flex items-start gap-3">
                        <div className="text-sm font-medium">Q{idx + 1}.</div>
                        <div className="flex-1">
                          <div className="mb-2 text-sm text-slate-900 break-words">{q.prompt || q.question}</div>
                          {q.type === "multiple_choice" && (
                            <div className="space-y-2">
                              {Array.isArray(q.choices) || Array.isArray(q.options) ? (
                                ((q.choices || q.options || []).slice(0, mcqOptionCount)).map((c: any, i: number) => (
                                  <label className="flex items-center gap-2" key={`${q.id}_${i}`}>
                                    <input type="radio" name={`q_${q.id}`} value={c} checked={String(userAnswers[q.id]) === String(c)} onChange={(e) => setUserAnswers((u) => ({ ...u, [q.id]: e.target.value }))} />
                                    <span className="text-sm text-slate-900">{c}</span>
                                  </label>
                                ))
                              ) : (
                                <div className="text-xs text-gray-500">No choices available for this question.</div>
                              )}
                            </div>
                          )}

                          {q.type === "frq" && (
                            <textarea className="neu-input-el mt-2 w-full" rows={4} placeholder="Write your answer..." value={userAnswers[q.id] ?? ""} onChange={(e) => setUserAnswers((u) => ({ ...u, [q.id]: e.target.value }))} />
                          )}

                          {q.type === "interactive" && (
                            <div className="space-y-2">
                              <textarea className="neu-input-el mt-2 w-full" rows={3} placeholder="Interact with the prompt..." value={userAnswers[q.id] ?? ""} onChange={(e) => setUserAnswers((u) => ({ ...u, [q.id]: e.target.value }))} />
                              <div className="text-xs text-gray-500">This item will be graded by the AI after submission.</div>
                            </div>
                          )}

                          {quizSubmitted && quizResults && Array.isArray(quizResults) && (
                            <div className="mt-3 text-sm">
                              {(() => {
                                const res = quizResults.find((r: any) => r.id === q.id);
                                if (!res) return null;
                                return (
                                  <div className="space-y-1">
                                    {typeof res.score !== 'undefined' && <div>Score: <strong>{res.score}/{res.maxScore}</strong></div>}
                                    {res.feedback && <div className="text-xs text-gray-600">Feedback: {res.feedback}</div>}
                                    {res.includes && <div className="text-xs text-gray-600">Includes: {res.includes}</div>}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded border bg-white text-sm text-gray-600">No questions yet. Generate a quiz from your notes.</div>
                )}
              </div>

              {quizSubmitted && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-sm">Accuracy: <strong>{accuracy ?? "—"}%</strong></div>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="neu-button px-3 py-1" onClick={() => { setGeneratedQuestions([]); setQuizSubmitted(false); setQuizResults(null); }}>Reset</button>
                    <button className="neu-button px-3 py-1" onClick={() => { if (quizResults) exportToWord(JSON.stringify(quizResults, null, 2), []); }}>Export Results</button>
                    <button className="neu-button px-3 py-1" onClick={() => exportToPDF("notes-section-export")}>Export PDF</button>
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
