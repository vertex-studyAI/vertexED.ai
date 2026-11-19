// This register names the finite UNIT denominator inspected for this authoring
// pass. It never turns those units into a complete COURSE denominator.
const evidence = (lesson, noteNumbers, questionIds) => ({ lessonId: `syllabus-${lesson}`, noteNumbers, questionIds });
const point = (code, criteria, ...teaching) => ({ code, criteria, teaching });

export const unitSources = [
  { id: 'aqa-8300-number-20261021', programme: 'GCSE', board: 'AQA', specification: '8300', subject: 'Mathematics',
    version: 'Live Number section inspected 2026-10-21', checkedOn: '2026-10-21',
    url: 'https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/subject-content/3.1-number',
    locator: '3.1 Number, N1–N16, all three content/tier columns', inspection: 'official-web-section',
    limitation: 'Dated web inspection, not a fixed downloaded edition. Number only; other strands and whole-course assessment coverage remain incomplete.' },
  { id: 'cambridge-0580-number-2025-2027', programme: 'IGCSE', board: 'Cambridge International', specification: '0580', subject: 'Mathematics',
    version: '2025–2027 syllabus, version 3', checkedOn: '2026-10-21',
    url: 'https://www.cambridgeinternational.org/Images/662466-2025-2027-syllabus.pdf',
    locator: 'Printed/PDF pages 12–16 (Core Number) and 32–36 (Extended Number)', inspection: 'extracted-text-and-rendered-selected-pages',
    documentHash: 'sha256:627f8e5dab21605f95b9aceec4a2dcdddf91dce5767d6938d647b38041c6d363',
    limitation: 'Only the named Number pages were reviewed for this unit register, not all 71 pages. Core C1.17/C1.18 are Extended-only notices, not extra Core requirements.' },
  { id: 'aqa-7357-proof-20261021', programme: 'A_LEVELS', board: 'AQA', specification: '7357', subject: 'Mathematics',
    version: 'Live Proof section inspected 2026-10-21', checkedOn: '2026-10-21',
    url: 'https://www.aqa.org.uk/subjects/mathematics/a-level/mathematics-7357/specification/subject-content/a-proof',
    locator: 'A: Proof, A1 including its guidance/examples', inspection: 'official-web-section',
    limitation: 'Proof unit only. Induction is not imported from Further Mathematics. Other content and overarching assessment requirements remain incomplete.' },
];

const gcse = higher => [
  point('N1', ['Order signed integers, decimals and fractions; use equality and inequality notation.'], evidence('signed-arithmetic', [1], ['order','compare'])),
  point('N2', ['Four operations with signed integers, decimals and mixed fractions; written methods and place value.'], evidence('signed-arithmetic', [2,3], ['decimal','division','mixed','signs']), evidence('number-types-factors', [2], ['words'])),
  point('N3', ['Inverse operations, cancellation of factors and operation priority, including brackets, powers, roots and reciprocals.'], evidence('signed-arithmetic', [3,4], ['priority','cancellation','division']), evidence('number-types-factors', [1], ['reciprocal'])),
  point('N4', ['Primes, factors, multiples, HCF, LCM and prime-power factorisation.'], evidence('number-types-factors', [3], ['prime','hcf-lcm'])),
  point('N5', higher ? ['Systematic lists and the product rule for counting, including restrictions.'] : ['Systematic listing without claiming the Higher product-rule requirement.'], evidence('number-types-factors', [4], higher ? ['listing','restricted-count'] : ['listing'])),
  point('N6', higher ? ['Integer powers, associated real roots and estimates of positive roots.'] : ['Integer powers and associated real roots; recall square/cube pairs.'], evidence('powers-indices', higher ? [1,4] : [1], higher ? ['recall','root-equation','fifth-power','estimate-root'] : ['recall','root-equation','fifth-power'])),
  point('N7', higher ? ['Roots and integer and fractional index laws.'] : ['Roots and integer index laws, including negative and zero indices.'], evidence('powers-indices', higher ? [2,3] : [2], higher ? ['integer-laws','negative','fractional','fractional-laws'] : ['integer-laws','negative'])),
  point('N8', higher ? ['Exact fractions, multiples of π, simplified surds and rationalised denominators.'] : ['Exact fractions and multiples of π; surd manipulation is labelled Higher.'], evidence('surds-growth', higher ? [1,2,3] : [1], higher ? ['exact-pi','exact-fraction','simplify-surds','expand-surds','single-rationalise','conjugate'] : ['exact-pi','exact-fraction'])),
  point('N9', ['Normalised standard form, conversion, calculation and display interpretation.'], evidence('standard-form', [1,2,3], ['convert','ordinary','order','multiply','divide','sum','display-units'])),
  point('N10', higher ? ['Terminating and recurring fraction/decimal conversion.'] : ['Terminating fraction/decimal equivalence; recurring algebra is labelled Higher.'], evidence('fractions-decimals-percentages', higher ? [1,3,4] : [1], higher ? ['terminating','recurring-pure','recurring-mixed','fraction-recurring'] : ['terminating','equivalents'])),
  point('N11', ['Interpret fractions in ratio situations, distinguishing part-to-part and part-to-whole.'], evidence('fractions-decimals-percentages', [2], ['part-whole']), evidence('ratio-percent-finance', [1], ['fraction-ratio'])),
  point('N12', ['Use fractions and percentages as operators, including percentages over 100.'], evidence('fractions-decimals-percentages', [2], ['small-percent','operators'])),
  point('N13', ['Standard and compound units, metric length/area/volume conversions and supplied imperial conversions.'], evidence('units-rates', [1,4], ['units','area-volume','imperial','speed'])),
  point('N14', ['Estimate answers and check technological results using magnitude.'], evidence('rounding-bounds', [2], ['estimate']), evidence('standard-form', [3], ['display-units'])),
  point('N15', ['Round decimal places and significant figures; write error intervals for positive rounding and truncation.'], evidence('rounding-bounds', [1,3], ['round','interval','nearest-hundred','truncation','context'])),
  point('N16', higher ? ['Apply limits of accuracy, including upper/lower bounds of calculated results.'] : ['Understand limits of accuracy of reported data; calculated-result propagation remains labelled Higher.'], evidence('rounding-bounds', higher ? [3,4] : [3], higher ? ['interval','perimeter-area','speed-bounds','difference-bounds','guaranteed-rounding'] : ['interval','nearest-hundred'])),
];

