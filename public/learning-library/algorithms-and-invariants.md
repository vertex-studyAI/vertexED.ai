# Tracing algorithms, loop invariants and edge cases

Subject: Computer Science · Unit: Algorithms · Revision: 2026-10-21.3

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Language-independent algorithm reasoning. Syntax-specific examination conventions and complete programming-course coverage are not claimed.

## Prerequisites

- Understand assignment, conditions and repetition.

- Read a list indexed from zero.

## Objectives

- Trace state changes in a loop.

- Use an invariant to justify a simple algorithm.

- Distinguish testing, termination and correctness.

## State and order of execution

An algorithm is a finite description of steps intended to solve a class of problems. To trace it, record the current values of relevant variables after each executed statement, not merely after each line as printed. Assignment replaces a stored value; it is not an equation asserting equality forever. In x=x+1, the old value is read before the new value is stored. A condition determines which branch executes, and a loop condition determines whether another iteration begins. Write down initial state, index convention and expected input constraints before tracing, because an off-by-one error often begins with an unstated boundary assumption.

## An invariant explains why a loop works

A loop invariant is a statement about the program state that holds at a specified point in every iteration. For a running sum, an invariant at the start of iteration i is that total equals the sum of the first i elements. Initially i=0 and total=0, so it holds for the empty prefix. Adding element i and incrementing i preserves the statement for the longer prefix. At termination i equals the list length, so total is the required complete sum. This argument has three parts: initialisation, preservation and connection to the final result. A true invariant that says nothing useful about the output is not enough by itself.

## Boundaries, termination and efficiency

Test ordinary inputs and edge cases: an empty list, one element, repeated values, negative values and values at stated bounds. Tests can reveal defects, but a finite collection of passing tests does not prove correctness for every permitted input. Termination requires separate reasoning; for an index increasing by one toward a finite list length, the number of unprocessed elements decreases until it reaches zero. Efficiency describes how resources grow with input size. A single pass through n elements is linear time under a constant-cost-per-element model. Do not confuse the number of source-code lines with running time, since a short nested loop can execute many operations.

## Correctness, termination and resource use

A loop invariant is a statement that is true before an iteration and is preserved by each completed iteration. To use it as an argument, explain initialisation, maintenance and what it implies at termination. For a running total, an invariant might state that the accumulator equals the sum of exactly the elements already processed. Saying the loop works because it adds numbers is weaker: it does not specify which elements have been included or whether any were skipped or counted twice.

Correct output on selected tests does not by itself prove correctness for every valid input. Tests should include boundary cases, duplicates, negative values where permitted, and inputs that challenge each branch. A termination argument needs a measure that progresses toward a bound, not merely the presence of a loop condition. Correctness and efficiency are separate questions: two algorithms can produce identical answers while using different amounts of time or memory. State the input-size variable before discussing growth, and distinguish a count of operations from elapsed time on a particular machine. Preconditions such as a nonempty list or sorted data must be checked or explicitly documented.

## Proving a running maximum

For a nonempty list, initialise a running maximum from the first element, not from a convenient constant such as zero. Before each subsequent iteration, the stored value should equal the maximum of exactly the elements already processed. Comparing the next element and retaining the larger value preserves that invariant. At termination every element has been processed, so the invariant yields the required result. This argument also explains an all-negative test: a zero initial value introduces a candidate that was never in the input. The empty-list case needs an explicit contract, such as returning no result or reporting invalid input. A trace demonstrates one run; an invariant explains all runs satisfying the preconditions.

## Choose an invariant that describes the processed prefix

A useful invariant says exactly what is true before each iteration and ties that statement to the amount of input already processed. For an average, retain both a total and a count. For a search, specify what has been ruled out. For a repeated subtraction loop, a quantity that decreases is only a termination argument if it cannot decrease indefinitely in the permitted domain. Empty input needs a separate contract when an operation such as division or selecting the first element is required. Test equality and boundary cases as deliberately as typical inputs.

## Diagram: Running maximum over a prefix

Read the labelled relationships to follow this worked application. Stored values: -3, -3, -3. The maximum is -3. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Initialise: For a nonempty list, best is the first element.
   Relationship to next step: preserve the invariant

2. Extend the prefix: Compare the next element with best and retain the larger value.
   Relationship to next step: finish after all elements

3. Terminate: When the prefix is the entire list, best is the required maximum.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “State and order of execution” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: State and order of execution

Worked examples: 1

Practise: q1, q2

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: An invariant explains why a loop works; Boundaries, termination and efficiency; Correctness, termination and resource use

Worked examples: 2, 3

Practise: q3, q4

### Proving a running maximum

Read the application diagram “Running maximum over a prefix”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Proving a running maximum

Worked examples: 4

Practise: q5, application-check, error-analysis

