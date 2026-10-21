# Probability trees, dependent events and conditional denominators

Subject: Mathematics · Unit: Probability · Revision: 2026-10-21.2

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original partial AQA GCSE Mathematics 8300 support for P4, P6, P8 and P9, checked 2026-10-19. Tree and combined-event work includes Additional Foundation content; conditional probability is a labelled Higher-tier extension. Text-based tree paths support reasoning but do not replace full diagram practice.

## Prerequisites

- Multiply and add fractions and convert between fractions and decimals.

- Distinguish an outcome from an event and identify a sample space.

## Objectives

- Build exhaustive, non-overlapping branches and check branch totals.

- Calculate path probabilities using the correct conditional branch values.

- Distinguish independence from mutual exclusivity.

- Select the correct denominator for conditional probability and explain assumptions.

## Events need a clearly defined sample space

A probability describes an event relative to a specified experiment and information. Begin by identifying what is selected, whether order matters and whether an item is replaced before the next selection. Equally likely individual objects do not imply equally likely colour labels when there are different numbers of each colour. With four red counters and two blue counters mixed uniformly, a red result has probability 4/6, not 1/2 merely because there are two named colours.

An exhaustive set includes every possible outcome under the model. Mutually exclusive events cannot happen together in a single trial. If branches are both exhaustive and mutually exclusive, their probabilities sum to one. This makes a local branch-total check useful at every node of a tree, not only at its beginning. A complement contains all outcomes outside an event, so P(not A)=1−P(A). Define A precisely first: not getting two reds is different from getting no reds.

## Read a tree as a sequence of conditional statements

A probability tree represents successive stages. Read each later branch as applying after the earlier path has happened. For a draw without replacement from four red and two blue counters, the first red branch is 4/6. After that red has been taken, the next red branch is 3/5 and the blue branch is 2/5. After a first blue, however, the next red branch is 4/5 and the blue branch is 1/5. The second-stage branches need not repeat the first-stage fractions.

The path R→B has probability (4/6)×(2/5). Multiplication here combines a first-event probability with the appropriate second-event probability conditional on the first. It does not require independence. A labelled textual tree can help organise calculations, but a drawn diagram should show which pair of branches belongs to each preceding outcome. Check each pair sums to one and that each complete path records the order. Otherwise an apparently tidy calculation may be using the wrong remaining population.

## Multiply along paths and add disjoint alternatives

Once a complete path has the right factors, multiply them to obtain its probability. To find an event represented by several non-overlapping complete paths, add those path probabilities. Exactly one red in two draws is represented by R→B or B→R. These are different ordered outcomes, so both belong in the total. Adding only one path misses valid outcomes; multiplying the two path probabilities would describe neither the intended union nor a meaningful extra stage of this experiment.

Adding probabilities without qualification is unsafe when events overlap. The rule for a union is P(A or B)=P(A)+P(B)−P(A and B), with the overlap subtracted once because it was counted twice. Disjoint complete paths on a correctly built tree have no overlap, so the subtraction term is zero. Sometimes a complement is shorter than listing every successful path: at least one success is one minus no successes. Explain the chosen event before selecting an operation; cue words alone are not a substitute for the model.

## Independence is not the same as mutual exclusivity

Two events are independent when learning that one occurred does not change the probability of the other, assuming the conditional statement is defined. Replacing a drawn counter and mixing again can justify equal branch probabilities in an ideal sampling model. Without replacement, the first draw changes the composition of the bag and usually changes the second-stage probabilities. The multiplication rule still works, but it must use those changed conditional values.

Mutual exclusivity concerns whether events can occur together, not whether one changes the probability of the other. Two different results on a single die throw are mutually exclusive; if one has occurred, the other cannot occur. For events with positive probabilities, that is not independence. Do not infer independence simply because two events have different names or occur at different times. In real data, a plausible causal story is also not enough by itself: state the sampling assumptions or examine the relevant conditional frequencies before applying an independent-event model.

## Higher-tier conditional probability changes the denominator

Conditional probability restricts attention to cases satisfying the given condition. In a fictional club of 40 students, 18 take art and 6 of those art students also take music. The probability that an art student takes music is 6/18, because the condition selects the 18 art students. The probability that a randomly chosen club member takes both is 6/40. Both calculations use the same overlap count but answer different questions. Read the word given, or its equivalent, before selecting the denominator.

