# Linear and binary search: tracing, invariants and test cases

Subject: Computer Science · Unit: Fundamentals of algorithms · Revision: 2026-10-21.3

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original partial support for AQA GCSE Computer Science 8525, first teaching September 2025, sections 3.1.1-3 checked 2026-10-19. Uses explicitly defined editorial pseudocode and zero-based indexing, not a claim to reproduce AQA's pseudocode standard. Formal complexity notation and sorting are outside this map.

## Prerequisites

- Read ordered lists and distinguish an index from a stored value.

- Follow assignment, comparison, selection and repetition.

## Objectives

- Trace linear and binary search with explicit indexing and stopping rules.

- Explain why binary search needs ordered data.

- Compare search methods using stated costs and assumptions.

- Design boundary tests and identify off-by-one errors.

## Specify the search contract before tracing

A search takes a collection and a target value and determines whether an appropriate match exists. Decide what the output means before following an algorithm. This lesson returns the zero-based index of one matching element, or −1 when no match exists. Index 0 is a valid first position, so it must not be confused with failure. With duplicate target values, returning any matching index is different from promising the first match; the ordinary binary search below promises only one match.

An algorithm is the method, while a program is one implementation of it. A trace records changing state for a particular input; it can illustrate behaviour without proving that every input works. Our lists permit direct access by index. Empty lists, missing targets and targets at either boundary are part of the contract, not optional inconveniences. In a written response, state the data, target, indexing convention and return convention so that the examiner or reviewer can reproduce the same trace.

## Linear search checks candidates in sequence

Linear search begins at the first element and compares each candidate with the target until it finds a match or exhausts the list. In this lesson's editorial pseudocode: for i from 0 through length−1, return i if items[i] equals target; after the loop return −1. The failure return belongs after the loop, not after the first failed comparison. Otherwise the method would incorrectly give up whenever the first item was not the target.

The method does not require sorted input because it does not discard unexamined values based on order. When searching for a single value, finding a match allows an early return. In the worst case for n items, it inspects n candidates: this occurs for a missing target or a target first matched at the end. An empty list inspects no candidates. This count describes element inspections, not necessarily every machine instruction, and the exact elapsed time also depends on implementation and data access.

## Binary search maintains a shrinking candidate interval

Binary search uses sorted ascending data and keeps inclusive bounds low and high around positions that might still contain the target. Initialise low=0 and high=length−1. While low≤high, choose mid=floor((low+high)/2). If items[mid] equals the target, return mid. If the middle value is smaller, set low=mid+1. If it is larger, set high=mid−1. When the bounds cross, return −1. These are editorial rules for this lesson, not a quotation of an official pseudocode language.

Ordering justifies eliminating a half: if the middle value is too small, all values at earlier indices are also too small for this ascending list. The useful invariant is that any remaining match, if one exists, lies inside the current interval. Each unsuccessful iteration excludes the already-tested midpoint and shrinks that interval. Keeping the midpoint by setting low=mid can prevent progress near the boundary. An empty list begins with high=−1, so the loop condition fails immediately without indexing an element.

## Trace values, indices and comparisons separately

Use columns for low, high, mid, middle value and the decision. For the list [2,5,8,11,14,17,20] and target 17, the first midpoint is index 3 with value 11. The next interval is indices 4 through 6, whose midpoint is index 5 with value 17. The output is 5, not 17, because the contract returns an index. If a one-based position is requested instead, convert the output explicitly rather than changing conventions halfway through.

Define what a comparison count means. We count one middle-element inspection per binary-search iteration, even if an implementation performs an equality test followed by an order test on that element. For the example, two elements are inspected. A different midpoint convention can change the exact trace on even-length intervals, so state the floor rule used here. A missing-target trace must continue until low exceeds high; stopping when only one candidate remains would skip a valid final check. Keep the output separate from the number of inspections.

## Choose an algorithm using the workload

Binary search often inspects far fewer elements than linear search in a large sorted, directly indexable list because it repeatedly reduces the candidate interval. That does not mean it is automatically the best choice for every task. An unsorted list must be prepared into a suitable order before ordinary binary search applies. For one search, preparation may cost more than simply scanning; for many searches over stable data, the preparation may be worthwhile. This lesson compares reasoning about time without requiring formal asymptotic notation.

