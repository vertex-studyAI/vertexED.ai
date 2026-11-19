# Derivatives from limits, tangent lines and local estimates

Subject: Mathematics · Unit: Differential calculus · Revision: 2026-10-21.3

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original AP Calculus AB Unit 2 support for selected points in topics 2.1-2.4. Source: the currently served CED and Fall 2026 corrections, inspected 2026-10-19. Partial topic coverage; no claim of official questions, AP scoring or complete exam preparation.

## Prerequisites

- Evaluate functions and expand polynomial expressions.

- Understand a two-sided limit and a secant-line slope.

## Objectives

- Distinguish an average rate from a derivative.

- Compute a polynomial derivative from its limit definition.

- Construct a tangent line and interpret units.

- Explain why a continuous function may lack a derivative.

## From an interval to a point

For distinct inputs a and b, the average rate of change is [f(b)-f(a)]/(b-a). It is the slope of the secant through two points on the graph. The numerator measures a change in output and the denominator a change in input, so their units divide. If f is a distance in metres and the input is seconds, the rate is measured in metres per second. An average rate need not equal the rate at either endpoint.

To investigate a rate at a, write b=a+h and consider [f(a+h)-f(a)]/h for nonzero h. The derivative f′(a) is the limit of this quotient as h approaches zero, if a finite two-sided limit exists. We do not set h=0 in the original quotient. The expression is undefined there, but the surrounding values may approach a well-defined limit. Confusing an undefined quotient at zero with a nonexistent limit misses the purpose of the limiting process.

## Algebra before the limit

When f(x)=x², expand f(a+h)=(a+h)²=a²+2ah+h². Subtract f(a)=a², factor h from the remaining numerator, and cancel h only while h≠0. The quotient becomes 2a+h, whose limit is 2a. The cancellation does not claim that zero can be divided by zero. It replaces an expression by another with the same values near, but not at, the point used in the limit.

Distinguish f′(a), a derivative value at a fixed input, from f′(x), a new function defined at inputs where the derivative exists. Notations y′ and dy/dx also refer to derivatives when y=f(x). The symbol dy/dx is not an instruction to divide a pair of arbitrary finite changes. At this stage it represents the limit-based local rate. Differentiate the expression with its variable roles intact; constants stay fixed during the limiting process.

## Tangents, local prediction and units

If f′(a) exists, the tangent line through (a,f(a)) has equation y-f(a)=f′(a)(x-a). The derivative supplies the slope, but the function supplies the point. Using f′(a) as the vertical coordinate is a common mistake. A tangent can cross a curve elsewhere or even pass through it at the tangency point; tangency is a local slope relationship, not a rule that the line touches the graph only once.

For small changes Δx, the tangent suggests Δy≈f′(a)Δx and f(a+Δx)≈f(a)+f′(a)Δx. This is a local approximation, not generally an equality or a trustworthy long-range forecast. The units provide a check: output per input multiplied by input gives output. A derivative of -3 litres per minute means the volume is decreasing locally at that rate, not that the volume itself is negative.

## Estimating from a table

A nearby secant can estimate a derivative when only values are available. A centred difference [f(a+h)-f(a-h)]/(2h) uses points on both sides; a one-sided difference uses a and one neighbour. For a smooth function, shrinking h can improve a suitable estimate, but measured data include rounding and noise. Dividing a small noisy difference by an extremely small h may amplify error. More decimal places do not automatically mean more accurate information.

State whether the result is an estimate and identify the interval used. Irregularly spaced data require the actual change in input, not an assumed constant spacing. A finite table cannot prove that a derivative exists at the target point: many curves, including nonsmooth ones, can pass through the same recorded values. Analytical information or additional assumptions are needed for a rigorous existence claim.

## Continuity is necessary, not sufficient

A function differentiable at an interior point is continuous there. One way to see the connection is f(a+h)-f(a)=h times the difference quotient: if the quotient approaches a finite limit, multiplying by h forces the change in f to approach zero. The converse fails. The function |x-2| is continuous at x=2, but its left-hand slope is -1 and its right-hand slope is +1. Since those limits disagree, there is no two-sided derivative at that point.

