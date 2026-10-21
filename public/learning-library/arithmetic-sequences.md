# Arithmetic sequences, finite sums and model checks

Subject: Mathematics · Unit: Sequences and series · Revision: 2026-10-21.2

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original teaching on constant-difference sequences, finite sums and approximate models. Partial links to IB DP AA/AI SL 1.2 and the MYP mathematics framework; not a complete IB unit, official assessment or mapping to the first-assessment-2029 courses.

## Prerequisites

- Substitute into an algebraic expression and solve a linear equation.

- Distinguish a value from its position in a list.

## Objectives

- Derive a term rule and a finite-sum formula from constant differences.

- Use sigma notation with correct bounds and count the terms.

- Recover missing parameters and evaluate the limitations of a real-world model.

## A sequence is an indexed rule

A sequence assigns a value to each permitted integer index. We write u_n for the value at position n, so u_4 means the fourth term, not four times u. This lesson begins indexing at n = 1. The sequence 7, 11, 15, 19 has first term 7 and a difference of 4 between consecutive terms. Arithmetic means this difference stays constant throughout the sequence being described. A repeated ratio is a different structure. Negative terms, fractional terms and a negative difference are all permitted; arithmetic does not mean increasing or positive.

Distinguish a finite list from a mathematical assumption about its continuation. Four observed values alone do not prove that every later difference will be identical. If a question states that the sequence is arithmetic, the rule is part of the model. If the values come from measurements, constancy must be investigated and may only be approximate. Record the index, units and proposed domain before calculating. For instance, a row number is a positive integer, whereas a measured length may be decimal. Do not report a fractional row number merely because an equation gives one.

## Deriving and using the term rule

Starting at u_1 = a, reaching term 2 requires one addition of d; reaching term 3 requires two. Consequently u_n = a + (n - 1)d. The factor n - 1 counts gaps, not terms. Substituting n = 1 should return a and is a useful immediate check. A recursive description gives the same sequence by u_1 = a and u_(n+1) = u_n + d. The explicit form reaches a distant term directly; the recursive form shows the repeated operation and is convenient in a spreadsheet.

Given two terms u_p and u_q with different indices, subtract their equations: u_q - u_p = (q - p)d. Divide by the difference in positions to recover d, then substitute into either equation to recover a. Using u_q - u_p alone mistakes a change over several gaps for the change over one gap. When searching for a term with value T, solve a + (n - 1)d = T, then check that n is an allowed integer and lies within any finite length. If d = 0, every term equals a; division by d is unavailable and the question must be considered directly.

## Why the finite-sum formula works

A series is a sum of sequence terms. Let S_n = a + (a+d) + ... + u_n. Write the same sum backwards underneath it. Each paired column has total a + u_n, and there are n columns. Therefore 2S_n = n(a + u_n), giving S_n = n(a + u_n)/2. Substituting u_n = a + (n - 1)d gives S_n = n[2a + (n - 1)d]/2. This argument works for negative or fractional differences and for odd n; it does not require physically dividing the terms into an integer number of separate pairs.

Use the first form when the endpoints are known and the second when a and d are known. The average of the first and last terms equals the average of all terms in an arithmetic sequence, but not in an arbitrary list. Keep track of what is being summed. If u_n measures seats in row n, S_n measures total seats over n rows. If u_n is a balance at successive dates, summing those balances generally does not mean total deposits. Translate the requested quantity before choosing a formula, and check small cases by direct addition.

## Sigma notation and partial sums

The symbol Σ instructs you to add an expression for consecutive integer values of an index. In Σ from k = 1 to 5 of (3k + 2), the terms are 5, 8, 11, 14 and 17. There are five terms, first term 5 and common difference 3, so the sum is 55. The letter k is a bound variable: replacing it consistently with j changes nothing. The lower and upper limits do matter. From k = 4 to k = 10 inclusive there are 10 - 4 + 1 = 7 terms, not six or ten.

For a partial segment of an arithmetic sequence, either identify its first and last terms and its length, or subtract cumulative sums. The sum from term p to term q inclusive is S_q - S_(p-1), with S_0 = 0. Subtracting S_p would remove term p as well. Expand a few terms before applying a formula whenever the bounds are unfamiliar. A calculator or spreadsheet can check the total, but it cannot correct an incorrectly chosen starting index. State the summand, bounds and number of terms so another reader can reconstruct the calculation.

