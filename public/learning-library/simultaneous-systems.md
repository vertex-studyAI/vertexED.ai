# Simultaneous equations: methods, geometry and model checks

Subject: Mathematics · Unit: Algebra · Revision: 2026-10-21.3

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original targeted practice for AQA 8300 A19 (linear systems; Higher extension for linear/quadratic), Cambridge 0580 Extended E2.5.4-5 (2025-2027), and the SAT two-variable linear-system skill. Partial crosswalk only; not a complete course or official examination paper.

## Prerequisites

- Rearrange a linear equation and distribute a negative sign.

- Substitute values into an equation and interpret an ordered pair.

## Objectives

- Solve and verify two-variable linear systems.

- Distinguish unique, inconsistent and dependent systems.

- Use substitution for a line and a quadratic curve.

- Interpret constraints and units in a contextual model.

## What a simultaneous solution means

A solution to a pair of equations must make both statements true at the same time. In two variables, report an ordered pair and keep the variable order fixed. Solving the first equation alone usually leaves infinitely many possibilities; the second condition restricts that set. Geometrically, each linear equation describes a line unless its coefficients collapse into a degenerate statement. Two nonparallel lines meet at one point, parallel distinct lines never meet, and equivalent equations describe the same line. A drawing helps you anticipate the answer but cannot always establish exact coordinates.

Before manipulating a system, organise both equations in a consistent form and note what the variables represent. For example, if x counts adult tickets and y counts child tickets, negative or fractional answers may be mathematically valid for the equations but invalid for the situation. This is a model check, not permission to round an inconvenient answer. A non-integer result can reveal incompatible assumptions or incorrectly recorded data.

## Elimination preserves shared solutions

Elimination forms a new equation by adding or subtracting multiples of the original equations. Multiplying an entire equation by a nonzero number preserves its solutions. Adding one equation to another is useful because any pair satisfying both also satisfies their sum. Retain one original equation as well as the new one: the sum alone loses information. Choose multipliers that make one variable's coefficients equal or opposite, then subtract or add as appropriate. Multiply the constant term too; failing to do so changes the equation.

After finding one variable, substitute into an original equation to recover the other. Check the resulting pair in both original equations, not just in a rearranged line that may contain the same arithmetic mistake. Keep fractions exact through the working where possible. If subtraction produces a contradiction such as 0=5, the system has no solution. If it produces 0=0, inspect the retained equation: for a pair of equivalent nondegenerate lines there are infinitely many shared points, not the unique solution (0,0).

## Substitution and non-linear intersections

Substitution replaces a variable by an equal expression. It is especially efficient when a variable is already isolated, such as y=2x+1. Replace every occurrence of y in the other equation and use parentheses around the substituted expression where needed. If the second equation is quadratic, the reduced equation may have two, one or no real roots. Recover y separately for each permissible x. Two x-values do not combine with all possible y-values indiscriminately; each ordered pair must come from the same substitution.

A line may cross a parabola twice, touch it once or miss it. A repeated root in the reduced quadratic signals a single intersection in this setting. This does not mean all systems have at most two solutions: that conclusion depends on the particular line/quadratic structure. The present lesson does not teach arbitrary higher-degree systems, numerical intersection algorithms or every special case involving algebraic fractions.

## Parameters and exceptional cases

For ax+by=e and cx+dy=f, the quantity ad-bc distinguishes a nonsingular coefficient system from a potentially exceptional one. If ad-bc is nonzero, ordinary elimination gives one solution. If it is zero, compare the constants as well: proportional variable coefficients alone cannot tell you whether the equations coincide or contradict each other. This coefficient test is a useful extension rather than a substitute for showing the requested algebra.

When a parameter is present, do not divide by an expression containing it before checking when that expression is zero. For x+y=4 and 2x+ky=8, subtraction gives (k-2)y=0. If k is not 2, y=0 and x=4. If k=2, the equations are equivalent and every point on x+y=4 works. The exceptional value belongs in the final conclusion even if the generic solution looks simple.

## Constructing and checking models

