// /pages/api/review.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  const WORKFLOW_ID = process.env.WORKFLOW_ID; // Must be set in your ENV

  if (!OPENAI_API_KEY || !WORKFLOW_ID) {
    return res.status(500).json({
      error: "Missing ChatbotKey or WORKFLOW_ID environment variable",
    });
  }

  try {
    const { input_as_text, register = false, strictness = 5 } = req.body;

    if (!input_as_text || typeof input_as_text !== "string" || !input_as_text.trim()) {
      return res.status(400).json({
        error: "input_as_text is required and must be a non-empty string",
      });
    }

    const payload = {
      input: {
        input_as_text: input_as_text.trim(),
        register: Boolean(register),
        strictness: Number(strictness),
      },
    };

    const response = await fetch(
      `https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }

    if (!response.ok) {
      console.error("Workflow returned non-OK", response.status, data);
      return res.status(500).json({
        error: "Workflow call failed",
        status: response.status,
        details: data,
      });
    }

    const output =
      data?.result?.output ??
      data?.output ??
      data?.data ??
      data;

    return res.status(200).json({ output });
  } catch (error) {
    console.error("Workflow error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
