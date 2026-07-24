# Probability and Statistics

---

## 1. Key Concepts

### Basic Probability — P(A), Complements, and Set Notation

The probability of an event A is written P(A) and always satisfies 0 ≤ P(A) ≤ 1. Complementary events cover the entire sample space, so P(A) + P(A') = 1, which means P(A') = 1 − P(A).

Set notation appears directly on exam papers — the mark scheme penalises vague descriptions in place of correct symbols. The key expressions to know:

| Expression | Meaning | Example from exam |
|---|---|---|
| A ∩ B | A and B (both events occur) | P(G ∩ C) = probability of having two red-hair genes AND red hair (N23 Q5) |
| A ∪ B | A or B (at least one occurs) | |
| A' | Complement of A (A does not occur) | P(G' ∩ C') = no red-hair genes and no red hair (N23 Q5a) |
| A ∩ B' | A but not B | Z ∩ N' = integers that are not natural numbers (N17 Q1c) |

**Mark scheme key phrase:** When asked to "describe the region A ∩ B in context," give a written description using the subject matter — do NOT just write the symbol or state the count. In M19 Q3b the answer was "students who study Extended mathematics and Physics." Writing "elements in both A and B" or just writing "9" earned no marks.

**Worked example — N23 Q5a:** The tree diagram uses events G (two red-hair genes) and C (red hair). The question asks for the notation of "a person who does not have two red-hair genes and has no red hair." The answer is P(G' ∩ C'). A common wrong answer is P(G ∪ C)' — which is equivalent but requires De Morgan's law and is not the form the mark scheme expects when the description explicitly names both negations separately.

---

### Tree Diagrams — With and Without Replacement

A tree diagram shows successive events as branching paths. Each branch is labelled with a conditional probability. The probability of a complete path (outcome) is found by multiplying along the branches. To find the probability of a combined event that can happen via more than one path, add the relevant path probabilities.

**Without replacement:** after the first selection, the total decreases by 1 and the count of the selected type also changes. Every second-level branch probability must reflect the new reduced total.

**With replacement:** all second-level branch probabilities are identical to the first level.

**Worked example — N17 Q3 (without replacement):** A bag holds 7 balls: 3 even (−12, 0, 10) and 4 odd (−9, 3, 7, 15). Two balls are drawn without replacement.

- P(first even) = 3/7; P(second even | first even) = 2/6 (only 2 even left out of 6 remaining)
- P(first odd) = 4/7; P(second even | first odd) = 3/6 (all 3 even still present, 6 remaining)

To win 5 AUD, both balls must be even:
P(both even) = 3/7 × 2/6 = 6/42 = **1/7**

To win 10 AUD, the total must be even. Even + even = even; odd + odd = even. So:
P(total even) = P(both even) + P(both odd) = 1/7 + (4/7 × 3/6) = 1/7 + 12/42 = 6/42 + 12/42 = 18/42 = **3/7**

**Mark scheme note (N17 Q3b/3c):** The answer must be given as a fraction less than 1. Write the full product of branch probabilities as working — "1/7 without working award 2 marks" means you lose a method mark if you omit the multiplication step. Accept equivalent forms: 6/42, 18/42, 0.4286, 43% are all accepted for 3/7.

---

### Venn Diagrams and Set Notation

A Venn diagram shows sets as overlapping circles inside a rectangle (the universal set). The key regions are:

| Region | Meaning | How to find the count |
|---|---|---|
| A only | In A but not B | Total in A minus A ∩ B |
| A ∩ B | In both | Given or calculated from totals |
| B only | In B but not A | Total in B minus A ∩ B |
| Outside both | In neither | Total − (A only) − (A ∩ B) − (B only) |

**Worked example — M19 Q3 (completing a Venn diagram):** 60 students; 22 study Extended Maths (Set A); 21 study Physics (Set B); 26 study neither; 9 in A ∩ B.

