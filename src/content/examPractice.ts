export type ExamDrill = {
  id: string; programme: 'IB MYP' | 'IB DP' | 'AP'; subject: string; topic: string;
  focus: string; minutes: number; prompt: string; checks: string[]; solution: string;
  transfer: string; source: string;
};

// Original editorial exercises, not past-paper extracts or official mark schemes.
export const EXAM_DRILLS: ExamDrill[] = [
  { id: 'myp-chem-collisions', programme: 'IB MYP', subject: 'Chemistry', topic: 'Reaction rates', focus: 'Criterion A practice: explain a mechanism', minutes: 4,
    prompt: 'Equal masses of magnesium react with equal volumes and concentrations of acid at 20 °C and 35 °C. Explain why the warmer reaction initially produces gas faster. Give a connected explanation, not a list of keywords.',
    checks: ['Link temperature to particle kinetic energy.', 'Explain that a greater fraction of collisions exceeds activation energy.', 'Connect more successful collisions per second to a higher reaction rate.', 'Do not claim that heating lowers activation energy.'],
    solution: 'At the higher temperature, particles have greater average kinetic energy. A greater fraction of collisions has enough energy to react. Together with more frequent collisions, this increases successful collisions per second, producing gas faster. The activation energy of the same reaction is unchanged.',
    transfer: 'Now explain why a catalyst increases rate without raising temperature.', source: 'https://openstax.org/books/chemistry-2e/pages/12-5-collision-theory' },
  { id: 'myp-chem-design', programme: 'IB MYP', subject: 'Chemistry', topic: 'Reaction rates', focus: 'Criterion B practice: design a fair test', minutes: 6,
    prompt: 'Design a school-laboratory investigation into how marble chip size affects the rate of reaction with dilute acid. State the independent variable, a measurable dependent variable, two controls and how you would improve reliability. Include a safety precaution. Follow teacher supervision, not this prompt as a practical protocol.',
    checks: ['Define chip-size categories or a measurable size range.', 'Measure gas volume at fixed time intervals.', 'Keep marble mass and acid concentration and volume constant.', 'Repeat each condition and compare results.', 'Use eye protection and a gas-collection arrangement that cannot dangerously pressurise.'],
    solution: 'Compare equal masses of differently sized marble chips with the same volume and concentration of dilute acid. Record gas volume against time using suitable school equipment. Repeat each condition and compare initial slopes, checking anomalies before averaging. Wear eye protection and follow the teacher-approved risk assessment.',
    transfer: 'Explain why comparing different masses would make the conclusion less secure.', source: 'https://ibo.org/programmes/middle-years-programme/curriculum/science/' },
  { id: 'myp-chem-data', programme: 'IB MYP', subject: 'Chemistry', topic: 'Reaction rates', focus: 'Criterion C practice: interpret evidence', minutes: 5,
    prompt: 'A reaction produces 0, 18, 30 and 36 cm³ of gas at 0, 10, 20 and 30 seconds. Calculate its average rate over the first 10 seconds and final 10 seconds. Explain the change and one limitation of using only these readings.',
    checks: ['First interval: 1.8 cm³/s.', 'Final interval: 0.6 cm³/s.', 'Explain a plausible decrease in reactant concentration as reactants are used.', 'Distinguish an interval average from an instantaneous rate.'],
    solution: 'The first rate is (18 − 0)/10 = 1.8 cm³/s. The final rate is (36 − 30)/10 = 0.6 cm³/s. The slowing is consistent with reactants being used up. These are interval averages; more frequent readings are needed to describe the changing rate more precisely. The data alone does not establish a unique reaction mechanism.',
    transfer: 'Calculate the mean rate over all 30 seconds, then explain why it hides the early change.', source: 'https://openstax.org/books/chemistry-2e/pages/12-1-chemical-reaction-rates' },
  { id: 'myp-chem-impact', programme: 'IB MYP', subject: 'Chemistry', topic: 'Environmental chemistry', focus: 'Criterion D practice: weigh an application', minutes: 8,
    prompt: 'A town proposes a catalytic process to reduce one industrial air pollutant. Write a short recommendation that explains how a catalyst works, considers an environmental benefit and an economic limitation, and identifies evidence needed before a decision. Do not invent statistics.',
    checks: ['Explain a lower-activation-energy pathway.', 'Connect pollutant reduction to a specified possible benefit.', 'Discuss catalyst cost, lifetime or disposal as a limitation.', 'Weigh both sides in a qualified recommendation.', 'Identify a credible source or measurement needed to check the claim.'],
    solution: 'A catalyst offers an alternative pathway with lower activation energy. If the process converts the target pollutant into less harmful products, it may improve local air quality. Purchase, replacement and disposal costs must also be considered. A trial is justified if measured emissions fall and lifecycle costs are acceptable. Compare verified inlet and outlet emissions and examine by-products before recommending full installation.',
    transfer: 'Replace the economic limitation with an ethical or social implication, and explain who is affected.', source: 'https://openstax.org/books/chemistry-2e/pages/12-7-catalysis' },
  { id: 'myp-bio-osmosis', programme: 'IB MYP', subject: 'Biology', topic: 'Cell transport', focus: 'Criterion A practice: connect direction and consequence', minutes: 4,
    prompt: 'A plant cell is placed in a concentrated salt solution. Explain the initial net movement of water and a possible effect on the cell.',
    checks: ['Name osmosis and a partially permeable membrane.', 'State net water movement out of the cell.', 'Relate movement to the water-potential difference.', 'Explain loss of turgor; sufficiently severe loss can cause plasmolysis.'],
    solution: 'Water moves out by osmosis across the partially permeable cell membrane toward the lower water potential outside. The vacuole loses water and turgor falls. With sufficient water loss the membrane can pull away from the cell wall. The wall itself does not shrink in the same way.',
    transfer: 'Predict the change when the cell is returned to fresh water and justify the direction.', source: 'https://openstax.org/books/biology-2e/pages/5-2-passive-transport' },
  { id: 'myp-physics-energy', programme: 'IB MYP', subject: 'Physics', topic: 'Energy', focus: 'Criterion A practice: calculate and interpret', minutes: 4,
    prompt: 'A device receives 500 J of energy and transfers 350 J usefully. Calculate efficiency, account for the remaining energy and explain why it is misleading to say that energy was destroyed.',
    checks: ['Use useful output divided by total input.', 'Calculate 70%.', 'Identify 150 J transferred to less useful stores or pathways.', 'Apply conservation of energy.'],
    solution: 'Efficiency is 350/500 × 100 = 70%. The remaining 150 J is transferred through less useful pathways, such as heating the surroundings. Total energy is conserved even when it becomes less useful for the intended purpose.',
    transfer: 'A second device supplies the same useful output at 80% efficiency. Find its required input.', source: 'https://openstax.org/books/physics/pages/9-2-mechanical-energy-and-conservation-of-energy' },
  { id: 'dp-maths-fractions', programme: 'IB DP', subject: 'Mathematics', topic: 'Partial fractions', focus: 'Prerequisite repair: algebra before integration', minutes: 6,
    prompt: 'Without a calculator, express (3x + 5)/((x + 1)(x + 2)) as partial fractions. State the excluded values. Then integrate the expression.',
    checks: ['Set A/(x + 1) + B/(x + 2).', 'Derive A + B = 3 and 2A + B = 5.', 'Find A = 2 and B = 1; exclude x = −1, −2.', 'Integrate to 2 ln|x + 1| + ln|x + 2| + C on an interval avoiding the excluded values.'],
    solution: 'Equating numerators gives 3x + 5 = A(x + 2) + B(x + 1). Therefore A = 2, B = 1. The integral is 2 ln|x + 1| + ln|x + 2| + C on each interval where the expression is defined. Differentiating and recombining verifies the result.',
    transfer: 'Repeat with numerator 5x + 7. Repair coefficient matching before attempting a longer integration question.', source: 'https://openstax.org/books/calculus-volume-2/pages/3-4-partial-fractions' },
  { id: 'ap-calc-accumulation', programme: 'AP', subject: 'Mathematics', topic: 'Accumulation', focus: 'Calculus practice: interpret a definite integral', minutes: 5,
    prompt: 'Water enters a tank at r(t) = 2t + 3 litres per minute for 0 ≤ t ≤ 4. The tank initially holds 10 litres and has no outflow. Find the volume at t = 4 and explain what your integral represents.',
    checks: ['Integrate the rate from 0 to 4.', 'Evaluate [t² + 3t] from 0 to 4 as 28 litres.', 'Add initial volume to obtain 38 litres.', 'Interpret accumulated change and include units.'],
    solution: 'The definite integral of the inflow rate gives the added volume: 16 + 12 = 28 litres. Adding the initial 10 litres gives 38 litres. The integral is a change, not the final amount by itself.',
    transfer: 'If an outlet removes 2 litres per minute throughout, find the final volume using the net rate.', source: 'https://openstax.org/books/calculus-volume-1/pages/5-4-integration-formulas-and-the-net-change-theorem' },
];
