# Growth rates, nested loops and choosing a data structure

Subject: Computer Science · Unit: Algorithms and data structures · Revision: 2026-10-21.4

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original shared study module on growth rates, nested loops and choosing a data structure. Numerical datasets and quoted passages are invented teaching examples. This is not a complete course, official examination material or verified board-specific alignment.

## Prerequisites

- Trace a loop and count iterations.

- Use lists and zero-based indices.

## Objectives

- Count work in sequential and nested loops.

- Distinguish asymptotic growth from measured runtime.

- Match a data structure to required operations.

## Count the operations that depend on input size

Let n describe the input size and choose a basic operation such as a comparison. A loop with n iterations and constant work per iteration takes a number of operations proportional to n. Two consecutive such loops still have linear growth, because their counts add. A nested pair with n iterations each instead performs n squared combinations when the inner loop runs fully for every outer iteration. Read the bounds carefully: dependent inner bounds, early exits and changing step sizes can alter the count. State which case is being analysed.

## Growth is not a stopwatch result

Big-O describes an asymptotic upper bound on growth, not an exact number of seconds. Constants, hardware, implementation and input distribution can change measured runtime. A logarithmic search may require a sorted collection and an efficient way to access its middle element; the cost of preparing that collection belongs in the overall workflow when relevant. Distinguish worst-case, average-case and best-case claims. A test on one small input cannot establish an asymptotic result, although it may expose a bug in a proposed counting argument.

## Select structures using required operations

A stack offers last-in-first-out access, while a queue offers first-in-first-out access. Choosing between them depends on the behaviour required, not which name sounds faster. An array can support direct indexed access, but inserting at its beginning may require shifting many entries. A linked representation can change links efficiently when the relevant node is already known, yet finding that node may still require traversal. Include search, insertion, removal and memory constraints when comparing designs. State implementation assumptions rather than claiming that one structure is always faster.

## Diagram: Reasoning route: Algorithms and data structures

Use the sequence to organise an explanation of growth rates, nested loops and choosing a data structure; it is not a measured mastery score.

1. Define n and the operation: State the input measure and the case being counted.
   Relationship to next step: Use this definition to choose the method

2. Count the whole workflow: Include loops, preparation and structure-specific operations.
   Relationship to next step: Use the result to evaluate the conclusion

3. Choose and test: Compare growth bounds, constraints and finite-input behaviour.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Count the operations that depend on input size

Write the operation count first. Distinguish consecutive loops from an inner loop whose length changes.

Read: Count the operations that depend on input size

Worked examples: 1, 2

Practise: consecutive, triangle

### Growth is not a stopwatch result

Use the linear-growth example to explain why the whole workflow, including preparation, matters more than one operation's bound.

Read: Growth is not a stopwatch result

Worked examples: 1

Practise: preparation

### Select structures using required operations

Contrast the counting problem in example 2 with a queue's removal rule. Explain why required behaviour must be specified before comparing efficiency.

Read: Select structures using required operations

Worked examples: 2

Practise: queue

## Worked example 1

One loop performs 3n operations and a following loop performs 5n+2. Describe the total and its growth.

1. Sequential work adds to 8n+2.

2. For large n the fixed term does not change the linear order of growth.

Answer: 8n+2 operations in this count; O(n) growth.

## Worked example 2

For each i from 1 through n, a loop performs i operations. Find the count when n=4 and its general form.

1. The count at four is 1+2+3+4=10.

2. In general the sum is n(n+1)/2, which has quadratic growth.

Answer: 10 at n=4; n(n+1)/2 overall, O(n²).

## Misconceptions

- Every pair of loops is quadratic.
  Correction: Consecutive loops add; nesting and bounds determine multiplication.

- An O(n) algorithm always beats an O(n²) one for every n.
  Correction: Constants and input size can affect finite runtime comparisons.

## Flashcards

### How do sequential operation counts combine?
Add them.

### What does a fully independent n-by-n nested loop count?
n² inner operations.

### Is Big-O an exact runtime in seconds?
No. It describes a growth bound under stated assumptions.

### Which access order does a stack provide?
Last in, first out.

### Which access order does a queue provide?
First in, first out.

## Practice 1 — standard · 2 marks

A loop visits n items twice, followed by a fixed 7 operations. Give the exact count and order under this model.

Answer: 2n+7; O(n).

1. Add the two visits per item and fixed work.

2. Retain the highest growth term for the asymptotic order.

Marking points (one practice mark each):

- Give 2n+7.

- Give O(n).

## Practice 2 — standard · 2 marks

For i=1,...,6, an inner loop executes i times. How many inner iterations occur?

Answer: 21.

1. Add 1+2+3+4+5+6.

2. Alternatively use 6×7/2.

Marking points (one practice mark each):

- Use the dependent loop bounds.

- Find 21.

## Practice 3 — standard · 2 marks

Tasks A, B and C enter a queue in that order. After one removal, D joins. Give the remaining removal order.

Answer: B, C, D.

1. A leaves first by first-in-first-out behaviour.

2. D joins behind B and C.

Marking points (one practice mark each):

- Remove A first.

- Give B, C, D.

## Practice 4 — extension · 2 marks

One search is required in an unsorted list. A learner ignores sorting cost and claims binary search is automatically the best whole workflow. Explain the missing consideration.

Answer: Sorting and access costs must be included; a single linear scan may be preferable.

1. Binary search's logarithmic comparison count assumes suitable sorted input.

2. Compare the total preparation-plus-search work for the actual number of searches.

Marking points (one practice mark each):

- Identify the sorted-input prerequisite.

- Compare total rather than isolated search cost.

## Revision checklist

- Check that you can count work in sequential and nested loops without copying the worked solution.

- Check that you can distinguish asymptotic growth from measured runtime without copying the worked solution.

- Check that you can match a data structure to required operations without copying the worked solution.

## Revision guide

Review growth rates, nested loops and choosing a data structure by connecting definitions, the two worked examples and the limits of each conclusion. These questions use editorial self-review points, not an official examination rubric.

### Key ideas

- How do sequential operation counts combine? Add them.

- What does a fully independent n-by-n nested loop count? n² inner operations.

- Is Big-O an exact runtime in seconds? No. It describes a growth bound under stated assumptions.

### Retrieve without looking

- How do sequential operation counts combine?

- What does a fully independent n-by-n nested loop count?

- Is Big-O an exact runtime in seconds?

Mixed practice: consecutive, triangle, queue, preparation

Attempt the questions without the notes, compare your reasoning with the points, and retry any step you cannot yet explain. Self-review does not certify mastery.
