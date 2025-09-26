// src/api/note.js
const API_URL = "https://your-backend-api.com"; // replace with your backend URL
const API_KEY = import.meta.env.VITE_API_KEY;   // store key in .env

// --- Generate Notes ---
export async function generateNotes({ topic, format, notes }) {
  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        topic,   // e.g., "Photosynthesis"
        format,  // e.g., "Study Guide", "Flashcards"
        notes,   // user’s raw notes
      }),
    });

    if (!response.ok) throw new Error("Failed to generate notes");
    return await response.json();
  } catch (err) {
    console.error("generateNotes error:", err);
    throw err;
  }
}

// --- Generate Quiz ---
export async function generateQuiz({ notes, quizType }) {
  try {
    const response = await fetch(`${API_URL}/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        notes,     // text from Notes textarea
        quizType,  // "Interactive Quiz" | "Multiple Choice" | "Free Response"
      }),
    });

    if (!response.ok) throw new Error("Failed to generate quiz");
    return await response.json();
  } catch (err) {
    console.error("generateQuiz error:", err);
    throw err;
  }
}

// --- Review Answer ---
export async function reviewAnswer({ question, userAnswer }) {
  try {
    const response = await fetch(`${API_URL}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        question,    // question text
        userAnswer,  // what user typed
      }),
    });

    if (!response.ok) throw new Error("Failed to review answer");
    return await response.json();
  } catch (err) {
    console.error("reviewAnswer error:", err);
    throw err;
  }
}
