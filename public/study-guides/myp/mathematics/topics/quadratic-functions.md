# Quadratic Functions

---

## 1. Key Concepts

### The Three Forms of a Quadratic

A quadratic function can be written in three equivalent forms, each revealing different information about the parabola.

**Standard form:** y = ax² + bx + c. The constant c is the y-intercept. The coefficient a tells you the direction of opening (a > 0: opens upward; a < 0: opens downward) and the vertical stretch. This form is easiest to use with the quadratic formula.

**Vertex form:** y = a(x − h)² + k. The vertex is immediately visible at (h, k). The axis of symmetry is x = h. This form is produced by completing the square from standard form.

**Factored form:** y = a(x − p)(x − q). The x-intercepts (roots/zeros) are immediately visible at x = p and x = q. This form is produced by factorising the quadratic.

All three forms co-exist for the same curve. N24 Q5b asked candidates to expand y = (1/2)(x − 4)² − 1 into standard form — a 2-mark "show that." The key steps are: expand (x − 4)² = x² − 8x + 16, then multiply each term by ½ to get y = (1/2)x² − 4x + 8, then subtract 1 from the constant to get y = (1/2)x² − 4x + 7. (N24 Q5b, 2 marks)

Do NOT forget to subtract the final constant after multiplying through — a common slip is writing +8 instead of +7.

---

### Finding the Vertex and Axis of Symmetry

The vertex is the turning point of the parabola: a minimum when a > 0, a maximum when a < 0. The axis of symmetry passes through the vertex.

**From standard form:** The x-coordinate of the vertex is x = −b/(2a). Substitute this value back into the equation to find the y-coordinate.

**From vertex form:** The vertex is (h, k) by inspection.

**From factored form:** The x-coordinate of the vertex lies exactly halfway between the two roots: x = (p + q)/2.

N20 Q2a (3 marks) asked for the maximum value of f(x) = −x(x − 5). The factored form shows roots at x = 0 and x = 5, so the axis of symmetry is x = (0 + 5)/2 = 2.5. Substituting: f(2.5) = −2.5(2.5 − 5) = −2.5 × (−2.5) = 6.25. The maximum value is 6.25. The mark scheme required: (1) identify x = 2.5 as the x-coordinate of the vertex; (2) correct substitution; (3) correct value 6.25. (N20 Q2a, 3 marks)

Do NOT just write down 6.25 without showing the x = 2.5 step — the mark scheme awards a method mark for identifying the x-coordinate first, before the substitution.

---

### Finding x-intercepts

The x-intercepts (zeros/roots) are the values of x where y = 0. There are three main methods.

**Factorisation:** Rewrite the quadratic as a product of two linear factors and set each to zero. Works cleanly when the roots are rational. N20 Q1f identified (4x² − 11x − 3) = (x − 3)(4x + 1), giving roots x = 3 and x = −1/4. (N20 Q1f, 1 mark)

**Quadratic formula:** x = (−b ± √(b² − 4ac)) / (2a). Works for any quadratic, including irrational roots. N24 Q5c asked for the x-intercepts of y = (1/2)x² − 4x + 7 (standard form from Q5b). Substituting a = 1/2, b = −4, c = 7: x = (4 ± √(16 − 4 × 0.5 × 7)) / (2 × 0.5) = (4 ± √(16 − 14)) / 1 = 4 ± √2. So x = 4 − √2 ≈ 2.6 and x = 4 + √2 ≈ 5.4. Final answer as coordinates: (2.6, 0) and (5.4, 0). (N24 Q5c, 4 marks)

**GDC (graphical calculator):** Trace or use the root/zero function to read x-intercepts from the graph. This is a valid method in the MYP exam — always state what the GDC gives before rounding.

N18 Q5c (4 marks) used the axis-of-symmetry approach to find the second root of g(x) = 0, given that one root is x = −3/2 and the vertex is at x = −2. The horizontal distance from −3/2 to −2 is −1/2, so the other root is −2 − 1/2 = −5/2. The mark scheme also accepted expanding g(x) = 0 and factorising: −4x² − 16x − 15 = 0 → (2x + 5)(2x + 3) = 0 → x = −5/2 or −3/2. (N18 Q5c, 4 marks)

