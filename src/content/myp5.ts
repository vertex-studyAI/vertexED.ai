export type MypSubject = {
  slug: string;
  name: string;
  group: string;
  accent: string;
  summary: string;
  topics: string[];
  skills: string[];
};

export type MypLearningFrame = {
  keyConcepts: [string, string];
  globalContext: string;
  atlFocus: [string, string];
  framingQuestion: string;
};

export const MYP5_SUBJECTS: MypSubject[] = [
  { slug: 'mathematics', name: 'Mathematics', group: 'Mathematics', accent: '#2359d6', summary: 'Reason with number, structure, space, data and models.', topics: ['Number', 'Algebra', 'Functions', 'Coordinate geometry', 'Geometry', 'Trigonometry', 'Statistics', 'Probability', 'Sequences', 'Patterns', 'Mathematical modelling', 'Financial mathematics', 'Problem solving', 'Mathematical communication', 'Investigation strategies'], skills: ['Knowing and understanding', 'Investigating patterns', 'Communicating', 'Applying mathematics'] },
  { slug: 'physics', name: 'Physics', group: 'Sciences', accent: '#075fbd', summary: 'Explain physical systems and test ideas with measured evidence.', topics: ['Motion', 'Forces', 'Energy', 'Work and power', 'Momentum', 'Waves', 'Light', 'Sound', 'Electricity', 'Magnetism', 'Thermal physics', 'Atomic and nuclear concepts', 'Experimental design', 'Data analysis', 'Uncertainty', 'Graph interpretation'], skills: ['Knowing and understanding', 'Inquiring and designing', 'Processing and evaluating', 'Reflecting on impacts'] },
  { slug: 'chemistry', name: 'Chemistry', group: 'Sciences', accent: '#087d91', summary: 'Connect particles, reactions and evidence from practical work.', topics: ['Atomic structure', 'Periodic trends', 'Bonding', 'Chemical reactions', 'Stoichiometry', 'Acids and bases', 'Energetics', 'Rates', 'Equilibrium foundations', 'Organic chemistry foundations', 'Environmental chemistry', 'Experimental chemistry', 'Data interpretation'], skills: ['Knowing and understanding', 'Inquiring and designing', 'Processing and evaluating', 'Reflecting on impacts'] },
  { slug: 'biology', name: 'Biology', group: 'Sciences', accent: '#14735b', summary: 'Study living systems from cells to ecosystems and evaluate evidence.', topics: ['Cells', 'Genetics', 'Evolution', 'Ecology', 'Human physiology', 'Homeostasis', 'Reproduction', 'Biotechnology', 'Ecosystems', 'Human impact', 'Experimental design', 'Scientific evaluation'], skills: ['Knowing and understanding', 'Inquiring and designing', 'Processing and evaluating', 'Reflecting on impacts'] },
  { slug: 'integrated-sciences', name: 'Integrated Sciences', group: 'Sciences', accent: '#176a83', summary: 'Move across biology, chemistry and physics through shared scientific inquiry.', topics: ['Systems and models', 'Matter and energy', 'Forces and change', 'Living systems', 'Earth and environment', 'Experimental design', 'Data and uncertainty', 'Scientific evaluation'], skills: ['Questioning', 'Designing', 'Analysing', 'Evaluating'] },
  { slug: 'english-language-literature', name: 'English Language & Literature', group: 'Language and Literature', accent: '#7440a3', summary: 'Read authorial choices closely and build precise, supported arguments.', topics: ['Literary analysis', 'Non-literary analysis', 'Persuasive texts', 'Speeches', 'Advertisements', 'Articles', 'Visual texts', 'Poetry', 'Prose', 'Drama', 'Comparative analysis', 'Authorial choices', 'Tone', 'Structure', 'Diction', 'Imagery', 'Symbolism', 'Rhetorical devices', 'Audience, purpose and context', 'Thesis construction', 'Paragraph structure', 'Evidence selection', 'Commentary', 'Timed writing', 'Annotation', 'Unseen analysis'], skills: ['Analysing', 'Organising', 'Producing text', 'Using language'] },
  { slug: 'spanish', name: 'Spanish', group: 'Language Acquisition', accent: '#b14931', summary: 'Build confident communication through themed language and deliberate practice.', topics: ['Identity and relationships', 'Experiences', 'Human ingenuity', 'Social organisation', 'Sharing the planet', 'Present tense', 'Past tenses', 'Future and conditional', 'Speaking interaction', 'Reading comprehension', 'Listening strategies', 'Writing structures', 'Connectors', 'High-frequency verbs', 'Idiomatic language', 'Exam strategies'], skills: ['Listening', 'Reading', 'Speaking', 'Writing'] },
  { slug: 'economics', name: 'Economics', group: 'Individuals and Societies', accent: '#9a5a13', summary: 'Use models and evidence to explain choices, markets and development.', topics: ['Scarcity', 'Opportunity cost', 'Economic systems', 'Supply', 'Demand', 'Elasticity', 'Market failure', 'Government intervention', 'Labour', 'Development', 'Trade', 'Macroeconomic foundations', 'Data response'], skills: ['Knowing and understanding', 'Investigating', 'Communicating', 'Thinking critically'] },
  { slug: 'geography', name: 'Geography', group: 'Individuals and Societies', accent: '#337345', summary: 'Interpret places, systems and change across human and physical geography.', topics: ['Population', 'Migration', 'Development', 'Urbanisation', 'Resources', 'Climate', 'Sustainability', 'Natural hazards', 'Globalisation', 'Data response'], skills: ['Knowing and understanding', 'Investigating', 'Communicating', 'Thinking critically'] },
  { slug: 'history', name: 'History', group: 'Individuals and Societies', accent: '#87502f', summary: 'Interrogate sources and explain causation, change and significance.', topics: ['Source analysis', 'Origin, purpose, value and limitation', 'Causation', 'Consequence', 'Continuity', 'Change', 'Perspectives', 'Significance', 'Essay construction', 'Source-based questions'], skills: ['Knowing and understanding', 'Investigating', 'Communicating', 'Thinking critically'] },
  { slug: 'integrated-humanities', name: 'Integrated Humanities', group: 'Individuals and Societies', accent: '#78622c', summary: 'Combine historical, geographical and economic lenses in one inquiry.', topics: ['Inquiry questions', 'Source analysis', 'Spatial patterns', 'Economic choice', 'Global systems', 'Sustainability', 'Perspectives', 'Extended response'], skills: ['Knowing and understanding', 'Investigating', 'Communicating', 'Thinking critically'] },
  { slug: 'design', name: 'Design', group: 'Design', accent: '#2b6487', summary: 'Document a traceable cycle from a human need to tested improvement.', topics: ['Design cycle', 'Criterion A', 'Criterion B', 'Criterion C', 'Criterion D', 'Problem identification', 'Research', 'Specifications', 'Ideation', 'Prototyping', 'Testing', 'Evaluation', 'Iteration', 'Product documentation'], skills: ['Inquiring and analysing', 'Developing ideas', 'Creating the solution', 'Evaluating'] },
  { slug: 'visual-arts', name: 'Visual Arts', group: 'Arts', accent: '#a23d70', summary: 'Connect research, experimentation and artistic intention in a process journal.', topics: ['Artwork analysis', 'Creative process', 'Contextual research', 'Experimentation', 'Artistic intention', 'Process documentation', 'Reflection', 'Evaluation'], skills: ['Knowing and understanding', 'Developing skills', 'Thinking creatively', 'Responding'] },
  { slug: 'music', name: 'Music', group: 'Arts', accent: '#623e9c', summary: 'Listen, create, perform and reflect with musical vocabulary.', topics: ['Musical analysis', 'Creative process', 'Contextual research', 'Composition', 'Performance', 'Experimentation', 'Artistic intention', 'Reflection'], skills: ['Knowing and understanding', 'Developing skills', 'Thinking creatively', 'Responding'] },
  { slug: 'drama', name: 'Drama / Performing Arts', group: 'Arts', accent: '#9b3d3d', summary: 'Develop performance through research, rehearsal, intention and evaluation.', topics: ['Performance analysis', 'Creative process', 'Contextual research', 'Experimentation', 'Artistic intention', 'Rehearsal documentation', 'Performance', 'Evaluation'], skills: ['Knowing and understanding', 'Developing skills', 'Thinking creatively', 'Responding'] },
  { slug: 'physical-health-education', name: 'Physical & Health Education', group: 'Physical and Health Education', accent: '#137765', summary: 'Plan, perform and reflect using principles of health and movement.', topics: ['Fitness', 'Training principles', 'Physiology', 'Movement', 'Nutrition', 'Wellbeing', 'Strategy', 'Performance analysis', 'Training plans', 'Reflection'], skills: ['Knowing and understanding', 'Planning for performance', 'Applying and performing', 'Reflecting and improving'] },
  { slug: 'personal-project', name: 'Personal Project', group: 'Personal Project', accent: '#184da3', summary: 'Turn a meaningful goal into a documented process and evaluated product.', topics: ['Goal development', 'Global context', 'Learning goal', 'Product goal', 'Success criteria', 'Research planning', 'ATL skills', 'Process documentation', 'Reflection', 'Evaluation'], skills: ['Planning', 'Applying skills', 'Reflecting', 'Reporting'] },
];

