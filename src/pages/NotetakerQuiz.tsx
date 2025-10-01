// NotetakerQuiz.tsx
import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

// exports / file helpers
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// chart
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

// animations
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * NotetakerQuiz
 * - Combines notes, flashcards, quiz, exports, audio recorder, chart, and UI niceties.
 * - Keep core logic & existing API calls intact.
 */
export default function NotetakerQuiz() {
  // --- primary note & UI state ---
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Smart Notes");
  const [customFormatText, setCustomFormatText] = useState(""); // 64 char limit for custom
  const [notes, setNotes] = useState("");
  const [notesLength, setNotesLength] = useState("medium"); // short/medium/long
  const [flashCount, setFlashCount] = useState(8); // number of flashcards (4-16)
  const [quizType, setQuizType] = useState("Interactive Quiz");
  const [quizDifficulty, setQuizDifficulty] = useState("Medium");
  const [frqLength, setFrqLength] = useState("short"); // expected FRQ length
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, any>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any[] | null>(null);

  // timer & display
  const [timeSpent, setTimeSpent] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef<any>(null);

  // undo/redo history for notes
  const [notesHistory, setNotesHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDirty, setIsDirty] = useState(false); // track unsaved changes

  // flashcard UI
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [flashRevealed, setFlashRevealed] = useState(false);
  const [flashFullscreen, setFlashFullscreen] = useState(false); // fullscreen view
  const [flashScale, setFlashScale] = useState(1);

  // notes area visibility
  const [hideNotesArea, setHideNotesArea] = useState(false);

  // copy feedback
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  // additional info for generation
  const [additionalInfo, setAdditionalInfo] = useState("");

  // inserted templates (no external libs; simple insertion)
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  // autosave debounce timer
  const autosaveTimer = useRef<any>(null);

  // quiz leniency & exam style
  const [gradingLeniency, setGradingLeniency] = useState(3); // 1-5
  const [examStyle, setExamStyle] = useState("Generic"); // IGCSE, IB, CBSE, AP, A level, Generic

  // small local UI animation flags (for entrance)
  const [mounted, setMounted] = useState(false);

  // chart history (accuracy %)
  const [quizHistory, setQuizHistory] = useState<number[]>([]);

  // audio recorder state
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [lastAudioBlob, setLastAudioBlob] = useState<Blob | null>(null);

  // ensure timer starts
  useEffect(() => {
    setMounted(true);
    timerRef.current = setInterval(() => {
      setTimeSpent((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- helpers for undo/redo: snapshot when generating notes or on explicit save ---
  const pushNotesSnapshot = (snapshot: string | undefined) => {
    setNotesHistory((h) => {
      const next = h.slice(0, historyIndex + 1);
      next.push(snapshot ?? "");
      // cap history to reasonable length
      if (next.length > 50) next.shift();
      return next;
    });
    setHistoryIndex((i) => {
      const base = i === -1 ? 0 : i + 1;
      return Math.min(base, 49);
    });
    setIsDirty(false);
  };

  // undo / redo
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

  // Save on blur or explicit user save
  const handleNotesBlur = () => {
    if (isDirty) {
      pushNotesSnapshot(notes);
    }
  };

  // Autosave snapshots (debounced) whenever notes change and isDirty
  useEffect(() => {
    if (!isDirty) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      pushNotesSnapshot(notes);
      // small subtle UI feedback could be added later
    }, 2000); // autosave after 2s of inactivity
    // cleanup is handled by other effects/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, isDirty]);

  // Insert template at textarea cursor
  const insertAtCursor = (text: string) => {
    const ta = notesRef.current;
    if (!ta) {
      // fallback: append
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
    // restore cursor after inserted text (setTimeout to allow state update)
    setTimeout(() => {
      try {
        ta.focus();
        const pos = start + text.length;
        ta.setSelectionRange(pos, pos);
      } catch (e) {}
    }, 10);
    setIsDirty(true);
  };

  // --- Export helpers (frontend only) ---
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
      // enlarge for quality
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

  // --- Generate notes + flashcards (append to typed notes if present) ---
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

      // If user already typed notes, append generated below with divider
      setNotes((prev) => {
        const trimmedPrev = (prev ?? "").trim();
        const toInsert = plainNotes.trim();
        if (!trimmedPrev) {
          return toInsert;
        }
        // append with a divider and small heading
        const divider = `\n\n---\n\n### AI-generated Notes (${format === "Custom" ? (customFormatText || "Custom") : format})\n\n`;
        return `${trimmedPrev}${divider}${toInsert}`;
      });

      // set flashcards (limit to requested count)
      setFlashcards(Array.isArray(data?.flashcards) ? data.flashcards.slice(0, flashCount) : []);

      // push snapshot to history (use the final combined notes)
      pushNotesSnapshot((notes ?? "") + "\n\n" + plainNotes);

      // reset quiz area
      setGeneratedQuestions([]);
      setUserAnswers({});
      setQuizSubmitted(false);
      setQuizResults(null);

      // reset flash UI
      setCurrentFlashIndex(0);
      setFlashRevealed(false);
    } catch (err) {
      console.error(err);
      alert("Failed to generate notes. Please try again.");
      // do not wipe user's typed notes
    } finally {
      setLoading(false);
    }
  };

  // --- Generate quiz (send difficulty & frqLength & leniency & style) ---
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

  // --- Submit quiz (local quick grading + server grading for FRQ) ---
  const handleSubmitQuiz = async () => {
    if (!generatedQuestions.length) return;

    // Quick local grading for MCQ exact matches
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
      // for interactive (short) and frq, mark for server grading
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
      // update progress chart if accuracy can be computed
      const totalScore = localResults.reduce((s: number, r: any) => s + (Number(r.score) || 0), 0);
      const totalMax = localResults.reduce((s: number, r: any) => s + (Number(r.maxScore) || 0), 0) || 0;
      const acc = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
      if (acc !== null) setQuizHistory((h) => [...h, acc]);
      return;
    }

    // Server grading
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

      // Merge localResults + grades
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
      // calculate accuracy and push to history
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

  // copying notes: show temporary toast next to the button (no alert)
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

  // Toggle timer
  const toggleTimer = () => setShowTimer((s) => !s);

  // Flashcard controls
  const nextFlash = () => {
    setFlashRevealed(false);
    setCurrentFlashIndex((i) => {
      const next = i + 1;
      return next >= flashcards.length ? 0 : next;
    });
  };
  const prevFlash = () => {
    setFlashRevealed(false);
    setCurrentFlashIndex((i) => {
      const prev = i - 1;
      return prev < 0 ? Math.max(0, flashcards.length - 1) : prev;
    });
  };
  const revealFlash = () => setFlashRevealed(true);

  // word count
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).filter(Boolean).length : 0;

  // handle textarea typed changes (mark dirty)
  const handleNotesChange = (val: string) => {
    setNotes(val);
    setIsDirty(true);
  };

  // Quiz progress indicators
  const totalQuestions = generatedQuestions.length;
  const answeredCount = generatedQuestions.filter((q) => {
    const a = userAnswers[q.id];
    return typeof a !== "undefined" && String(a).trim() !== "";
  }).length;

  // Accuracy calculation when results exist
  let accuracy = null;
  if (quizSubmitted && quizResults && Array.isArray(quizResults)) {
    const totalScore = quizResults.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const totalMax = quizResults.reduce((s, r) => s + (Number(r.maxScore) || 0), 0) || 0;
    accuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : null;
  }

  // small helpers for UI interactions
  const toggleFlashFullscreen = () => setFlashFullscreen((s) => !s);

  // determine displayed format label
  const displayFormatLabel = format === "Custom" ? (customFormatText || "Custom") : format;

  // small animation helper classes (use framer for more complex)
  const appearClass = mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2";

  // --- Audio recorder handlers (frontend only) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (ev: BlobEvent) => {
        if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setLastAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        // placeholder transcription insertion
        const time = new Date().toLocaleString();
        const placeholder = `\n\n---\n\n[Audio note recorded ${time} — placeholder transcript]\n\n`;
        setNotes((prev) => (prev ? `${prev}${placeholder}` : placeholder));
        setIsDirty(true);
        // stop tracks
        try {
          stream.getTracks().forEach((t) => t.stop());
        } catch (e) {}
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      console.error("Audio start failed", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch (e) {
      // ignore
    } finally {
      setRecording(false);
    }
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

  // color helper: button text color depending on background (flashcards)
  const flashBtnTextColor = (bgIsLight: boolean) => (bgIsLight ? "text-[#1f2937]" : "text-white");

  // Chart dataset (react-chartjs-2 expects data object)
  const chartData = {
    labels: quizHistory.map((_, i) => `Q ${i + 1}`),
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
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  // small visual helpers
  const sectionVariant = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // ensure question text is readable (use white text on dark pill, else default)
  // We've set background for question text already in original; keep it, but ensure text color = white.

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
            <button
              className="neu-button px-3 py-1 text-sm transition-colors"
              title={showTimer ? "Hide timer" : "Show timer"}
              onClick={toggleTimer}
            >
              {showTimer ? "Hide Timer" : "Show Timer"}
            </button>
            {showTimer && (
              <div className="text-sm text-gray-500"> Time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s </div>
            )}
          </div>
        </div>

        <motion.div initial="hidden" animate="visible" variants={sectionVariant} className={`space-y-8 transition-all duration-300 ${appearClass}`}>
          {/* Controls */}
          <NeumorphicCard className="p-8">
            <h2 className="text-xl font-medium mb-4">Topic and Format</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="neu-input">
                <input
                  className="neu-input-el"
                  placeholder="Enter your study topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="neu-input">
                <select
                  className="neu-input-el"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
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
                    <input
                      className="neu-input-el text-sm"
                      placeholder="Describe custom format (max 64 chars)"
                      maxLength={64}
                      value={customFormatText}
                      onChange={(e) => setCustomFormatText(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 mt-1">{customFormatText.length}/64</div>
                  </div>
                )}
              </div>

              <div className="neu-input">
                <div className="flex gap-2 items-center">
                  <select
                    className="neu-input-el"
                    value={notesLength}
                    onChange={(e) => setNotesLength(e.target.value)}
                    title="Choose short, medium or long — generator will adjust content density accordingly"
                  >
                    <option value="short">Short notes</option>
                    <option value="medium">Medium notes</option>
                    <option value="long">Long notes</option>
                  </select>

                  <select
                    className="neu-input-el"
                    value={flashCount}
                    onChange={(e) => setFlashCount(Number(e.target.value))}
                  >
                    {/* options 4..16 */}
                    {Array.from({ length: 13 }).map((_, i) => {
                      const v = 4 + i;
                      return <option key={v} value={v}>{v} flashcards</option>;
                    })}
                  </select>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Length adjusts based on selected option and the generator's heuristics.
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-3 flex-wrap">
              <button
                className="neu-button px-4 py-2"
                onClick={handleGenerateNotes}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Notes"}
              </button>

              <button
                className="neu-button px-4 py-2"
                onClick={handleGenerateQuiz}
                disabled={loading || !notes}
                title="Quick generate quiz"
              >
                {loading ? "..." : "Generate Quiz"}
              </button>

              <button
                className="neu-button px-4 py-2"
                onClick={() => {
                  pushNotesSnapshot(notes);
                  alert("Snapshot saved.");
                }}
              >
                Save Snapshot
              </button>

              <button
                className="neu-button px-4 py-2"
                onClick={undoNotes}
                disabled={historyIndex <= 0}
              >
                Undo
              </button>
              <button
                className="neu-button px-4 py-2"
                onClick={redoNotes}
                disabled={historyIndex >= notesHistory.length - 1}
              >
                Redo
              </button>

              <button
                className="neu-button px-4 py-2"
                onClick={() => setHideNotesArea((s) => !s)}
                title="Hide or show the notes editor"
              >
                {hideNotesArea ? "Show Notes" : "Hide Notes"}
              </button>

              <div className="ml-auto text-sm text-gray-500 flex items-center gap-3">
                <div>Format: <strong>{displayFormatLabel}</strong></div>
                <div className="text-xs">Autosave: on</div>
              </div>
            </div>

            {/* Additional info section */}
            <div className="mt-4">
              <label className="text-sm font-medium">Additional Information (optional)</label>
              <textarea
                className="neu-input-el mt-2 w-full"
                rows={2}
                placeholder="Anything extra for the generator? (e.g., focus on dates, include equations, exam-style hints)"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>
          </NeumorphicCard>

          {/* Notes area + sidebar templates + recorder */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Notes editor (collapsible) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: hideNotesArea ? 0.3 : 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className={`lg:col-span-2 transition-all duration-300 ${hideNotesArea ? "max-h-0 overflow-hidden" : ""}`}
            >
              <NeumorphicCard className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-medium">Notes</h2>

                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500 mr-2">Words: {wordCount}</div>

                    <div className="relative">
                      <button
                        className="neu-button px-3 py-1 text-sm flex items-center gap-2"
                        onClick={copyNotes}
                        title="Copy notes"
                        aria-label="Copy notes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block">
                          <rect x="9" y="4" width="10" height="14" rx="2" ry="2"></rect>
                          <path d="M5 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"></path>
                        </svg>
                        <span className="sr-only">Copy</span>
                      </button>

                      {/* Copy toast appears next to button for 3 seconds */}
                      {copyToastVisible && (
                        <div className="absolute right-0 -top-10 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-sm animate-fade-in">
                          Copied!
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div id="notes-section" className="neu-textarea max-h-[128rem] overflow-auto p-4 bg-white rounded">
                  <textarea
                    ref={notesRef}
                    className="neu-input-el w-full h-[36rem] p-4 transition-transform duration-150 hover:scale-[1.001] whitespace-pre-wrap"
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    onBlur={handleNotesBlur}
                    placeholder="Your notes will appear here. Type or generate..."
                  />
                </div>

                {/* Mini sidebar / toolbar for inserting LaTeX/tables/charts */}
                <div className="mt-3 flex gap-2 items-center">
                  <span className="text-sm text-gray-600 mr-2">Insert:</span>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("$$E = mc^2$$")}>LaTeX</button>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("$$\\int_a^b f(x)\\,dx$$")}>Integral</button>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("**Table (Markdown)**\n\n| Header 1 | Header 2 |\n|---|---|\n| Row1Col1 | Row1Col2 |\n")}>Table</button>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("**Chart**\n\n- type: bar\n- labels: [A, B, C]\n- values: [10, 20, 30]\n")}>Chart</button>
                  <button className="neu-button px-3 py-1 text-sm" onClick={() => insertAtCursor("• Bullet 1\n• Bullet 2\n")}>Bullets</button>

                  <div className="ml-auto text-sm text-gray-500">Tip: Use $$...$$ for LaTeX rendering.</div>
                </div>

                {/* Export buttons inline beneath notes */}
                <div className="mt-4 flex gap-2 items-center">
                  <button onClick={() => exportToWord(notes, flashcards)} className="neu-button px-4 py-2 bg-blue-600 text-white hover:shadow-md">
                    Export Word
                  </button>
                  <button onClick={() => exportToPDF("notes-section")} className="neu-button px-4 py-2 bg-sky-600 text-white hover:shadow-md">
                    Export PDF
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <div className="text-sm text-gray-500">Autosave</div>
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                  </div>
                </div>
              </NeumorphicCard>
            </motion.div>

            {/* Right column: Flashcards + Recorder + Compact Chart */}
            <div className="lg:col-span-1 space-y-4">
              <NeumorphicCard className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-medium">Flashcards</h2>
                  <div className="text-sm opacity-70">{flashcards.length} cards</div>
                </div>

                {flashcards.length ? (
                  <>
                    <div className="relative">
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="p-4 rounded-lg border shadow-sm bg-white"
                        style={{ minHeight: 140 }}
                      >
                        <div className="text-base font-semibold text-[#0f172a]">{flashcards[currentFlashIndex]?.front}</div>
                        <div className={`text-sm mt-3 transition-opacity duration-200 ${flashRevealed ? "opacity-100" : "opacity-0"}`}>
                          {flashRevealed ? flashcards[currentFlashIndex]?.back : ""}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button className={`neu-button px-3 py-1 ${flashBtnTextColor(true)}`} onClick={prevFlash}>Previous</button>
                          <button
                            className={`neu-button px-3 py-1 ${flashBtnTextColor(true)}`}
                            onClick={() => (flashRevealed ? nextFlash() : revealFlash())}
                          >
                            {flashRevealed ? "Next (revealed)" : "Reveal"}
                          </button>
                          <button className={`neu-button px-3 py-1 ${flashBtnTextColor(true)}`} onClick={nextFlash}>Next</button>

                          <button
                            className="neu-button px-3 py-1 ml-2 text-sky-700"
                            onClick={() => {
                              setFlashFullscreen(true);
                              setTimeout(() => setFlashRevealed(false), 50);
                            }}
                            title="Enlarge flashcard"
                          >
                            Enlarge
                          </button>

                          <div className="ml-auto text-sm text-gray-500">Card {currentFlashIndex + 1}/{flashcards.length}</div>
                        </div>
                      </motion.div>

                      {/* small stack preview */}
                      <div className="mt-3 flex gap-2 items-center overflow-auto">
                        {flashcards.map((f, i) => {
                          const selected = i === currentFlashIndex;
                          const bg = selected ? "bg-sky-100" : "bg-white";
                          const txt = selected ? "text-sky-800" : "text-[#1f2937]";
                          return (
                            <button
                              key={i}
                              className={`py-2 px-3 rounded-md border text-sm ${bg} hover:scale-105 transition-transform ${txt}`}
                              onClick={() => { setCurrentFlashIndex(i); setFlashRevealed(false); }}
                            >
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

              {/* Audio recorder */}
              <NeumorphicCard className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Audio → Notes</h3>
                  <div className="text-sm text-gray-500">Record and generate transcript (placeholder)</div>
                </div>

                <div className="flex items-center gap-3">
                  {!recording ? (
                    <button className="neu-button px-4 py-2 bg-rose-500 text-white" onClick={startRecording}>
                      🎙️ Start
                    </button>
                  ) : (
                    <button className="neu-button px-4 py-2 bg-red-600 text-white" onClick={stopRecording}>
                      ⏹ Stop
                    </button>
                  )}

                  {audioURL && <audio controls src={audioURL} className="ml-2" />}

                  <div className="ml-auto flex gap-2">
                    <button className="neu-button px-3 py-1" onClick={downloadAudio} disabled={!lastAudioBlob}>Download</button>
                    <button className="neu-button px-3 py-1" onClick={() => {
                      if (lastAudioBlob) {
                        // send to server later for transcription
                        alert("You can later upload this audio to your backend for transcription.");
                      }
                    }} disabled={!lastAudioBlob}>
                      Upload
                    </button>
                  </div>
                </div>

                <p className="text-xs mt-3 text-gray-500">Recording stored locally. Placeholder: a short note is appended to your notes after stop. Replace with server transcription later.</p>
              </NeumorphicCard>

              {/* Compact progress chart */}
              <NeumorphicCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-medium">Progress</h3>
                  <div className="text-sm text-gray-500">{quizHistory.length} sessions</div>
                </div>

                {quizHistory.length ? (
                  <div style={{ height: 140 }}>
                    <Line data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No quiz history yet. Take some quizzes to track progress.</p>
                )}
              </NeumorphicCard>
            </div>
          </div>

          {/* Flashcard fullscreen modal */}
          {flashFullscreen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.18 }} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative">
                <button className="absolute right-4 top-4 neu-button px-3 py-1" onClick={() => setFlashFullscreen(false)}>Close</button>

                <div className="text-center">
                  <div className="text-3xl font-semibold mb-4">{flashcards[currentFlashIndex]?.front}</div>
                  <div className={`text-lg leading-relaxed mb-6 ${flashRevealed ? "opacity-100" : "opacity-0"}`}>
                    {flashRevealed ? flashcards[currentFlashIndex]?.back : "Click Reveal to see the answer"}
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button className="neu-button px-4 py-2" onClick={prevFlash}>Previous</button>
                    <button className="neu-button px-4 py-2" onClick={() => (flashRevealed ? nextFlash() : revealFlash())}>
                      {flashRevealed ? "Next" : "Reveal"}
                    </button>
                    <button className="neu-button px-4 py-2" onClick={nextFlash}>Next</button>
                  </div>

                  <div className="mt-6 text-sm text-gray-600">Card {currentFlashIndex + 1}/{flashcards.length}</div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Below notes: Quiz area (large) */}
          <NeumorphicCard className="p-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-medium">Quiz</h2>
              <div className="text-sm opacity-70">Type: {quizType}</div>
            </div>

            <div className="flex gap-3 flex-wrap mb-4">
              {["Interactive Quiz", "Multiple Choice", "FRQ"].map((type) => (
                <button
                  key={type}
                  className={`neu-button px-4 py-3 ${quizType === type ? "bg-sky-100 text-sky-800" : ""}`}
                  onClick={() => setQuizType(type)}
                >
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
                      <div className="font-medium text-white bg-gray-800 inline-block px-2 py-1 rounded-md">
                        {`Q${q.id}: ${q.question}`}
                      </div>

                      {/* Multiple Choice */}
                      {q.type === "multiple_choice" && q.options?.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                          {q.options.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`q${q.id}`}
                                value={opt}
                                checked={userAnswers[q.id] === opt}
                                onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                              />
                              <span className="ml-1 text-slate-800">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Interactive / FRQ */}
                      {(q.type === "interactive" || q.type === "frq") && (
                        <textarea
                          placeholder="Write your answer..."
                          value={userAnswers[q.id] || ""}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                          className="neu-input-el mt-2 w-full"
                        />
                      )}

                      {/* After submit, show result */}
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
                                    <div className="text-sm text-gray-600 mt-1">
                                      <strong>Should include:</strong> {r.includes}
                                    </div>
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
                      <button className="neu-button mt-2 px-4 py-2" onClick={() => { setQuizSubmitted(false); setQuizResults(null); }}>{"Retake / Clear Results"}</button>

                      {/* chart - larger view */}
                      {quizHistory.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-md font-medium mb-2">Progress Over Time</h3>
                          <div style={{ height: 220 }}>
                            <Line data={chartData} options={chartOptions} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm opacity-70">Generate a quiz to see questions here.</p>
              )}
            </div>

            {/* Place a prominent generate quiz button at the bottom as requested */}
            <div className="mt-6 flex justify-end">
              <button className="neu-button px-6 py-3" onClick={handleGenerateQuiz} disabled={loading || !notes}>
                {loading ? "Generating..." : "Generate Quiz"}
              </button>
            </div>
          </NeumorphicCard>
        </motion.div>
      </PageSection>
    </>
  );
}