const cambridge = extended => {
  const prefix = extended ? 'E1.' : 'C1.';
  const rows = [
    point('1', ['Number types, number words, prime factorisation, HCF/LCM and reciprocals.'], evidence('number-types-factors', [1,2,3], ['classify','words','prime','hcf-lcm','reciprocal','squares-cubes'])),
    point('2', extended ? ['Set notation including membership, subsets and empty set; two- and three-set Venn regions.'] : ['Universal set, complement, cardinality, union/intersection and two-set Venn regions.'], evidence('sets-venn', extended ? [1,2,3,4] : [1,2], extended ? ['list-rule','construct-two','shade-two','two-counts','notation','three-counts','shade-three'] : ['list-rule','construct-two','shade-two','two-counts'])),
    point('3', ['Squares, square roots, cubes, cube roots, other powers and roots; specified recall pairs.'], evidence('powers-indices', [1], ['recall','root-equation','fifth-power'])),
    point('4', extended ? ['Fraction/decimal/percentage equivalence including recurring notation and conversions.'] : ['Proper/improper/mixed fraction, decimal and percentage equivalence; no recurring conversion requirement.'], evidence('fractions-decimals-percentages', extended ? [1,2,3,4] : [1,2], extended ? ['equivalents','small-percent','terminating','recurring-pure','recurring-mixed','fraction-recurring'] : ['equivalents','small-percent','terminating'])),
    point('5', ['Order quantities and use comparison symbols.'], evidence('signed-arithmetic', [1], ['order','compare'])),
    point('6', ['Four operations with signed integers, decimals, improper/mixed fractions and brackets.'], evidence('signed-arithmetic', [2,3,4], ['decimal','division','mixed','signs','priority','cancellation'])),
    point('7', extended ? ['Positive, zero, negative and fractional indices and their laws.'] : ['Positive, zero and negative integer indices and their laws.'], evidence('powers-indices', extended ? [2,3] : [2], extended ? ['integer-laws','negative','fractional','fractional-laws'] : ['integer-laws','negative'])),
    point('8', ['Convert and calculate in standard form.', ...(extended ? [] : ['Core calculations explicitly labelled Paper 3; conversions remain available to Core.'])], evidence('standard-form', [1,2,3], ['convert','ordinary','order','multiply','divide','sum','display-units'])),
    point('9', ['Round to specified accuracy, estimate and choose context-appropriate precision.'], evidence('rounding-bounds', [1,2], ['round','estimate','context'])),
    point('10', extended ? ['Direct measurement bounds and bounds of calculated area, perimeter and speed.'] : ['Direct bounds for rounded data only, not calculated-result bounds.'], evidence('rounding-bounds', extended ? [3,4] : [3], extended ? ['interval','nearest-hundred','perimeter-area','speed-bounds','difference-bounds','guaranteed-rounding'] : ['interval','nearest-hundred'])),
    point('11', ['Simplify and divide ratios; apply recipe, map-scale and best-value proportional reasoning.'], evidence('ratio-percent-finance', [1], ['share','recipe','map-best','fraction-ratio'])),
    point('12', ['Pay, exchange, flow and fuel rates; supplied density, pressure and population-density formulas; speed and average speed.'], evidence('units-rates', [2,3,4], ['pay-exchange','flow-fuel','density-pressure','population','speed','unequal-times','recover-mass'])),
    point('13', extended ? ['Percentage of a quantity, one quantity as a percentage of another, change, simple/compound interest, reverse and repeated changes.'] : ['Percentage operators, comparison, change, simple/compound interest, deposit, discount, profit/loss and earnings.'], evidence('ratio-percent-finance', extended ? [2,3,4] : [2,3], extended ? ['profit','deposit-discount','earnings','interest','reverse','repeated'] : ['profit','deposit-discount','earnings','interest']), evidence('fractions-decimals-percentages', [2], ['operators','part-whole'])),
    point('14', ['Efficient grouped calculator entry, intermediate precision and display interpretation for hours and money.'], evidence('time-money-calculator', [3], ['calculator','display'])),
    point('15', ['Time-unit relationships, 12/24-hour clocks, elapsed time, timetables and stated time-zone offsets.'], evidence('time-money-calculator', [1,2], ['time-units','clock','overnight','timetable','zones'])),
    point('16', ['Money arithmetic and conversion in both currency directions.'], evidence('time-money-calculator', [4], ['balance','exchange']), evidence('units-rates', [2], ['pay-exchange'])),
  ];
  if (extended) rows.push(
    point('17', ['Discrete exponential growth and decay in context; whole-period thresholds, without requiring e.'], evidence('surds-growth', [4], ['growth','decay-threshold','model-limit'])),
    point('18', ['Simplify, operate with and rationalise surds, including binomial denominators.'], evidence('surds-growth', [2,3], ['simplify-surds','expand-surds','single-rationalise','conjugate'])),
  );
  return rows.map(row => ({ ...row, code: `${prefix}${row.code}` }));
};