## Modelling imperfect data

In a real situation the differences may fluctuate. Suppose four measured distances at equally spaced times are 12.0, 15.1, 17.9 and 21.2 cm. Their differences are 3.1, 2.8 and 3.3 cm. An endpoint-based estimate is d = (21.2 - 12.0)/3, approximately 3.067 cm per interval. This is one simple modelling choice, not a best-fit claim. A fitted line using all measurements might give different parameters. Specify the method used and compare the model predictions with the observations using residuals, observed minus predicted.

A near-constant difference can support an approximate arithmetic description over the observed interval, but does not establish the mechanism or justify indefinite extrapolation. Check whether conditions remain comparable and whether the proposed continuation violates capacity, time or physical constraints. If a row-length pattern eventually reaches a wall, the next mathematical term is not necessarily constructible. Predictions outside the observations need more caution than interpolation within them. Include units and suitable rounding, and keep enough precision during intermediate work to avoid magnifying rounding error.

## Explaining and checking a solution

A complete explanation connects structure, algebra and interpretation. First state why a constant-difference rule is appropriate. Next define a, d and n, including where indexing begins. Show substitution into the relevant term or sum formula, retain exact fractions when useful, and interpret the final number in the situation. If asked to explain, a calculator output alone is insufficient: describe why n - 1 counts gaps, why the average-of-endpoints method applies, or why a candidate index must be rejected.

Check the result independently where possible. Reconstruct two given terms from recovered parameters. Compare a finite sum against direct addition for a short list. For an increasing positive sequence, the average term must lie between the endpoints, so n times that average should lie between n times the smallest and largest terms. Constant sequences satisfy u_n = a and S_n = na. These boundary cases catch misplaced factors. During revision, try a descending sequence and non-unit starting bounds as well as a familiar increasing list. Success on one memorised example does not establish understanding of every representation.

## Separating a term from a cumulative total

A weekly quantity and the amount accumulated over several weeks answer different questions. If the weekly quantities increase by a fixed difference, they form an arithmetic sequence; their cumulative total is a sum of that sequence. Label the first week before substituting into a term formula so that the number of increases is one fewer than the week number. For a total, pair first and last terms or use the mean term multiplied by the number of terms. Check units as well: a weekly contribution has currency units in this discrete example, while the sum is the accumulated currency over the stated weeks. Extending the pattern assumes that the same increase remains feasible.

## Diagram: From a first term to a finite total

Each arrow changes the quantity being considered. A sequence term and a sum are different objects.

1. Start: a = 7: The first value has index 1.
   Relationship to next step: repeat the constant difference

2. Advance by d = 4: Each gap adds the same amount: 7, 11, 15, 19.
   Relationship to next step: stop at the chosen index

3. Select: u_4 = 19: Three gaps separate term 1 from term 4.
   Relationship to next step: sum the terms, not just the gaps

4. Accumulate: S_4 = 52: Add all four terms: 7 + 11 + 15 + 19.

## Diagram: Weekly contribution to accumulated savings

Read the labelled relationships to follow this worked application. Week 8: 33 units. Total: 180 units. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Start at week 1: The first contribution is 12 units.
   Relationship to next step: add seven differences

2. Reach week 8: Seven increases of 3 give a contribution of 33 units.
   Relationship to next step: average endpoints and multiply

3. Sum all eight weeks: The average contribution is 22.5, giving a total of 180 units.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Recognise and index

Generate the first four terms yourself. Explain why the explicit and recursive descriptions agree before choosing an answer.

Read: A sequence is an indexed rule; Deriving and using the term rule

Worked examples: 1, 2

Practise: q1, q2, q3

### Build a finite sum

Write the sum forwards and backwards. Expand unfamiliar sigma bounds before using the compact formula.

Read: Why the finite-sum formula works; Sigma notation and partial sums

Worked examples: 3, 4

Practise: q4, q5, q6, q10

### Challenge the model

Reject invalid indices and separate a convenient approximate pattern from a claim about the real world.

Read: Modelling imperfect data; Explaining and checking a solution