Corners are not the only obstruction. A discontinuity prevents differentiability, and a vertical tangent does not give a finite derivative under the definition used here. At an endpoint, one-sided derivatives may be discussed if the problem explicitly adopts that convention. Do not silently use a one-sided limit as if it were a two-sided derivative at an interior point. A horizontal tangent, by contrast, can have a perfectly valid derivative equal to zero.

## Scope and a reliable solution sequence

This lesson supports selected AP points about difference quotients, derivative notation, tangent lines, estimates and the continuity relationship. The source register identifies the CED pages and the checked 2026 clarification notice. It does not certify every representation or skill in Unit 2 and does not cover the full derivative-rule catalogue. The teaching exercises and one-point-per-criterion rubrics are original, not College Board scoring guidelines.

For a definition problem, write the quotient first, simplify with the nonzero-increment condition, take the limit and interpret the result. For a tangent problem, record both f(a) and f′(a) before writing the line. For a nonexistence claim, name the failed condition and support it with limits or a precise graph feature. Separate exact algebra from numerical evidence so a plausible estimate is not presented as a proof.

## Secant error and the choice of a nearby point

A forward difference quotient compares a point with a second point displaced by h. Its value depends on h until a limit is taken. Algebra can reveal exactly how that finite-step estimate differs from the derivative. A centred quotient uses points on both sides; cancellation can remove some error terms, but exactness for one polynomial does not make the method exact for every function. Keep the estimated derivative separate from the function value predicted by a tangent. Both estimates also become sensitive to measurement or rounding error when differences are formed from noisy values. Smaller h reduces a truncation error in an ideal formula, while a practical numerical calculation can have additional errors.

## A small function value can hide a rapidly changing slope

Continuity and differentiability are local properties with different requirements. A function can approach its value while its slopes oscillate or grow without a finite limit. To test a derivative at a special point, use the function's actual value there in the difference quotient; a formula valid only away from the point may be insufficient. Bounding the quotient can establish convergence even when oscillation prevents direct substitution. After a derivative has been established at one point, do not infer that nearby derivative values converge to it.

## Diagram: From secant to derivative for a cubic

Read the labelled relationships to follow this worked application. The quotient is 12 + 6h + h²; f′(2) = 12; at h = 0.1 the estimate is 12.61. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Expand the change: (2+h)³ - 8 = 12h + 6h² + h³.
   Relationship to next step: cancel the common factor h

2. Divide for h ≠ 0: The forward quotient is 12 + 6h + h².
   Relationship to next step: let the remaining error vanish

3. Take the limit: As h tends to zero, the quotient tends to 12.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “From an interval to a point” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: From an interval to a point

Worked examples: 1

Practise: q1, q2, q3, q4, q5, q6, q7, q8, q9

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: Algebra before the limit; Tangents, local prediction and units; Estimating from a table; Continuity is necessary, not sufficient; Scope and a reliable solution sequence

Worked examples: 2, 3, 4

Practise: q10, q11, q12, q13, q14, q15, q16, q17, q18

### Secant error and the choice of a nearby point

Read the application diagram “From secant to derivative for a cubic”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Secant error and the choice of a nearby point

Worked examples: 5

Practise: q19, q20, q21, q22, q23, q24, q25, application-check, error-analysis

### Apply and test the limits

Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.

Read: A small function value can hide a rapidly changing slope

Worked examples: 5

Practise: depth-oscillation-bound, depth-derivative-continuity, depth-one-sided-domain

## Worked example 1

Find f′(a) from the definition for f(x)=3x²-2x+4.

1. Expand f(a+h)-f(a)=6ah+3h²-2h.

2. For h≠0 divide by h to obtain 6a+3h-2.

3. Take h→0.

Answer: f′(a)=6a-2.

## Worked example 2

Find the tangent line to f(x)=x²+1 at x=3.