Sorting can also change indices. If an application needs the original position of an item, reordering the values without preserving their original indices changes the meaning of the result. Frequent insertions or updates can create additional maintenance work. Strings require a consistent ordering rule; a human alphabetical assumption may differ from a program's comparator. State the relevant data and workload assumptions before concluding that one approach is more efficient. Neither an inspection count on one input nor a single timed run establishes universal superiority.

## Test boundary behaviour and explain defects

A small test suite should include an empty list, a one-item match, a one-item miss, first and last matches, an internal match, a missing value between present values, and a value outside the list's range. For duplicate values, check the promised contract: any valid matching index is acceptable here, while a first-occurrence search would need extra logic. Test lists must meet the algorithm's preconditions; an unsorted binary-search test can demonstrate misuse, not necessarily a defect in the specified algorithm.

When a trace fails, identify the first state that violates the intended rule. Returning failure inside a linear-search loop discards unchecked items. Keeping a failed midpoint can make a binary interval stop shrinking. Using length rather than length−1 as an inclusive high bound can access outside the list. Explain the consequence and the correction, then replay a boundary case. These exercises support searching mechanics and trace reasoning, but sorting methods, full flowchart construction, broad decomposition and executable-language practice remain separate work in the mapped course.

## Specifying which duplicate a search must return

Finding any matching value is a different contract from finding the first matching index. An ordinary binary search can stop when it encounters equality, which may return a middle duplicate. To find the first match in a sorted ascending array, retain the equal index as a candidate and continue searching to its left. If no earlier equal value is found, return the retained candidate. The invariant now includes both the remaining candidate interval and the best equal index seen so far. Make indexing and midpoint rounding explicit when tracing. An empty array and an absent target still need defined results; this example uses -1 for absence.

## State whether the result is a match or an insertion position

Search contracts determine how equality and boundaries should be handled. A routine that returns any matching index is different from one that returns the first matching index or the first value at least as large as a target. Half-open bounds [low,high) can simplify insertion-position searches: high may equal the list length without being read as an element. A loop must shrink the interval on every iteration. Trace absent targets and duplicates as well as successful matches, and retain original indices if sorting would otherwise lose them.

## Diagram: Find the first duplicate

Read the labelled relationships to follow this worked application. Midpoint indices are 2, 0, 1; the returned first matching index is 1. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Retain a match: Midpoint 2 contains 4, so store candidate 2.
   Relationship to next step: do not stop at the first equality

2. Search earlier positions: Continue left; index 0 is too small and index 1 matches.
   Relationship to next step: finish when no earlier candidate remains

3. Return the earliest candidate: Store 1, exhaust the left interval and return index 1.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “Specify the search contract before tracing” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: Specify the search contract before tracing

Worked examples: 1

Practise: q1, q2, q3, q4

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: Linear search checks candidates in sequence; Binary search maintains a shrinking candidate interval; Trace values, indices and comparisons separately; Choose an algorithm using the workload; Test boundary behaviour and explain defects

Worked examples: 2, 3, 4, 5

Practise: q5, q6, q7, q8

### Specifying which duplicate a search must return

Read the application diagram “Find the first duplicate”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Specifying which duplicate a search must return

Worked examples: 6

Practise: q9, q10, application-check, error-analysis

### Apply and test the limits

Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.

Read: State whether the result is a match or an insertion position

Worked examples: 6

Practise: depth-lower-bound, depth-missing-large, depth-preserve-index

## Worked example 1

Linear-search [9,4,12,6] for 12 using zero-based indices.

1. Inspect index 0: 9 is not 12.

2. Inspect index 1: 4 is not 12.

3. Inspect index 2: 12 matches; return.

Answer: Index 2 after three element inspections.

## Worked example 2

Binary-search [2,5,8,11,14,17,20] for 17 with floor midpoint and inclusive bounds.

1. low=0, high=6, mid=3; 11 is too small, so low=4.

2. low=4, high=6, mid=5; 17 matches.

Answer: Index 5 after two middle-element inspections.

## Worked example 3

Binary-search [2,5,8,11,14,17,20] for 6.

1. mid=3 gives 11, so high=2.

2. mid=1 gives 5, so low=2.

3. mid=2 gives 8, so high=1; the bounds cross.

Answer: −1 after three middle-element inspections.

## Worked example 4

What happens for an empty list?

1. Linear search has no indices to visit.

