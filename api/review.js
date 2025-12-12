export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  const WORKFLOW_ID = process.env.wf_68fc9c500b4081909cf4ae5fc5f3294f04983f13b9d3301f

  if (!OPENAI_API_KEY || !WORKFLOW_ID) {
    return res.status(500).json({ error: "Missing API key or workflow ID" });
  }

  try {
    const { prompt, otherInputs } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    // 🔥 NEW — Call workflow endpoint
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
            prompt,
            ...otherInputs, 
          },
        }),
      }
    );

    const data = await response.json();

    // Workflow return structure is different:
    const output = data?.result?.output ?? null;

    return res.status(200).json({ output });
  } catch (error) {
    console.error("Workflow error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