1. The point is (3,10).

2. The derivative from the square-function calculation is 2x, so the slope is 6.

3. Use y-10=6(x-3).

Answer: y=6x-8.

## Worked example 3

A table gives f(1.9)=7.22 and f(2.1)=8.82. Estimate f′(2).

1. Use the secant between the two nearby inputs.

2. Compute (8.82-7.22)/(2.1-1.9)=1.6/0.2.

3. Label the result as an estimate.

Answer: f′(2)≈8; the table alone does not prove differentiability.

## Worked example 4

Decide whether f(x)=|x-2| is differentiable at x=2.

1. f(2)=0 and the difference quotient is |h|/h.

2. For h<0 the quotient is -1; for h>0 it is +1.

3. The two one-sided limits disagree.

Answer: Continuous but not differentiable at x=2.

## Worked example 5

For f(x) = x³ at x = 2, simplify [f(2+h)-f(2)]/h for h ≠ 0. Give the derivative and the finite-step estimate at h = 0.1.

1. Expand (2+h)³ as 8 + 12h + 6h² + h³.

2. Subtract 8 and divide by nonzero h to obtain 12 + 6h + h².

3. The limit is 12; direct substitution of h = 0.1 into the quotient gives 12.61.

Answer: The quotient is 12 + 6h + h²; f′(2) = 12; at h = 0.1 the estimate is 12.61.

## Misconceptions

- The derivative is found by immediately substituting h=0.
  Correction: Simplify or analyse the nonzero-h quotient, then take its limit.

- A continuous graph always has a derivative.
  Correction: A corner can be continuous while its one-sided slopes disagree.

- A tangent must meet the curve only once.
  Correction: Its defining property is local slope agreement at the point, not a global intersection count.

## Flashcards

### What does [f(b)-f(a)]/(b-a) measure?
Average change per input unit over the interval, for a≠b.

### What is f′(a) in increment notation?
The limit of [f(a+h)-f(a)]/h as h→0, if it exists as a finite limit.

### Why may h be cancelled in a difference quotient?
For the nearby values used in the limit, h is nonzero.

### How does f′(x) differ from f′(a)?
The former is a derivative function; the latter is its value at a fixed point.

### Which point and slope define the tangent at x=a?
Point (a,f(a)) and slope f′(a).

### If f has units kilograms and x hours, what are derivative units?
Kilograms per hour.

### Can a finite table prove differentiability?
No; it supplies estimates unless additional information justifies existence.

### Why does |x| lack a derivative at zero?
Its one-sided difference-quotient limits are -1 and +1.

### Does differentiability at an interior point imply continuity?
Yes; the converse need not hold.

### What is the local linear estimate for f(a+Δx)?
f(a)+f′(a)Δx, with approximation error generally present.

### What is the finite-step error of a derivative estimate?
The difference between the finite difference quotient and the derivative at the point.

### Does a centred difference always give an exact derivative?
No. Symmetry can cancel some error terms while leaving others.

## Practice 1 — foundation · 1 marks

Which expression defines f′(a), provided the limit exists?

A. f(a)/a

B. f(a+h)-f(a) at h=0

C. [f(a+1)-f(a)]

D. lim as h→0 of [f(a+h)-f(a)]/h

Answer: lim as h→0 of [f(a+h)-f(a)]/h

1. A derivative compares nearby output change with input change.

2. The increment must then approach zero.

Marking points (one practice mark each):

- Select the limit of the difference quotient.

## Practice 2 — standard · 2 marks

For f(x)=2x²+3, calculate f′(4) using a difference quotient.

Answer: 16.

1. The quotient simplifies to 4a+2h for h≠0.

2. Its limit is 4a, which equals 16 at a=4.

Marking points (one practice mark each):

- Simplify the definition correctly.

- Evaluate the limit at 4.

## Practice 3 — standard · 2 marks

Find the tangent to y=x²-3x at x=2.

Answer: y=x-4.

1. f(2)=-2 and f′(2)=2(2)-3=1.

