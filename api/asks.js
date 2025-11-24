// /api/asks.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash-latest";

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Key fallback logic preserved
  const GEMINI_API_KEY =
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.ChatbotKey;

  if (!GEMINI_API_KEY) {
    console.error("Missing Gemini API key");
    return res.status(500).json({
      error: "We have a problem, don't worry it'll be fixed soon",
    });
  }

  try {
    const { question } = req.body;

    // No question provided
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    // ✔ Secret codes preserved exactly
    const secretCodes = ["010910", "060910"];
    if (secretCodes.includes(question.trim())) {
      return res.status(200).json({
        answer: "I wish it too (secret code)",
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Send to LLM
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: question }],
        },
      ],
    });

    // ✔ Correct Gemini text extraction
    const answer =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      console.error("Gemini response missing expected fields:", result);
      return res.status(500).json({
        error: "Sorry, A.I is currently under maintenance",
        raw: result, // Keep for debugging as your old code did
      });
    }

    // Success
    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: "Something went wrong.",
      details: error?.message || error,
    });
  }
}
