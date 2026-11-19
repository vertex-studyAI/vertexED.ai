# Antiderivatives, signed accumulation and total change

Subject: Mathematics · Unit: Calculus · Revision: 2026-10-21.4

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original shared study module on antiderivatives, signed accumulation and total change. Numerical datasets and quoted passages are invented teaching examples. This is not a complete course, official examination material or verified board-specific alignment.

## Prerequisites

- Differentiate integer powers of x.

- Interpret positive and negative function values on a graph.

## Objectives

- Find an antiderivative with its constant.

- Evaluate a definite integral using endpoints.

- Distinguish signed change from total accumulated magnitude.

## Reverse differentiation with a family

An antiderivative F of f satisfies F′=f on an interval. For a power x raised to n, with n not equal to minus one, increase the exponent by one and divide by the new exponent. Add an arbitrary constant because differentiation removes constants. An indefinite integral therefore represents a family, not one unique function. A supplied value such as F(0)=3 can determine the constant. Always differentiate the proposed answer to check its coefficients, powers and any domain restrictions rather than relying on visual resemblance.

## Evaluate a definite integral

For a continuous function on a closed interval, an antiderivative gives its definite integral by F(b)-F(a). Both endpoint substitutions are required; putting a lower limit of zero does not automatically make every term at that endpoint zero. Reversing the limits reverses the sign. Splitting the interval at an intermediate point leaves the signed total unchanged. Geometrically, parts below the horizontal axis contribute negatively. The result has the units of the integrand multiplied by the units of the integration variable.

## Interpret net change and total distance

Integrating a rate gives a change in the underlying quantity. To recover the final quantity, add the starting value; the definite integral is not automatically the final amount. Velocity is a signed rate, so its integral gives displacement. Total distance instead integrates speed, the absolute value of velocity. Locate sign changes and split the interval before taking magnitudes. Similarly, positive and negative flow can cancel in a net budget while both contribute to total throughput. These are different questions, so decide which quantity is requested before calculating.

## Diagram: Reasoning route: Calculus

Use the sequence to organise an explanation of antiderivatives, signed accumulation and total change; it is not a measured mastery score.

1. Rate and domain: Identify the rate, units, interval and initial condition.
   Relationship to next step: Use this definition to choose the method

2. Accumulate: Use an antiderivative and split where the required magnitude changes sign.
   Relationship to next step: Use the result to evaluate the conclusion

3. Report the quantity: Distinguish change, final amount and total magnitude.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Reverse differentiation with a family

Differentiate the proposed antiderivative and explain why the arbitrary constant disappears.

Read: Reverse differentiation with a family

Worked examples: 1

Practise: family

### Evaluate a definite integral

Inspect the endpoint subtraction in example 2, then use the same signed rule for a new integrand.

Read: Evaluate a definite integral

Worked examples: 2

Practise: definite

### Interpret net change and total distance

Split at a sign change for distance, and add the initial value when asked for a final amount.

Read: Interpret net change and total distance

Worked examples: 2

Practise: initial, cancellation

## Worked example 1

Find an antiderivative of 6x²-4x with F(0)=5.

1. Integrate term by term to obtain 2x³-2x²+C.

2. Substitute zero into F to obtain C=5.

Answer: F(x)=2x³-2x²+5.

## Worked example 2

An object's velocity is v(t)=2t-2 m/s for 0≤t≤3. Find displacement and distance.

1. An antiderivative is t²-2t, giving net displacement 3 m.

2. Velocity changes sign at t=1. Displacements on [0,1] and [1,3] are -1 and 4 m; sum their magnitudes.

Answer: Displacement 3 m; distance 5 m.

## Misconceptions

- A definite integral is always positive area.
  Correction: It is signed; intervals below the axis contribute negatively.

- Integrating a rate directly gives the final quantity.
  Correction: It gives the change; include the initial value.

## Flashcards

### Why add C in an indefinite integral?
All constant offsets have the same derivative.

### Which power is excluded from the ordinary power rule?
x⁻¹; its antiderivative is logarithmic on an appropriate domain.

### What is the endpoint rule?
Evaluate F(b)-F(a) when its hypotheses hold.

### What does the integral of velocity measure?
Signed displacement.

### How do you recover a final quantity from its rate?
Add the integral of the rate to the starting quantity.

## Practice 1 — standard · 2 marks

Find the family of antiderivatives of 8x³+3 and check by differentiation.

Answer: F(x)=2x⁴+3x+C.

1. Raise the power of x³ and divide by four.

2. Differentiate the result to recover 8x³+3.

Marking points (one practice mark each):

- Obtain both integrated terms and C.

- Verify by differentiation.

## Practice 2 — standard · 2 marks

Evaluate the integral of 3x² from x=1 to x=3.

Answer: 26.

1. Use antiderivative x³.

2. Subtract 1³ from 3³.

Marking points (one practice mark each):

- Find an antiderivative.

- Evaluate both limits to get 26.

## Practice 3 — standard · 2 marks

A fictional tank starts with 10 L and has net inflow 4t L/min for 0≤t≤2 minutes. Find the final volume.

Answer: 18 L.

1. Integrate 4t to find the increase [2t²] from 0 to 2, which is 8 L.

2. Add the initial 10 L.

Marking points (one practice mark each):

- Find the increase 8 L.

- Find final volume 18 L.

## Practice 4 — extension · 2 marks

Velocity is v(t)=t-2 m/s for 0≤t≤4. Find displacement and total distance.

Answer: Displacement 0 m; distance 4 m.

1. Split at t=2, where velocity changes sign.

2. Each triangular speed area is 2 m; signed areas cancel while magnitudes add.

Marking points (one practice mark each):

- Find zero signed displacement.

- Find total distance 4 m.

## Revision checklist

- Check that you can find an antiderivative with its constant without copying the worked solution.

- Check that you can evaluate a definite integral using endpoints without copying the worked solution.

- Check that you can distinguish signed change from total accumulated magnitude without copying the worked solution.

## Revision guide

Review antiderivatives, signed accumulation and total change by connecting definitions, the two worked examples and the limits of each conclusion. These questions use editorial self-review points, not an official examination rubric.

### Key ideas

- Why add C in an indefinite integral? All constant offsets have the same derivative.

- Which power is excluded from the ordinary power rule? x⁻¹; its antiderivative is logarithmic on an appropriate domain.

- What is the endpoint rule? Evaluate F(b)-F(a) when its hypotheses hold.

### ∫xⁿ dx=xⁿ⁺¹/(n+1)+C
An antiderivative of a power.
Conditions: n≠−1; use an interval where the real-valued functions and derivative are defined.

### ∫ₐᵇ f(x) dx=F(b)−F(a)
Evaluate signed accumulation using an antiderivative F.
Conditions: For this lesson, f is continuous on [a,b] and F′=f; total magnitude requires splitting at sign changes.

### Retrieve without looking

- Why add C in an indefinite integral?

- Which power is excluded from the ordinary power rule?

- What is the endpoint rule?

Mixed practice: family, definite, initial, cancellation

Attempt the questions without the notes, compare your reasoning with the points, and retry any step you cannot yet explain. Self-review does not certify mastery.