2. Binary search starts low=0, high=−1, so its loop is not entered.

Answer: Both return −1 with zero element inspections.

## Worked example 5

Why can low=mid cause a loop for [3,7] searching for 7?

1. low=0, high=1 gives mid=0 and value 3.

2. Updating low to mid leaves low=0 and repeats the same state.

3. low=mid+1 removes the known-too-small midpoint.

Answer: The incorrect update may never shrink the interval.

## Worked example 6

Trace first-match binary search for target 4 in zero-indexed [1, 4, 4, 4, 9]. Use inclusive low/high bounds, floor midpoint, candidate initially -1, and on equality store mid then set high = mid - 1.

1. At low 0, high 4, mid 2 matches: candidate 2, high 1.

2. At low 0, high 1, mid 0 contains 1, so set low 1.

3. At low 1, high 1, mid 1 matches: candidate 1, high 0; the interval is empty and return 1.

Answer: Midpoint indices are 2, 0, 1; the returned first matching index is 1.

## Misconceptions

- Binary search works on any list because it tests the middle.
  Correction: Discarding halves requires the stated ordering precondition.

- Returning index 0 means failure.
  Correction: Index 0 is the first element; this contract uses −1 for failure.

- A single successful trace proves an algorithm correct.
  Correction: It demonstrates that case; boundary tests and reasoning are also needed.

## Flashcards

### What does this lesson's search contract return on failure?
−1; index 0 is a valid match.

### Does linear search require sorted values?
No.

### Where does the failure return belong in linear search?
After all candidates have been checked, outside the loop.

### What input order does this binary-search version require?
Ascending order under a consistent comparator.

### How is the midpoint chosen here?
floor((low+high)/2), with inclusive bounds.

### What update follows a middle value smaller than the target?
low=mid+1.

### What update follows a middle value larger than the target?
high=mid−1.

### When does an unsuccessful binary search terminate?
When low exceeds high.

### What does the candidate-interval invariant say?
Any remaining match lies within the current low-to-high interval.

### Does ordinary binary search necessarily return the first duplicate?
No; this contract returns any matching index.

### What preparation cost matters before searching unsorted data by binary search?
Establishing and maintaining the required ordering.

### Name two essential boundary tests for search.
An empty list and a one-item match or miss.

### Why does duplicate handling belong in the search contract?
Any match, first match and last match can require different stopping and boundary rules.

### What happens after equality in this first-match binary search?
Store the index as a candidate, then continue with high = mid - 1.

## Practice 1 — foundation · 1 marks

Which condition justifies discarding a half in this binary-search algorithm?

A. The target must be the first value.

B. Every value must be positive.

C. The list is sorted ascending under the same comparison rule.

D. The list must contain an even number of values.

Answer: The list is sorted ascending under the same comparison rule.

1. The midpoint comparison must imply something about other values.

2. Ascending order supplies that implication.

Marking points (one practice mark each):

- Choose the ordering precondition.

## Practice 2 — standard · 2 marks

Linear-search [7,2,9,4,12] for 4. How many elements are inspected before returning?

Answer: 4 inspections.

1. Inspect 7, then 2, then 9.

2. The fourth inspected value is the match 4.

Marking points (one practice mark each):

- Trace candidates in order.

- State four inspections, not index three.

## Practice 3 — standard · 2 marks

Binary-search [1,4,7,10,13,16,19] for 16 using the lesson's rules. Give the midpoint indices visited and returned index.

Answer: Visited 3 then 5; returned index 5.

1. The first midpoint value is 10, so restrict to indices 4 through 6.

2. The next midpoint is index 5 with value 16.

Marking points (one practice mark each):

- Correct first update.

- Correct second midpoint and return.

## Practice 4 — standard · 3 marks

For [1,4,7,10,13,16,19] and target 12, how many middle-element inspections does binary search make using inclusive bounds and floor midpoint?

Answer: 3 inspections.

1. Index 3 has 10, so low becomes 4.

2. Index 5 has 16, so high becomes 4.

3. Index 4 has 13, so high becomes 3 and the loop ends.

Marking points (one practice mark each):

- Trace the three candidate indices.

- Stop when bounds cross.

- State three inspections.

## Practice 5 — standard · 3 marks

Explain why updating low to mid rather than mid+1 can fail in an inclusive-bound binary search.

