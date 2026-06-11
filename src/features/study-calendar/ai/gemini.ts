import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

let client: GoogleGenAI | null = null;

function getClient() {
if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");
  if (!client) client = new GoogleGenAI({ apiKey });
    return client;
}

export async function textToTask(prompt: string, tags: string[], existingTasks: any[]) {
    const tryModels = [
    "gemini-2.5-flash",
      "gemini-2.5-pro",
    "gemini-2.0-flash",
        "gemini-1.5-flash",
  ];

  const now = new Date();
    const currentDate = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

const contextHint = `It's currently ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} on ${currentDate}. Prefer realistic times (e.g., evening meals around 6-8 PM, study sessions in late afternoon/evening), and avoid scheduling in the past. If the user doesn't specify a time, choose an open slot later today; if none exists, pick tomorrow evening. If the user says they want to "crack" or "smash" someone, replace it with a cardio session with the person they mention. If the user says eat dinner, place the timing around dinner time, not 10:00 AM in the morning or smth stupid. Avoid overlaps with existing tasks: ${JSON.stringify(existingTasks)}.`;

  const sysPrompt = `You are a planner assistant. ${contextHint} Return ONLY valid JSON with keys: "task name", "start time" (hh:mm AM/PM), "task duration" (minutes, number), "end time" (hh:mm AM/PM), "date" (MM/DD/YYYY), and "tag". If date is missing, use today (${currentDate}) if the time is in the future; otherwise use tomorrow. Ensure end time = start time + duration.`;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

  const toMinutes = (time12: string) => {
      const str = String(time12 ?? '').trim();
    if (!str) throw new Error(`Invalid time value: ${time12}`);
      const parts = str.split(' ');
    const time = parts[0] ?? '6:00';
        const mer = (parts[1] ?? 'PM').toUpperCase();
    let [h, m] = time.split(':').map((x) => parseInt(x || '0', 10));
      if (mer === 'PM' && h !== 12) h += 12;
    if (mer === 'AM' && h === 12) h = 0;
      return h * 60 + (m || 0);
  };

    const toTime12 = (mins: number) => {
    mins = ((mins % (24 * 60)) + (24 * 60)) % (24 * 60);
      let h = Math.floor(mins / 60);
    const m = mins % 60;
      const mer = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
        if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${mer}`;
  };

  let lastErr: unknown;
    const ai = getClient();

  for (const model of tryModels) {
      try {
      const resp = await ai.models.generateContent({
          model,
        contents: `${sysPrompt}\n\nUser: ${prompt}`,
            generationConfig: { responseMimeType: "application/json" },
      } as any);

        const text = (resp as any).candidates?.[0]?.content?.parts
        ?.map((p: any) => p?.text ?? "")
            .join("") ?? "";

      let raw: any;
        try {
        raw = JSON.parse(text);
      } catch {
          const s = text.indexOf('{');
        const e = text.lastIndexOf('}') + 1;
          raw = JSON.parse(text.slice(s, e));
      }

        const name = String(raw["task name"] || raw.taskName || prompt || 'Task').trim();
      const dateStr = String(raw.date || currentDate);
        const start = String(raw["start time"] || raw.startTime || '06:00 PM');
      const dur = clamp(parseInt(String(raw["task duration"] || raw.taskDuration || 60), 10) || 60, 15, 480);
        const startMin = toMinutes(start);
      const end = toTime12(startMin + dur);

      const rawTag = raw.tag != null ? String(raw.tag) : '';
        const tag = tags.includes(rawTag) ? rawTag : 'Other';

      return {
          "task name": name,
        date: dateStr || currentDate,
          "start time": start,
        "task duration": dur,
          "end time": end,
        tag,
      };
    } catch (e) {
        lastErr = e;
      const msg = String((e as any)?.message || e || "");
        const isModelMissing = /404|not\s*found|not\s*supported/i.test(msg);
      if (!isModelMissing) break;
    }
  }

    throw lastErr ?? new Error("Failed to generate task JSON");
}