Do NOT write the answer as −2.5 without showing the working when a method mark is involved — the mark scheme for N18 Q5c awards "−5/2 OE without working" only 3 marks, not 4.

---

### Transformations of Quadratics

Starting from the base function f(x) = x², the following transformations produce g(x) = a(x − h)² + k.

| Transformation | Effect on equation | Effect on graph |
|---|---|---|
| Vertical stretch by factor |a| | Replace a with |a| | Parabola narrows (|a| > 1) or widens (|a| < 1) |
| Reflection in x-axis | Negate a (a becomes −a) | Parabola flips upside down |
| Horizontal translation by h | Replace x with (x − h) | Shifts right h units (left if h < 0) |
| Vertical translation by k | Add k outside the bracket | Shifts up k units (down if k < 0) |

N18 Q5a (4 marks) asked to identify all transformations from f(x) = x² to g(x) = −4(x + 2)² + 1. The four steps are: (1) vertical stretch by factor 4; (2) reflection in the x-axis; (3) horizontal translation 2 units to the left (because x + 2 = x − (−2), so h = −2); (4) vertical translation 1 unit upward. The mark scheme accepted these in any order. (N18 Q5a, 4 marks)

N20 Q2b–Q2e (3 marks) applied a translation 2 units right to f(x) = −x(x − 5), giving g(x) = −(x − 2)(x − 7), then a reflection in the x-axis to give h(x) = (x − 2)(x − 7), and the minimum value of h(x) was −6.25 (the negative of the maximum of f). (N20 Q2b–2e)

Do NOT say "move left" when h is positive in (x − h)² — the sign inside the bracket is opposite to the direction of shift. x + 2 means shift left 2, not right 2.

Do NOT confuse a vertical stretch and a horizontal stretch — the mark scheme for N18 Q5a accepted either "vertical stretch by 4" or "horizontal stretch by 1/2" as equivalent descriptions.

---

### Sketching Parabolas

A complete sketch requires five features, labelled clearly:

1. **Vertex** — coordinates (h, k), labelled.
2. **Axis of symmetry** — dashed vertical line x = h, with equation written.
3. **y-intercept** — substitute x = 0 into the equation.
4. **x-intercepts** — solve the quadratic = 0 (if they exist).
5. **Direction of opening** — state whether a > 0 (opens up) or a < 0 (opens down).

N24 Q5a (3 marks) used the parabola y = (1/2)(x − 4)² − 1. Reading off vertex form: vertex (4, −1), axis of symmetry x = 4. The second symmetric point about x = 4 that matches (3, 3.5) is (5, 3.5). These were all draggable answers in a matching task. (N24 Q5a, 3 marks)

N24 Q1d (2 marks) required matching factorised-form equations to parabola graphs. The key skill is reading roots from factors: y = (x − 1)(x − 3) opens upward with roots x = 1 and x = 3; y = (1 − x)(x + 3) opens downward with roots x = 1 and x = −3. (N24 Q1d, 2 marks)

Do NOT forget to state the equation of the axis of symmetry — mark schemes treat the vertex coordinates and the axis of symmetry as separate scoreable features. Writing (4, −1) without x = 4 can cost a mark in a sketch question.

---

### Quadratics in Real-life Context (Modelling)

The MYP exam regularly embeds quadratic functions inside real-world contexts — ski ramps, projectile trajectories, bridges, smiley faces. The mathematics is identical, but questions require interpreting answers in context.

Key contextual considerations:
- The domain may be restricted (e.g. time t ≥ 0 only, or height h ≥ 0 only).
- A maximum value of a downward parabola may represent a peak height, maximum profit, or optimal speed.
- An x-intercept may represent the time an object hits the ground, the break-even point, or the width of an arch.
- State units in every answer (metres, seconds, etc.).

N18 Q6 modelled heart rate h(t) = 70(1.04)^t for a 16-year-old student, but a parallel pattern is seen across papers with quadratic models: the vertex gives the optimal/maximum value and must be interpreted in context. In N20 Q2a, the maximum 6.25 would represent (if contextualised) the peak of a trajectory. Mark schemes consistently reward linking the mathematical result back to its real-world meaning.

Do NOT leave an answer as a raw number when the question is set in a context — for instance, "the maximum is 6.25" without stating what quantity this represents will not gain the contextual interpretation mark in a criterion D question.