Worked examples: 5

Practise: q7, q8, q9

### Separating a term from a cumulative total

Use the diagram “Weekly contribution to accumulated savings” to explain the example, then attempt the application and diagnose the flawed reasoning without looking at the solution. Check each explanation against the practice marking points.

Read: Separating a term from a cumulative total

Worked examples: 6

Practise: application-check, error-analysis

### Retrieval practice

Close the notes and answer these extra prompts from memory. Self-review with the held explanation, name one gap, then retry later. This is study practice, not an automatic mark or mastery measurement.

Read: A sequence is an indexed rule

Worked examples: 1

Practise: retrieval-01, retrieval-02, retrieval-03, retrieval-04, retrieval-05, retrieval-06, retrieval-07, retrieval-08, retrieval-09, retrieval-10, retrieval-11, retrieval-12, retrieval-13

## Worked example 1

Find term 18 of the arithmetic sequence 7, 11, 15, ...

1. Identify a = 7 and d = 4.

2. There are 17 gaps before term 18, so u_18 = 7 + 17 × 4 = 75.

3. Check u_1 = 7 and u_2 = 11 using the same rule.

Answer: 75

## Worked example 2

An arithmetic sequence has u_4 = 17 and u_10 = 41. Find a and d.

1. The increase 41 - 17 = 24 spans 10 - 4 = 6 gaps.

2. d = 24/6 = 4.

3. 17 = a + 3 × 4 gives a = 5; check a + 9d = 41.

Answer: a = 5, d = 4

## Worked example 3

Find the sum of the first 12 terms of 9, 14, 19, ...

1. a = 9, d = 5; u_12 = 9 + 11 × 5 = 64.

2. S_12 = 12(9 + 64)/2 = 438.

3. The average term is 36.5, between 9 and 64.

Answer: 438

## Worked example 4

Evaluate Σ from k = 3 to 8 of (2k - 1).

1. The first term is 5 and the last is 15.

2. There are 8 - 3 + 1 = 6 terms.

3. The sum is 6(5 + 15)/2 = 60; direct terms are 5, 7, 9, 11, 13, 15.

Answer: 60

## Worked example 5

A proposed arithmetic row model has 10 seats in row 1 and adds 3 per row. Can a row contain exactly 50 seats?

1. Solve 10 + 3(n - 1) = 50.

2. n = 1 + 40/3 = 43/3, not an integer.

3. Rows 14 and 15 contain 49 and 52 seats, so neither gives 50.

Answer: No integer row has exactly 50 seats under this model.

## Worked example 6

A fictional savings plan contributes 12 units in week 1 and increases the weekly contribution by 3 units. Find the week-8 contribution and the total contributed over weeks 1 to 8.

1. There are seven increases, so the eighth contribution is 12 + 7 × 3 = 33.

2. The mean of the first and last contributions is (12 + 33)/2 = 22.5.

3. Eight contributions total 8 × 22.5 = 180 units.

Answer: Week 8: 33 units. Total: 180 units.

## Misconceptions

- The nth term is a + nd.
  Correction: For indexing from 1 there are n - 1 gaps; a + nd would produce a + d at n = 1.

- The average of the endpoints gives the average for any sequence.
  Correction: That shortcut follows from constant differences and cannot be assumed for an arbitrary list.

- An arithmetic fit proves future measurements follow the same rule.
  Correction: A fit is conditional on its assumptions and observed range; extrapolation needs further evidence.

## Flashcards

### What makes a sequence arithmetic?
A constant difference u_(n+1) - u_n across its stated domain.

### Why does u_n contain n - 1?
Starting at index 1, reaching index n requires n - 1 additions.

### How do you recover d from u_p and u_q?
d = (u_q - u_p)/(q - p), for p ≠ q.

### State two equivalent arithmetic sum formulas.
S_n = n(a + u_n)/2 = n[2a + (n - 1)d]/2.

### What does a series represent?
A sum of terms, rather than the ordered sequence itself.

### How many integer terms run from p to q inclusive?
q - p + 1, assuming q ≥ p.

### How do cumulative sums give terms p through q?
S_q - S_(p-1); subtracting S_p would omit the first required term.

