// A checked topic register, not a denominator for entire qualifications.
// Official wording is not reproduced; locators identify the inspected scope.
const aqa = (path, locator) => ({ url: `https://www.aqa.org.uk/subjects/${path}`, locator,
  version: 'Live specification inspected 22 October 2026 for the 2027 planning cohort', inspection: 'selected-html-sections' });
const cam = (file, version, locator, rendered = false) => ({ url: `https://www.cambridgeinternational.org/Images/${file}-syllabus.pdf`, version, locator,
  inspection: rendered ? 'selected-text-and-rendered-page' : 'selected-pdf-text' });
export const subjectUnitSources = {
  'gcse-biology': aqa('biology/gcse/biology-8461/specification/subject-content/cell-biology', '4.1.1.1–4.1.1.5'),
  'igcse-biology': cam('697203-2026-2028', '2026–2028 version 3', 'Page 14, 2.1 and 2.2; Core/Supplement columns', true),
  'gcse-chemistry': aqa('chemistry/gcse/chemistry-8462/specification/subject-content/atomic-structure-and-the-periodic-table', '4.1.1: particle counts, isotopes and electron arrangements'),
  'igcse-chemistry': cam('697205-2026-2028', '2026–2028 version 2', 'Page 13, 2.2 and 2.3; Core/Supplement columns', true),
  'gcse-physics': aqa('physics/gcse/physics-8463/specification/subject-content/electricity', '4.2.1.2–4.2.1.4'),
  'igcse-physics': cam('697209-2026-2028', '2026–2028 version 2', 'Pages 28–29, 4.2.2–4.2.4; page 28 rendered', true),
  'al-biology': aqa('biology/a-level/biology-7402/specification/subject-content/cells', '3.2.3'),
  'al-chemistry': aqa('chemistry/a-level/chemistry-7405/specification/subject-content/physical-chemistry', '3.1.2'),
  'al-physics': aqa('physics/a-level/physics-7408/specification/subject-content/particles-and-radiation', '3.2.2'),
  'gcse-history': aqa('history/gcse/history-8145/specification/subject-content/understanding-the-modern-world', 'AB, Part one: transition and crises, 1918–1923'),
  'igcse-history': cam('721327-2027-2028', '2027–2028 version 1', 'Page 15, Option B key question 1; page 30 series prescriptions'),
  'al-history': aqa('history/a-level/history-7042/specification/subject-content/1c-the-tudors-england-1485-1603', '1C, Henry VII, 1485–1509: security and authority'),
  'gcse-literature': aqa('english/gcse/english-8702/specification/subject-content/shakespeare-and-the-19th-century-novel', '3.1.1 Macbeth; 3.1.2 A Christmas Carol; whole-text requirement'),
  'al-literature': aqa('english/a-level/english-7712/specification/subject-content/love-through-the-ages', '3.1, Othello selected Shakespeare text'),
  'gcse-computing': aqa('computer-science/gcse/computer-science-8525/specification/subject-content/fundamentals-of-data-representation', '3.3.1–3.3.4; AQA eight-bit scope'),
  'igcse-computing': cam('697167-2026-2028', '2026–2028 version 6', 'Pages 11–12, 1.1; sixteen-bit conversion and eight-bit two’s complement'),
  'al-computing': aqa('computer-science/a-level/computer-science-7517/specification/subject-content/fundamentals-of-algorithms', '4.3.4'),
  'gcse-geography': aqa('geography/gcse/geography-8035/specification/subject-content/living-with-the-physical-environment', '3.1.1.1–3.1.1.2; named examples remain required'),
  'igcse-geography': cam('718150-2027-2029', '2027–2029 syllabus', 'Page 17, topic 4; selected boundary, earthquake and risk content'),
  'gcse-business': aqa('business/gcse/business-8132/specification/subject-content/business-in-the-real-world', '3.1.1 and 3.1.3; objectives and enterprise'),
  'igcse-business': cam('718123-2027-2029', '2027–2029 syllabus, code 0264', 'Pages 11–12, 1.1, 1.3.1 and 1.5'),
  'al-business': aqa('business/a-level/business-7132/specification/subject-content/managers-leadership-and-decision-making', '3.2.2; page explicitly retains 7132 for 2027'),
  'igcse-economics': cam('718148-2027-2029', '2027–2029 syllabus', 'Pages 11–12, 1.1–1.4 selected scarcity and PPC concepts'),
  'al-economics': aqa('economics/a-level/economics-7136/specification/subject-content/individuals-firms-markets-and-market-failure', '3.1.1.4–3.1.1.5'),
  'gcse-language': aqa('english/gcse/english-8700/specification/subject-content', 'Reading, comparison, synthesis and writing; March 2026 specification revision'),
  'igcse-language': cam('718783-2027-2029', '2027–2029 syllabus', 'Page 11 reading/writing; pages 13–17 revised assessment, not replicated by these exercises'),
};

