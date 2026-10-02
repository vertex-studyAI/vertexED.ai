// Original bounded learning path. Each key is checked independently in tests.
const base = { subject: 'Mathematics', topic: 'Complex numbers', curriculum: ['IB DP', 'A Level'] };
const numeric = (id, concepts, prompt, value, solution, hints, difficulty = 'foundation') => ({
  ...base, id, concepts, prompt, type: 'numeric', difficulty,
  answer: { value, tolerance: 0.001 }, solution, hints, mistakes: [],
  difficultyReason: 'Connect the complex-plane representation to ' + concepts.join(' and ') + '.',
});
export const COMPLEX_NUMBERS_PRACTICE = [
  numeric('math-modulus-01', ['modulus'], 'Find the modulus of $z=3+4i$.', 5,
    ['The real and imaginary parts form perpendicular sides of a right triangle.', '$|z|=\\sqrt{3^2+4^2}=5$.'],
    ['The modulus is the distance from the origin, not the sum of the coordinates.', 'Use $|a+bi|=\\sqrt{a^2+b^2}$.']),
  numeric('math-modulus-02', ['modulus'], 'Find the modulus of $z=-5+12i$.', 13,
    ['Squaring removes the sign of the real part.', '$|z|=\\sqrt{(-5)^2+12^2}=\\sqrt{169}=13$.'],
    ['Distance from the origin is always nonnegative.', 'Square each coordinate separately, add, then take the positive square root.']),
  numeric('math-argument-01', ['argument'], 'Give the principal argument of $z=1+i$ in degrees, in the interval $(-180,180]$.', 45,
    ['The point is in the first quadrant with equal real and imaginary parts.', '$\\arg(z)=\\arctan(1)=45^\\circ$.'],
    ['Locate the point in its quadrant first.', 'The real and imaginary components are equal and positive. Which angle bisects this quadrant?']),
  numeric('math-argument-02', ['argument'], 'Give the principal argument of $z=-1+i$ in degrees, in the interval $(-180,180]$.', 135,
    ['The point lies in the second quadrant.', 'The reference angle is $45^\\circ$, so the principal argument is $180^\\circ-45^\\circ=135^\\circ$.'],
    ['A negative real part and positive imaginary part place the point in quadrant II.', 'Find the reference angle from the absolute coordinates, then adjust for the quadrant.']),
  numeric('math-polar-01', ['polar form', 'modulus'], 'A number has polar form $z=2(\\cos 60^\\circ+i\\sin 60^\\circ)$. Find its real part.', 1,
    ['In polar form the real part is $r\\cos\\theta$.', '$\\operatorname{Re}(z)=2\\cos60^\\circ=1$.'],
    ['The real component is the horizontal projection.', 'Multiply the modulus by the cosine of the argument.']),
  numeric('math-polar-02', ['polar form', 'argument'], 'A number has polar form $z=4(\\cos 30^\\circ+i\\sin 30^\\circ)$. Find its imaginary part.', 2,
    ['In polar form the imaginary part is the coefficient $r\\sin\\theta$.', '$\\operatorname{Im}(z)=4\\sin30^\\circ=2$.'],
    ['The imaginary component is the vertical projection; give the coefficient, not a multiple of i.', 'Multiply the modulus by the sine of the argument.']),
  numeric('math-demoivre-01', ['De Moivre theorem', 'polar form'], 'Let $z=2(\\cos20^\\circ+i\\sin20^\\circ)$. Find the modulus of $z^3$.', 8,
    ['Raising a complex number to a power raises its modulus to the same power.', '$|z^3|=|z|^3=2^3=8$.'],
    ['Treat modulus and argument separately.', 'For a power n, the modulus becomes r raised to n.'], 'intermediate'),
  numeric('math-demoivre-02', ['De Moivre theorem', 'argument'], 'Let $z=3(\\cos40^\\circ+i\\sin40^\\circ)$. Find the principal argument of $z^2$ in degrees.', 80,
    ['De Moivre multiplies the argument by the power.', '$2\\times40^\\circ=80^\\circ$, already in the principal interval.'],
    ['A power changes both modulus and argument, but in different ways.', 'The new angle is n times the old angle; then check the principal interval.'], 'intermediate'),
  numeric('math-roots-01', ['roots of unity', 'De Moivre theorem'], 'What is the smallest positive argument, in degrees, of a fifth root of unity?', 72,
    ['The five roots are equally spaced around the unit circle.', 'Adjacent arguments differ by $360^\\circ/5=72^\\circ$.'],
    ['Place the roots evenly around one complete turn.', 'Divide a full turn by the number of roots.'], 'intermediate'),
  numeric('math-roots-02', ['roots of unity', 'De Moivre theorem'], 'What is the smallest positive argument, in degrees, of an eighth root of unity?', 45,
    ['The roots have arguments $360k/8$ degrees, for $k=0,\\ldots,7$.', 'The smallest positive one uses $k=1$: $45^\\circ$.'],
    ['One root lies at 1 on the real axis. The next lies one equal interval away.', 'Divide a full turn by eight.'], 'intermediate'),
];

export const COMPLEX_DEFINITIONS = {
  modulus: 'The distance from a complex number to the origin: |a + bi| = √(a² + b²).',
  argument: 'The angle from the positive real axis to the point. The principal angle needs a stated interval and is undefined at zero.',
  'polar form': 'A complex number written using its distance and angle: z = r(cos θ + i sin θ).',
  'De Moivre theorem': 'For an integer power n, raise the modulus to n and multiply the angle by n: zⁿ = rⁿ(cos nθ + i sin nθ).',
  'roots of unity': 'Solutions of zⁿ = 1. For positive integer n they lie at equally spaced angles on the unit circle.',
};
