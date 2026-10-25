# Quadratic forms, roots, turning points and discriminants

Subject: Mathematics · Unit: Algebra · Revision: 2026-10-21.3

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original partial support for AQA 8300 A11/A18, Cambridge 0580 Extended E2.5.6 (2025-2027), and the digital SAT nonlinear equation/function skills. Higher-level algebra is labelled in the crosswalk; this is not a whole-course or official scoring claim.

## Prerequisites

- Expand two binomials and factor a common factor.

- Work with square roots and solve simple linear equations.

## Objectives

- Choose a useful quadratic representation.

- Derive roots using factorisation, square completion or the formula.

- Connect a discriminant and a turning point to a graph.

- Check domain constraints in a quadratic model.

## Three forms answer different questions

A quadratic function has the form f(x)=ax²+bx+c with a≠0. In expanded form, c is the vertical intercept and a controls opening direction and vertical scaling. In factored form a(x-r)(x-s), the real zeros r and s are visible. In vertex form a(x-h)²+k, the turning point is (h,k). These are different representations of one relationship, not different functions. A quadratic without real roots cannot be factored into real linear factors, but it still has a real vertex.

Choose a representation based on the question rather than converting mechanically. To locate zeros, a correct factorisation may be quickest. To find a minimum or maximum, completed-square form reveals the answer without numerical guessing. To evaluate at x=0, expanded form is convenient. Always preserve the leading coefficient during a conversion. Writing x²-6x+11 as (x-3)²+11 is incorrect because expansion introduces an extra 9.

## Factorisation and the zero-product condition

The zero-product principle says that if a product of real numbers is zero, at least one factor is zero. It applies after the equation is rearranged so one side is zero. From (x-2)(x+5)=6 you cannot infer x=2 or x=-5. First expand or otherwise rearrange the full equation. For x²+3x-10=0, the factorisation (x+5)(x-2)=0 does yield the two roots. Substitute each root into the original equation to check the algebra.

When a leading coefficient is not 1, a pair of factors must reproduce both the middle term and the constant. It is not enough for the constants to multiply correctly. If no simple integer factorisation is apparent, use another method instead of forcing approximate factors. Repeated factors such as (x-4)² give a repeated root, not two distinct x-intercepts.

## Completing the square with a coefficient

For x²+px+q, add and subtract (p/2)² to obtain (x+p/2)²+q-(p/2)². This preserves the original expression because the added and subtracted quantities cancel. If the coefficient of x² is not 1, factor it from the x² and x terms first. For 2x²-12x+7, write 2(x²-6x)+7=2[(x-3)²-9]+7=2(x-3)²-11. The turning point is (3,-11), and because 2 is positive this is a minimum.

Solving a completed-square equation requires both square-root signs. From (x-h)²=m with m>0, x=h±√m. If m=0 there is one repeated root; if m<0 there are no real solutions. Do not confuse the sign inside the bracket with the vertex coordinate: x+3 means h=-3. The square is nonnegative, which is why a positive leading coefficient places the vertex below or at every other point.

## Formula and discriminant

The quadratic formula gives x=(-b±√(b²-4ac))/(2a) for ax²+bx+c=0 with a≠0. Put the entire numerator over 2a. Parentheses matter when b is negative: -b becomes positive, while b² is nonnegative. The discriminant D=b²-4ac determines the number of distinct real roots: two if D>0, one repeated root if D=0, and none if D<0. This counts real roots; it does not say the function itself is undefined when D<0.

A positive perfect-square discriminant guarantees rational roots when the coefficients are rational, but not necessarily integer roots. Whether a root is an integer also depends on the denominator. A non-square positive discriminant with integer coefficients generally leaves a surd expression. Retaining that expression can be more precise than rounding early. When decimals are requested, round at the end and use substitution or the graph's symmetry as a check.

## Models, restrictions and reasonableness

