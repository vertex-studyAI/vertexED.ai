# Quadratic equations, graphs and model restrictions

Subject: Mathematics · Unit: Nonlinear algebra · Revision: 2026-10-21.3

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original foundations in quadratic algebra, including skills relevant to SAT Advanced Math. This is not complete nonlinear-function coverage.

## Prerequisites

- Expand products of binomials.

- Solve linear equations and use square roots.

## Objectives

- Connect factor, expanded and vertex forms.

- Select a suitable method for finding roots.

- Interpret roots and turning points within a contextual domain.

## Three forms, different information

A quadratic has the form ax²+bx+c with a≠0. Expanded form shows the vertical intercept c and the direction of opening through the sign of a. Factored form a(x-r)(x-s), when available over the real numbers, shows roots r and s. Vertex form a(x-h)²+k shows the turning point (h,k) and the symmetry line x=h. These are representations of the same function, not different rules for different inputs. Convert between them by expansion, factorisation or completing the square. Always compare coefficients after expanding a proposed factorisation, especially when a is not one.

## Solving and counting real roots

The zero-product rule applies when a product equals zero: at least one factor must then be zero. It does not apply directly to a sum. If factorisation is inconvenient, the quadratic formula gives x=(-b±√(b²-4ac))/(2a). The discriminant b²-4ac is positive for two distinct real roots, zero for one repeated real root and negative for no real roots. A negative discriminant does not mean the expression is undefined as a real-valued function; it means its graph never crosses the horizontal axis. Completing the square also shows why a graph can have a minimum above zero.

## Interpreting a quadratic model

The vertex occurs at x=-b/(2a). Evaluate the original function there to obtain its height, rather than confusing the input with the output. A positive leading coefficient gives a minimum; a negative one gives a maximum over the unrestricted real domain. A practical model can restrict the input interval, so the vertex might lie outside the permitted region. Roots can also be mathematically valid but contextually impossible, such as a negative time after a stated start. Preserve those roots during calculation, then explain which the context admits. Check a proposed answer by substitution and use exact values until the final requested rounding.

## Choosing a method and checking transformations

Factorisation is efficient when the integer structure is visible, but failing to find integer factors does not prove that a quadratic has no real roots. The discriminant tests the real-root question directly. Completing the square is often better for optimisation because it exposes the bound and the equality condition together. The quadratic formula is general for a nonzero leading coefficient, but sign errors in -b and failure to divide the entire numerator by 2a remain common.

A graph is useful for checking the number and approximate location of roots, not for replacing exact algebra when exact answers are requested. Squaring both sides of another equation can produce a quadratic with extra roots because opposite signs have the same square. Substitute every candidate into the original unsquared equation. In a restricted-domain optimisation, compare feasible stationary points with included endpoints; a vertex outside the interval is not an available optimum. State whether the conclusion is a maximum attained by an input or merely a bound approached at an excluded endpoint.

## Choosing a physical root after solving the equation

A quadratic equation can produce two algebraically valid roots while the context permits only one. State the model’s domain before discarding a solution, and distinguish an excluded contextual root from an algebraic mistake. In a height-time model, negative time may describe an extension of the curve before the chosen start rather than a future event. The turning point gives an extremum of the quadratic, but it is relevant only if it lies inside the modelled interval. Checking the original expression at candidate times tests the arithmetic. The fictional model below assumes its quadratic rule holds until the object reaches the ground and ignores effects outside that scope.

## Optimise only inside the model's permitted domain

A quadratic's vertex is an unrestricted optimum on the real line when its curvature has the appropriate sign. A model may permit only a closed interval, whole-number inputs or times before a physical event. Evaluate the vertex only if it belongs to that domain, and otherwise compare the relevant boundaries. State the units of both input and output. A second mathematical root may be valid algebraically but outside a model's interpretation, so explain the exclusion instead of calling the algebra incorrect.

## Diagram: Solve then interpret a height model

Read the labelled relationships to follow this worked application. The roots are -2 s and 6 s; the model’s landing time is 6 s. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Find all roots: t² - 4t - 12 = 0 gives t = -2 and t = 6.
   Relationship to next step: retain only contextual times

2. Apply the domain: The model uses t ≥ 0, so landing occurs at 6 s.
   Relationship to next step: inspect the vertex within the interval

3. Check the maximum: h = 16 - (t - 2)² has maximum 16 m at 2 s.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “Three forms, different information” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: Three forms, different information

Worked examples: 1

Practise: q1, q2

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: Solving and counting real roots; Interpreting a quadratic model; Choosing a method and checking transformations

Worked examples: 2, 3

Practise: q3, q4

### Choosing a physical root after solving the equation

Read the application diagram “Solve then interpret a height model”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Choosing a physical root after solving the equation

Worked examples: 4

