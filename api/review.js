export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  const WORKFLOW_ID = process.env.WORKFLOW_ID;

  console.log("DEBUG WORKFLOW_ID:", WORKFLOW_ID);

  if (!OPENAI_API_KEY || !WORKFLOW_ID) {
    return res.status(500).json({ error: "Missing API key or WORKFLOW_ID env variable" });
  }

  try {
    const { input_as_text, prompt, register = false, strictness = 5 } = req.body;

    const combinedInput = input_as_text || prompt;
    if (!combinedInput?.trim()) {
      return res.status(400).json({ error: "No input provided" });
    }

    const response = await fetch(
      `https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: {
            input_as_text: combinedInput,
            register,
            strictness,
          },
        }),
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
      console.error("Workflow returned non-OK status", response.status, data);
      return res.status(500).json({ error: "Workflow call failed", details: data });
    }

    return res.status(200).json({ output: data?.result?.output ?? data });
  } catch (error) {
    console.error("Workflow error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