A quadratic model may describe an area, height or other quantity only on a restricted domain. Algebra can return roots outside that physical domain. Explain why a root is rejected using the context, such as a negative length, rather than deleting it without comment. The vertex may also lie outside the permitted interval; in that case it need not be the model's maximum or minimum over the allowed values. Compare the endpoints as well when a closed interval is given.

The axis of symmetry x=-b/(2a) gives another consistency check. If there are two real roots, their midpoint lies on this axis. A graph should open in the direction implied by a and cross the vertical axis at c. These independent features can reveal a transcription error even before a final calculation. A context description still needs to justify why a quadratic model is appropriate; a neat parabola is not evidence that real observations follow it exactly.

## Scope and deliberate practice

AQA separates elementary factorisation from its Higher-tier completion-of-square and formula work. Cambridge E2.5.6 here refers to the Extended 2025-2027 syllabus; the mapping includes only quadratic solving and completed-square structure, not every equation requirement. The SAT references cover selected nonlinear equation and function skills and do not imply a complete digital test simulation.

For revision, take one expression and identify what each form makes visible. Then solve a different quadratic using two methods and check that the resulting root sets agree. Explain the discriminant before calculating decimal roots. Keep written reasoning for contextual exclusions, because a numeric match alone cannot show that a root was interpreted correctly.

## Reading a repeated root from equivalent forms

A quadratic with a repeated real root touches the horizontal axis at its turning point rather than crossing it. Factored form, completed-square form and the discriminant describe the same situation in different ways. Match coefficients carefully when comparing a perfect square with the original expression, especially when the leading coefficient is not one. A zero discriminant gives one distinct real root with multiplicity two; it does not give two different roots or no roots. Expanding a proposed factorisation is a useful independent check. The sign of the leading coefficient then identifies whether the touching point is a minimum or maximum.

## Use roots and coefficients to check a constructed quadratic

For ax²+bx+c with a≠0, the roots' sum is -b/a and their product is c/a when counted with multiplicity. These relations follow by expanding a(x-r)(x-s). They provide useful checks and let you construct a quadratic from roots, but do not determine the leading coefficient unless additional information is given. The discriminant describes real-root count, not whether a polynomial or graph exists. A repeated root is both a solution and the point where a quadratic touches the axis.

## Diagram: Connect three views of a repeated root

Read the labelled relationships to follow this worked application. f(x) = (2x - 3)². The repeated root is x = 3/2; the turning point is (3/2, 0), and the graph touches without crossing. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Squared form: (2x - 3)² is always nonnegative for real x.
   Relationship to next step: set the squared factor to zero

2. Root and vertex: At x = 3/2 the value is zero and minimal.
   Relationship to next step: verify with coefficients

3. Discriminant check: 144 - 144 = 0 confirms the repeated real root.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “Three forms answer different questions” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: Three forms answer different questions

Worked examples: 1

Practise: q1, q2, q3

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: Factorisation and the zero-product condition; Completing the square with a coefficient; Formula and discriminant; Models, restrictions and reasonableness; Scope and deliberate practice

Worked examples: 2, 3, 4

Practise: q4, q5, q6

### Reading a repeated root from equivalent forms

Read the application diagram “Connect three views of a repeated root”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Reading a repeated root from equivalent forms

Worked examples: 5

Practise: q7, q8, application-check, error-analysis

### Apply and test the limits

Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.

Read: Use roots and coefficients to check a constructed quadratic

Worked examples: 5

Practise: depth-construct-roots, depth-root-relations, depth-parameter-discriminant

## Worked example 1

Write x²+8x+5 in vertex form and state its minimum.

1. Half of 8 is 4, so introduce (x+4)².

2. Since (x+4)²=x²+8x+16, subtract 11.

3. The square is smallest at x=-4.

Answer: (x+4)²-11; minimum -11 at x=-4.

## Worked example 2

Solve 3x²-5x-2=0 by factorisation.

1. Use (3x+1)(x-2)=3x²-5x-2.

2. Set each factor to zero.

3. Check x=-1/3 and x=2 in the original equation.

Answer: x=-1/3 or x=2.

## Worked example 3

Solve x²+2x-7=0 exactly.