Answer: The already-tested midpoint may remain in the interval. In a two-item interval the floor midpoint can equal low, so low=mid makes no progress and repeats the state.

1. Identify the excluded candidate that should be removed.

2. Use the two-item boundary case.

3. Give the progress-preserving update.

Marking points (one practice mark each):

- Identify retained midpoint.

- Explain nontermination possibility.

- Correct to mid+1.

## Practice 6 — standard · 2 marks

What is the maximum number of element inspections for a linear search over 12 items under this contract?

Answer: 12.

1. A missing target forces examination of every item.

2. There are 12 candidates.

Marking points (one practice mark each):

- Identify the worst-case input.

- State 12.

## Practice 7 — foundation · 1 marks

What does returned index 0 mean under this lesson's contract?

A. A match at the first element.

B. No match exists.

C. The target value must be zero.

D. The list must be empty.

Answer: A match at the first element.

1. Indices start at zero.

2. Failure is represented by −1 instead.

Marking points (one practice mark each):

- Choose the first-element match.

## Practice 8 — standard · 2 marks

What should binary search return for an empty list, and why is no element access needed?

Answer: −1; low=0 and high=−1 make the loop condition false immediately.

1. Calculate the initial bounds.

2. Apply low≤high before reading an item.

Marking points (one practice mark each):

- Correct failure result.

- Explain the skipped loop.

## Practice 9 — extension · 3 marks

An application needs one lookup in an unsorted list and must report the original index. Why is 'binary search is always faster' inadequate?

Answer: Sorting has a time cost and changes positions unless original indices are retained. For one lookup, a linear scan may be more suitable; the workload and indexing contract matter.

1. Identify required preparation.

2. Identify output-meaning risk.

3. Qualify the efficiency comparison.

Marking points (one practice mark each):

- Mention sorting cost.

- Preserve original index meaning.

- Relate choice to workload.

## Practice 10 — standard · 3 marks

A search implementation returns −1 after the first nonmatching element. Give a failing test and explain the correction.

Answer: Searching [3,8] for 8 fails incorrectly after 3. Keep checking later elements and return −1 only after the loop has exhausted every candidate.

1. Choose a target beyond the first position.

2. Trace the premature failure.

3. Move the failure return outside the loop.

Marking points (one practice mark each):

- Provide a valid failing case.

- Explain the skipped candidate.

- Give the control-flow correction.

## Practice 11 — standard · 3 marks

Trace first-match binary search for target 4 in zero-indexed [1, 4, 4, 4, 9]. Use inclusive low/high bounds, floor midpoint, candidate initially -1, and on equality store mid then set high = mid - 1.

Answer: Midpoint indices are 2, 0, 1; the returned first matching index is 1.

1. At low 0, high 4, mid 2 matches: candidate 2, high 1.

2. At low 0, high 1, mid 0 contains 1, so set low 1.

3. At low 1, high 1, mid 1 matches: candidate 1, high 0; the interval is empty and return 1.

Marking points (one practice mark each):

- At low 0, high 4, mid 2 matches: candidate 2, high 1.

- At low 0, high 1, mid 0 contains 1, so set low 1.

- At low 1, high 1, mid 1 matches: candidate 1, high 0; the interval is empty and return 1.

## Practice 12 — extension · 3 marks

A learner stops at midpoint 2 and reports that first-match search succeeded. Explain which contract it satisfies and what must change for the requested contract.

Answer: Index 2 satisfies any-match search but not first-match search. Retain it and continue left on equality to seek an earlier match.

1. The value at index 2 equals the target.

2. Index 1 also contains 4 and is earlier.

3. Continuing in the left interval after equality distinguishes first-match from any-match behaviour.

Marking points (one practice mark each):

- The value at index 2 equals the target.

- Index 1 also contains 4 and is earlier.

- Continuing in the left interval after equality distinguishes first-match from any-match behaviour.

## Practice 13 — extension · 3 marks

Find the first index with value at least 5 in sorted [1,3,3,7,9] using low=0, high=5, while low<high, mid=floor((low+high)/2), low=mid+1 if a[mid]<5, otherwise high=mid. Trace mid and return low.

Answer: Midpoints are 2,4,3; return index 3, containing 7.

1. At 2, value 3 moves low to 3; at 4, value 9 moves high to 4.

2. At 3, value 7 moves high to 3 and the interval becomes empty.

