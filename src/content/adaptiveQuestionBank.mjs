/**
 * Original VertexED practice material.
 *
 * Every item is deterministic and answerable without a model call. Distractors
 * encode a specific misconception so feedback can stay useful when AI is
 * unavailable. The bank deliberately mixes direct, multi-step and synthesis
 * work instead of treating difficulty as a display label.
 */
import { COMPLEX_NUMBERS_PRACTICE } from './complexNumbersPractice.mjs';

export const ADAPTIVE_QUESTION_BANK = [
  ...COMPLEX_NUMBERS_PRACTICE,
  {
    id: 'math-functions-composite-01', subject: 'Mathematics', topic: 'Functions', difficulty: 'foundation', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['composite functions'],
    prompt: 'Let $f(x)=2x-3$ and $g(x)=x^2+1$. Find $f(g(2))$.', answer: { value: 7, tolerance: 0 },
    solution: ['$g(2)=2^2+1=5$.', '$f(5)=2(5)-3=7$.'],
    mistakes: [{ value: 2, category: 'conceptual', subcategory: 'composition_order', evidence: 'This result is consistent with applying the functions in the wrong order.', misconception: '$f(g(x))$ means evaluate $g$ first, then use that result as the input to $f$.', nextStep: 'Write the inner function on a separate line before substituting.' }],
    difficultyReason: 'Direct application of one definition.',
  },
  {
    id: 'math-functions-inverse-01', subject: 'Mathematics', topic: 'Functions', difficulty: 'intermediate', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['inverse functions', 'domain'],
    prompt: 'For $f(x)=\\frac{3x-2}{x+4}$, which expression gives $f^{-1}(x)$?',
    choices: ['$(4x+2)/(3-x)$', '$(4x-2)/(3+x)$', '$(2-4x)/(x-3)$', '$(3x+2)/(4-x)$'], answer: { choice: 0 },
    solution: ['Set $y=(3x-2)/(x+4)$.', '$yx+4y=3x-2$, so $x(y-3)=-(2+4y)$.', '$x=(4y+2)/(3-y)$, then exchange $x$ and $y$.'],
    mistakes: [
      { choice: 1, category: 'algebra', subcategory: 'rearrangement_sign', evidence: 'The numerator and denominator signs were changed inconsistently while isolating $x$.', misconception: 'Moving a term across the equality changes the sign of the whole term.', nextStep: 'Collect every term containing $x$ before dividing.' },
      { choice: 3, category: 'conceptual', subcategory: 'inverse_not_reciprocal', evidence: 'This choice rearranges coefficients without solving for the original input.', misconception: 'An inverse function reverses input and output; it is not formed by swapping isolated coefficients.', nextStep: 'Begin with $y=f(x)$ and solve explicitly for $x$.' },
    ], difficultyReason: 'Requires solving a rational equation and tracking restrictions.',
  },
  {
    id: 'math-logarithms-01', subject: 'Mathematics', topic: 'Logarithms', difficulty: 'intermediate', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['logarithm laws', 'domain restrictions'],
    prompt: 'Solve $\\log_2(x-1)+\\log_2(x-3)=3$.', answer: { value: 5, tolerance: 0 },
    solution: ['$\\log_2((x-1)(x-3))=3$, so $(x-1)(x-3)=8$.', '$x^2-4x-5=0$, giving $x=5$ or $x=-1$.', 'The domain requires $x>3$, so $x=5$.'],
    mistakes: [
      { value: -1, category: 'conceptual', subcategory: 'domain_restriction', evidence: 'This is an algebraic root, but it makes both logarithm arguments negative.', misconception: 'A logarithmic equation must satisfy the original domain after algebraic solving.', nextStep: 'Write the domain restriction before expanding the equation.' },
      { value: 7, category: 'conceptual', subcategory: 'log_sum_rule', evidence: 'This result is consistent with adding logarithm arguments instead of multiplying them.', misconception: '$\\log a+\\log b=\\log(ab)$, not $\\log(a+b)$.', nextStep: 'State the logarithm law symbolically before using it.' },
    ], difficultyReason: 'Combines a logarithm law, quadratic solving and an extraneous-root check.',
  },
  {
    id: 'math-sequences-01', subject: 'Mathematics', topic: 'Sequences and series', difficulty: 'intermediate', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['geometric series'],
    prompt: 'A geometric sequence has $u_2=12$ and $u_5=96$, with positive common ratio. Find the sum of the first six terms.', answer: { value: 378, tolerance: 0 },
    solution: ['$ar=12$ and $ar^4=96$, so $r^3=8$ and $r=2$.', '$a=6$.', '$S_6=6(2^6-1)/(2-1)=378$.'],
    mistakes: [
      { value: 252, category: 'execution', subcategory: 'term_count', evidence: 'This is the sum only through $u_5$, so one term has been omitted.', misconception: 'The first six terms include indices 1 through 6.', nextStep: 'List the final index or write the finite-series formula with $n=6$ before calculating.' },
      { value: 186, category: 'formula', subcategory: 'geometric_sum_formula', evidence: 'The ratio and first term appear plausible, but the finite-series expression is not applied consistently.', misconception: 'For $r\\ne1$, $S_n=a(r^n-1)/(r-1)$.', nextStep: 'Substitute $a$, $r$ and $n$ into a labelled formula first.' },
    ], difficultyReason: 'Requires recovering two parameters before applying the sum formula.',
  },
  {
    id: 'math-vectors-01', subject: 'Mathematics', topic: 'Vectors', difficulty: 'advanced', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['dot product', 'projection'],
    prompt: 'Let $\\mathbf a=(2,-1,2)$ and $\\mathbf b=(1,2,2)$. Find the scalar projection of $\\mathbf a$ onto $\\mathbf b$.', answer: { value: 4/3, tolerance: 0.005 },
    solution: ['$\\mathbf a\\cdot\\mathbf b=2-2+4=4$.', '$|\\mathbf b|=\\sqrt{1+4+4}=3$.', 'The scalar projection is $(\\mathbf a\\cdot\\mathbf b)/|\\mathbf b|=4/3$.'],
    mistakes: [
      { value: 4/9, tolerance: 0.005, category: 'formula', subcategory: 'projection_denominator', evidence: 'The dot product is correct, but the squared magnitude was used for a scalar projection.', misconception: 'A scalar projection divides by $|\\mathbf b|$; the vector projection divides by $|\\mathbf b|^2$ and then multiplies by $\\mathbf b$.', nextStep: 'Identify whether the requested result is a scalar or a vector before choosing the formula.' },
      { value: 4, category: 'formula', subcategory: 'unnormalized_projection', evidence: 'This is the dot product, before normalising by the length of the target vector.', misconception: 'The dot product measures aligned magnitude scaled by both vector lengths.', nextStep: 'Divide the dot product by $|\\mathbf b|$.' },
    ], difficultyReason: 'Requires distinguishing scalar projection from dot and vector projection.',
  },
  {
    id: 'math-probability-bayes-01', subject: 'Mathematics', topic: 'Probability', difficulty: 'advanced', type: 'numeric',
    curriculum: ['IB DP', 'AP'], concepts: ['conditional probability', 'Bayes theorem'],
    prompt: 'A test has sensitivity $0.92$ and specificity $0.95$. A condition affects $2\\%$ of a population. Given a positive result, find the probability that the person has the condition. Give a decimal to three significant figures.', answer: { value: 0.273, tolerance: 0.002 },
    solution: ['$P(+)=0.92(0.02)+0.05(0.98)=0.0674$.', '$P(D\\mid +)=0.92(0.02)/0.0674\\approx0.273$.'],
    mistakes: [
      { value: 0.92, tolerance: 0.002, category: 'conceptual', subcategory: 'base_rate_neglect', evidence: 'This is the sensitivity, not the probability of the condition after a positive result.', misconception: 'Reversing a conditional probability requires accounting for prevalence and false positives.', nextStep: 'Build a 10,000-person frequency table and count true and false positives.' },
      { value: 0.368, tolerance: 0.005, category: 'conceptual', subcategory: 'specificity_complement', evidence: 'The false-positive contribution appears to use specificity rather than $1-\\text{specificity}$.', misconception: 'Specificity is $P(-\\mid \\neg D)$, so the false-positive rate is its complement.', nextStep: 'Label each conditional probability before multiplying by its group prevalence.' },
    ], difficultyReason: 'Requires reversing a conditional probability and resisting base-rate neglect.',
  },
  {
    id: 'math-complex-01', subject: 'Mathematics', topic: 'Complex numbers', difficulty: 'advanced', type: 'multiple-choice',
    curriculum: ['IB DP', 'A Level'], concepts: ['polar form', 'De Moivre theorem'],
    prompt: 'Which set contains all solutions of $z^3=-8i$?',
    choices: [
      '$2\\operatorname{cis}(-\\pi/6+2k\\pi/3),\\ k=0,1,2$',
      '$2\\operatorname{cis}(-\\pi/2+2k\\pi/3),\\ k=0,1,2$',
      '$8\\operatorname{cis}(-\\pi/6+2k\\pi/3),\\ k=0,1,2$',
      '$2\\operatorname{cis}(\\pi/6+2k\\pi),\\ k=0,1,2$',
    ], answer: { choice: 0 },
    solution: ['$-8i=8\\operatorname{cis}(-\\pi/2)$.', 'Cube roots have modulus $2$ and arguments $(-\\pi/2+2k\\pi)/3=-\\pi/6+2k\\pi/3$.'],
    mistakes: [
      { choice: 1, category: 'formula', subcategory: 'argument_not_divided', evidence: 'The modulus was rooted, but the argument was not divided by three.', misconception: 'Taking an $n$th root divides the argument after adding $2k\\pi$.', nextStep: 'Write $(\\theta+2k\\pi)/n$ before substituting values.' },
      { choice: 2, category: 'formula', subcategory: 'modulus_not_rooted', evidence: 'The original modulus was retained instead of taking its cube root.', misconception: 'If $z^n$ has modulus $r$, then $z$ has modulus $r^{1/n}$.', nextStep: 'Separate modulus and argument into two explicit calculations.' },
    ], difficultyReason: 'Requires synthesising polar representation, roots and the complete argument family.',
  },
  {
    id: 'math-limits-01', subject: 'Mathematics', topic: 'Limits', difficulty: 'advanced', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['limits', 'rationalisation'],
    prompt: 'Evaluate $\\displaystyle\\lim_{x\\to0}\\frac{\\sqrt{1+3x}-1}{x}$.', answer: { value: 1.5, tolerance: 0.001 },
    solution: ['Multiply by the conjugate.', 'The expression becomes $3/(\\sqrt{1+3x}+1)$.', 'Substituting $x=0$ gives $3/2$.'],
    mistakes: [
      { value: 0, category: 'conceptual', subcategory: 'indeterminate_substitution', evidence: 'Direct substitution gives $0/0$, which is indeterminate rather than equal to zero.', misconception: '$0/0$ signals that the expression must be transformed or analysed further.', nextStep: 'Rationalise the numerator before substituting.' },
      { value: 3, category: 'execution', subcategory: 'conjugate_denominator', evidence: 'The factor from the conjugate denominator appears to have been omitted.', misconception: 'After rationalising, the denominator tends to $1+1=2$.', nextStep: 'Keep the full conjugate denominator through the limit.' },
    ], difficultyReason: 'Requires recognising an indeterminate form and choosing a useful transformation.',
  },
  {
    id: 'math-differentiation-01', subject: 'Mathematics', topic: 'Differentiation', difficulty: 'advanced', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['implicit differentiation', 'tangent slope'],
    prompt: 'For $x^2+xy+y^2=7$, find $dy/dx$ at $(1,2)$.',
    choices: ['$-4/5$', '$-5/4$', '$4/5$', '$-1$'], answer: { choice: 0 },
    solution: ['$2x+x\\,y\\prime+y+2y\\,y\\prime=0$.', '$y\\prime(x+2y)=-(2x+y)$.', 'At $(1,2)$, $y\\prime=-4/5$.'],
    mistakes: [
      { choice: 1, category: 'algebra', subcategory: 'implicit_isolation', evidence: 'The numerator and denominator from isolating $y\\prime$ appear to have been inverted.', misconception: 'Terms multiplying $y\\prime$ form the denominator after factoring.', nextStep: 'Factor $y\\prime$ before dividing.' },
      { choice: 2, category: 'execution', subcategory: 'sign_error', evidence: 'The magnitude is correct, but the negative sign from moving terms across the equation is missing.', misconception: 'The non-$y\\prime$ terms move to the opposite side as a group.', nextStep: 'Keep the leading negative sign outside the numerator until substitution.' },
    ], difficultyReason: 'Combines product-rule differentiation, implicit isolation and point evaluation.',
  },
  {
    id: 'math-integration-01', subject: 'Mathematics', topic: 'Integration', difficulty: 'very-hard', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['integration by parts', 'definite integrals'],
    prompt: 'Evaluate $\\displaystyle\\int_0^1 x e^{2x}\\,dx$. Give a decimal to three significant figures.', answer: { value: 2.097, tolerance: 0.003 },
    solution: ['Use integration by parts with $u=x$ and $dv=e^{2x}dx$.', '$\\int xe^{2x}dx=xe^{2x}/2-e^{2x}/4+C$.', 'From $0$ to $1$, the value is $e^2/4+1/4\\approx2.097$.'],
    mistakes: [
      { value: 1.048, tolerance: 0.003, category: 'formula', subcategory: 'integration_by_parts_factor', evidence: 'This is half the correct value, consistent with applying the inner derivative factor twice.', misconception: 'Once $v=e^{2x}/2$ is found, integration by parts introduces only the factors already present in $v$.', nextStep: 'Differentiate your antiderivative before evaluating the bounds.' },
      { value: 1.847, tolerance: 0.005, category: 'execution', subcategory: 'lower_bound', evidence: 'The upper-bound expression is plausible, but the nonzero lower-bound contribution was not subtracted correctly.', misconception: 'At $x=0$, the antiderivative equals $-1/4$, not zero.', nextStep: 'Write $F(1)-F(0)$ on separate lines.' },
    ], difficultyReason: 'Requires method selection, coefficient control and a nonzero lower-bound term.',
  },
  {
    id: 'math-differential-equations-01', subject: 'Mathematics', topic: 'Differential equations', difficulty: 'very-hard', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['separable equations', 'initial conditions'],
    prompt: 'Solve $dy/dx=3x^2(1+y)$ with $y(0)=1$.',
    choices: ['$y=2e^{x^3}-1$', '$y=e^{x^3}+1$', '$y=2e^{3x^3}-1$', '$y=2x^3+1$'], answer: { choice: 0 },
    solution: ['$dy/(1+y)=3x^2dx$.', '$\\ln|1+y|=x^3+C$, hence $1+y=Ae^{x^3}$.', '$y(0)=1$ gives $A=2$.'],
    mistakes: [
      { choice: 1, category: 'execution', subcategory: 'initial_condition', evidence: 'The separated solution form is close, but the multiplicative constant does not satisfy $y(0)=1$.', misconception: 'After exponentiating, the integration constant becomes a multiplicative constant.', nextStep: 'Substitute the initial condition into the unsimplified general solution.' },
      { choice: 2, category: 'integration', subcategory: 'power_rule_coefficient', evidence: 'The exponent treats $\\int3x^2dx$ as $3x^3$.', misconception: '$\\int3x^2dx=x^3+C$ because the power-rule denominator cancels the coefficient.', nextStep: 'Differentiate the exponent to check it returns $3x^2$.' },
    ], difficultyReason: 'Requires separation, exponentiation and careful use of an initial condition.',
  },
  {
    id: 'physics-forces-01', subject: 'Physics', topic: 'Forces', difficulty: 'foundation', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['Newton second law'], units: 'm/s²',
    prompt: 'A net horizontal force of $18\\,\\text{N}$ acts on a $6.0\\,\\text{kg}$ trolley. Find its acceleration.', answer: { value: 3, tolerance: 0.001 },
    solution: ['$F_{net}=ma$.', '$a=18/6.0=3.0\\,\\text{m s}^{-2}$.'],
    mistakes: [{ value: 108, category: 'formula', subcategory: 'equation_rearrangement', evidence: 'The force and mass were multiplied instead of dividing by mass.', misconception: 'From $F=ma$, acceleration is $F/m$.', nextStep: 'Check dimensions: newtons divided by kilograms gives metres per second squared.' }],
    difficultyReason: 'Direct application of a single physical model.',
  },
  {
    id: 'physics-friction-01', subject: 'Physics', topic: 'Forces', difficulty: 'intermediate', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['free-body diagrams', 'friction'], units: 'm/s²',
    prompt: 'A $5.0\\,\\text{kg}$ block is pulled right by $22\\,\\text{N}$ on a horizontal surface. Kinetic friction is $7.0\\,\\text{N}$. Find the acceleration, taking right as positive.', answer: { value: 3, tolerance: 0.001 },
    solution: ['Friction opposes the motion, so $F_{net}=22-7=15\\,\\text{N}$.', '$a=15/5.0=3.0\\,\\text{m s}^{-2}$.'],
    mistakes: [
      { value: 5.8, tolerance: 0.01, category: 'physical_model', subcategory: 'friction_direction', evidence: 'This result comes from adding friction to the applied force.', misconception: 'Kinetic friction opposes relative sliding, so its signed contribution is negative here.', nextStep: 'Draw a horizontal force arrow diagram before writing the resultant.' },
      { value: 15, category: 'execution', subcategory: 'force_not_acceleration', evidence: 'This is the net force in newtons, not the acceleration.', misconception: 'A force result still has to be divided by mass to obtain acceleration.', nextStep: 'Write units beside each intermediate result.' },
    ], difficultyReason: 'Requires choosing the force direction before applying Newton second law.',
  },
  {
    id: 'physics-energy-01', subject: 'Physics', topic: 'Energy', difficulty: 'intermediate', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['energy conservation', 'efficiency'], units: 'm/s',
    prompt: 'A $0.50\\,\\text{kg}$ cart starts from rest. A motor transfers $40\\,\\text{J}$, of which $80\\%$ becomes kinetic energy. Find the final speed.', answer: { value: 11.314, tolerance: 0.02 },
    solution: ['$E_k=0.80(40)=32\\,\\text{J}$.', '$\\tfrac12mv^2=32$, so $v=\\sqrt{64/0.50}=\\sqrt{128}\\approx11.3\\,\\text{m s}^{-1}$.'],
    mistakes: [
      { value: 8, tolerance: 0.02, category: 'formula', subcategory: 'kinetic_energy_square_root', evidence: 'The energy and efficiency were combined, but the square root needed to solve for speed is missing.', misconception: 'Kinetic energy depends on $v^2$, so solving for $v$ requires a square root.', nextStep: 'Isolate $v^2$ first, then take the positive square root.' },
      { value: 12.649, tolerance: 0.02, category: 'physical_model', subcategory: 'efficiency_ignored', evidence: 'This value treats all motor energy as kinetic energy.', misconception: 'Only the stated useful fraction contributes to the cart kinetic energy.', nextStep: 'Calculate useful energy before applying the kinetic-energy equation.' },
    ], difficultyReason: 'Combines efficiency with conservation of energy and a nonlinear solve.',
  },
  {
    id: 'physics-momentum-01', subject: 'Physics', topic: 'Momentum', difficulty: 'advanced', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['momentum conservation', 'inelastic collision'], units: 'm/s',
    prompt: 'A $0.20\\,\\text{kg}$ puck moving east at $6.0\\,\\text{m s}^{-1}$ sticks to a $0.30\\,\\text{kg}$ puck moving west at $2.0\\,\\text{m s}^{-1}$. Find their common velocity, taking east as positive.', answer: { value: 1.2, tolerance: 0.001 },
    solution: ['$p_i=0.20(6.0)+0.30(-2.0)=0.60\\,\\text{kg m s}^{-1}$.', '$v=0.60/(0.50)=1.2\\,\\text{m s}^{-1}$ east.'],
    mistakes: [
      { value: 3.6, category: 'physical_model', subcategory: 'momentum_direction', evidence: 'The westward momentum was treated as positive.', misconception: 'Velocity and momentum are signed quantities in one-dimensional collisions.', nextStep: 'Choose a positive direction and attach signs before multiplying.' },
      { value: 0.6, category: 'execution', subcategory: 'momentum_not_velocity', evidence: 'This is the total momentum, before division by the combined mass.', misconception: 'Momentum and velocity have different units; $v=p/m$.', nextStep: 'Check the requested unit before stopping.' },
    ], difficultyReason: 'Requires signed momentum and a changed system mass after sticking.',
  },
  {
    id: 'physics-circular-01', subject: 'Physics', topic: 'Circular motion', difficulty: 'advanced', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['circular motion', 'normal force'], units: 'N',
    prompt: 'A $600\\,\\text{kg}$ car passes over the top of a circular hill of radius $40\\,\\text{m}$ at $12\\,\\text{m s}^{-1}$. Using $g=9.8\\,\\text{m s}^{-2}$, find the normal force on the car.', answer: { value: 3720, tolerance: 2 },
    solution: ['At the top, inward is downward, so $mg-N=mv^2/r$.', '$N=mg-mv^2/r=5880-2160=3720\\,\\text{N}$.'],
    mistakes: [
      { value: 8040, tolerance: 2, category: 'physical_model', subcategory: 'centripetal_force_as_extra_force', evidence: 'This value adds $mv^2/r$ to weight as though centripetal force were a separate interaction.', misconception: 'Centripetal force is the net inward force supplied by real forces; here it equals $mg-N$.', nextStep: 'Draw only real forces, then resolve them in the inward direction.' },
      { value: 2160, tolerance: 2, category: 'physical_model', subcategory: 'net_force_vs_component', evidence: 'This is the required inward net force, not the normal force.', misconception: 'The normal force is one contributor to the radial resultant.', nextStep: 'Write the radial force balance before substituting.' },
    ], difficultyReason: 'Requires selecting an inward direction and distinguishing a resultant from an individual force.',
  },
  {
    id: 'physics-circuits-01', subject: 'Physics', topic: 'Circuits', difficulty: 'advanced', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['internal resistance', 'terminal voltage'], units: 'V',
    prompt: 'A cell has emf $12.0\\,\\text{V}$ and internal resistance $0.50\\,\\Omega$. It is connected to a $5.5\\,\\Omega$ resistor. Find the terminal potential difference.', answer: { value: 11, tolerance: 0.01 },
    solution: ['$I=\\varepsilon/(R+r)=12.0/6.0=2.0\\,\\text{A}$.', '$V=IR=2.0(5.5)=11.0\\,\\text{V}$, equivalently $\\varepsilon-Ir$.'],
    mistakes: [
      { value: 12, category: 'physical_model', subcategory: 'internal_resistance_ignored', evidence: 'This gives the emf as though there were no voltage drop inside the cell.', misconception: 'When current flows, terminal voltage is below emf by $Ir$.', nextStep: 'Include internal resistance in the total circuit resistance.' },
      { value: 22, category: 'formula', subcategory: 'ohms_law_rearrangement', evidence: 'The current appears to have been found by multiplying rather than dividing voltage by resistance.', misconception: 'Ohm law gives $I=V/R$.', nextStep: 'Check units: volts divided by ohms gives amperes.' },
    ], difficultyReason: 'Requires modelling the source and load as one series circuit, then distinguishing emf from terminal voltage.',
  },
  {
    id: 'physics-fields-01', subject: 'Physics', topic: 'Electric fields', difficulty: 'very-hard', type: 'numeric',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['electric potential', 'energy conservation'], units: 'm/s',
    prompt: 'An electron starts from rest and moves through a potential difference of $250\\,\\text{V}$. Using $e=1.60\\times10^{-19}\\,\\text{C}$ and $m_e=9.11\\times10^{-31}\\,\\text{kg}$, find its speed. Give three significant figures.', answer: { value: 9.37e6, tolerance: 3e4 },
    solution: ['$eV=\\tfrac12m_ev^2$.', '$v=\\sqrt{2eV/m_e}\\approx9.37\\times10^6\\,\\text{m s}^{-1}$.'],
    mistakes: [
      { value: 4.4e13, tolerance: 1e12, category: 'formula', subcategory: 'energy_square_root', evidence: 'The energy-to-speed conversion was performed without the square root.', misconception: 'Electric potential energy becomes kinetic energy proportional to $v^2$.', nextStep: 'Isolate $v^2$ and inspect the dimensions before calculating.' },
      { value: -9.37e6, tolerance: 3e4, category: 'conceptual', subcategory: 'speed_vs_velocity', evidence: 'The magnitude is correct, but speed cannot be negative.', misconception: 'The electron charge affects direction; the requested speed is a nonnegative magnitude.', nextStep: 'Separate the direction question from the energy-based speed calculation.' },
    ], difficultyReason: 'Combines field energy, scientific notation and electron charge interpretation.',
  },
  {
    id: 'physics-waves-01', subject: 'Physics', topic: 'Waves', difficulty: 'very-hard', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP', 'A Level'], concepts: ['standing waves', 'boundary conditions'],
    prompt: 'A pipe is closed at one end and has length $0.85\\,\\text{m}$. Take the sound speed as $340\\,\\text{m s}^{-1}$. Which pair gives its fundamental frequency and next allowed resonance?',
    choices: ['$100\\,\\text{Hz}$ and $300\\,\\text{Hz}$', '$200\\,\\text{Hz}$ and $400\\,\\text{Hz}$', '$100\\,\\text{Hz}$ and $200\\,\\text{Hz}$', '$200\\,\\text{Hz}$ and $600\\,\\text{Hz}$'], answer: { choice: 0 },
    solution: ['For a closed-open pipe, $f_1=v/(4L)=340/(3.4)=100\\,\\text{Hz}$.', 'Only odd harmonics occur, so the next resonance is $3f_1=300\\,\\text{Hz}$.'],
    mistakes: [
      { choice: 1, category: 'physical_model', subcategory: 'boundary_condition', evidence: 'This uses the open-open fundamental $v/(2L)$.', misconception: 'A closed-open pipe supports a node at one end and antinode at the other, so its fundamental wavelength is $4L$.', nextStep: 'Sketch the first standing-wave pattern before choosing a formula.' },
      { choice: 2, category: 'conceptual', subcategory: 'allowed_harmonics', evidence: 'The fundamental is correct, but the next resonance was treated as the second harmonic.', misconception: 'Closed-open pipes support odd harmonics only.', nextStep: 'List the allowed multipliers $1,3,5,\\ldots$.' },
    ], difficultyReason: 'Requires applying boundary conditions and the allowed harmonic sequence together.',
  },
  {
    id: 'cs-complexity-01', subject: 'Computer Science', topic: 'Complexity', difficulty: 'foundation', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP'], concepts: ['asymptotic complexity'],
    prompt: 'A loop halves a positive integer $n$ until it reaches $1$. How many iterations does it take asymptotically?',
    choices: ['$O(1)$', '$O(\\log n)$', '$O(n)$', '$O(n\\log n)$'], answer: { choice: 1 },
    solution: ['After $k$ iterations the value is approximately $n/2^k$.', 'Setting $n/2^k=1$ gives $k=\\log_2n$.'],
    mistakes: [{ choice: 2, category: 'conceptual', subcategory: 'complexity_rate', evidence: 'Linear time would correspond to removing a fixed amount each iteration, not halving.', misconception: 'Repeated division shrinks the problem exponentially, producing logarithmic iteration count.', nextStep: 'Write the input size after $k$ iterations.' }],
    difficultyReason: 'Direct recognition of logarithmic shrinkage.',
  },
  {
    id: 'cs-recursion-01', subject: 'Computer Science', topic: 'Recursion', difficulty: 'intermediate', type: 'numeric',
    curriculum: ['IB DP', 'AP'], concepts: ['recursion', 'call trees'],
    prompt: 'Consider `f(n) = 1` for $n\\le1$, otherwise `f(n)=f(n-1)+f(n-2)`. How many total function calls are made when evaluating `f(5)` without memoisation, counting the initial call?', answer: { value: 15, tolerance: 0 },
    solution: ['Let $C(n)=1$ for $n\\le1$.', 'For $n>1$, $C(n)=1+C(n-1)+C(n-2)$.', '$C(2)=3$, $C(3)=5$, $C(4)=9$, $C(5)=15$.'],
    mistakes: [
      { value: 8, category: 'conceptual', subcategory: 'values_vs_calls', evidence: 'This is related to a Fibonacci value, not the number of nodes in the call tree.', misconception: 'Counting calls includes repeated subproblems and base-case calls.', nextStep: 'Draw the call tree and count every node.' },
      { value: 9, category: 'execution', subcategory: 'recursion_depth_partial', evidence: 'This is the call count for `f(4)`.', misconception: 'The initial `f(5)` expands into both `f(4)` and `f(3)` subtrees.', nextStep: 'Use a separate call-count recurrence.' },
    ], difficultyReason: 'Requires modelling execution rather than only computing the returned value.',
  },
  {
    id: 'cs-data-structures-01', subject: 'Computer Science', topic: 'Data structures', difficulty: 'intermediate', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP'], concepts: ['hash tables', 'trees'],
    prompt: 'You need expected $O(1)$ lookup by unique student ID, and ordering is irrelevant. Which structure is the best default choice?',
    choices: ['Unsorted array', 'Linked list', 'Hash table', 'Binary heap'], answer: { choice: 2 },
    solution: ['A hash table maps each unique key to a bucket and provides expected constant-time lookup with a suitable hash and load factor.'],
    mistakes: [
      { choice: 0, category: 'algorithm_design', subcategory: 'lookup_structure', evidence: 'An unsorted array requires a linear scan for an arbitrary ID.', misconception: 'Contiguous storage does not by itself provide key-based constant-time lookup.', nextStep: 'Match the dominant operation to the structure guarantee.' },
      { choice: 3, category: 'algorithm_design', subcategory: 'priority_vs_lookup', evidence: 'A heap supports fast access to an extreme-priority item, not arbitrary key lookup.', misconception: 'Heap order is partial and optimised for min/max removal.', nextStep: 'State whether the task is lookup, ordering, priority or traversal.' },
    ], difficultyReason: 'Requires selecting a structure from the required operation and guarantee.',
  },
  {
    id: 'cs-graphs-01', subject: 'Computer Science', topic: 'Graphs', difficulty: 'advanced', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP'], concepts: ['shortest paths', 'graph algorithms'],
    prompt: 'A directed graph has nonnegative edge weights. You need shortest distances from one source to every vertex. Which algorithm and key invariant are appropriate?',
    choices: [
      'Dijkstra; when a minimum-distance unsettled vertex is removed, its distance is final',
      'Depth-first search; the first discovered path is shortest',
      'Kruskal; accepted edges give source distances',
      'Bellman-Ford; every edge must be relaxed exactly once',
    ], answer: { choice: 0 },
    solution: ['Nonnegative weights make Dijkstra valid.', 'Extracting the least tentative-distance unsettled vertex finalises it because no later nonnegative path can improve it.'],
    mistakes: [
      { choice: 1, category: 'algorithm_design', subcategory: 'weighted_shortest_path', evidence: 'Depth-first discovery order does not minimise weighted path cost.', misconception: 'Traversal order is not a shortest-path guarantee in a weighted graph.', nextStep: 'Separate reachability algorithms from weighted optimisation algorithms.' },
      { choice: 2, category: 'algorithm_design', subcategory: 'mst_vs_shortest_path', evidence: 'Kruskal builds a minimum spanning forest and does not preserve source-to-vertex shortest paths.', misconception: 'Minimising total tree weight is different from minimising every distance from a source.', nextStep: 'Write the objective function each algorithm optimises.' },
      { choice: 3, category: 'algorithm_design', subcategory: 'relaxation_count', evidence: 'Bellman-Ford may apply, but one relaxation pass is insufficient in general.', misconception: 'Shortest paths can contain multiple edges, so improvements must propagate through repeated passes.', nextStep: 'Relate the maximum simple-path edge count to the number of relaxation rounds.' },
    ], difficultyReason: 'Requires choosing an algorithm and explaining the correctness condition, not recognising a name alone.',
  },
  {
    id: 'cs-debugging-01', subject: 'Computer Science', topic: 'Debugging', difficulty: 'advanced', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP'], concepts: ['loop invariants', 'binary search'],
    prompt: 'Binary search uses inclusive bounds `lo` and `hi`. The loop is `while (lo <= hi)`, with `mid = floor((lo+hi)/2)`. If `a[mid] < target`, which update preserves correctness and progress?',
    choices: ['`lo = mid`', '`lo = mid + 1`', '`hi = mid + 1`', '`hi = mid`'], answer: { choice: 1 },
    solution: ['The value at `mid` is known to be too small, so it cannot remain in the candidate interval.', 'Setting `lo = mid + 1` removes it and strictly shrinks the interval.'],
    mistakes: [
      { choice: 0, category: 'execution', subcategory: 'off_by_one_nontermination', evidence: 'When `lo == mid`, this update leaves the interval unchanged and can loop forever.', misconception: 'Inclusive bounds require removing the tested index after it is ruled out.', nextStep: 'Test the update on a two-element interval.' },
      { choice: 3, category: 'conceptual', subcategory: 'comparison_direction', evidence: 'This moves the upper bound even though the target must be to the right.', misconception: 'The comparison determines which half can still contain the target.', nextStep: 'Write the remaining candidate inequality before updating a bound.' },
    ], difficultyReason: 'Requires preserving both the search invariant and termination on edge cases.',
  },
  {
    id: 'cs-dynamic-programming-01', subject: 'Computer Science', topic: 'Algorithm design', difficulty: 'very-hard', type: 'multiple-choice',
    curriculum: ['IB DP', 'AP'], concepts: ['dynamic programming', 'state design'],
    prompt: 'For 0/1 knapsack with item weights $w_i$, values $v_i$ and capacity $W$, which state and transition correctly model the optimum using the first $i$ items?',
    choices: [
      '$dp[i][c]=\\max(dp[i-1][c],\\ dp[i-1][c-w_i]+v_i)$ when $w_i\\le c$',
      '$dp[i][c]=dp[i][c-w_i]+v_i$ for every item',
      '$dp[i][c]=\\max(dp[i-1][c],\\ dp[i][c-w_i]+v_i)$',
      '$dp[i][c]=\\min(dp[i-1][c],\\ dp[i-1][c-w_i]+v_i)$',
    ], answer: { choice: 0 },
    solution: ['Either item $i$ is excluded, leaving $dp[i-1][c]$, or included once, adding $v_i$ to a state using only earlier items.', 'Using row $i-1$ in the include branch enforces the 0/1 constraint.'],
    mistakes: [
      { choice: 1, category: 'algorithm_design', subcategory: 'missing_choice', evidence: 'This forces inclusion and does not compare against excluding the item.', misconception: 'An optimum recurrence must represent every valid final decision.', nextStep: 'Partition solutions by whether the final item is included.' },
      { choice: 2, category: 'algorithm_design', subcategory: 'unbounded_reuse', evidence: 'The include branch reads the current row, allowing the same item to be reused.', misconception: '0/1 knapsack permits each item at most once.', nextStep: 'Use the previous-item row in both branches.' },
      { choice: 3, category: 'algorithm_design', subcategory: 'objective_direction', evidence: 'The recurrence minimises value even though the objective is maximum value.', misconception: 'The aggregation operator must match the optimisation objective.', nextStep: 'State the objective in words before writing the recurrence.' },
    ], difficultyReason: 'Requires defining a state, decomposing the final decision and enforcing the 0/1 constraint.',
  },
];

export const PRACTICE_SUBJECTS = [...new Set(ADAPTIVE_QUESTION_BANK.map((question) => question.subject))];
export const PRACTICE_DIFFICULTIES = ['foundation', 'intermediate', 'advanced', 'very-hard'];
export const PRACTICE_TYPES = ['multiple-choice', 'numeric'];
