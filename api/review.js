// /pages/api/review.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  const WORKFLOW_ID = process.env.WORKFLOW_ID;

  if (!OPENAI_API_KEY || !WORKFLOW_ID) {
    console.error("Missing OPENAI_API_KEY or WORKFLOW_ID");
    return res.status(500).json({
      error: "Server misconfiguration: missing API key or workflow ID",
    });
  }

  try {
    const { input_as_text, prompt } = req.body ?? {};
    const combinedInput = (input_as_text || prompt || "").toString().trim();

    if (!combinedInput) {
      return res.status(400).json({ error: "No input provided" });
    }

    // ---- SEND EXACTLY WHAT THE WORKFLOW EXPECTS ----
    const workflowResp = await fetch(
      `https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input_as_text: combinedInput, // ❤️ EXACT MATCH
        }),
      }
    );

    const rawText = await workflowResp.text();
    let data: any;

    // Try parsing the workflow result
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      // Workflow returned plain text instead of JSON — return it raw
      return res.status(200).json({ output: rawText });
    }

    if (!workflowResp.ok) {
      console.error("Workflow error:", workflowResp.status, data);
      return res.status(502).json({
        error: "Workflow call failed",
        status: workflowResp.status,
        details: data,
      });
    }

    // ---- Extract output safely ----
    const aiOutput =
      data?.output ??
      data?.result?.output ??
      data?.result ??
      data ??
      rawText;

    // The workflow returns plain text → send it directly
    if (typeof aiOutput === "string") {
      return res.status(200).json({ output: aiOutput });
    }

    // If it's an object, return it normally
    return res.status(200).json({ output: aiOutput });
  } catch (err: any) {
    console.error("Unexpected error calling workflow:", err);
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message ?? err,
    });
  }
}