1. Complete the square: (x+1)²=8.

2. Take both square roots: x+1=±√8.

3. Simplify √8=2√2.

Answer: x=-1±2√2.

## Worked example 4

A rectangular area is A=x(14-x) for 0≤x≤14. Find the maximum.

1. Expand A=14x-x².

2. Complete the square: A=49-(x-7)².

3. The permitted value x=7 makes the square zero.

Answer: Maximum area 49 square units, with x=7.

## Worked example 5

For f(x) = 4x² - 12x + 9, write a squared form, find its root and turning point, and state whether the graph crosses the x-axis.

1. Recognise 4x² - 12x + 9 as (2x - 3)².

2. Set 2x - 3 = 0 to obtain x = 3/2.

3. The square is nonnegative and zero only there, so the point is a minimum and there is no sign change.

Answer: f(x) = (2x - 3)². The repeated root is x = 3/2; the turning point is (3/2, 0), and the graph touches without crossing.

## Misconceptions

- A factored expression always lets you set its factors to zero.
  Correction: The product must equal zero.

- A positive discriminant means two integer roots.
  Correction: It means two distinct real roots; integrality requires additional conditions.

- Every algebraic root is physically valid.
  Correction: Apply the model's units and domain restrictions.

## Flashcards

### Which quadratic form displays a turning point directly?
a(x-h)²+k, with vertex (h,k).

### What is the symmetry axis of ax²+bx+c?
x=-b/(2a), for a≠0.

### When does the zero-product rule apply?
When the product equals zero.

### What square term is used to complete x²+px?
(x+p/2)², with (p/2)² subtracted to compensate.

### What is the discriminant of a quadratic equation?
b²-4ac.

### What does a zero discriminant mean?
One repeated real root.

### What does a negative discriminant mean over the reals?
No real roots, not an undefined quadratic function.

### What decides whether a parabola's vertex is a minimum or maximum?
The sign of a: positive gives a minimum, negative a maximum.

### Why keep a surd root during working?
It preserves exactness until rounding is required.

### Why check a model's domain after solving?
Some algebraic roots or turning points may be outside permitted values.

### What does a zero quadratic discriminant mean?
One distinct real root of multiplicity two.

### How can you check a proposed completed square?
Expand it and compare all coefficients with the original quadratic.

## Practice 1 — foundation · 1 marks

What is the vertex of f(x)=2(x+3)²-5?

A. (3,-5)

B. (-3,-5)

C. (-3,5)

D. (2,-5)

Answer: (-3,-5)

1. The square is zero at x=-3.

2. At that x, f(x)=-5.

Marking points (one practice mark each):

- Select (-3,-5).

## Practice 2 — standard · 2 marks

Find the minimum value of x²-10x+13.

Answer: -12.

1. Write x²-10x+13=(x-5)²-12.

2. The square has minimum zero at x=5.

Marking points (one practice mark each):

- Complete the square correctly.

- State the minimum value.

## Practice 3 — standard · 2 marks

Solve 2x²+x-6=0 exactly.

Answer: x=3/2 or x=-2.

1. Factor as (2x-3)(x+2)=0.

2. Set each factor equal to zero.

Marking points (one practice mark each):

- Factor or apply another valid exact method.

- Give both roots.

## Practice 4 — standard · 2 marks

For x²-6x+k=0 to have a repeated root, find k.

Answer: 9.

1. Set the discriminant 36-4k equal to zero.

2. Solve k=9 and check (x-3)²=0.

Marking points (one practice mark each):

- Use the repeated-root discriminant condition.

- Obtain k=9.

## Practice 5 — extension · 3 marks

A learner says x²+4x+8 has no graph because its discriminant is negative. Correct the reasoning.

Answer: It has a real graph y=(x+2)²+4 with minimum 4. A negative discriminant says the equation y=0 has no real roots, not that the function has no real values.

1. Separate a function from its zero equation.

2. Complete the square.

3. Explain the absence of horizontal-axis intersections.

Marking points (one practice mark each):