In notation, P(A given B)=P(A and B)/P(B) when P(B)>0. Reversing A and B generally changes the denominator, so reverse conditional probabilities need not be equal. Two-way tables, frequency trees and Venn diagrams can expose the relevant subset. Check that the numerator is contained within the chosen denominator population. If the condition has zero cases in the supplied data, this simple frequency ratio is not defined; do not report zero as though a probability had been established. This conditional interpretation is the Higher-only part of the mapped specification.

## Validate the model and the answer separately

Arithmetic checks are necessary but not sufficient. Every probability should lie from zero to one, outgoing branches should sum to one, and complete mutually exclusive paths should sum to one. A result can satisfy these checks while still modelling the wrong experiment. For example, replacing counters when the prompt says without replacement can produce internally consistent arithmetic with the wrong answer. Keep the verbal experiment beside the calculation and verify the population after each stage.

Practice by solving a small experiment in two ways: enumerate ordered equally likely object selections, then compare with a colour tree. Agreement helps expose omitted paths and incorrect denominators. For a conditional problem, translate the answer into a sentence naming the restricted group. For a real-world dataset, acknowledge whether observed frequencies are estimates and whether the sample is representative. The worked tasks use idealised selections and fictional counts; they are not evidence of independent real-world behaviour. Full coverage still needs more Venn diagrams, frequency trees, empirical sampling and varied multi-stage applications.

## Complement events and replacement assumptions

The complement rule can shorten an at-least-one calculation, but the probability of the complementary path still depends on the sampling process. Without replacement, the second branch uses a smaller total and possibly a smaller category count. With replacement, the original composition is restored before the next draw. State which process applies before multiplying. Drawing two objects without replacement also requires treating outcomes as ordered if the tree is ordered; do not mix ordered and unordered denominators. An answer between zero and one is necessary but not sufficient for correctness. A quick enumeration of a small sample space can independently test the branch reasoning.

## Diagram: Use a complement on a tree

Read the labelled relationships to follow this worked application. The probability is 7/10. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Choose the complement: At least one red is the complement of two blue.
   Relationship to next step: follow the no-red path

2. Multiply changing branches: Without replacement, the blue path is (3/5)(2/4).
   Relationship to next step: return to the requested event

3. Subtract from one: 1 - 3/10 = 7/10.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “Events need a clearly defined sample space” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: Events need a clearly defined sample space

Worked examples: 1

Practise: q1, q2, q3, q4

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: Read a tree as a sequence of conditional statements; Multiply along paths and add disjoint alternatives; Independence is not the same as mutual exclusivity; Higher-tier conditional probability changes the denominator; Validate the model and the answer separately

Worked examples: 2, 3, 4, 5

Practise: q5, q6, q7, q8

### Complement events and replacement assumptions

Read the application diagram “Use a complement on a tree”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Complement events and replacement assumptions

Worked examples: 6

Practise: q9, q10, application-check, error-analysis

### Retrieval practice

Close the notes and answer these extra prompts from memory. Self-review with the held explanation, name one gap, then retry later. This is study practice, not an automatic mark or mastery measurement.

Read: Events need a clearly defined sample space

Worked examples: 1

Practise: retrieval-01, retrieval-02, retrieval-03, retrieval-04, retrieval-05, retrieval-06, retrieval-07, retrieval-08, retrieval-09, retrieval-10, retrieval-11, retrieval-12, retrieval-13

## Worked example 1

Draw twice without replacement from four red and two blue counters. Find P(R then R).

1. The first red probability is 4/6.

2. Given first red, three reds remain among five counters.

3. Multiply (4/6)×(3/5).

Answer: 2/5.

## Worked example 2

For the same bag, find P(exactly one red).

1. R then B gives (4/6)×(2/5)=4/15.

2. B then R gives (2/6)×(4/5)=4/15.

3. Add the disjoint paths.

Answer: 8/15.

## Worked example 3

An independent trial has success probability 0.2. Find P(at least one success in two trials).

1. No successes has probability 0.8×0.8=0.64.

2. Take the complement.

Answer: 0.36.

## Worked example 4

Of 40 fictional club members, 18 take art and 6 take both art and music. Find P(music given art).

1. Restrict the population to the 18 art students.