2. Use y+2=x-2.

Marking points (one practice mark each):

- Obtain the correct point and slope.

- Give the tangent line.

## Practice 4 — standard · 2 marks

A table gives g(4.8)=10.2 and g(5.2)=11.4. Estimate g′(5) using these values.

Answer: 3.

1. The output change is 1.2 and the input change is 0.4.

2. Divide 1.2 by 0.4 and label the result an estimate.

Marking points (one practice mark each):

- Use the actual interval width.

- Obtain the approximate rate 3.

## Practice 5 — extension · 3 marks

Explain why f(x)=|x+1| is continuous but not differentiable at x=-1.

Answer: Both sides approach f(-1)=0, but the difference quotient |h|/h tends to -1 from the left and +1 from the right.

1. Check the function value and limits.

2. Compute the one-sided quotient limits.

3. Use their disagreement to reject a two-sided derivative.

Marking points (one practice mark each):

- Establish continuity.

- Identify both slopes.

- State the failed differentiability condition.

## Practice 6 — standard · 2 marks

A tank volume satisfies V(2)=40 litres and V′(2)=-3 litres/minute. Give a local estimate for V(2.1).

Answer: 39.7 litres.

1. Use Δt=0.1 minute.

2. Estimate V(2.1)≈40+(-3)(0.1).

Marking points (one practice mark each):

- Use the correct small time change.

- State 39.7 litres as an approximation.

## Practice 7 — extension · 3 marks

A learner finds a centred secant estimate of zero and concludes a graph must be differentiable with a horizontal tangent. Give a counterexample.

Answer: For f(x)=|x| about zero, symmetric values are equal, so the centred quotient is zero. The left and right derivatives are -1 and +1, so no derivative exists.

1. Choose the absolute-value function.

2. Compute equal symmetric endpoint values.

3. Compare the one-sided slopes.

Marking points (one practice mark each):

- Provide a valid counterexample.

- Show the centred estimate is zero.

- Explain why differentiability fails.

## Practice 8 — standard · 2 marks

For f(x)=x², explain why f′(3)=6 does not mean f(3)=6.

Answer: f(3)=9 is the function value; f′(3)=6 is the local rate or tangent slope.

1. Evaluate the original function.

2. Distinguish the meaning of its derivative value.

Marking points (one practice mark each):

- State f(3)=9.

- Identify 6 as a rate/slope.

## Practice 9 — foundation · 2 marks

A runner has position s(t)=t²+2t metres. Find the average velocity from t=1 to t=4 seconds.

Answer: 7 m/s

1. s(4)=24 and s(1)=3, so the displacement is 21 metres.

2. Divide by the elapsed 3 seconds to obtain 7 m/s.

Marking points (one practice mark each):

- Find the displacement 21 m.

- Divide by 3 s and give 7 m/s.

## Practice 10 — standard · 2 marks

Interpret lim as h→0 of [(5+h)³-125]/h as a derivative. Identify the function and the input.

Answer: f′(5), where f(x)=x³.

1. The numerator has the form f(5+h)-f(5).

2. The denominator is the change h, so the limit is the derivative at 5.

Marking points (one practice mark each):

- Identify f(x)=x³.

- Identify the input 5 and the limit as f′(5).

## Practice 11 — standard · 3 marks

Use the limit definition to find the derivative of f(x)=1/x at x=2. State the restriction needed when simplifying.

Answer: f′(2)=-1/4.

1. For h≠0 and h≠-2, [1/(2+h)-1/2]/h = [-h/(2(2+h))]/h.

2. Cancel the nonzero h to obtain -1/[2(2+h)].

3. Taking h→0 gives -1/4; f itself is undefined at x=0.

Marking points (one practice mark each):

- Construct the difference quotient.

- Combine fractions and cancel h only for h≠0, with h≠-2.

- Take the limit -1/4.

## Practice 12 — extension · 3 marks

Use rationalisation to find the derivative of f(x)=√x at x=9 from first principles.