- Distinguish roots from function values.

- Give the correct vertex form.

- Explain no real zeros.

## Practice 6 — standard · 2 marks

Solve x²-4x-1=0 in exact form.

Answer: x=2±√5.

1. Rewrite as (x-2)²=5.

2. Take both square roots and isolate x.

Marking points (one practice mark each):

- Complete the square or use the formula.

- Retain both exact roots.

## Practice 7 — extension · 3 marks

A rectangle has sides x and 18-x, with 2≤x≤6. Does the unrestricted vertex give its allowed maximum area?

Answer: No. The unrestricted vertex is x=9, outside the domain. On [2,6] the area increases, so the maximum is 6×12=72.

1. Write A=81-(x-9)².

2. Locate the vertex outside the permitted interval.

3. On this interval the squared distance to 9 is least at x=6.

Marking points (one practice mark each):

- Find the unrestricted vertex.

- Apply the domain restriction.

- Identify maximum area 72.

## Practice 8 — standard · 2 marks

Explain why x=2 and x=-3 do not solve (x-2)(x+3)=4.

Answer: Each makes the left side zero, not 4. Rearrange to x²+x-10=0 before solving.

1. Substitute either claimed root.

2. State the missing zero-product condition.

Marking points (one practice mark each):

- Reject both claims using substitution.

- Explain the necessary rearrangement.

## Practice 9 — standard · 3 marks

For f(x) = 4x² - 12x + 9, write a squared form, find its root and turning point, and state whether the graph crosses the x-axis.

Answer: f(x) = (2x - 3)². The repeated root is x = 3/2; the turning point is (3/2, 0), and the graph touches without crossing.

1. Recognise 4x² - 12x + 9 as (2x - 3)².

2. Set 2x - 3 = 0 to obtain x = 3/2.

3. The square is nonnegative and zero only there, so the point is a minimum and there is no sign change.

Marking points (one practice mark each):

- Recognise 4x² - 12x + 9 as (2x - 3)².

- Set 2x - 3 = 0 to obtain x = 3/2.

- The square is nonnegative and zero only there, so the point is a minimum and there is no sign change.

## Practice 10 — extension · 3 marks

A learner calculates discriminant zero and concludes there are no real solutions. Correct the rule and verify it for 4x² - 12x + 9 = 0.

Answer: Zero discriminant means one repeated real root; the quadratic formula gives x = 12/8 = 3/2.

1. The discriminant is (-12)² - 4 × 4 × 9 = 0.

2. The plus and minus branches of the formula coincide when the square root is zero.

3. Both give 12/(2 × 4) = 3/2, not an absence of real solutions.

Marking points (one practice mark each):

- The discriminant is (-12)² - 4 × 4 × 9 = 0.

- The plus and minus branches of the formula coincide when the square root is zero.

- Both give 12/(2 × 4) = 3/2, not an absence of real solutions.

## Practice 11 — standard · 3 marks

Construct a quadratic with roots -2 and 5 and leading coefficient 3, and expand it.

Answer: 3(x+2)(x-5)=3x²-9x-30.

1. Each root supplies a factor that vanishes there.

2. Multiply the factors, then apply leading coefficient 3.

Marking points (one practice mark each):

- Use factors x+2 and x-5.

- Apply factor 3.

- Expand to 3x²-9x-30.

## Practice 12 — extension · 3 marks

The roots of 2x²-7x+3 are r and s. Find r+s, rs and r²+s² without solving separately for both roots.

Answer: r+s=7/2, rs=3/2 and r²+s²=37/4.

1. Read sum and product from the coefficients.

2. Use r²+s²=(r+s)²-2rs=49/4-3.

Marking points (one practice mark each):

- Find sum 7/2.

- Find product 3/2.

- Find 37/4 using the identity.

## Practice 13 — extension · 3 marks

For which real values of k does x²+kx+9=0 have two distinct real roots?

Answer: k<-6 or k>6.

1. Require discriminant k²-36>0 for distinct real roots.

