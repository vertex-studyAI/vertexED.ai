import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";
import NeumorphicCard from "@/components/NeumorphicCard";
import PageSection from "@/components/PageSection";

export default function NotetakerQuiz() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("Smart Notes");
  const [notes, setNotes] = useState("");
  const [quizType, setQuizType] = useState("Interactive Quiz");
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // Generate notes
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
    } catch (err) {
      console.error(err);
      alert("Failed to generate notes. Please try again.");
      setNotes("");
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

  // Submit quiz and grade
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
              <h2 className="text-xl font-medium mb-4">Notes</h2>
              <div className="neu-textarea h-96">
                <textarea
                  className="neu-input-el h-full"
                  placeholder="Start typing your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </NeumorphicCard>
          </div>

          {/* Quiz Section */}
          <div className="space-y-8">
            <NeumorphicCard className="p-8">
              <h2 className="text-xl font-medium mb-4">Quiz Type</h2>
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
            </NeumorphicCard>

            <NeumorphicCard className="p-8">
              <h2 className="text-xl font-medium mb-4">Generated Questions</h2>
              <div className="neu-surface inset p-4 rounded-2xl mb-4">
                {generatedQuestions.length ? (
                  generatedQuestions.map((q, i) => (
                    <div key={i} className="mb-4">
                      <p className="font-medium">{`Q${i + 1}: ${q.question}`}</p>

                      {/* Interactive Quiz */}
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

                      {/* Multiple Choice */}
                      {quizType === "Multiple Choice" && q.options.length > 0 && (
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

                      {/* Free Response */}
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

                      {/* Show MCQ result if submitted */}
                      {quizSubmitted && quizType === "Multiple Choice" && quizResults && (
                        <p
                          className={`mt-1 font-medium ${
                            quizResults[i].isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {quizResults[i].isCorrect
                            ? "Correct ✅"
                            : `Incorrect ❌ (Correct: ${quizResults[i].correctAnswer})`}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-70">
                    AI-generated questions based on your notes will appear here
                  </p>
                )}

                {/* Submit Button */}
                {generatedQuestions.length > 0 && !quizSubmitted && (
                  <button
                    className="neu-button mt-4 px-4 py-2"
                    onClick={handleSubmitQuiz}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Quiz"}
                  </button>
                )}

                {/* Quiz Results for Free Response / Interactive */}
                {quizSubmitted && quizResults && quizType !== "Multiple Choice" && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Quiz Results</h3>
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(quizResults, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </NeumorphicCard>
          </div>
        </div>
      </PageSection>
    </>
  );
}
