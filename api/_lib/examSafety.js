const QUESTION_TYPES = new Set([
  'selected_response',
  'numeric',
  'short_response',
  'structured_response',
  'essay',
  'other',
]);

const REVIEW_STATUSES = new Set(['pending_review', 'verified', 'rejected']);

export function asTrimmedString(value, max = 4000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function asConfidence(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 1 ? number : null;
}

export function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validateSourceInput(input = {}) {
  const title = asTrimmedString(input.title, 300);
  const rightsHolder = asTrimmedString(input.rightsHolder, 300);
  const authorizationBasis = asTrimmedString(input.authorizationBasis, 40);
  const authorizationReference = asTrimmedString(input.authorizationReference, 500);
  const permittedUses = Array.isArray(input.permittedUses)
    ? [...new Set(input.permittedUses.map((item) => asTrimmedString(item, 80)).filter(Boolean))]
    : [];
  const sha256 = asTrimmedString(input.sha256, 128).toLowerCase();
  const sourceUrl = asTrimmedString(input.sourceUrl, 2000);
  const storageKey = asTrimmedString(input.storageKey, 500);

  if (!title || !rightsHolder || !authorizationReference || !permittedUses.length || sha256.length < 32) {
    return { ok: false, error: 'Source title, rights holder, authorization reference, permitted uses, and SHA-256 are required.' };
  }
  if (!['licence', 'written_permission', 'public_domain', 'owned', 'other'].includes(authorizationBasis)) {
    return { ok: false, error: 'Authorization basis is invalid.' };
  }
  if (!sourceUrl && !storageKey) {
    return { ok: false, error: 'Provide a source URL or controlled storage key.' };
  }
  return {
    ok: true,
    value: {
      title,
      rights_holder: rightsHolder,
      authorization_basis: authorizationBasis,
      authorization_reference: authorizationReference,
      permitted_uses: permittedUses,
      territory: asTrimmedString(input.territory, 120) || null,
      rights_expires_at: asTrimmedString(input.rightsExpiresAt, 40) || null,
      source_url: sourceUrl || null,
      storage_key: storageKey || null,
      sha256,
    },
  };
}

export function validateQuestionImport(input = {}) {
  const marks = Number(input.marks);
  const questionType = asTrimmedString(input.questionType, 60);
  const markSchemePoints = Array.isArray(input.markSchemePoints) ? input.markSchemePoints : [];
  const classifications = Array.isArray(input.classifications) ? input.classifications : [];
  const sourceLocator = input.sourceLocator && typeof input.sourceLocator === 'object' ? input.sourceLocator : null;

  if (!isUuid(input.sourceVersionId) || !isUuid(input.subjectId)) {
    return { ok: false, error: 'A valid source version and subject are required.' };
  }
  if (!asTrimmedString(input.externalReference, 160) || !asTrimmedString(input.questionText, 20000)) {
    return { ok: false, error: 'Question reference and text are required.' };
  }
  if (!QUESTION_TYPES.has(questionType) || !Number.isFinite(marks) || marks <= 0 || !sourceLocator) {
    return { ok: false, error: 'Question type, positive marks, and source locator are required.' };
  }
  if (!markSchemePoints.length || !classifications.length) {
    return { ok: false, error: 'Each imported question needs mark-scheme points and at least one curriculum classification.' };
  }

  const points = markSchemePoints.map((point) => ({
    point_code: asTrimmedString(point.code, 100),
    max_marks: Number(point.maxMarks),
    criterion_text: asTrimmedString(point.criterion, 10000),
    acceptable_evidence: Array.isArray(point.acceptableEvidence) ? point.acceptableEvidence : [],
    source_locator: point.sourceLocator && typeof point.sourceLocator === 'object' ? point.sourceLocator : null,
  }));
  const validPoints = points.every((point) => point.point_code && Number.isFinite(point.max_marks) && point.max_marks > 0 && point.criterion_text && point.source_locator);
  const pointTotal = points.reduce((total, point) => total + (Number.isFinite(point.max_marks) ? point.max_marks : 0), 0);
  if (!validPoints || Math.abs(pointTotal - marks) > 0.001) {
    return { ok: false, error: 'Verified mark-scheme points must be valid and add exactly to the question marks.' };
  }

  const classRows = classifications.map((classification) => ({
    curriculum_node_id: classification.curriculumNodeId,
    relation: asTrimmedString(classification.relation, 40),
    method: asTrimmedString(classification.method, 40),
    model_or_rule_version: asTrimmedString(classification.modelOrRuleVersion, 120) || null,
    confidence: asConfidence(classification.confidence),
  }));
  const validClassifications = classRows.every((row) =>
    isUuid(row.curriculum_node_id) &&
    ['primary', 'secondary', 'prerequisite', 'command_term'].includes(row.relation) &&
    ['human', 'rules', 'model_assisted'].includes(row.method),
  );
  if (!validClassifications) {
    return { ok: false, error: 'Every classification needs a curriculum node, supported relation, and method.' };
  }

  return {
    ok: true,
    value: {
      source_version_id: input.sourceVersionId,
      subject_id: input.subjectId,
      external_reference: asTrimmedString(input.externalReference, 160),
      question_text: asTrimmedString(input.questionText, 20000),
      question_payload: input.questionPayload && typeof input.questionPayload === 'object' ? input.questionPayload : {},
      question_type: questionType,
      marks,
      source_locator: sourceLocator,
      parse_confidence: asConfidence(input.parseConfidence),
      difficulty_estimate: asConfidence(input.difficultyEstimate),
      difficulty_method: ['human', 'empirical', 'model_assisted'].includes(input.difficultyMethod) ? input.difficultyMethod : null,
      difficulty_confidence: asConfidence(input.difficultyConfidence),
      points,
      classifications: classRows,
    },
  };
}

export function canVerifyQuestion({ source, sourceVersion, markSchemePoints = [], classifications = [], marks }) {
  if (source?.status !== 'approved') return { ok: false, error: 'The source is not authorized and approved.' };
  if (sourceVersion?.parse_status !== 'verified' || sourceVersion?.review_status !== 'verified') {
    return { ok: false, error: 'The parsed source version has not passed human review.' };
  }
  if (!markSchemePoints.length || markSchemePoints.some((point) => point.review_status !== 'verified')) {
    return { ok: false, error: 'Every mark-scheme point must be human-verified.' };
  }
  if (!classifications.length || classifications.some((item) => item.review_status !== 'verified')) {
    return { ok: false, error: 'Every curriculum classification must be human-verified.' };
  }
  const pointTotal = markSchemePoints.reduce((total, point) => total + Number(point.max_marks || 0), 0);
  if (Math.abs(pointTotal - Number(marks)) > 0.001) {
    return { ok: false, error: 'Verified mark-scheme points do not add to the question marks.' };
  }
  return { ok: true };
}

export function isDeterministicallyScorable(question) {
  return question?.question_type === 'selected_response' && typeof question?.question_payload?.answerKey === 'string';
}

export function deterministicScore(question, responsePayload = {}) {
  if (!isDeterministicallyScorable(question)) return null;
  const answer = asTrimmedString(responsePayload.answer, 1000);
  const answerKey = asTrimmedString(question.question_payload.answerKey, 1000);
  return answer && answer === answerKey ? Number(question.marks) : 0;
}

export function isReviewStatus(value) {
  return REVIEW_STATUSES.has(value);
}