Translate each independent condition into an equation. State units before adding terms: multiplying a price per ticket by a ticket count produces a money amount, whereas adding a count directly to a money amount is meaningless. One equation might encode a total number and another a total cost. Solve the system, then return to the original situation and test whether the values satisfy all practical restrictions. A calculation cannot repair a missing or redundant condition.

For a graphical estimate, label the axes, use a scale fine enough to locate an intersection, and report an appropriate precision. A graph that appears parallel on a small screen may hide a distant intersection. Algebra can distinguish genuinely equal slopes from slopes that are only close. Conversely, a rough sketch can expose a sign error if an algebraic answer lies in a completely different region from the expected crossing.

## Syllabus boundary and revision method

The registered AQA point distinguishes linear systems from its Higher-tier line/quadratic extension. The Cambridge mapping is explicitly Extended and refers only to items 4 and 5 of E2.5 in the 2025-2027 version 3 syllabus. The SAT mapping here covers linear systems; the non-linear extension is not silently counted as completing every SAT algebra skill. Source dates and URLs are retained in the source register, and each crosswalk names the actual practice IDs.

Revise by selecting a method before calculating, explaining why it removes one variable, and verifying the answer independently. If the problem is contextual, finish with a sentence about what each value means. Your ability to reveal a solution or tick a revision checklist is not evidence that the method is mastered; retry a different problem without looking and compare the structure of the working.

## Recognising when two equations contain the same information

A system of linear equations describes shared constraints. If one equation is an exact nonzero multiple of another, it supplies no independent new constraint. Elimination then produces an identity, consistent with infinitely many real solutions along one line. If the left sides are proportional but the constants are not, elimination produces a contradiction and no solution. Do not divide by a parameter before checking whether it might be zero. For a consistent dependent system, parameterising one variable makes the solution set explicit. A single coordinate pair is only an example; presenting it alone can conceal the infinitely many solutions.

## Interpret elimination as a statement about all shared solutions

Elimination combines equations that every shared solution must satisfy. When the variables disappear, the remaining statement distinguishes coincident equations from inconsistent ones. Parameters require case splits where coefficients become zero. A nonlinear equation can intersect a line twice, once or not at all, so substituting an expression should be followed by solving and checking all candidates. A numerical answer is only part of a modelling task: restrictions such as nonnegative integer counts can make an algebraically consistent solution infeasible.

## Diagram: Classify a proportional system

Read the labelled relationships to follow this worked application. (x, y) = (7 - 2t, t) for every real t. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Compare coefficients: The second left side is three times x + 2y.
   Relationship to next step: include the right-hand side

2. Compare constants: 21 matches three times 7; 22 does not.
   Relationship to next step: distinguish identity from contradiction

3. State the solution set: Matching constants give a line of solutions; mismatched constants give none.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “What a simultaneous solution means” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: What a simultaneous solution means

Worked examples: 1

Practise: q1, q2, q3

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: Elimination preserves shared solutions; Substitution and non-linear intersections; Parameters and exceptional cases; Constructing and checking models; Syllabus boundary and revision method

Worked examples: 2, 3, 4

Practise: q4, q5, q6

### Recognising when two equations contain the same information

Read the application diagram “Classify a proportional system”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Recognising when two equations contain the same information

Worked examples: 5

Practise: q7, q8, application-check, error-analysis

### Apply and test the limits

Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.

Read: Interpret elimination as a statement about all shared solutions

Worked examples: 5

Practise: depth-parameter-system, depth-line-circle, depth-integer-feasibility

## Worked example 1

Solve 2x+3y=19 and x-y=2.

1. From the second equation, x=y+2.

2. Substitute: 2(y+2)+3y=19, so 5y=15 and y=3.

3. Then x=5. Check 10+9=19 and 5-3=2.

Answer: (x,y)=(5,3).

## Worked example 2

Classify 3x+6y=12 and x+2y=5.

1. Divide the first equation by 3 to obtain x+2y=4.

2. The same expression cannot equal both 4 and 5.

