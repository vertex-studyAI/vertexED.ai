// api/transcribe.js
// Accepts:
//  - multipart/form-data with "file" (browser FormData upload) OR
//  - JSON { audioBase64, filename } (older approach)
// Optional JSON fields (when using JSON body): createCards, flashCount, language
// Response: { transcription, summary, flashcards, durationHint }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const OPENAI_API_KEY = process.env.ChatbotKey;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key not set" });
  }

  try {
    // helper: read raw request body into buffer
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

    if (contentType.startsWith("multipart/form-data")) {
      // parse boundary and extract first file part named "file"
      const raw = await getRawBody(req);
      const ct = req.headers["content-type"];
      const m = ct.match(/boundary=(.*)$/);
      if (!m) return res.status(400).json({ error: "Boundary not found in content-type" });
      const boundary = `--${m[1]}`;

      const rawStr = raw.toString("binary"); // keep bytes intact
      const parts = rawStr.split(boundary).filter(Boolean);

      // find file part with 'name="file"'
      let filePartBuf = null;
      for (const p of parts) {
        if (p.indexOf('name="file"') !== -1 || p.indexOf('name="audio"') !== -1) {
          // header end -> \r\n\r\n
          const headerEnd = p.indexOf("\r\n\r\n");
          if (headerEnd === -1) continue;
          const header = p.slice(0, headerEnd);
          // extract filename from header
          const fnMatch = header.match(/filename="(.+?)"/i);
          if (fnMatch) filename = fnMatch[1];
          // raw file bytes come after headerEnd+4 until part end minus trailing newline
          const fileDataBinary = p.slice(headerEnd + 4, p.length - 2); // drop trailing \r\n
          // convert binary string back to Buffer preserving binary
          const fileBuf = Buffer.from(fileDataBinary, "binary");
          filePartBuf = fileBuf;
          break;
        }
      }
      if (!filePartBuf) return res.status(400).json({ error: "No file part found in multipart body" });
      audioBuffer = filePartBuf;

      // try to parse other fields: createCards, flashCount, language, summaryOnly
      // naive parse: look for name="createCards" etc in parts
      const lower = rawStr.toLowerCase();
      createCards = /name="createcards"/i.test(lower);
      const fcMatch = rawStr.match(/name="flashcount"[\s\S]*?(\d{1,2})/i);
      if (fcMatch) flashCount = Math.max(4, Math.min(16, Number(fcMatch[1])));
      const langMatch = rawStr.match(/name="language"[\s\S]*?([a-z\-]{2,10})/i);
      if (langMatch) language = langMatch[1];
      summaryOnly = /name="summaryonly"/i.test(lower);
    } else {
      // assume JSON body (the older base64 approach)
      const body = req.body || {};
      const {
        audioBase64,
        filename: fn,
        language: lang,
        createCards: cCards = false,
        flashCount: fCount = 6,
        summaryOnly: sOnly = false,
      } = body;
      if (!audioBase64) {
        return res.status(400).json({ error: "Missing audioBase64 (or send multipart/form-data)" });
      }
      audioBuffer = Buffer.from(audioBase64, "base64");
      if (fn) filename = fn;
      language = lang;
      createCards = !!cCards;
      flashCount = Math.max(4, Math.min(16, Number(fCount || 6)));
      summaryOnly = !!sOnly;
    }

    // Build multipart for OpenAI transcription endpoint manually again
    const boundary2 = "----OpenAIFormBoundary" + Math.random().toString(36).slice(2);
    const nl = "\r\n";
    const pre =
      `--${boundary2}${nl}` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"${nl}` +
      `Content-Type: audio/webm${nl}${nl}`;
    const mid = `${nl}--${boundary2}${nl}Content-Disposition: form-data; name="model"${nl}${nl}whisper-1${nl}`;
    const langField = language ? `${nl}--${boundary2}${nl}Content-Disposition: form-data; name="language"${nl}${nl}${language}${nl}` : "";
    const closing = `--${boundary2}--${nl}`;

    const preBuf = Buffer.from(pre, "utf8");
    const postBuf = Buffer.from(mid + langField + closing, "utf8");
    const multipartBody = Buffer.concat([preBuf, audioBuffer, postBuf]);

    const transcriptionRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${boundary2}`,
      },
      body: multipartBody,
    });

    if (!transcriptionRes.ok) {
      const txt = await transcriptionRes.text().catch(() => "");
      console.error("OpenAI transcription error:", transcriptionRes.status, txt);
      return res.status(502).json({ error: "Transcription failed", detail: txt });
    }

    const transcriptionData = await transcriptionRes.json();
    const transcriptionText = transcriptionData.text ?? "";

    const firstLine = (transcriptionText || "").split(/[\r\n]+/).find(Boolean) || "";
    const firstSentence = (firstLine.split(/[.!?]/)[0] || "").trim();
    const summary = firstSentence || (transcriptionText ? transcriptionText.slice(0, 180) + (transcriptionText.length > 180 ? "..." : "") : "");

    // optionally create flashcards (call chat completions)
    let flashcards = [];
    if (createCards && transcriptionText.trim()) {
      try {
        const safeCount = Math.max(4, Math.min(16, Number(flashCount || 6)));
        const systemMessage = {
          role: "system",
          content: "You are a helpful study assistant. Produce STRICT JSON flashcards when asked.",
        };
        const userMessage = {
          role: "user",
          content:
            `Create up to ${safeCount} flashcards from the transcription below. Return STRICT JSON only in the shape: { "flashcards": [ { "front":"Q", "back":"A" } ] }.\n\n${transcriptionText}`,
        };

        const cardsRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [systemMessage, userMessage],
            temperature: 0.65,
            max_tokens: 800,
            n: 1,
          }),
        });

        if (cardsRes.ok) {
          const cardsData = await cardsRes.json();
          let cardsRaw = cardsData.choices?.[0]?.message?.content || "";
          if (cardsRaw.startsWith("```")) cardsRaw = cardsRaw.replace(/```(?:json)?/g, "").trim();
          const fb = cardsRaw.indexOf("{");
          const lb = cardsRaw.lastIndexOf("}");
          const candidate = fb !== -1 && lb !== -1 && lb > fb ? cardsRaw.slice(fb, lb + 1) : cardsRaw;
          try {
            const parsed = JSON.parse(candidate);
            if (Array.isArray(parsed.flashcards)) {
              flashcards = parsed.flashcards.slice(0, safeCount).map((c) => ({
                front: (c.front || c.question || "").toString().trim(),
                back: (c.back || c.answer || "").toString().trim(),
              }));
            } else if (Array.isArray(parsed)) {
              flashcards = parsed.slice(0, safeCount).map((c) => ({
                front: (c.front || c.question || "").toString().trim(),
                back: (c.back || c.answer || "").toString().trim(),
              }));
            }
          } catch (e) {
            // relaxed parse fallback
            const arrMatch = candidate.match(/\[\s*{[\s\S]*}\s*\]/m);
            if (arrMatch) {
              try {
                const parsedArr = JSON.parse(arrMatch[0]);
                flashcards = parsedArr.slice(0, safeCount).map((c) => ({
                  front: (c.front || c.question || "").toString().trim(),
                  back: (c.back || c.answer || "").toString().trim(),
                }));
              } catch (e2) { flashcards = []; }
            }
          }
        } else {
          console.error("Cards API error", cardsRes.status, await cardsRes.text().catch(()=>""));
        }
      } catch (err) {
        console.error("Flashcards generation failed:", err);
      }
    }

    const payload = { transcription: transcriptionText, summary, flashcards, durationHint: transcriptionData?.duration ?? null };
    if (summaryOnly) return res.status(200).json({ transcription: transcriptionText, summary });
    return res.status(200).json(payload);
  } catch (err) {
    console.error("Transcribe handler error:", err);
    return res.status(500).json({ error: "Transcription handler failed", detail: String(err) });
  }
}
