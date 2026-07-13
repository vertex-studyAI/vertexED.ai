import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { requireAdmin } from '../_lib/admin.js';
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js';
import { catalogueUnavailable } from '../_lib/examCatalog.js';
import {
  asConfidence,
  asTrimmedString,
  canVerifyQuestion,
  isReviewStatus,
  isUuid,
  validateQuestionImport,
  validateSourceInput,
} from '../_lib/examSafety.js';

function badRequest(res, error) {
  return res.status(400).json({ success: false, error });
}

async function audit(supabase, userId, action, entityType, entityId, payload = {}) {
  try {
    await supabase.from('content_admin_audit_log').insert({
      actor_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      after_data: payload,
    });
  } catch (error) {
    console.warn('exam-admin audit failed:', error);
  }
}

async function tableSafe(action, res) {
  try {
    return await action();
  } catch (error) {
    const unavailable = catalogueUnavailable(error);
    return res.status(unavailable.status).json({ success: false, ...unavailable });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!requireAdmin(user, res)) return;
  if (rejectOversizedJsonBody(req, res, 512_000)) return;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return res.status(503).json({ success: false, error: 'Database not configured.' });
  }

  const body = readJsonBody(req);
  const action = asTrimmedString(body.action, 80);

  return tableSafe(async () => {
    if (action === 'catalogue_status') {
      const [{ count: sourceCount }, { count: questionCount }, { count: pendingCount }] = await Promise.all([
        supabase.from('content_sources').select('*', { head: true, count: 'exact' }),
        supabase.from('assessment_questions').select('*', { head: true, count: 'exact' }).eq('is_active', true),
        supabase.from('assessment_questions').select('*', { head: true, count: 'exact' }).eq('review_status', 'pending_review'),
      ]);
      return res.status(200).json({
        success: true,
        status: {
          sourceCount: sourceCount ?? 0,
          activeQuestionCount: questionCount ?? 0,
          pendingQuestionCount: pendingCount ?? 0,
        },
      });
    }

    if (action === 'create_curriculum') {
      const row = {
        board: asTrimmedString(body.board, 80),
        specification_code: asTrimmedString(body.specificationCode, 120),
        version_label: asTrimmedString(body.versionLabel, 120),
        title: asTrimmedString(body.title, 300),
        level: asTrimmedString(body.level, 120) || null,
        language: asTrimmedString(body.language, 40) || null,
        official_source_url: asTrimmedString(body.sourceUrl, 2000) || null,
        status: 'draft',
      };
      if (!row.board || !row.specification_code || !row.version_label || !row.title) {
        return badRequest(res, 'Board, specification code, version label, and title are required.');
      }
      const { data, error } = await supabase.from('curriculum_versions').insert(row).select('*').single();
      if (error) throw error;
      await audit(supabase, user.id, 'create_curriculum', 'curriculum_version', data.id, row);
      return res.status(201).json({ success: true, curriculum: data });
    }

    if (action === 'create_subject') {
      const row = {
        curriculum_version_id: body.curriculumVersionId,
        code: asTrimmedString(body.code, 120),
        title: asTrimmedString(body.title, 300),
        component_code: asTrimmedString(body.componentCode, 120) || null,
        tier: asTrimmedString(body.tier, 120) || null,
        status: 'draft',
      };
      if (!isUuid(row.curriculum_version_id) || !row.code || !row.title) {
        return badRequest(res, 'Valid curriculum version, subject code, and title are required.');
      }
      const { data, error } = await supabase.from('curriculum_subjects').insert(row).select('*').single();
      if (error) throw error;
      await audit(supabase, user.id, 'create_subject', 'curriculum_subject', data.id, row);
      return res.status(201).json({ success: true, subject: data });
    }

    if (action === 'create_node') {
      const row = {
        subject_id: body.subjectId,
        code: asTrimmedString(body.code, 120),
        node_type: asTrimmedString(body.nodeType, 80),
        title: asTrimmedString(body.title, 300),
        description: asTrimmedString(body.description, 4000) || null,
        official_locator: body.officialLocator && typeof body.officialLocator === 'object' ? body.officialLocator : {},
        review_status: 'pending_review',
      };
      if (!isUuid(row.subject_id) || !row.code || !row.title || !['topic', 'skill', 'command_term', 'concept', 'assessment_objective'].includes(row.node_type)) {
        return badRequest(res, 'Valid subject, code, title, and node type are required.');
      }
      const { data, error } = await supabase.from('curriculum_nodes').insert(row).select('*').single();
      if (error) throw error;
      await audit(supabase, user.id, 'create_node', 'curriculum_node', data.id, row);
      return res.status(201).json({ success: true, node: data });
    }

    if (action === 'create_prerequisite') {
      const row = {
        prerequisite_node_id: body.prerequisiteNodeId,
        dependent_node_id: body.dependentNodeId,
        relation: asTrimmedString(body.relation, 40) || 'requires',
        source_locator: body.sourceLocator && typeof body.sourceLocator === 'object' ? body.sourceLocator : {},
        review_status: 'pending_review',
      };
      if (!isUuid(row.prerequisite_node_id) || !isUuid(row.dependent_node_id) || row.prerequisite_node_id === row.dependent_node_id || !['requires', 'supports'].includes(row.relation)) {
        return badRequest(res, 'Valid distinct prerequisite and dependent nodes are required.');
      }
      const { data, error } = await supabase.from('concept_prerequisites').insert(row).select('*').single();
      if (error) throw error;
      await audit(supabase, user.id, 'create_prerequisite', 'concept_prerequisite', null, row);
      return res.status(201).json({ success: true, prerequisite: data });
    }

    if (action === 'ingest_source') {
      const parsed = validateSourceInput(body.source);
      if (!parsed.ok) return badRequest(res, parsed.error);
      const { data, error } = await supabase
        .from('content_sources')
        .insert({
          ...parsed.value,
          status: 'pending_review',
        })
        .select('*')
        .single();
      if (error) throw error;
      await audit(supabase, user.id, 'ingest_source', 'content_source', data.id, parsed.value);
      return res.status(201).json({ success: true, source: data });
    }

    if (action === 'create_source_version') {
      const row = {
        source_id: body.sourceId,
        version_label: asTrimmedString(body.versionLabel, 120),
        exam_series: asTrimmedString(body.examSeries, 120) || null,
        component_code: asTrimmedString(body.componentCode, 120) || null,
        language: asTrimmedString(body.language, 40) || 'en',
        page_count: Number.isInteger(Number(body.pageCount)) && Number(body.pageCount) > 0 ? Number(body.pageCount) : null,
        parser_name: asTrimmedString(body.parserName, 120) || null,
        parser_version: asTrimmedString(body.parserVersion, 120) || null,
        parse_confidence: asConfidence(body.parseConfidence),
        parse_status: 'pending_review',
        review_status: 'pending_review',
      };
      if (!isUuid(row.source_id) || !row.version_label) {
        return badRequest(res, 'Valid source id and version label are required.');
      }
      const { data, error } = await supabase.from('content_source_versions').insert(row).select('*').single();
      if (error) throw error;
      await audit(supabase, user.id, 'create_source_version', 'content_source_version', data.id, row);
      return res.status(201).json({ success: true, sourceVersion: data });
    }

    if (action === 'import_question') {
      const parsed = validateQuestionImport(body.question);
      if (!parsed.ok) return badRequest(res, parsed.error);
      const { value } = parsed;
      const { points, classifications, ...questionRow } = value;
      const { data: question, error: questionError } = await supabase
        .from('assessment_questions')
        .insert({
          ...questionRow,
          review_status: 'pending_review',
          is_active: false,
        })
        .select('*')
        .single();
      if (questionError) throw questionError;

      const pointRows = points.map((point) => ({
        question_id: question.id,
        ...point,
        review_status: 'pending_review',
      }));
      const classificationRows = classifications.map((classification) => ({
        question_id: question.id,
        ...classification,
        review_status: 'pending_review',
      }));

      const [{ data: insertedPoints, error: pointError }, { data: insertedClassifications, error: classError }] =
        await Promise.all([
          supabase.from('mark_scheme_points').insert(pointRows).select('*'),
          supabase.from('question_classifications').insert(classificationRows).select('*'),
        ]);
      if (pointError) throw pointError;
      if (classError) throw classError;

      await audit(supabase, user.id, 'import_question', 'assessment_question', question.id, {
        question: questionRow,
        pointCount: pointRows.length,
        classificationCount: classificationRows.length,
      });
      return res.status(201).json({
        success: true,
        question,
        markSchemePoints: insertedPoints ?? [],
        classifications: insertedClassifications ?? [],
      });
    }

    if (action === 'set_review_status') {
      const entityType = asTrimmedString(body.entityType, 80);
      const entityId = body.entityId;
      const reviewStatus = asTrimmedString(body.reviewStatus, 80);
      if (!isReviewStatus(reviewStatus)) {
        return badRequest(res, 'Valid entity id and review status are required.');
      }

      if (entityType === 'prerequisite') {
        if (!isUuid(body.prerequisiteNodeId) || !isUuid(body.dependentNodeId)) {
          return badRequest(res, 'Valid prerequisite and dependent node ids are required.');
        }
        const { data, error } = await supabase.from('concept_prerequisites')
          .update({ review_status: reviewStatus })
          .eq('prerequisite_node_id', body.prerequisiteNodeId)
          .eq('dependent_node_id', body.dependentNodeId)
          .select('*')
          .single();
        if (error) throw error;
        await audit(supabase, user.id, 'set_review_status', entityType, null, { review_status: reviewStatus, ...body });
        return res.status(200).json({ success: true, entity: data });
      }
      if (!isUuid(entityId)) return badRequest(res, 'Valid entity id and review status are required.');

      const updates =
        entityType === 'source'
          ? {
              status:
                reviewStatus === 'verified'
                  ? 'approved'
                  : reviewStatus === 'rejected'
                    ? 'rejected'
                    : 'pending_review',
            }
            : entityType === 'source_version'
            ? {
                review_status: reviewStatus,
                parse_status: reviewStatus === 'verified' ? 'verified' : reviewStatus,
              }
            : entityType === 'node'
              ? { review_status: reviewStatus }
              : entityType === 'prerequisite'
                ? { review_status: reviewStatus }
                : { review_status: reviewStatus };

      const table =
        entityType === 'source'
          ? 'content_sources'
          : entityType === 'source_version'
            ? 'content_source_versions'
            : entityType === 'question'
              ? 'assessment_questions'
              : entityType === 'mark_scheme_point'
                ? 'mark_scheme_points'
              : entityType === 'classification'
                ? 'question_classifications'
                : entityType === 'node'
                  ? 'curriculum_nodes'
                  : null;
      if (!table) return badRequest(res, 'Unsupported entity type.');

      const { data, error } = await supabase.from(table).update(updates).eq('id', entityId).select('*').single();
      if (error) throw error;
      await audit(supabase, user.id, 'set_review_status', entityType, entityId, updates);
      return res.status(200).json({ success: true, entity: data });
    }

    if (action === 'set_publication_status') {
      const entityType = asTrimmedString(body.entityType, 80);
      const entityId = body.entityId;
      const status = asTrimmedString(body.status, 40);
      const table = entityType === 'curriculum' ? 'curriculum_versions' : entityType === 'subject' ? 'curriculum_subjects' : null;
      if (!table || !isUuid(entityId) || !['draft', 'published', 'retired'].includes(status)) {
        return badRequest(res, 'Valid curriculum or subject id and publication status are required.');
      }
      const { data, error } = await supabase.from(table).update({ status, updated_at: new Date().toISOString() }).eq('id', entityId).select('*').single();
      if (error) throw error;
      await audit(supabase, user.id, 'set_publication_status', entityType, entityId, { status });
      return res.status(200).json({ success: true, entity: data });
    }

    if (action === 'verify_question') {
      const questionId = body.questionId;
      const activate = body.activate !== false;
      if (!isUuid(questionId)) return badRequest(res, 'Valid question id required.');

      const { data: question, error: questionError } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('id', questionId)
        .single();
      if (questionError) throw questionError;

      const [{ data: version }, { data: points }, { data: classifications }] = await Promise.all([
        supabase.from('content_source_versions').select('*').eq('id', question.source_version_id).single(),
        supabase.from('mark_scheme_points').select('*').eq('question_id', questionId),
        supabase.from('question_classifications').select('*').eq('question_id', questionId),
      ]);
      const { data: source } = await supabase.from('content_sources').select('*').eq('id', version?.source_id).single();
      const verdict = canVerifyQuestion({
        source,
        sourceVersion: version,
        markSchemePoints: points ?? [],
        classifications: classifications ?? [],
        marks: question.marks,
      });
      if (!verdict.ok) {
        return res.status(409).json({ success: false, code: 'QUESTION_NOT_VERIFIABLE', error: verdict.error });
      }

      const { data, error } = await supabase
        .from('assessment_questions')
        .update({
          review_status: 'verified',
          is_active: activate,
        })
        .eq('id', questionId)
        .select('*')
        .single();
      if (error) throw error;
      await audit(supabase, user.id, 'verify_question', 'assessment_question', questionId, { activate });
      return res.status(200).json({ success: true, question: data });
    }

    if (action === 'list_catalogue') {
      const limit = Math.max(1, Math.min(Number(body.limit) || 100, 250));
      const [curricula, subjects, nodes, sources, versions, questions, points, classifications, prerequisites] = await Promise.all([
        supabase.from('curriculum_versions').select('*').order('created_at', { ascending: false }).limit(limit),
        supabase.from('curriculum_subjects').select('*').order('created_at', { ascending: false }).limit(limit),
        supabase.from('curriculum_nodes').select('*').order('created_at', { ascending: false }).limit(limit),
        supabase.from('content_sources').select('*').order('created_at', { ascending: false }).limit(limit),
        supabase.from('content_source_versions').select('*').order('created_at', { ascending: false }).limit(limit),
        supabase.from('assessment_questions').select('*').order('created_at', { ascending: false }).limit(limit),
        supabase.from('mark_scheme_points').select('*').order('created_at', { ascending: false }).limit(limit),
        supabase.from('question_classifications').select('*').order('created_at', { ascending: false }).limit(limit),
        supabase.from('concept_prerequisites').select('*').order('created_at', { ascending: false }).limit(limit),
      ]);
      const result = [curricula, subjects, nodes, sources, versions, questions, points, classifications, prerequisites].find((entry) => entry.error);
      if (result?.error) throw result.error;
      return res.status(200).json({
        success: true,
        catalogue: {
          curricula: curricula.data ?? [], subjects: subjects.data ?? [], nodes: nodes.data ?? [], sources: sources.data ?? [],
          sourceVersions: versions.data ?? [], questions: questions.data ?? [], markSchemePoints: points.data ?? [],
          classifications: classifications.data ?? [], prerequisites: prerequisites.data ?? [],
        },
      });
    }

    return badRequest(res, 'Unsupported action.');
  }, res);
}
