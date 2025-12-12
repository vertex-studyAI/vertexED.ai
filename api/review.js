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
    return res.status(500).json({ error: "Server misconfiguration: missing API key or workflow ID" });
  }

  try {
    const { input_as_text, prompt, strictness = 5, register = false } = req.body ?? {};
    const combinedInput = (input_as_text || prompt || "").toString().trim();

    if (!combinedInput) {
      return res.status(400).json({ error: "No input provided" });
    }

    const workflowResp = await fetch(
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

    const rawText = await workflowResp.text();
    let data: any;

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
      data = { raw: rawText };
    }

    if (!workflowResp.ok) {
      console.error("OpenAI workflow error:", workflowResp.status, data);
      const msg = data?.error ?? data;
      return res.status(502).json({
        error: "Workflow call failed",
        status: workflowResp.status,
        details: msg,
      });
    }

    // Extract output from common locations
    const aiOutput =
      data?.result?.output ??
      data?.result?.output_text ??
      data?.output ??
      data?.result ??
      data?.raw ??
      data;

    // ----  SCHEMA ENFORCEMENT  ----
    const schemaSafe = {
      task_context: {
        curriculum: aiOutput?.task_context?.curriculum || "",
        subject: aiOutput?.task_context?.subject || "",
        year_band: aiOutput?.task_context?.year_band || "",
        task_type: aiOutput?.task_context?.task_type || "",
        criteria_assessed: Array.isArray(aiOutput?.task_context?.criteria_assessed)
          ? aiOutput.task_context.criteria_assessed
          : [],
      },
      marks: typeof aiOutput?.marks === "object" && aiOutput.marks !== null
        ? aiOutput.marks
        : {},
      justification: typeof aiOutput?.justification === "object" && aiOutput.justification !== null
        ? aiOutput.justification
        : {},
      strengths: aiOutput?.strengths || "",
      improvements: aiOutput?.improvements || "",
      actionable_steps: aiOutput?.actionable_steps || "",
      overall_comment: aiOutput?.overall_comment || "",
    };

    return res.status(200).json({ output: schemaSafe });
  } catch (err: any) {
    console.error("Unexpected error calling workflow:", err);
    return res.status(500).json({
      error: "Unexpected server error",
      details: err?.message ?? err,
    });
  }
}