### What must be checked after solving for an index?
The index must be an allowed integer and respect any length or contextual constraints.

### What happens when d = 0?
All terms equal a, and S_n = na. Do not divide by d to find an index.

### What is a residual?
Observed value minus the model prediction, using the stated sign convention.

### Why state the model-fitting method?
An endpoint estimate and a fit using all observations can give different parameters.

### Does changing the sigma index letter change a sum?
No, if the bound variable is replaced consistently and the limits are unchanged.

### How many increases separate term 1 and term n?
n - 1 increases.

### How can the mean of the first and last terms give an arithmetic total?
Multiply that mean by the number of terms, when the difference between consecutive terms is constant.

## Practice 1 — foundation · 2 marks

Which formula gives 6, 10, 14, ... when indexing begins at n = 1?

A. 6n + 4

B. 4n + 2

C. 4n + 6

D. 2n + 4

Answer: 4n + 2

1. The difference is 4 and the first term is 6.

2. 6 + 4(n - 1) simplifies to 4n + 2.

Marking points (one practice mark each):

- Identify d = 4.

- Select 4n + 2.

## Practice 2 — standard · 2 marks

Find u_25 for a = 13 and d = -2.

Answer: -35

1. There are 24 gaps.

2. u_25 = 13 + 24(-2) = -35.

Marking points (one practice mark each):

- Use 24 gaps.

- Obtain -35.

## Practice 3 — standard · 2 marks

If u_3 = 14 and u_9 = 38 in an arithmetic sequence, find its first term.

Answer: 6

1. d = (38 - 14)/(9 - 3) = 4.

2. a = 14 - 2 × 4 = 6.

Marking points (one practice mark each):

- Recover d = 4.

- Recover a = 6.

## Practice 4 — standard · 3 marks

Find the sum of the first 20 terms of 3, 8, 13, ...

Answer: 1010

1. u_20 = 3 + 19 × 5 = 98.

2. S_20 = 20(3 + 98)/2 = 1010.

Marking points (one practice mark each):

- Obtain last term 98.

- Apply the endpoint sum formula.

- Obtain 1010.

## Practice 5 — standard · 2 marks

How many terms occur in Σ from k = 5 to 12 of (7 - 2k)?

A. 7

B. 12

C. 8

D. 5

Answer: 8

1. Both endpoints are included.

2. 12 - 5 + 1 = 8.

Marking points (one practice mark each):

- Count inclusively.

- Select 8.

## Practice 6 — standard · 2 marks

Evaluate Σ from k = 4 to 9 of (3k + 1).

Answer: 123

1. The six terms run from 13 to 28 with difference 3.

2. Their sum is 6(13 + 28)/2 = 123.

Marking points (one practice mark each):

- Identify endpoints and six terms.

- Obtain 123.

## Practice 7 — standard · 3 marks

An arithmetic model has a = 8 and d = 5. Explain why 100 is not a term.

Answer: Solving gives n = 19.4, which is not an allowed integer index.

1. 8 + 5(n - 1) = 100 gives n - 1 = 18.4.

2. Thus n = 19.4; the neighbouring terms are 98 and 103.

Marking points (one practice mark each):

- Set up the term equation.

- Find n = 19.4.

- Reject a non-integer index.

## Practice 8 — extension · 4 marks

Measurements at equal intervals are 10.0, 12.2, 13.9 and 16.1. Propose an endpoint-based arithmetic model and give two limitations.

Answer: u_n = 10 + (61/30)(n - 1), approximately 10 + 2.0333(n - 1); differences vary and extrapolation is conditional.

1. The endpoint change 6.1 spans three intervals, so d = 6.1/3.

2. Actual differences 2.2, 1.7 and 2.2 are not equal.

3. The model does not use every point to optimise fit and does not establish constant future change.

Marking points (one practice mark each):

- Use three gaps.

- State an appropriate term rule.

- Recognise the varying differences.

- Explain a fit or extrapolation limitation.

## Practice 9 — extension · 3 marks

Explain why the arithmetic sum formula remains valid for an odd number of terms.

Answer: Adding the forward and reversed sums creates n equal column pairs regardless of whether n is odd.

1. Write two copies of S_n, one in reverse.

