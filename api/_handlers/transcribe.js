import { verifyAuthUser } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { fetchProvider } from '../_lib/providerRequest.js';
import { parseTranscriptionRequest, TranscriptionInputError } from '../_lib/transcriptionInput.js';

const TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';
const ENRICHMENT_MODEL = 'gpt-4o-mini';

function parseFlashcards(raw, limit) {
  try {
    const parsed = JSON.parse(raw);
    return (Array.isArray(parsed?.flashcards) ? parsed.flashcards : [])
      .slice(0, limit)
      .map((card) => ({
        front: String(card?.front || card?.question || '').trim().slice(0, 500),
        back: String(card?.back || card?.answer || '').trim().slice(0, 1000),
      }))
      .filter((card) => card.front && card.back);
  } catch {
    return [];
  }
}

async function generateNotes(apiKey, transcript, noteFormat, noteLength) {
  const response = await fetchProvider({
    capability: 'transcription_notes', provider: 'openai', model: ENRICHMENT_MODEL,
    url: 'https://api.openai.com/v1/chat/completions',
    options: {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ENRICHMENT_MODEL,
        messages: [
          { role: 'system', content: 'You are a precise academic notetaker. Preserve facts from the transcript and never add unsupported claims.' },
          { role: 'user', content: `Convert this transcript into ${noteFormat} notes with ${noteLength} detail. Keep chronological order and key points.\n\n${transcript.slice(0, 30_000)}` },
        ],
        temperature: 0.3,
        max_tokens: 2200,
      }),
    },
  });
  if (!response.ok) throw new Error(`Note enrichment returned ${response.status}.`);
  const data = await response.json();
  const result = data?.choices?.[0]?.message?.content;
  if (typeof result !== 'string' || !result.trim()) throw new Error('Note enrichment was empty.');
  return result.trim();
}

async function generateFlashcards(apiKey, content, count) {
  const response = await fetchProvider({
    capability: 'transcription_flashcards', provider: 'openai', model: ENRICHMENT_MODEL,
    url: 'https://api.openai.com/v1/chat/completions',
    options: {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ENRICHMENT_MODEL,
        messages: [{ role: 'user', content: `Create ${count} flashcards from the content. Return only JSON as {"flashcards":[{"front":"...","back":"..."}]}.\n\n${content.slice(0, 10_000)}` }],
        temperature: 0.35,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
    },
  });
  if (!response.ok) throw new Error(`Flashcard enrichment returned ${response.status}.`);
  const data = await response.json();
  return parseFlashcards(data?.choices?.[0]?.message?.content ?? '{}', count);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!(await rateLimitUserEndpoint(user.id, 'transcribe', res, { limit: 20, windowMs: 60 * 60 * 1000 }))) return;

  const apiKey = process.env.ChatbotKey || process.env.OPENAI_API_KEY || process.env.CHATBOT_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Transcription is not configured.' });

  try {
    const input = await parseTranscriptionRequest(req);
    const formData = new FormData();
    formData.append('file', new Blob([input.audioBuffer], { type: input.mimeType }), input.filename);
    formData.append('model', TRANSCRIPTION_MODEL);
    if (input.language) formData.append('language', input.language);

    const response = await fetchProvider({
      capability: 'transcription', provider: 'openai', model: TRANSCRIPTION_MODEL,
      url: 'https://api.openai.com/v1/audio/transcriptions',
      timeoutMs: 60_000,
      options: { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: formData },
    });
    if (!response.ok) {
      console.error('Transcription provider rejected request:', response.status);
      return res.status(502).json({ error: 'Transcription service unavailable. Please try again.' });
    }
    const transcription = await response.json();
    const transcript = typeof transcription?.text === 'string' ? transcription.text.trim() : '';
    if (!transcript) return res.status(502).json({ error: 'Transcription service returned no text.' });

    let notes = transcript;
    let notesDegraded = false;
    if (input.createNotes) {
      try {
        notes = await generateNotes(apiKey, transcript, input.noteFormat, input.noteLength);
      } catch (error) {
        notesDegraded = true;
        console.error('Transcription note enrichment failed:', error instanceof Error ? error.name : 'UnknownError');
      }
    }

    let flashcards = [];
    let flashcardsDegraded = false;
    if (input.createCards) {
      try {
        flashcards = await generateFlashcards(apiKey, notes, input.flashCount);
        flashcardsDegraded = flashcards.length === 0;
      } catch (error) {
        flashcardsDegraded = true;
        console.error('Transcription flashcard enrichment failed:', error instanceof Error ? error.name : 'UnknownError');
      }
    }

    return res.status(200).json({
      success: true,
      transcription: transcript,
      transcript,
      notes,
      summary: notes.slice(0, 240),
      flashcards,
      createdCards: input.createCards,
      summaryOnly: input.summaryOnly,
      noteFormat: input.noteFormat,
      noteLength: input.noteLength,
      degraded: { notes: notesDegraded, flashcards: flashcardsDegraded },
    });
  } catch (error) {
    if (error instanceof TranscriptionInputError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Transcribe error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(502).json({ error: 'Transcription is temporarily unavailable.' });
  }
}