Answer: f′(9)=1/6.

1. The quotient is (√(9+h)-3)/h.

2. Multiply numerator and denominator by √(9+h)+3 to obtain 1/(√(9+h)+3) for nonzero h near zero.

3. The limit is 1/6.

Marking points (one practice mark each):

- Write the difference quotient at 9.

- Rationalise and cancel h with its nonzero restriction.

- Evaluate the limit as 1/6.

## Practice 13 — foundation · 2 marks

A learner says: “The difference quotient is 0/0 at h=0, so x² has no derivative.” Identify and repair the argument.

Answer: A limit uses nearby nonzero h; the undefined quotient at zero does not prevent the limit from existing.

1. Expand ((a+h)²-a²)/h to 2a+h for h≠0.

2. The simplified expression tends to 2a. No division by zero was performed.

Marking points (one practice mark each):

- Explain why substitution at h=0 is not the definition of the limit.

- Simplify for h≠0 and obtain the limit 2a.

## Practice 14 — standard · 3 marks

For f(x)=x², compare the forward and centred difference quotients at x=a. Explain why an exact centred estimate does not prove the same method is exact for every function.

Answer: Forward: 2a+h. Centred: 2a. Exactness here follows from cancellation specific to this quadratic.

1. Expand ((a+h)²-a²)/h to 2a+h.

2. Expand ((a+h)²-(a-h)²)/(2h) to 2a for h≠0.

3. For f(x)=x³ the centred quotient is 3a²+h², so a nonzero h leaves an error.

Marking points (one practice mark each):

- Derive the forward quotient.

- Derive the centred quotient.

- Use the cubic counterexample to limit the claim.

## Practice 15 — standard · 2 marks

A graph has a tangent at (3,7) that also passes through (5,1). Find f′(3) and explain why f′(5) cannot be read from this information.

Answer: f′(3)=-3; f′(5) is undetermined.

1. The tangent slope is (1-7)/(5-3)=-3.

2. The second point is on this tangent, not necessarily on the curve or on its tangent at x=5.

Marking points (one practice mark each):

- Calculate the tangent slope -3.

- Explain why that slope supplies no derivative value at 5.

## Practice 16 — standard · 3 marks

Temperature readings are T(2.7)=21.4°C and T(3.4)=20.0°C, with time in minutes. Estimate T′(3) using this secant and state a limitation.

Answer: -2°C/min; an estimate over [2.7,3.4], not an exact instantaneous rate.

1. The temperature change is -1.4°C and the time change is 0.7 minutes.

2. Their quotient is -2°C/min. The interval is not centred at 3 and the table alone does not establish the instantaneous slope.

Marking points (one practice mark each):

- Use the actual interval length 0.7.

- Obtain -2°C/min.

- State why this is an estimate.

## Practice 17 — standard · 2 marks

A differentiable function has f(2)=5 and f′(2)=0. Must f have a local maximum at x=2? Justify with a function.

Answer: No. f(x)=(x-2)³+5 has a horizontal tangent at 2 but no local maximum there.

1. This function has f(2)=5 and derivative 3(x-2)², giving f′(2)=0.

2. Values immediately to the left are below 5 and immediately to the right are above 5.

Marking points (one practice mark each):

- Give a function satisfying both data.

- Explain using nearby values why no local maximum is forced.

## Practice 18 — extension · 3 marks

Let f(x)=x² for x≤1 and f(x)=ax+b for x>1. Find a and b so that f is differentiable at 1, showing both conditions.

Answer: a=2, b=-1.

1. Continuity requires a+b=1 because the left value is 1.

2. The left derivative at 1 is 2, while the right derivative is a.

3. Set a=2, then b=1-2=-1.

Marking points (one practice mark each):

- State and use continuity a+b=1.

- Match one-sided slopes a=2.

- Obtain b=-1 and satisfy both conditions.

## Practice 19 — standard · 2 marks

Let f(x)=x² for x≠1 and f(1)=0. A learner differentiates x² and reports f′(1)=2. Explain why this is invalid.

