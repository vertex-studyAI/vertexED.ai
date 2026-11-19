# Search traces, invariants and meaningful complexity claims

Subject: Computer Science · Unit: AQA A-Level 7517: 4.3.4 Searching · Revision: 2026-10-22.1

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Untiered A-Level lesson on linear, binary and binary-search-tree search. Includes executable JavaScript examples and traces, not completion of the programming project or every algorithm in 4.3. Original teaching and practice, not official examination material. Practice rubrics are for self-review. This topic does not establish whole-course coverage, independent subject review or publication approval.

## Prerequisites

- Read arrays, loops and conditionals.

- Understand ascending order and powers of two.

## Objectives

- Trace successful and unsuccessful searches.

- Explain binary search’s precondition and shrinking interval.

- Qualify complexity claims by data structure and case.

## Linear search and its contract

A search procedure needs a defined result for both success and failure. This JavaScript implementation returns the first matching zero-based index or -1: function linearSearch(a, target) { for (let i = 0; i < a.length; i++) { if (a[i] === target) return i; } return -1; }. It works on unsorted arrays. In the worst case it checks every element, giving O(n) time; finding the first element is a best case requiring constant time. Empty input returns -1 without accessing an element.

## Binary search and what remains possible

For an ascending sorted array, use this implementation: function binarySearch(a, target) { let low = 0; let high = a.length - 1; while (low <= high) { const mid = Math.floor((low + high) / 2); if (a[mid] === target) return mid; if (a[mid] < target) low = mid + 1; else high = mid - 1; } return -1; }. At each iteration any possible match remains inside the inclusive interval from low to high. Ordering justifies discarding the other half. The +1 or -1 excludes the inspected midpoint and ensures progress; without it, a small interval can repeat forever.

## Tracing and growth rates

Trace low, high, mid and the inspected value on every iteration. In [3,7,12,18,24,31,40], searching for 31 checks 18 and then 31, returning index 5. Searching for 25 checks 18,31,24 and then terminates with an empty interval. Halving repeatedly gives logarithmic worst-case growth, O(log n). This describes growth of work, not an exact duration in seconds. A single lookup in unsorted data may not justify sorting first; sorting cost and how often searches repeat affect the decision.

## Binary search trees need a shape assumption

A binary search tree places smaller keys in a node’s left subtree and larger keys in the right, under a stated duplicate policy. Search follows one branch after each comparison. Time depends on height: a balanced tree has height proportional to log n, while inserting already sorted keys into an ordinary unbalanced tree can produce a chain of height proportional to n. Therefore the useful O(log n) claim requires an appropriate shape or balancing assumption. A tree is not guaranteed fast merely because each node has at most two children.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Build the explanation

Read the opening sections. Reconstruct the reasoning in worked example 1, then attempt the first two questions before looking at their answers.

Read: Linear search and its contract; Binary search and what remains possible

Worked examples: 1

Practise: linear-duplicates, binary-trace

### Apply and distinguish

Study the remaining sections and worked example 2. Explain why its reasoning fits this situation. Check the programme and tier labels before attempting the next questions.

Read: Tracing and growth rates; Binary search trees need a shape assumption

Worked examples: 2

Practise: missing-search, nonprogress-bug

### Test and revise

Attempt the remaining questions from memory. Compare each claim with the practice marking points, correcting unsupported reasoning. These are self-review tasks, not automated exam grades.

Read: Linear search and its contract; Binary search and what remains possible; Tracing and growth rates; Binary search trees need a shape assumption

Worked examples: 1, 2

Practise: complexity-choice, bst-chain

## Worked example 1

Trace binarySearch([2,5,8,11,14], 5).

1. Start low=0, high=4, mid=2, value=8, so high=1.

2. mid=0 gives 2, so low=1; mid=1 gives 5.

Answer: Indices 2 then 0 then 1; returns 1.

## Worked example 2

Compare searching an ordinary BST made by inserting 1,2,3,4 in that order with a balanced tree.

1. Each new larger key follows the right branch.

2. The height, rather than the label binary, determines the worst-case search length.

Answer: The ordinary insertion creates a rightward chain; searching for 4 visits all four nodes.