Practise: q5, application-check, error-analysis

### Apply and test the limits

Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.

Read: Optimise only inside the model's permitted domain

Worked examples: 4

Practise: depth-bounded-area, depth-integer-optimum, depth-units-model

## Worked example 1

Solve x²-5x+6=0.

1. Find two numbers with product 6 and sum -5: -2 and -3.

2. Write (x-2)(x-3)=0 and set each factor equal to zero.

3. Substitute 2 and 3 into the original expression.

Answer: x=2 or x=3.

## Worked example 2

Find the maximum of h(t)=-t²+6t+2 for 0≤t≤6.

1. Complete the square: h(t)=11-(t-3)².

2. The square is at least zero and t=3 is permitted.

3. At t=3 the output is 11; both interval endpoints give 2.

Answer: Maximum 11 at t=3.

## Worked example 3

Solve √(x+2)=x, keeping the original square-root domain.

1. The right side must be nonnegative, so x≥0.

2. Squaring gives x+2=x², with candidates 2 and -1.

3. Substitution admits 2 but rejects -1 because a square root is nonnegative.

Answer: x=2 only.

## Worked example 4

A fictional height model is h(t) = 12 + 4t - t² metres for t ≥ 0 until landing. Find when h = 0 and select the landing time.

1. Set 12 + 4t - t² = 0 and rearrange to t² - 4t - 12 = 0.

2. Factor as (t - 6)(t + 2) = 0 to obtain 6 and -2.

3. Only 6 satisfies t ≥ 0; substitution gives h(6) = 0.

Answer: The roots are -2 s and 6 s; the model’s landing time is 6 s.

## Misconceptions

- The vertex is always an x-intercept.
  Correction: It is a turning point; it lies on the x-axis only when its output is zero.

- Two factors mean two distinct roots.
  Correction: Repeated factors such as (x-2)² give one repeated root.

## Flashcards

### What does the sign of a tell you in ax²+bx+c?
Positive opens upward; negative opens downward.

### What does a(x-h)²+k reveal?
The vertex (h,k) and axis of symmetry x=h.

### How does the discriminant classify real roots?
Positive: two distinct; zero: repeated; negative: none.

### When may you set each factor to zero?
When their product equals zero.

### Why check the domain after solving a quadratic model?
Some algebraic roots or turning points may lie outside the meaningful inputs.

### Why must roots obtained after squaring be checked in the original equation?
Squaring loses sign information and can introduce candidates that do not satisfy the original equation.

### Why can an algebraic root be rejected in a model?
It may violate the stated contextual domain even though it solves the equation.

### Does the constant term give a quadratic model’s maximum?
No. It gives the value at input zero; the vertex and domain determine the relevant extremum.

## Practice 1 — foundation · 1 marks

What is the vertex of y=2(x-4)²-3?

A. (-4,-3)

B. (4,3)

C. (-3,4)

D. (4,-3)

Answer: (4,-3)

1. Compare with a(x-h)²+k.

2. Read h=4 and k=-3.

Marking points (one practice mark each):

- Identify (4,-3).

## Practice 2 — standard · 2 marks

Find the larger root of x²-7x+12=0.

Answer: 4.

1. Factor as (x-3)(x-4)=0.

2. The roots are 3 and 4, so the larger is 4.

Marking points (one practice mark each):

- Factor correctly.

- Select the larger root 4.

## Practice 3 — standard · 2 marks

Explain without plotting why x²+4x+5 has no real zero.

Answer: It equals (x+2)²+1, which is at least 1 for every real x.

1. Complete the square.

2. Use nonnegativity of a real square to establish a strictly positive minimum.

Marking points (one practice mark each):

- Write (x+2)²+1.

- Explain why the value cannot be zero.

## Practice 4 — extension · 3 marks

A rectangle has perimeter 24 cm and positive width x. Form its area function and justify its largest possible area.

Answer: A=x(12-x), 0<x<12. Since A=36-(x-6)², the maximum is 36 cm² at x=6.

1. Use length 12-x from the perimeter.

2. Multiply to obtain the area and complete the square.

3. The square is nonnegative and x=6 is feasible.

Marking points (one practice mark each):

- Set up A=x(12-x) with a feasible domain.

- Rewrite as 36-(x-6)².

- Justify 36 cm² as the maximum.

## Practice 5 — extension · 3 marks

A quadratic has discriminant 9 but neither root is a whole number. Is that possible? Explain with an example.

Answer: Yes. For 8x²-10x+91/32=0 the discriminant is 100-91=9. The roots are (10±3)/16, namely 7/16 and 13/16, both non-integers.

1. A positive square discriminant permits rational roots when coefficients are rational; it does not force whole-number roots.

2. For 8x²-10x+91/32=0 calculate discriminant 9.

