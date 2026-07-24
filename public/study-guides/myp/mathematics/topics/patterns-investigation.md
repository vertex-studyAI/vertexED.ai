# Criterion B — Patterns Investigation

---

## 1. Key Concepts

### Prediction

Prediction means extending a table of values by continuing the observed pattern — both recursively (adding to the previous term) and, later, by substituting into your general rule. In the structured investigation question, predicting two or more correct values beyond the given table is the entry point for all further marks. If you fail to predict correctly, the mark scheme treats subsequent work with those values as "their values" and may still award marks, but you lose the baseline.

In M22 Q8b, the table for number of triangles T gave stages 1–4 as 1, 5, 9, 13. Predicting stages 5 and 6 required recognising the constant first difference of +4, giving T₅ = 17 and T₆ = 21 (1 mark). In N23 Q7b, the perimeter sequence 4, 12, 20, 28 had a constant difference of +8, so P₅ = 36 and P₆ = 44 (1 mark). In M25 Q8b, the cube sequence C: 5, 9, 13, 17 extended to C₅ = 21 and C₆ = 25 (1 mark).

> **Do NOT** present predictions inside your general rule substitution as if they are predictions — the mark scheme requires the values to appear in the table or response box before you use them for verification.

---

### Description

Description asks you to state patterns in words — what changes and by how much. Two accepted patterns are almost always required. Accepted patterns fall into two categories: recursive (what is added each time) and structural (what type of sequence it is).

For a **linear sequence** (constant first difference), accepted descriptions include: "increases by 4", "adds 4", "common difference 4", "arithmetic with difference 4", "second difference is zero". For a **quadratic sequence** (constant second difference), accepted descriptions include: "second difference is 8", "second difference is 2", "the increases go up by 8 each time", "quadratic", or a recursive rule such as Aₙ = Aₙ₋₁ + 8n.

In M22 Q8c (triangles, 2 marks), two patterns were required for T: the mark scheme accepted "T goes up by 4" AND "they are odd numbers" — the second difference being zero was also accepted as a second pattern. In N23 Q7c (perimeter squares, 2 marks), two patterns were required for P: "increasing by 8" and "second difference is zero" were both accepted. In M25 Q8c (cubes, 2 marks), accepted patterns for C were "increases by 4", "adds 4", "common difference 4", and "second difference is zero".

> **Do NOT** write the general rule as your description. Writing "P = 8n − 4" when asked to describe in words scores zero for that strand. Do NOT write vague descriptions like "arithmetic", "linear", "increasing by a constant", or "constant difference" — these are rejected because they omit the specific value.

---

### Notation

Notation is a separate strand scored alongside description. It rewards correct algebraic notation in your general rule and correct mathematical terminology in your pattern descriptions. Getting both right earns full marks on this strand; errors in either cost marks.

**Notation rules that are strictly enforced:**
- Use `n` for the stage variable — NOT `x`. Writing `P = 8x − 4` is penalised in the notation strand (though the rule itself may still score for description).
- Use `^` for powers correctly: write `n²` or `n^2`, NOT `n2` without the exponent marker.
- Do NOT use `*` for multiplication, `/` for division in the rule, or `×` for power.
- Subscripts are acceptable: `Pₙ = 8n − 4` or `Aₙ = 4n² − 4n + 5` are both accepted.
- Non-simplified rules score lower: `T = 4n − 3` scores higher than `T = n + (n−1) × 3` even though both are correct.

In M22 Q8d (2 marks for general rule T), the mark scheme required `T = 4n − 3` as the simplified notation form. In N23 Q7d (2 marks for general rule P), `P = 8n − 4` or `P = 4(2n − 1)` were both accepted as correct simplified forms. In M25 Q8d (2 marks for C), `C = 4n + 1` was required; using `x` instead of `n` lost the notation mark but retained the description mark.

> **Do NOT say** "the nth term is four times n minus three" — word descriptions are explicitly rejected for the notation strand. The rule must appear in algebraic form using an equals sign.

---

### Testing

Testing means substituting a value of n **from inside or equal to the given table** (n ≤ 4 in most papers) into your general rule and confirming the output matches the known value. Testing proves the rule fits the data you already have. It is a lower bar than verification.

The mark scheme for testing awards 1 mark for a valid attempt (correct substitution) and 2 marks for correctly computing the result AND recognising it matches the table value. In N23 Q7g (area investigation), testing required substituting n ≤ 4 into A = (2n−1)² + 4 and confirming the result against the given values (e.g., n = 3: A = 5² + 4 = 29 ✓). In M25 Q8g (V investigation), testing with n ≤ 4 into V = n² + 4n + 1 scored the same way.

