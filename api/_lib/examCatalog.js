import { canVerifyQuestion } from './examSafety.js';

function tableMissing(error) {
  return error?.code === '42P01' || /does not exist|relation .* does not exist/i.test(String(error?.message || error || ''));
}

export function catalogueUnavailable(error) {
  return tableMissing(error)
    ? { status: 503, code: 'CATALOGUE_NOT_MIGRATED', error: 'The authorized assessment catalogue is not configured yet.' }
    : { status: 503, code: 'CATALOGUE_UNAVAILABLE', error: 'The authorized assessment catalogue is temporarily unavailable.' };
}

export async function getEligibleQuestions(supabase, subjectId) {
  const { data: questions, error: questionError } = await supabase
    .from('assessment_questions')
    .select('id, source_version_id, subject_id, external_reference, question_text, question_payload, question_type, marks, source_locator, review_status, is_active')
    .eq('subject_id', subjectId)
    .eq('review_status', 'verified')
    .eq('is_active', true)
    .order('external_reference');
  if (questionError) throw questionError;
  if (!questions?.length) return [];

  const sourceVersionIds = [...new Set(questions.map((question) => question.source_version_id))];
  const { data: versions, error: versionError } = await supabase
    .from('content_source_versions')
    .select('id, source_id, parse_status, review_status')
    .in('id', sourceVersionIds);
  if (versionError) throw versionError;

  const sourceIds = [...new Set((versions || []).map((version) => version.source_id))];
  const { data: sources, error: sourceError } = await supabase
    .from('content_sources')
    .select('id, status, rights_expires_at')
    .in('id', sourceIds);
  if (sourceError) throw sourceError;

  const versionById = new Map((versions || []).map((version) => [version.id, version]));
  const sourceById = new Map((sources || []).map((source) => [source.id, source]));
  const now = Date.now();

  const eligible = [];
  for (const question of questions) {
    const version = versionById.get(question.source_version_id);
    const source = version ? sourceById.get(version.source_id) : null;
    if (!source || (source.rights_expires_at && new Date(source.rights_expires_at).getTime() < now)) continue;

    const [{ data: points, error: pointError }, { data: classifications, error: classificationError }] = await Promise.all([
      supabase.from('mark_scheme_points').select('id, point_code, max_marks, review_status').eq('question_id', question.id),
      supabase.from('question_classifications').select('id, curriculum_node_id, review_status').eq('question_id', question.id),
    ]);
    if (pointError) throw pointError;
    if (classificationError) throw classificationError;
    const verified = canVerifyQuestion({ source, sourceVersion: version, markSchemePoints: points, classifications, marks: question.marks });
    if (verified.ok) eligible.push({ ...question, markSchemePoints: points, classifications });
  }
  return eligible;
}

export async function findSupportedSubject(supabase, { board, subject }) {
  if (!board || !subject) return null;
  const { data: curricula, error: curriculumError } = await supabase
    .from('curriculum_versions')
    .select('id, board, specification_code, version_label, title, level, language')
    .eq('board', board)
    .eq('status', 'published');
  if (curriculumError) throw curriculumError;
  if (!curricula?.length) return null;

  const curriculumIds = curricula.map((curriculum) => curriculum.id);
  const { data: subjects, error: subjectError } = await supabase
    .from('curriculum_subjects')
    .select('id, curriculum_version_id, code, title, component_code, tier')
    .in('curriculum_version_id', curriculumIds)
    .eq('title', subject)
    .eq('status', 'published');
  if (subjectError) throw subjectError;
  const matched = subjects?.[0];
  if (!matched) return null;
  return {
    ...matched,
    curriculum: curricula.find((curriculum) => curriculum.id === matched.curriculum_version_id) || null,
  };
}

export async function getCatalogueAvailability(supabase, selection) {
  const subject = await findSupportedSubject(supabase, selection);
  if (!subject) {
    return {
      available: false,
      subject: null,
      questionCount: 0,
      message: 'No published, authorized curriculum component matches this selection.',
    };
  }
  const questions = await getEligibleQuestions(supabase, subject.id);
  return {
    available: questions.length > 0,
    subject,
    questionCount: questions.length,
    message: questions.length
      ? `${questions.length} verified questions are available.`
      : 'This component is configured, but no verified, authorized questions are available yet.',
  };
}
