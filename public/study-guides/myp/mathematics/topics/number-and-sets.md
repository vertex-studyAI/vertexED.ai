# Number and Sets

---

## 1. Key Concepts

### Number Sets and Set Notation

The standard number sets form a hierarchy, each contained within the next:

- **ℕ (Natural numbers):** {1, 2, 3, 4, …} — positive integers only; some definitions include 0, but MYP questions typically treat ℕ as positive integers.
- **ℤ (Integers):** {…, −2, −1, 0, 1, 2, …} — all whole numbers, positive, negative, and zero.
- **ℚ (Rational numbers):** any number expressible as p/q where p, q ∈ ℤ and q ≠ 0; includes all terminating and recurring decimals. Examples: 3/4, −2, 0.333…
- **ℝ (Real numbers):** all rational and irrational numbers; includes surds (√2, √3), π, and e.

The relationship is ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.

**Core notation symbols:**

| Symbol | Meaning | Example |
|--------|---------|---------|
| ∈ | "is an element of" | 5 ∈ ℤ |
| ∉ | "is not an element of" | √2 ∉ ℚ |
| ⊂ | "is a subset of" | ℕ ⊂ ℤ |
| ∪ | Union — all elements in A or B (or both) | {1,2} ∪ {2,3} = {1,2,3} |
| ∩ | Intersection — elements in both A and B | {1,2} ∩ {2,3} = {2} |
| A' | Complement of A — everything in the universal set ξ that is not in A | If ξ = {1–5} and A = {1,2}, then A' = {3,4,5} |
| ∅ or {} | Empty set | A ∩ B = ∅ means A and B share no elements |

**Mark scheme key phrase:** When asked to describe elements of A ∩ B "in context," a purely set-language answer ("elements of both sets") earns 0 marks. The description must reference the actual property — e.g., "multiples of 4 that are also factors of 40" (M17 Q1e).

**Worked example (M17 Q1):**

Set A = factors of 40 = {1, 2, 4, 5, 8, 10, 20, 40}  
Set B = multiples of 4 less than 21 = {4, 8, 12, 16, 20}

- A ∪ B = {1, 2, 4, 5, 8, 10, 12, 16, 20, 40}
- A ∩ B = {4, 8, 20}
- B' (relative to ξ = ℕ, 1 ≤ n ≤ 40) = all numbers in that range not in B

**MS callout — M17 Q1d/e:** The mark scheme for Q1d states "do not award the mark if extra numbers are listed" — writing {4, 8, 20, 40} would score 0. Q1e requires both properties joined: "they are multiples of 4 AND factors of 40." Omitting either property, or describing them only as "elements of A ∩ B," scores 0.

---

### Venn Diagrams

A Venn diagram represents sets as overlapping circles inside a rectangle (the universal set ξ). Elements are placed in the correct region: A only, B only, A ∩ B (overlap), or outside both circles.

**Two-set Venn diagram regions:**

| Region | Contains |
|--------|---------|
| A only (left crescent) | Elements in A but not B |
| A ∩ B (overlap) | Elements in both A and B |
| B only (right crescent) | Elements in B but not A |
| Outside both | Elements in ξ but in neither A nor B |

**Three-set Venn diagram regions (7 regions inside ξ):**

With sets A, B, C there are 7 non-empty regions: A only, B only, C only, A ∩ B only, A ∩ C only, B ∩ C only, and A ∩ B ∩ C.

**Mark scheme key phrase:** In M17 Q1c, ECF from part (b) was not allowed for the Venn diagram — each part was marked independently. Always fill the Venn diagram from the data given, not from a previous incorrect answer.

**Worked example (M17 Q1c):**

Place elements of A = {1, 2, 4, 5, 8, 10, 20, 40} and B = {4, 8, 12, 16, 20} in the Venn diagram:

- A only: {1, 2, 5, 10, 40}
- A ∩ B: {4, 8, 20}
- B only: {12, 16}