2. Six of those satisfy music as well.

Answer: 6/18=1/3.

## Worked example 5

A fair die is rolled once. Are 'roll a 1' and 'roll a 2' independent?

1. They are mutually exclusive, with zero intersection.

2. Independence would require intersection probability (1/6)×(1/6)=1/36.

Answer: No; the positive-probability mutually exclusive events are not independent.

## Worked example 6

A bag contains 2 red and 3 blue counters. Two are drawn without replacement. Find the probability of at least one red using the complement event.

1. The complement is drawing two blue counters.

2. P(two blue) = (3/5)(2/4) = 3/10 without replacement.

3. Subtract from one: 1 - 3/10 = 7/10.

Answer: The probability is 7/10.

## Misconceptions

- Multiplying probabilities always assumes independence.
  Correction: The general path rule uses conditional branch probabilities and also handles dependent events.

- Exactly one red is represented only by red then blue.
  Correction: Blue then red is another disjoint successful path.

- The denominator of every conditional probability is the total sample size.
  Correction: It is the size or probability of the conditioning group.

## Flashcards

### What does an exhaustive set of outcomes include?
Every outcome allowed by the model.

### What makes events mutually exclusive?
They cannot both occur in the same trial.

### What should exhaustive mutually exclusive branches from one node sum to?
One.

### How is the probability of a complete tree path calculated?
Multiply its branch probabilities, using the correct conditional values.

### When can complete path probabilities be added directly?
When the paths represent disjoint alternatives for the desired event.

### Why does removing a counter affect later branch values?
Both the remaining total and possibly a colour count change.

### What does independence say about conditional probability?
Learning that one event occurred leaves the other's probability unchanged.

### How can P(at least one success) be found?
One minus P(no successes).

### What does the condition select in a conditional-probability problem?
The restricted population used as the denominator.

### Must P(A given B) equal P(B given A)?
No; their conditioning denominators usually differ.

### Why subtract P(A and B) when adding P(A) and P(B) for a union?
The overlap was counted twice.

### Can a zero-sized conditioning group be used in a simple frequency ratio?
No; the denominator would be zero.

### What is the complement of at least one red in two draws?
No red, meaning both draws are blue when those are the only two colours.

### Why does replacement matter to a probability tree?
It determines whether the category counts and total on the next branch change.

## Practice 1 — foundation · 1 marks

Which event is the complement of getting at least one red in two draws?

A. Getting exactly one red.

B. Getting two reds.

C. Getting a red on the first draw.

D. Getting no reds in the two draws.

Answer: Getting no reds in the two draws.

1. The complement contains every outcome outside the original event.

2. Zero reds is the only alternative to one or more reds.

Marking points (one practice mark each):

- Choose no reds.

## Practice 2 — standard · 3 marks

A bag has three red and two blue counters. Two are drawn without replacement. Give the probability of two reds as a decimal.

Answer: 0.3.

1. First red has probability 3/5.

2. After red, the next red probability is 2/4.

3. Multiply the two factors.

Marking points (one practice mark each):

- Use 3/5.

- Use conditional 2/4.

- Obtain 0.3.

## Practice 3 — standard · 2 marks

After drawing a red without replacement from three red and two blue counters, state both probabilities on the next pair of branches.

Answer: Red: 2/4; blue: 2/4.

1. Remove the selected red from the counts.

2. Check the remaining probabilities sum to one.

Marking points (one practice mark each):

- Correct red branch.

- Correct blue branch.

## Practice 4 — standard · 3 marks

For two draws without replacement from three red and two blue counters, calculate P(exactly one red) as a decimal.

Answer: 0.6.

1. R→B gives (3/5)×(2/4)=0.3.

2. B→R gives (2/5)×(3/4)=0.3.

3. Add the disjoint alternatives.

Marking points (one practice mark each):

- Compute both paths.

- Add rather than multiply the alternatives.

- Obtain 0.6.

## Practice 5 — standard · 3 marks

Explain why a dependent two-draw experiment can still be solved by multiplying along a tree path.

Answer: Each later branch is conditional on earlier outcomes. Multiplying P(first) by P(second given first) is valid without assuming independence; using unchanged branch values would require justification.

1. Identify the meaning of a later branch.

2. State the general product rule.

3. Distinguish it from multiplying unconditional probabilities.

