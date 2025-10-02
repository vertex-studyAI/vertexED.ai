import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, FileText, ImagePlus, Download } from "lucide-react";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function PaperMaker({ priorPapers = [] /* optional array of prior paper text/summaries */ }) {
  const BOARDS = ["IB MYP", "IB DP", "IGCSE", "A Levels", "CBSE", "ICSE"];
  const GRADE_RANGES = {
    "IB MYP": range(6, 10),
    IGCSE: range(6, 10),
    "IB DP": range(11, 12),
    "A Levels": range(11, 12),
    CBSE: range(6, 12),
    ICSE: range(6, 12),
  };
  const SUBJECTS = {
    "IB MYP": ["Physics", "Chemistry", "Biology", "History", "Geography", "Math Standard", "Language and Literature", "Spanish", "French", "Hindi"],
    "IB DP": ["History", "Geography", "Math AA", "Math AI", "Business Management", "Economics", "IB English Literature", "Language B - Spanish", "Language B - German", "Language B - French", "Language B - Hindi", "Language AB Initio - Spanish"],
    IGCSE: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Business Studies", "Computer Science", "Economics"],
    "A Levels": ["Mathematics", "Further Mathematics", "Physics", "Chemistry", "Biology", "Economics", "History", "English Literature", "Business", "Computer Science"],
    CBSE: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Social Science", "Computer Science"],
    ICSE: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Computer Applications"],
  };
  const CRITERIA = {
    "IB MYP": ["Criterion A", "Criterion B", "Criterion C", "Criterion D"],
    "IB DP": ["Paper 1", "Paper 2", "Internal Assessment", "Extended Essay"],
  };

  // form state
  const [board, setBoard] = useState(BOARDS[0]);
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
  const [files, setFiles] = useState([]); // { name, mime, b64 }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paper, setPaper] = useState(null);
  const [raw, setRaw] = useState(null);

  const previewRef = useRef();

  const gradesForBoard = useMemo(() => GRADE_RANGES[board] || [], [board]);

  const subjectsForBoard = useMemo(() => {
    let list = SUBJECTS[board] ? [...SUBJECTS[board]] : [];
    if (board === "IB MYP") {
      if (grade === 10 && !list.includes("Math Extended")) list.push("Math Extended");
      if (grade >= 8 && grade <= 10) {
        ["Spanish (Extended)", "French (Extended)", "Hindi (Extended)"].forEach((s) => {
          if (!list.includes(s)) list.push(s);
        });
      }
    }
    return list;
  }, [board, grade]);

  // reset dependents when board changes
  useEffect(() => {
    setGrade(null);
    setSubject("");
    setTopics("");
    setTopicTags([]);
    setMarks(50);
    setNumQuestions(10);
    setFormat("Mixed Format");
    setDifficulty(2);
    setCriteria("");
    setUseCriteria(board === "IB MYP" || board === "IB DP");
    setAnythingElse("");
    setFiles([]);
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

  // convert FileList to base64 array
  async function handleFilesChange(ev) {
    const list = Array.from(ev.target.files || []);
    const converted = await Promise.all(list.map(fileToBase64Safe));
    setFiles(converted);
  }

  // file -> { name, mime, b64 }
  async function fileToBase64Safe(file) {
    const maxBytes = 3 * 1024 * 1024; // 3MB
    if (file.size > maxBytes) {
      // try to continue but warn user
      setError(`File ${file.name} is larger than ${Math.round(maxBytes / 1024)} KB; please reduce size.`);
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // result is data:<mime>;base64,AAAA...
        const b64 = typeof result === "string" ? result.split(",")[1] : null;
        resolve({ name: file.name, mime: file.type, b64 });
      };
      reader.onerror = () => resolve({ name: file.name, mime: file.type, b64: null });
      reader.readAsDataURL(file);
    });
  }

  // call API
  async function handleGenerate(e) {
    e?.preventDefault?.();
    setError("");
    setLoading(true);
    setPaper(null);
    setRaw(null);

    const payload = {
      board,
      grade,
      subject,
      topics: topicTags,
      marks: useCriteria ? null : marks,
      criteria: useCriteria ? criteria : null,
      numQuestions,
      format,
      difficulty: difficulty === 1 ? "Easy" : difficulty === 2 ? "Medium" : "Hard",
      anythingElse,
      priorPapers, // optional: pass-in prop or populate dynamically elsewhere
      images: files.map((f) => ({ name: f.name, mime: f.mime, b64: f.b64 })),
    };

    try {
      const res = await fetch("/api/paper-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      if (!data.success) {
        setError(data.error || "Generation failed");
        setRaw(data?.raw ?? null);
        return;
      }
      if (data.parsed && data.paper) {
        setPaper(data.paper);
      } else {
        // show raw for debugging
        setRaw(data.raw ?? "No response");
      }
    } catch (err) {
      setLoading(false);
      setError(String(err));
    }
  }

  /* Export functions - dynamic import for SSR-safety */
  async function exportPDF() {
    if (!paper && !previewRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;
      const node = previewRef.current;
      const canvas = await html2canvas(node, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      // fit image to page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(imgData, "PNG", (pageWidth - w) / 2, 20, w, h);
      pdf.save(`${(paper?.title || "practice-paper").replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
      setError("PDF export failed: " + String(err));
    }
  }

  async function exportDocx() {
    if (!paper) return;
    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const { saveAs } = await import("file-saver");
      const doc = new Document();
      doc.addSection({
        children: [
          new Paragraph({ children: [new TextRun({ text: paper.title || "Practice Paper", bold: true, size: 28 })] }),
          new Paragraph(""),
          new Paragraph({ children: [new TextRun({ text: `Board: ${paper?.metadata?.board || ""}`, bold: false })] }),
          new Paragraph({ children: [new TextRun({ text: `Grade: ${paper?.metadata?.grade || ""}` })] }),
          new Paragraph(""),
          ...flattenSectionsToParagraphs(paper.sections || []),
        ],
      });
      const packer = new Packer();
      const blob = await packer.toBlob(doc);
      saveAs(blob, `${(paper?.title || "practice-paper").replace(/\s+/g, "_")}.docx`);
    } catch (err) {
      console.error("DOCX export failed", err);
      setError("DOCX export failed: " + String(err));
    }
  }

  // small helpers
  function flattenSectionsToParagraphs(sections) {
    const paras = [];
    for (const s of sections) {
      paras.push(new Paragraph({ children: [new TextRun({ text: s.title || "", bold: true })] }));
      if (s.instructions) paras.push(new Paragraph(s.instructions));
      for (const q of s.questions || []) {
        paras.push(new Paragraph({ children: [new TextRun({ text: `Q: ${q.question}`, break: 1 })] }));
        if (q.modelAnswerOutline) paras.push(new Paragraph({ children: [new TextRun({ text: `Model answer / rubric: ${q.modelAnswerOutline}` })] }));
        paras.push(new Paragraph({ children: [new TextRun("")] }));
      }
      paras.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
    }
    return paras;
  }

  return (
    <>
      <Helmet>
        <title>Paper Maker • Vertex</title>
      </Helmet>

      <PageSection>
        <div className="mb-6 flex items-center gap-3">
          <Link to="/main" className="neu-button px-4 py-2 text-sm flex items-center gap-2">
            <ArrowLeft size={14} /> <span>Back to Main</span>
          </Link>
          <div className="ml-auto text-sm opacity-70 flex items-center gap-2">
            <Sparkles size={14} /> <span>Adaptive UI • Animated</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: config */}
          <NeumorphicCard className="p-6 min-h-[28rem]" title="Paper Configuration" info="Customize your practice paper.">
            <form className="grid gap-5" onSubmit={handleGenerate}>
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                  <label className="sr-only">Board</label>
                  <select className="neu-input-el" value={board} onChange={(e) => setBoard(e.target.value)} aria-label="Board">
                    {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                  <select className="neu-input-el" value={grade ?? ""} onChange={(e) => setGrade(Number(e.target.value))} aria-label="Grade">
                    <option value="">Select Grade</option>
                    {gradesForBoard.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </motion.div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} className="neu-input">
                <select className="neu-input-el" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" disabled={!grade}>
                  <option value="">Select Subject</option>
                  {subjectsForBoard.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </motion.div>

              <motion.div whileHover={{ translateY: -2 }} className="neu-input">
                <input className="neu-input-el" placeholder="Specific topics (comma separated)" value={topics} onChange={(e) => setTopics(e.target.value)} aria-label="Topics" />
                <div className="mt-2 flex flex-wrap gap-2">{topicTags.map(t => <motion.span key={t} className="px-3 py-1 rounded-full text-xs bg-gray-100 border">{t}</motion.span>)}</div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                {useCriteria ? (
                  <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                    <select className="neu-input-el" value={criteria} onChange={(e) => setCriteria(e.target.value)}>
                      <option value="">Select Criteria / Component</option>
                      {(CRITERIA[board] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="text-xs opacity-60 mt-1">Criteria mode hides total marks and uses rubric weightings.</div>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                    <input className="neu-input-el" type="number" min={32} max={100} value={marks ?? ""} onChange={(e) => setMarks(Number(e.target.value))} placeholder="Total marks (32-100)" />
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                  <input className="neu-input-el" type="number" min={1} max={100} value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} placeholder="Number of questions" />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.01 }} className="neu-input">
                  <select className="neu-input-el" value={format} onChange={(e) => setFormat(e.target.value)}><option>Mixed Format</option><option>Short Answer Only</option><option>Structured Questions</option><option>Essay Format</option></select>
                </motion.div>

                <motion.div whileHover={{ translateY: -2 }} className="neu-input p-4">
                  <label className="block text-xs opacity-70 mb-2">Difficulty</label>
                  <input aria-label="Difficulty" type="range" min={1} max={3} step={1} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} />
                  <div className="flex justify-between text-xs opacity-70 mt-1"><span>Easy</span><span>Medium</span><span>Hard</span></div>
                </motion.div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} className="neu-input">
                <textarea className="neu-input-el h-20" value={anythingElse} onChange={(e) => setAnythingElse(e.target.value)} placeholder="Anything else? (teacher notes, style preferences, past paper references...)" />
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="neu-input">
                <label className="flex items-center gap-2 cursor-pointer">
                  <ImagePlus /> <span>Attach images (diagrams) - optional</span>
                  <input type="file" className="sr-only" accept="image/*" multiple onChange={handleFilesChange} />
                </label>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {files.map(f => <div key={f.name} className="text-xs px-2 py-1 rounded bg-gray-800/30">{f.name}</div>)}
                </div>
              </motion.div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`neu-button py-4 text-lg font-medium ${formComplete ? "" : "opacity-50 cursor-not-allowed"}`} disabled={!formComplete || loading} type="submit">
                <FileText size={16} className="inline-block mr-2" /> {loading ? "Generating..." : "Generate Practice Paper"}
              </motion.button>
            </form>
          </NeumorphicCard>

          {/* Right: preview */}
          <NeumorphicCard className="p-6 min-h-[28rem]" title="Paper Preview" info="Live preview. Export to PDF / Word after generating.">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="neu-surface inset p-6 rounded-2xl h-full overflow-auto">
              {!paper && !raw ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="opacity-70 text-lg mb-4">Your custom practice paper preview will appear here</p>
                  <p className="text-sm opacity-60">After generation you can export to PDF or Word.</p>
                </div>
              ) : raw && !paper ? (
                <div className="text-sm text-yellow-200"><pre className="whitespace-pre-wrap">{raw}</pre></div>
              ) : (
                <div>
                  <div ref={previewRef} id="paper-preview" className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{paper.title || `${paper.metadata.board} — Grade ${paper.metadata.grade}`}</h3>
                        <div className="text-sm opacity-70">{paper.metadata.subject} • {paper.metadata.format} • {paper.metadata.numQuestions} questions</div>
                      </div>
                      <div className="text-xs opacity-60">Generated: {new Date().toLocaleString()}</div>
                    </div>

                    <div className="p-4 border rounded bg-gray-900/30">
                      <div className="text-sm opacity-80 mb-2">Specification</div>
                      <ul className="list-disc pl-5 text-sm">
                        <li>Topics: {(paper.sections?.[0]?.questions?.[0]?.question && topicTags.length === 0) ? "(auto)" : (topicTags.length ? topicTags.join(", ") : "(none)")}</li>
                        <li>Total marks: {paper.metadata.totalMarks ?? "(criteria-based)"}</li>
                        <li>Criteria / component: {paper.metadata.criteriaMode ? "Criteria-mode" : "Fixed marks"}</li>
                        <li>Difficulty: {paper.metadata.difficulty}</li>
                      </ul>
                    </div>

                    {paper.sections?.map((s) => (
                      <div key={s.id} className="border rounded p-4">
                        <div className="font-medium mb-2">{s.title}</div>
                        {s.instructions && <div className="text-sm opacity-70 mb-2">{s.instructions}</div>}
                        <ol className="list-decimal pl-6 space-y-3">
                          {s.questions.map((q) => (
                            <li key={q.id}>
                              <div className="font-medium">{q.question}</div>
                              <div className="text-xs opacity-60">Marks: {q.marks ?? "(see rubric)"} • Time: {q.approxTime ?? "—"}</div>
                              <div className="text-sm mt-1 opacity-80">Rubric: {q.modelAnswerOutline}</div>
                              {q.imageRefs?.length ? (
                                <div className="mt-2 space-x-2">
                                  {q.imageRefs.map((n) => {
                                    const img = (paper.images || []).find(i => i.name === n);
                                    if (!img) return <span key={n} className="text-xs opacity-60">[missing image: {n}]</span>;
                                    // if b64 present, create data url
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

                    {paper.rubricNotes?.length ? <div className="p-3 border rounded bg-gray-800/40"><div className="font-medium">Rubric notes</div><ul className="list-disc pl-5 text-sm">{paper.rubricNotes.map((r,i)=> <li key={i}>{r}</li>)}</ul></div> : null}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <motion.button whileHover={{ scale: 1.02 }} className="neu-button px-4 py-2" onClick={exportPDF}><Download size={16} className="mr-2 inline-block" />Export PDF</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} className="neu-button px-4 py-2" onClick={exportDocx}><Download size={16} className="mr-2 inline-block" />Export Word</motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}

// helpers
function range(a, b) {
  const r = [];
  for (let i = a; i <= b; i++) r.push(i);
  return r;
}
