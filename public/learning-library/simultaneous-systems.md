# Simultaneous equations: methods, geometry and model checks

Subject: Mathematics · Unit: Algebra · Revision: 2026-10-21.2

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

### Retrieval practice

Close the notes and answer these extra prompts from memory. Self-review with the held explanation, name one gap, then retry later. This is study practice, not an automatic mark or mastery measurement.

Read: What a simultaneous solution means

Worked examples: 1

Practise: retrieval-01, retrieval-02, retrieval-03, retrieval-04, retrieval-05, retrieval-06, retrieval-07, retrieval-08, retrieval-09, retrieval-10, retrieval-11, retrieval-12, retrieval-13, retrieval-14, retrieval-15

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

## Practice 11 — foundation · 1 marks

Retrieval 1 — Simultaneous equations: methods, geometry and model checks: Answer from memory: What must a simultaneous solution satisfy?

Answer: Every original equation at once.

1. Identify the target idea: What must a simultaneous solution satisfy?

2. Compare your response with the held study explanation: Every original equation at once.

Marking points (one practice mark each):

- Accurately address: What must a simultaneous solution satisfy?

## Practice 12 — standard · 1 marks

Retrieval 2 — Simultaneous equations: methods, geometry and model checks: State the condition or distinction precisely: When is substitution particularly convenient?

Answer: When one variable is already isolated or easily isolated.

1. Identify the target idea: When is substitution particularly convenient?

2. Compare your response with the held study explanation: When one variable is already isolated or easily isolated.

Marking points (one practice mark each):

- Accurately address: When is substitution particularly convenient?

## Practice 13 — extension · 1 marks

Retrieval 3 — Simultaneous equations: methods, geometry and model checks: Explain the idea in your own words: What must be multiplied when scaling an equation?

Answer: Every term on both sides, including the constant.

1. Identify the target idea: What must be multiplied when scaling an equation?

2. Compare your response with the held study explanation: Every term on both sides, including the constant.

Marking points (one practice mark each):

- Accurately address: What must be multiplied when scaling an equation?

## Practice 14 — foundation · 1 marks

Retrieval 4 — Simultaneous equations: methods, geometry and model checks: Answer from memory: What does 0=7 during valid elimination imply?

Answer: The original system is inconsistent: no solution.

1. Identify the target idea: What does 0=7 during valid elimination imply?

2. Compare your response with the held study explanation: The original system is inconsistent: no solution.

Marking points (one practice mark each):

- Accurately address: What does 0=7 during valid elimination imply?

## Practice 15 — standard · 1 marks

Retrieval 5 — Simultaneous equations: methods, geometry and model checks: State the condition or distinction precisely: What does 0=0 alone tell you?

Answer: That equation adds no restriction; inspect the retained equation(s).

1. Identify the target idea: What does 0=0 alone tell you?

2. Compare your response with the held study explanation: That equation adds no restriction; inspect the retained equation(s).

Marking points (one practice mark each):

- Accurately address: What does 0=0 alone tell you?

## Practice 16 — extension · 1 marks

Retrieval 6 — Simultaneous equations: methods, geometry and model checks: Explain the idea in your own words: How many intersections do distinct parallel lines have?

Answer: None.

1. Identify the target idea: How many intersections do distinct parallel lines have?

2. Compare your response with the held study explanation: None.

Marking points (one practice mark each):

- Accurately address: How many intersections do distinct parallel lines have?

## Practice 17 — foundation · 1 marks

Retrieval 7 — Simultaneous equations: methods, geometry and model checks: Answer from memory: How do you recover pairs after solving a line/quadratic system?

Answer: Substitute each root into the line separately.

1. Identify the target idea: How do you recover pairs after solving a line/quadratic system?

2. Compare your response with the held study explanation: Substitute each root into the line separately.

Marking points (one practice mark each):

- Accurately address: How do you recover pairs after solving a line/quadratic system?

## Practice 18 — standard · 1 marks

Retrieval 8 — Simultaneous equations: methods, geometry and model checks: State the condition or distinction precisely: Why should variable units be declared in a model?

Answer: They make the equations interpretable and expose incompatible terms.

1. Identify the target idea: Why should variable units be declared in a model?

2. Compare your response with the held study explanation: They make the equations interpretable and expose incompatible terms.

Marking points (one practice mark each):

- Accurately address: Why should variable units be declared in a model?

## Practice 19 — extension · 1 marks

Retrieval 9 — Simultaneous equations: methods, geometry and model checks: Explain the idea in your own words: What must be checked before dividing by k-2?

Answer: Whether k=2 is possible; handle that case separately.

1. Identify the target idea: What must be checked before dividing by k-2?

2. Compare your response with the held study explanation: Whether k=2 is possible; handle that case separately.

Marking points (one practice mark each):

- Accurately address: What must be checked before dividing by k-2?

## Practice 20 — foundation · 1 marks

Retrieval 10 — Simultaneous equations: methods, geometry and model checks: Answer from memory: What is an independent check on an algebraic system solution?

Answer: Substitute the ordered pair into both original equations.

1. Identify the target idea: What is an independent check on an algebraic system solution?

2. Compare your response with the held study explanation: Substitute the ordered pair into both original equations.

Marking points (one practice mark each):

- Accurately address: What is an independent check on an algebraic system solution?

## Practice 21 — standard · 1 marks

Retrieval 11 — Simultaneous equations: methods, geometry and model checks: State the condition or distinction precisely: When are two linear equations dependent?

Answer: One entire equation, including its constant, is a nonzero multiple of the other.

1. Identify the target idea: When are two linear equations dependent?

2. Compare your response with the held study explanation: One entire equation, including its constant, is a nonzero multiple of the other.

Marking points (one practice mark each):

- Accurately address: When are two linear equations dependent?

## Practice 22 — extension · 1 marks

Retrieval 12 — Simultaneous equations: methods, geometry and model checks: Explain the idea in your own words: What does 0 = 1 after valid elimination mean?

Answer: The constraints are inconsistent, so there is no shared solution.

1. Identify the target idea: What does 0 = 1 after valid elimination mean?

2. Compare your response with the held study explanation: The constraints are inconsistent, so there is no shared solution.

Marking points (one practice mark each):

- Accurately address: What does 0 = 1 after valid elimination mean?

## Practice 23 — foundation · 1 marks

Retrieval 13 — Simultaneous equations: methods, geometry and model checks: Answer from memory: What must a simultaneous solution satisfy?

Answer: Every original equation at once.

1. Identify the target idea: What must a simultaneous solution satisfy?

2. Compare your response with the held study explanation: Every original equation at once.

Marking points (one practice mark each):

- Accurately address: What must a simultaneous solution satisfy?

## Practice 24 — standard · 1 marks

Retrieval 14 — Simultaneous equations: methods, geometry and model checks: State the condition or distinction precisely: When is substitution particularly convenient?

Answer: When one variable is already isolated or easily isolated.

1. Identify the target idea: When is substitution particularly convenient?

2. Compare your response with the held study explanation: When one variable is already isolated or easily isolated.

Marking points (one practice mark each):

- Accurately address: When is substitution particularly convenient?

## Practice 25 — extension · 1 marks

Retrieval 15 — Simultaneous equations: methods, geometry and model checks: Explain the idea in your own words: What must be multiplied when scaling an equation?

Answer: Every term on both sides, including the constant.

1. Identify the target idea: What must be multiplied when scaling an equation?

2. Compare your response with the held study explanation: Every term on both sides, including the constant.

Marking points (one practice mark each):

- Accurately address: What must be multiplied when scaling an equation?

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

Mixed practice: q1, application-check, error-analysis

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
