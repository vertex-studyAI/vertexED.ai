const text = (value) => typeof value === 'string' && value.trim().length > 0;
const id = (value) => text(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const texts = (value, minimum = 1) => Array.isArray(value) && value.length >= minimum && value.every(text);
const items = (value, minimum, check) => Array.isArray(value) && value.length >= minimum && value.every(check);
const unique = (value) => new Set(value.map((item) => item.id)).size === value.length;

/** Editorial resource structure. Validation does not establish subject accuracy or approval. */
export function isStudyPack(value) {
  return Boolean(value && value.version === '2026-10-21.1'
    && (value.references === undefined || items(value.references, 1, (reference) => reference && text(reference.title)
      && text(reference.note) && typeof reference.url === 'string' && /^https:\/\/[^\s]+$/.test(reference.url)))
    && items(value.notes, 1, (note) => note && text(note.title) && texts(note.paragraphs))
    && items(value.workedExamples, 1, (example) => example && id(example.id) && text(example.prompt)
      && texts(example.steps, 2) && text(example.conclusion)) && unique(value.workedExamples)
    && items(value.flashcards, 4, (card) => card && id(card.id) && text(card.front) && text(card.back)) && unique(value.flashcards)
    && items(value.diagrams, 1, (diagram) => diagram && id(diagram.id) && text(diagram.title) && text(diagram.description)
      && items(diagram.nodes, 3, (node) => node && id(node.id) && text(node.label) && text(node.detail)) && unique(diagram.nodes)
      && items(diagram.edges, 2, (edge) => edge && text(edge.label) && edge.from !== edge.to
        && diagram.nodes.some((node) => node.id === edge.from) && diagram.nodes.some((node) => node.id === edge.to))
      && diagram.nodes.every((node) => diagram.edges.some((edge) => edge.from === node.id || edge.to === node.id)))
    && unique(value.diagrams));
}

export function isAdditionalMypPractice(value) {
  return items(value, 2, (question) => question && id(question.id) && question.id.startsWith('extension-')
    && ['Standard', 'Advanced', 'Challenge'].includes(question.difficulty)
    && text(question.command) && text(question.prompt) && texts(question.hints, 2)
    && texts(question.solution, 2) && texts(question.successCriteria, 3)
    && Number.isInteger(question.marks) && question.marks === question.successCriteria.length) && unique(value);
}