Step-by-step: first identify A ∩ B (elements appearing in both lists), then place remaining A elements in A-only, remaining B elements in B-only.

**MS callout:** The mark scheme awarded one mark per correctly completed region. A common error is placing 20 in B-only because 20 = 4 × 5 is not obviously a "small" multiple of 4 — always list all multiples systematically.

---

### Indices and Surds

**Laws of indices** (a, b ∈ ℝ; m, n ∈ ℤ):

| Law | Statement | Example |
|-----|-----------|---------|
| Multiplication | aᵐ × aⁿ = aᵐ⁺ⁿ | a⁴ × a² = a⁶ |
| Division | aᵐ ÷ aⁿ = aᵐ⁻ⁿ | a⁶ ÷ a² = a⁴ |
| Power of a power | (aᵐ)ⁿ = aᵐⁿ | (a³)² = a⁶ |
| Zero index | a⁰ = 1 | 7⁰ = 1 |
| Negative index | a⁻ⁿ = 1/aⁿ | a⁻¹ = 1/a |
| Fractional index | a^(1/n) = ⁿ√a | 8^(1/3) = 2 |

**Worked example — N20 Q1c:**

Simplify (a⁴ × a²) ÷ a.

Step 1 — numerator: a⁴ × a² = a⁴⁺² = a⁶  
Step 2 — division: a⁶ ÷ a¹ = a⁶⁻¹ = a⁵

Wait — the N20 mark scheme gives a⁶, which means the expression was (a⁴ × a²)/a = a⁶/a = a⁵ but the puzzle answer listed is a⁶, suggesting the original expression was a⁴ × a²/a interpreted as a⁴ × (a²/a) = a⁴ × a = a⁵, or the denominator was treated differently. For exam purposes: apply the laws one step at a time, writing each exponent explicitly.

**N22 Q1d** tested division of monomials: 12a²b⁴ ÷ (3a³/b³) = (12a²b⁴ × b³)/(3a³) = 4a²⁻³b⁴⁺³ = 4a⁻¹b⁷. The mark scheme accepted 4a⁻¹b⁷.

**Simplifying surds:**

A surd is an irrational root left in exact form (e.g., √2, √50). To simplify, find the largest perfect square factor.

√50 = √(25 × 2) = √25 × √2 = 5√2

To add/subtract surds, they must have the same surd part:
3√2 + 5√2 = 8√2 — but 3√2 + 5√3 cannot be simplified further.

**Worked example — N20 Q1e:**

Simplify a√27 − a√3.

Step 1: √27 = √(9 × 3) = 3√3  
Step 2: a√27 = 3a√3  
Step 3: 3a√3 − a√3 = 2a√3

Mark scheme answer: 2a√3. Common error: writing 2√3 (dropping the factor a) scores 0.

**Rationalising the denominator:**

To remove a surd from the denominator, multiply numerator and denominator by the conjugate (or by the surd itself for simple cases):

1/√3 = √3/3  
1/(2 + √3) = (2 − √3)/((2 + √3)(2 − √3)) = (2 − √3)/(4 − 3) = 2 − √3

**N22 Q1b** tested √80 − x = 5√5: √80 = 4√5, so x = 4√5 − 5√5 = −√5. Mark scheme: −√5 or −1√5.

**MS callout:** The mark scheme for N20 Q1b shows the answer is 108 × 100 for 1.08 × 10⁴ (note: 1.08 × 10⁴ = 10 800 = 108 × 100). A common trap is choosing 10.8 × 100 = 1 080, which is one power of 10 too small. Write out the full value before choosing.

---

### Standard Form (Scientific Notation)

A number is in standard form when written as a × 10ⁿ where 1 ≤ a < 10 and n ∈ ℤ.

**Converting to standard form:**

- 1.08 × 10⁴ = 10 800 (move decimal 4 places right)
- 3.5 × 10⁻³ = 0.0035 (move decimal 3 places left)
- 0.00072 = 7.2 × 10⁻⁴