Answer: The changed value makes f discontinuous at 1, so it is not differentiable there.

1. The limit of f(x) as x→1 is 1 but f(1)=0.

2. Differentiability implies continuity; a rule valid away from the changed point cannot supply its derivative.

Marking points (one practice mark each):

- Compare the limit 1 with the actual value 0.

- Use failure of continuity to reject a derivative at 1.

## Practice 20 — extension · 3 marks

Investigate the derivative of f(x)=x^(1/3) at x=0 using the difference quotient. Distinguish a vertical tangent from a finite derivative.

Answer: The quotient h^(-2/3) grows without bound; there is no finite derivative at 0, although the graph has a vertical tangent.

1. At zero the quotient is h^(1/3)/h=1/h^(2/3) for h≠0.

2. It tends to positive infinity from either side.

3. A finite derivative does not exist; continuity at zero is compatible with this vertical tangent.

Marking points (one practice mark each):

- Form and simplify the difference quotient.

- Describe its unbounded two-sided behaviour.

- Distinguish the vertical tangent from a finite derivative.

## Practice 21 — foundation · 2 marks

If C(t) is a concentration in mg/L and t is measured in hours, interpret C′(4)=-0.6 with units.

Answer: At 4 hours, concentration is decreasing at an instantaneous rate of 0.6 mg/L per hour.

1. Derivative units are output units divided by input units: mg/(L·h).

2. The negative sign indicates a decrease near t=4, not a negative concentration.

Marking points (one practice mark each):

- Give the rate units mg/(L·h).

- Explain the local decrease without asserting a negative concentration.

## Practice 22 — standard · 2 marks

A tangent line to y=x² at x=3 is used to estimate f(3.1). Find the absolute difference between the actual function value and this estimate.

Answer: 0.01.

1. The tangent has value 9+6(0.1)=9.6 at 3.1.

2. The actual value is 3.1²=9.61, giving absolute difference 0.01.

Marking points (one practice mark each):

- Calculate the tangent estimate 9.6.

- Compare with 9.61 to obtain 0.01.

## Practice 23 — standard · 2 marks

Why can two smooth curves pass through the same three table points and have different derivatives at the middle point? Give an algebraic construction for points at x=0,1,2.

Answer: Add k*x*(x-1)*(x-2) to an interpolating polynomial; it preserves the values but changes the derivative at 1 by -k.

1. The added term vanishes at 0, 1 and 2, so all three data values stay fixed.

2. Its derivative at 1 is -k. Choosing different k therefore changes the middle slope.

Marking points (one practice mark each):

- Construct a term vanishing at all three inputs.

- Show its derivative at the middle input need not vanish.

## Practice 24 — extension · 3 marks

Prove that differentiability at a implies continuity at a using the difference quotient. Identify the limit assumptions used.

Answer: For nonzero h, f(a+h)-f(a)=h*[f(a+h)-f(a)]/h. The second factor has finite limit f′(a), so the product tends to zero.

1. Differentiability gives a finite two-sided limit of the difference quotient.

2. For h≠0, multiply that quotient by h to recover f(a+h)-f(a).

3. By the product limit law, the change tends to 0*f′(a)=0; therefore f(a+h) tends to f(a).

Marking points (one practice mark each):

- State the finite derivative-limit assumption.

- Use the identity for nonzero h.

- Apply the product limit law to establish continuity.

## Practice 25 — standard · 2 marks

A sensor rounds each reading to the nearest 0.01 unit. Explain why reducing h from 0.1 to 0.0001 in a forward difference need not improve a derivative estimate.

Answer: Rounding errors in the numerator are divided by h; a smaller interval can amplify their effect.

1. Each rounded value may differ by up to 0.005, so the difference can have rounding error up to 0.01.

2. Dividing this bound by h gives rate-error bounds of 0.1 and 100 respectively. Truncation error may shrink while rounding error grows.

Marking points (one practice mark each):