### Apply and test the limits

Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.

Read: Choose an invariant that describes the processed prefix

Worked examples: 4

Practise: depth-prefix-average, depth-termination-domain, depth-off-by-one

## Worked example 1

Trace total=0; for each value in [3,-1,4], set total=total+value.

1. After 3, total is 3.

2. After -1, total is 2.

3. After 4, total is 6; each prefix sum matches the processed elements.

Answer: Final total 6.

## Worked example 2

A maximum-finding algorithm starts max=0 and scans [-5,-2,-9]. Identify the defect and repair.

1. No negative input is greater than zero, so the algorithm incorrectly returns zero.

2. For a nonempty list initialise max to its first element, then scan the rest.

3. Specify a separate policy for empty input instead of assuming a maximum exists.

Answer: Initialise from a real element for nonempty input; explicitly handle the empty case.

## Worked example 3

Give an invariant for summing a list from left to right with total initially zero.

1. Before processing any entries, total=0 equals the sum of the empty processed prefix.

2. After adding the next entry, total equals the sum of the enlarged prefix.

3. At termination the prefix is the entire list, so total is the required sum.

Answer: Before each iteration, total equals the sum of the entries processed so far.

## Worked example 4

Trace a running maximum over [-8, -3, -11, -4], initialised from the first element. Give the stored value after each remaining element and the final result.

1. After comparing -3 with -8, retain -3.

2. Neither -11 nor -4 exceeds -3, so the value stays -3.

3. All four elements have been processed; -3 is a member of the input and is at least every element.

Answer: Stored values: -3, -3, -3. The maximum is -3.

## Misconceptions

- Passing three examples proves an algorithm correct.
  Correction: Examples test selected cases; correctness over a domain needs broader reasoning or proof.

- A loop invariant changes to a different claim every iteration.
  Correction: The same relationship holds at the stated point, although variable values change.

## Flashcards

### What happens in x=x+1?
The current x is read, one is added, and the result replaces x.

### What are the three usual parts of a loop-invariant argument?
Initialisation, preservation and how the invariant implies the result at termination.

### Why test an empty list?
It exposes assumptions about a first element and whether the output is defined.

### How can a loop's termination be justified?
Show a nonnegative measure decreases toward a stopping condition.

### What does linear running time mean?
Operation count grows proportionally to input length under the stated cost model.

### What are the three stages of a loop-invariant correctness argument?
Show initialisation, preservation by each iteration, and how the invariant gives the required result at termination.

### What is the running-maximum invariant?
The stored value is the maximum of the processed prefix.

### Why test an all-negative list?
It exposes an initial zero that was incorrectly treated as an input candidate.

## Practice 1 — foundation · 2 marks

Trace x=2 followed by x=x+3 and then x=2*x. What is final x?

Answer: 10.

1. The first assignment gives x=5.

2. The second uses that updated value and gives x=10.

Marking points (one practice mark each):

- Use the updated intermediate value 5.

- Obtain 10.

## Practice 2 — foundation · 1 marks

Which input most directly exposes the flaw in initialising a nonempty-list maximum to zero?

A. A list containing only positive numbers

B. A list containing zero and a positive number

C. A list containing one positive number

D. A list containing only negative numbers

Answer: A list containing only negative numbers

1. Zero is not necessarily a member of the input.

2. If all values are negative, none replaces the incorrect initial maximum.

Marking points (one practice mark each):

- Select an all-negative list.

## Practice 3 — standard · 2 marks

Give an invariant for a loop counting positive values in the first i elements of a list.

Answer: At the start of iteration i, count equals the number of values greater than zero among indices 0 through i-1.

1. Specify the exact point at which the invariant holds.

2. Relate the counter to the processed prefix, excluding unprocessed elements.

Marking points (one practice mark each):

- Identify the processed prefix precisely.

- State that count matches positive values in that prefix.

## Practice 4 — extension · 3 marks

Explain correctness and termination of summing a finite list by adding one element per iteration, starting with total=0.

Answer: Initially total is the empty-prefix sum. Each iteration adds exactly the next element, preserving the prefix-sum invariant. The unprocessed element count decreases by one until zero, at which point total equals the complete sum.

1. Establish the invariant initially.

2. Explain its preservation by one iteration.

3. Use a decreasing unprocessed count for termination and connect the final invariant to the answer.

Marking points (one practice mark each):

- Justify initialisation.

- Justify preservation.

- Justify termination and the final result.

## Practice 5 — extension · 3 marks

A binary search implementation is tested on one sorted list and then used on arbitrary unsorted lists. Explain the missing precondition and why passing that test is insufficient.

Answer: Binary search relies on ordering to discard a region safely. An unsorted list can contain the target in a discarded region. One successful test on a valid sorted input does not establish correctness when the precondition is violated.