> **Do NOT** use a value of n ≥ 5 for testing — that is verification. If you test with n = 6 only, you receive no testing mark and only verification marks.

---

### Verifying

Verification means substituting a value of n that is **strictly outside the original table** — n ≥ 5 in almost every paper — into your general rule, computing the output, and then confirming it equals the value you predicted by continuing the pattern. Both steps must be shown: the substitution result AND the cross-reference to the predicted value.

In M22 Q8e (3 marks), verification of T = 4n − 3 required: (1) substitute n ≥ 5, e.g. n = 7 → 4(7) − 3 = 25; (2) compute 25; (3) confirm "25 is the same as obtained by adding 4 to 21" (i.e., matching the predicted extension of the table). All three marks required all three steps. In N23 Q7e (3 marks), verification of P = 8n − 4 required the same three-step structure: substitute n ≥ 5, compute, confirm against predicted table value. In M25 Q8e (3 marks), verifying C = 4n + 1 at n = 5 gave C = 21, which had to be matched against the predicted table entry.

> **Do NOT** say "I tested my rule and it works" without showing the specific n ≥ 5 value used, the computed output, and the comparison to the predicted table value. The mark scheme explicitly requires all three components for 3 marks. Do NOT use n = 4 for verification — it lies inside the original data.

---

### Justifying

Justification requires deriving or explaining **why** the general rule is correct — algebraically, geometrically, or by argument from first principles. Additional examples are only accepted at the lowest justification level (J1 weak). From J2 upward, the mark scheme requires reasoning that connects the structure of the pattern to the formula.

For **geometric justification**, the mark scheme rewards recognising the geometric structure and expressing it algebraically. In M22 Q8g, the perimeter P = 3 × 2^(n−1) was justified by arguing: the side length L doubles each time (L = 2^(n−1)) and P = 3L, so P = 3 × 2^(n−1). In N23 Q7g, justifying A = (2n−1)² + 4 required recognising that the big square has side length (2n−1) — derived by dividing P = 8n−4 by 4 to get the side — and then adding the 4 corner unit squares. In M25 Q8g, justifying V = n² + 4n + 1 required recognising that n² cubes (a square layer) are added to the cross-arm base C = 4n + 1, giving V = n² + (4n + 1) = n² + 4n + 1.

For **algebraic justification**, the mark scheme accepts finding all coefficients of a quadratic rule by any valid algebraic method (e.g., simultaneous equations using known values to determine a, b, c in an² + bn + c).

> **Do NOT** justify by listing more examples and saying "it always works" — this scores J1 at best. Do NOT accept that "second difference is 2 so it's quadratic" counts as a justification unless you then derive the specific coefficients.

---

### Communication

Communication is a holistic strand (3 marks in most papers) that rewards how well the entire investigation is organised and clearly presented. It is marked on the following basis: 1 mark for showing at least three of the five processes (describe, write rule, test, verify, justify); 2 marks for showing at least four processes AND correctly labelling at least one of them (e.g., explicitly writing "Test:" before a test, "Verify:" before verification); 3 marks for all five processes present with correct general rule, correctly labelled, and at least J2 justification achieved.

The key communication requirement is that test and verify must be clearly distinguished by label and by the n-value used (n ≤ 4 for test, n ≥ 5 for verify). In M22 Q8g and N23 Q7g the mark scheme states: "For test: they say 'test' and use n ≤ 4 only. For verify: they say 'verify' and use n ≥ 5 only." If a student says "test and verify" together and uses both n ≤ 4 and n ≥ 5, the mark scheme counts this as only ONE identified process for communication purposes.

> **Do NOT** run test and verify together without labelling them separately. **Do NOT** omit labels — a correct calculation with no label ("test", "verify", "justify") may not earn the coherence component of the communication mark.

---

## 2. Past Questions (flat scannable table)

