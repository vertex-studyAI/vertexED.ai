# Boolean logic: truth values, operators and conditions

Subject: Computer Science · Unit: Logic and decision making · Revision: 2026-10-25.2

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Language-independent introduction to Boolean values, NOT, AND and OR. It supports tracing simple decisions but does not claim a complete programming, digital-logic or examination-course curriculum.

## Prerequisites

- Read a comparison such as score >= 50 as a statement that can be true or false.

- Follow a one-step conditional instruction.

## Objectives

- Determine the result of NOT, AND and OR for stated Boolean inputs.

- Trace a condition by naming its comparison results before combining them.

- Write a test case that distinguishes two similar-looking conditions.

## Boolean expressions have one of two truth values

A Boolean expression evaluates to true or false. A comparison such as attempts >= 3 is true only when the current value meets that condition. The expression does not store a mark or make a decision by itself. It supplies one input to a decision. Write down the values being compared and the comparison operator before deciding the result.

A condition can be built from smaller Boolean expressions. For example, a learner may open a revision prompt only when signedIn AND hasSelectedTopic is true. Treat each name as a value supplied by the situation, not as a prediction about a learner. A trace is easier to check when each named input is evaluated separately before the final condition.

## NOT, AND and OR have different jobs

NOT reverses one Boolean value: NOT true is false, and NOT false is true. AND is true only when both inputs are true. OR is true when at least one input is true. In inclusive OR, both inputs being true still gives true. Unless a question explicitly says exclusive OR, do not assume that exactly one input must be true.

Parentheses state which operation to evaluate first. In a condition such as hasNotes AND (hasQuestion OR hasAnswer), first decide the bracketed OR result, then combine it with hasNotes. Adding parentheses makes the intended rule visible and avoids relying on a language's precedence conventions.

## Test decisions at the boundaries that matter

A condition can look plausible while still using the wrong operator or comparison boundary. If a pass rule is score >= 50, then 50 is an essential test input: score > 50 incorrectly rejects it. For an AND condition, test each input being false in turn as well as both being true. For an OR condition, test each input being true in turn and both being false.

Truth tables are a compact way to check every possible combination for a small number of Boolean inputs. They do not prove that names, data types or surrounding program steps are correct. State what each input means, calculate the result for each row, and choose test cases that would expose a changed operator.

## Use a truth table to compare competing conditions

A truth table lists every combination of a small set of Boolean inputs. For two inputs A and B, the four rows are false/false, false/true, true/false and true/true. This makes it possible to compare A AND B with A OR B without relying on an example that happens to make both expressions agree. The expressions differ in the two rows where exactly one input is true.

A test should reflect the decision's stated meaning. If access requires both a verified account and an approved enrolment, test each missing requirement separately. If either of two recovery methods is sufficient, test each method on its own and neither method. These cases check the condition, but they do not establish that an account, permission or service is actually available.

## Diagram: Trace a grouped Boolean condition

An explanatory trace of visible = hasSource AND (hasQuestion OR hasAnswer), with hasSource=true, hasQuestion=false and hasAnswer=true. This diagram does not represent an actual account permission or learner result.

1. Read the inputs: hasSource is true, hasQuestion is false and hasAnswer is true.
   Relationship to next step: evaluate the grouped expression first

2. Evaluate the brackets: false OR true is true because inclusive OR needs at least one true input.
   Relationship to next step: combine its result with the remaining input

3. Apply the outer AND: true AND true is true, so visible is true.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Name the inputs before evaluating

Read the Boolean values and comparison results separately. Then trace the first worked example before attempting the direct operator questions.

Read: Boolean expressions have one of two truth values

Worked examples: 1

Practise: q1, q2

### Trace grouping and boundary cases

Evaluate the brackets before the surrounding operation, then use the score boundary to test whether the condition matches the stated rule.

Read: NOT, AND and OR have different jobs; Test decisions at the boundaries that matter

Worked examples: 2

Practise: q3, q4

### Review the condition before trusting it

Use the misconception checks to distinguish inclusive OR from exactly-one logic. Revisit the boundary question and state the test that would reveal a changed operator.

Read: Test decisions at the boundaries that matter

Worked examples: 1

Practise: q1, q3

### Apply and test the limits

Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.

Read: Use a truth table to compare competing conditions

Worked examples: 2

Practise: depth-and-or-row, depth-negated-boundary, depth-parentheses

## Worked example 1

Evaluate ready = hasNotes AND hasQuestion when hasNotes is true and hasQuestion is false.

1. Write the two given inputs: true and false.

2. AND needs both inputs to be true.

3. One input is false, so the combined result is false.

Answer: ready is false.

## Worked example 2

Evaluate showHint = NOT submitted OR needsHelp when submitted is true and needsHelp is false.

1. NOT submitted is NOT true, which is false.

2. The expression is now false OR false.

3. Neither input to OR is true.

Answer: showHint is false.

## Misconceptions

- OR means exactly one input must be true.
  Correction: Ordinary inclusive OR is true when one or both inputs are true. Exactly-one behaviour needs a separately defined exclusive OR rule.