export const MYP_GROUPS = [...new Set(MYP5_SUBJECTS.map((subject) => subject.group))];

const MYP_LEARNING_FRAMES: Record<string, MypLearningFrame> = {
  mathematics: { keyConcepts: ['Logic', 'Relationships'], globalContext: 'Scientific and technical innovation', atlFocus: ['Make reasoning visible', 'Test a result against constraints'], framingQuestion: 'How can a representation reveal a relationship and its limits?' },
  physics: { keyConcepts: ['Systems', 'Change'], globalContext: 'Scientific and technical innovation', atlFocus: ['Model a physical system', 'Evaluate measurement uncertainty'], framingQuestion: 'How can a model explain change while remaining accountable to measured evidence?' },
  chemistry: { keyConcepts: ['Relationships', 'Change'], globalContext: 'Globalization and sustainability', atlFocus: ['Move between particle and observable scales', 'Evaluate experimental evidence'], framingQuestion: 'How do particle-level interactions produce observable change?' },
  biology: { keyConcepts: ['Systems', 'Relationships'], globalContext: 'Identities and relationships', atlFocus: ['Connect structure to function', 'Evaluate biological evidence'], framingQuestion: 'How do interacting structures sustain a living system?' },
  'integrated-sciences': { keyConcepts: ['Systems', 'Connections'], globalContext: 'Globalization and sustainability', atlFocus: ['Transfer models across sciences', 'Reconcile evidence at different scales'], framingQuestion: 'What becomes visible when one system is examined through several sciences?' },
  'english-language-literature': { keyConcepts: ['Communication', 'Perspective'], globalContext: 'Personal and cultural expression', atlFocus: ['Select precise textual evidence', 'Qualify an interpretation'], framingQuestion: 'How do choices in language and form position an audience?' },
  spanish: { keyConcepts: ['Communication', 'Culture'], globalContext: 'Identities and relationships', atlFocus: ['Retrieve language in context', 'Monitor and repair meaning'], framingQuestion: 'How does language choice shape identity, relationship and action?' },
  economics: { keyConcepts: ['Systems', 'Global interactions'], globalContext: 'Fairness and development', atlFocus: ['Trace incentives and consequences', 'Evaluate distribution and evidence'], framingQuestion: 'How do choices inside a system distribute costs, benefits and power?' },
  geography: { keyConcepts: ['Systems', 'Time, place and space'], globalContext: 'Globalization and sustainability', atlFocus: ['Interpret spatial evidence', 'Connect processes across scales'], framingQuestion: 'Why does a process create different patterns in different places?' },
  history: { keyConcepts: ['Time, place and space', 'Perspective'], globalContext: 'Orientation in space and time', atlFocus: ['Interrogate provenance', 'Build a qualified causal argument'], framingQuestion: 'How does evidence shape what can be claimed about change over time?' },
  'integrated-humanities': { keyConcepts: ['Connections', 'Perspective'], globalContext: 'Fairness and development', atlFocus: ['Synthesize disciplinary evidence', 'Make uncertainty explicit'], framingQuestion: 'How does combining lenses change an explanation of a shared problem?' },
  design: { keyConcepts: ['Development', 'Systems'], globalContext: 'Scientific and technical innovation', atlFocus: ['Define measurable criteria', 'Iterate from test evidence'], framingQuestion: 'How can evidence turn a human need into a defensible design decision?' },
  'visual-arts': { keyConcepts: ['Aesthetics', 'Communication'], globalContext: 'Personal and cultural expression', atlFocus: ['Document visual inquiry', 'Evaluate choices against intention'], framingQuestion: 'How do material and compositional choices develop meaning?' },
  music: { keyConcepts: ['Aesthetics', 'Communication'], globalContext: 'Personal and cultural expression', atlFocus: ['Locate audible evidence', 'Develop and compare musical ideas'], framingQuestion: 'How do musical relationships create structure and expressive meaning?' },
  drama: { keyConcepts: ['Communication', 'Identity'], globalContext: 'Personal and cultural expression', atlFocus: ['Record exact performance evidence', 'Revise against intention and audience'], framingQuestion: 'How do choices in body, voice, space and design shape an audience response?' },
  'physical-health-education': { keyConcepts: ['Development', 'Relationships'], globalContext: 'Identities and relationships', atlFocus: ['Plan from a baseline', 'Adjust action using wellbeing evidence'], framingQuestion: 'How do deliberate choices connect performance, recovery and wellbeing?' },
  'personal-project': { keyConcepts: ['Development', 'Identity'], globalContext: 'Personal and cultural expression', atlFocus: ['Plan independent inquiry', 'Maintain a traceable evidence record'], framingQuestion: 'How can a personal interest become rigorous, ethical and demonstrable learning?' },
};

export function learningFrameFor(subject: MypSubject): MypLearningFrame {
  const frame = MYP_LEARNING_FRAMES[subject.slug];
  if (!frame) throw new Error(`Missing learning frame for ${subject.slug}`);
  return frame;
}

export function topicSlug(topic: string) {
  return topic.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function findSubject(slug?: string) {
  return MYP5_SUBJECTS.find((subject) => subject.slug === slug);
}

export function findTopic(subject: MypSubject, slug?: string) {
  return subject.topics.find((topic) => topicSlug(topic) === slug) ?? subject.topics[0];
}
