export type MypContentSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  use: 'programme-structure' | 'concept-reference';
  note: string;
};

export type MypPracticeQuestion = {
  id: string;
  difficulty: 'Foundation' | 'Standard' | 'Advanced' | 'Challenge';
  command: string;
  marks: number;
  prompt: string;
  hints: string[];
  solution: string[];
  successCriteria: string[];
};

export type MypLesson = {
  id: string;
  subjectSlug: string;
  topic: string;
  summary: string;
  objectives: string[];
  keyIdeas: string[];
  definitions: Array<{ term: string; meaning: string }>;
  method: string[];
  workedExample: { prompt: string; steps: string[]; conclusion: string };
  misconceptions: Array<{ mistake: string; correction: string }>;
  practice: MypPracticeQuestion[];
  checklist: string[];
  sourceIds: string[];
  contentStatus: 'original-editorial-draft';
  curriculumVersion: 'vertexed-myp5-2026.1';
};

import { MYP5_LESSON_EXPANSION } from './myp5LessonExpansion';

export const MYP_CONTENT_SOURCES: MypContentSource[] = [
  {
    id: 'ib-myp-programme',
    title: 'Middle Years Programme',
    publisher: 'International Baccalaureate',
    url: 'https://ibo.org/programmes/middle-years-programme/',
    use: 'programme-structure',
    note: 'Programme and subject-group structure reference. No protected course material is reproduced.',
  },
  {
    id: 'ib-myp-assessment',
    title: 'MYP assessment and exams',
    publisher: 'International Baccalaureate',
    url: 'https://ibo.org/programmes/middle-years-programme/assessment-and-exams/',
    use: 'programme-structure',
    note: 'Assessment-format reference. Practice tasks in VertexED are independently written.',
  },
  {
    id: 'openstax-algebra-trigonometry',
    title: 'Algebra and Trigonometry',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/algebra-and-trigonometry/pages/preface',
    use: 'concept-reference',
    note: 'Scope and sequence reference only. VertexED prose and exercises are original.',
  },
  {
    id: 'openstax-biology',
    title: 'Biology 2e',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/biology-2e/pages/1-introduction',
    use: 'concept-reference',
    note: 'Concept reference only. VertexED prose and exercises are original.',
  },
  {
    id: 'openstax-chemistry',
    title: 'Chemistry 2e',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/chemistry-2e/pages/1-introduction',
    use: 'concept-reference',
    note: 'Concept reference only. VertexED prose and exercises are original.',
  },
  {
    id: 'openstax-physics',
    title: 'Physics',
    publisher: 'OpenStax, Rice University',
    url: 'https://openstax.org/books/physics/pages/1-introduction-to-science-and-the-realm-of-physics-physical-quantities-and-units',
    use: 'concept-reference',
    note: 'Concept reference only. VertexED prose and exercises are original.',
  },
  {
    id: 'loc-primary-sources',
    title: 'Getting Started with Primary Sources',
    publisher: 'Library of Congress',
    url: 'https://www.loc.gov/programs/teachers/getting-started-with-primary-sources/',
    use: 'concept-reference',
    note: 'Source-analysis process reference. VertexED examples are original.',
  },
];

const common = {
  contentStatus: 'original-editorial-draft' as const,
  curriculumVersion: 'vertexed-myp5-2026.1' as const,
};

function lesson(value: Omit<MypLesson, keyof typeof common>): MypLesson {
  return { ...value, ...common };
}

function practice(
  id: string,
  difficulty: MypPracticeQuestion['difficulty'],
  command: string,
  marks: number,
  prompt: string,
  hints: string[],
  solution: string[],
  successCriteria: string[],
): MypPracticeQuestion {
  return { id, difficulty, command, marks, prompt, hints, solution, successCriteria };
}

