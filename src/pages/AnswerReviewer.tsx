import { Helmet } from "react-helmet-async";
import { useState } from "react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

export default function AIAnswerReview() {
  const [formData, setFormData] = useState({
    curriculum: "",
    subject: "",
    grade: "",
    marks: "",
    question: "",
    answer: "", // NEW FIELD
    additional: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    const prompt = `
You are an expert teacher. Review the student's answer.

Curriculum: ${formData.curriculum}
Subject: ${formData.subject}
Grade: ${formData.grade}
Marks: Out of ${formData.marks}

Question: ${formData.question}
Student Answer: ${formData.answer}
Additional Information: ${formData.additional}

Provide:
1. Strict teacher-style feedback (clarity, depth, accuracy).
2. Suggested marks (out of ${formData.marks}).
3. Key improvements the student can make.
    `;

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.output || "No response received.");
    } catch (err) {
      console.error(err);
      setResponse("Error: Could not get review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>A.I Answer Review — Vertex AI Study Tools</title>
        <meta
          name="description"
          content="Submit your answers for AI-powered review with strict teacher-style feedback."
        />
      </Helmet>

      <PageSection>
        <NeumorphicCard className="p-8 max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">A.I Answer Review</h1>

          {/* Two column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column → Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Curriculum</label>
                <select
                  name="curriculum"
                  value={formData.curriculum}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Curriculum</option>
                  <option value="IB">IB</option>
                  <option value="IGCSE">IGCSE</option>
                  <option value="CBSE">CBSE</option>
                  <option value="AP">AP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subject</option>
                  <option value="Math">Math</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Grade</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Grade</option>
                  <option value="9">Grade 9</option>
                  <option value="10">Grade 10</option>
                  <option value="11">Grade 11</option>
                  <option value="12">Grade 12</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Marks (out of)</label>
                <input
                  type="number"
                  name="marks"
                  value={formData.marks}
                  onChange={handleChange}
                  placeholder="Enter maximum marks"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Question Segment</label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  placeholder="Paste or type the question here..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Student Answer</label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  placeholder="Paste or type the student's answer here..."
                  rows={4}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Information</label>
                <textarea
                  name="additional"
                  value={formData.additional}
                  onChange={handleChange}
                  placeholder="Provide any context or notes here..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-black rounded-full shadow-md hover:bg-blue-700 transition"
                >
                  {loading ? "Reviewing..." : "Submit for Review →"}
                </button>
              </div>
            </form>

            {/* Right column → Output */}
            <div className="flex flex-col space-y-4">
              <h2 className="text-lg font-semibold">AI Review</h2>
              <div className="flex-1 p-6 rounded-2xl overflow-y-auto bg-gray-900">
                {response ? (
                  <div className="self-start max-w-lg px-4 py-3 bg-gray-800 text-black rounded-2xl shadow-md blackspace-pre-wrap">
                    {response}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    AI feedback will appear here after submission...
                  </p>
                )}
              </div>
            </div>
          </div>
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