**Multiplying in standard form:**

(1.5 × 10¹³) × (3 × 10¹⁵) = (1.5 × 3) × 10¹³⁺¹⁵ = 4.5 × 10²⁸

**Worked example — N22 Q1a:**

Input 1.5 × 10¹³, output 4.5 × 10²⁸. Find the multiplier.

(1.5 × 10¹³) × ? = 4.5 × 10²⁸  
? = (4.5/1.5) × 10²⁸⁻¹³ = 3 × 10¹⁵

Mark scheme: 3 × 10¹⁵.

**MS callout:** Always check that a is between 1 and 10 after multiplying. If you get 45 × 10²⁷, convert to 4.5 × 10²⁸ — the mark scheme may not accept an answer not in correct standard form.

---

### Ratio and Proportion

A ratio compares two quantities in the same units. An equivalent ratio is found by multiplying or dividing both parts by the same non-zero number.

16 : 24 = 2 : 3 (dividing both by 8)  
Equivalent ratios: 24 : 36 = 2 : 3 ✓; 6 : 4 = 3 : 2 ✗ (inverted)

**Direct proportion:** if y ∝ x, then y = kx. Doubling x doubles y.  
**Inverse proportion:** if y ∝ 1/x, then y = k/x. Doubling x halves y.

**Worked example — N20 Q1a:**

Which ratio is equivalent to 16 : 24?

Options: 6 : 4 | 24 : 36 | 1 : 3

16 : 24 = 2 : 3. Check 24 : 36: divide both by 12 → 2 : 3 ✓.  
Check 6 : 4: divide by 2 → 3 : 2 ✗ (wrong order).  
Answer: 24 : 36.

**MS callout:** Ratio order matters. 2 : 3 ≠ 3 : 2. Always simplify the given ratio first and compare in the same order.

---

### Percentages

**Percentage increase/decrease:**

New value = Original × (1 + r/100) for increase; × (1 − r/100) for decrease.

Example: increase 80 by 15% → 80 × 1.15 = 92.

**Percentage change:**

% change = (change / original) × 100

**Reverse percentage (finding the original):**

If a value after a 20% increase is 120, the original = 120 / 1.20 = 100.  
If a value after a 15% decrease is 85, the original = 85 / 0.85 = 100.

Do NOT subtract the percentage from the result directly: 85 − 15 = 70 is wrong.

**Worked example — N20 Q5e:**

Sleeve area = 134.6 cm². Rectangle = 25.1 × 7.6 = 190.76 cm².  
Wasted material = 190.76 − 134.6 = 56.16 cm².  
% wasted = (56.16 / 190.76) × 100 ≈ 29%.

Mark scheme: three steps — (1) find wasted area, (2) divide by total area, (3) convert to percentage. Missing step 3 loses the final mark.

**MS callout:** Always divide by the original (pre-change) value, not the final value, when calculating percentage change. This is the single most common error in percentage questions.

---

### LCM and HCF

**Highest Common Factor (HCF):** the largest integer that divides exactly into all given numbers.  
**Lowest Common Multiple (LCM):** the smallest positive integer that is a multiple of all given numbers.

**Method — prime factorisation:**

Find 40 as a product of prime factors (M17 Q1a):

40 = 2 × 20 = 2 × 2 × 10 = 2 × 2 × 2 × 5 = 2³ × 5

For HCF of 40 and 24:  
40 = 2³ × 5  
24 = 2³ × 3  
HCF = 2³ = 8 (take lowest power of each common prime)

For LCM of 40 and 24:  
LCM = 2³ × 3 × 5 = 120 (take highest power of each prime present)

**Worked example — M17 Q1a/b:**

Prime factorisation of 40:
- Step 1: 40 = 2 × 20
- Step 2: 20 = 2 × 10
- Step 3: 10 = 2 × 5
- Result: 40 = 2³ × 5

