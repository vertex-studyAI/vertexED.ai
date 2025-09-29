import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function NotetakerQuiz() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Smart Notes");
  const [notes, setNotes] = useState("");
  const [quizType, setQuizType] = useState("Interactive Quiz");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const [timeSpent, setTimeSpent] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef<any>(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpent((t) => t + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Generate notes + flashcards
  const handleGenerateNotes = async () => {
    if (!topic) return alert("Please enter a topic");
    setLoading(true);
    try {
      const res = await fetch("/api/note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, format }),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setNotes(data?.result || "");
      setFlashcards(data?.flashcards || []);
      // reset quiz area
      setGeneratedQuestions([]);
      setUserAnswers({});
      setQuizSubmitted(false);
      setQuizResults(null);
    } catch (err) {
      console.error(err);
      alert("Failed to generate notes. Please try again.");
      setNotes("");
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!notes) return alert("Please generate notes first");
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", notes, quizType }),
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setGeneratedQuestions(data.questions || []);
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

    // Quick local grading for MCQ & interactive exact matches, but FRQ uses AI grading
    const localResults = generatedQuestions.map((q) => {
      const id = q.id;
      const user = userAnswers[id] ?? "";
      if (q.type === "multiple_choice") {
        const isCorrect = q.answer && user === q.answer;
        return { id, selected: user, correctAnswer: q.answer, isCorrect, score: isCorrect ? 2 : 0 };
      }
      // for interactive (short) and frq, we'll delegate to the API grade action
      return { id, selected: user, correctAnswer: q.answer ?? q.expected ?? "", type: q.type };
    });

    // Check if there are FRQ/interactive needing AI grading
    const needAI = generatedQuestions.some((q) => q.type === "frq" || q.type === "interactive");

    if (!needAI) {
      setQuizResults(localResults);
      setQuizSubmitted(true);
      return;
    }

    setLoading(true);
    try {
      // Call the quiz API grade action
      const gradeRes = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          questions: generatedQuestions,
          userAnswers: userAnswers,
        }),
      });

      if (!gradeRes.ok) throw new Error(`Grade failed: ${gradeRes.status}`);
      const gradeData = await gradeRes.json();
      // gradeData.grades -> [{id, score, maxScore, feedback},...]
      const grades = gradeData.grades || [];

      // Merge localResults + grades
      const merged = localResults.map((r) => {
        const g = grades.find((x) => x.id === r.id);
        if (g) {
          return { ...r, score: g.score, maxScore: g.maxScore, feedback: g.feedback, isCorrect: g.score >= 1.5 };
        }
        return r;
      });

      setQuizResults(merged);
      setQuizSubmitted(true);
    } catch (err) {
      console.error("Grading failed:", err);
      alert("Failed to grade FRQ. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(notes);
    // subtle non-blocking toast could be nicer; keep simple
    alert("Notes copied to clipboard!");
  };

  const toggleTimer = () => setShowTimer((s) => !s);

  return (
    <>
      <Helmet>
        <title>AI Notetaker, Flashcards & Quiz Generator | Vertex</title>
        <meta
          name="description"
          content="Create AI-powered notes, generate flashcards, and practice with quizzes in one place."
        />
      </Helmet>

      <PageSection>
        <div className="mb-6 flex items-center justify-between">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">
            ← Back to Main
          </Link>
          <div className="flex items-center gap-3">
            <button
              className="neu-button px-3 py-1 text-sm"
              title={showTimer ? "Hide timer" : "Show timer"}
              onClick={toggleTimer}
            >
              {showTimer ? "Hide Timer" : "Show Timer"}
            </button>
            {showTimer && (
              <div className="text-sm text-gray-500">
                Time: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Controls */}
          <NeumorphicCard className="p-8">
            <h2 className="text-xl font-medium mb-4">Topic and Format</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="neu-input">
                <input
                  className="neu-input-el"
                  placeholder="Enter your study topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="neu-input">
                <select className="neu-input-el" value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option>Smart Notes</option>
                  <option>Cornell Notes</option>
                  <option>Flashcards</option>
                  <option>Study Guide</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <button className="neu-button px-4 py-2" onClick={handleGenerateNotes} disabled={loading}>
                {loading ? "Generating..." : "Generate Notes"}
              </button>
              <button className="neu-button px-4 py-2" onClick={handleGenerateQuiz} disabled={loading || !notes}>
                {loading ? "..." : "Generate Quiz"}
              </button>
            </div>
          </NeumorphicCard>

          {/* Notes */}
          <NeumorphicCard className="p-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-medium">Notes</h2>
              <button
                className="neu-button px-3 py-1 text-sm flex items-center gap-2"
                onClick={copyNotes}
                title="Copy notes"
              >
                {/* two-pages icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block">
                  <rect x="9" y="4" width="10" height="14" rx="2" ry="2"></rect>
                  <path d="M5 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1"></path>
                </svg>
                <span className="sr-only">Copy</span>
              </button>
            </div>
            <div className="neu-textarea max-h-[36rem] overflow-auto p-4">
              <div className="prose max-w-full" dangerouslySetInnerHTML={{ __html: notes }} />
            </div>
          </NeumorphicCard>

          {/* Below notes: Flashcards (left) and Quiz (right) */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Flashcards */}
            <NeumorphicCard className="p-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-medium">Flashcards</h2>
                <div className="text-sm opacity-70">{flashcards.length} cards</div>
              </div>

              {flashcards.length ? (
                <div className="space-y-3">
                  {flashcards.map((f: any, i: number) => (
                    <div key={i} className="p-3 border rounded-lg bg-white">
                      <div className="font-semibold">{f.front}</div>
                      <div className="text-sm mt-1 text-gray-700">{f.back}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm opacity-70">Flashcards will appear here after generating notes.</p>
              )}
            </NeumorphicCard>

            {/* Quiz */}
            <NeumorphicCard className="p-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-medium">Quiz</h2>
                <div className="text-sm opacity-70">Type: {quizType}</div>
              </div>

              <div className="flex gap-3 flex-wrap mb-4">
                {["Interactive Quiz", "Multiple Choice", "FRQ"].map((type) => (
                  <button
                    key={type}
                    className={`neu-button px-4 py-3 ${quizType === type ? "bg-gray-300" : ""}`}
                    onClick={() => setQuizType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                {generatedQuestions.length ? (
                  <div className="space-y-4">
                    {generatedQuestions.map((q: any) => (
                      <div key={q.id} className="p-3 border rounded-md">
                        <div className="font-medium">{`Q${q.id}: ${q.question}`}</div>

                        {/* Multiple Choice */}
                        {q.type === "multiple_choice" && q.options?.length > 0 && (
                          <div className="flex flex-col gap-2 mt-2">
                            {q.options.map((opt: string, idx: number) => (
                              <label key={idx} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name={`q${q.id}`}
                                  value={opt}
                                  checked={userAnswers[q.id] === opt}
                                  onChange={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                                />
                                <span className="ml-1">{opt}</span>
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
                              const r = quizResults.find((x: any) => x.id === q.id);
                              if (!r) return null;
                              // For MCQ, isCorrect present, for FRQ show score/feedback
                              if (q.type === "multiple_choice") {
                                return (
                                  <div
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                                      r.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {r.isCorrect ? "Correct ✅" : `Incorrect ❌ — Correct: ${r.correctAnswer}`}
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="mt-1">
                                    <div className="text-sm font-semibold">Score: {r.score}/{r.maxScore}</div>
                                    <div className="text-sm text-gray-700 mt-1">Feedback: {r.feedback}</div>
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
                        <button className="neu-button px-4 py-2" onClick={handleSubmitQuiz} disabled={loading}>
                          {loading ? "Grading..." : "Submit Quiz"}
                        </button>
                        <button
                          className="neu-button px-4 py-2"
                          onClick={() => {
                            // quick clear answers
                            setUserAnswers({});
                            setQuizSubmitted(false);
                            setQuizResults(null);
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="text-sm">Quiz completed.</div>
                        <button
                          className="neu-button mt-2 px-4 py-2"
                          onClick={() => {
                            setQuizSubmitted(false);
                            setQuizResults(null);
                          }}
                        >
                          Retake / Clear Results
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm opacity-70">Generate a quiz to see questions here.</p>
                )}
              </div>
            </NeumorphicCard>
          </div>
        </div>
      </PageSection>
    </>
  );
}
