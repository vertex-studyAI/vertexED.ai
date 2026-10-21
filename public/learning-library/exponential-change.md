# Exponential growth, decay and changing time units

Subject: Mathematics · Unit: Functions and modelling · Revision: 2026-10-21.2

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original digital SAT nonlinear-function and nonlinear-equation practice, checked against the official SAT Math skill table on 2026-10-19. Covers constant-factor models, not every nonlinear family or every SAT item format.

## Prerequisites

- Convert percentages to decimals and multiply powers.

- Distinguish an initial value from a rate of change.

## Objectives

- Build and interpret a constant-factor model.

- Convert a growth factor between time units.

- Distinguish linear changes from exponential changes.

- Check model assumptions and discrete-time restrictions.

## Equal intervals and equal factors

A positive exponential model can be written P(t)=A b^t with A>0 and b>0. The variable t counts intervals of a stated duration. A is the value when t=0, while b is the multiplier for one such interval. If b>1 the quantity grows; if 0<b<1 it decays. The special value b=1 gives a constant quantity. Do not call b itself a percentage rate: b=1.08 represents an 8% increase, whereas b=0.92 represents an 8% decrease.

An exponential model has a constant ratio over equal intervals, not a constant difference. A table with values 40, 60, 90 and 135 at equal time steps has ratio 1.5. Its differences increase. A table with values 40, 60, 80 and 100 has constant difference 20 and is linear instead. Unequal time intervals require different comparisons; reading the time labels is part of the mathematics.

## Compounding and percentage reversal

A percentage change applies to the current amount. After two increases of r expressed as a decimal, the factor is (1+r)², not 1+2r. Similarly, a reduction by r gives factor 1-r. An increase followed by an equal percentage decrease has factor (1+r)(1-r)=1-r², so it does not return to the original amount unless r=0. This happens because the second percentage uses a different base.

To undo a multiplicative change, divide by its factor. A 20% reduction leaves factor 0.8; returning to the starting value requires multiplication by 1/0.8=1.25, which is a 25% increase from the reduced amount. State the reference quantity whenever you interpret a percentage. These are hypothetical numerical models, not predictions or recommendations about financial products.

## Changing the time unit

If an annual multiplier is b and t is measured in months, use b^(t/12), equivalently (b^(1/12))^t. The monthly multiplier is the twelfth root of the annual multiplier under the constant-factor model. Dividing the annual percentage rate by 12 is generally only an approximation and does not preserve exact compounding. Conversely, a factor g per month gives g^12 per year.

A model A b^(t/k) applies one factor b every k units of t. To interpret it, first identify the unit of t and the meaning of k. For a quantity halving every five hours, P(t)=A(1/2)^(t/5). At ten hours the exponent is 2, so one quarter remains. Fractional exponents interpolate continuously; if the actual process updates only at fixed events, that interpolation is a modelling assumption rather than a directly observed state.

## Recovering parameters and thresholds

Two positive observations can determine A and b once the time origin and interval length are fixed. Divide the later quantity by the earlier quantity to cancel A, then account for the number of intervals separating them. If P(2)=72 and P(5)=243, then b³=243/72=27/8, so b=3/2, and A=72/(3/2)²=32. Substitution into both observations checks both parameters.

Some equations can be solved by recognising powers, such as 3^t=81. More general equations may require logarithms or a graph, but those procedures are not the focus of this lesson. For a threshold in a discrete process, do not report a fractional update count. Check the neighbouring integers and choose the first that satisfies the actual inequality. A strict condition such as exceeding 100 differs from reaching at least 100.

## Graph shape and model limits

For A>0 and b>0, the model A b^t remains positive for every real t and has vertical intercept A. A decay curve approaches zero without reaching it at a finite time in this model. Real objects may be counted in whole units or disappear at a detection threshold, so that mathematical behaviour is not always literal. Adding a constant offset changes the horizontal asymptote and means the raw output ratios need not be constant.