Marking points (one practice mark each):

- Identify conditional branches.

- Explain the product.

- State the independence limitation.

## Practice 6 — extension · 2 marks

A fictional club has 50 members. Twenty take art, and 8 of those also take music. Find P(music given art) as a decimal.

Answer: 0.4.

1. The conditioning group contains 20 art students.

2. Divide the overlap 8 by 20.

Marking points (one practice mark each):

- Choose denominator 20.

- Calculate 0.4.

## Practice 7 — standard · 1 marks

Two events of positive probability are mutually exclusive. Which conclusion follows?

A. They must have equal probabilities.

B. They are not independent.

C. They must exhaust the sample space.

D. Their probabilities must sum to one.

Answer: They are not independent.

1. Their intersection probability is zero.

2. The product of their positive probabilities is nonzero.

Marking points (one practice mark each):

- Choose the non-independence conclusion.

## Practice 8 — standard · 2 marks

Why is a two-colour bag not necessarily a fair 50:50 colour selection?

Answer: The numbers of individual counters in the colours can differ, even if each counter is equally likely to be drawn.

1. Distinguish equally likely objects from colour categories.

2. Connect the category probability to its count.

Marking points (one practice mark each):

- Identify unequal colour counts.

- Explain object-versus-category likelihood.

## Practice 9 — extension · 3 marks

A student divides the 8 art-and-music members by all 50 club members when asked for music given art. Explain what that ratio answers and repair it.

Answer: 8/50 gives the probability of both subjects for a random club member. The conditional question restricts to 20 art students, so the answer is 8/20.

1. Interpret the original numerator and denominator.

2. Identify the conditioning group.

3. Use its count as denominator.

Marking points (one practice mark each):

- Identify the joint probability.

- Identify the art restriction.

- Give 8/20.

## Practice 10 — standard · 3 marks

A tree's branch totals all equal one. Does that prove it correctly represents the prompt? Explain with a replacement example.

Answer: No. A with-replacement tree can have valid branch totals while incorrectly modelling a without-replacement selection. Check the experiment's conditions as well as arithmetic consistency.

1. Distinguish internal consistency from model suitability.

2. Explain how replacement changes remaining counts.

3. State the additional check.

Marking points (one practice mark each):

- Reject sufficiency of branch totals.

- Give the replacement mismatch.

- Require comparison with the stated experiment.

## Practice 11 — standard · 3 marks

A bag contains 2 red and 3 blue counters. Two are drawn without replacement. Find the probability of at least one red using the complement event.

Answer: The probability is 7/10.

1. The complement is drawing two blue counters.

2. P(two blue) = (3/5)(2/4) = 3/10 without replacement.

3. Subtract from one: 1 - 3/10 = 7/10.

Marking points (one practice mark each):

- The complement is drawing two blue counters.

- P(two blue) = (3/5)(2/4) = 3/10 without replacement.

- Subtract from one: 1 - 3/10 = 7/10.

## Practice 12 — extension · 3 marks

A learner uses 1 - (3/5)² = 16/25 for that draw. Identify the changed assumption and state when their expression would apply.

Answer: It assumes replacement before the second draw. It applies if the first counter is returned and the bag is mixed before drawing again.

1. Using 3/5 on both branches keeps the composition unchanged.

2. Without replacement, a first blue leaves two blue among four counters.

3. With replacement and the stated random-draw model, the repeated 3/5 factor is appropriate.

Marking points (one practice mark each):

- Using 3/5 on both branches keeps the composition unchanged.

- Without replacement, a first blue leaves two blue among four counters.

- With replacement and the stated random-draw model, the repeated 3/5 factor is appropriate.

## Practice 13 — foundation · 1 marks

Retrieval 1 — Probability trees, dependent events and conditional denominators: Answer from memory: What does an exhaustive set of outcomes include?

Answer: Every outcome allowed by the model.

1. Identify the target idea: What does an exhaustive set of outcomes include?

2. Compare your response with the held study explanation: Every outcome allowed by the model.

Marking points (one practice mark each):

- Accurately address: What does an exhaustive set of outcomes include?

## Practice 14 — standard · 1 marks

Retrieval 2 — Probability trees, dependent events and conditional denominators: State the condition or distinction precisely: What makes events mutually exclusive?