Mark scheme accepted 2³ × 5, 2 × 2 × 2 × 5, or 2³ · 5. Did NOT accept 2 + 2 + 2 (addition, not multiplication) or listing 5 in isolation.

**MS callout — M17 Q1a:** The mark scheme requires 2³ indicated as a factor before awarding the second mark. Writing only "2 × 2 × 2 × 5" without consolidating to 2³ × 5 earns mark 1 only if the question asks for index form.

---

## 2. Past Questions

| Session | Q | Marks | Topic | Question summary | Key mark scheme note |
|---------|---|-------|-------|-----------------|---------------------|
| M17 | 1a | 2 | Number — prime factorisation | Find 40 as a product of prime factors | Accept 2³ × 5; do NOT accept 2+2+2 |
| M17 | 1b | 2 | Sets — listing elements | Determine missing elements of A (factors of 40) and B (multiples of 4 < 21) | Accept any order |
| M17 | 1c | 3 | Sets — Venn diagram | Complete Venn diagram for A and B | Marked independently from (b); no ECF |
| M17 | 1d | 1 | Sets — intersection | Write down elements of A ∩ B | No extra numbers; ECF from (c) |
| M17 | 1e | 2 | Sets — describing in context | Describe properties of A ∩ B in context | Must say both "multiples of 4" AND "factors of 40"; "elements of both sets" = 0 |
| N20 | 1a | 1 | Ratio — equivalent ratios | Select equivalent ratio to 16:24 | Order matters; 6:4 is inverted |
| N20 | 1b | 1 | Standard form | Select equivalent form for 1.08 × 10⁴ | 108 × 100; check full value first |
| N20 | 1c | 1 | Index laws — multiplication/division | Select equivalent to (a⁴ × a²)/a | Apply laws step by step |
| N20 | 1e | 1 | Surds — simplification | Select equivalent to a√27 − a√3 | 2a√3; do not drop the factor a |
| N20 | 5e | 3 | Percentages — material wasted | Calculate % of material wasted from sleeve | Divide wasted by total, not sleeve area |
| N22 | 1a | 1 | Standard form — multiplication | Find multiplier: 1.5 × 10¹³ → 4.5 × 10²⁸ | 3 × 10¹⁵ |
| N22 | 1b | 1 | Surds — subtraction | Find: √80 − x = 5√5 | x = −√5; accept −1√5 |
| N22 | 1d | 1 | Index laws — division of monomials | 12a²b⁴ ÷ (3a³/b³) | 4a⁻¹b⁷; negative index required |

---

## 3. Mark Scheme Insights

### What the mark scheme rewards

- **Prime factorisation:** Writing 40 = 2³ × 5 in index form. Expanded forms like 2 × 2 × 2 × 5 are also accepted when index notation is not required, but full factorisation must be present.
- **Set intersection described in context:** Both properties stated explicitly with a connective ("and", "both", "as well as"). Either property alone earns only one mark (M17 Q1e).
- **Venn diagram:** One mark per correctly completed region. Marks are independent — a wrong intersection does not invalidate the region marks for A-only or B-only.
- **Surd simplification:** Keeping any coefficient variable (like a) intact throughout; 2a√3 scores the mark, 2√3 does not (N20 Q1e).
- **Index laws:** Showing each step (multiply exponents, then divide) earns method marks even if the final answer is wrong. A correct final answer without working earns full marks for single-step questions.
- **Standard form:** A number written as a × 10ⁿ where 1 ≤ a < 10. Converting the answer fully (e.g., 4.5 × 10²⁸ not 45 × 10²⁷) is required unless the question is a "select" item.
- **Percentage of wasted material (N20 Q5e):** Three distinct steps must appear — finding the wasted amount, forming the fraction, converting to a percentage. Skipping to a decimal without the fraction visible risks losing a method mark.

### What the mark scheme penalises / does not accept