Constant-rate models often describe only a limited interval. Resource limits, changing conditions and measurement error can make long-range extrapolation unreliable. Fit and prediction are different claims: agreement with a few data points does not establish that the same multiplier will hold indefinitely. Preserve the model's domain and give units with any interpretation of A or t.

## Revision checks and syllabus scope

This crosswalk targets selected digital SAT skills about nonlinear relationships and equations. It does not substitute for practice on rational, radical, absolute-value or other nonlinear forms. The official source is a dated live specification table, not a claimed immutable examination-year edition. The questions here are original teaching exercises with editorial marking points, not reproduced SAT questions.

When revising, identify the initial value, multiplier and time unit before touching a calculator. Estimate whether the answer should be above or below the initial value. Check results by substituting them into the original model and by comparing adjacent time points. Keep the distinction between a numerical value matching a practice key and a justified interpretation of the model.

## Reversing a percentage change with a reciprocal factor

A percentage change acts on the current quantity. After a decrease, an equal percentage increase uses a smaller base and therefore does not generally restore the original value. Represent each change as a multiplier and compose the multipliers in order. To reverse a decrease by a factor r, use the reciprocal multiplier 1/r, provided r is positive. The restoring percentage increase is then (1/r - 1) times 100%. This is arithmetic within a fictional model, not a forecast. A repeated-growth interpretation also requires equal time intervals and a constant factor; the percentage rule alone does not establish that those assumptions hold in real data.

## Diagram: Compose percentage factors

Read the labelled relationships to follow this worked application. The final quantity is 240, an overall decrease of 4%. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Start: The fictional starting quantity is 250.
   Relationship to next step: multiply by 0.8

2. Decrease: 250 × 0.8 = 200.
   Relationship to next step: multiply by 1.2

3. Increase from the new base: 200 × 1.2 = 240, which is 4% below the start.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “Equal intervals and equal factors” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: Equal intervals and equal factors

Worked examples: 1

Practise: q1, q2, q3

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: Compounding and percentage reversal; Changing the time unit; Recovering parameters and thresholds; Graph shape and model limits; Revision checks and syllabus scope

Worked examples: 2, 3, 4

Practise: q4, q5, q6

### Reversing a percentage change with a reciprocal factor

Read the application diagram “Compose percentage factors”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Reversing a percentage change with a reciprocal factor

Worked examples: 5

Practise: q7, q8, application-check, error-analysis

### Retrieval practice

Close the notes and answer these extra prompts from memory. Self-review with the held explanation, name one gap, then retry later. This is study practice, not an automatic mark or mastery measurement.

Read: Equal intervals and equal factors

Worked examples: 1

Practise: retrieval-01, retrieval-02, retrieval-03, retrieval-04, retrieval-05, retrieval-06, retrieval-07, retrieval-08, retrieval-09, retrieval-10, retrieval-11, retrieval-12, retrieval-13, retrieval-14, retrieval-15

## Worked example 1

A model starts at 500 units and decreases by 12% each day. Find its value after two days.

1. A 12% decrease gives factor 0.88.

2. Use P(2)=500×0.88².

3. Retain the model's units.

Answer: 387.2 units.

## Worked example 2

A population model triples every four days. Write it for initial value 200 and t measured in days.

1. One factor of 3 applies every four days.

2. The number of four-day periods is t/4.

3. Check t=0 gives 200 and t=4 gives 600.

Answer: P(t)=200×3^(t/4).

## Worked example 3

For A b^t, P(1)=30 and P(3)=120. Find A and b, with b>0.

1. Divide: b²=120/30=4.

2. Use b=2 because b>0.

3. Then A=30/2=15.

Answer: P(t)=15×2^t.

## Worked example 4

A count model N(n)=6×2^n updates at integer n≥0. Find the first n for which N(n)>100.

1. At n=4, N=96, which does not exceed 100.

2. At n=5, N=192, which does.

3. Since the sequence increases, 5 is the first qualifying update.

Answer: n=5.