2. Solve k²>36, retaining both positive and negative branches.

Marking points (one practice mark each):

- Use strict positive discriminant.

- Obtain k²>36.

- State both intervals.

## Revision checklist

- Connect each quadratic form to a graph feature.

- Use both square-root signs and preserve coefficients.

- Apply discriminant reasoning only to the stated equation.

- Check contextual domains and report exact values when appropriate.

- Explain the reasoning in “Connect three views of a repeated root” and correct the linked error-analysis response without copying its solution.

## Revision guide

A quadratic with a repeated real root touches the horizontal axis at its turning point rather than crossing it. Factored form, completed-square form and the discriminant describe the same situation in different ways. Match coefficients carefully when comparing a perfect square with the original expression, especially when the leading coefficient is not one. A zero discriminant gives one distinct real root with multiplicity two; it does not give two different roots or no roots. Expanding a proposed factorisation is a useful independent check. The sign of the leading coefficient then identifies whether the touching point is a minimum or maximum.

### Key ideas

- (2x - 3)² is always nonnegative for real x.

- At x = 3/2 the value is zero and minimal.

- 144 - 144 = 0 confirms the repeated real root.

- The product must equal zero.

### Retrieve without looking

- What does a zero quadratic discriminant mean?

- How can you check a proposed completed square?

- Which quadratic form displays a turning point directly?

Mixed practice: q1, application-check, error-analysis, depth-construct-roots, depth-root-relations, depth-parameter-discriminant

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.

## Partial syllabus crosswalk

Source-checked means the official point was inspected, not independently approved teaching or complete coverage.

### aqa-8300-algebra: A11

[Official specification reference](https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/subject-content/3.2-algebra)

Version: First teaching 2015; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Section 3.2; A11, A12, A18, A19.

Tier/scope: Additional Foundation roots; Higher vertex by square completion

Teaching: Three forms answer different questions; Completing the square with a coefficient

Practice IDs: q1, q2

Still required:

- More independently reviewed graphical readings and sketches.

### aqa-8300-algebra: A18

[Official specification reference](https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/subject-content/3.2-algebra)

Version: First teaching 2015; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Section 3.2; A11, A12, A18, A19.

Tier/scope: Higher methods; factorisation also Additional Foundation

Teaching: Factorisation and the zero-product condition; Formula and discriminant

Practice IDs: q3, q4, q6, q8

Still required:

- More graph-based approximate solutions and non-monic surds.

### cambridge-0580-2025-2027: E2.5.6

[Official specification reference](https://www.cambridgeinternational.org/Images/662466-2025-2027-syllabus.pdf)

Version: Examinations 2025-2027, version 3, May 2024. Checked: 2026-10-19. Location: Printed page 38 / PDF page 38, Extended E2.5 items 4-6.

Tier/scope: Extended

Teaching: Completing the square with a coefficient; Formula and discriminant

Practice IDs: q2, q3, q6

Still required:

- A broader reviewed bank across all listed solving methods.

### sat-math-20261019: Advanced Math / nonlinear equations

[Official specification reference](https://satsuite.collegeboard.org/k12-educators/about/alignment/math)

Version: Official live SAT table inspected 2026-10-19. Checked: 2026-10-19. Location: Table 1, SAT (not the subsequent PSAT tables).

Tier/scope: Digital SAT Math; quadratic subset

Teaching: Formula and discriminant

Practice IDs: q3, q4, q6

Still required:

- Rational, radical, exponential and other nonlinear equation families.

### sat-math-20261019: Advanced Math / nonlinear functions

[Official specification reference](https://satsuite.collegeboard.org/k12-educators/about/alignment/math)

Version: Official live SAT table inspected 2026-10-19. Checked: 2026-10-19. Location: Table 1, SAT (not the subsequent PSAT tables).

Tier/scope: Digital SAT Math; quadratic subset

Teaching: Three forms answer different questions; Models, restrictions and reasonableness

Practice IDs: q1, q5, q7

Still required:

- Broader nonlinear families and graph interpretation.
