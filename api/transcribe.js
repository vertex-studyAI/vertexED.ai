import { verifyAuthUser, MAX_AUDIO_BYTES } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > MAX_AUDIO_BYTES) {
    return res.status(413).json({ error: 'Audio upload too large (max 15 MB).' });
  }

  const OPENAI_API_KEY =
    process.env.ChatbotKey || process.env.OPENAI_API_KEY || process.env.CHATBOT_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not set" });
  }

  try {
    const getRawBody = (req) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      });

    const contentType = (req.headers["content-type"] || "").toLowerCase();

    let audioBuffer = null;
    let filename = `recording_${Date.now()}.webm`;
    let language = undefined;
    let createCards = false;
    let flashCount = 6;
    let summaryOnly = false;
    let createNotes = false;
    let noteFormat = "Quick Notes";
    let noteLength = "medium";

    if (contentType.startsWith("multipart/form-data")) {
      const raw = await getRawBody(req);
      const ct = req.headers["content-type"];
      const m = ct.match(/boundary=(.*)$/);
      if (!m) return res.status(400).json({ error: "Boundary not found in content-type" });
      const boundary = `--${m[1]}`;
      const rawStr = raw.toString("binary");
      const parts = rawStr.split(boundary).filter(Boolean);
      let filePartBuf = null;
      for (const p of parts) {
        if (p.indexOf('name="file"') !== -1 || p.indexOf('name="audio"') !== -1) {
          const headerEnd = p.indexOf("\r\n\r\n");
          if (headerEnd === -1) continue;
          const header = p.slice(0, headerEnd);
          const fnMatch = header.match(/filename="(.+?)"/i);
          if (fnMatch) filename = fnMatch[1];
          const fileDataBinary = p.slice(headerEnd + 4, p.length - 2);
          const fileBuf = Buffer.from(fileDataBinary, "binary");
          filePartBuf = fileBuf;
          break;
        }
      }
      if (!filePartBuf) return res.status(400).json({ error: "No file part found in multipart body" });
      audioBuffer = filePartBuf;
      const lower = rawStr.toLowerCase();
      createCards = /name="createcards"/i.test(lower);
      const fcMatch = rawStr.match(/name="flashcount"[\s\S]*?(\d{1,2})/i);
      if (fcMatch) flashCount = Math.max(4, Math.min(16, Number(fcMatch[1])));
      const langMatch = rawStr.match(/name="language"[\s\S]*?([a-z\-]{2,10})/i);
      if (langMatch) language = langMatch[1];
      summaryOnly = /name="summaryonly"/i.test(lower);
      createNotes = /name="createnotes"/i.test(lower) || /name="createnote"/i.test(lower);
      const nfMatch = rawStr.match(/name="noteformat"[\s\S]*?([^\r\n<]+)/i);
      if (nfMatch) noteFormat = String(nfMatch[1]).trim();
      const nlMatch = rawStr.match(/name="length"[\s\S]*?([^\r\n<]+)/i);
      if (nlMatch) noteLength = String(nlMatch[1]).trim();
    } else {
      const body = req.body || {};
      const {
        audioBase64,
        filename: fn,
        language: lang,
        createCards: cCards = false,
        flashCount: fCount = 6,
        summaryOnly: sOnly = false,
        createNotes: cNotes = false,
        noteFormat: nFormat = "Quick Notes",
        length: nLen = "medium"
      } = body;

      if (!audioBase64) {
        return res.status(400).json({ error: "Missing audioBase64 (or send multipart/form-data)" });
      }

      audioBuffer = Buffer.from(audioBase64, "base64");
      if (fn) filename = fn;
      language = lang;
      createCards = !!cCards;
      flashCount = Math.max(4, Math.min(16, Number(fCount)));
      summaryOnly = !!sOnly;
      createNotes = !!cNotes;
      noteFormat = nFormat;
      noteLength = nLen;
    }

    if (!audioBuffer) {
      return res.status(400).json({ error: "No audio buffer received" });
    }

    if (audioBuffer.length > MAX_AUDIO_BYTES) {
      return res.status(413).json({ error: "Audio file too large (max 15 MB)." });
    }

    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer], { type: "audio/webm" }), filename);
    formData.append("model", "gpt-4o-mini-transcribe");
    if (language) formData.append("language", language);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData
    });

    if (!response.ok) {
      const txt = await response.text();
      return res.status(500).json({ error: `OpenAI API error: ${txt}` });
    }

    const transcription = await response.json();
    let transcriptText = transcription.text || "";

    if (createNotes) {
      const prompt = `Convert this lecture transcript into ${noteFormat} style notes in ${noteLength} length. Ensure chronological order and capture all key points:\n\n${transcriptText}`;
      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a precise, structured academic notetaker." },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
        }),
      });
      const noteData = await aiResponse.json();
      transcriptText = noteData.choices?.[0]?.message?.content || transcriptText;
    }

    let flashcards = [];
    if (createCards && transcriptText.trim()) {
      const flashPrompt = `Create ${flashCount} flashcards from the content below.
Return ONLY JSON: { "flashcards": [ { "front": "...", "back": "..." } ] }

CONTENT:
${transcriptText.slice(0, 10000)}`;

      const flashResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: flashPrompt }],
          temperature: 0.35,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        }),
      });

      if (flashResponse.ok) {
        const flashData = await flashResponse.json();
        const rawFlash = flashData.choices?.[0]?.message?.content ?? "{}";
        try {
          const parsed = JSON.parse(rawFlash);
          flashcards = (parsed.flashcards || [])
            .slice(0, flashCount)
            .map((f) => ({
              front: (f.front || f.question || "").trim(),
              back: (f.back || f.answer || "").trim(),
            }))
            .filter((f) => f.front && f.back);
        } catch {
          flashcards = [];
        }
      }
    }

    return res.status(200).json({
      success: true,
      transcription: transcriptText,
      transcript: transcriptText,
      notes: transcriptText,
      summary: transcriptText.slice(0, 240),
      flashcards,
      createdCards: createCards,
      summaryOnly,
      noteFormat,
      noteLength,
    });
  } catch (error) {
    console.error("Transcribe error:", error);
    return res.status(500).json({ error: "Server error during transcription" });
  }
}