## Worked example 5

A fictional quantity starts at 250, decreases by 20%, then increases by 20%. Find the final quantity and its overall percentage change from the start.

1. A 20% decrease multiplies 250 by 0.8 to give 200.

2. The next 20% increase multiplies 200 by 1.2 to give 240.

3. The change from 250 is -10, so -10/250 × 100 = -4%.

Answer: The final quantity is 240, an overall decrease of 4%.

## Misconceptions

- An 8% growth multiplier is 0.08.
  Correction: The multiplier is 1.08; 0.08 describes only the added fraction.

- Equal percentage increase and decrease cancel.
  Correction: They act on different bases; the combined multiplier is generally below 1.

- A constant annual rate can always be divided by 12 exactly.
  Correction: Exact constant-factor conversion uses the twelfth root of the annual multiplier.

## Flashcards

### What does A represent in A b^t?
The model value at t=0.

### What multiplier represents a 7% decrease?
0.93.

### What table feature distinguishes positive exponential change over equal intervals?
A constant ratio, rather than a constant difference.

### How do two successive multipliers combine?
Multiply them.

### How do you undo a multiplier of 0.75?
Multiply by 1/0.75=4/3.

### What exponent represents doubling every six hours with t in hours?
t/6 in A×2^(t/6).

### How is monthly multiplier g converted to an annual multiplier?
g^12.

### What must be checked for an integer-update threshold?
The neighbouring integer counts and the direction/strictness of the inequality.

### Does A b^t with 0<b<1 reach zero at finite t?
Not in this positive exponential model.

### Why is extrapolation beyond fitted data uncertain?
The constant-factor assumption may stop holding.

### Why do equal percentage decreases and increases fail to cancel?
They act on different bases, so their multipliers have product below one for equal nonzero magnitudes less than 100%.

### How do you reverse a positive multiplier r?
Multiply by its reciprocal 1/r.

## Practice 1 — foundation · 1 marks

Which expression models an initial 80 units growing by 5% per interval?

A. 80+1.05t

B. 80(0.05)^t

C. 80(1.05)^t

D. 80(0.95)^t

Answer: 80(1.05)^t

1. Growth retains the whole current amount and adds 5%.

2. The interval multiplier is 1.05.

Marking points (one practice mark each):

- Select 80(1.05)^t.

## Practice 2 — standard · 2 marks

A quantity of 640 halves every three hours. What does the model predict after nine hours?

Answer: 80.

1. Nine hours contains three halving intervals.

2. Compute 640×(1/2)³.

Marking points (one practice mark each):

- Use three intervals.

- Obtain 80.

## Practice 3 — standard · 2 marks

A value is multiplied by 1.2 then by 0.8. Explain its net change.

Answer: The combined factor is 0.96, a 4% decrease from the original.

1. Multiply 1.2×0.8.

2. Compare 0.96 with the original factor 1.

Marking points (one practice mark each):

- Compute the combined factor.

- Interpret the percentage relative to the original.

## Practice 4 — standard · 2 marks

For a positive constant-factor model, P(0)=50 and P(2)=200. Find the multiplier per interval.

Answer: 2.

1. Use 50b²=200.

2. Then b²=4 and b=2 since b>0.

Marking points (one practice mark each):

- Form the multiplier equation.

- Choose the positive root.

## Practice 5 — extension · 3 marks

Explain the difference between 100(1.1)^t and 100+10t even though both equal 110 at t=1.

Answer: The first increases by 10% of the current amount, the second by 10 units. At t=2 they give 121 and 120, so equality at one time does not imply the same model.

1. Identify multiplicative versus additive change.

2. Compare at a second time.

3. Explain why one shared value is insufficient.

Marking points (one practice mark each):

- Describe the two update rules.

- Compute a distinguishing value.

- Reject equivalence of the models.

## Practice 6 — standard · 2 marks

For integer n≥0, N(n)=5×3^n. Find the first n at which N(n)≥400.

