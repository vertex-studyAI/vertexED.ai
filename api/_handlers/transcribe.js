import { verifyAuthUser } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { fetchProvider } from '../_lib/providerRequest.js';
import { routeAiRequest } from '../_lib/aiRouting.js';
import { parseTranscriptionRequest, TranscriptionInputError } from '../_lib/transcriptionInput.js';
import { callChatProvider, createOpenAiHeaders, createSafetyIdentifier, extractChatAnswer, resolveOpenAiConfig } from '../_lib/aiProviders.js';
import { VERTEX_AGENTS } from '../_lib/vertexAgents.js';

const TRANSCRIPTION_MODEL = 'gpt-4o-mini-transcribe';
const ENRICHMENT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-terra';
const FLASHCARD_SCHEMA = {
  type: 'object', properties: { flashcards: { type: 'array', items: {
    type: 'object', properties: { front: { type: 'string' }, back: { type: 'string' } },
    required: ['front', 'back'], additionalProperties: false,
  } } }, required: ['flashcards'], additionalProperties: false,
};

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

async function generateNotes(config, userId, transcript, noteFormat, noteLength) {
  const route = routeAiRequest({ capability: 'note', defaultModel: ENRICHMENT_MODEL, maxTokens: 2200 });
  const result = await callChatProvider({
    config, model: route.model,
    messages: [
      { role: 'system', content: VERTEX_AGENTS.transcriptionAssistant.instructions },
      { role: 'user', content: `Convert this transcript into ${noteFormat} notes with ${noteLength} detail. Keep chronological order and key points.\n\n${transcript.slice(0, 30_000)}` },
    ],
    temperature: 0.3, maxTokens: route.maxTokens, safetyIdentifier: createSafetyIdentifier(userId), capability: 'transcription-notes',
    fetchImpl: (url, options) => fetchProvider({ capability: 'transcription_notes', provider: 'openai', model: route.model, url, options }),
  });
  if (!result.response.ok) throw new Error(`Note enrichment returned ${result.response.status}.`);
  const text = extractChatAnswer(JSON.parse(result.raw));
  if (!text) throw new Error('Note enrichment was empty.');
  return text;
}

async function generateFlashcards(config, userId, content, count) {
  const route = routeAiRequest({ capability: 'flashcards', defaultModel: ENRICHMENT_MODEL, maxTokens: 1200 });
  const result = await callChatProvider({
    config, model: route.model,
    messages: [
      { role: 'system', content: VERTEX_AGENTS.quizBuilder.instructions },
      { role: 'user', content: `Create ${count} flashcards from the content. Return only JSON as {"flashcards":[{"front":"...","back":"..."}]}.\n\n${content.slice(0, 10_000)}` },
    ],
    temperature: 0.35, maxTokens: route.maxTokens, safetyIdentifier: createSafetyIdentifier(userId), capability: 'transcription-flashcards',
    jsonSchema: FLASHCARD_SCHEMA, schemaName: 'vertexed_transcription_flashcards',
    fetchImpl: (url, options) => fetchProvider({ capability: 'transcription_flashcards', provider: 'openai', model: route.model, url, options }),
  });
  if (!result.response.ok) throw new Error(`Flashcard enrichment returned ${result.response.status}.`);
  return parseFlashcards(extractChatAnswer(JSON.parse(result.raw)) ?? '{}', count);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!(await rateLimitUserEndpoint(user.id, 'transcribe', res, { limit: 20, windowMs: 60 * 60 * 1000 }))) return;

  let openAiConfig;
  try {
    openAiConfig = resolveOpenAiConfig(process.env);
  } catch {
    return res.status(503).json({ error: 'Transcription is not configured.' });
  }

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
      options: { method: 'POST', headers: createOpenAiHeaders(openAiConfig, { json: false }), body: formData },
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
        notes = await generateNotes(openAiConfig, user.id, transcript, input.noteFormat, input.noteLength);
      } catch (error) {
        notesDegraded = true;
        console.error('Transcription note enrichment failed:', error instanceof Error ? error.name : 'UnknownError');
      }
    }

    let flashcards = [];
    let flashcardsDegraded = false;
    if (input.createCards) {
      try {
        flashcards = await generateFlashcards(openAiConfig, user.id, notes, input.flashCount);
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
