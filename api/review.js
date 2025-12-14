// /pages/api/review.ts

export default async function handler(
  req,
  res
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  const WORKFLOW_ID = process.env.WORKFLOW_ID;

  if (!OPENAI_API_KEY || !WORKFLOW_ID) {
    console.error("Missing ChatbotKey or WORKFLOW_ID");
    return res.status(500).json({
      error: "Server misconfiguration",
    });
  }

  try {
    const { input_as_text, prompt, questionImages, answerImages } = req.body ?? {};
    let combinedInput = String(input_as_text || prompt || "").trim();

    const hasQuestionImages = questionImages && questionImages.length > 0;
    const hasAnswerImages = answerImages && answerImages.length > 0;

    if (!combinedInput && !hasQuestionImages && !hasAnswerImages) {
      return res.status(400).json({ error: "No input provided" });
    }

    if (hasQuestionImages) {
      combinedInput += `\n\n[User has attached ${questionImages.length} image(s) for the QUESTION]`;
    }
    if (hasAnswerImages) {
      combinedInput += `\n\n[User has attached ${answerImages.length} image(s) for the ANSWER]`;
    }

    // Combine all images into a single array for the workflow, but we rely on the text prompt 
    // (or potentially order if the workflow supports it) to distinguish them. 
    // Ideally, the workflow should accept structured image inputs, but assuming a flat list:
    const allImages = [...(questionImages || []), ...(answerImages || [])];

    const workflowResp = await fetch(
      `https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            input_as_text: combinedInput,
            images: allImages,
          },
        }),
      }
    );

    const rawText = await workflowResp.text();

    if (!workflowResp.ok) {
      console.error("Workflow failed:", workflowResp.status, rawText);
      return res.status(502).json({
        error: "Workflow execution failed",
        status: workflowResp.status,
        raw: rawText,
      });
    }

    let data;
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      // Workflow returned plain text output
      return res.status(200).json({ output: rawText });
    }

    const output =
      data?.output ??
      data?.result?.output ??
      data?.result ??
      data;

    return res.status(200).json({ output });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message ?? String(err),
    });
  }
}