Answer: 4.

1. At n=3, N=135, below 400.

2. At n=4, N=405; monotonic growth establishes it is first.

Marking points (one practice mark each):

- Check the lower neighbouring integer.

- Identify the first valid update.

## Practice 7 — standard · 2 marks

If b is an annual multiplier, write the exact monthly multiplier under uniform exponential change.

Answer: b^(1/12).

1. Twelve monthly factors must multiply to b.

2. Solve g^12=b for positive g.

Marking points (one practice mark each):

- Set up the annual product.

- Give the positive twelfth-root expression.

## Practice 8 — extension · 3 marks

A model fits a microorganism count for the first four hours. Why is a fifty-hour prediction not automatically reliable?

Answer: The growth multiplier may change as resources, conditions or measurement regimes change. A short fitted interval does not establish indefinitely constant growth.

1. Identify the extrapolation beyond observed times.

2. Explain a mechanism that could change the factor.

3. Limit the conclusion to the evidence.

Marking points (one practice mark each):

- Recognise extrapolation.

- Identify a relevant model limitation.

- Give a qualified prediction statement.

## Practice 9 — standard · 3 marks

A fictional quantity starts at 250, decreases by 20%, then increases by 20%. Find the final quantity and its overall percentage change from the start.

Answer: The final quantity is 240, an overall decrease of 4%.

1. A 20% decrease multiplies 250 by 0.8 to give 200.

2. The next 20% increase multiplies 200 by 1.2 to give 240.

3. The change from 250 is -10, so -10/250 × 100 = -4%.

Marking points (one practice mark each):

- A 20% decrease multiplies 250 by 0.8 to give 200.

- The next 20% increase multiplies 200 by 1.2 to give 240.

- The change from 250 is -10, so -10/250 × 100 = -4%.

## Practice 10 — extension · 3 marks

A learner says a 20% increase always reverses a 20% decrease. Give the actual restoring percentage and explain its denominator.

Answer: A 25% increase reverses a 20% decrease, because the lost 50 is 25% of the reduced value 200.

1. After the decrease the base is 200, not 250.

2. The required increase is (250 - 200)/200 × 100 = 25%.

3. Equivalently, the restoring factor is 1/0.8 = 1.25.

Marking points (one practice mark each):

- After the decrease the base is 200, not 250.

- The required increase is (250 - 200)/200 × 100 = 25%.

- Equivalently, the restoring factor is 1/0.8 = 1.25.

## Practice 11 — foundation · 1 marks

Retrieval 1 — Exponential growth, decay and changing time units: Answer from memory: What does A represent in A b^t?

Answer: The model value at t=0.

1. Identify the target idea: What does A represent in A b^t?

2. Compare your response with the held study explanation: The model value at t=0.

Marking points (one practice mark each):

- Accurately address: What does A represent in A b^t?

## Practice 12 — standard · 1 marks

Retrieval 2 — Exponential growth, decay and changing time units: State the condition or distinction precisely: What multiplier represents a 7% decrease?

Answer: 0.93.

1. Identify the target idea: What multiplier represents a 7% decrease?

2. Compare your response with the held study explanation: 0.93.

Marking points (one practice mark each):

- Accurately address: What multiplier represents a 7% decrease?

## Practice 13 — extension · 1 marks

Retrieval 3 — Exponential growth, decay and changing time units: Explain the idea in your own words: What table feature distinguishes positive exponential change over equal intervals?

Answer: A constant ratio, rather than a constant difference.

1. Identify the target idea: What table feature distinguishes positive exponential change over equal intervals?

2. Compare your response with the held study explanation: A constant ratio, rather than a constant difference.

Marking points (one practice mark each):

- Accurately address: What table feature distinguishes positive exponential change over equal intervals?

## Practice 14 — foundation · 1 marks

Retrieval 4 — Exponential growth, decay and changing time units: Answer from memory: How do two successive multipliers combine?

Answer: Multiply them.