Answer: They cannot both occur in the same trial.

1. Identify the target idea: What makes events mutually exclusive?

2. Compare your response with the held study explanation: They cannot both occur in the same trial.

Marking points (one practice mark each):

- Accurately address: What makes events mutually exclusive?

## Practice 15 — extension · 1 marks

Retrieval 3 — Probability trees, dependent events and conditional denominators: Explain the idea in your own words: What should exhaustive mutually exclusive branches from one node sum to?

Answer: One.

1. Identify the target idea: What should exhaustive mutually exclusive branches from one node sum to?

2. Compare your response with the held study explanation: One.

Marking points (one practice mark each):

- Accurately address: What should exhaustive mutually exclusive branches from one node sum to?

## Practice 16 — foundation · 1 marks

Retrieval 4 — Probability trees, dependent events and conditional denominators: Answer from memory: How is the probability of a complete tree path calculated?

Answer: Multiply its branch probabilities, using the correct conditional values.

1. Identify the target idea: How is the probability of a complete tree path calculated?

2. Compare your response with the held study explanation: Multiply its branch probabilities, using the correct conditional values.

Marking points (one practice mark each):

- Accurately address: How is the probability of a complete tree path calculated?

## Practice 17 — standard · 1 marks

Retrieval 5 — Probability trees, dependent events and conditional denominators: State the condition or distinction precisely: When can complete path probabilities be added directly?

Answer: When the paths represent disjoint alternatives for the desired event.

1. Identify the target idea: When can complete path probabilities be added directly?

2. Compare your response with the held study explanation: When the paths represent disjoint alternatives for the desired event.

Marking points (one practice mark each):

- Accurately address: When can complete path probabilities be added directly?

## Practice 18 — extension · 1 marks

Retrieval 6 — Probability trees, dependent events and conditional denominators: Explain the idea in your own words: Why does removing a counter affect later branch values?

Answer: Both the remaining total and possibly a colour count change.

1. Identify the target idea: Why does removing a counter affect later branch values?

2. Compare your response with the held study explanation: Both the remaining total and possibly a colour count change.

Marking points (one practice mark each):

- Accurately address: Why does removing a counter affect later branch values?

## Practice 19 — foundation · 1 marks

Retrieval 7 — Probability trees, dependent events and conditional denominators: Answer from memory: What does independence say about conditional probability?

Answer: Learning that one event occurred leaves the other's probability unchanged.

1. Identify the target idea: What does independence say about conditional probability?

2. Compare your response with the held study explanation: Learning that one event occurred leaves the other's probability unchanged.

Marking points (one practice mark each):

- Accurately address: What does independence say about conditional probability?

## Practice 20 — standard · 1 marks

Retrieval 8 — Probability trees, dependent events and conditional denominators: State the condition or distinction precisely: How can P(at least one success) be found?

Answer: One minus P(no successes).

1. Identify the target idea: How can P(at least one success) be found?

2. Compare your response with the held study explanation: One minus P(no successes).

Marking points (one practice mark each):

- Accurately address: How can P(at least one success) be found?

## Practice 21 — extension · 1 marks

Retrieval 9 — Probability trees, dependent events and conditional denominators: Explain the idea in your own words: What does the condition select in a conditional-probability problem?

Answer: The restricted population used as the denominator.

1. Identify the target idea: What does the condition select in a conditional-probability problem?

2. Compare your response with the held study explanation: The restricted population used as the denominator.

Marking points (one practice mark each):

- Accurately address: What does the condition select in a conditional-probability problem?

## Practice 22 — foundation · 1 marks

Retrieval 10 — Probability trees, dependent events and conditional denominators: Answer from memory: Must P(A given B) equal P(B given A)?

Answer: No; their conditioning denominators usually differ.

1. Identify the target idea: Must P(A given B) equal P(B given A)?

2. Compare your response with the held study explanation: No; their conditioning denominators usually differ.

Marking points (one practice mark each):

- Accurately address: Must P(A given B) equal P(B given A)?

## Practice 23 — standard · 1 marks

Retrieval 11 — Probability trees, dependent events and conditional denominators: State the condition or distinction precisely: Why subtract P(A and B) when adding P(A) and P(B) for a union?

Answer: The overlap was counted twice.

1. Identify the target idea: Why subtract P(A and B) when adding P(A) and P(B) for a union?

