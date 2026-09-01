import { createHash } from 'node:crypto';

const clean = (value, limit = 500) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

export function artifactSourceDigest(value) {
  return createHash('sha256').update(String(value)).digest('hex');
}

function uniqueIdeas(value) {
  return [...new Set(clean(value, 20_000)
    .split(/(?:\r?\n|(?<=[.!?])\s+)/)
    .map((item) => item.replace(/^[-*#\d.)\s]+/, '').trim())
    .filter((item) => item.length >= 12))];
}

export function buildDeterministicFlashcards(text, count = 8) {
  const safeCount = Math.max(1, Math.min(16, Number(count) || 8));
  const ideas = uniqueIdeas(text).slice(0, safeCount);
  return ideas.map((idea, index) => ({
    front: `Explain source idea ${index + 1} in your own words.`,
    back: idea,
    provenance: {
      generator: 'deterministic-source-extraction',
      sourceDigest: artifactSourceDigest(text),
      sourceIndex: index,
    },
  }));
}

export function buildDeterministicNoteFallback({ topic, additionalInfo = '', flashCount = 8 }) {
  const safeTopic = clean(topic, 240) || 'the selected topic';
  const sourceIdeas = uniqueIdeas(additionalInfo);
  const sourceSection = sourceIdeas.length
    ? sourceIdeas.map((idea) => `- ${idea}`).join('\n')
    : '- No source notes were supplied. Add course material before treating this scaffold as factual study content.';
  const result = [
    `# ${safeTopic}`,
    '',
    '> Offline study scaffold: verify every substantive answer against your syllabus or teacher-approved source.',
    '',
    '## Supplied source ideas',
    sourceSection,
    '',
    '## Retrieval prompts',
    `- Define the central terms used in ${safeTopic}.`,
    `- Explain one mechanism, argument, or worked step from ${safeTopic}.`,
    `- Give one example and one boundary case for ${safeTopic}.`,
    `- Identify what evidence would justify a conclusion about ${safeTopic}.`,
    '',
    '## Verification checklist',
    '- Match terminology to the current course specification.',
    '- Check units, dates, quotations, and command terms against an authoritative source.',
    '- Attempt the retrieval prompts without looking, then correct the response in a different colour.',
  ].join('\n');
  return {
    result,
    summary: `Offline verification scaffold for ${safeTopic}`,
    flashcards: buildDeterministicFlashcards(additionalInfo || safeTopic, flashCount),
    structured: { tables: [], charts: [] },
  };
}

export function buildGenerationMetadata({ capability, mode, model = null, source, failureClass = null }) {
  return {
    contractVersion: 'vertexed.learning-artifact.v1',
    capability,
    mode,
    provider: model ? 'openai' : null,
    model,
    promptVersion: `${capability}.v1`,
    sourceDigest: artifactSourceDigest(source),
    degraded: mode !== 'model',
    failureClass,
  };
}

export function buildDeterministicPaperFallback(data) {
  const topics = Array.isArray(data.topics) && data.topics.length ? data.topics : ['course fundamentals'];
  const commands = data.difficulty === 'Easy'
    ? ['Define', 'Describe', 'Identify']
    : data.difficulty === 'Hard'
      ? ['Evaluate', 'Synthesize', 'Justify']
      : ['Explain', 'Apply', 'Compare'];
  const questionCount = Math.max(1, Math.min(50, Number(data.numQuestions) || 10));
  const requestedMarks = data.criteriaMode || data.marks === null
    ? null
    : Math.max(questionCount, Math.min(500, Math.round(Number(data.marks) || questionCount)));
  const baseMarks = requestedMarks === null ? null : Math.floor(requestedMarks / questionCount);
  const remainderMarks = requestedMarks === null ? 0 : requestedMarks % questionCount;
  const source = JSON.stringify({
    board: data.board,
    grade: data.grade,
    subject: data.subject,
    topics,
    format: data.format,
    difficulty: data.difficulty,
    questionCount,
    criteria: data.criteria,
  });
  const sourceDigest = artifactSourceDigest(source);
  const questions = Array.from({ length: questionCount }, (_, index) => {
    const topic = clean(topics[index % topics.length], 160) || 'course fundamentals';
    const command = commands[index % commands.length];
    const marks = baseMarks === null ? null : baseMarks + (index < remainderMarks ? 1 : 0);
    return {
      id: `fallback-q-${index + 1}`,
      question: `${command} ${topic} using evidence or working appropriate to ${data.subject || 'the course'}.`,
      marks,
      approxTime: marks ? `${Math.max(2, Math.round(marks * 1.2))} minutes` : 'Use rubric weighting',
      modelAnswerOutline: 'Human verification required: identify the relevant course criterion, cite the supplied evidence or show working, and check terminology against the current specification.',
      imageRefs: [],
      objectiveIds: [`${clean(data.subject, 40) || 'general'}:${artifactSourceDigest(topic).slice(0, 10)}`],
      provenance: { generator: 'deterministic-practice-scaffold', sourceDigest, topic },
    };
  });
  return {
    title: `${data.board} ${data.subject || 'General'} practice scaffold`,
    metadata: {
      board: data.board,
      grade: data.grade ?? 'unspecified',
      subject: data.subject || 'General',
      format: data.format,
      difficulty: data.difficulty,
      numQuestions: questionCount,
      totalMarks: requestedMarks,
      criteriaMode: data.criteriaMode,
    },
    sections: [{
      id: 'fallback-section-1',
      title: 'Verified-source practice prompts',
      instructions: 'This deterministic scaffold contains no generated factual answer key. Verify prompts and marking guidance against your current syllabus before use.',
      questions,
    }],
    rubricNotes: [
      'Treat every score as provisional until a qualified reviewer checks the response against the current mark scheme.',
      data.criteriaMode ? `Apply the selected criteria: ${clean(data.criteria, 300) || 'course rubric'}.` : `Check the requested mark total before timed use.`,
    ],
    images: data.images || [],
    provenance: { generator: 'deterministic-practice-scaffold', sourceDigest, topics },
  };
}

export function isUsableGeneratedPaper(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (!value.metadata || typeof value.metadata !== 'object') return false;
  if (!Array.isArray(value.sections) || value.sections.length === 0) return false;
  const questions = value.sections.flatMap((section) => Array.isArray(section?.questions) ? section.questions : []);
  return questions.length > 0 && questions.every((question) => typeof question?.question === 'string' && question.question.trim());
}

export function normalizeGeneratedPaper(value, data) {
  if (!isUsableGeneratedPaper(value)) return null;
  const rawQuestions = value.sections.flatMap((section) => Array.isArray(section?.questions) ? section.questions : []);
  const expectedCount = Math.max(1, Math.min(50, Number(data.numQuestions) || 10));
  if (rawQuestions.length !== expectedCount) return null;

  const sections = value.sections.map((section, sectionIndex) => ({
    id: clean(section?.id, 100) || `section-${sectionIndex + 1}`,
    title: clean(section?.title, 240) || `Section ${sectionIndex + 1}`,
    instructions: clean(section?.instructions, 2_000),
    questions: section.questions.map((question, questionIndex) => ({
      id: clean(question?.id, 100) || `q-${sectionIndex + 1}-${questionIndex + 1}`,
      question: clean(question?.question, 10_000),
      marks: Number.isFinite(Number(question?.marks)) && Number(question.marks) > 0
        ? Math.round(Number(question.marks))
        : null,
      approxTime: clean(question?.approxTime, 120) || null,
      modelAnswerOutline: clean(question?.modelAnswerOutline, 5_000)
        || 'Human verification required against the current mark scheme.',
      imageRefs: Array.isArray(question?.imageRefs)
        ? question.imageRefs.map((item) => clean(item, 240)).filter(Boolean).slice(0, 10)
        : [],
      objectiveIds: Array.isArray(question?.objectiveIds)
        ? question.objectiveIds.map((item) => clean(item, 120)).filter(Boolean).slice(0, 12)
        : [],
    })),
  }));
  const normalizedQuestions = sections.flatMap((section) => section.questions);
  const marksSum = normalizedQuestions.reduce((sum, question) => sum + (question.marks || 0), 0);
  if (!data.criteriaMode && Number.isFinite(Number(data.marks)) && marksSum !== Number(data.marks)) return null;

  return {
    title: clean(value.title, 300) || `${data.board} ${data.subject || 'General'} practice paper`,
    metadata: {
      board: data.board,
      grade: data.grade ?? 'unspecified',
      subject: data.subject || 'General',
      format: data.format,
      difficulty: data.difficulty,
      numQuestions: expectedCount,
      totalMarks: data.criteriaMode ? null : Number(data.marks),
      criteriaMode: data.criteriaMode,
    },
    sections,
    rubricNotes: Array.isArray(value.rubricNotes)
      ? value.rubricNotes.map((item) => clean(item, 2_000)).filter(Boolean).slice(0, 30)
      : [],
    images: [],
    provenance: value.provenance && typeof value.provenance === 'object' && !Array.isArray(value.provenance)
      ? value.provenance
      : {},
  };
}
