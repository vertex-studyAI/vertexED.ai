import { verifyAuthUser } from '../_lib/auth.js';
import { resolveChatProvider } from '../_lib/aiProviders.js';
import { listOpenAiProjectAgents } from '../_lib/openAiAgents.js';

/** Public catalog only — never includes system instructions. */
export const BUILT_IN_STUDY_AGENTS = Object.freeze([
  Object.freeze({ id: 'apexTutor', name: 'Apex Tutor', capability: 'chatbot' }),
  Object.freeze({ id: 'plannerCoach', name: 'Planner Coach', capability: 'planner' }),
  Object.freeze({ id: 'notesArchitect', name: 'Notes Architect', capability: 'notes' }),
  Object.freeze({ id: 'quizBuilder', name: 'Quiz Builder', capability: 'quiz' }),
  Object.freeze({ id: 'answerReviewer', name: 'Answer Reviewer', capability: 'grading' }),
  Object.freeze({ id: 'paperDesigner', name: 'Paper Designer', capability: 'paper-generator' }),
  Object.freeze({ id: 'notebookResearcher', name: 'Notebook Researcher', capability: 'notebook' }),
  Object.freeze({ id: 'guideTutor', name: 'Study Guide Tutor', capability: 'study-guide-chat' }),
  Object.freeze({ id: 'boardResourceEditor', name: 'Board Resource Editor', capability: 'board-resource' }),
  Object.freeze({ id: 'transcriptionAssistant', name: 'Transcription Assistant', capability: 'transcription' }),
]);

export default async function handler(req, res) {
  const user = await verifyAuthUser(req, res);
  if (!user) return;

  res.setHeader('Cache-Control', 'private, no-store');

  try {
    const config = resolveChatProvider();
    if (config.name !== 'openai') {
      res.status(200).json({
        builtIn: BUILT_IN_STUDY_AGENTS,
        account: {
          status: 'unavailable',
          projectRouting: 'unknown',
          agents: [],
        },
      });
      return;
    }

    const agents = await listOpenAiProjectAgents({ config });
    res.status(200).json({
      builtIn: BUILT_IN_STUDY_AGENTS,
      account: {
        status: 'connected',
        projectRouting: 'key-default',
        agents,
      },
    });
  } catch (error) {
    const missingKey =
      error instanceof Error &&
      (error.message.startsWith('Missing OpenAI API key') ||
        error.message.includes('Missing OpenAI API key'));
    res.status(200).json({
      builtIn: BUILT_IN_STUDY_AGENTS,
      account: {
        status: missingKey ? 'not-configured' : 'unavailable',
        projectRouting: 'unknown',
        agents: [],
      },
    });
  }
}