2. Every column totals a + u_n, so 2S_n = n(a + u_n); dividing by two does not require n/2 to be an integer.

Marking points (one practice mark each):

- Use two complete copies of the sum.

- Identify equal column totals.

- Explain that parity does not affect the argument.

## Practice 10 — extension · 3 marks

A hall has 18 rows. Row 1 has 16 seats and each next row adds 2. How many seats are in rows 7 through 18 inclusive?

Answer: 468

1. Row 7 has 16 + 6 × 2 = 28; row 18 has 50.

2. There are 12 rows, so their total is 12(28 + 50)/2 = 468.

Marking points (one practice mark each):

- Find endpoints 28 and 50.

- Count 12 rows.

- Obtain 468.

## Practice 11 — standard · 3 marks

A fictional savings plan contributes 12 units in week 1 and increases the weekly contribution by 3 units. Find the week-8 contribution and the total contributed over weeks 1 to 8.

Answer: Week 8: 33 units. Total: 180 units.

1. There are seven increases, so the eighth contribution is 12 + 7 × 3 = 33.

2. The mean of the first and last contributions is (12 + 33)/2 = 22.5.

3. Eight contributions total 8 × 22.5 = 180 units.

Marking points (one practice mark each):

- There are seven increases, so the eighth contribution is 12 + 7 × 3 = 33.

- The mean of the first and last contributions is (12 + 33)/2 = 22.5.

- Eight contributions total 8 × 22.5 = 180 units.

## Practice 12 — extension · 3 marks

A learner gives 12 + 8 × 3 = 36 as the eighth contribution. Explain the indexing error and verify the repaired rule at week 1.

Answer: They counted eight increases instead of seven. The rule is a_n = 12 + 3(n - 1), which gives 12 at n = 1.

1. Week 1 is the starting value before any increase.

2. Reaching week 8 takes seven transitions.

3. Substituting n = 1 into the repaired rule returns the stated initial value.

Marking points (one practice mark each):

- Week 1 is the starting value before any increase.

- Reaching week 8 takes seven transitions.

- Substituting n = 1 into the repaired rule returns the stated initial value.

## Practice 13 — foundation · 1 marks

Retrieval 1 — Arithmetic sequences, finite sums and model checks: Answer from memory: What makes a sequence arithmetic?

Answer: A constant difference u_(n+1) - u_n across its stated domain.

1. Identify the target idea: What makes a sequence arithmetic?

2. Compare your response with the held study explanation: A constant difference u_(n+1) - u_n across its stated domain.

Marking points (one practice mark each):

- Accurately address: What makes a sequence arithmetic?

## Practice 14 — standard · 1 marks

Retrieval 2 — Arithmetic sequences, finite sums and model checks: State the condition or distinction precisely: Why does u_n contain n - 1?

Answer: Starting at index 1, reaching index n requires n - 1 additions.

1. Identify the target idea: Why does u_n contain n - 1?

2. Compare your response with the held study explanation: Starting at index 1, reaching index n requires n - 1 additions.

Marking points (one practice mark each):

- Accurately address: Why does u_n contain n - 1?

## Practice 15 — extension · 1 marks

Retrieval 3 — Arithmetic sequences, finite sums and model checks: Explain the idea in your own words: How do you recover d from u_p and u_q?

Answer: d = (u_q - u_p)/(q - p), for p ≠ q.

1. Identify the target idea: How do you recover d from u_p and u_q?

2. Compare your response with the held study explanation: d = (u_q - u_p)/(q - p), for p ≠ q.

Marking points (one practice mark each):

- Accurately address: How do you recover d from u_p and u_q?

## Practice 16 — foundation · 1 marks

Retrieval 4 — Arithmetic sequences, finite sums and model checks: Answer from memory: State two equivalent arithmetic sum formulas.

Answer: S_n = n(a + u_n)/2 = n[2a + (n - 1)d]/2.

1. Identify the target idea: State two equivalent arithmetic sum formulas.

2. Compare your response with the held study explanation: S_n = n(a + u_n)/2 = n[2a + (n - 1)d]/2.

Marking points (one practice mark each):

- Accurately address: State two equivalent arithmetic sum formulas.

## Practice 17 — standard · 1 marks