3. The lines have the same slope but different intercepts.

Answer: No solution.

## Worked example 3

Find the intersections of y=x+2 and y=x².

1. Equate the y-values: x²=x+2.

2. Factor x²-x-2=(x-2)(x+1), giving x=2 or x=-1.

3. Use y=x+2: y=4 or y=1, respectively.

Answer: (2,4) and (-1,1).

## Worked example 4

A group buys 12 tickets. Adult tickets cost 9 units and child tickets cost 5 units; the total is 84 units. Find both counts.

1. Let a and c be the adult and child counts: a+c=12 and 9a+5c=84.

2. Subtract 5(a+c)=60 to obtain 4a=24, so a=6.

3. Then c=6. Both counts are nonnegative integers and 54+30=84.

Answer: 6 adult and 6 child tickets.

## Worked example 5

Solve the real system x + 2y = 7 and 3x + 6y = 21. Express the full solution set using y = t.

1. The second equation is exactly three times the first.

2. Only one independent constraint remains, so set y = t.

3. Then x = 7 - 2t; substitution satisfies both original equations for every real t.

Answer: (x, y) = (7 - 2t, t) for every real t.

## Misconceptions

- A pair that satisfies one equation is a system solution.
  Correction: It must satisfy every original equation.

- Elimination giving 0=0 means both unknowns are zero.
  Correction: It indicates redundancy at that step; a retained nondegenerate equation may describe infinitely many solutions.

- A quadratic x-result can be paired with either recovered y.
  Correction: Substitute each x separately and keep its corresponding y.

## Flashcards

### What must a simultaneous solution satisfy?
Every original equation at once.

### When is substitution particularly convenient?
When one variable is already isolated or easily isolated.

### What must be multiplied when scaling an equation?
Every term on both sides, including the constant.

### What does 0=7 during valid elimination imply?
The original system is inconsistent: no solution.

### What does 0=0 alone tell you?
That equation adds no restriction; inspect the retained equation(s).

### How many intersections do distinct parallel lines have?
None.

### How do you recover pairs after solving a line/quadratic system?
Substitute each root into the line separately.

### Why should variable units be declared in a model?
They make the equations interpretable and expose incompatible terms.

### What must be checked before dividing by k-2?
Whether k=2 is possible; handle that case separately.

### What is an independent check on an algebraic system solution?
Substitute the ordered pair into both original equations.

### When are two linear equations dependent?
One entire equation, including its constant, is a nonzero multiple of the other.

### What does 0 = 1 after valid elimination mean?
The constraints are inconsistent, so there is no shared solution.

## Practice 1 — foundation · 1 marks

Which pair satisfies x+y=9 and x-y=3?

A. (6,3)

B. (3,6)

C. (9,3)

D. (6,-3)

Answer: (6,3)

1. Add the equations to obtain 2x=12.

2. Then x=6 and y=3 satisfy both equations.

Marking points (one practice mark each):

- Select (6,3).

## Practice 2 — standard · 2 marks

Solve 3x+2y=22 and x-y=4. Enter the value of x, showing how you recover y.

Answer: x=6; y=2.

1. Use x=y+4: 3(y+4)+2y=22.

2. Then y=2 and x=6; verify 18+4=22.

Marking points (one practice mark each):

- Obtain y=2 by valid elimination or substitution.

- Obtain and verify x=6.

## Practice 3 — standard · 2 marks

Classify 2x+4y=8 and x+2y=4, and describe their shared points.

Answer: Infinitely many: all points satisfying x+2y=4.

1. The first equation is twice the second.

2. Any point on the single line satisfies both.

Marking points (one practice mark each):

- Identify equivalent equations.

- Describe the infinite solution set.

## Practice 4 — standard · 2 marks

Solve y=x² and y=3x+4, giving ordered pairs.

Answer: (-1,1) and (4,16).

1. Set x²-3x-4=0 and factor (x-4)(x+1).

2. Substitute x=4 and x=-1 separately into y=3x+4.

Marking points (one practice mark each):

- Find both x-values.