const target = (programme, subject, code, sourceId, lessonIds, pointScope, remaining) => ({
  programme, subject, qualificationCode: code, sourceId, lessonIds: lessonIds.map(id => `unit-${id}`), pointScope, remaining,
  status: 'source-checked-partial-authoring', complete: false, independentlyReviewed: false, verifiedCoveragePercent: null,
});
const scienceBacklog = ['Other topic strands in the full specification', 'Further images, unfamiliar data and extended assessment tasks', 'Supervised practical work and independent subject review'];
export const subjectUnitTargets = [
  target('GCSE','Biology','8461','gcse-biology',['cells-and-microscopy'],'Selected 4.1.1 cell structure, specialisation and microscopy',scienceBacklog),
  target('IGCSE','Biology','0610','igcse-biology',['cells-and-microscopy'],'Selected 2.1 cell structures/functions and 2.2 specimen size',scienceBacklog),
  target('GCSE','Chemistry','8462','gcse-chemistry',['atoms-isotopes-and-ions'],'Selected 4.1.1 particle counts, isotopes and electron arrangements',scienceBacklog),
  target('IGCSE','Chemistry','0620','igcse-chemistry',['atoms-isotopes-and-ions'],'Selected 2.2 atomic structure and 2.3 isotopes',scienceBacklog),
  target('GCSE','Physics','8463','gcse-physics',['current-resistance-circuits'],'Selected 4.2.1 charge/current/resistance and measurements',scienceBacklog),
  target('IGCSE','Physics','0625','igcse-physics',['current-resistance-circuits'],'Selected 4.2.2 current and 4.2.3–4.2.4 measurement/resistance',scienceBacklog),
  target('A_LEVELS','Biology','7402','al-biology',['a-level-membrane-transport'],'3.2.3 membrane transport and practical interpretation',scienceBacklog),
  target('A_LEVELS','Chemistry','7405','al-chemistry',['a-level-amount-substance'],'Selected 3.1.2 amount, solutions, gases, formulae and titration', ['Yield and atom-economy applications','All other physical, inorganic and organic strands',...scienceBacklog.slice(1)]),
  target('A_LEVELS','Physics','7408','al-physics',['a-level-quantum-phenomena'],'3.2.2 photon, spectral and matter-wave explanations',scienceBacklog),
  target('GCSE','History','8145','gcse-history',['germany-weimar-crises'],'AB transition and early Weimar crises, 1918–1923', ['Germany 1890–1918 and 1924–1945','BB inter-war conflict and tension','AA Health and the people','BC Elizabethan England and 2027 Spanish Armada environment','Authentic source sets and full assessment practice']),
  target('IGCSE','History','0470','igcse-history',['versailles-settlement'],'Option B Versailles: aims, terms, consequences and evaluation', ['Authentic Versailles source sets and further detail to 1923','Other five Option B core questions, including June 2027 Soviet-control prescription','Germany depth study 1918–1945','Papers 1, 2 and 4 extended practice']),
  target('A_LEVELS','History','7042','al-history',['a-level-henry-vii-security'],'1C Henry VII: dynastic security, elites and rebellion', ['Henry VII economy, religion, culture and fuller diplomacy','Remaining Tudors 1509–1603','2O Germany 1918–1945','Authentic sources and historical interpretations','Learner-led civil-rights investigation with centre-approved question']),
  target('GCSE','English Literature','8702','gcse-literature',['macbeth-ambition-agency','christmas-carol-change'],'Selected whole-text thematic arguments in Macbeth and A Christmas Carol', ['Further scene/extract study of both whole texts','An Inspector Calls','All 15 Power and Conflict poems and comparison','Unseen poetry analysis/comparison','Extended essays with independent review']),
  target('A_LEVELS','English Literature','7712','al-literature',['a-level-othello-knowledge'],'Othello: testimony, dramatic irony, love and judgement', ['Further Othello scene/whole-text assessment','The Great Gatsby and complete Pre-1900 anthology','The Handmaid’s Tale, A Streetcar Named Desire and Feminine Gospels','Unseen poems and prose','Learner-led Frankenstein/Never Let Me Go study with centre approval']),
  target('GCSE','Computer Science','8525','gcse-computing',['binary-hex-and-shifts'],'3.3.1–3.3.4 selected eight-bit conversions, addition and shifts', ['Further binary arithmetic and information units','Text, image, sound and compression','Algorithms, programming and computational thinking','Systems, networks, security and impacts','Practical programming tasks']),
  target('IGCSE','Computer Science','0478','igcse-computing',['binary-hex-and-shifts'],'1.1 conversions, arithmetic, shifts and two’s complement', ['Further sixteen-bit conversion and signed-number practice','Text, sound, images and compression','Transmission, hardware, software, internet and emerging technologies','Algorithms, programming, databases and logic','Practical programming and full assessment tasks']),
  target('A_LEVELS','Computer Science','7517','al-computing',['a-level-search-complexity'],'4.3.4 linear, binary and binary-tree searching', ['Other algorithms and data structures','Programming paradigms and theory of computation','Representation, systems, architecture, networks and databases','Computing impacts and big data','Learner’s independent programming project']),
  target('GCSE','Geography','8035','gcse-geography',['tectonic-processes-risk'],'Selected 3.1.1.1–3.1.1.2 processes, effects and risk management', ['Required checked named contrasting-wealth tectonic examples','Weather hazards, climate, ecosystems and landscapes','Human geography and resource management','Geographical applications, skills and fieldwork']),
  target('IGCSE','Geography','0460','igcse-geography',['tectonic-processes-risk'],'Selected topic 4 boundary processes, earthquakes and risk', ['Named places and maps, full volcano features/classification and hazard measures','Other physical geography topics','Human geography topics','Integrated geographical skills and selected investigation/coursework route']),
  target('GCSE','Business','8132','gcse-business',['enterprise-objectives-stakeholders'],'Selected 3.1 enterprise, objectives and stakeholder reasoning', ['Ownership, growth, location and planning depth','External influences','Operations, human resources, marketing and finance','Extended applied case assessments']),
  target('IGCSE','Business Studies','0264','igcse-business',['enterprise-objectives-stakeholders'],'Selected 1.1, 1.3.1 and 1.5 enterprise and objectives', ['Economic sectors, growth/size, business organisation','People, marketing and operations','Financial information and decisions','External influences, sustainability and ethical issues','Extended applied cases']),
  target('A_LEVELS','Business','7132','al-business',['a-level-decision-trees'],'3.2.2 decision-tree interpretation, calculation and evaluation', ['Multistage decision-tree practice','Leadership and stakeholder management','Marketing, operations, finance and human resources','Strategic position, direction, methods and change','Full applied assessments for 7132']),
  target('IGCSE','Economics','0455','igcse-economics',['scarcity-production-possibilities'],'Selected 1.1, 1.3 and 1.4 scarcity, opportunity cost and PPC', ['Factor rewards and changes in resource quantity/quality','Markets and resource allocation','Microeconomic decision makers','Macroeconomic policies','Development and international trade/globalisation']),
  target('A_LEVELS','Economics','7136','al-economics',['scarcity-production-possibilities'],'3.1.1.4–3.1.1.5 scarcity and productive/allocative efficiency', ['Individual decisions, markets and elasticities','Production, costs, competition and labour markets','Distribution and market failure','Macroeconomics, policy and international economics','Extended quantitative and evaluative assessments']),
  target('GCSE','English Language','8700','gcse-language',['reading-inference-comparison'],'Reading inference, method, comparison, synthesis and purposeful writing', ['Sustained 19th-, 20th- and 21st-century reading','Creative and transactional writing depth','Spoken-language tasks','Full current-format assessment practice']),
  target('IGCSE','English','0500','igcse-language',['reading-inference-comparison'],'Selected reading/writing skills for candidate First Language route', ['Full-length 2027 reading tasks','Directed writing and composition','Confirm Paper 2 or coursework route for the learner','Speaking/listening if entered','Confirm learner’s actual first/second-language qualification']),
];