1. Identify sorted input as the relevant precondition.

2. Explain how ordering supports discarding part of the search space.

3. Separate one successful test from a guarantee for other inputs.

Marking points (one practice mark each):

- Identify sorted input as the relevant precondition.

- Explain how ordering supports discarding part of the search space.

- Separate one successful test from a guarantee for other inputs.

## Practice 6 — standard · 3 marks

Trace a running maximum over [-8, -3, -11, -4], initialised from the first element. Give the stored value after each remaining element and the final result.

Answer: Stored values: -3, -3, -3. The maximum is -3.

1. After comparing -3 with -8, retain -3.

2. Neither -11 nor -4 exceeds -3, so the value stays -3.

3. All four elements have been processed; -3 is a member of the input and is at least every element.

Marking points (one practice mark each):

- After comparing -3 with -8, retain -3.

- Neither -11 nor -4 exceeds -3, so the value stays -3.

- All four elements have been processed; -3 is a member of the input and is at least every element.

## Practice 7 — extension · 3 marks

A maximum-finding loop starts with best = 0. Explain its failure on [-8, -3] and give a repair including the empty-list case.

Answer: It returns 0, which is absent from the input. Initialise from the first element for a nonempty list and handle an empty list explicitly.

1. Neither negative input exceeds the incorrect initial value 0.

2. Initialising from the first input establishes the running-maximum invariant.

3. Define and handle the empty-list result before accessing the first element.

Marking points (one practice mark each):

- Neither negative input exceeds the incorrect initial value 0.

- Initialising from the first input establishes the running-maximum invariant.

- Define and handle the empty-list result before accessing the first element.

## Practice 8 — standard · 3 marks

An algorithm sets total=0 and count=0, then adds each value in [2, 0, 7] to total and increments count. Trace the states and explain why total/count must not be evaluated before processing an empty list.

Answer: The states are (2,1), (2,2), (9,3); the final mean is 3. With no elements the count is zero, so the mean needs an explicit undefined/error result.

1. Accumulate one value and one count per iteration.

2. Divide only when count is positive; the invariant is that total sums the count processed values.

Marking points (one practice mark each):

- Give the three correct states.

- Compute mean 3.

- Identify division by zero for empty input.

## Practice 9 — extension · 3 marks

A loop repeatedly executes x=x-2 while x!=0. Does it terminate for every nonnegative integer input? Give a failing input and a corrected precondition if the body is kept unchanged.

Answer: No. Starting at 3 gives 3,1,-1,-3,... and never reaches zero. Requiring an even nonnegative integer ensures termination.

1. Subtracting 2 preserves parity; an odd value cannot become zero.

2. For even nonnegative x, x/2 is a nonnegative integer that decreases by one each iteration.

Marking points (one practice mark each):

- Trace an odd counterexample.

- State the even nonnegative precondition.

- Give the decreasing nonnegative termination measure.

## Practice 10 — standard · 3 marks

A zero-indexed list has four elements. A loop begins i=0, reads a[i], increments i, and repeats while i<=4. Identify the invalid access and repair the bound.

Answer: The loop attempts a[4], which is outside indices 0 through 3. Use a pre-test loop with condition i<4, or i<length(a).

1. List the valid indices before tracing the final iteration.

2. Use a strict upper bound and check the condition before every read.

Marking points (one practice mark each):

- Identify index 4.

- State valid indices 0 through 3.

- Give a pre-test strict-bound repair.

## Revision checklist

- Trace assignments in execution order.

- State input assumptions and empty-input behaviour.

- Separate evidence from tests, correctness reasoning and termination reasoning.

- Explain the reasoning in “Running maximum over a prefix” and correct the linked error-analysis response without copying its solution.

## Revision guide

For a nonempty list, initialise a running maximum from the first element, not from a convenient constant such as zero. Before each subsequent iteration, the stored value should equal the maximum of exactly the elements already processed. Comparing the next element and retaining the larger value preserves that invariant. At termination every element has been processed, so the invariant yields the required result. This argument also explains an all-negative test: a zero initial value introduces a candidate that was never in the input. The empty-list case needs an explicit contract, such as returning no result or reporting invalid input. A trace demonstrates one run; an invariant explains all runs satisfying the preconditions.

### Key ideas

- For a nonempty list, best is the first element.

- Compare the next element with best and retain the larger value.

- When the prefix is the entire list, best is the required maximum.

- Examples test selected cases; correctness over a domain needs broader reasoning or proof.

### Retrieve without looking

- What is the running-maximum invariant?

- Why test an all-negative list?

- What happens in x=x+1?

Mixed practice: q1, application-check, error-analysis, depth-prefix-average, depth-termination-domain, depth-off-by-one

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.
