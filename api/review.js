// /pages/api/review.js  (or /app/api/review/route.js for App Router)
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  const WORKFLOW_ID = process.env.WORKFLOW_ID; // <-- must be set to 'wf_...'

  if (!OPENAI_API_KEY || !WORKFLOW_ID) {
    return res.status(500).json({ error: "Missing API key or WORKFLOW_ID environment variable" });
  }

  try {
    // Accept either input_as_text or prompt. Also accept register and strictness.
    const { input_as_text, prompt, register = false, strictness = 5, otherInputs } = req.body;

    // Build the single input_as_text value the workflow expects.
    let combinedInput = "";
    if (typeof input_as_text === "string" && input_as_text.trim()) {
      combinedInput = input_as_text.trim();
    } else if (typeof prompt === "string" && prompt.trim()) {
      combinedInput = prompt.trim();
    } else if (otherInputs && typeof otherInputs === "object") {
      // fallback: combine key/value pairs into a readable string
      combinedInput = Object.entries(otherInputs)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    }

    if (!combinedInput) {
      return res.status(400).json({ error: "No input_as_text or prompt provided" });
    }

    const bodyPayload = {
      input: {
        input_as_text: combinedInput,
        // include state-like variables if your workflow uses them
        register: Boolean(register),
        strictness: Number(strictness),
      },
    };

    const response = await fetch(`https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    // Read raw text so we can log non-JSON error bodies too
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      data = { raw };
    }

    if (!response.ok) {
      console.error("Workflow returned non-OK status", response.status, data);
      return res.status(500).json({ error: "Workflow call failed", details: data });
    }

    // Workflow responses can have several shapes. Try common fields first.
    const output = data?.result?.output ?? data?.output ?? data?.data ?? data;
    return res.status(200).json({ output });
  } catch (error) {
    console.error("Workflow error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