Marking points (one practice mark each):

- Trace midpoints 2,4,3.

- Apply the correct bound updates.

- Return insertion/lower-bound index 3.

## Practice 14 — standard · 3 marks

Using the same half-open lower-bound contract on [2,4,6] for target 9, what index is returned and why must it not be dereferenced?

Answer: Return 3, the list length. It represents insertion after all elements and is not a valid existing element index.

1. Every stored value is less than 9, so the lower bound is the end position.

2. Distinguish a valid insertion position from a valid array element.

Marking points (one practice mark each):

- Return 3.

- Explain insertion after the list.

- Reject reading a[3].

## Practice 15 — standard · 3 marks

An unsorted list is [30,10,20]. An application sorts it and finds 20 at sorted index 1, then reports original index 1. Explain and repair the error.

Answer: 20 was originally at index 2. Store value-original-index pairs before sorting, or use linear search on the original list.

1. Sorting changes positions while leaving values intact.

2. Carry original indices through the transformation when the contract requires them.

Marking points (one practice mark each):

- Identify original index 2.

- Explain sorted versus original positions.

- Give a valid preservation or search method.

## Revision checklist

- State indexing, midpoint and return conventions.

- Track current bounds separately from stored values.

- Exclude a failed midpoint so the interval shrinks.

- Test failure, boundaries and duplicates against the actual contract.

- Explain the reasoning in “Find the first duplicate” and correct the linked error-analysis response without copying its solution.

## Revision guide

Finding any matching value is a different contract from finding the first matching index. An ordinary binary search can stop when it encounters equality, which may return a middle duplicate. To find the first match in a sorted ascending array, retain the equal index as a candidate and continue searching to its left. If no earlier equal value is found, return the retained candidate. The invariant now includes both the remaining candidate interval and the best equal index seen so far. Make indexing and midpoint rounding explicit when tracing. An empty array and an absent target still need defined results; this example uses -1 for absence.

### Key ideas

- Midpoint 2 contains 4, so store candidate 2.

- Continue left; index 0 is too small and index 1 matches.

- Store 1, exhaust the left interval and return index 1.

- Discarding halves requires the stated ordering precondition.

### Retrieve without looking

- Why does duplicate handling belong in the search contract?

- What happens after equality in this first-match binary search?

- What does this lesson's search contract return on failure?

Mixed practice: q1, application-check, error-analysis, depth-lower-bound, depth-missing-large, depth-preserve-index

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.

## Partial syllabus crosswalk

Source-checked means the official point was inspected, not independently approved teaching or complete coverage.

### aqa-8525-algorithms-2025: 3.1.1

[Official specification reference](https://www.aqa.org.uk/subjects/computer-science/gcse/computer-science-8525/specification/subject-content/fundamentals-of-algorithms)

Version: First teaching September 2025; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Sections 3.1.1-3: representation, efficiency and searching.

Tier/scope: GCSE Computer Science; first teaching September 2025

Teaching: Specify the search contract before tracing; Trace values, indices and comparisons separately; Test boundary behaviour and explain defects

Practice IDs: q3, q5, q10

Still required:

- More full flowcharts, decomposition, abstraction and algorithm construction.

### aqa-8525-algorithms-2025: 3.1.2

[Official specification reference](https://www.aqa.org.uk/subjects/computer-science/gcse/computer-science-8525/specification/subject-content/fundamentals-of-algorithms)

Version: First teaching September 2025; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Sections 3.1.1-3: representation, efficiency and searching.

Tier/scope: GCSE Computer Science; first teaching September 2025

Teaching: Choose an algorithm using the workload

Practice IDs: q2, q4, q6, q9

Still required:

- Broader time-efficiency comparisons on varied workloads; formal notation not required here.

### aqa-8525-algorithms-2025: 3.1.3

[Official specification reference](https://www.aqa.org.uk/subjects/computer-science/gcse/computer-science-8525/specification/subject-content/fundamentals-of-algorithms)

Version: First teaching September 2025; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Sections 3.1.1-3: representation, efficiency and searching.

Tier/scope: GCSE Computer Science; first teaching September 2025

Teaching: Linear search checks candidates in sequence; Binary search maintains a shrinking candidate interval

Practice IDs: q1, q3, q7, q8

Still required:

- Further executable implementations and trace practice, including duplicate handling.