| Session | Q | Sub | Marks | Criterion | Topic | What it asks | General rule found |
|---------|---|-----|-------|-----------|-------|--------------|-------------------|
| M22 | 8 | a | 1 | B | Triangles pattern | Describe how stage 2 has 5 triangles | — |
| M22 | 8 | b | 1 | B | Triangles pattern | Predict T for stages 5 and 6 | T₅=17, T₆=21 |
| M22 | 8 | c | 2 | C | Triangles pattern | Describe two patterns for T in words | — |
| M22 | 8 | d | 2 | B | Triangles pattern | Write general rule for T in terms of n | T = 4n − 3 |
| M22 | 8 | e | 3 | B | Triangles pattern | Verify general rule for T (n ≥ 5) | — |
| M22 | 8 | f | 1 | B | Triangles / perimeter | Show perimeter at stage 4 = 24 | — |
| M22 | 8 | g | 13 | B/C/D | Triangles / perimeter | Full investigation: P and L vs n (geometric) | L = 2^(n−1); P = 3 × 2^(n−1) |
| N23 | 7 | a | 1 | B/C | Squares / perimeter | Show perimeter at stage 4 = 28 | — |
| N23 | 7 | b | 1 | B | Squares / perimeter | Predict P for stages 5 and 6 | P₅=36, P₆=44 |
| N23 | 7 | c | 2 | B/C | Squares / perimeter | Describe two patterns for P in words | — |
| N23 | 7 | d | 2 | B/C | Squares / perimeter | Write general rule for P in terms of n | P = 8n − 4 |
| N23 | 7 | e | 3 | B/C | Squares / perimeter | Verify general rule for P (n ≥ 5) | — |
| N23 | 7 | f | 1 | B/C | Squares / area | Show area at stage 4 = 53 cm² | — |
| N23 | 7 | g | 20 | B/C | Squares / area | Full investigation: A vs n (quadratic) | A = (2n−1)² + 4 = 4n² − 4n + 5 |
| M25 | 8 | a | 1 | B/C | 3D cubes (cross) | Draw stage 5 of cube pattern | — |
| M25 | 8 | b | 1 | B | 3D cubes (cross) | Predict C for stages 5 and 6 | C₅=21, C₆=25 |
| M25 | 8 | c | 2 | B/C | 3D cubes (cross) | Describe two patterns for C in words | — |
| M25 | 8 | d | 2 | B/C | 3D cubes (cross) | Write general rule for C in terms of n | C = 4n + 1 |
| M25 | 8 | e | 3 | B/C | 3D cubes (cross) | Verify general rule for C (n ≥ 5) | — |
| M25 | 8 | f | 1 | B | 3D cubes (vertical) | Find C for stage 3 (confirm) | — |
| M25 | 8 | g | 20 | B/C | 3D cubes (V, quadratic) | Full investigation: V vs n | V = n² + 4n + 1 = (n+2)² − 3 |

---

## 3. Mark Scheme Insights

### What the mark scheme rewards

**Prediction:** Any correctly extended table value. Additional incorrect predictions are ignored if at least two are correct (M25 Q8b mark scheme states "ACCEPT additional incorrect predictions").

**Description:** Specific, complete descriptions only — the difference value must appear. "Increases by 4" scores; "increases by a constant" does not. Multiple descriptions can all be listed; the mark scheme takes the best two. Accepted structural terminology: "arithmetic", "linear" (only if the difference value is also given); "second difference is zero/2/8" (value must be stated); "quadratic" (for non-constant first differences). A recursive rule written in correct notation (Aₙ = Aₙ₋₁ + 8n) is treated as one accepted description.

**General rule:** The rule must be in terms of n only, use an equals sign, and be in simplest algebraic form. Both a partially correct rule and the simplified correct form are marked: 1 mark for the unsimplified correct structure, 1 mark for the simplified correct notation. A rule in words receives zero for notation.

**Testing:** 1 mark for a valid substitution attempt (n ≤ 4). 2 marks for correct computation AND explicit acknowledgement that it matches the table.

**Verification:** 3-mark structure — substitute n ≥ 5, compute, confirm matches predicted table value. All three steps must be visible. A special mark of 1 is given if the student correctly tests (n ≤ 4) when they intended to verify — so a student who accidentally tests rather than verifies still retrieves 1 mark.

**Justification (J2 and above):** Must show the geometric or algebraic origin of the formula. For geometric justification, identifying the variable side length in terms of n and connecting it to the formula scores J3/J4. For algebraic justification, finding all three coefficients of a quadratic rule using a systematic method (e.g., simultaneous equations) scores J2.

**Communication:** Labels matter. Writing "Test:" and "Verify:" separately, using n ≤ 4 for test and n ≥ 5 for verify, and having all five processes present earns 3 marks on this strand.

### What the mark scheme penalises / does not accept