- NOT makes a number negative.
  Correction: NOT reverses a Boolean truth value. It is not arithmetic negation.

## Flashcards

### What values can a Boolean expression produce?
True or false.

### What is NOT false?
True.

### When is A AND B true?
Only when both A and B are true.

### When is inclusive A OR B false?
Only when both A and B are false.

### Why test the boundary in score >= 50?
It distinguishes >= from > because 50 must be accepted by the stated rule.

## Practice 1 — foundation · 2 marks

State the result of false OR true and explain the rule used.

Answer: True. Inclusive OR is true when at least one input is true.

1. Identify the two inputs as false and true.

2. Apply the inclusive OR rule.

Marking points (one practice mark each):

- States true.

- Explains that at least one true input is sufficient.

## Practice 2 — foundation · 2 marks

A resource opens when signedIn AND acceptedTerms is true. Give one input pair that opens the resource and one that does not.

Answer: It opens for true and true. Any pair containing false does not open it, for example true and false.

1. AND needs both named inputs to be true.

2. Choose one pair with two true values and one pair containing false.

Marking points (one practice mark each):

- Gives true, true as an opening pair.

- Gives a non-opening pair containing false.

## Practice 3 — standard · 3 marks

Explain why score > 50 does not implement a rule that says a learner passes at 50 or above. Name a test case that exposes the defect.

Answer: The operator > excludes 50, while the stated rule includes it. Testing score 50 exposes the defect because the intended result is true but score > 50 is false.

1. Compare the meanings of > and >=.

2. Use the boundary value 50.

3. State the expected and actual Boolean results.

Marking points (one practice mark each):

- Identifies that > excludes equality.

- Names 50 as the boundary test.

- Explains the expected true versus actual false result.

## Practice 4 — standard · 3 marks

For visible = hasSource AND (hasQuestion OR hasAnswer), trace the result when hasSource is true, hasQuestion is false and hasAnswer is true.

Answer: hasQuestion OR hasAnswer is true. Then true AND true is true, so visible is true.

1. Evaluate the bracketed OR expression first.

2. Combine that result with hasSource using AND.

3. State the final value.

Marking points (one practice mark each):

- Evaluates false OR true as true.

- Evaluates true AND true as true.

- States that visible is true.

## Practice 5 — extension · 3 marks

Give the truth-table row where A AND B and A OR B differ when A is true. State both results and explain why this row is useful for testing.

Answer: Use A=true and B=false. A AND B is false, while A OR B is true. It distinguishes the operators because they produce different results for the same inputs.

1. Hold A at true and choose B=false.

2. Evaluate each operator separately.

3. Explain that a differing row distinguishes the conditions.

Marking points (one practice mark each):

- Gives A=true, B=false.

- States false for AND and true for OR.

- Explains why the row distinguishes the operators.

## Practice 6 — extension · 3 marks

A warning should show when NOT hasSubmitted AND deadlinePassed. Explain the result when hasSubmitted is false and deadlinePassed is true, then name a contrasting case that hides the warning.

Answer: NOT false is true, so true AND true makes the warning show. If hasSubmitted is true while deadlinePassed is true, NOT true is false and the warning is hidden.

1. Reverse hasSubmitted with NOT.

2. Apply AND to the reversed value and deadlinePassed.

3. Change one input to produce a contrasting false result.

Marking points (one practice mark each):

- Evaluates NOT false as true.

- States that the warning shows for false, true inputs.

- Gives a valid contrasting case that hides it.

## Practice 7 — extension · 3 marks

Explain why parentheses are useful in permitted = staff OR (student AND approved), and give values that make the bracketed expression false while the whole expression is true.

Answer: Parentheses show that student AND approved is evaluated as one group before OR with staff. With staff=true, student=false and approved=false, the bracketed expression is false but the whole expression is true.

1. Describe the grouped student-and-approved requirement.

2. Choose false values for both terms inside the brackets.

3. Use staff=true so the outer OR is true.

Marking points (one practice mark each):

- Explains the grouped evaluation.

- Makes the bracketed expression false.

- Makes the full expression true through staff.

## Revision checklist

- Name each Boolean input before combining it.

- Use parentheses to show the intended grouping.

- Test every meaningful boundary and false case.

- Distinguish inclusive OR from an explicitly defined exclusive OR.

## Revision guide

Evaluate each Boolean input, then follow the stated grouping. A trace explains one case; a truth table compares every input combination. Test comparison boundaries separately so equality is not accidentally excluded. A correct Boolean expression does not prove that the underlying account or service state is accurate.

### Key ideas

- NOT reverses a Boolean value.

- AND needs both operands to be true.

- Inclusive OR permits either or both operands to be true.

- A rule that includes a threshold needs an equality case.

### Retrieve without looking

- Which inputs distinguish AND from inclusive OR?

- Why does testing 50 distinguish > 50 from >= 50?

- What should be evaluated first inside visible = hasSource AND (hasQuestion OR hasAnswer)?

Mixed practice: q1, q2, q3, q4, depth-and-or-row, depth-negated-boundary, depth-parentheses

Explain any changed operator or missed boundary, then retry the linked questions without the worked example. Self-review does not establish independently verified mastery.