## Misconceptions

- Binary search works on any array.
  Correction: Its discard step depends on sorted order.

- Every binary search tree guarantees logarithmic search.
  Correction: An unbalanced tree can become a linear chain.

## Flashcards

### What does -1 mean in these implementations?
No matching array index was found.

### What precondition does binary search need?
Ascending sorted input for this implementation.

### Why update low to mid + 1?
The midpoint has been checked and must be excluded to ensure progress.

### What is worst-case linear-search time?
O(n).

### What governs BST search cost?
Tree height; balance gives logarithmic height.

## Practice 1 — extension · 2 marks

[A-Level: untiered] For the supplied linearSearch, what is returned for [4,9,4] with target 4, and for [] with target 4?

Answer: 0 and -1.

1. The first match returns immediately.

2. The empty array executes no loop iterations.

Marking points (one practice mark each):

- First index 0.

- Empty result -1.

## Practice 2 — extension · 3 marks

[A-Level: untiered] Trace the supplied binarySearch on [1,4,9,16,25,36,49] for target 36. Give inspected values and returned index.

Answer: 16 then 36; index 5.

1. Initial midpoint index 3 has value 16, so low=4.

2. New midpoint index 5 has value 36.

Marking points (one practice mark each):

- 16 then 36.

- Correct interval update.

- Index 5.

## Practice 3 — extension · 3 marks

[A-Level: untiered] Trace the same seven-item array for target 20. Give the inspected values and the final low/high pair.

Answer: 16,36,25; low=4, high=3.

1. After 16, search indices 4 to 6; after 36, high=4.

2. At index 4, 25 is too large, so high=3 and the interval is empty.

Marking points (one practice mark each):

- Correct values.

- Final bounds.

- Failure explained.

## Practice 4 — extension · 3 marks

[A-Level: untiered] Why can replacing low = mid + 1 with low = mid prevent termination?

Answer: When low equals mid and the target is greater, the same interval and midpoint can repeat.

1. Consider a one-element interval with a larger absent target.

2. The bound must move beyond the already-tested element.

Marking points (one practice mark each):

- Concrete small interval.

- No progress explained.

- Correct update.

## Practice 5 — extension · 3 marks

[A-Level: untiered] Why might linear search be sensible for one lookup in an unsorted small array despite binary search’s lower asymptotic search cost?

Answer: Binary search requires sorting or already ordered data; preparation and constants can outweigh one lookup’s savings.

1. Include preparation cost.

2. Distinguish growth rate from guaranteed elapsed-time superiority.

Marking points (one practice mark each):

- Sorted prerequisite.

- Preparation cost.

- Contextual judgement.

## Practice 6 — extension · 3 marks

[A-Level: untiered] An ordinary BST receives distinct keys 10,20,30,40,50 in order. Explain its worst-case search growth.

Answer: It becomes a rightward chain; worst-case search is O(n).

1. Each insertion goes right of all earlier keys.

2. Height grows with item count rather than logarithmically.

Marking points (one practice mark each):

- Chain shape.

- Height reason.

- O(n).

## Revision checklist

- Trace successful and unsuccessful searches.

- Explain binary search’s precondition and shrinking interval.

- Qualify complexity claims by data structure and case.

## Revision guide

Correctness needs a contract and progress; performance needs a case and structural assumptions. Trace the actual implementation before naming a complexity class.

### Key ideas

- What does -1 mean in these implementations? No matching array index was found.

- What precondition does binary search need? Ascending sorted input for this implementation.

- Why update low to mid + 1? The midpoint has been checked and must be excluded to ensure progress.

- What is worst-case linear-search time? O(n).

- What governs BST search cost? Tree height; balance gives logarithmic height.

### Retrieve without looking

- What does -1 mean in these implementations?

- What precondition does binary search need?

- Why update low to mid + 1?

- What is worst-case linear-search time?

- What governs BST search cost?

Mixed practice: linear-duplicates, binary-trace, missing-search, nonprogress-bug, complexity-choice, bst-chain

Explain your corrected answers without the notes. Revisit the specific section responsible for each error; completing these questions is not evidence of completing the qualification.