- Recover both correct pairs.

## Practice 5 — extension · 3 marks

Explain why dividing (k-3)y=6 by k-3 without discussing k=3 can lose a necessary conclusion.

Answer: For k≠3, y=6/(k-3). For k=3 the equation becomes 0=6, so that case has no solution.

1. Identify when the proposed divisor is zero.

2. Solve the nonzero-divisor case.

3. Test the excluded value in the original equation.

Marking points (one practice mark each):

- Separate k=3.

- Give the expression when k≠3.

- Identify the contradiction at k=3.

## Practice 6 — standard · 2 marks

There are 20 notebooks: large ones cost 7 units and small ones cost 4 units. Total cost is 104 units. How many are large?

Answer: 8 large notebooks; 12 small.

1. Let l+s=20 and 7l+4s=104.

2. Subtract 4(l+s)=80 to get 3l=24, hence l=8.

Marking points (one practice mark each):

- Construct compatible equations.

- Solve and interpret the large count.

## Practice 7 — extension · 3 marks

A graph suggests two lines intersect at (2,5). Substitution gives 11 on the left of an equation whose right side is 12. How should this be reported?

Answer: The pair is not an exact solution; it may be a graphical estimate. Improve the graph or solve algebraically, then state the justified precision.

1. Distinguish approximate plotting from exact equality.

2. Use the failed substitution as evidence.

3. Explain how to refine the result.

Marking points (one practice mark each):

- Reject an exact-solution claim.

- Recognise possible approximation.

- Propose a valid refinement.

## Practice 8 — standard · 2 marks

For x+y=7 and 2x+2y=17, explain the result without solving for individual variables.

Answer: No solution: doubling the first equation requires 2x+2y=14, which conflicts with 17.

1. Double both sides of x+y=7.

2. Compare the contradictory constants.

Marking points (one practice mark each):

- Obtain the implied total 14.

- Explain inconsistency.

## Practice 9 — standard · 3 marks

Solve the real system x + 2y = 7 and 3x + 6y = 21. Express the full solution set using y = t.

Answer: (x, y) = (7 - 2t, t) for every real t.

1. The second equation is exactly three times the first.

2. Only one independent constraint remains, so set y = t.

3. Then x = 7 - 2t; substitution satisfies both original equations for every real t.

Marking points (one practice mark each):

- The second equation is exactly three times the first.

- Only one independent constraint remains, so set y = t.

- Then x = 7 - 2t; substitution satisfies both original equations for every real t.

## Practice 10 — extension · 3 marks

Replace the second equation with 3x + 6y = 22. A learner still claims infinitely many solutions because the coefficients match the same ratio. Explain the missing check.

Answer: There are no solutions: three times the first equation requires 3x + 6y = 21, contradicting 22.

1. Proportional left-side coefficients are not enough for dependence.

2. The constant must scale by the same factor.

3. Subtracting three times the first equation from the second gives 0 = 1.

Marking points (one practice mark each):

- Proportional left-side coefficients are not enough for dependence.

- The constant must scale by the same factor.

- Subtracting three times the first equation from the second gives 0 = 1.

## Practice 11 — extension · 3 marks

Solve x+y=4 and x+ky=6 for real x,y, distinguishing k=1 from other real k.

Answer: For k≠1, y=2/(k-1) and x=4-2/(k-1). For k=1 there is no solution.

1. Subtract the first equation to obtain (k-1)y=2.

2. Divide only for k≠1; when k=1 the statement 0=2 is impossible.

Marking points (one practice mark each):

- Derive (k-1)y=2.

- Give both values in the nonzero case.

- Explain inconsistency when k=1.

## Practice 12 — standard · 3 marks

Solve x+y=5 and x²+y²=13 over the reals, giving all ordered pairs.

Answer: (2,3) and (3,2).

1. Substitute y=5-x to get 2x²-10x+12=0.

2. Factor to obtain x=2 or 3, then recover y and check both equations.

Marking points (one practice mark each):

- Form the quadratic.

- Find both x values.

