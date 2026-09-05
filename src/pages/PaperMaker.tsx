import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, FileText, ImagePlus, Download, Grid, FileArchive, Clock, Eye, EyeOff, X } from "lucide-react";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";
import { authFetch } from "@/lib/apiAuth";
import MockExamMode from "@/components/MockExamMode";
import { saveStudyArtifact, consumeArtifactRestore } from "@/lib/userContent";
import { recordStudySession } from "@/lib/studyStats";
import { recordLoopStep } from "@/lib/studyLoopTracker";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  BOARD_CONFIGS,
  EXAM_BOARDS,
  boardToApiLabel,
  daysUntilExam,
  getCurriculumPreference,
  getGradesForBoard,
  getSubjectsForBoard,
} from "@/lib/curriculum";
import type { ExamBoard } from "@/types/curriculum";

export default function PaperMaker({ priorPapers = [] }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [board, setBoard] = useState<ExamBoard>("IB_MYP");
  const [grade, setGrade] = useState(null);
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState("");
  const [topicTags, setTopicTags] = useState([]);
  const [marks, setMarks] = useState(50);
  const [numQuestions, setNumQuestions] = useState(10);
  const [format, setFormat] = useState("Mixed Format");
  const [difficulty, setDifficulty] = useState(2);
  const [criteria, setCriteria] = useState("");
  const [useCriteria, setUseCriteria] = useState(false);
  const [anythingElse, setAnythingElse] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paper, setPaper] = useState(null);
  const [raw, setRaw] = useState(null);
  const [showMarkScheme, setShowMarkScheme] = useState(false);
  const [mockExamOpen, setMockExamOpen] = useState(false);
  const [mockCramMode, setMockCramMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const examDaysLeft = daysUntilExam(getCurriculumPreference(user).examDate);

  const previewRef = useRef(null);
  const prevBoardRef = useRef(board);
  const boardApiLabel = boardToApiLabel(board);
  const criteriaOptions = BOARD_CONFIGS[board].criteria ?? [];

  const gradesForBoard = useMemo(() => getGradesForBoard(board), [board]);

  const subjectsForBoard = useMemo(() => getSubjectsForBoard(board, grade), [board, grade]);

  useEffect(() => {
    const pref = user?.user_metadata;
    if (!pref) return;
    const rawBoard = pref.board ?? (pref.preferences as Record<string, unknown> | undefined)?.board;
    if (typeof rawBoard === "string" && EXAM_BOARDS.includes(rawBoard as ExamBoard)) {
      setBoard(rawBoard as ExamBoard);
    }
    const rawGrade = pref.grade ?? (pref.preferences as Record<string, unknown> | undefined)?.grade;
    if (typeof rawGrade === "number") setGrade(rawGrade);
    else if (typeof rawGrade === "string" && rawGrade) setGrade(Number(rawGrade));
    const rawSubjects = pref.subjects ?? (pref.preferences as Record<string, unknown> | undefined)?.subjects;
    if (Array.isArray(rawSubjects) && rawSubjects[0]) setSubject(String(rawSubjects[0]));
  }, [user]);

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (!subjectParam) return;
    setSubject((current) => current || subjectParam);
    const topicParam = searchParams.get("topic");
    if (topicParam) {
      setTopics((current) => current || topicParam);
    }
    if (searchParams.get("cram") === "1") {
      setMockCramMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const restored = consumeArtifactRestore();
    if (!restored || restored.kind !== "paper") return;
    const paperData = (restored.payload?.paper ?? restored.payload) as Record<string, unknown> | null;
    if (paperData && typeof paperData === "object") {
      setPaper(paperData);
      setSaveStatus("Restored from saved work");
      toast({ title: "Paper restored", description: restored.title || "Your saved paper is ready." });
    }
  }, []);

  useEffect(() => {
    if (prevBoardRef.current === board) return;
    prevBoardRef.current = board;
    setGrade(null);
    setSubject("");
    setTopics("");
    setTopicTags([]);
    setMarks(50);
    setNumQuestions(10);
    setFormat("Mixed Format");
    setDifficulty(2);
    setCriteria("");
    setUseCriteria(board === "IB_MYP" || board === "IB_DP");
    setAnythingElse("");
    setFiles([]);
    setPaper(null);
    setRaw(null);
    setShowMarkScheme(false);
    setError("");
  }, [board]);

  useEffect(() => {
    const tags = topics.split(",").map((t) => t.trim()).filter(Boolean);
    setTopicTags(tags);
  }, [topics]);

  const formComplete = useMemo(() => {
    if (!board) return false;
    if (!grade) return false;
    if (!subject) return false;
    if (useCriteria && !criteria) return false;
    if (!useCriteria && (marks === null || marks < 32 || marks > 100)) return false;
    return true;
  }, [board, grade, subject, useCriteria, criteria, marks]);

  async function handleFilesChange(ev) {
    const list = Array.from(ev.target.files || []);
    const converted = await Promise.all(list.map(fileToBase64Safe));
    const valid = converted.filter(Boolean);
    if (valid.length) setFiles((prev) => [...prev, ...valid]);
    ev.target.value = "";
  }

  async function fileToBase64Safe(file) {
    const maxBytes = 3 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File ${file.name} is larger than ${Math.round(maxBytes / 1024)} KB; please reduce size.`);
      return null;
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const b64 = typeof result === "string" ? result.split(",")[1] : null;
        resolve({ name: file.name, mime: file.type, b64 });
      };
      reader.onerror = () => resolve({ name: file.name, mime: file.type, b64: null });
      reader.readAsDataURL(file);
    });
  }

  async function handleGenerate(e) {
    e?.preventDefault?.();
    setError("");
    setLoading(true);
    setPaper(null);
    setRaw(null);
    setShowMarkScheme(false);

    const payload = {
      board: boardApiLabel,
      grade,
      subject,
      topics: topicTags,
      marks: useCriteria ? null : marks,
      criteria: useCriteria ? criteria : null,
      numQuestions,
      format,
      difficulty: difficulty === 1 ? "Easy" : difficulty === 2 ? "Medium" : "Hard",
      anythingElse,
      priorPapers,
      images: files.map((f) => ({ name: f.name, mime: f.mime, b64: f.b64 })),
    };

    try {
      const res = await authFetch("/api/paper-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Generation failed");
        setRaw(data?.raw ?? null);
        return;
      }

      let paperData = data.paper;
      if (typeof paperData === "string") {
        try {
          paperData = JSON.parse(paperData);
        } catch {
          setRaw(paperData);
          setError("Could not parse generated paper JSON.");
          return;
        }
      }

      if (paperData && typeof paperData === "object") {
        paperData = { ...paperData, generation: data?.generation ?? null };
        setPaper(paperData);
        setRaw(null);
        if (data?.generation?.degraded) {
          setSaveStatus("Deterministic fallback — verify against the current syllabus");
          toast({
            title: "Practice scaffold generated",
            description: "The AI provider was unavailable. Questions contain no asserted factual answer key and require syllabus verification.",
          });
        }
        recordStudySession();
        recordLoopStep("practise");
        const title = paperData.title || `${boardApiLabel} ${subject} paper`;
        saveStudyArtifact("paper", title, {
          paper: paperData,
          board: boardApiLabel,
          subject,
          grade,
          provenance: paperData.provenance ?? null,
          generation: data?.generation ?? null,
        }).then((r) => {
          if (r.ok) {
            setSaveStatus(r.localOnly ? "Saved on this device" : "Saved to your account");
            toast({
              title: r.localOnly ? "Saved on this device" : "Paper saved",
              description: r.localOnly
                ? "Cloud sync pending — your paper is stored locally for now."
                : "Your mock paper is in your account.",
            });
          } else if (r.error) {
            toast({
              title: "Save failed",
              description: r.error,
              variant: "destructive",
            });
          }
        });
      } else if (data.raw) {
        setRaw(data.raw);
      } else {
        setError("Generation returned an unexpected format.");
      }
    } catch (err) {
      console.error("Paper generation failed", err);
      setError("The paper could not be generated. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function exportPDF() {
    if (!paper && !previewRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;
      const node = previewRef.current;
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(imgData, "PNG", (pageWidth - w) / 2, 20, w, h);
      pdf.save(`${(paper?.title || "practice-paper").replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      setError("PDF export failed: " + String(err));
    }
  }

  async function exportDocx(includeMarkScheme = false) {
    if (!paper) return;
    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const { saveAs } = await import("file-saver");
      const children = [
        new Paragraph({ children: [new TextRun({ text: paper.title || "Practice Paper", bold: true, size: 28 })] }),
        new Paragraph(""),
        new Paragraph({ children: [new TextRun({ text: `Board: ${paper?.metadata?.board || ""}` })] }),
        new Paragraph({ children: [new TextRun({ text: `Grade: ${paper?.metadata?.grade || ""}` })] }),
        new Paragraph(""),
        ...flattenSectionsToParagraphs(paper.sections || [], Paragraph, TextRun, includeMarkScheme),
        ...(includeMarkScheme && paper.rubricNotes?.length
          ? [
              new Paragraph({ children: [new TextRun({ text: "Mark scheme notes", bold: true, size: 24 })] }),
              ...paper.rubricNotes.map((note) => new Paragraph({ text: `• ${note}` })),
            ]
          : []),
      ];
      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const suffix = includeMarkScheme ? "_mark_scheme" : "_question_paper";
      saveAs(blob, `${(paper?.title || "practice-paper").replace(/\s+/g, "_")}${suffix}.docx`);
    } catch (err) {
      setError("DOCX export failed: " + String(err));
    }
  }

  function flattenSectionsToParagraphs(sections, Paragraph, TextRun, includeMarkScheme = false) {
    const paras = [];
    for (const s of sections) {
      paras.push(new Paragraph({ children: [new TextRun({ text: s.title || "", bold: true })] }));
      if (s.instructions) paras.push(new Paragraph(s.instructions));
      for (const q of s.questions || []) {
        paras.push(new Paragraph({ children: [new TextRun({ text: `Q: ${q.question}`, break: 1 })] }));
        if (includeMarkScheme && q.modelAnswerOutline) {
          paras.push(new Paragraph({ children: [new TextRun({ text: `Marking guidance: ${q.modelAnswerOutline}` })] }));
        }
        paras.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
      }
      paras.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
    }
    return paras;
  }

  return (
    <>
      <Helmet>
        <title>IB/IGCSE Practice Paper Generator — VertexED</title>
        <meta name="description" content="Create board-shaped IB, IGCSE, CBSE, and A-Level practice papers, then attempt them under time and review your answers." />
        <link rel="canonical" href="https://www.vertexed.app/paper-maker" />
        <meta property="og:title" content="IB/IGCSE Practice Paper Generator — VertexED" />
        <meta property="og:description" content="Build configurable practice papers with a separate mark scheme and timed attempt mode." />
        <meta property="og:url" content="https://www.vertexed.app/paper-maker" />
        <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
      </Helmet>

      <PageSection>
        <div className="mb-6 flex items-center gap-3">
          <Link to="/main" className="neu-button px-4 py-2 text-sm flex items-center gap-2">
            <ArrowLeft size={14} /> <span>Back to Main</span>
          </Link>
          <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
            <Sparkles size={14} aria-hidden /> <span>Exam-aligned practice</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <NeumorphicCard className="p-6 min-h-[28rem]" title="Paper configuration" info="Choose a board, course level, subject, topics, and assessment shape. Add constraints only when they change the questions you need.">
            <form className="grid gap-5" onSubmit={handleGenerate}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paper-board" className="form-label">Board</label>
                  <div className="neu-input">
                  <select id="paper-board" className="neu-input-el" value={board} onChange={(e) => setBoard(e.target.value as ExamBoard)}>
                    {EXAM_BOARDS.map((b) => <option key={b} value={b}>{BOARD_CONFIGS[b].label}</option>)}
                  </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="paper-grade" className="form-label">Grade</label>
                  <div className="neu-input">
                  <select id="paper-grade" className="neu-input-el" value={grade ?? ""} onChange={(e) => setGrade(Number(e.target.value))}>
                    <option value="">Select Grade</option>
                    {gradesForBoard.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="paper-subject" className="form-label">Subject</label>
                <div className="neu-input">
                <select id="paper-subject" className="neu-input-el" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!grade}>
                  <option value="">Select Subject</option>
                  {subjectsForBoard.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                </div>
              </div>

              <div>
                <label htmlFor="paper-topics" className="form-label">Topics</label>
                <div className="neu-input">
                  <input id="paper-topics" className="neu-input-el" placeholder="e.g. cell respiration, stoichiometry" value={topics} onChange={(e) => setTopics(e.target.value)} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">{topicTags.map(t => <span key={t} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">{t}</span>)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {useCriteria ? (
                  <div>
                    <label htmlFor="paper-criteria" className="form-label">Criteria or component</label>
                    <div className="neu-input">
                    <select id="paper-criteria" className="neu-input-el" value={criteria} onChange={(e) => setCriteria(e.target.value)}>
                      <option value="">Select Criteria / Component</option>
                      {(criteriaOptions).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Criteria mode hides total marks and uses rubric weightings.</div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="paper-marks" className="form-label">Total marks</label>
                    <div className="neu-input"><input id="paper-marks" className="neu-input-el" type="number" min={32} max={100} value={marks ?? ""} onChange={(e) => setMarks(Number(e.target.value))} /></div>
                  </div>
                )}
                <div>
                  <label htmlFor="paper-question-count" className="form-label">Number of questions</label>
                  <div className="neu-input"><input id="paper-question-count" className="neu-input-el" type="number" min={1} max={100} value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="paper-format" className="form-label">Question format</label>
                  <div className="neu-input">
                  <select id="paper-format" className="neu-input-el" value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option>Mixed Format</option>
                    <option>Short Answer Only</option>
                    <option>Structured Questions</option>
                    <option>Essay Format</option>
                  </select>
                  </div>
                </div>

                <div className="neu-input p-4">
                  <label htmlFor="paper-difficulty" className="form-label">Difficulty</label>
                  <input id="paper-difficulty" className="w-full" type="range" min={1} max={3} step={1} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Easy</span><span>Medium</span><span>Hard</span></div>
                </div>
              </div>

              <div>
                <label htmlFor="paper-notes" className="form-label">Additional instructions <span className="font-normal text-muted-foreground">(optional)</span></label>
                <div className="neu-input"><textarea id="paper-notes" className="neu-input-el h-20" value={anythingElse} onChange={(e) => setAnythingElse(e.target.value)} placeholder="Teacher notes, style preferences, or past-paper references" /></div>
              </div>

              <div className="neu-input">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <ImagePlus aria-hidden /> <span>Attach diagrams <span className="text-muted-foreground">(optional)</span></span>
                  <input type="file" className="sr-only" accept="image/*" multiple onChange={handleFilesChange} />
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {files.map((f, fileIndex) => {
                    const src = f.b64 ? `data:${f.mime};base64,${f.b64}` : null;
                    return (
                      <div key={`${f.name}-${fileIndex}`} className="relative flex flex-col items-center rounded-lg border border-border/60 bg-muted/40 p-2 text-xs">
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-md bg-background/90 p-1 text-muted-foreground hover:text-foreground"
                          aria-label={`Remove ${f.name}`}
                          onClick={() => setFiles((current) => current.filter((_, index) => index !== fileIndex))}
                        >
                          <X className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        {src ? <img src={src} alt={f.name} style={{ maxWidth: 120, maxHeight: 80, objectFit: 'contain' }} /> : <FileArchive />}
                        <div className="mt-1 truncate w-full text-center text-sm">{f.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && <div className="alert-error text-sm" role="alert">{error}</div>}

              <button className={`neu-button py-4 text-lg font-medium flex items-center justify-center gap-3 ${formComplete ? "" : "opacity-50 cursor-not-allowed"}`} disabled={!formComplete || loading} type="submit">
                <FileText size={16} aria-hidden /> {loading ? "Generating…" : "Generate practice paper"}
              </button>
            </form>
          </NeumorphicCard>

          <NeumorphicCard className="p-6 min-h-[28rem]" title="Question paper" info="Questions stay separate from marking guidance. Attempt the paper under time before revealing or exporting its mark scheme.">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="neu-surface inset p-6 rounded-2xl h-full overflow-auto">
              {!paper && !raw ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                  <p className="text-lg mb-4">Your custom practice paper preview will appear here</p>
                  <p className="text-sm opacity-80">After generation you can export to PDF or Word.</p>
                </div>
              ) : raw && !paper ? (
                <div className="text-sm text-amber-700 dark:text-amber-300"><pre className="whitespace-pre-wrap">{raw}</pre></div>
              ) : (
                <div>
                  <div ref={previewRef} id="paper-preview" className="space-y-4 text-foreground">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{paper.title || `${paper.metadata.board} — Grade ${paper.metadata.grade}`}</h3>
                        <div className="text-sm text-muted-foreground">{paper.metadata.subject} • {paper.metadata.format} • {paper.metadata.numQuestions} questions</div>
                      </div>
                      <div className="text-xs text-muted-foreground">Generated: {new Date().toLocaleString()}</div>
                    </div>

                    <div className="surface-tile p-4">
                      <div className="text-sm text-muted-foreground mb-2">Specification</div>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>Topics: {(topicTags.length ? topicTags.join(", ") : "(none)")}</li>
                        <li>Total marks: {paper.metadata.totalMarks ?? "(criteria-based)"}</li>
                        <li>Criteria / component: {paper.metadata.criteriaMode ? "Criteria-mode" : "Fixed marks"}</li>
                        <li>Difficulty: {paper.metadata.difficulty}</li>
                      </ul>
                    </div>

                    {paper.generation?.degraded ? (
                      <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200" role="status">
                        Deterministic fallback scaffold — the AI provider was unavailable. Verify every prompt and rubric note against the current syllabus before timed or graded use.
                      </div>
                    ) : null}

                    {paper.sections?.map((s) => (
                      <div key={s.id} className="surface-tile p-4">
                        <div className="font-medium mb-2">{s.title}</div>
                        {s.instructions && <div className="text-sm text-muted-foreground mb-2">{s.instructions}</div>}
                        <ol className="list-decimal pl-6 space-y-3">
                          {s.questions.map((q) => (
                            <li key={q.id}>
                              <div className="font-medium">{q.question}</div>
                              <div className="text-xs text-muted-foreground">Marks: {q.marks ?? "(see criteria)"} • Time: {q.approxTime ?? "—"}</div>
                              {showMarkScheme && q.modelAnswerOutline ? (
                                <div className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-foreground">
                                  <span className="font-medium">Marking guidance:</span> {q.modelAnswerOutline}
                                </div>
                              ) : null}
                              {q.imageRefs?.length ? (
                                <div className="mt-2 space-x-2">
                                  {q.imageRefs.map((n) => {
                                    const img = (paper.images || []).find(i => i.name === n);
                                    if (!img) return <span key={n} className="text-xs text-muted-foreground">[missing image: {n}]</span>;
                                    const src = img.b64 ? `data:${img.mime};base64,${img.b64}` : img.url;
                                    return <img key={n} src={src} alt={img.caption || n} style={{ maxWidth: 320, display: "block", marginTop: 8 }} />;
                                  })}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}

                    {showMarkScheme && paper.rubricNotes?.length ? <div className="surface-tile p-3"><div className="font-medium text-foreground">Mark scheme notes</div><ul className="list-disc pl-5 text-sm text-muted-foreground">{paper.rubricNotes.map((r,i)=> <li key={i}>{r}</li>)}</ul></div> : null}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" className="neu-button flex items-center gap-2 px-4 py-2" onClick={() => setShowMarkScheme((current) => !current)} aria-expanded={showMarkScheme}>
                      {showMarkScheme ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                      {showMarkScheme ? "Hide mark scheme" : "Reveal mark scheme"}
                    </button>
                    <button type="button" className="neu-button flex items-center gap-2 px-4 py-2" onClick={exportPDF}><Download size={16} aria-hidden />Question PDF</button>
                    <button type="button" className="neu-button flex items-center gap-2 px-4 py-2" onClick={() => void exportDocx(false)}><Download size={16} aria-hidden />Question Word</button>
                    <button type="button" className="neu-button flex items-center gap-2 px-4 py-2" onClick={() => void exportDocx(true)}><Download size={16} aria-hidden />Mark scheme Word</button>
                    <button type="button" className="neu-button flex items-center gap-2 border-primary/25 bg-primary/15 px-4 py-2" onClick={() => { setMockCramMode(false); setMockExamOpen(true); }}>
                      <Clock size={16} />Take timed exam
                    </button>
                    {examDaysLeft !== null && examDaysLeft >= 0 && examDaysLeft <= 7 && (
                      <button type="button" className="neu-button flex items-center gap-2 border-amber-400/25 bg-amber-500/15 px-4 py-2" onClick={() => { setMockCramMode(true); setMockExamOpen(true); }}>
                        <Clock size={16} />Cram mock ({examDaysLeft}d left)
                      </button>
                    )}
                    {saveStatus && <span className="text-xs text-emerald-400">{saveStatus}</span>}
                    <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2"><Grid size={14} /> <span>{(paper?.sections || []).reduce((c, s) => c + (s.questions?.length || 0), 0)} questions</span></div>
                  </div>
                </div>
              )}
            </motion.div>
          </NeumorphicCard>
        </div>
      </PageSection>

      {mockExamOpen && paper && (
        <MockExamMode
          paper={paper}
          board={board}
          subject={subject}
          grade={grade}
          cramMode={mockCramMode}
          onClose={() => setMockExamOpen(false)}
        />
      )}
    </>
  );
}