- Explain error amplification by division by h.

- Compare the bounds 0.1 and 100 without claiming the actual errors reach them.

## Practice 26 — standard · 3 marks

For f(x) = x³ at x = 2, simplify [f(2+h)-f(2)]/h for h ≠ 0. Give the derivative and the finite-step estimate at h = 0.1.

Answer: The quotient is 12 + 6h + h²; f′(2) = 12; at h = 0.1 the estimate is 12.61.

1. Expand (2+h)³ as 8 + 12h + 6h² + h³.

2. Subtract 8 and divide by nonzero h to obtain 12 + 6h + h².

3. The limit is 12; direct substitution of h = 0.1 into the quotient gives 12.61.

Marking points (one practice mark each):

- Expand (2+h)³ as 8 + 12h + 6h² + h³.

- Subtract 8 and divide by nonzero h to obtain 12 + 6h + h².

- The limit is 12; direct substitution of h = 0.1 into the quotient gives 12.61.

## Practice 27 — extension · 3 marks

For the same cubic, a learner says the centred quotient [f(2+h)-f(2-h)]/(2h) must be exactly 12 for every nonzero h. Test that claim algebraically.

Answer: The centred quotient is 12 + h², so it approaches 12 but is not exactly 12 for nonzero real h.

1. Subtract the two cubic expansions to obtain 24h + 2h³.

2. Divide by 2h to obtain 12 + h².

3. The linear error cancels, but the h² error remains for nonzero real h.

Marking points (one practice mark each):

- Subtract the two cubic expansions to obtain 24h + 2h³.

- Divide by 2h to obtain 12 + h².

- The linear error cancels, but the h² error remains for nonzero real h.

## Practice 28 — extension · 3 marks

Define f(0)=0 and f(x)=x²sin(1/x) for x≠0. Use the definition and |sin t|≤1 to find f′(0).

Answer: f′(0)=0.

1. For h≠0 the quotient is h sin(1/h).

2. Its absolute value is at most |h|, which tends to zero.

Marking points (one practice mark each):

- Form the correct quotient.

- Apply the absolute-value bound.

- Conclude derivative zero by squeezing.

## Practice 29 — extension · 3 marks

For f(0)=0 and f(x)=x²sin(1/x) away from zero, it is known that f′(0)=0. For x≠0, f′(x)=2x sin(1/x)-cos(1/x). Does f′ approach 0 as x→0?

Answer: No. At x_n=1/(2πn), f′(x_n)=-1, while at y_n=1/((2n+1)π), f′(y_n)=1.

1. Both positive sequences approach zero as n increases.

2. Evaluate the sine and cosine terms to obtain two distinct limiting values.

Marking points (one practice mark each):

- Give two sequences tending to zero.

- Evaluate derivatives -1 and 1.

- Conclude that the derivative is not continuous at zero.

## Practice 30 — standard · 3 marks

The function f(x)=√x is defined only for x≥0. Explain why the usual two-sided real derivative at 0 is unavailable, and examine the right difference quotient.

Answer: There are no domain values to the left. The right quotient is 1/√h for h>0 and grows without bound, so there is no finite right derivative either.

1. State the domain restriction for a two-sided limit.

2. Simplify √h/h and examine h→0 from the right.

Marking points (one practice mark each):

- Identify the missing left-hand domain.

- Obtain 1/√h.

- State the absence of a finite right derivative.

## Revision checklist

- Write and simplify the quotient before taking the limit.

- Keep point coordinates separate from tangent slope.

- Label numerical approximations and their intervals.

- Test left/right behaviour before asserting differentiability.

- Explain the reasoning in “From secant to derivative for a cubic” and correct the linked error-analysis response without copying its solution.

## Revision guide

A forward difference quotient compares a point with a second point displaced by h. Its value depends on h until a limit is taken. Algebra can reveal exactly how that finite-step estimate differs from the derivative. A centred quotient uses points on both sides; cancellation can remove some error terms, but exactness for one polynomial does not make the method exact for every function. Keep the estimated derivative separate from the function value predicted by a tangent. Both estimates also become sensitive to measurement or rounding error when differences are formed from noisy values. Smaller h reduces a truncation error in an ideal formula, while a practical numerical calculation can have additional errors.