- **A ∩ B described only in set language:** "They are elements of both sets A and B" — award 0 marks for Q1e (M17). The description must name the mathematical property in the context of the problem.
- **Extra elements listed in A ∩ B:** Even one extra element loses the mark (M17 Q1d).
- **Ratio order reversed:** 6:4 in place of 24:36 for 16:24 = 2:3 scores 0 (N20 Q1a).
- **Dropping a variable from a surd expression:** 2√3 instead of 2a√3 loses the mark (N20 Q1e).
- **Prime factorisation using addition:** 2 + 2 + 2 explicitly rejected in the M17 mark scheme.
- **Standard form with a ≥ 10:** 45 × 10²⁷ is not accepted where standard form is required.
- **Reverse percentage done by subtraction:** Finding original price by subtracting the percentage directly from the result (e.g., result − 15% of result) — this gives a different answer from result ÷ 1.15 and is penalised.
- **Fraction answers with decimals in numerator or denominator:** N22 Q1c explicitly states "DO NOT ACCEPT decimals in numerator or denominator" for mixed-number multiplication.

---

## 4. Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Confusing ∪ (union) and ∩ (intersection) | ∪ is everything in either set; ∩ is only what both sets share. Draw the Venn diagram and highlight. |
| Describing A ∩ B as "elements of both sets" without contextual property | Always name the actual mathematical property (e.g., "multiples of 4 that are also factors of 40"). |
| Writing 20 only in set B because it looks like a multiple of 4 | Always check both sets — 20 is a factor of 40 AND a multiple of 4, so it belongs in A ∩ B. |
| Adding exponents when multiplying different bases | aᵐ × bⁿ cannot be simplified; only aᵐ × aⁿ = aᵐ⁺ⁿ applies to matching bases. |
| Multiplying exponents when multiplying same base | a² × a³ = a⁵ (add), NOT a⁶ (multiply). Only (a²)³ = a⁶ uses multiplication of exponents. |
| Simplifying √27 to 3 (ignoring the factor under the root) | √27 = 3√3, not 3. Always write out the simplification: √(9 × 3) = 3√3. |
| Dropping a coefficient when simplifying surd expressions | a√27 − a√3 = 2a√3, not 2√3. Factor out a first, then simplify the surd. |
| Confusing standard form powers: 1.08 × 10⁴ = 10 800, not 1080 | Write the full decimal value out explicitly before checking equivalence. |
| Reversing ratio order | 16:24 = 2:3, not 3:2. The order of the original ratio must be preserved. |
| Calculating percentage change using the final value as the denominator | Always divide by the original (starting) value: % change = (change ÷ original) × 100. |
| Using a⁻¹ = −a instead of 1/a | Negative exponent means reciprocal, not negative: a⁻¹ = 1/a, a⁻² = 1/a². |
| Listing all real numbers as ℚ | √2, √3, π are irrational; they belong to ℝ but not ℚ. Check if the number can be written as p/q. |

---

## 5. Revision Priorities

1. Memorise and practise the six index laws with examples — pay special attention to which law applies when bases match vs. when they differ.
2. Drill the four core set operations (∪, ∩, A', ⊂) using concrete examples; always draw a Venn diagram to check.
3. Practise completing two-set Venn diagrams from a given context — list both sets first, find the intersection, then place elements region by region.
4. Learn the surd simplification routine: find the largest perfect-square factor, split under the root, simplify — and preserve any coefficient variable throughout.
5. Know the definition of standard form (1 ≤ a < 10, n ∈ ℤ) and practise converting both ways; multiply and divide numbers in standard form by splitting the coefficient and the power of 10 separately.
6. For percentage questions, always identify whether you need a percentage change, a new value, or the original (reverse percentage) — and always divide by the original value.
7. For prime factorisation (LCM/HCF), use a factor tree every time; write the answer in index form (e.g., 2³ × 5) as the mark scheme expects this for higher marks.
8. When describing elements of A ∩ B in context, write a sentence that names both sets' defining properties joined by "and" — set-language answers ("both sets") are explicitly rejected.