- A only = 22 − 9 = **13**
- B only = 21 − 9 = **12**
- Outside = 26 (given directly — check: 13 + 9 + 12 + 26 = 60 ✓)

Once complete, P(A ∩ B) = 9/60 = **3/20**.

**Mark scheme note (M19 Q3c):** "9 over 60" written as a ratio (9:60) earns only 1 mark; you must write it as a fraction or decimal (9/60, 3/20, 0.15, or 15%) for full credit. The form "1.5/10" is explicitly NOT accepted — simplify correctly.

---

### Probability from Combined Events — P(A or B) and P(A|B)

For any two events:
- **Addition rule:** P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
- **Conditional probability:** P(A|B) = P(A ∩ B) / P(B)
- **Multiplication rule:** P(A ∩ B) = P(A) × P(B|A)

For **independent** events, P(A ∩ B) = P(A) × P(B) — the second-level probabilities on a tree diagram do not change.

**Worked example — N23 Q5c/5d:** Events G and C are connected through a tree diagram. P(G) = 0.15, P(G') = 0.85, P(C|G) = 0.9, P(C|G') = 0.06.

P(G ∩ C) = 0.15 × 0.9 = **0.135**

P(C) = P(G ∩ C) + P(G' ∩ C) = 0.135 + (0.85 × 0.06) = 0.135 + 0.051 = **0.186**

The mark scheme requires both paths to be shown — writing only 0.135 earns 1 mark; you must add the second path (G' branch) to earn full credit.

---

### Expected Value

The expected number of outcomes in a population is found by multiplying the probability by the population size, then rounding to a whole number (you cannot have a fractional person).

**Worked example — N23 Q5e:** P(red hair) = 0.186; population = 15 500.
Expected number = 0.186 × 15 500 = 2883.

**Mark scheme note (N23 Q5e):** Round to a whole number. Accept rounding up or down from the calculated decimal — both 2883 and 2884 are accepted. The working (probability × population) must be visible.

---

### Mean, Median, Mode from Raw and Grouped Data

**Raw data:**
- **Mean** = sum of all values ÷ number of values
- **Median** = middle value when data is in order (or average of two middle values for even-count data)
- **Mode** = most frequent value
- **Range** = maximum − minimum

**Grouped data — estimating the mean:** Use the mid-interval value for each class. Multiply each mid-value by its frequency, sum the products, divide by total frequency.

**Worked example — N23 Q6b:** Age data for 331 residents in grouped classes.

| Age group | Mid-value | Frequency | Product |
|---|---|---|---|
| 0 < A ≤ 10 | 5 | 59 | 295 |
| 10 < A ≤ 20 | 15 | 72 | 1080 |
| 20 < A ≤ 30 | 25 | 54 | 1350 |
| 30 < A ≤ 40 | 35 | 126 | 4410 |
| 40 < A ≤ 50 | 45 | 15 | 675 |
| 50 < A ≤ 60 | 55 | 5 | 275 |
| **Total** | | **331** | **8085** |

Estimated mean = 8085 ÷ 331 = **24.4 years** (3 s.f.)

**Modal class** = 30 < A ≤ 40 (highest frequency = 126). Write the full inequality — writing "31 ≤ A ≤ 40" or just "35" earns no marks (N23 Q6a).

**Mark scheme note (N17 Q3d–3e):** When finding the median of an extended ordered list, identify the middle position(s) carefully. For 10 data values, the median is the average of the 5th and 6th values. "Show that" questions (like N17 Q3d) require writing the calculation (3 + b)/2 = 5 explicitly — stating the answer only earns no credit.

For simultaneous equations built from range and mean (N17 Q3e): set up both equations clearly (range equation: c − a = 34; mean equation: sum/10 = 2.7), simplify to a + c = 6, then solve. Writing final answers (a = −14, c = 20) without setting up the equations earns only 2 out of 6 marks.

---

### Cumulative Frequency Graphs and Box Plots

A cumulative frequency graph plots upper class boundary on the x-axis against cumulative frequency on the y-axis. Reading from it:

| Reading | How |
|---|---|
| Median | At cumulative frequency = n/2; read across to x-axis |
| Lower quartile (Q1) | At cumulative frequency = n/4 |
| Upper quartile (Q3) | At cumulative frequency = 3n/4 |
| IQR | Q3 − Q1 |

A **box-and-whisker plot** displays five values: minimum, Q1, median, Q3, maximum.

**Worked example — M19 Q4b:** Maximizer battery data (n = 9, odd): 478, 491, 497, 498, 502, 502, 502, 504, 509.
- Min = 478, Q1 = 497 (3rd value), Median = 502 (5th value), Q3 = 502 (7th value), Max = 509.

Note that Q1 = Q3 = Median = 502 is unusual — the IQR = 0 for the middle 50%. This is a valid result; do not assume an error.

**Mark scheme note (M19 Q4b):** Each of the five values must be marked by a separate vertical line on the plot. "DO NOT ACCEPT the median when indicated by multiple vertical lines" — the median must be a single line. For an incomplete plot (missing one element), the mark scheme awards only marks for what is correctly shown and does not award the completion mark.

---

### Comparing Distributions

When comparing two distributions using box plots, always reference a specific statistic (median, IQR, range, quartiles) and relate it to context. Never just say "higher average" — write "higher median."

**Worked example — M19 Q4c:** Comparing GeneriCell and Maximizer battery lifetimes.

| Claim | Statistic to cite | What to write |
|---|---|---|
| GeneriCell is better | Higher upper quartile (UQ) | "25% of GeneriCell batteries last above 506 min, vs 25% of Maximizer above 502 min" |
| Maximizer is better | Higher median / smaller IQR | "Maximizer has a higher median (502 vs 500), meaning half of Maximizer batteries last longer" |

**Mark scheme notes (M19 Q4c):**
- DO NOT ACCEPT "bigger Inter Quartile Range" as a reason in favour of either brand — IQR measures spread, not performance level.
- DO NOT ACCEPT "higher average" — must explicitly say "median."
- Each reason must be supported by a numerical value from the box plots.

---

### Scatter Graphs and Correlation

A scatter graph plots two variables as (x, y) points. Correlation describes the relationship:

| Type | Description | Line of best fit |
|---|---|---|
| Positive correlation | As x increases, y increases | Slopes upward |
| Negative correlation | As x increases, y decreases | Slopes downward |
| No correlation | No clear pattern | No line appropriate |

Strong correlation means points cluster closely around the line; weak correlation means points are more spread. The line of best fit (trend line) should pass through the mean point (x̄, ȳ) and have roughly equal numbers of points on each side.

**Mark scheme notes:** Stating "there is a correlation" without specifying direction earns partial credit at best. Always state positive/negative AND strong/weak where the question asks you to "describe" the correlation.

---

## 2. Past Questions

| Session | Q | Marks | Topic | Question summary | Key mark scheme note |
|---|---|---|---|---|---|
| N17 | 3a | 2 | Tree diagram | Write down missing probabilities in tree diagram (balls, without replacement) | Both pairs of second-level branches required; fractions must sum to 1 on each pair |
| N17 | 3b | 2 | Probability | P(both even) — winning 5 AUD | Must show product 3/7 × 2/6; answer = 1/7 OE |
| N17 | 3c | 2 | Combined probability | P(total even) — winning 10 AUD | Must add both even-sum paths: even+even and odd+odd |
| N17 | 3d | 1 | Median | Show that median = 5 implies b = 7 | Must write (3 + b)/2 = 5 explicitly — AG question |
| N17 | 3e | 6 | Mean and range | Find a and c given range = 34 and mean = 2.7 (simultaneous equations) | Both equations required; 2 marks for answers only |
| M19 | 3a | 2 | Venn diagram | Complete Venn (60 students, Extended maths & Physics) | A only = 13, outside = 26 |
| M19 | 3b | 1 | Set notation in context | Describe A ∩ B in context | Written description required; symbol alone earns 0 |
| M19 | 3c | 2 | Probability | P(student in A ∩ B) | Must write as fraction or decimal; ratio form (9:60) earns only 1 mark |
| M19 | 3d | 3 | Combined probability | P(3 students all in A ∩ B) — with or without replacement | Both methods accepted; must show three probabilities multiplied |
| M19 | 3e | 2 | Comment | Comment on practicality of random selection | Must state "not practical" AND give reason linked to low probability |
| M19 | 4a | 1 | Box plot reading | Percentage of batteries between two values | Answer: 50% (interquartile range covers 50%) |
| M19 | 4b | 3 | Draw box plot | Draw box-and-whisker for Maximizer data | Five correct vertical lines required; median must be a single line |
| M19 | 4c | 2 | Comparing box plots | One reason for GeneriCell, one for Maximizer | Must cite specific statistic (UQ, median, IQR) with value |
| N23 | 5a | 2 | Set notation | Write missing probability notation and description from tree diagram | P(G' ∩ C) and full written description of P(G' ∩ C') |
| N23 | 5b | 1 | Tree diagram | Fill missing values: 0.85, 0.1, 0.94 | All three correct for the mark |
| N23 | 5c | 2 | Multiplication rule | P(G ∩ C) = P(G) × P(C\|G) | 0.15 × 0.9 = 0.135; both steps required |
| N23 | 5d | 3 | Combined probability | P(C) using both branches of tree | Must add both paths: 0.135 + 0.051 = 0.186 |
| N23 | 5e | 2 | Expected value | Estimate number with red hair in population of 15 500 | Multiply probability by 15 500; round to whole number |
| N23 | 5f | 1 | Sample size | Which study (1500 vs 800) is more reliable? | Study A; reason = larger sample, more reliable |
| N23 | 5g | 1 | Venn diagram | Missing value in Venn (G = 700, C = 20, outside = 10) | Answer: 70 (G ∩ C) |
| N23 | 5h | 3 | Proportion | Find N in "1 in N people have red hair" | 90/800 → N = 8.89 → round up to 9 |
| N23 | 6a | 1 | Modal class | Write down modal class from grouped frequency table | 30 < A ≤ 40; must be full inequality |
| N23 | 6b | 4 | Mean from grouped data | Calculate estimated mean from grouped frequency table | Mid-values × frequencies, sum, divide by 331 |

---

## 3. Mark Scheme Insights

### What the mark scheme rewards

- **Full working for probability products:** Writing the multiplication (e.g., 3/7 × 2/6) before the answer earns a method mark even if the final answer is wrong. Answers without working receive at most 2 out of 3 marks on multi-step probability questions.
- **Fractions in lowest terms or exact equivalents:** 1/7, 6/42, 0.1429, and 14% are all accepted as equivalent. Any correct simplified or unsimplified fraction, decimal, or percentage is fine as long as it is accurate.
- **Both paths on a tree diagram:** For P(A ∪ B) or "total is even," both contributing paths must be shown and added. A mark is awarded for identifying the second path separately.
- **Context in written descriptions:** For Criterion C questions (describe region, comment on practicality), the answer must use the context of the question — names of subjects, conditions of the experiment — not abstract set language.
- **Specific statistics when comparing distributions:** Name the statistic (median, UQ, IQR) and give its value from the plot.
- **Mid-interval values for grouped mean:** Showing the mid-values (5, 15, 25, 35, 45, 55) explicitly earns the first method mark even if a product calculation later goes wrong.
- **Correct inequality notation for modal class:** Write the full inequality (30 < A ≤ 40), not just the midpoint or a single boundary.

### What the mark scheme penalises / does not accept

- **Ratio notation for probability:** Writing 9:60 instead of 9/60 loses a mark (M19 Q3c).
- **"1.5/10" or similar non-simplified improper forms** are explicitly rejected (M19 Q3c).
- **"Higher average" without specifying median:** The mark scheme requires the word "median" explicitly — "average" alone is rejected (M19 Q4c).
- **"Bigger IQR" as a performance claim:** IQR measures spread only; it cannot justify that one brand is "better" (M19 Q4c).
- **Not simplifying fractions when the question says simplest form:** Leaving 6/42 unreduced when the question asks for simplest form loses the simplification mark.
- **Show-that questions without explicit calculation:** For "show that b = 7" (N17 Q3d), writing only "(3+7)/2 = 5" is accepted, but writing only "b = 7" earns zero.
- **Confusing with/without replacement:** If balls are drawn without replacement, the second-level denominator must decrease by 1 and the numerator must reflect the changed count. Using the first-level probabilities again is a common and penalised error.
- **Incomplete Venn diagrams:** All four regions must be filled. The mark scheme checks that the total adds to the given population — an error in one region cascades into subsequent probability questions.
- **"Not practical" without reason:** In M19 Q3e, stating "not practical" alone earns 1 mark; the reason (probability is very small, unlikely to select eligible students) earns the second mark and cannot be awarded without a stated result from the earlier parts.

---

## 4. Common Mistakes

| Mistake | Correction |
|---|---|
| Using P(first ball) for both draws in a without-replacement problem | After drawing one ball, reduce denominator by 1 and numerator (if same type drawn) by 1 — e.g., 3/7 then 2/6, not 3/7 then 3/7 |
| Forgetting to add the second path for P(total even) or P(A ∪ B) | Identify all mutually exclusive paths that lead to the event, then sum their products |
| Writing a probability as a ratio (9:60) instead of a fraction | Write 9/60 or 3/20 or 0.15; ratio form loses the mark |
| Saying "higher average" when comparing box plots | Write "higher median" and give the numerical value |
| Using a midpoint instead of mid-interval value for grouped mean | Mid-interval = (lower bound + upper bound)/2 for each class; e.g., for 0 < A ≤ 10, use 5 not 0 or 10 |
| Writing only the modal class midpoint or a single boundary | Write the full inequality, e.g., 30 < A ≤ 40 |
| In a "show that" question, stating the answer only | Write the equation or calculation that leads to the answer; the answer is given (AG) and earns nothing on its own |
| Confusing A ∩ B (and) with A ∪ B (or) | ∩ = intersection = both; ∪ = union = at least one |
| Describing A ∩ B using set language only ("elements in both circles") | Translate into the context: "students who study both Extended maths and Physics" |
| Leaving a probability answer as an improper or unsimplified fraction when instructed otherwise | Always check whether the question specifies "simplest form" — reduce the fraction before writing the answer |

---

## 5. Revision Priorities

1. Practise tree diagrams for both with-replacement and without-replacement scenarios — draw them fully, label every branch, and multiply along paths before adding paths. This is the most frequently examined probability skill across N17, N23, and M19.
2. Memorise the four Venn diagram regions and practise completing them from a given total and three partial counts — an error in one value loses marks on every probability question that follows.
3. Know the set notation symbols (∩, ∪, ') and practise translating them into plain-language descriptions and back. Two marks in M19 Q3b went to students who could do this; zero went to those who wrote only the symbol.
4. For grouped data: write out mid-interval values explicitly, then multiply by frequency. The mark scheme awards a separate mark for correct mid-values — do not skip this step.
5. When comparing box plots, build a habit of writing: "Brand X has a [higher/lower] [median/IQR/UQ] of [value], compared to [value] for Brand Y, therefore..." — this form earns both the identification and the comparison marks.
6. For expected-value questions, always round to a whole number and show the multiplication (probability × population). The rounding step is credited separately.
7. Practise "show that" probability questions — these are AG (answer given), so marks come entirely from the method. Writing (3 + b)/2 = 5 → 3 + b = 10 → b = 7 earns 1 mark; writing "b = 7" alone earns 0.
