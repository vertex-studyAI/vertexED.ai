// /pages/api/review.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey; // ensure this exact name exists in Vercel
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

    const workflowResp = await fetch(`https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: { input_as_text: combinedInput, strictness, register },
      }),
    });

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
      return res.status(502).json({ error: "Workflow call failed", status: workflowResp.status, details: msg });
    }

    // Try common locations for output — fall back to entire result for debugging
    const output =
      data?.result?.output ??
      data?.result?.output_text ??
      data?.output ??
      data?.result ??
      data?.raw ??
      data;

    // Normalize response to always return { output: string | object }
    return res.status(200).json({ output });
  } catch (err: any) {
    console.error("Unexpected error calling workflow:", err);
    return res.status(500).json({ error: "Unexpected server error", details: err?.message ?? err });
  }
}