- A word description ("four times n minus three") for the general rule — zero for the notation strand.
- Using `x` instead of `n` in the rule — penalised under notation (though description mark may still be awarded).
- Using `*` for multiplication, `/` for division, or `n2` without a proper exponent in the rule — notation mark lost.
- "Arithmetic", "linear", "increasing by a constant", "constant difference" without the specific value — rejected as incomplete descriptions.
- Justifying by listing more examples — rejected above J1.
- Testing with n ≥ 5 — counts as verification, not testing, so the test strand scores zero.
- Verifying with n ≤ 4 — counts as testing, not verification; 1 SC mark may be awarded but the verification strand is incomplete.
- Running "test and verify" together under one label — counts as only ONE communication process for the coherence component.
- Writing the general rule as a pattern description — explicitly rejected ("DO NOT ACCEPT the rule in words", M22/N23/M25 mark schemes all).

---

## 4. Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Writing "P = 8n − 4" when asked to describe in words | State the pattern in words: "P increases by 8 each time" — save the formula for the general rule question |
| Writing "T = 4n − 3" using x instead of n: "T = 4x − 3" | Always use n as the stage variable; using x loses the notation mark |
| Verifying with n = 4 (inside the original table) | Use n ≥ 5 for verification; n ≤ 4 values are for testing only |
| Testing with n = 7 instead of n ≤ 4 | Testing must use values from within the original data range (n ≤ 4) |
| Saying "I tested with n = 5 and n = 7" without labelling which is test and which is verify | Label explicitly: "Test (n = 3):" then "Verify (n = 7):" — otherwise it counts as one process, not two |
| Justifying by writing three more rows of the table and saying "my rule gives the right answer" | Provide a geometric or algebraic derivation of the rule — more examples only score J1 (weak) |
| Writing "second difference" without giving the value | Must say "second difference is 8" or "second difference is 2" — the value is required |
| Writing the general rule in words for the notation strand | Rule must be algebraic: A = 4n² − 4n + 5, not "four n squared minus four n plus five" |
| Combining test and verify under one label "Test and verify:" using n = 3 and n = 6 | Label them separately; the mark scheme counts "test and verify" together as ONE process for communication |
| Verifying that the rule works without confirming the calculated value equals the predicted table value | Must explicitly state: "n = 7 gives 25, which matches the predicted value of 25 obtained by adding 4 to 21" |
| Using a geometric rule (L = 2^(n−1)) but failing to connect it to P = 3L for the justification | State P = 3L explicitly and show the substitution: P = 3 × 2^(n−1) |
| Describing "odd numbers" for a linear sequence and stopping there | Give a second pattern — e.g., "increases by 4" — since two patterns are almost always required |

---

## 5. Revision Priorities

1. Know the seven rubric strands by name and what each one requires: **Prediction** (extend the table), **Description** (words only, specific value), **Notation** (algebraic rule, correct n, no word descriptions), **Testing** (n ≤ 4, matches known value), **Verifying** (n ≥ 5, matches predicted value), **Justifying** (derive the rule geometrically or algebraically), **Communication** (label every process, five items visible).

2. Practise writing a general rule for all three pattern types that appear: **linear** (S = an + b, e.g. T = 4n − 3 from M22 and C = 4n + 1 from M25), **quadratic** (S = an² + bn + c, e.g. A = 4n² − 4n + 5 from N23 and V = n² + 4n + 1 from M25), and **geometric/exponential** (e.g. L = 2^(n−1), P = 3 × 2^(n−1) from M22).

3. Memorise the n-value rule: **test with n ≤ 4** (inside the table), **verify with n ≥ 5** (outside the table). This is the single most commonly tested distinction in the mark scheme.

4. For verification: always show all three steps — (1) substitute n ≥ 5, (2) compute the result, (3) confirm it matches the predicted value obtained by continuing the pattern. Stating only steps 1 and 2 gives 2 marks out of 3.

5. For justification: aim for geometric argument — identify what structural feature of the shape (side length, layer count, added squares) produces the algebraic rule. Simply substituting more values gives J1 (1 mark) regardless of how many values you try.

6. Structure your response using explicit section headers — write "Predict:", "Describe:", "General rule:", "Test:", "Verify:", "Justify:" — so the examiner can find every process. Missing a label can cost the communication coherence marks even if the mathematics is correct.

7. Review the accepted and rejected notation list before the exam: `n` not `x`; proper exponent notation for `n²`; equals sign in every rule; no asterisks, slashes used as division, or `×` used for power.
