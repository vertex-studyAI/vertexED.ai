// Dynamic import to catch module-level errors
let runWorkflow: any = null;

export const config = {
  maxDuration: 60,
  runtime: 'nodejs',
  memory: 1024,
};

export default async function handler(req: any, res: any) {
  // Add detailed error logging at the start
  console.log("[review.ts] Handler invoked, method:", req.method);
  console.log("[review.ts] Environment check - OPENAI_API_KEY set:", !!process.env.OPENAI_API_KEY);
  console.log("[review.ts] Environment check - ChatbotKey set:", !!process.env.ChatbotKey);
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check for OPENAI_API_KEY which is required by @openai/agents package
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is missing - required by @openai/agents package");
    res.status(500).json({ error: "Server configuration error: OPENAI_API_KEY not set" });
    return;
  }

  try {
    // Dynamically import to catch any module loading errors
    if (!runWorkflow) {
      console.log("[review.ts] Loading agentWorkflow module...");
      const module = await import('./agentWorkflow');
      runWorkflow = module.runWorkflow;
      console.log("[review.ts] agentWorkflow module loaded successfully");
    }
    
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

    console.log("[review.ts] Executing OpenAI Agent Workflow...");

    const result = await runWorkflow({
      input_as_text: combinedInput,
      images: allImages
    });

    console.log("[review.ts] Workflow completed successfully");
    res.status(200).json(result);
  } catch (error: any) {
    console.error("[review.ts] Error:", error);
    res.status(500).json({ 
      error: error.message || "Workflow execution failed", 
      stack: error.stack 
    });
  }
}