export const MYP5_LESSONS: MypLesson[] = [
  lesson({
    id: 'myp5-mathematics-number', subjectSlug: 'mathematics', topic: 'Number',
    summary: 'Use proportional, percentage and standard-form reasoning while keeping units and scale visible.',
    objectives: ['Move between fractions, decimals and percentages.', 'Use ratio and proportional reasoning.', 'Estimate to test whether a result is reasonable.'],
    keyIdeas: ['A percentage is a multiplicative comparison to 100.', 'Equivalent ratios preserve the same multiplicative relationship.', 'An estimate is a check, not a replacement for exact working.'],
    definitions: [{ term: 'Multiplier', meaning: 'The factor used to represent a percentage change, such as 1.08 for an 8% increase.' }, { term: 'Standard form', meaning: 'A number written as a × 10^n where 1 ≤ |a| < 10.' }, { term: 'Relative error', meaning: 'Absolute error divided by the accepted or reference value.' }],
    method: ['Translate the wording into an operation or multiplier.', 'Keep the original quantity and units visible.', 'Calculate without premature rounding.', 'Estimate independently and compare.'],
    workedExample: { prompt: 'A jacket priced at €72 is reduced by 15%, then taxed by 8%. Find the final price.', steps: ['Reduction multiplier: 1 - 0.15 = 0.85.', 'Tax multiplier: 1 + 0.08 = 1.08.', '72 × 0.85 × 1.08 = 66.096.'], conclusion: 'The final price is €66.10 to the nearest cent. Subtracting 15 and adding 8 would be invalid because both changes are percentages, not fixed amounts.' },
    misconceptions: [{ mistake: 'Adding percentage changes as if they act on the same base.', correction: 'Apply each multiplier in sequence because the second percentage acts on the changed value.' }, { mistake: 'Writing 4.2 × 10^5 as 42 × 10^4 and calling it standard form.', correction: 'The leading factor must have magnitude from 1 up to, but not including, 10.' }],
    practice: [practice('num-1', 'Foundation', 'Calculate', 3, 'Increase 240 by 12%.', ['Convert 12% to 0.12.', 'An increase uses a multiplier greater than 1.'], ['Multiplier = 1.12.', '240 × 1.12 = 268.8.'], ['Correct multiplier', 'Accurate calculation', 'Clear final value']), practice('num-2', 'Standard', 'Determine', 5, 'A map scale is 1:50,000. Two points are 7.4 cm apart. Determine the real distance in kilometres.', ['Multiply the map distance by 50,000.', 'Convert centimetres to kilometres.'], ['7.4 × 50,000 = 370,000 cm.', '370,000 cm = 3.7 km.'], ['Uses the scale', 'Correct unit conversion', 'States 3.7 km']), practice('num-3', 'Advanced', 'Evaluate', 6, 'A student claims that two successive 10% decreases produce a 20% decrease. Evaluate the claim.', ['Test with a convenient starting value.', 'Compare the final value with the original.'], ['Start with 100.', 'After two decreases: 100 × 0.9 × 0.9 = 81.', 'The total decrease is 19%, so the claim is false.'], ['Valid counterexample', 'Multiplicative reasoning', 'Supported judgement'])],
    checklist: ['I can choose and justify a percentage multiplier.', 'I can convert ratios into usable quantities.', 'I keep units through every step.', 'I use estimation to detect implausible answers.'],
    sourceIds: ['ib-myp-programme', 'openstax-algebra-trigonometry'],
  }),
  lesson({
    id: 'myp5-mathematics-algebra', subjectSlug: 'mathematics', topic: 'Algebra',
    summary: 'Represent relationships with expressions and equations, then preserve equality while transforming them.',
    objectives: ['Simplify expressions accurately.', 'Solve linear and quadratic equations.', 'Interpret algebraic solutions in context.'],
    keyIdeas: ['An equation states that two expressions have equal value.', 'Inverse operations preserve equality when applied to both sides.', 'A solution must satisfy the original equation.'],
    definitions: [{ term: 'Coefficient', meaning: 'A numerical factor multiplying a variable.' }, { term: 'Root', meaning: 'A value that makes an equation or function equal to zero.' }, { term: 'Factor', meaning: 'An expression multiplied by another expression to form a product.' }],
    method: ['Simplify each side before moving terms.', 'Apply the same inverse operation to both sides.', 'Record restrictions introduced by denominators or roots.', 'Substitute the result into the original equation.'],
    workedExample: { prompt: 'Solve 3(2x - 5) = 4x + 7.', steps: ['Expand: 6x - 15 = 4x + 7.', 'Subtract 4x: 2x - 15 = 7.', 'Add 15 and divide by 2: x = 11.'], conclusion: 'Checking gives 3(22 - 5) = 51 and 44 + 7 = 51, so x = 11 is valid.' },
    misconceptions: [{ mistake: 'Changing a sign when moving a term without naming the operation.', correction: 'Describe the same addition or subtraction on both sides.' }, { mistake: 'Cancelling terms across addition.', correction: 'Cancellation applies to common factors, not separate added terms.' }],
    practice: [practice('alg-1', 'Foundation', 'Solve', 3, 'Solve 5x - 9 = 26.', ['Add 9 first.'], ['5x = 35.', 'x = 7.'], ['Balanced operations', 'Correct solution']), practice('alg-2', 'Standard', 'Factorise', 4, 'Factorise x² - 7x + 12.', ['Find two numbers with product 12 and sum -7.'], ['The numbers are -3 and -4.', 'x² - 7x + 12 = (x - 3)(x - 4).'], ['Correct factor pair', 'Complete factorisation']), practice('alg-3', 'Challenge', 'Justify', 7, 'The equation (x - 2)/(x + 1) = 3 has one solution. Find it and justify any excluded value.', ['State when the denominator is zero.', 'Clear the denominator only after stating the restriction.'], ['Restriction: x ≠ -1.', 'x - 2 = 3x + 3.', '-5 = 2x, so x = -2.5.', 'The solution does not violate the restriction.'], ['Restriction stated', 'Valid transformation', 'Checked conclusion'])],
    checklist: ['I preserve equality at each step.', 'I distinguish terms from factors.', 'I state excluded values.', 'I check solutions in the original equation.'],
    sourceIds: ['openstax-algebra-trigonometry'],
  }),
  lesson({
    id: 'myp5-mathematics-functions', subjectSlug: 'mathematics', topic: 'Functions',
    summary: 'Treat a function as a rule that assigns one output to each permitted input.',
    objectives: ['Use function notation.', 'Connect symbolic, tabular and graphical representations.', 'Interpret rate of change and intercepts.'],
    keyIdeas: ['The domain is the permitted input set.', 'A graph represents all ordered pairs satisfying the rule.', 'For a linear function, slope is change in output divided by change in input.'],
    definitions: [{ term: 'Domain', meaning: 'The set of permitted input values.' }, { term: 'Range', meaning: 'The set of resulting output values.' }, { term: 'Intercept', meaning: 'The coordinate at which a graph crosses an axis.' }],
    method: ['Identify input and output quantities.', 'State the rule and any domain restriction.', 'Calculate key points or features.', 'Interpret those features in context.'],
    workedExample: { prompt: 'For f(x) = 3x - 4, find f(5) and the input when f(x) = 17.', steps: ['Substitute x = 5: f(5) = 15 - 4 = 11.', 'Set 3x - 4 = 17.', 'Solve 3x = 21, so x = 7.'], conclusion: 'The function sends input 5 to output 11, and output 17 comes from input 7.' },
    misconceptions: [{ mistake: 'Reading f(x) as f multiplied by x.', correction: 'Function notation names the output produced by input x.' }, { mistake: 'Using vertical change divided by horizontal change inconsistently.', correction: 'Choose two points and use the same order in numerator and denominator.' }],
    practice: [practice('fun-1', 'Foundation', 'Calculate', 3, 'For g(x) = x² + 2, calculate g(-3).', ['Square the whole input.'], ['g(-3) = (-3)² + 2 = 11.'], ['Correct substitution', 'Correct order of operations']), practice('fun-2', 'Standard', 'Determine', 5, 'A line passes through (2, 5) and (8, 17). Determine its equation.', ['Find the slope first.', 'Use y = mx + c.'], ['m = (17 - 5)/(8 - 2) = 2.', '5 = 2(2) + c, so c = 1.', 'The equation is y = 2x + 1.'], ['Correct slope', 'Correct intercept', 'Equation stated']), practice('fun-3', 'Advanced', 'Interpret', 6, 'A taxi cost is C(d) = 2.4d + 3.5 for distance d kilometres. Interpret both constants and state a sensible domain.', ['Separate rate from starting value.'], ['2.4 is the cost per kilometre.', '3.5 is the fixed starting charge.', 'A sensible domain is d ≥ 0, with any upper bound set by the journey context.'], ['Both parameters interpreted', 'Units included', 'Domain justified'])],
    checklist: ['I use brackets when substituting negative values.', 'I connect equations, tables and graphs.', 'I interpret slope with units.', 'I state meaningful domains.'],
    sourceIds: ['openstax-algebra-trigonometry'],
  }),
  lesson({
    id: 'myp5-physics-motion', subjectSlug: 'physics', topic: 'Motion',
    summary: 'Describe how position changes with time and distinguish scalar speed from vector velocity.',
    objectives: ['Calculate speed, velocity and acceleration.', 'Interpret motion graphs.', 'Connect gradient and area to physical quantities.'],
    keyIdeas: ['Average speed is total distance divided by total time.', 'Velocity includes direction.', 'Acceleration measures the rate of change of velocity.'],
    definitions: [{ term: 'Displacement', meaning: 'Change in position in a stated direction.' }, { term: 'Velocity', meaning: 'Rate of change of displacement.' }, { term: 'Acceleration', meaning: 'Rate of change of velocity.' }],
    method: ['List known values with SI units.', 'Choose a relationship that contains the unknown.', 'Rearrange before substituting.', 'Check sign, direction and scale.'],
    workedExample: { prompt: 'A cyclist increases velocity from 4 m/s to 10 m/s in 3 s. Find the average acceleration.', steps: ['Change in velocity = 10 - 4 = 6 m/s.', 'Acceleration = change in velocity ÷ time.', 'a = 6 ÷ 3 = 2 m/s².'], conclusion: 'The positive acceleration is 2 m/s² in the cyclist’s chosen positive direction.' },
    misconceptions: [{ mistake: 'Calling every horizontal graph segment stationary.', correction: 'A horizontal position-time segment means stationary; a horizontal velocity-time segment means constant velocity.' }, { mistake: 'Ignoring direction when calculating velocity change.', correction: 'Choose a positive direction and use signed velocities.' }],
    practice: [practice('mot-1', 'Foundation', 'Calculate', 3, 'A runner covers 600 m in 150 s. Calculate average speed.', ['Use distance ÷ time.'], ['600 ÷ 150 = 4 m/s.'], ['Formula', 'Substitution', 'Unit']), practice('mot-2', 'Standard', 'Analyse', 5, 'A velocity-time graph rises uniformly from 0 to 12 m/s in 6 s. Determine acceleration and distance travelled.', ['Gradient gives acceleration.', 'Area under the graph gives displacement.'], ['Acceleration = 12/6 = 2 m/s².', 'Distance = ½ × 6 × 12 = 36 m.'], ['Uses gradient', 'Uses triangular area', 'Correct units']), practice('mot-3', 'Challenge', 'Evaluate', 6, 'A GPS gives positions every 10 s. Evaluate whether it can reveal a runner’s maximum instantaneous speed.', ['Distinguish interval average from instantaneous value.'], ['Each calculated speed is an average across 10 s.', 'A short burst between samples may be hidden.', 'More frequent or continuous measurement would improve the estimate.'], ['Identifies sampling limitation', 'Explains consequence', 'Specific improvement'])],
    checklist: ['I distinguish distance from displacement.', 'I use signed velocity consistently.', 'I interpret graph gradient and area.', 'I include units in every calculated result.'],
    sourceIds: ['openstax-physics'],
  }),
  lesson({
    id: 'myp5-chemistry-atomic-structure', subjectSlug: 'chemistry', topic: 'Atomic structure',
    summary: 'Use particle structure and electron arrangement to explain isotopes, ions and periodic behaviour.',
    objectives: ['Relate atomic and mass numbers to particles.', 'Represent ions and isotopes.', 'Use electron arrangement to explain chemical behaviour.'],
    keyIdeas: ['Atomic number equals proton number.', 'Isotopes share proton number but differ in neutron number.', 'Ions form when electrons are gained or lost.'],
    definitions: [{ term: 'Isotope', meaning: 'Atoms of one element with the same proton number but different neutron numbers.' }, { term: 'Ion', meaning: 'A charged particle formed when electrons are gained or lost.' }, { term: 'Mass number', meaning: 'The total number of protons and neutrons in a nucleus.' }],
    method: ['Read atomic and mass numbers carefully.', 'Calculate neutrons as mass number minus atomic number.', 'Adjust electron count using the ion charge.', 'Link outer electrons to likely chemical behaviour.'],
    workedExample: { prompt: 'Describe the particles in a magnesium-24 ion, Mg²⁺, atomic number 12.', steps: ['Protons = 12.', 'Neutrons = 24 - 12 = 12.', 'A 2+ ion has lost two electrons, so electrons = 10.'], conclusion: 'Mg²⁺ contains 12 protons, 12 neutrons and 10 electrons.' },
    misconceptions: [{ mistake: 'Changing proton number when an ion forms.', correction: 'Chemical ion formation changes electrons; changing protons changes the element.' }, { mistake: 'Treating relative atomic mass as the mass number of every atom.', correction: 'Relative atomic mass is a weighted mean across naturally occurring isotopes.' }],
    practice: [practice('atom-1', 'Foundation', 'Determine', 3, 'An atom has atomic number 17 and mass number 35. Determine its protons, neutrons and electrons.', ['A neutral atom has equal protons and electrons.'], ['17 protons, 18 neutrons and 17 electrons.'], ['All three counts correct']), practice('atom-2', 'Standard', 'Explain', 5, 'Explain why chlorine-35 and chlorine-37 have similar chemical behaviour.', ['Focus on electrons, not neutrons.'], ['Both isotopes have atomic number 17.', 'Neutral atoms therefore have the same electron arrangement.', 'Chemical reactions depend mainly on outer electrons, so their behaviour is similar.'], ['Identifies same proton number', 'Connects electron arrangement', 'Explains behaviour']), practice('atom-3', 'Advanced', 'Calculate', 6, 'A sample contains 75% isotope X-10 and 25% isotope X-11. Calculate the relative atomic mass.', ['Use a weighted mean.'], ['(0.75 × 10) + (0.25 × 11) = 10.25.'], ['Correct weighting', 'Accurate result', 'No inappropriate unit'])],
    checklist: ['I calculate particle counts from isotope notation.', 'I explain ion charge using electrons.', 'I distinguish mass number from relative atomic mass.', 'I connect outer electrons to reactions.'],
    sourceIds: ['openstax-chemistry'],
  }),
  lesson({
    id: 'myp5-biology-cells', subjectSlug: 'biology', topic: 'Cells',
    summary: 'Connect cell structures to functions and explain how specialised cells support larger systems.',
    objectives: ['Compare major cell structures.', 'Explain structure-function relationships.', 'Use scale and evidence when interpreting micrographs.'],
    keyIdeas: ['Cells exchange matter and energy with their surroundings.', 'Specialisation involves structures suited to a particular function.', 'Observations support claims only when scale and image limits are considered.'],
    definitions: [{ term: 'Organelle', meaning: 'A specialised structure within a cell that performs a particular function.' }, { term: 'Differentiation', meaning: 'The process through which a cell develops specialised features.' }, { term: 'Magnification', meaning: 'Image size divided by actual size.' }],
    method: ['Identify visible evidence before naming a structure.', 'State the structure’s feature.', 'Explain how that feature supports a process.', 'Link the process to the cell or organism.'],
    workedExample: { prompt: 'Explain one way a root hair cell is adapted for mineral-ion uptake.', steps: ['A root hair cell has a long projection.', 'The projection increases surface area in contact with soil water.', 'More membrane area permits more transport proteins and exchange.'], conclusion: 'The structure supports faster mineral-ion uptake; naming the projection alone would not explain the adaptation.' },
    misconceptions: [{ mistake: 'Saying mitochondria create energy.', correction: 'Mitochondria transfer energy from respiratory substrates into usable cellular forms.' }, { mistake: 'Assuming every plant cell contains chloroplasts.', correction: 'Only photosynthetic plant tissues typically need many chloroplasts.' }],
    practice: [practice('cell-1', 'Foundation', 'Identify', 3, 'Name the structure that controls movement of substances into and out of a cell, then state its function.', ['It forms the cell boundary.'], ['Cell membrane.', 'It selectively regulates substances entering and leaving the cell.'], ['Correct structure', 'Accurate function']), practice('cell-2', 'Standard', 'Explain', 5, 'Explain how a sperm cell’s structure supports fertilisation.', ['Choose two structures and connect each to a process.'], ['A flagellum provides movement towards the egg.', 'Many mitochondria support the energy transfer needed for movement.', 'The acrosome contains substances involved in penetrating outer egg layers.'], ['Two valid adaptations', 'Mechanisms explained', 'Links to fertilisation']), practice('cell-3', 'Advanced', 'Evaluate', 6, 'A student identifies a cell as photosynthetic because a micrograph contains dark circular regions. Evaluate the conclusion.', ['Consider alternative explanations and missing evidence.'], ['Dark regions alone do not prove chloroplast identity.', 'Staining, section thickness or other organelles could produce similar regions.', 'A scale, labelled comparison or additional imaging evidence is needed.'], ['Questions the inference', 'Names alternatives', 'Requests specific evidence'])],
    checklist: ['I connect structures to mechanisms.', 'I avoid absolute claims unsupported by an image.', 'I calculate magnification with consistent units.', 'I compare cells using both similarities and differences.'],
    sourceIds: ['openstax-biology'],
  }),
  lesson({
    id: 'myp5-integrated-sciences-systems', subjectSlug: 'integrated-sciences', topic: 'Systems and models',
    summary: 'Use system boundaries, inputs, outputs and interactions to explain complex scientific behaviour.',
    objectives: ['Define a useful system boundary.', 'Construct and critique models.', 'Explain feedback and interaction across components.'],
    keyIdeas: ['A system model simplifies reality for a purpose.', 'Changing the boundary changes which transfers are counted.', 'A useful model states both what it represents and what it omits.'],
    definitions: [{ term: 'System boundary', meaning: 'The chosen division between the system being studied and its surroundings.' }, { term: 'Model', meaning: 'A purposeful representation used to describe, explain or predict.' }, { term: 'Feedback', meaning: 'A process in which a system output influences later system behaviour.' }],
    method: ['State the question the model must answer.', 'Choose a boundary and label inputs, stores, transfers and outputs.', 'Trace one causal pathway.', 'Identify an assumption and testable limitation.'],
    workedExample: { prompt: 'Model a closed bottle terrarium as a system.', steps: ['Boundary: the sealed bottle.', 'Energy enters mainly as light and leaves mainly as thermal radiation.', 'Matter cycles among organisms, water, gases and soil inside the boundary.'], conclusion: 'The terrarium is approximately closed to matter but open to energy; the model ignores small leaks and long-term material changes.' },
    misconceptions: [{ mistake: 'Calling a model wrong because it omits detail.', correction: 'Judge whether omitted detail matters for the model’s stated purpose.' }, { mistake: 'Confusing a system diagram with a causal explanation.', correction: 'Use labelled arrows and explain the mechanism behind each important link.' }],
    practice: [practice('sys-1', 'Foundation', 'Outline', 3, 'For a kettle heating water, identify one energy input, one store and one output.', ['Follow energy across the boundary.'], ['Input: electrical energy transfer.', 'Store: thermal energy of the water.', 'Output: thermal transfer to surroundings.'], ['Input', 'Store', 'Output']), practice('sys-2', 'Standard', 'Develop', 5, 'Develop a simple model of carbon movement between plants, animals and the atmosphere.', ['Use process labels on arrows.'], ['Atmospheric carbon dioxide enters plants through photosynthesis.', 'Carbon moves to animals through feeding.', 'Respiration returns carbon dioxide to the atmosphere.', 'Decomposition provides another return pathway.'], ['Components', 'Directed transfers', 'Process labels']), practice('sys-3', 'Challenge', 'Evaluate', 7, 'Evaluate a model that predicts lake temperature using only daily air temperature.', ['Name what it captures and what it misses.'], ['Air temperature is relevant and easy to measure.', 'The model omits solar radiation, depth, mixing, inflows and time lag.', 'It may track broad seasonal change but is weak for short-term or depth-specific prediction.'], ['Strength', 'Multiple limitations', 'Bounded conclusion'])],
    checklist: ['I define system boundaries explicitly.', 'I label transfers with processes.', 'I distinguish description from mechanism.', 'I state the purpose and limitation of a model.'],
    sourceIds: ['ib-myp-programme', 'openstax-physics', 'openstax-biology'],
  }),
  lesson({
    id: 'myp5-english-literary-analysis', subjectSlug: 'english-language-literature', topic: 'Literary analysis',
    summary: 'Build interpretations from precise textual choices rather than naming techniques in isolation.',
    objectives: ['Develop an arguable interpretation.', 'Select concise evidence.', 'Explain how form and language shape meaning.'],
    keyIdeas: ['A technique is evidence, not an interpretation.', 'Context matters when it changes how a choice is understood.', 'Strong analysis considers patterns, tensions and alternatives.'],
    definitions: [{ term: 'Interpretation', meaning: 'A reasoned account of meaning supported by evidence.' }, { term: 'Connotation', meaning: 'An association carried by a word beyond its literal meaning.' }, { term: 'Form', meaning: 'The organising conventions and shape of a text.' }],
    method: ['Answer the task with a precise claim.', 'Embed a short, relevant detail.', 'Analyse the choice at word, sentence and structural level where useful.', 'Connect the effect to the wider interpretation.'],
    workedExample: { prompt: 'Analyse the line: “The clock cleared its throat before midnight.”', steps: ['Personification gives the clock a human action.', '“Cleared its throat” suggests an announcement is imminent.', 'The moment before midnight becomes tense and expectant.'], conclusion: 'The image turns time into an active presence preparing to interrupt the scene.' },
    misconceptions: [{ mistake: 'Writing that a technique “makes the reader want to read on”.', correction: 'Name the specific idea, feeling or expectation shaped by the choice.' }, { mistake: 'Using a long quotation without selecting language.', correction: 'Use the shortest evidence that still proves the claim.' }],
    practice: [practice('lit-1', 'Foundation', 'Explain', 4, 'Explain one effect of the phrase “the corridor swallowed every footstep”.', ['Focus on the verb.'], ['“Swallowed” personifies the corridor as consuming sound.', 'This makes the space feel unusually silent and threatening.'], ['Technique or choice identified', 'Meaning explained']), practice('lit-2', 'Standard', 'Analyse', 6, 'Analyse how sentence length could shift the pace of a chase scene.', ['Contrast long and short structures.'], ['Longer sentences can accumulate obstacles and sustain movement.', 'A sudden short sentence can mark impact, decision or danger.', 'The contrast matters more than either length alone.'], ['Structural analysis', 'Specific effects', 'Connection to scene']), practice('lit-3', 'Challenge', 'Evaluate', 8, 'A critic says an unreliable narrator only hides information. Evaluate this view.', ['Consider another function of unreliability.'], ['Withholding information is one effect.', 'Unreliability can also expose bias, self-deception or limited knowledge.', 'Its importance depends on how gaps alter the reader’s judgement of events.'], ['Addresses the view', 'Alternative interpretation', 'Qualified judgement'])],
    checklist: ['My claim is arguable, not a plot summary.', 'My evidence is precise.', 'I explain how a choice creates meaning.', 'I connect details to a wider interpretation.'],
    sourceIds: ['ib-myp-programme'],
  }),
  lesson({
    id: 'myp5-spanish-identity', subjectSlug: 'spanish', topic: 'Identity and relationships',
    summary: 'Communicate about identity and relationships with controlled tense, agreement and supporting detail.',
    objectives: ['Describe identity using varied adjectives.', 'Explain relationships with reasons and examples.', 'Move between present and past experience.'],
    keyIdeas: ['Adjectives usually agree with the noun they describe.', 'Connectors turn separate facts into sustained communication.', 'A clear message matters more than forcing unfamiliar complexity.'],
    definitions: [{ term: 'Concordancia', meaning: 'Agreement in gender and number between related words.' }, { term: 'Conector', meaning: 'A word or phrase that links ideas, such as aunque, por eso or sin embargo.' }, { term: 'Opinión justificada', meaning: 'A viewpoint supported by a reason or example.' }],
    method: ['Identify audience, purpose and required tense.', 'Plan one main idea per sentence group.', 'Add reasons with porque, ya que or dado que.', 'Check verb endings and adjective agreement.'],
    workedExample: { prompt: 'Describe a friendship and explain why it matters.', steps: ['Opening: Mi amistad con Ana es importante para mí.', 'Detail: Nos conocemos desde hace cinco años y compartimos el interés por la música.', 'Reason: Aunque no siempre estamos de acuerdo, me escucha cuando tengo un problema.'], conclusion: 'The response communicates relationship, time, shared experience and a justified personal view.' },
    misconceptions: [{ mistake: 'Translating English word order directly.', correction: 'Build the Spanish phrase around its own agreement and placement patterns.' }, { mistake: 'Using porque and por qué interchangeably.', correction: 'Porque gives a reason; por qué introduces or embeds a question.' }],
    practice: [practice('spa-1', 'Foundation', 'Describe', 4, 'Escribe cuatro frases sobre tu personalidad y tus intereses.', ['Use two different adjective patterns.'], ['Possible structure: Soy..., pero a veces...; Me interesa... porque...; En mi tiempo libre...; Mis amigos dicen que...'], ['Four relevant sentences', 'Agreement mostly controlled', 'At least one reason']), practice('spa-2', 'Standard', 'Explain', 6, 'Explica cómo ha cambiado una relación importante en tu vida.', ['Use a past reference and a present comparison.'], ['Begin with Antes..., describe one event, then compare with Ahora... and explain the change.'], ['Past and present', 'Specific example', 'Clear explanation']), practice('spa-3', 'Advanced', 'Discuss', 8, '¿Las redes sociales fortalecen o debilitan las amistades?', ['Give both a benefit and a limitation.'], ['State a position, support it with an example, acknowledge the opposing view with sin embargo, and finish with a qualified conclusion.'], ['Developed viewpoint', 'Contrasting perspective', 'Range of connectors', 'Relevant conclusion'])],
    checklist: ['I answer the stated purpose.', 'I control the main tense.', 'I justify opinions.', 'I check agreement and high-frequency verbs.'],
    sourceIds: ['ib-myp-programme'],
  }),
  lesson({
    id: 'myp5-economics-scarcity', subjectSlug: 'economics', topic: 'Scarcity',
    summary: 'Explain how limited resources create choices, opportunity costs and competing priorities.',
    objectives: ['Distinguish scarcity from a temporary shortage.', 'Identify opportunity cost.', 'Evaluate choices using stakeholder evidence.'],
    keyIdeas: ['Scarcity exists because wants exceed available resources.', 'Opportunity cost is the next-best alternative forgone.', 'A choice can distribute costs and benefits unevenly.'],
    definitions: [{ term: 'Scarcity', meaning: 'The condition in which available resources cannot satisfy every possible want.' }, { term: 'Opportunity cost', meaning: 'The value of the next-best alternative given up.' }, { term: 'Stakeholder', meaning: 'A person or group affected by a decision.' }],
    method: ['Identify the limited resource.', 'Name the realistic alternatives.', 'State the next-best alternative forgone.', 'Compare effects across stakeholders and time.'],
    workedExample: { prompt: 'A council uses vacant land for a sports centre instead of affordable housing.', steps: ['The scarce resource is usable urban land.', 'The chosen use is the sports centre.', 'If housing was the next-best option, its benefits are the opportunity cost.'], conclusion: 'The decision cannot be judged from construction cost alone; access, health, housing need and long-term effects matter.' },
    misconceptions: [{ mistake: 'Defining opportunity cost as all alternatives.', correction: 'It is the value of the next-best forgone alternative.' }, { mistake: 'Treating scarcity as the same as poverty.', correction: 'Scarcity applies whenever resources are limited relative to possible uses.' }],
    practice: [practice('eco-1', 'Foundation', 'Define', 3, 'Define opportunity cost and give one school-based example.', ['Name the next-best choice given up.'], ['Opportunity cost is the next-best alternative forgone; for example, spending a free period rehearsing means giving up the next-best use of that time.'], ['Accurate definition', 'Relevant example']), practice('eco-2', 'Standard', 'Explain', 5, 'Explain why clean water can be scarce in a region with high rainfall.', ['Scarcity can involve access and infrastructure.'], ['Rainfall does not guarantee safe storage, treatment or distribution.', 'Pollution, seasonal variation and unequal infrastructure can limit usable supply.'], ['Distinguishes water from usable water', 'Two causal factors']), practice('eco-3', 'Challenge', 'Evaluate', 8, 'A school can fund either smaller classes or a new sports hall. Evaluate the decision information needed.', ['Avoid choosing without evidence.'], ['Compare learning needs, facility condition, student access, recurring staffing costs and long-term use.', 'Identify affected groups and uncertainty.', 'Reach a conditional decision based on the strongest need and feasible costs.'], ['Relevant evidence', 'Stakeholder comparison', 'Opportunity cost', 'Qualified judgement'])],
    checklist: ['I identify the scarce resource.', 'I state a realistic next-best alternative.', 'I distinguish evidence from preference.', 'I compare short- and long-term effects.'],
    sourceIds: ['ib-myp-programme'],
  }),
  lesson({
    id: 'myp5-geography-population', subjectSlug: 'geography', topic: 'Population',
    summary: 'Interpret population patterns using scale, rates, spatial evidence and interacting causes.',
    objectives: ['Read population structures and rates.', 'Explain spatial variation.', 'Evaluate demographic claims using evidence quality.'],
    keyIdeas: ['Population change reflects births, deaths and migration.', 'Rates allow fairer comparison than raw totals.', 'Patterns at national scale can hide regional differences.'],
    definitions: [{ term: 'Natural increase', meaning: 'Birth rate minus death rate, excluding migration.' }, { term: 'Dependency ratio', meaning: 'A comparison between conventionally dependent and working-age population groups.' }, { term: 'Population density', meaning: 'Population divided by land area.' }],
    method: ['Read title, date, scale and units.', 'Describe the dominant pattern with evidence.', 'Explain it using linked physical and human factors.', 'Identify anomalies and limitations.'],
    workedExample: { prompt: 'A city’s population rises while its national birth rate falls.', steps: ['Falling national birth rate does not determine one city’s population alone.', 'Internal or international migration may add population.', 'Lower death rates or changing boundaries may also contribute.'], conclusion: 'The two observations are compatible; a conclusion requires migration, mortality, time-period and boundary data.' },
    misconceptions: [{ mistake: 'Using total population to compare differently sized areas.', correction: 'Use density or another rate suited to the question.' }, { mistake: 'Treating correlation between two maps as proof of cause.', correction: 'Propose a mechanism and test competing explanations.' }],
    practice: [practice('geo-1', 'Foundation', 'Calculate', 3, 'A region has 2.4 million people and an area of 30,000 km². Calculate population density.', ['Population ÷ area.'], ['2,400,000 ÷ 30,000 = 80 people per km².'], ['Correct operation', 'Correct unit']), practice('geo-2', 'Standard', 'Analyse', 6, 'A population pyramid has a narrow base and a wider middle. Analyse two possible implications.', ['Separate description from implication.'], ['The narrow base suggests fewer recent births relative to older cohorts.', 'Future school-age demand may fall while ageing-related services may face more pressure.', 'Migration could alter this interpretation.'], ['Pattern described', 'Two implications', 'Caveat']), practice('geo-3', 'Challenge', 'Evaluate', 8, 'Evaluate the claim that high population density causes poor quality of life.', ['Consider measurement and counterexamples.'], ['Density alone does not determine housing, services, transport or inequality.', 'Well-planned dense areas may provide strong access, while low-density areas can lack services.', 'Use multiple quality-of-life indicators and comparisons before judging.'], ['Challenges causation', 'Uses counterexample logic', 'Evidence requirement', 'Judgement'])],
    checklist: ['I compare with rates when appropriate.', 'I quote spatial evidence accurately.', 'I explain mechanisms.', 'I test scale, date and data limitations.'],
    sourceIds: ['ib-myp-programme'],
  }),
  lesson({
    id: 'myp5-history-source-analysis', subjectSlug: 'history', topic: 'Source analysis',
    summary: 'Interrogate what a source can reveal by connecting content, origin, purpose and historical context.',
    objectives: ['Infer from source content.', 'Evaluate value and limitation in relation to a question.', 'Corroborate across sources.'],
    keyIdeas: ['A source is valuable for some questions and limited for others.', 'Origin does not automatically determine reliability.', 'Corroboration compares both agreement and difference.'],
    definitions: [{ term: 'Provenance', meaning: 'Information about a source’s origin, creator, time and context.' }, { term: 'Corroboration', meaning: 'Comparison with other evidence to test or extend a claim.' }, { term: 'Purpose', meaning: 'The intended outcome or audience effect of a source.' }],
    method: ['Read content before provenance.', 'Make a specific inference and cite its evidence.', 'Connect origin or purpose to a precise value or limitation.', 'Compare with another source or missing perspective.'],
    workedExample: { prompt: 'Evaluate a mayor’s campaign speech as evidence about living conditions.', steps: ['Content may identify issues the campaign expects voters to recognise.', 'The public persuasive purpose can reveal political priorities.', 'The same purpose may encourage selective examples or exaggeration.', 'Resident records or independent data could corroborate the claims.'], conclusion: 'The speech can be valuable for political priorities and public messaging, but it cannot establish typical living conditions on its own.' },
    misconceptions: [{ mistake: 'Writing “biased, therefore useless”.', correction: 'Bias can itself provide evidence about viewpoint, priorities and intended audience.' }, { mistake: 'Listing origin, purpose, value and limitation without linking them.', correction: 'Explain why each feature matters for the exact historical question.' }],
    practice: [practice('his-1', 'Foundation', 'Infer', 3, 'A factory poster warns workers to protect machinery during wartime. Infer one priority of its creator.', ['Use a detail from the source description.'], ['The creator prioritises maintaining industrial production, shown by the instruction to protect machinery.'], ['Inference', 'Supporting detail']), practice('his-2', 'Standard', 'Evaluate', 6, 'Evaluate a soldier’s private letter as evidence of army morale.', ['Consider immediacy, audience and representativeness.'], ['A private letter may reveal personal feelings close to the event.', 'The writer may still self-censor to reassure family or avoid military censorship.', 'One soldier cannot represent the whole army.'], ['Specific value', 'Specific limitation', 'Question focus']), practice('his-3', 'Challenge', 'Compare', 8, 'Two newspapers report the same protest differently. Explain how you would use both accounts.', ['Difference can be evidence.'], ['Compare reported events, language, images, ownership, audience and publication timing.', 'Agreements may establish common facts.', 'Differences may reveal selection or political perspective and should be tested against independent evidence.'], ['Comparison method', 'Use of agreement', 'Use of difference', 'Corroboration'])],
    checklist: ['I make inferences from content.', 'I connect provenance to the question.', 'I avoid automatic reliability labels.', 'I corroborate before generalising.'],
    sourceIds: ['ib-myp-programme', 'loc-primary-sources'],
  }),
  lesson({
    id: 'myp5-integrated-humanities-inquiry', subjectSlug: 'integrated-humanities', topic: 'Inquiry questions',
    summary: 'Design focused inquiries that connect spatial, historical, economic and social evidence.',
    objectives: ['Turn a broad theme into a focused question.', 'Choose evidence suited to the question.', 'Synthesize more than one disciplinary lens.'],
    keyIdeas: ['A strong inquiry names a relationship, context and workable scope.', 'Different disciplines make different evidence visible.', 'Synthesis explains what the combined view reveals.'],
    definitions: [{ term: 'Inquiry question', meaning: 'A focused, researchable question that guides evidence collection and reasoning.' }, { term: 'Scope', meaning: 'The boundaries of place, time, population and concept used in an inquiry.' }, { term: 'Synthesis', meaning: 'An integrated explanation built from multiple sources or disciplinary perspectives.' }],
    method: ['Name the issue and possible relationship.', 'Bound it by place, time and population.', 'Check that evidence could challenge the expected answer.', 'Select at least two disciplinary lenses and explain their contribution.'],
    workedExample: { prompt: 'Improve the question “Is tourism good?”', steps: ['Define location and time.', 'Replace “good” with measurable social, economic and environmental effects.', 'Allow competing outcomes.'], conclusion: 'A stronger question is: “To what extent did increased tourism from 2018 to 2025 change employment and coastal habitat quality in Region X?”' },
    misconceptions: [{ mistake: 'Writing a question that contains its desired conclusion.', correction: 'Use wording that permits evidence to support, weaken or complicate the claim.' }, { mistake: 'Collecting sources before defining scope.', correction: 'Set the boundaries first so evidence can be selected deliberately.' }],
    practice: [practice('inq-1', 'Foundation', 'Develop', 4, 'Turn “pollution in cities” into a focused inquiry question.', ['Add a city, time period, pollutant and affected outcome.'], ['Example: “How did roadside nitrogen dioxide levels relate to childhood asthma admissions in City X from 2020 to 2025?”'], ['Relationship', 'Place', 'Time', 'Researchable outcome']), practice('inq-2', 'Standard', 'Justify', 6, 'Justify two source types for investigating a new transport policy.', ['Connect each source to a different part of the question.'], ['Traffic-count data can show movement changes.', 'Resident interviews can reveal unequal access or lived effects.', 'Together they compare measured patterns with experience.'], ['Two suitable sources', 'Purpose of each', 'Combined value']), practice('inq-3', 'Challenge', 'Evaluate', 8, 'Evaluate whether economic growth alone can measure a redevelopment project’s success.', ['Bring in spatial and social evidence.'], ['Growth can show investment or income change but may hide distribution.', 'Displacement, travel access, housing cost and environmental quality may move differently.', 'A defensible evaluation needs multiple indicators and stakeholder evidence.'], ['Strength of economic measure', 'Multiple limitations', 'Interdisciplinary synthesis', 'Judgement'])],
    checklist: ['My question is focused and contestable.', 'My evidence can test the claim.', 'I justify source choice.', 'I synthesize rather than place disciplines side by side.'],
    sourceIds: ['ib-myp-programme', 'loc-primary-sources'],
  }),
  lesson({
    id: 'myp5-design-cycle', subjectSlug: 'design', topic: 'Design cycle',
    summary: 'Trace a design decision from an evidenced need through specification, creation and evaluation.',
    objectives: ['Investigate a defined user need.', 'Develop measurable success criteria.', 'Use test evidence to justify iteration.'],
    keyIdeas: ['A design problem belongs to a user in a context.', 'Specifications must be testable.', 'Evaluation compares evidence with criteria rather than describing the final product.'],
    definitions: [{ term: 'Design specification', meaning: 'A measurable requirement used to guide and evaluate a solution.' }, { term: 'Prototype', meaning: 'A representation built to test selected aspects of a proposed solution.' }, { term: 'Iteration', meaning: 'A change made in response to evidence from testing or feedback.' }],
    method: ['Define user, context and observed problem.', 'Prioritise research questions.', 'Translate evidence into measurable criteria.', 'Prototype risky assumptions early and record why each revision occurs.'],
    workedExample: { prompt: 'Improve “The bottle should be easy to use” as a specification.', steps: ['Name the user and action.', 'Choose a measurable threshold.', 'State a test.'], conclusion: '“A Year 5 learner wearing gloves can open and reseal the bottle within 8 seconds in four of five trials” is testable and user-specific.' },
    misconceptions: [{ mistake: 'Treating a feature list as a specification.', correction: 'Each important requirement needs a measurable condition and test.' }, { mistake: 'Changing a design without recording why.', correction: 'Link every iteration to evidence, a failed criterion or new constraint.' }],
    practice: [practice('des-1', 'Foundation', 'Develop', 4, 'Write two measurable criteria for a reusable lunch container.', ['Include a threshold and test.'], ['Example: no leakage after 30 seconds upside down; mass below 450 g when empty.'], ['Two criteria', 'Measurable thresholds']), practice('des-2', 'Standard', 'Explain', 6, 'Explain why interviewing one user and observing the task can provide different evidence.', ['Compare reported preference with observed behaviour.'], ['An interview reveals priorities and explanations.', 'Observation can expose actions or difficulties the user does not mention.', 'Together they reduce reliance on one evidence type.'], ['Both methods explained', 'Difference identified', 'Combined value']), practice('des-3', 'Challenge', 'Evaluate', 8, 'A prototype passes strength tests but users avoid it. Evaluate the next design step.', ['Technical success is not complete success.'], ['Retain the validated structural decisions.', 'Investigate usability, appearance, effort and context through targeted observation or interviews.', 'Revise the failing criteria and test the changed prototype with representative users.'], ['Uses existing evidence', 'Identifies missing evidence', 'Specific iteration plan', 'Retest'])],
    checklist: ['I define a real user and context.', 'My criteria are measurable.', 'My tests match the criteria.', 'Every iteration has an evidence trail.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment'],
  }),
  lesson({
    id: 'myp5-visual-arts-analysis', subjectSlug: 'visual-arts', topic: 'Artwork analysis',
    summary: 'Interpret how material, composition and context contribute to meaning in an artwork.',
    objectives: ['Describe visible evidence precisely.', 'Analyse relationships among formal choices.', 'Develop contextual interpretations without treating them as certain.'],
    keyIdeas: ['Description records what is visible; analysis explains relationships.', 'Meaning emerges from choices working together.', 'Context can deepen an interpretation but should not replace visual evidence.'],
    definitions: [{ term: 'Composition', meaning: 'The arrangement and relationship of visual elements.' }, { term: 'Medium', meaning: 'The materials and processes used to make an artwork.' }, { term: 'Focal point', meaning: 'An area given particular visual emphasis.' }],
    method: ['Describe one precise feature.', 'Name the formal relationship it creates.', 'Explain a plausible effect or meaning.', 'Test the interpretation against another feature or context.'],
    workedExample: { prompt: 'Analyse a portrait in which the figure occupies the edge of a large empty field.', steps: ['The off-centre placement creates strong asymmetry.', 'Negative space dominates the frame.', 'The visual imbalance can suggest isolation or movement beyond the frame.'], conclusion: 'The interpretation remains provisional until colour, gaze, context and other choices are considered.' },
    misconceptions: [{ mistake: 'Listing colours and shapes without explaining relationships.', correction: 'Explain contrast, repetition, balance, emphasis or movement.' }, { mistake: 'Claiming one universal emotional effect.', correction: 'Offer a supported interpretation and acknowledge ambiguity where relevant.' }],
    practice: [practice('art-1', 'Foundation', 'Describe', 3, 'Describe three compositional features of an imagined poster with one large red circle above a row of small grey figures.', ['Use position, scale and contrast.'], ['Large red circle near the top; repeated small grey figures below; strong contrast in colour and scale.'], ['Three precise observations']), practice('art-2', 'Standard', 'Analyse', 6, 'Analyse how repetition and interruption can create emphasis.', ['Identify the pattern before the break.'], ['Repetition establishes expectation and rhythm.', 'A changed element interrupts the pattern and becomes a focal point.', 'Its meaning depends on what distinguishes it and the surrounding context.'], ['Pattern explained', 'Interruption analysed', 'Meaning connected']), practice('art-3', 'Challenge', 'Evaluate', 8, 'Evaluate whether an artist statement should determine the meaning of an artwork.', ['Balance intention with the work and viewer context.'], ['The statement can clarify process and intention.', 'Visual evidence may support, complicate or contradict it.', 'Interpretation should consider intention without making it the only authority.'], ['Value', 'Limitation', 'Visual evidence', 'Judgement'])],
    checklist: ['I separate observation from inference.', 'I analyse relationships among choices.', 'I use context selectively.', 'I support interpretations with visible evidence.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment'],
  }),
  lesson({
    id: 'myp5-music-analysis', subjectSlug: 'music', topic: 'Musical analysis',
    summary: 'Explain how musical elements interact over time to shape structure, tension and character.',
    objectives: ['Use musical vocabulary accurately.', 'Track change across a passage.', 'Connect evidence to an interpretation.'],
    keyIdeas: ['Musical effect usually comes from interacting elements.', 'Analysis needs a location in the music.', 'Contrast and development help listeners perceive structure.'],
    definitions: [{ term: 'Texture', meaning: 'How simultaneous musical lines or layers relate.' }, { term: 'Timbre', meaning: 'The characteristic quality of a sound.' }, { term: 'Motif', meaning: 'A short musical idea that can recur or develop.' }],
    method: ['Locate the passage by time, section or rehearsal mark.', 'Describe a specific musical change.', 'Explain interaction with another element.', 'Connect the change to structure or expressive intention.'],
    workedExample: { prompt: 'Analyse a repeated four-note motif that moves to higher pitch and louder dynamics.', steps: ['Repetition establishes the motif as recognisable.', 'Sequential rise increases register.', 'Crescendo adds growing intensity.'], conclusion: 'Together, rising pitch and dynamics develop the motif into a structural build rather than simple repetition.' },
    misconceptions: [{ mistake: 'Writing a vocabulary list instead of an analysis.', correction: 'Connect each term to audible evidence, change and effect.' }, { mistake: 'Calling tempo and rhythm the same thing.', correction: 'Tempo is overall pulse speed; rhythm is the pattern of durations and accents.' }],
    practice: [practice('mus-1', 'Foundation', 'Identify', 3, 'Identify three elements you could track when comparing two performances.', ['Choose measurable or audible features.'], ['Tempo, articulation and dynamics are three valid elements.'], ['Three valid elements']), practice('mus-2', 'Standard', 'Explain', 6, 'Explain how thinning texture can prepare a climax.', ['Think about contrast.'], ['Removing layers lowers density and can create expectation.', 'A later return of fuller texture gains impact through contrast.', 'Dynamics, register and silence may strengthen the preparation.'], ['Texture change', 'Contrast', 'Connection to climax']), practice('mus-3', 'Challenge', 'Evaluate', 8, 'Evaluate whether a faster performance is necessarily more energetic.', ['Separate tempo from energy.'], ['Faster tempo may contribute energy.', 'Weak articulation, narrow dynamics or low rhythmic emphasis can reduce intensity.', 'Energy should be judged from interacting performance choices.'], ['Considers tempo', 'Counterfactors', 'Integrated judgement'])],
    checklist: ['I locate evidence in the music.', 'I distinguish musical elements.', 'I analyse interactions and change.', 'I connect evidence to structure or intention.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment'],
  }),
  lesson({
    id: 'myp5-drama-performance', subjectSlug: 'drama', topic: 'Performance analysis',
    summary: 'Analyse how performer, space, design and audience relationships create meaning in live work.',
    objectives: ['Describe performance evidence.', 'Explain interaction among theatrical choices.', 'Evaluate choices against an artistic intention.'],
    keyIdeas: ['Performance choices occur in time and space.', 'Meaning can come from contrast between spoken text and physical action.', 'Evaluation needs a stated intention and evidence of audience effect.'],
    definitions: [{ term: 'Proxemics', meaning: 'The use of distance and spatial relationship between performers.' }, { term: 'Blocking', meaning: 'Planned movement and positioning on stage.' }, { term: 'Subtext', meaning: 'Meaning implied beneath or beside the spoken words.' }],
    method: ['Locate the moment.', 'Describe voice, body, space or design precisely.', 'Explain how choices interact.', 'Judge their effect in relation to intention and audience.'],
    workedExample: { prompt: 'Analyse a character saying “I trust you” while stepping backwards.', steps: ['The words state trust.', 'Backward movement increases distance.', 'The contradiction creates subtext of fear, doubt or concealment.'], conclusion: 'The moment asks the audience to question the literal dialogue and attend to physical evidence.' },
    misconceptions: [{ mistake: 'Retelling the scene.', correction: 'Select a moment and analyse the choices that produce meaning.' }, { mistake: 'Calling a performance effective without criteria.', correction: 'State the intention, evidence and observed or plausible audience response.' }],
    practice: [practice('dra-1', 'Foundation', 'Describe', 3, 'Describe three performance choices that could show status without dialogue.', ['Consider level, gaze and pace.'], ['Higher physical level, sustained direct gaze and controlled slower movement could suggest status.'], ['Three specific choices']), practice('dra-2', 'Standard', 'Explain', 6, 'Explain how lighting and proxemics could isolate one performer.', ['Connect two design areas.'], ['A narrow pool of light can separate the performer visually.', 'Large distance from the ensemble reinforces social separation.', 'The combined choices direct audience attention and communicate isolation.'], ['Lighting', 'Proxemics', 'Combined effect']), practice('dra-3', 'Challenge', 'Evaluate', 8, 'A scene intends to create tension but the audience laughs. Evaluate what evidence the group should review.', ['Do not assume laughter means total failure.'], ['Review timing, vocal delivery, physical exaggeration, audience context and whether laughter occurred at intended moments.', 'Compare rehearsal recordings and feedback.', 'Revise the clearest mismatch, then retest.'], ['Multiple evidence sources', 'Connection to intention', 'Specific revision', 'Retest'])],
    checklist: ['I select exact moments.', 'I describe observable choices.', 'I analyse interactions.', 'I evaluate against intention and evidence.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment'],
  }),
  lesson({
    id: 'myp5-phe-fitness', subjectSlug: 'physical-health-education', topic: 'Fitness',
    summary: 'Connect fitness components, training demands and recovery to a defined performance goal.',
    objectives: ['Distinguish fitness components.', 'Select valid field tests.', 'Design safe, progressive training decisions.'],
    keyIdeas: ['Fitness is specific to a task and person.', 'A test is useful only if it is valid, reliable and applied consistently.', 'Adaptation requires overload alongside recovery.'],
    definitions: [{ term: 'Validity', meaning: 'The extent to which a test measures the intended quality.' }, { term: 'Reliability', meaning: 'The consistency of results under repeated comparable conditions.' }, { term: 'Progressive overload', meaning: 'A gradual increase in training demand as adaptation occurs.' }],
    method: ['Define the performance demand.', 'Choose the relevant component and baseline test.', 'Set frequency, intensity, time and type.', 'Plan recovery and a later comparable retest.'],
    workedExample: { prompt: 'Plan one progression for a runner completing three 20-minute easy runs per week.', steps: ['Keep two sessions unchanged.', 'Increase one run to 23 minutes, a 15% rise for that session.', 'Monitor effort and recovery before another increase.'], conclusion: 'The progression changes one variable and preserves recovery, making the response easier to evaluate.' },
    misconceptions: [{ mistake: 'Increasing every training variable at once.', correction: 'Change demand gradually so adaptation and fatigue can be interpreted.' }, { mistake: 'Treating soreness as proof of improvement.', correction: 'Use performance, recovery and wellbeing evidence rather than discomfort alone.' }],
    practice: [practice('phe-1', 'Foundation', 'Identify', 3, 'Identify the main fitness component in a 100 m sprint and one suitable test.', ['Think about rapid force and speed.'], ['Speed is central; a timed 30 m or 40 m sprint can provide a relevant field measure.'], ['Component', 'Suitable test']), practice('phe-2', 'Standard', 'Design', 6, 'Design one interval session for an intermediate 5 km runner.', ['Include work, recovery, repetitions and intensity cue.'], ['Example: 6 × 2 minutes at a controlled hard effort with 2 minutes easy movement between repetitions, after warm-up and before cool-down.'], ['Complete structure', 'Intensity', 'Recovery', 'Safety']), practice('phe-3', 'Challenge', 'Evaluate', 8, 'Evaluate a four-week plan that increases running distance by 20% every week with no recovery week.', ['Compound the increases and consider individual response.'], ['The plan provides overload but compounds quickly.', 'No lighter week or symptom monitoring increases fatigue risk.', 'Progression should respond to training history, recovery and performance evidence rather than use one automatic percentage.'], ['Benefit', 'Risk', 'Individualisation', 'Recommendation'])],
    checklist: ['I connect fitness to a task.', 'I choose valid tests.', 'I specify training dose.', 'I include recovery and retesting.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment'],
  }),
  lesson({
    id: 'myp5-personal-project-goal', subjectSlug: 'personal-project', topic: 'Goal development',
    summary: 'Turn an interest into a feasible learning goal, product goal and evidence plan.',
    objectives: ['Separate learning and product goals.', 'Define meaningful success criteria.', 'Plan evidence of process and reflection.'],
    keyIdeas: ['The learning goal describes what the learner will understand or become able to do.', 'The product goal describes what will be created or performed.', 'Success criteria should be testable before production begins.'],
    definitions: [{ term: 'Learning goal', meaning: 'The knowledge or skill the learner intends to develop.' }, { term: 'Product goal', meaning: 'The intended outcome, artefact or performance.' }, { term: 'Process evidence', meaning: 'Dated records showing decisions, research, action, feedback and change.' }],
    method: ['Name the interest and intended learning.', 'Define a product that can demonstrate the learning.', 'Set measurable quality criteria.', 'Plan milestones, evidence and feedback points.'],
    workedExample: { prompt: 'Improve “I want to make an app about recycling.”', steps: ['Learning goal: learn to design and test accessible information architecture.', 'Product goal: create a working prototype for local recycling decisions.', 'Criteria: users complete three sorting tasks accurately; text works at 200% zoom; content sources are recorded.'], conclusion: 'The revised goals distinguish learning from output and make evaluation possible.' },
    misconceptions: [{ mistake: 'Choosing a product before deciding what to learn.', correction: 'Make the product serve the learning goal.' }, { mistake: 'Writing criteria after the product is finished.', correction: 'Freeze criteria early, then document justified changes.' }],
    practice: [practice('pp-1', 'Foundation', 'Distinguish', 4, 'Distinguish a learning goal from a product goal using one example.', ['Use “learn to” and “create”.'], ['Learning goal: learn to conduct oral-history interviews ethically.', 'Product goal: create a ten-minute edited audio documentary.'], ['Clear distinction', 'Connected example']), practice('pp-2', 'Standard', 'Develop', 6, 'Develop three success criteria for an illustrated beginner’s cooking guide.', ['Include content, usability and testing.'], ['Examples: every recipe is tested twice; a beginner completes one recipe using only the guide; allergen information is visible for every recipe.'], ['Three measurable criteria', 'User relevance', 'Testability']), practice('pp-3', 'Challenge', 'Evaluate', 8, 'A learner changes the project goal halfway through but has no dated record. Evaluate the evidence problem and recovery action.', ['Separate the quality of the change from the missing trace.'], ['The change may be justified, but without dated evidence the reasoning and sequence cannot be established.', 'Reconstruct only from existing messages, drafts or files, label uncertainty, and document future decisions contemporaneously.'], ['Evidence limitation', 'No fabrication', 'Recovery method', 'Future process'])],
    checklist: ['My learning and product goals are distinct.', 'My scope is feasible.', 'My criteria are measurable.', 'My process evidence records decisions when they happen.'],
    sourceIds: ['ib-myp-programme', 'ib-myp-assessment'],
  }),
  ...MYP5_LESSON_EXPANSION,
];

const lessonByKey = new Map(MYP5_LESSONS.map((entry) => [`${entry.subjectSlug}:${entry.topic}`, entry]));

export function findMypLesson(subjectSlug: string, topic: string): MypLesson | null {
  return lessonByKey.get(`${subjectSlug}:${topic}`) ?? null;
}

export function sourcesForLesson(lessonEntry: MypLesson): MypContentSource[] {
  const ids = new Set(lessonEntry.sourceIds);
  return MYP_CONTENT_SOURCES.filter((source) => ids.has(source.id));
}