### Key ideas

- (2+h)³ - 8 = 12h + 6h² + h³.

- The forward quotient is 12 + 6h + h².

- As h tends to zero, the quotient tends to 12.

- Simplify or analyse the nonzero-h quotient, then take its limit.

### Retrieve without looking

- What is the finite-step error of a derivative estimate?

- Does a centred difference always give an exact derivative?

- What does [f(b)-f(a)]/(b-a) measure?

Mixed practice: q1, application-check, error-analysis, depth-oscillation-bound, depth-derivative-continuity, depth-one-sided-domain

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.

## Partial syllabus crosswalk

Source-checked means the official point was inspected, not independently approved teaching or complete coverage.

### ap-calculus-2026: 2.1 / CHA-2.A

[Official specification reference](https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-and-bc-course-and-exam-description.pdf)

Version: Effective Fall 2020 CED, currently served with 2026 updates; Fall 2026 correction notice checked. Checked: 2026-10-19. Location: Printed pages 55-58 / PDF pages 60-63; topics 2.1-2.4.

Tier/scope: AP Calculus AB; selected Unit 2 objectives

Teaching: From an interval to a point

Practice IDs: q4, q9

Still required:

- Further graphical and contextual rate representations.

### ap-calculus-2026: 2.2 / CHA-2.B

[Official specification reference](https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-and-bc-course-and-exam-description.pdf)

Version: Effective Fall 2020 CED, currently served with 2026 updates; Fall 2026 correction notice checked. Checked: 2026-10-19. Location: Printed pages 55-58 / PDF pages 60-63; topics 2.1-2.4.

Tier/scope: AP Calculus AB; selected Unit 2 objectives

Teaching: Algebra before the limit

Practice IDs: q1, q2, q8, q10, q11, q12, q13, q21

Still required:

- Additional non-polynomial definitions and representation changes.

### ap-calculus-2026: 2.2 / CHA-2.C

[Official specification reference](https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-and-bc-course-and-exam-description.pdf)

Version: Effective Fall 2020 CED, currently served with 2026 updates; Fall 2026 correction notice checked. Checked: 2026-10-19. Location: Printed pages 55-58 / PDF pages 60-63; topics 2.1-2.4.

Tier/scope: AP Calculus AB; selected Unit 2 objectives

Teaching: Tangents, local prediction and units

Practice IDs: q3, q6, q15, q17, q22

Still required:

- More independently reviewed tangent contexts and graph tasks.

### ap-calculus-2026: 2.3 / CHA-2.D

[Official specification reference](https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-and-bc-course-and-exam-description.pdf)

Version: Effective Fall 2020 CED, currently served with 2026 updates; Fall 2026 correction notice checked. Checked: 2026-10-19. Location: Printed pages 55-58 / PDF pages 60-63; topics 2.1-2.4.

Tier/scope: AP Calculus AB; selected Unit 2 objectives

Teaching: Estimating from a table

Practice IDs: q4, q7, q14, q16, q23, q25

Still required:

- Graph-derived and calculator-based estimates.

### ap-calculus-2026: 2.4 / FUN-2.A

[Official specification reference](https://apcentral.collegeboard.org/media/pdf/ap-calculus-ab-and-bc-course-and-exam-description.pdf)

Version: Effective Fall 2020 CED, currently served with 2026 updates; Fall 2026 correction notice checked. Checked: 2026-10-19. Location: Printed pages 55-58 / PDF pages 60-63; topics 2.1-2.4.

Tier/scope: AP Calculus AB; selected Unit 2 objectives

Teaching: Continuity is necessary, not sufficient

Practice IDs: q5, q7, q18, q19, q20, q24

Still required:

- Broader piecewise, discontinuous and vertical-tangent examples.
