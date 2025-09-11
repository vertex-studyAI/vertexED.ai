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
You are an expert teacher. Review the following answer question for accuracy, depth, and clarity. 
Curriculum: ${formData.curriculum}
Subject: ${formData.subject}
Grade: ${formData.grade}
Marks: Out of ${formData.marks}
Question: ${formData.question}
Additional Information: ${formData.additional}

Please provide:
1. Detailed feedback as a strict teacher.
2. A suggested mark (out of ${formData.marks}).
3. Key improvements the student can make.
    `;

    try {
      const res = await fetch("https://your-backend-api.com/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_API_KEY}`,
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
        <link rel="canonical" href="https://www.vertexed.app/answer-review" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PageSection>
        <NeumorphicCard className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">A.I Answer Review</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Curriculum */}
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

            {/* Subject */}
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

            {/* Grade */}
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

            {/* Marks */}
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

            {/* Question Segment */}
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

            {/* Additional Info */}
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

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
              >
                {loading ? "Reviewing..." : "Submit for Review →"}
              </button>
            </div>
          </form>

          {/* Response Section */}
          {response && (
            <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-inner">
              <h2 className="text-lg font-semibold mb-3">AI Review:</h2>
              <p className="whitespace-pre-wrap text-gray-700">{response}</p>
            </div>
          )}
        </NeumorphicCard>
      </PageSection>
    </>
  );
}