1. Identify the target idea: How do two successive multipliers combine?

2. Compare your response with the held study explanation: Multiply them.

Marking points (one practice mark each):

- Accurately address: How do two successive multipliers combine?

## Practice 15 — standard · 1 marks

Retrieval 5 — Exponential growth, decay and changing time units: State the condition or distinction precisely: How do you undo a multiplier of 0.75?

Answer: Multiply by 1/0.75=4/3.

1. Identify the target idea: How do you undo a multiplier of 0.75?

2. Compare your response with the held study explanation: Multiply by 1/0.75=4/3.

Marking points (one practice mark each):

- Accurately address: How do you undo a multiplier of 0.75?

## Practice 16 — extension · 1 marks

Retrieval 6 — Exponential growth, decay and changing time units: Explain the idea in your own words: What exponent represents doubling every six hours with t in hours?

Answer: t/6 in A×2^(t/6).

1. Identify the target idea: What exponent represents doubling every six hours with t in hours?

2. Compare your response with the held study explanation: t/6 in A×2^(t/6).

Marking points (one practice mark each):

- Accurately address: What exponent represents doubling every six hours with t in hours?

## Practice 17 — foundation · 1 marks

Retrieval 7 — Exponential growth, decay and changing time units: Answer from memory: How is monthly multiplier g converted to an annual multiplier?

Answer: g^12.

1. Identify the target idea: How is monthly multiplier g converted to an annual multiplier?

2. Compare your response with the held study explanation: g^12.

Marking points (one practice mark each):

- Accurately address: How is monthly multiplier g converted to an annual multiplier?

## Practice 18 — standard · 1 marks

Retrieval 8 — Exponential growth, decay and changing time units: State the condition or distinction precisely: What must be checked for an integer-update threshold?

Answer: The neighbouring integer counts and the direction/strictness of the inequality.

1. Identify the target idea: What must be checked for an integer-update threshold?

2. Compare your response with the held study explanation: The neighbouring integer counts and the direction/strictness of the inequality.

Marking points (one practice mark each):

- Accurately address: What must be checked for an integer-update threshold?

## Practice 19 — extension · 1 marks

Retrieval 9 — Exponential growth, decay and changing time units: Explain the idea in your own words: Does A b^t with 0<b<1 reach zero at finite t?

Answer: Not in this positive exponential model.

1. Identify the target idea: Does A b^t with 0<b<1 reach zero at finite t?

2. Compare your response with the held study explanation: Not in this positive exponential model.

Marking points (one practice mark each):

- Accurately address: Does A b^t with 0<b<1 reach zero at finite t?

## Practice 20 — foundation · 1 marks

Retrieval 10 — Exponential growth, decay and changing time units: Answer from memory: Why is extrapolation beyond fitted data uncertain?

Answer: The constant-factor assumption may stop holding.

1. Identify the target idea: Why is extrapolation beyond fitted data uncertain?

2. Compare your response with the held study explanation: The constant-factor assumption may stop holding.

Marking points (one practice mark each):

- Accurately address: Why is extrapolation beyond fitted data uncertain?

## Practice 21 — standard · 1 marks

Retrieval 11 — Exponential growth, decay and changing time units: State the condition or distinction precisely: Why do equal percentage decreases and increases fail to cancel?

Answer: They act on different bases, so their multipliers have product below one for equal nonzero magnitudes less than 100%.

1. Identify the target idea: Why do equal percentage decreases and increases fail to cancel?

2. Compare your response with the held study explanation: They act on different bases, so their multipliers have product below one for equal nonzero magnitudes less than 100%.

Marking points (one practice mark each):

- Accurately address: Why do equal percentage decreases and increases fail to cancel?

## Practice 22 — extension · 1 marks

Retrieval 12 — Exponential growth, decay and changing time units: Explain the idea in your own words: How do you reverse a positive multiplier r?

Answer: Multiply by its reciprocal 1/r.

1. Identify the target idea: How do you reverse a positive multiplier r?

