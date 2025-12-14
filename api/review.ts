export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ChatbotKey;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is missing in environment variables");
    res.status(500).json({ error: "Server configuration error: Missing API Key" });
    return;
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

    const allImages = [...(questionImages || []), ...(answerImages || [])];

    console.log("Executing OpenAI Agent Workflow...");

    // Dynamic import to handle potential initialization errors gracefully
    // and to ensure environment variables are available
    const { runWorkflow } = await import('./agentWorkflow');

    const result = await runWorkflow({
      input_as_text: combinedInput,
      images: allImages
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Workflow execution failed:", error);
    res.status(500).json({ error: "Workflow execution failed", details: error.message, stack: error.stack });
  }
}