export const unitCoverage = [
  ...[false, true].map(higher => ({ id: `gcse-8300-number-${higher ? 'higher' : 'foundation'}`, sourceId: unitSources[0].id,
    tier: higher ? 'Higher' : 'Foundation', unit: 'Number', expectedPoints: Array.from({ length: 16 }, (_, i) => `N${i+1}`), points: gcse(higher) })),
  ...[false, true].map(extended => ({ id: `igcse-0580-number-${extended ? 'extended' : 'core'}`, sourceId: unitSources[1].id,
    tier: extended ? 'Extended' : 'Core', unit: 'Number', expectedPoints: Array.from({ length: extended ? 18 : 16 }, (_, i) => `${extended ? 'E' : 'C'}1.${i+1}`), points: cambridge(extended) })),
  { id: 'a-level-7357-proof', sourceId: unitSources[2].id, tier: 'A-Level', unit: 'Proof', expectedPoints: ['A1'],
    points: [point('A1', ['Logical proof structure and deduction.', 'Exhaustion of cases and counterexample disproof.', 'Contradiction including irrationality of √2 and infinitely many primes.', 'Transfer to unfamiliar proof situations.'], evidence('a-level-proof', [1,2,3,4], ['deduction','exhaustion','counterexample','converse','root-two','infinite-primes','unfamiliar','audit-proof','contradiction-transfer']))] },
];

export const courseBacklog = [
  { programme: 'GCSE', specification: '8300', remaining: ['Algebra', 'Ratio, proportion and rates of change beyond the Number cross-links', 'Geometry and measures', 'Probability', 'Statistics', 'Full-course assessment and independent subject/answer review'] },
  { programme: 'IGCSE', specification: '0580', remaining: ['Algebra and graphs', 'Coordinate geometry', 'Geometry', 'Mensuration', 'Trigonometry', 'Transformations and vectors', 'Probability', 'Statistics', 'Full-course assessment and independent subject/answer review'] },
  { programme: 'A_LEVELS', specification: '7357', remaining: ['Algebra and functions', 'Coordinate geometry', 'Sequences and series', 'Trigonometry', 'Exponentials and logarithms', 'Differentiation', 'Integration', 'Numerical methods', 'Vectors', 'Statistical sampling', 'Data presentation and interpretation', 'Probability', 'Statistical distributions', 'Statistical hypothesis testing', 'Quantities and units in mechanics', 'Kinematics', 'Forces and Newton’s laws', 'Moments', 'Overarching themes, data use, assessment and independent review'] },
];