---

### Solving Quadratic Equations

A quadratic equation ax² + bx + c = 0 may have 0, 1, or 2 real solutions depending on the discriminant b² − 4ac:

- b² − 4ac > 0: two distinct real roots (the parabola crosses the x-axis twice).
- b² − 4ac = 0: one repeated root (the vertex sits on the x-axis).
- b² − 4ac < 0: no real roots (the parabola does not cross the x-axis).

Methods: factorisation, quadratic formula, completing the square, or GDC. The mark scheme for N24 Q5c explicitly showed two alternative methods (vertex form and standard form with quadratic formula) and awarded equal marks for both routes.

When using the quadratic formula, write out the full substitution line before simplifying. The mark scheme for N24 Q5c treated "correct substitution of coefficients" as a separate mark from "correct evaluation."

---

## 2. Past Questions

| Session | Q | Marks | Topic | Question summary | Key mark scheme note |
|---------|---|-------|-------|-----------------|---------------------|
| N18 | 5 (intro) | 3 | Transformations — identify | Identify stages transforming f(x)=x² to g(x)=−4(x+2)²+1 | Accept any order; accept vertical or horizontal stretch equivalent |
| N18 | 5a | 4 | Transformations — identify full list | List all four transformation stages f → g (interactive boxes) | Must name stretch, reflection, and both translations |
| N18 | 5b | 1 | Vertex — write down | Write down coordinates of vertex of g(x) | a=−2 and b=1; accept from diagram |
| N18 | 5c | 4 | Solving quadratic — find second root | Given one root x=−3/2, find other root of g(x)=0 | Axis of symmetry method or expand and factorise; −5/2 without working = 3 marks only |
| N20 | 1f | 1 | Factorising quadratics | Select correct factorisation of 4x²−11x−3 | (x−3)(4x+1) |
| N20 | 1g | 1 | Expanding double brackets | Select expansion of (2x+1)(5x−2) | 10x²+x−2 |
| N20 | 2a | 3 | Vertex — maximum value | Calculate maximum of f(x)=−x(x−5) | Must show x=2.5 as intermediate step; max=6.25 |
| N20 | 2b | 1 | Transformations — translation | Write down L (translation distance, right) | L=2 |
| N20 | 2c | 2 | Transformations — equation after translation | Determine equation of g(x) after translation 2 right | g(x)=−(x−2)(x−7) |
| N20 | 2d | 1 | Transformations — reflection in x-axis | Write down h(x) after reflection of g(x) in x-axis | h(x)=(x−2)(x−7) |
| N20 | 2e | 1 | Vertex — minimum after reflection | Write down minimum value of h(x) | −6.25 (negative of max); accept only if negative |
| N24 | 1d | 2 | Factored form — graph matching | Match two parabola graphs to factorised equations | y=(1−x)(x+3) and y=(x−1)(x−3) |
| N24 | 5a | 3 | Vertex form — reading features | Determine missing coordinates and axis of symmetry for y=(1/2)(x−4)²−1 | Vertex (4,−1); axis x=4; symmetric point (5, 3.5) |
| N24 | 5b | 2 | Expanding from vertex to standard form | Show that (1/2)(x−4)²−1 = (1/2)x²−4x+7 | Show that: both expansion steps must be visible |
| N24 | 5c | 4 | Solving quadratic — x-intercepts | Calculate x-intercepts to 1 d.p. | Two valid methods (vertex form or quadratic formula); answer as coordinates (2.6,0) and (5.4,0) |

---

## 3. Mark Scheme Insights

### What the mark scheme rewards

- **Showing the x-coordinate of the vertex as an explicit step** before substituting to find the maximum/minimum value. In N20 Q2a, mark point 1 is awarded for x = 2.5 even if the final value is wrong.
- **Writing the full quadratic formula substitution line** before simplifying. N24 Q5c marks correct substitution of a, b, c as a separate mark point.
- **Listing transformations in full** — each of stretch, reflection, and two translations is a separate mark. Combining two into one box still earns the marks (N18 Q5a: "ACCEPT seeing multiple transformations in same box").
- **Giving x-intercepts as coordinates** (not just x-values) when the question says "coordinates of x-intercepts." N24 Q5c: "(2.6, 0) AND (5.4, 0) — ACCEPT 2.6 and 5.4" (so coordinate form is preferred but values alone are accepted).
- **Using ± correctly in the quadratic formula.** Both roots must be found — mark schemes treat the two solutions as separate mark points or a single mark covering both.
- **Equivalent forms accepted:** −5/2 and −2.5 are equivalent; g(x) = −(x−2)(x−7) and g(x) = −x² + 9x − 14 are equivalent. The mark scheme uses "OE" (or equivalent).

