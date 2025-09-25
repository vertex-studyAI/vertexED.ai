import { Helmet } from "react-helmet-async";
import { useState } from "react";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

// NEW IMPORTS
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function AIAnswerReview() {
  const [formData, setFormData] = useState({
    curriculum: "",
    subject: "",
    grade: "",
    marks: "",
    question: "",
    answer: "",
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
        headers: { "Content-Type": "application/json" },
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
              {/* form fields unchanged */}
              {/* ... */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition"
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
                  <div className="self-start max-w-lg px-4 py-3 bg-gray-800 text-blue-400 rounded-2xl shadow-md overflow-x-auto prose prose-invert">
                    <ReactMarkdown
                      children={response}
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    />
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