Retrieval 5 — Arithmetic sequences, finite sums and model checks: State the condition or distinction precisely: What does a series represent?

Answer: A sum of terms, rather than the ordered sequence itself.

1. Identify the target idea: What does a series represent?

2. Compare your response with the held study explanation: A sum of terms, rather than the ordered sequence itself.

Marking points (one practice mark each):

- Accurately address: What does a series represent?

## Practice 18 — extension · 1 marks

Retrieval 6 — Arithmetic sequences, finite sums and model checks: Explain the idea in your own words: How many integer terms run from p to q inclusive?

Answer: q - p + 1, assuming q ≥ p.

1. Identify the target idea: How many integer terms run from p to q inclusive?

2. Compare your response with the held study explanation: q - p + 1, assuming q ≥ p.

Marking points (one practice mark each):

- Accurately address: How many integer terms run from p to q inclusive?

## Practice 19 — foundation · 1 marks

Retrieval 7 — Arithmetic sequences, finite sums and model checks: Answer from memory: How do cumulative sums give terms p through q?

Answer: S_q - S_(p-1); subtracting S_p would omit the first required term.

1. Identify the target idea: How do cumulative sums give terms p through q?

2. Compare your response with the held study explanation: S_q - S_(p-1); subtracting S_p would omit the first required term.

Marking points (one practice mark each):

- Accurately address: How do cumulative sums give terms p through q?

## Practice 20 — standard · 1 marks

Retrieval 8 — Arithmetic sequences, finite sums and model checks: State the condition or distinction precisely: What must be checked after solving for an index?

Answer: The index must be an allowed integer and respect any length or contextual constraints.

1. Identify the target idea: What must be checked after solving for an index?

2. Compare your response with the held study explanation: The index must be an allowed integer and respect any length or contextual constraints.

Marking points (one practice mark each):

- Accurately address: What must be checked after solving for an index?

## Practice 21 — extension · 1 marks

Retrieval 9 — Arithmetic sequences, finite sums and model checks: Explain the idea in your own words: What happens when d = 0?

Answer: All terms equal a, and S_n = na. Do not divide by d to find an index.

1. Identify the target idea: What happens when d = 0?

2. Compare your response with the held study explanation: All terms equal a, and S_n = na. Do not divide by d to find an index.

Marking points (one practice mark each):

- Accurately address: What happens when d = 0?

## Practice 22 — foundation · 1 marks

Retrieval 10 — Arithmetic sequences, finite sums and model checks: Answer from memory: What is a residual?

Answer: Observed value minus the model prediction, using the stated sign convention.

1. Identify the target idea: What is a residual?

2. Compare your response with the held study explanation: Observed value minus the model prediction, using the stated sign convention.

Marking points (one practice mark each):

- Accurately address: What is a residual?

## Practice 23 — standard · 1 marks

Retrieval 11 — Arithmetic sequences, finite sums and model checks: State the condition or distinction precisely: Why state the model-fitting method?

Answer: An endpoint estimate and a fit using all observations can give different parameters.

1. Identify the target idea: Why state the model-fitting method?

2. Compare your response with the held study explanation: An endpoint estimate and a fit using all observations can give different parameters.

Marking points (one practice mark each):

- Accurately address: Why state the model-fitting method?

## Practice 24 — extension · 1 marks

Retrieval 12 — Arithmetic sequences, finite sums and model checks: Explain the idea in your own words: Does changing the sigma index letter change a sum?

Answer: No, if the bound variable is replaced consistently and the limits are unchanged.

1. Identify the target idea: Does changing the sigma index letter change a sum?

2. Compare your response with the held study explanation: No, if the bound variable is replaced consistently and the limits are unchanged.

Marking points (one practice mark each):

- Accurately address: Does changing the sigma index letter change a sum?

## Practice 25 — foundation · 1 marks

Retrieval 13 — Arithmetic sequences, finite sums and model checks: Answer from memory: How many increases separate term 1 and term n?

Answer: n - 1 increases.

1. Identify the target idea: How many increases separate term 1 and term n?

2. Compare your response with the held study explanation: n - 1 increases.

Marking points (one practice mark each):

- Accurately address: How many increases separate term 1 and term n?

## Revision checklist