2. Compare your response with the held study explanation: The overlap was counted twice.

Marking points (one practice mark each):

- Accurately address: Why subtract P(A and B) when adding P(A) and P(B) for a union?

## Practice 24 — extension · 1 marks

Retrieval 12 — Probability trees, dependent events and conditional denominators: Explain the idea in your own words: Can a zero-sized conditioning group be used in a simple frequency ratio?

Answer: No; the denominator would be zero.

1. Identify the target idea: Can a zero-sized conditioning group be used in a simple frequency ratio?

2. Compare your response with the held study explanation: No; the denominator would be zero.

Marking points (one practice mark each):

- Accurately address: Can a zero-sized conditioning group be used in a simple frequency ratio?

## Practice 25 — foundation · 1 marks

Retrieval 13 — Probability trees, dependent events and conditional denominators: Answer from memory: What is the complement of at least one red in two draws?

Answer: No red, meaning both draws are blue when those are the only two colours.

1. Identify the target idea: What is the complement of at least one red in two draws?

2. Compare your response with the held study explanation: No red, meaning both draws are blue when those are the only two colours.

Marking points (one practice mark each):

- Accurately address: What is the complement of at least one red in two draws?

## Revision checklist

- State replacement, ordering and equal-likelihood assumptions.

- Update counts after every without-replacement branch.

- Include every disjoint path for exactly-one questions.

- Name the restricted group in a conditional answer.

- Explain the reasoning in “Use a complement on a tree” and correct the linked error-analysis response without copying its solution.

## Revision guide

The complement rule can shorten an at-least-one calculation, but the probability of the complementary path still depends on the sampling process. Without replacement, the second branch uses a smaller total and possibly a smaller category count. With replacement, the original composition is restored before the next draw. State which process applies before multiplying. Drawing two objects without replacement also requires treating outcomes as ordered if the tree is ordered; do not mix ordered and unordered denominators. An answer between zero and one is necessary but not sufficient for correctness. A quick enumeration of a small sample space can independently test the branch reasoning.

### Key ideas

- At least one red is the complement of two blue.

- Without replacement, the blue path is (3/5)(2/4).

- 1 - 3/10 = 7/10.

- The general path rule uses conditional branch probabilities and also handles dependent events.

### Retrieve without looking

- What is the complement of at least one red in two draws?

- Why does replacement matter to a probability tree?

- What does an exhaustive set of outcomes include?

Mixed practice: q1, application-check, error-analysis

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.

## Partial syllabus crosswalk

Source-checked means the official point was inspected, not independently approved teaching or complete coverage.

### aqa-8300-probability: P4

[Official specification reference](https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/subject-content/3.5-probability)

Version: First teaching 2015; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Section 3.5; P4, P6, P8 and P9.

Tier/scope: Basic Foundation probability totals and complements

Teaching: Events need a clearly defined sample space

Practice IDs: q1, q10

Still required:

- More exhaustive-event and complement applications.

### aqa-8300-probability: P6

[Official specification reference](https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/subject-content/3.5-probability)

Version: First teaching 2015; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Section 3.5; P4, P6, P8 and P9.

Tier/scope: Additional Foundation tree representation

Teaching: Read a tree as a sequence of conditional statements

Practice IDs: q3

Still required:

- Draw full labelled trees, grids and Venn diagrams rather than only textual paths.

### aqa-8300-probability: P8

[Official specification reference](https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/subject-content/3.5-probability)

Version: First teaching 2015; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Section 3.5; P4, P6, P8 and P9.

Tier/scope: Additional Foundation independent/dependent combined events

Teaching: Multiply along paths and add disjoint alternatives; Independence is not the same as mutual exclusivity

Practice IDs: q2, q4, q5, q7, q8

Still required:

- Further multi-stage representations and underlying assumptions.

### aqa-8300-probability: P9

[Official specification reference](https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/subject-content/3.5-probability)

Version: First teaching 2015; live section inspected 2026-10-19. Checked: 2026-10-19. Location: Section 3.5; P4, P6, P8 and P9.

Tier/scope: Higher only conditional probability

Teaching: Higher-tier conditional probability changes the denominator

Practice IDs: q6, q9

Still required:

- Further two-way tables, expected-frequency trees and Venn-diagram cases.