2. Compare your response with the held study explanation: Multiply by its reciprocal 1/r.

Marking points (one practice mark each):

- Accurately address: How do you reverse a positive multiplier r?

## Practice 23 — foundation · 1 marks

Retrieval 13 — Exponential growth, decay and changing time units: Answer from memory: What does A represent in A b^t?

Answer: The model value at t=0.

1. Identify the target idea: What does A represent in A b^t?

2. Compare your response with the held study explanation: The model value at t=0.

Marking points (one practice mark each):

- Accurately address: What does A represent in A b^t?

## Practice 24 — standard · 1 marks

Retrieval 14 — Exponential growth, decay and changing time units: State the condition or distinction precisely: What multiplier represents a 7% decrease?

Answer: 0.93.

1. Identify the target idea: What multiplier represents a 7% decrease?

2. Compare your response with the held study explanation: 0.93.

Marking points (one practice mark each):

- Accurately address: What multiplier represents a 7% decrease?

## Practice 25 — extension · 1 marks

Retrieval 15 — Exponential growth, decay and changing time units: Explain the idea in your own words: What table feature distinguishes positive exponential change over equal intervals?

Answer: A constant ratio, rather than a constant difference.

1. Identify the target idea: What table feature distinguishes positive exponential change over equal intervals?

2. Compare your response with the held study explanation: A constant ratio, rather than a constant difference.

Marking points (one practice mark each):

- Accurately address: What table feature distinguishes positive exponential change over equal intervals?

## Revision checklist

- Identify multiplier, initial value and time unit.

- Distinguish ratios from differences.

- Check integer thresholds explicitly.

- State assumptions when extrapolating.

- Explain the reasoning in “Compose percentage factors” and correct the linked error-analysis response without copying its solution.

## Revision guide

A percentage change acts on the current quantity. After a decrease, an equal percentage increase uses a smaller base and therefore does not generally restore the original value. Represent each change as a multiplier and compose the multipliers in order. To reverse a decrease by a factor r, use the reciprocal multiplier 1/r, provided r is positive. The restoring percentage increase is then (1/r - 1) times 100%. This is arithmetic within a fictional model, not a forecast. A repeated-growth interpretation also requires equal time intervals and a constant factor; the percentage rule alone does not establish that those assumptions hold in real data.

### Key ideas

- The fictional starting quantity is 250.

- 250 × 0.8 = 200.

- 200 × 1.2 = 240, which is 4% below the start.

- The multiplier is 1.08; 0.08 describes only the added fraction.

### Retrieve without looking

- Why do equal percentage decreases and increases fail to cancel?

- How do you reverse a positive multiplier r?

- What does A represent in A b^t?

Mixed practice: q1, application-check, error-analysis

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.

## Partial syllabus crosswalk

Source-checked means the official point was inspected, not independently approved teaching or complete coverage.

### sat-math-20261019: Advanced Math / nonlinear functions

[Official specification reference](https://satsuite.collegeboard.org/k12-educators/about/alignment/math)

Version: Official live SAT table inspected 2026-10-19. Checked: 2026-10-19. Location: Table 1, SAT (not the subsequent PSAT tables).

Tier/scope: Digital SAT Math; exponential subset

Teaching: Equal intervals and equal factors; Changing the time unit; Graph shape and model limits

Practice IDs: q1, q3, q5, q7, q8

Still required:

- Other nonlinear families, more graph representations and independent review.

### sat-math-20261019: Advanced Math / nonlinear equations

[Official specification reference](https://satsuite.collegeboard.org/k12-educators/about/alignment/math)

Version: Official live SAT table inspected 2026-10-19. Checked: 2026-10-19. Location: Table 1, SAT (not the subsequent PSAT tables).

Tier/scope: Digital SAT Math; recognisable powers and thresholds only

Teaching: Recovering parameters and thresholds

Practice IDs: q2, q4, q6

Still required:

- Broader nonlinear equation families and mixed symbolic forms.
