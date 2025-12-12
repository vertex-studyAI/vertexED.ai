export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  const WORKFLOW_ID = process.env.WORKFLOW_ID;

  // Debug logging
  console.log("DEBUG WORKFLOW_ID:", WORKFLOW_ID);

  if (!OPENAI_API_KEY || !WORKFLOW_ID) {
    return res.status(500).json({ error: "Missing API key or WORKFLOW_ID" });
  }

  try {
    // Extract input
    const { input_as_text, prompt, strictness = 5, register = false } = req.body;
    const combinedInput = input_as_text || prompt;

    if (!combinedInput || !combinedInput.trim()) {
      return res.status(400).json({ error: "No input provided" });
    }

    // Call OpenAI workflow
    const workflowResponse = await fetch(
      `https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: { input_as_text: combinedInput, strictness, register },
        }),
      }
    );

    // Parse JSON safely
    let data;
    const rawText = await workflowResponse.text();
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    // Check for errors from OpenAI
    if (!workflowResponse.ok) {
      console.error("Workflow call failed:", workflowResponse.status, data);
      return res.status(500).json({ error: "Workflow call failed", details: data });
    }

    // Return the workflow output
    const output = data?.result?.output ?? data;
    return res.status(200).json({ output });

  } catch (err) {
    console.error("Unexpected workflow error:", err);
    return res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}
