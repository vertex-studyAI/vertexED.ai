// /pages/api/review.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
    const { input_as_text, prompt } = req.body ?? {};
    const combinedInput = String(input_as_text || prompt || "").trim();

    if (!combinedInput) {
      return res.status(400).json({ error: "No input provided" });
    }

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

    let data: any;
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
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message ?? String(err),
    });
  }
}