3. Use the quadratic formula to obtain (10±3)/16, both non-integers.

Marking points (one practice mark each):

- A positive square discriminant permits rational roots when coefficients are rational; it does not force whole-number roots.

- For 8x²-10x+91/32=0 calculate discriminant 9.

- Use the quadratic formula to obtain (10±3)/16, both non-integers.

## Practice 6 — standard · 3 marks

A fictional height model is h(t) = 12 + 4t - t² metres for t ≥ 0 until landing. Find when h = 0 and select the landing time.

Answer: The roots are -2 s and 6 s; the model’s landing time is 6 s.

1. Set 12 + 4t - t² = 0 and rearrange to t² - 4t - 12 = 0.

2. Factor as (t - 6)(t + 2) = 0 to obtain 6 and -2.

3. Only 6 satisfies t ≥ 0; substitution gives h(6) = 0.

Marking points (one practice mark each):

- Set 12 + 4t - t² = 0 and rearrange to t² - 4t - 12 = 0.

- Factor as (t - 6)(t + 2) = 0 to obtain 6 and -2.

- Only 6 satisfies t ≥ 0; substitution gives h(6) = 0.

## Practice 7 — extension · 3 marks

A learner calls -2 an incorrect root and says the maximum height is 12 m because that is h(0). Correct both claims.

Answer: -2 is an algebraic root outside the time domain. The maximum is 16 m at t = 2 s.

1. Substitution confirms h(-2) = 0, although negative time is outside the stated model.

2. Complete the square: h(t) = 16 - (t - 2)².

3. The vertex is within the interval from 0 to 6, so the model reaches 16 m at t = 2.

Marking points (one practice mark each):

- Substitution confirms h(-2) = 0, although negative time is outside the stated model.

- Complete the square: h(t) = 16 - (t - 2)².

- The vertex is within the interval from 0 to 6, so the model reaches 16 m at t = 2.

## Practice 8 — standard · 3 marks

A rectangle has perimeter 20 cm and width x restricted to 1≤x≤3 cm. Find the maximum allowed area.

Answer: 21 cm² at x=3 cm.

1. Length is 10-x, so A=x(10-x); the unrestricted vertex x=5 lies outside the interval.

2. A increases on [1,3], or compare its endpoint values 9 and 21.

Marking points (one practice mark each):

- Form x(10-x).

- Reject the out-of-domain vertex.

- Find maximum 21 cm² at x=3.

## Practice 9 — extension · 3 marks

A fictional integer-output model is P(n)=-2n²+14n-8 for n∈{0,1,...,8}. Find every n giving maximum P.

Answer: n=3 and n=4 both give P=16.

1. The real vertex lies at n=14/4=3.5.

2. Compare the neighbouring allowed integers; concavity makes them the best integer candidates.

Marking points (one practice mark each):

- Find real vertex 3.5.

- Evaluate both 3 and 4.

- State both maximisers and value 16.

## Practice 10 — standard · 3 marks

A fictional height model h(t)=5+8t-2t² uses metres and seconds. State the required units of 5, 8 and -2, and explain why the terms can be added.

Answer: 5 has units m, 8 has units m/s, and -2 has units m/s²; after multiplication by t or t², each term has units m.

1. Every term in an equation for height must have height units.

2. Divide the required height unit by the appropriate power of time.

Marking points (one practice mark each):

- Give m for the constant.

- Give m/s and m/s² for the coefficients.

- Explain matching term units.

## Revision checklist

- Choose a representation for the question.

- Use the discriminant or substitution to check roots.

- Distinguish the turning-point input from its output.

- Explain the reasoning in “Solve then interpret a height model” and correct the linked error-analysis response without copying its solution.

## Revision guide

A quadratic equation can produce two algebraically valid roots while the context permits only one. State the model’s domain before discarding a solution, and distinguish an excluded contextual root from an algebraic mistake. In a height-time model, negative time may describe an extension of the curve before the chosen start rather than a future event. The turning point gives an extremum of the quadratic, but it is relevant only if it lies inside the modelled interval. Checking the original expression at candidate times tests the arithmetic. The fictional model below assumes its quadratic rule holds until the object reaches the ground and ignores effects outside that scope.

### Key ideas

- t² - 4t - 12 = 0 gives t = -2 and t = 6.

- The model uses t ≥ 0, so landing occurs at 6 s.

- h = 16 - (t - 2)² has maximum 16 m at 2 s.

- It is a turning point; it lies on the x-axis only when its output is zero.

### Retrieve without looking

- Why can an algebraic root be rejected in a model?

- Does the constant term give a quadratic model’s maximum?

- What does the sign of a tell you in ax²+bx+c?

Mixed practice: q1, application-check, error-analysis, depth-bounded-area, depth-integer-optimum, depth-units-model

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.
