import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, FileText } from "lucide-react";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

// Full, self-contained PaperMaker component with adaptive options, animations, and UI logic
export default function PaperMaker() {
  const BOARDS = [
    "IB MYP",
    "IB DP",
    "IGCSE",
    "A Levels",
    "CBSE",
    "ICSE",
  ];

  const GRADE_RANGES = {
    "IB MYP": range(6, 10),
    "IGCSE": range(6, 10),
    "IB DP": range(11, 12),
    "A Levels": range(11, 12),
    CBSE: range(6, 12),
    ICSE: range(6, 12),
  };

  const SUBJECTS = {
    "IB MYP": [
      "Physics",
      "Chemistry",
      "Biology",
      "History",
      "Geography",
      "Math Standard",
      // conditional: Math Extended when grade 10
      "Language and Literature",
      "Spanish",
      "French",
      "Hindi",
    ],
    "IB DP": [
      "History",
      "Geography",
      "Math AA",
      "Math AI",
      "Business Management",
      "Economics",
      "IB English Literature",
      "Language B - Spanish",
      "Language B - German",
      "Language B - French",
      "Language B - Hindi",
      "Language AB Initio - Spanish",
      "Language AB Initio - German",
      "Language AB Initio - French",
      "Language AB Initio - Hindi",
    ],
    IGCSE: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "History",
      "Geography",
      "Business Studies",
      "Computer Science",
      "Economics",
    ],
    "A Levels": [
      "Mathematics",
      "Further Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "Economics",
      "History",
      "English Literature",
      "Business",
      "Computer Science",
    ],
    CBSE: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Hindi",
      "Social Science",
      "Computer Science",
    ],
    ICSE: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "History",
      "Geography",
      "Computer Applications",
    ],
  };

  const CRITERIA = {
    "IB MYP": ["Criterion A", "Criterion B", "Criterion C", "Criterion D"],
    "IB DP": ["Paper 1", "Paper 2", "Internal Assessment", "Extended Essay"],
  };

  // Form state
  const [board, setBoard] = useState(BOARDS[0]);
  const [grade, setGrade] = useState(null);
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState("");
  const [topicTags, setTopicTags] = useState([]);
  const [marks, setMarks] = useState(50);
  const [numQuestions, setNumQuestions] = useState(10);
  const [format, setFormat] = useState("Mixed Format");
  const [difficulty, setDifficulty] = useState(2); // 1-easy,2-medium,3-hard
  const [criteria, setCriteria] = useState("");
  const [useCriteria, setUseCriteria] = useState(false);
  const [preview, setPreview] = useState(null);

  // Derived lists
  const gradesForBoard = useMemo(() => GRADE_RANGES[board] || [], [board]);

  const subjectsForBoard = useMemo(() => {
    let list = SUBJECTS[board] ? [...SUBJECTS[board]] : [];
    // special rule: MYP Math Extended visible only for grade 10
    if (board === "IB MYP") {
      if (grade === 10 && !list.includes("Math Extended")) list.push("Math Extended");
      // for grades 8-10 allow extended language option
      if (grade >= 8 && grade <= 10) {
        ["Spanish (Extended)", "French (Extended)", "Hindi (Extended)"].forEach((s) => {
          if (!list.includes(s)) list.push(s);
        });
      }
    }
    return list;
  }, [board, grade]);

  // When board changes, reset dependent state
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
  }, [board]);

  // If criteria mode is enabled for IB boards, hide marks
  useEffect(() => {
    if (useCriteria) setMarks(null);
    else if (marks === null) setMarks(50);
  }, [useCriteria]);

  // helper: parse topics into tags when comma or enter
  useEffect(() => {
    const cleaned = topics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setTopicTags(cleaned);
  }, [topics]);

  // Determine form completion
  const formComplete = useMemo(() => {
    if (!board) return false;
    if (!grade) return false;
    if (!subject) return false;
    if (useCriteria && !criteria) return false;
    if (!useCriteria && (marks === null || marks < 32 || marks > 100)) return false;
    return true;
  }, [board, grade, subject, useCriteria, criteria, marks]);

  function handleGenerate(e) {
    e.preventDefault();
    // simple preview creation (in real app this would call backend / generator)
    const payload = {
      board,
      grade,
      subject,
      topics: topicTags,
      marks: useCriteria ? undefined : marks,
      criteria: useCriteria ? criteria : undefined,
      numQuestions,
      format,
      difficulty: difficulty === 1 ? "Easy" : difficulty === 2 ? "Medium" : "Hard",
      generatedAt: new Date().toISOString(),
    };
    setPreview(payload);
    // a small confetti-like animation tick via framer-motion could be triggered in the preview area
  }

  return (
    <>
      <Helmet>
        <title>Paper Maker • Vertex</title>
        <meta name="description" content="Create IB/IGCSE/A-Level/CBSE/ICSE style practice papers with adaptive options and live preview." />
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
          {/* Configuration */}
          <NeumorphicCard className="p-6 min-h-[28rem]" title="Paper Configuration" info="Customize your practice paper. Animated, adaptive, and accessible.">
            <form className="grid gap-6 mt-4" onSubmit={handleGenerate}>
              {/* Row: Board & Grade */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                  <label className="sr-only">Board</label>
                  <select
                    className="neu-input-el"
                    aria-label="Board"
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                  <label className="sr-only">Grade</label>
                  <select
                    className="neu-input-el"
                    aria-label="Grade"
                    value={grade ?? ""}
                    onChange={(e) => setGrade(Number(e.target.value))}
                  >
                    <option value="">Select Grade</option>
                    {gradesForBoard.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </motion.div>
              </div>

              {/* Subject - appears after grade */}
              <motion.div whileHover={{ scale: 1.01 }} className="neu-input">
                <label className="sr-only">Subject</label>
                <select
                  className="neu-input-el"
                  aria-label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={!grade}
                >
                  <option value="">Select Subject</option>
                  {subjectsForBoard.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Topics (tags) */}
              <motion.div whileHover={{ translateY: -2 }} className="neu-input">
                <input
                  className="neu-input-el"
                  placeholder="Specific topics (comma separated)"
                  aria-label="Topics"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {topicTags.map((t) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 rounded-full text-xs bg-gray-100 border"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Row: Marks or Criteria + Number of questions */}
              <div className="grid grid-cols-2 gap-4">
                {useCriteria ? (
                  <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                    <label className="sr-only">Criteria</label>
                    <select
                      className="neu-input-el"
                      aria-label="Criteria"
                      value={criteria}
                      onChange={(e) => setCriteria(e.target.value)}
                    >
                      <option value="">Select Criteria / Paper Component</option>
                      {(CRITERIA[board] || []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs opacity-60 mt-1">Using criteria mode hides total marks and adapts question weighting.</div>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                    <label className="sr-only">Total Marks</label>
                    <input
                      className="neu-input-el"
                      type="number"
                      min={32}
                      max={100}
                      value={marks ?? ""}
                      onChange={(e) => setMarks(Number(e.target.value))}
                      placeholder="Total Marks (32-100)"
                      aria-label="Total marks"
                    />
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.02 }} className="neu-input">
                  <label className="sr-only">Number of Questions</label>
                  <input
                    className="neu-input-el"
                    type="number"
                    min={1}
                    max={100}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    placeholder="Number of Questions"
                    aria-label="Number of questions"
                  />
                </motion.div>
              </div>

              {/* Format and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.01 }} className="neu-input">
                  <select className="neu-input-el" aria-label="Format" value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option>Mixed Format</option>
                    <option>Short Answer Only</option>
                    <option>Structured Questions</option>
                    <option>Essay Format</option>
                  </select>
                </motion.div>

                <motion.div whileHover={{ translateY: -2 }} className="neu-input p-4">
                  <label className="block text-xs opacity-70 mb-2">Difficulty</label>
                  <input
                    aria-label="Difficulty"
                    type="range"
                    min={1}
                    max={3}
                    step={1}
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-xs opacity-70 mt-1">
                    <span>Easy</span>
                    <span>Medium</span>
                    <span>Hard</span>
                  </div>
                </motion.div>
              </div>

              {/* Generate Button (animated on hover) */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`neu-button py-4 text-lg font-medium ${formComplete ? "" : "opacity-50 cursor-not-allowed"}`}
                disabled={!formComplete}
                type="submit"
              >
                <FileText size={16} className="inline-block mr-2" /> Generate Practice Paper
              </motion.button>
            </form>
          </NeumorphicCard>

          {/* Preview */}
          <NeumorphicCard className="p-6 min-h-[28rem]" title="Paper Preview" info="Live preview of the generated paper. Click Generate to populate.">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="neu-surface inset p-6 rounded-2xl h-full overflow-auto"
            >
              {!preview ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="opacity-70 text-lg mb-4">Your custom practice paper preview will appear here</p>
                  <p className="text-sm opacity-60">Complete with formatting, marking considerations, and quick export mock (PDF/Print placeholder).</p>
                </div>
              ) : (
                <motion.div layout initial={{ scale: 0.995 }} animate={{ scale: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{preview.board} — Grade {preview.grade}</h3>
                      <div className="text-sm opacity-70">{preview.subject} • {preview.format} • {preview.numQuestions} questions</div>
                    </div>
                    <div className="text-xs opacity-60">Generated: {new Date(preview.generatedAt).toLocaleString()}</div>
                  </div>

                  <div className="p-4 border rounded">
                    <div className="text-sm opacity-80 mb-2">Specification</div>
                    <ul className="list-disc pl-5 text-sm">
                      <li>Topics: {preview.topics.length ? preview.topics.join(", ") : "(none)"}</li>
                      <li>Total marks: {preview.marks ?? "(criteria-based)"}</li>
                      <li>Criteria / component: {preview.criteria ?? "(N/A)"}</li>
                      <li>Difficulty: {preview.difficulty}</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded bg-white/30">
                    <div className="font-medium mb-2">Example Question (auto-generated placeholder)</div>
                    <div className="text-sm opacity-80">Write a structured response on <strong>{preview.subject}</strong> covering {preview.topics.slice(0,2).join(", ") || "the core topic"}. Weighting: {preview.marks ? Math.round((preview.marks / preview.numQuestions) * (difficulty === 3 ? 1.15 : difficulty === 1 ? 0.9 : 1)) : "Follow selected criteria"} marks (approx).</div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.02 }} className="neu-button px-4 py-2">Export PDF (mock)</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} className="neu-button px-4 py-2">Print (mock)</motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}

// small util
function range(a, b) {
  const r = [];
  for (let i = a; i <= b; i++) r.push(i);
  return r;
}
