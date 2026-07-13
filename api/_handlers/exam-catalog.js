import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { catalogueUnavailable, getCatalogueAvailability, getEligibleQuestions } from '../_lib/examCatalog.js';
import { asTrimmedString, deterministicScore, isDeterministicallyScorable, isUuid } from '../_lib/examSafety.js';
import { applyEvidenceToState, evidenceReliability, masteryPercent, nextReviewAt } from '../_lib/mastery.js';

const SESSION_TYPES = new Set(['diagnostic', 'practice', 'mock']);

function statusError(res, status, code, error, extras = {}) {
  return res.status(status).json({ success: false, code, error, ...extras });
}

async function withTables(res, action) {
  try {
    return await action();
  } catch (error) {
    console.error('exam-catalog error:', error);
    const unavailable = catalogueUnavailable(error);
    return res.status(unavailable.status).json({ success: false, ...unavailable });
  }
}

function withoutAnswerKey(question) {
  const questionPayload = question.question_payload && typeof question.question_payload === 'object'
    ? { ...question.question_payload }
    : {};
  delete questionPayload.answerKey;
  return {
    id: question.id,
    externalReference: question.external_reference,
    questionText: question.question_text,
    questionType: question.question_type,
    marks: Number(question.marks),
    questionPayload,
    sourceLocator: question.source_locator,
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function resultFromRun(itemId, run, marks) {
  const score = run.final_score === null || run.final_score === undefined ? null : Number(run.final_score);
  return {
    sessionItemId: itemId,
    score,
    maxScore: Number(marks),
    status: run.status,
    message: run.status === 'verified'
      ? 'Verified deterministic scoring applied.'
      : run.uncertainty_reason || 'Score withheld because this response requires human review.',
    gradingRunId: run.id,
  };
}

async function upsertResponse(supabase, sessionItemId, answerText, responsePayload, submittedAt = null) {
  const { data: existing, error: existingError } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('session_item_id', sessionItemId)
    .maybeSingle();
  if (existingError) throw existingError;

  const values = {
    answer_text: answerText,
    response_payload: responsePayload,
    updated_at: new Date().toISOString(),
    ...(submittedAt ? { submitted_at: submittedAt } : {}),
  };
  const query = existing
    ? supabase.from('assessment_responses').update(values).eq('id', existing.id)
    : supabase.from('assessment_responses').insert({ session_item_id: sessionItemId, ...values });
  const { data, error } = await query.select('*').single();
  if (error) throw error;
  return data;
}

function reviewIntervalDays(observedAt, dueAt) {
  const difference = new Date(dueAt).getTime() - new Date(observedAt).getTime();
  return Math.max(0, Math.round((difference / 86_400_000) * 100) / 100);
}

async function recordEvidenceAndMastery(supabase, {
  userId,
  classifications,
  responseId,
  gradingRunId,
  normalizedScore,
  observedAt,
}) {
  const reliability = evidenceReliability(normalizedScore >= 1 ? 'deterministic_correct' : 'deterministic_incorrect');
  for (const classification of classifications) {
    const nodeId = classification.curriculum_node_id;
    const { data: evidence, error: evidenceError } = await supabase.from('learning_evidence').insert({
      user_id: userId,
      curriculum_node_id: nodeId,
      assessment_response_id: responseId,
      grading_run_id: gradingRunId,
      outcome: normalizedScore,
      reliability,
      evidence_kind: 'selected_response',
      eligible_for_mastery: true,
      recorded_at: observedAt,
    }).select('*').single();
    if (evidenceError) throw evidenceError;

    const { data: current, error: stateError } = await supabase
      .from('mastery_states')
      .select('*')
      .eq('user_id', userId)
      .eq('curriculum_node_id', nodeId)
      .maybeSingle();
    if (stateError) throw stateError;

    const updated = applyEvidenceToState(current ?? {}, {
      evidence_type: normalizedScore >= 1 ? 'deterministic_correct' : 'deterministic_incorrect',
      score_normalized: normalizedScore,
      reliability_weight: reliability,
      observed_at: observedAt,
    });
    const { error: upsertStateError } = await supabase.from('mastery_states').upsert({
      user_id: userId,
      curriculum_node_id: nodeId,
      alpha: updated.alpha,
      beta: updated.beta,
      evidence_weight: Number(current?.evidence_weight ?? 0) + reliability,
      evidence_count: updated.evidence_count,
      last_evidence_at: updated.last_evidence_at,
      model_version: 'beta-v1',
      updated_at: observedAt,
    }, { onConflict: 'user_id,curriculum_node_id' });
    if (upsertStateError) throw upsertStateError;

    const dueAt = nextReviewAt(updated, { score_normalized: normalizedScore, observed_at: observedAt });
    const { error: scheduleError } = await supabase.from('concept_review_schedule').upsert({
      user_id: userId,
      curriculum_node_id: nodeId,
      due_at: dueAt,
      interval_days: reviewIntervalDays(observedAt, dueAt),
      ease: normalizedScore >= 0.8 ? 2.6 : normalizedScore >= 0.5 ? 2.25 : 1.8,
      source_evidence_id: evidence.id,
      updated_at: observedAt,
    }, { onConflict: 'user_id,curriculum_node_id' });
    if (scheduleError) throw scheduleError;
  }
}

async function refreshRecommendations(supabase, userId, subjectId) {
  const { data: nodes, error: nodesError } = await supabase
    .from('curriculum_nodes')
    .select('id, title')
    .eq('subject_id', subjectId)
    .eq('review_status', 'verified');
  if (nodesError) throw nodesError;
  if (!nodes?.length) return;

  const nodeIds = nodes.map((node) => node.id);
  const [{ data: states, error: statesError }, { data: evidence, error: evidenceError }, { data: prerequisites, error: prerequisiteError }] = await Promise.all([
    supabase.from('mastery_states').select('*').eq('user_id', userId).in('curriculum_node_id', nodeIds),
    supabase.from('learning_evidence').select('id, curriculum_node_id, recorded_at').eq('user_id', userId).in('curriculum_node_id', nodeIds).eq('eligible_for_mastery', true).order('recorded_at', { ascending: false }),
    supabase.from('concept_prerequisites').select('prerequisite_node_id, dependent_node_id').eq('review_status', 'verified').in('dependent_node_id', nodeIds),
  ]);
  if (statesError) throw statesError;
  if (evidenceError) throw evidenceError;
  if (prerequisiteError) throw prerequisiteError;

  const byNode = new Map((states ?? []).map((state) => [state.curriculum_node_id, state]));
  const evidenceByNode = new Map();
  for (const row of evidence ?? []) {
    if (!evidenceByNode.has(row.curriculum_node_id)) evidenceByNode.set(row.curriculum_node_id, row.id);
  }

  const candidates = (states ?? [])
    .map((state) => ({
      nodeId: state.curriculum_node_id,
      mastery: masteryPercent(state),
      evidenceCount: Number(state.evidence_count),
    }))
    .filter((state) => state.evidenceCount > 0)
    .sort((left, right) => left.mastery - right.mastery)
    .slice(0, 3);

  const activeNodeIds = [...new Set([...nodeIds, ...(prerequisites ?? []).map((row) => row.prerequisite_node_id)])];
  const { error: supersedeError } = await supabase
    .from('learning_recommendations')
    .update({ status: 'superseded' })
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('curriculum_node_id', activeNodeIds);
  if (supersedeError) throw supersedeError;

  const nodeName = new Map(nodes.map((node) => [node.id, node.title]));
  const records = [];
  for (const candidate of candidates) {
    const missingPrerequisite = (prerequisites ?? []).find((edge) => {
      if (edge.dependent_node_id !== candidate.nodeId) return false;
      const prerequisite = byNode.get(edge.prerequisite_node_id);
      return !prerequisite || masteryPercent(prerequisite) < 60;
    });
    const recommendedNodeId = missingPrerequisite?.prerequisite_node_id ?? candidate.nodeId;
    const prerequisiteName = missingPrerequisite ? nodeName.get(recommendedNodeId) || 'a prerequisite concept' : null;
    records.push({
      user_id: userId,
      curriculum_node_id: recommendedNodeId,
      recommendation_type: missingPrerequisite ? 'prerequisite' : candidate.mastery < 60 ? 'review' : 'practice',
      priority: Math.round(((100 - candidate.mastery) * (1 + Math.min(candidate.evidenceCount, 5) / 10)) * 100) / 100,
      rule_version: 'verified-evidence-v1',
      evidence_ids: evidenceByNode.get(candidate.nodeId) ? [evidenceByNode.get(candidate.nodeId)] : [],
      explanation: missingPrerequisite
        ? `${prerequisiteName} is a verified prerequisite for a topic where recent deterministic evidence is weak. Rebuild it before another timed attempt.`
        : `Recent deterministic evidence on ${nodeName.get(candidate.nodeId) || 'this concept'} is ${candidate.mastery}%. Use a short, targeted ${candidate.mastery < 60 ? 'review' : 'practice'} before a full mock.`,
      status: 'active',
    });
  }
  if (!records.length) return;
  const { error: insertError } = await supabase.from('learning_recommendations').insert(records);
  if (insertError) throw insertError;
}

async function learningSummary(supabase, userId, board, subject) {
  const selection = await getCatalogueAvailability(supabase, { board, subject });
  if (!selection.subject) {
    return { available: false, message: selection.message, nodes: [], edges: [], recommendations: [] };
  }
  const subjectId = selection.subject.id;
  const { data: allNodes, error: nodesError } = await supabase
    .from('curriculum_nodes')
    .select('id, title, node_type, description')
    .eq('subject_id', subjectId)
    .eq('review_status', 'verified')
    .order('title');
  if (nodesError) throw nodesError;
  const nodeIds = (allNodes ?? []).map((node) => node.id);
  if (!nodeIds.length) return { available: true, subject: selection.subject, message: 'No verified curriculum nodes are available yet.', nodes: [], edges: [], recommendations: [] };

  const [{ data: states, error: statesError }, { data: schedules, error: schedulesError }, { data: recommendations, error: recommendationsError }, { data: edges, error: edgesError }] = await Promise.all([
    supabase.from('mastery_states').select('*').eq('user_id', userId).in('curriculum_node_id', nodeIds),
    supabase.from('concept_review_schedule').select('*').eq('user_id', userId).in('curriculum_node_id', nodeIds),
    supabase.from('learning_recommendations').select('*').eq('user_id', userId).eq('status', 'active').in('curriculum_node_id', nodeIds).order('priority', { ascending: false }),
    supabase.from('concept_prerequisites').select('prerequisite_node_id, dependent_node_id, relation').eq('review_status', 'verified').in('dependent_node_id', nodeIds),
  ]);
  if (statesError) throw statesError;
  if (schedulesError) throw schedulesError;
  if (recommendationsError) throw recommendationsError;
  if (edgesError) throw edgesError;

  const stateByNode = new Map((states ?? []).map((state) => [state.curriculum_node_id, state]));
  const scheduleByNode = new Map((schedules ?? []).map((schedule) => [schedule.curriculum_node_id, schedule]));
  const visibleNodes = (allNodes ?? [])
    .filter((node) => stateByNode.has(node.id))
    .map((node) => {
      const state = stateByNode.get(node.id);
      return {
        id: node.id,
        title: node.title,
        nodeType: node.node_type,
        description: node.description,
        masteryPercent: masteryPercent(state),
        evidenceCount: Number(state.evidence_count),
        lastEvidenceAt: state.last_evidence_at,
        dueAt: scheduleByNode.get(node.id)?.due_at ?? null,
      };
    });
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  return {
    available: selection.available,
    subject: selection.subject,
    message: visibleNodes.length
      ? 'This map is based only on verified, deterministically scored assessment evidence.'
      : 'Complete deterministically scorable verified practice to build a concept map.',
    nodes: visibleNodes,
    edges: (edges ?? []).filter((edge) => visibleIds.has(edge.prerequisite_node_id) && visibleIds.has(edge.dependent_node_id)),
    recommendations: recommendations ?? [],
  };
}

export default async function handler(req, res) {
  const user = await verifyAuthUser(req, res);
  if (!user) return;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return res.status(503).json({ success: false, error: 'Database not configured.' });
  }

  if (req.method === 'GET') {
    return withTables(res, async () => {
      const availability = await getCatalogueAvailability(supabase, {
        board: asTrimmedString(req.query?.board, 80),
        subject: asTrimmedString(req.query?.subject, 300),
      });
      return res.status(200).json({ success: true, availability });
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (rejectOversizedJsonBody(req, res, 256_000)) return;
  const body = readJsonBody(req);
  const action = asTrimmedString(body.action, 80);

  return withTables(res, async () => {
    const board = asTrimmedString(body.board, 80);
    const subject = asTrimmedString(body.subject, 300);
    if (action === 'availability') {
      const availability = await getCatalogueAvailability(supabase, { board, subject });
      return res.status(200).json({ success: true, availability });
    }
    if (action === 'learning_summary') {
      return res.status(200).json({ success: true, summary: await learningSummary(supabase, user.id, board, subject) });
    }
    if (action === 'start_session') {
      const availability = await getCatalogueAvailability(supabase, { board, subject });
      if (!availability.available || !availability.subject) {
        return statusError(res, 409, 'AUTHORISED_CONTENT_UNAVAILABLE', availability.message, { availability });
      }
      const requested = Math.max(1, Math.min(Number(body.itemCount) || 5, 12));
      const chosen = shuffle(await getEligibleQuestions(supabase, availability.subject.id)).slice(0, requested);
      if (!chosen.length) return statusError(res, 409, 'NO_VERIFIED_QUESTIONS', 'No verified questions are available for this selection.');
      const startedAt = new Date().toISOString();
      const { data: session, error: sessionError } = await supabase.from('assessment_sessions').insert({
        user_id: user.id,
        subject_id: availability.subject.id,
        session_type: SESSION_TYPES.has(body.sessionType) ? body.sessionType : 'practice',
        scoring_mode: 'verified_only',
        status: 'in_progress',
        started_at: startedAt,
        selection_rule_version: 'verified-random-v1',
      }).select('*').single();
      if (sessionError) throw sessionError;
      const { data: items, error: itemError } = await supabase.from('assessment_session_items').insert(chosen.map((question, index) => ({
        session_id: session.id,
        question_id: question.id,
        ordinal: index + 1,
        question_version_snapshot: withoutAnswerKey(question),
        rubric_version_snapshot: { markSchemePoints: question.markSchemePoints, classifications: question.classifications },
        marks: Number(question.marks),
      }))).select('*');
      if (itemError) throw itemError;
      return res.status(201).json({
        success: true,
        session: {
          id: session.id,
          status: session.status,
          sessionType: session.session_type,
          subjectId: session.subject_id,
          items: (items ?? []).map((item) => ({ id: item.id, ordinal: item.ordinal, ...item.question_version_snapshot })),
        },
      });
    }
    if (action === 'save_response') {
      if (!isUuid(body.sessionId) || !isUuid(body.sessionItemId)) return statusError(res, 400, 'INVALID_SESSION', 'Valid session and session item ids are required.');
      const { data: item, error: itemError } = await supabase
        .from('assessment_session_items')
        .select('id, session_id, assessment_sessions!inner(id, user_id, status)')
        .eq('id', body.sessionItemId).eq('session_id', body.sessionId).eq('assessment_sessions.user_id', user.id).maybeSingle();
      if (itemError) throw itemError;
      if (!item) return statusError(res, 404, 'SESSION_ITEM_NOT_FOUND', 'Session item not found.');
      if (item.assessment_sessions.status !== 'in_progress') return statusError(res, 409, 'SESSION_LOCKED', 'This session is no longer accepting edits.');
      const answerText = asTrimmedString(body.answerText, 20_000);
      const responsePayload = body.responsePayload && typeof body.responsePayload === 'object' ? body.responsePayload : { answer: answerText };
      return res.status(200).json({ success: true, response: await upsertResponse(supabase, item.id, answerText || null, responsePayload) });
    }
    if (action === 'submit_session') {
      if (!isUuid(body.sessionId)) return statusError(res, 400, 'INVALID_SESSION', 'Valid session id required.');
      const { data: session, error: sessionError } = await supabase.from('assessment_sessions').select('*').eq('id', body.sessionId).eq('user_id', user.id).maybeSingle();
      if (sessionError) throw sessionError;
      if (!session) return statusError(res, 404, 'SESSION_NOT_FOUND', 'Session not found.');
      if (session.status !== 'in_progress') return statusError(res, 409, 'SESSION_ALREADY_SUBMITTED', 'This session has already been submitted.');
      const { data: items, error: itemError } = await supabase.from('assessment_session_items').select('*').eq('session_id', session.id).order('ordinal');
      if (itemError) throw itemError;
      const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
      const submittedAt = new Date().toISOString();
      let verifiedScore = 0;
      let verifiedMaxScore = 0;
      const results = [];
      for (const item of items ?? []) {
        const [{ data: question, error: questionError }, { data: classifications, error: classificationsError }, { data: existingRun, error: existingRunError }] = await Promise.all([
          supabase.from('assessment_questions').select('*').eq('id', item.question_id).single(),
          supabase.from('question_classifications').select('*').eq('question_id', item.question_id).eq('review_status', 'verified'),
          supabase.from('grading_runs').select('*').eq('session_item_id', item.id).maybeSingle(),
        ]);
        if (questionError) throw questionError;
        if (classificationsError) throw classificationsError;
        if (existingRunError) throw existingRunError;
        if (existingRun) {
          const result = resultFromRun(item.id, existingRun, item.marks);
          if (result.score !== null && result.status === 'verified') { verifiedScore += result.score; verifiedMaxScore += Number(item.marks); }
          results.push(result);
          continue;
        }
        const rawAnswer = answers[item.id];
        const responsePayload = rawAnswer && typeof rawAnswer === 'object' ? rawAnswer : { answer: asTrimmedString(rawAnswer, 20_000) };
        const answerText = typeof rawAnswer === 'string' ? asTrimmedString(rawAnswer, 20_000) : asTrimmedString(responsePayload.answer, 20_000);
        const response = await upsertResponse(supabase, item.id, answerText || null, responsePayload, submittedAt);
        if (isDeterministicallyScorable(question)) {
          const score = deterministicScore(question, responsePayload) ?? 0;
          const { data: gradingRun, error: gradingError } = await supabase.from('grading_runs').insert({
            session_item_id: item.id, status: 'verified', method: 'deterministic', scorer_version: 'deterministic-selected-response-v1', confidence: 1,
            final_score: score, reviewed_at: submittedAt,
          }).select('*').single();
          if (gradingError) throw gradingError;
          const normalizedScore = Number(item.marks) > 0 ? score / Number(item.marks) : 0;
          await recordEvidenceAndMastery(supabase, { userId: user.id, classifications: classifications ?? [], responseId: response.id, gradingRunId: gradingRun.id, normalizedScore, observedAt: submittedAt });
          verifiedScore += score;
          verifiedMaxScore += Number(item.marks);
          results.push(resultFromRun(item.id, gradingRun, item.marks));
        } else {
          const { data: gradingRun, error: gradingError } = await supabase.from('grading_runs').insert({
            session_item_id: item.id, status: 'feedback_only', method: 'model_assisted', scorer_version: 'feedback-only-boundary-v1', final_score: null,
            uncertainty_reason: 'Score withheld: this response type requires human review against the verified mark scheme.',
          }).select('*').single();
          if (gradingError) throw gradingError;
          results.push(resultFromRun(item.id, gradingRun, item.marks));
        }
      }
      const { error: submitError } = await supabase.from('assessment_sessions').update({ status: 'submitted', submitted_at: submittedAt, updated_at: submittedAt }).eq('id', session.id);
      if (submitError) throw submitError;
      await refreshRecommendations(supabase, user.id, session.subject_id);
      return res.status(200).json({ success: true, submission: { sessionId: session.id, verifiedScore, verifiedMaxScore, verifiedCoverage: verifiedMaxScore > 0 ? 'partial_or_full' : 'none', results } });
    }
    if (action === 'get_session') {
      if (!isUuid(body.sessionId)) return statusError(res, 400, 'INVALID_SESSION', 'Valid session id required.');
      const { data: session, error: sessionError } = await supabase.from('assessment_sessions').select('*').eq('id', body.sessionId).eq('user_id', user.id).maybeSingle();
      if (sessionError) throw sessionError;
      if (!session) return statusError(res, 404, 'SESSION_NOT_FOUND', 'Session not found.');
      const { data: items, error: itemsError } = await supabase.from('assessment_session_items').select('id, ordinal, question_version_snapshot, marks').eq('session_id', session.id).order('ordinal');
      if (itemsError) throw itemsError;
      const itemIds = (items ?? []).map((item) => item.id);
      const [{ data: responses, error: responseError }, { data: gradingRuns, error: gradingError }] = itemIds.length ? await Promise.all([
        supabase.from('assessment_responses').select('*').in('session_item_id', itemIds),
        supabase.from('grading_runs').select('*').in('session_item_id', itemIds),
      ]) : [{ data: [], error: null }, { data: [], error: null }];
      if (responseError) throw responseError;
      if (gradingError) throw gradingError;
      return res.status(200).json({ success: true, session, items: items ?? [], responses: responses ?? [], gradingRuns: gradingRuns ?? [] });
    }
    return statusError(res, 400, 'INVALID_ACTION', 'Unsupported action.');
  });
}
