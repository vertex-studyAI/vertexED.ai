import { GoogleGenAI } from '@google/genai';
import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from './_lib/auth.js';

const TRY_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

function getGeminiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function toMinutes(time12) {
  const parts = String(time12 || '').trim().split(' ');
  const time = parts[0] || '6:00';
  const mer = (parts[1] || 'PM').toUpperCase();
  let [h, m] = time.split(':').map((x) => parseInt(x || '0', 10));
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h * 60 + (m || 0);
}

function toTime12(mins) {
  mins = ((mins % (24 * 60)) + (24 * 60)) % (24 * 60);
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const mer = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${mer}`;
}

function extractText(resp) {
  const anyResp = resp;
  return (
    anyResp?.response?.output_text ||
    anyResp?.response?.text ||
    anyResp?.text ||
    (Array.isArray(anyResp?.response?.candidates)
      ? (anyResp.response.candidates[0]?.content?.parts || [])
          .map((p) => p?.text || '')
          .join('')
      : '')
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res)) return;

  const apiKey = getGeminiKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'Planner AI is not configured on the server.' });
  }

  const body = readJsonBody(req);
  const prompt = String(body.prompt || '').trim();
  const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
  const existingTasks = Array.isArray(body.existingTasks) ? body.existingTasks : [];

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const contextHint = `It's currently ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} on ${currentDate}. Prefer realistic times (e.g., evening meals around 6-8 PM, study sessions in late afternoon/evening), and avoid scheduling in the past. If the user doesn't specify a time, choose an open slot later today; if none exists, pick tomorrow evening. If the user says they want to "crack" or "smash" someone, replace it with a cardio session with the person they mention. If the user says eat dinner, place the timing around dinner time, not 10:00 AM in the morning or smth stupid. Avoid overlaps with existing tasks: ${JSON.stringify(existingTasks)}.`;

  const sysPrompt = `You are a planner assistant. ${contextHint} Return ONLY valid JSON with keys: "task name", "start time" (hh:mm AM/PM), "task duration" (minutes, number), "end time" (hh:mm AM/PM), "date" (MM/DD/YYYY), and "tag". If date is missing, use today (${currentDate}) if the time is in the future; otherwise use tomorrow. Ensure end time = start time + duration.`;

  const client = new GoogleGenAI({ apiKey });
  let lastErr;

  for (const model of TRY_MODELS) {
    try {
      const resp = await client.models.generateContent({
        model,
        contents: `${sysPrompt}\n\nUser: ${prompt}`,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const text = extractText(resp);
      let raw;
      try {
        raw = JSON.parse(text);
      } catch {
        const s = text.indexOf('{');
        const e = text.lastIndexOf('}') + 1;
        raw = JSON.parse(text.slice(s, e));
      }

      const name = String(raw['task name'] || raw.taskName || prompt || 'Task').trim();
      const dateStr = String(raw.date || currentDate);
      const start = String(raw['start time'] || raw.startTime || '06:00 PM');
      const dur = clamp(parseInt(String(raw['task duration'] || raw.taskDuration || 60), 10) || 60, 15, 480);
      const startMin = toMinutes(start);
      const end = toTime12(startMin + dur);
      const tag = tags.includes(String(raw.tag)) ? String(raw.tag) : 'Other';

      return res.status(200).json({
        'task name': name,
        date: dateStr || currentDate,
        'start time': start,
        'task duration': dur,
        'end time': end,
        tag,
      });
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || e || '');
      const retryable = /404|not\s*found|not\s*supported/i.test(msg);
      if (!retryable) break;
    }
  }

  console.error('Planner API error:', lastErr);
  return res.status(500).json({
    error: lastErr?.message || 'Failed to generate planner task',
  });
}
