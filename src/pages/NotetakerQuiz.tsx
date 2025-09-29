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
  const timerRef = useRef<NodeJS.Timer | null>(null);

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

      // Generate flashcards immediately
      if (data?.result) {
        const flashRes = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: data.result }),
        });
        if (flashRes.ok) {
          const flashData = await flashRes.json();
          setFlashcards(flashData.flashcards || []);
        }
      }
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
        body: JSON.stringify({ notes, quizType }),
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

  const handleSubmitQuiz = () => {
    if (!generatedQuestions.length) return;
    const results = generatedQuestions.map((q, i) => ({
      question: q.question,
      selected: userAnswers[i] || "",
      correctAnswer: q.answer,
      isCorrect: userAnswers[i] === q.answer,
    }));
    setQuizResults(results);
    setQuizSubmitted(true);
  };

  const copyNotes = () => {
    navigator.clipboard.writeText(notes);
    alert("Notes copied to clipboard!");
  };

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
        <div className="mb-6">
          <Link to="/main" className="neu-button px-4 py-2 text-sm">
            ← Back to Main
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Notes Section */}
          <div className="lg:col-span-2 space-y-8">
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
                  <select
                    className="neu-input-el"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option>Smart Notes</option>
                    <option>Cornell Notes</option>
                    <option>Flashcards</option>
                    <option>Study Guide</option>
                  </select>
                </div>
              </div>
              <button
                className="neu-button mt-3 px-4 py-2"
                onClick={handleGenerateNotes}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Notes"}
              </button>
            </NeumorphicCard>

            <NeumorphicCard className="p-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-medium">Notes</h2>
                <button className="neu-button px-3 py-1 text-sm" onClick={copyNotes}>
                  Copy
                </button>
              </div>
              <div className="neu-textarea h-96 overflow-auto p-4">
                <div
                  className="prose max-w-full"
                  dangerouslySetInnerHTML={{ __html: notes }}
                />
              </div>
            </NeumorphicCard>
          </div>

          {/* Flashcards + Quiz */}
          <div className="space-y-8">
            {/* Flashcards */}
            <NeumorphicCard className="p-8">
              <h2 className="text-xl font-medium mb-4">Flashcards</h2>
              {flashcards.length ? (
                flashcards.map((f, i) => (
                  <div key={i} className="mb-2 p-2 border rounded-md bg-gray-50">
                    <p className="font-semibold">{f.front}</p>
                    <p className="text-sm mt-1 text-gray-700">{f.back}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm opacity-70">Flashcards will appear here</p>
              )}
            </NeumorphicCard>

            {/* Quiz */}
            <NeumorphicCard className="p-8">
              <h2 className="text-xl font-medium mb-4">Quiz</h2>
              <div className="flex gap-3 flex-wrap mb-4">
                {["Interactive Quiz", "Multiple Choice", "Free Response"].map(
                  (type) => (
                    <button
                      key={type}
                      className={`neu-button px-4 py-3 ${
                        quizType === type ? "bg-gray-300" : ""
                      }`}
                      onClick={() => setQuizType(type)}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
              <button
                className="neu-button mt-2 px-4 py-2"
                onClick={handleGenerateQuiz}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Quiz"}
              </button>

              {generatedQuestions.length > 0 && (
                <div className="mt-4 space-y-4">
                  {generatedQuestions.map((q, i) => (
                    <div key={i}>
                      <p className="font-medium">{`Q${i + 1}: ${q.question}`}</p>
                      {quizType === "Interactive Quiz" && (
                        <input
                          type="text"
                          placeholder="Type your answer..."
                          value={userAnswers[i] || ""}
                          onChange={(e) =>
                            setUserAnswers({ ...userAnswers, [i]: e.target.value })
                          }
                          className="neu-input-el mt-1 w-full"
                        />
                      )}
                      {quizType === "Multiple Choice" && q.options?.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1">
                          {q.options.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`q${i}`}
                                value={opt}
                                checked={userAnswers[i] === opt}
                                onChange={() =>
                                  setUserAnswers({ ...userAnswers, [i]: opt })
                                }
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {quizType === "Free Response" && (
                        <textarea
                          placeholder="Write your answer..."
                          value={userAnswers[i] || ""}
                          onChange={(e) =>
                            setUserAnswers({ ...userAnswers, [i]: e.target.value })
                          }
                          className="neu-input-el mt-1 w-full"
                        />
                      )}

                      {quizSubmitted && quizResults && (
                        <p
                          className={`mt-1 font-medium ${
                            quizResults[i].isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {quizResults[i].isCorrect
                            ? "Correct"
                            : `Incorrect(Correct: ${quizResults[i].correctAnswer})`}
                        </p>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted && (
                    <button
                      className="neu-button mt-4 px-4 py-2"
                      onClick={handleSubmitQuiz}
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Quiz"}
                    </button>
                  )}
                </div>
              )}
            </NeumorphicCard>

            {/* Timer */}
            <div className="text-sm text-gray-500">
              Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
            </div>
          </div>
        </div>
      </PageSection>
    </>
  );
}
