export const AP_CATEGORIES = ['Arts', 'English', 'History and social sciences', 'Maths and computer science', 'Sciences', 'World languages', 'Capstone', 'Career Kickstart'];
const slug = (value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const text = (value) => typeof value === 'string' && value.trim().length > 0;
const texts = (value, minimum = 1) => Array.isArray(value) && value.length >= minimum && value.every(text);
const uniqueIds = (items) => new Set(items.map((item) => item.id)).size === items.length;

/** Validate public static content before publishing or rendering it. No learner data. */
export function isApCourse(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (!slug(value.slug) || !text(value.title) || !value.title.startsWith('AP ')
    || !AP_CATEGORIES.includes(value.category) || !text(value.summary) || !text(value.frameworkNote)
    || !['exam', 'portfolio', 'research', 'mixed'].includes(value.assessment)
    || typeof value.officialUrl !== 'string'
    || !/^https:\/\/apstudents\.collegeboard\.org\/courses\/ap-[a-z0-9-]+$/.test(value.officialUrl)
    || !Array.isArray(value.modules) || value.modules.length === 0) return false;
  return value.modules.every((unit) => unit && slug(unit.id) && text(unit.title)
    && text(unit.frameworkUnit) && text(unit.focus) && texts(unit.explanation, 2)
    && unit.workedExample && text(unit.workedExample.prompt) && texts(unit.workedExample.steps, 2)
    && unit.misconception && text(unit.misconception.claim) && text(unit.misconception.correction)
    && (unit.objectives === undefined || texts(unit.objectives))
    && (unit.prerequisites === undefined || texts(unit.prerequisites))
    && (unit.reviewCards === undefined || (Array.isArray(unit.reviewCards) && uniqueIds(unit.reviewCards)
      && unit.reviewCards.every((card) => slug(card.id) && text(card.front) && text(card.back))))
    && Array.isArray(unit.questions) && unit.questions.length >= 2
    && unit.questions.every((question) => question && slug(question.id) && text(question.prompt)
      && text(question.hint) && text(question.answer) && texts(question.checkpoints, 2)
      && (question.hints === undefined || texts(question.hints, 2))
      && (question.marks === undefined || (Number.isInteger(question.marks) && question.marks > 0 && question.marks === question.checkpoints.length))
      && (question.difficulty === undefined || ['foundation', 'standard', 'transfer'].includes(question.difficulty))
      && (question.calculatorPolicy === undefined || ['not-required', 'allowed', 'required'].includes(question.calculatorPolicy))
      && (question.numericAnswer === undefined || (Number.isFinite(question.numericAnswer?.value)
        && Number.isFinite(question.numericAnswer?.tolerance) && question.numericAnswer.tolerance >= 0))
      && (question.retryOf === undefined || (question.retryOf !== question.id && unit.questions.some((original) => original.id === question.retryOf))))
    && uniqueIds(unit.questions)) && uniqueIds(value.modules);
}