- Explain the n - 1 in the term rule without memorised wording.

- Derive the sum formula using a reversed copy.

- Check sigma bounds and integer-index constraints.

- State assumptions and limits for an approximate model.

- Explain the reasoning in “Weekly contribution to accumulated savings” and correct the linked error-analysis response without copying its solution.

## Revision guide

Arithmetic structure is constant additive change. Define the first index, count gaps for terms and count included terms for sums. For measured data, explain how the model was chosen and where it may fail.

### Key ideas

- A term u_n is one value; S_n is a cumulative total.

- Between positions p and q there are q - p gaps but q - p + 1 included terms.

- Integer-domain checks and context can reject an algebraic solution.

### u_n = a + (n - 1)d
a is the first term, d the constant difference.
Conditions: Indexing starts at 1; n is a permitted positive integer.

### S_n = n(a + u_n)/2
Number of terms multiplied by the average endpoint value.
Conditions: The summed terms form an arithmetic sequence.

### Σ from k = p to q of u_k = S_q - S_(p-1)
Remove the cumulative sum before the first required term.
Conditions: 1 ≤ p ≤ q, integer bounds and S_0 = 0.

### Retrieve without looking

- Derive the term rule from a diagram of gaps.

- Explain why endpoint averaging works here.

- Give a situation in which an arithmetic extrapolation becomes impossible.

Mixed practice: q2, q6, q8, q10, application-check, error-analysis

After checking your reasoning, return on a later day without the notes. Change the sign of d and the sigma bounds; compare the method, not just the remembered answer.

## Partial syllabus crosswalk

Source-checked means the official point was inspected, not independently approved teaching or complete coverage.

### ib-dp-aa-2021-sequences: SL 1.2

[Official specification reference](https://www.ibo.org/globalassets/new-structure/university-admission/pdfs/dp-mathematics-analysis-and-approaches-guide-en.pdf)

Version: First assessment 2021 guide; selected indexed table inspected 2026-10-19. Checked: 2026-10-19. Location: Indexed printed page 29, SL 1.2 and SL 1.3 content rows.

Tier/scope: SL content in the first-assessment-2021 guide; not a 2029 mapping

Teaching: A sequence is an indexed rule; Deriving and using the term rule; Why the finite-sum formula works; Sigma notation and partial sums; Modelling imperfect data; Explaining and checking a solution

Practice IDs: q1, q2, q3, q4, q5, q6, q7, q8, q9, q10

Still required:

- Independent subject review and complete course coverage remain outstanding.

- Official indexed excerpts were inspected, not a complete rendered or byte-verified PDF. School sequencing and assessment requirements need separate checks.

### ib-dp-ai-2021-sequences: SL 1.2

[Official specification reference](https://www.ibo.org/globalassets/new-structure/university-admission/pdfs/subject-guides/mathematics-applications-interpretation-guide.pdf)

Version: First assessment 2021 guide; selected indexed table inspected 2026-10-19. Checked: 2026-10-19. Location: Indexed printed page 27, SL 1.2 and SL 1.3 content rows; indexed guide cover.

Tier/scope: SL content in the first-assessment-2021 guide; not a 2029 mapping

Teaching: A sequence is an indexed rule; Deriving and using the term rule; Why the finite-sum formula works; Sigma notation and partial sums; Modelling imperfect data; Explaining and checking a solution

Practice IDs: q1, q2, q3, q4, q5, q6, q7, q8, q9, q10

Still required:

- Independent subject review and complete course coverage remain outstanding.

- Official indexed excerpts were inspected, not a complete rendered or byte-verified PDF. School sequencing and assessment requirements need separate checks.

### ib-myp-mathematics-20261019: Representing and modelling situations

[Official specification reference](https://ibo.org/programmes/middle-years-programme/curriculum/mathematics/)

Version: Official page last updated 19 February 2026; inspected 2026-10-19. Checked: 2026-10-19. Location: Introductory framework paragraph on representing information and modelling situations.

Tier/scope: Public MYP framework skill only; no year, Standard/Extended tier or eAssessment equivalence inferred

Teaching: Modelling imperfect data

Practice IDs: q8

Still required:

- School-selected unit and level mapping, full subject-guide inspection and independent review remain required.