- Give and check both ordered pairs.

## Practice 13 — extension · 3 marks

A fictional venue sells only 4-unit and 7-unit tickets. Exactly 10 tickets bring in 53 units. Show whether nonnegative whole-number counts can satisfy the data.

Answer: No. If n counts 7-unit tickets, 7n+4(10-n)=53 gives n=13/3, which is not an integer.

1. Use both the ticket-count and revenue constraints.

2. Distinguish a real algebraic solution from a permissible count.

Marking points (one practice mark each):

- Form the revenue equation.

- Find n=13/3.

- Reject it for whole-number ticket counts.

## Revision checklist

- Choose and justify elimination or substitution.

- Check both original equations and practical restrictions.

- Distinguish contradiction, redundancy and unique intersection.

- Separate parameter values before dividing.

- Explain the reasoning in “Classify a proportional system” and correct the linked error-analysis response without copying its solution.

## Revision guide

A system of linear equations describes shared constraints. If one equation is an exact nonzero multiple of another, it supplies no independent new constraint. Elimination then produces an identity, consistent with infinitely many real solutions along one line. If the left sides are proportional but the constants are not, elimination produces a contradiction and no solution. Do not divide by a parameter before checking whether it might be zero. For a consistent dependent system, parameterising one variable makes the solution set explicit. A single coordinate pair is only an example; presenting it alone can conceal the infinitely many solutions.

### Key ideas

- The second left side is three times x + 2y.

- 21 matches three times 7; 22 does not.

- Matching constants give a line of solutions; mismatched constants give none.

- It must satisfy every original equation.

### Retrieve without looking

- When are two linear equations dependent?

- What does 0 = 1 after valid elimination mean?

- What must a simultaneous solution satisfy?

Mixed practice: q1, application-check, error-analysis, depth-parameter-system, depth-line-circle, depth-integer-feasibility

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.

## Partial syllabus crosswalk

Source-checked means the official point was inspected, not independently approved teaching or complete coverage.

### aqa-8300-algebra: A19

[Official specification reference](https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/subject-content/3.2-algebra)

Version: First teaching 2015; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Section 3.2; A11, A12, A18, A19.

Tier/scope: Additional Foundation linear systems; Higher line/quadratic extension

Teaching: Elimination preserves shared solutions; Substitution and non-linear intersections

Practice IDs: q2, q4, q7

Still required:

- More independently reviewed graphical estimates and mixed contexts.

### cambridge-0580-2025-2027: E2.5.4

[Official specification reference](https://www.cambridgeinternational.org/Images/662466-2025-2027-syllabus.pdf)

Version: Examinations 2025-2027, version 3, May 2024. Checked: 2026-10-19. Location: Printed page 38 / PDF page 38, Extended E2.5 items 4-6.

Tier/scope: Extended

Teaching: Elimination preserves shared solutions

Practice IDs: q2, q6

Still required:

- Wider fractional-coefficient and context practice; independent review.

### cambridge-0580-2025-2027: E2.5.5

[Official specification reference](https://www.cambridgeinternational.org/Images/662466-2025-2027-syllabus.pdf)

Version: Examinations 2025-2027, version 3, May 2024. Checked: 2026-10-19. Location: Printed page 38 / PDF page 38, Extended E2.5 items 4-6.

Tier/scope: Extended; one linear and one quadratic equation

Teaching: Substitution and non-linear intersections

Practice IDs: q4

Still required:

- Additional tangent/no-intersection and surd-result systems.

### sat-math-20261019: Algebra / two-variable linear systems

[Official specification reference](https://satsuite.collegeboard.org/k12-educators/about/alignment/math)

Version: Official live SAT table inspected 2026-10-19. Checked: 2026-10-19. Location: Table 1, SAT (not the subsequent PSAT tables).

Tier/scope: Digital SAT Math; partial skill

Teaching: Parameters and exceptional cases; Constructing and checking models

Practice IDs: q1, q2, q3, q5, q6, q8

Still required:

- Broader item difficulty, representation and time-pressure validation.