### What the mark scheme penalises / does not accept

- **−5/2 without working scores only 3/4** in N18 Q5c — a method step is required for the fourth mark.
- **Describing the shift direction backwards** (e.g. "2 units right" for x + 2) — N18 Q5a requires "2 units left"; a right-shift answer is incorrect.
- **"The minimum is 6.25"** for h(x) = (x−2)(x−7) in N20 Q2e — the minimum must be negative (−6.25); the mark scheme explicitly says "ACCEPT only if negative."
- **Not rounding to the correct decimal place** — N24 Q5c requires 1 d.p.; 2.585… alone without rounding does not score the final mark.
- **Leaving the axis of symmetry as a number (4) rather than an equation (x = 4)** — N24 Q5a mark scheme says "DO NOT ACCEPT if not equation."
- **Incomplete expansion in a "show that"** — both intermediate steps must be visible (N24 Q5b). Writing only the final line without showing the expansion of (x−4)² scores only 1 mark.

---

## 4. Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Reading the sign of h incorrectly from vertex form: treating y=(x+2)² as a shift right by 2 | y=(x+2)²=y=(x−(−2))², so h=−2 and the shift is 2 units LEFT |
| Forgetting the ± in the quadratic formula and finding only one root | Always write ±√(discriminant) to produce both roots |
| Sign error in discriminant: computing b²+4ac instead of b²−4ac | The formula is −4ac; if a and c have the same sign, the term subtracts |
| Substituting into the formula with wrong signs for b (e.g. using +b instead of −b) | Write out a=…, b=…, c=… explicitly before substituting; b is the coefficient of x, including its sign |
| Finding x = −b/2a but forgetting to substitute back to find the y-coordinate of the vertex | The vertex has TWO coordinates; always substitute x back into the original function |
| "The vertex is at (−2, 1)" for g(x)=−4(x+2)²+1 but writing a=2, b=1 in N18 Q5b | a is the x-coordinate of the vertex; for (x+2)², the vertex x is −2, so a=−2 |
| Writing the axis of symmetry as a number (4) instead of an equation (x=4) | Always write x = [value] — it is a vertical LINE, not a point |
| Stopping after expanding to (1/2)x²−4x+8 in a "show that" question, without subtracting the 1 | Vertex form (1/2)(x−4)²−1 means subtract 1 from the expanded constant: 8−1=7 |
| Giving x-intercepts only as x-values (e.g. 2.6 and 5.4) when asked for coordinates | Write as coordinate pairs: (2.6, 0) and (5.4, 0) |
| Identifying a reflection as "reflection in y-axis" when the parabola flips vertically | A vertical flip (opening direction reversal) is a reflection in the x-axis, not the y-axis |

---

## 5. Revision Priorities

1. Learn the three forms (standard, vertex, factored) and what each one directly reveals — vertex location, intercepts, y-intercept — so you can choose the most efficient form for any question.
2. Practise using x = −b/(2a) to locate the vertex from standard form, then substituting back for the y-coordinate; also practise reading the vertex directly from vertex form.
3. Drill the quadratic formula with explicit substitution lines — write a = …, b = …, c = … before every substitution to eliminate sign errors.
4. Practise identifying and naming each of the four transformations from f(x) = x² to a(x − h)² + k: stretch, reflection, horizontal translation, vertical translation — in any order.
5. For "show that" questions involving expanding vertex form, show every intermediate step (expand the bracket; multiply by a; add/subtract the constant) — each step is a separate mark.
6. When matching factorised-form equations to graphs, locate the roots from the factors and check whether the parabola opens up (a > 0) or down (a < 0) before selecting.
7. In real-life contexts, always state what the vertex or x-intercepts represent physically, and include units in every answer.