// Routes filter questions by their explicit programme/tier labels, never by
// difficulty alone. A-Level-only extension work cannot become IGCSE practice.
const restrictedNoteNumbers = {
  'IGCSE:0610:Core': [1,2,3],
  'IGCSE:0620:Core': [1,2,3],
  'IGCSE:0625:Core': [1,2,4],
  'GCSE:8525:untiered': [1,2,3],
  'IGCSE:0455:untiered': [1,2,3],
};
export function routesForTarget(target, lessons) {
  const tiered = ['Biology','Chemistry','Physics'].includes(target.subject) && target.programme !== 'A_LEVELS';
  const tiers = tiered ? (target.programme === 'GCSE' ? ['Foundation','Higher'] : ['Core','Extended']) : ['untiered'];
  const programme = target.programme === 'A_LEVELS' ? 'A-Level' : target.programme;
  return tiers.map(tier => ({ tier, lessons: target.lessonIds.map(id => {
    const lesson = lessons.find(item => item.id === id);
    if (!lesson) throw new Error(`Missing subject-unit lesson: ${id}`);
    const questions = lesson.questions.filter(q => {
      const label = q.prompt.match(/^\[([^\]]+)\]/)?.[1] ?? '';
      if (tiered) return label.includes(`${programme} ${tier}`) || label.includes(`${programme} ${tier === 'Higher' ? 'Foundation/Higher' : 'Core/Extended'}`);
      if (target.programme === 'A_LEVELS' && target.subject === 'Economics') return label.includes('A-Level') || label.includes('IGCSE');
      return new RegExp(`(?:^|[;/])\\s*${programme}(?:\\s|:|/)`).test(label);
    });
    const noteNumbers = restrictedNoteNumbers[`${target.programme}:${target.qualificationCode}:${tier}`] ?? lesson.notes.map((_,i)=>i+1);
    if (noteNumbers.some(number=>!lesson.notes[number-1])) throw new Error('Invalid programme/tier note reference.');
    return { lessonId: id, noteHeadings: noteNumbers.map(number => lesson.notes[number-1].heading), questionIds: questions.map(q => q.id),
      noteBoundary: 'These sections are selected for this programme/tier. The complete shared lesson also displays explicitly labelled extensions. Economics A-Level uses the IGCSE-labelled prerequisite questions as well as its A-Level questions.' };
  }) }));
}
