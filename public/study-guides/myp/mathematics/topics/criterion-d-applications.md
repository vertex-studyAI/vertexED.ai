# Criterion D — Applying Mathematics in Real-Life Contexts

---

## 1. Key Concepts

### How Criterion D Differs from Criterion A

Criterion A tests whether you can execute mathematical procedures correctly in an abstract or semi-abstract setting. Criterion D tests whether you can use those same procedures to make sense of a real situation, reach a decision, and explain why that decision is justified.

The practical difference is visible in the command terms. Criterion A questions say "solve", "calculate", or "find" — they want a numerical answer. Criterion D questions say "analyse", "deduce", or "justify" — they want a reasoned conclusion supported by numbers. A full-marks Criterion D response always ends with a statement about the real-world situation, not just a number.

Three elements appear in every Criterion D extended task that do not appear in Criterion A:

- **Context interpretation** — you must explain what the number means in the real situation (e.g. "the Fisherface method has a maximum success rate of 96% at n = 8 observations").
- **Comparison or decision** — you must use your calculations to choose between options, accept or reject a claim, or recommend a course of action.
- **Justification of accuracy** — you must comment on the limitations, assumptions, or rounding involved in your model.

**Mark scheme key phrase:** "Justify your choice" or "comment on the accuracy of your results" always signals Criterion D marks that pure calculation cannot earn.

---

### The 10-Mark Extended Analysis Task

The largest Criterion D task in each paper is a 10-mark "analyse" question. It consistently tests four strands, each worth roughly 2 marks:

| Strand | What it requires |
|--------|-----------------|
| **Factors (F)** | Name the specific variables or elements relevant to the comparison — not general terms like "statistics" or "the data" |
| **Calculations (C)** | Carry out correct numerical work: intersection points, conversions, comparisons of means/medians/ranges |
| **Decision / Comment (H or D)** | State a clear conclusion about the real-world claim or choose between options with reference to specific values |
| **Justify / Accuracy (J)** | Comment on why results may not be fully accurate — sample size, rounding, model limitations, data source |

Each strand is marked independently. You can earn Calculation marks even with a wrong answer if your method is correct. You cannot earn Justification marks without first earning at least one Calculation mark.

**Worked example — N22 Q7e (10 marks, "Analyse the three machine learning methods"):**

The question asks you to choose the best face-recognition method (Eigenface E, Fisherface F, LBPH L) and support your choice. A full response would look like:

> **Factors:** The factor affecting success rate is the number of face observations (n). I will also consider the y-intercept (starting success rate) and the maximum success rate.
>
> **Calculation:** To find where F and L intersect, set −1.5(n − 8)² + 96 = −(n − 8)² + 86:
> 0.5n² − 8n + 22 = 0 → n ≈ 3.53
> So for n < 3.53, LBPH has a higher success rate; for n > 3.53, Fisherface is better.
>
> **Decision:** I recommend the Fisherface method. Its maximum success rate is 96% at n = 8, compared to 86% for LBPH and approximately 70% for Eigenface. When sufficient observations are available (n ≥ 4), Fisherface outperforms both alternatives.
>
> **Accuracy:** The result n ≈ 3.53 was rounded to n = 4 for a practical decision. The models are mathematical approximations and the actual success rates may differ. The Eigenface model extends linearly beyond its domain, which may be unrealistic.

**Mark scheme note (N22 Q7e):** The mark scheme accepts "Fisherface is better than LBPH in the long run" as Good Justification, but only if a specific comparison of at least two methods is shown. "LBPH has higher success rate for small n while Fisherface is better for n = 8" is an example of a Good Justification award. DO NOT just name a method as best without giving comparative numerical evidence — this earns only Weak Justification (1 mark).

---

### How to Structure a Recommendation Answer

Every recommendation answer follows the same three-part structure, regardless of the real-world context:

**Part 1 — State the decision clearly.**
Name the option you are choosing before you justify it. Do not save your conclusion for the end. Example: "I recommend Printer A" or "The headline is partially correct."

**Part 2 — Support with specific numbers.**
Quote the exact values from your calculations. Use named statistics (mean, median, IQR, range) rather than generic phrases ("it is better"). The mark scheme consistently rejects phrasing like "it is higher" without naming the statistic.

**Part 3 — Acknowledge limitations.**
Identify at least one reason why your conclusion might be incomplete. Accepted reasons include: unequal sample sizes, data from only one year, model is an approximation, rounding introduced error, or the graph does not show which average was used.

**Worked example — M24 Q7d (10 marks, "Analyse life expectancy data and comment on the headline"):**

Headline: "THE LIFE EXPECTANCY ON THE TROPIC OF CAPRICORN IS HIGHER THAN THE LIFE EXPECTANCY ON THE TROPIC OF CANCER"

> **Factors:** I will compare mean, median, IQR, range, and the trend over time from the scatter graph.
>
> **Calculations:** Capricorn mean = 69.9, Cancer mean = 71.1. Capricorn median = 71, Cancer median = 70. Capricorn IQR = 18, Cancer IQR = 9. From the graph, Capricorn had higher life expectancy until approximately 1980–2000, after which Cancer's values increased more steeply and the two lines converged.
>
> **Comment on headline:** The headline was accurate up to around 1990, when Capricorn's life expectancy was consistently higher. However, in 2021 Cancer's mean (71.1) is slightly above Capricorn's (69.9), making the headline currently incorrect. The trend suggests Cancer is continuing to rise faster.
>
> **Accuracy:** Capricorn has only 11 countries while Cancer has 17, so the averages do not represent equal numbers of countries. The data is from 2021 only; a single year may not represent a long-term pattern. The graph in Image 1 does not indicate which average (mean or median) is plotted, so comparisons with it are approximate.

**Mark scheme note (M24 Q7d):** DO NOT use the terms "measures of central tendency" or "measures of dispersion" as substitutes for naming the specific statistics. "Cancer has a lower IQR of 9 compared to Capricorn's 18" earns a mark; "Cancer has a smaller measure of dispersion" does NOT.

---

### Real-Life Contexts That Recur

Four categories of real-world setting appear repeatedly across Criterion D questions. Each requires the same underlying structure (factors → calculations → decision → accuracy) but uses different mathematical tools.

**Financial and rate modelling** uses simultaneous equations, proportional reasoning, and unit conversion. In M24 Q6, metric time was converted to Gregorian time, simultaneous equations were solved to find numbers of lesson types, and rates (milligrams per minute) were derived from density and time. The key error students make here is computing the number without writing the unit, causing automatic loss of marks on "show that" sub-parts.

**Design tasks** use geometry, volume, and Pythagoras. In N22 Q4, a 3-D storage unit had to fit through a ceiling-height constraint. The sequence was: identify the constraint (ceiling = 230 cm), apply the formula (h = √(230² − x²)), calculate the maximum height, select the unit with the largest volume that fits. The decision ("select storage unit with height 220") had to be explicitly stated, not implied.

**Scientific measurement contexts** use density, area, trigonometry, and function models. In N25 Q6, Archimedes' Principle was used to determine whether a gold crown was pure. The final step (Q6g) required a "deduce" answer — comparing the calculated density to 90% of the known gold density and stating a conclusion. In N25 Q7, pigeon flight times were compared to internet upload times to determine the fastest delivery method for each file size and distance combination.

**Statistical analysis with data commentary** uses box-and-whisker plots, scatter graphs, mean, median, IQR, and range. In N22 Q6 (3-D printing), students compared two printers using their statistical properties. In M24 Q7 and N25 Q7, students compared two groups using the full suite of statistics and commented on a claim. In all these questions, the mark scheme distinguishes between Weak Justification (one correct comment) and Good Justification (comparative comment on at least two methods, citing specific values).

**Mark scheme key phrase across all contexts:** "WTTE" (Words To That Effect) appears frequently, meaning the mark scheme accepts paraphrases — but only if the mathematical substance is correct. "Fisherface has the highest peak" is acceptable; "Fisherface is the best" without any numerical support is not.

---

### What "Analyse" Means in the Rubric vs "Calculate"

"Calculate" means produce a numerical answer, showing the method. The mark scheme checks: correct formula, correct substitution, correct result.

"Analyse" means use numerical results to reach and explain a judgment. The mark scheme checks: relevant factors named, calculations carried out, conclusion stated about the real-world situation, and limitations acknowledged.

In practice, an "analyse" question always contains embedded "calculate" steps — you cannot analyse without numbers. But calculating alone earns at most half the marks on an "analyse" question. The remaining marks require the interpretation layer.

The rubric rewards the interpretation layer through its Justification strand. Weak Justification (J1) is a correct comment on one method or one aspect of the data. Good Justification (J2) is a comparison across two or more options using specific values.

**Worked example — N22 Q6e and Q6f (comparison of Printer A and Printer B, 1 mark each):**

Q6e asks for one reason why Printer A might be better. The mark scheme accepts: "Printer A has a smaller IQR" or "Printer A has a smaller range" or "Printer A is more consistent." It does NOT accept comments about skewness or just about the maximum value.

Q6f asks for one reason why Printer B might be better. The mark scheme accepts: "Printer B has a lower median" or "Printer B has a smaller average." It does NOT accept comments about only the minimum value.

These 1-mark sub-parts are single-sentence interpretation questions. Each sentence needs: the name of the printer, the name of the statistic, and a comparative word (lower, smaller, less).

---

### How to Handle "Design" Tasks

A design task presents a real-world object with constraints and asks you to choose dimensions, quantities, or configurations. The structure is:

**Step 1 — Show the constraint.** Write the inequality or equation that the design must satisfy. Example (N22 Q4b): "The diagonal height of the unit when tilted must not exceed the ceiling of 230 cm. Using Pythagoras: √(50² + 225²) = 230.49 cm > 230 cm, so this unit does not fit."

**Step 2 — Show the calculation for each option.** Substitute the given values and calculate the outcome for each candidate. Example (N22 Q4d): h = √(230² − 50²) = 224.5 cm.

**Step 3 — Justify the choice.** State which option you select and why, using the numbers. Example (N22 Q4e–f): "I select the 220 cm unit because it is the tallest unit whose height (220 < 224.5) satisfies the constraint. Its volume is 50 × 50 × 220 = 550 000 cm³."

The mark scheme for design tasks awards one mark per correct calculation step, but the selection mark (Q4e) requires the explicit named choice, not just the largest calculated value. Writing the correct number without the decision statement loses that mark.

**Mark scheme note (N22 Q4b–f):** "Show that" sub-parts require showing Pythagoras, then comparing to 230 with an explicit inequality statement. Writing only "230.49 > 230" without the comparison or concluding statement — DO NOT ACCEPT unless both the decimal value and the comparison are present.

---

## 2. Past Questions

| Session | Q | Marks | Context | Command term | Key task | Criterion D strand |
|---------|---|-------|---------|--------------|----------|--------------------|
| N22 | 4a | 2 | Storage unit | Identify | Rotation transformation | Geometry in context |
| N22 | 4b | 3 | Storage unit | Show that | Pythagoras — does unit fit in room? | Constraint / design |
| N22 | 4c | 2 | Storage unit | Determine | Maximum h formula from constraint | Design calculation |
| N22 | 4d | 1 | Storage unit | Determine | Maximum h when x = 50 | Substitution |
| N22 | 4e | 1 | Storage unit | Select | Choose unit with maximum volume that fits | Decision |
| N22 | 4f | 2 | Storage unit | Determine | Volume of selected unit | Calculation |
| N22 | 6a | 1 | 3-D printing | Determine | Mass of phone case from density | Scientific context |
| N22 | 6b | 2 | 3-D printing | Determine | Cases per spool (proportional reasoning) | Rate calculation |
| N22 | 6c | 2 | 3-D printing | Show that | Mean print time = 19.9 min | Statistical verification |
| N22 | 6d | 3 | 3-D printing | Label | Box-and-whisker plot for Printer A | Data representation |
| N22 | 6e | 1 | 3-D printing | Identify | Why Printer A is better (dispersion) | Interpretation |
| N22 | 6f | 1 | 3-D printing | Identify | Why Printer B is better (central tendency) | Interpretation |
| N22 | 7a | 2 | Machine learning | Determine | Linear model parameters b, c | Model fitting |
| N22 | 7b | 2 | Machine learning | Show that | F passes through (2, 42) | Verification |
| N22 | 7c | 5 | Machine learning | Find | First n where Fisherface > Eigenface | Intersection |
| N22 | 7d | 4 | Machine learning | Find | Parameters a, h, k of LBPH model | Quadratic fitting |
| N22 | 7e | 10 | Machine learning | Analyse | Choose best method, justify with comparison | Full extended analysis |
| M24 | 5a | 1 | Basketball | Determine | Horizontal distance L | Symmetry / parabola |
| M24 | 5b | 2 | Basketball | Show that | a = −0.3 | Model fitting |
| M24 | 5c | 4 | Basketball | Find | Distance D where ball hits ground | Quadratic context |
| M24 | 6a | 2 | Metric time | Write down | Convert metric to Gregorian | Unit conversion |
| M24 | 6b | 2 | Metric time | Determine | Convert Gregorian to metric | Unit conversion |
| M24 | 6c | 4 | Metric time | Write down | Conversion table in standard form | Multi-step conversion |
| M24 | 6d | 2 | Metric time | Describe | Simultaneous equations in words | Context interpretation |
| M24 | 6e | 4 | Metric time | Find | S and D by solving simultaneous equations | Financial/timetable modelling |
| M24 | 6f | 1 | Chemistry rate | Show that | Rate = 2.987 mg/min | Unit conversion |
| M24 | 6g | 3 | Chemistry rate | Calculate | Maximum grams over a time interval | Rate application |
| M24 | 7d | 10 | Life expectancy | Analyse | Comment on headline using statistics and trend | Full extended analysis |
| N25 | 5c | 4 | Playground slide | Calculate | Horizontal length L from quadratic | Quadratic in context |
| N25 | 6a | 1 | Gold crown | Determine | Mass from density formula | Scientific measurement |
| N25 | 6c | 2 | Gold crown | Determine | Volume of both stems (cylinder) | Design geometry |
| N25 | 6d | 3 | Gold crown | Show that | Height of triangle h = 30 mm | Trigonometry in context |
| N25 | 6e | 3 | Gold crown | Calculate | Area of one leaf (composite shape) | Design geometry |
| N25 | 6f | 2 | Gold crown | Determine | Total volume of crown (table) | Multi-step calculation |
| N25 | 6g | 3 | Gold crown | Deduce | Is crown accepted? Compare density to 90% threshold | Decision / deduction |
| N25 | 7a | 2 | Pigeons vs internet | Show that | Upload time = 18 hours | Rate conversion |
| N25 | 7b | 5 | Pigeons vs internet | Show that | Mean flight time = 2 hours (grouped data) | Statistical verification |
| N25 | 7c | 2 | Pigeons vs internet | Show that | Pigeon arrives Monday 07:00 | Rate / time modelling |
| N25 | 7d | 10 | Pigeons vs internet | Analyse | Choose fastest option; find minimum file size for pigeons | Full extended analysis |

---

## 3. Mark Scheme Insights

### What the mark scheme rewards

- Naming the specific statistic when comparing data (median, IQR, range — not "the average" or "the spread").
- An explicit decision statement before or alongside calculations — not implied by numbers alone.
- Comparative phrasing that references at least two options: "Fisherface has a maximum of 96% while LBPH reaches only 86%."
- Sensible rounding with acknowledgement: writing "n ≈ 3.53, so from n = 4 onwards" counts as an accuracy comment.
- "Show that" answers that include every step: substitution, intermediate value, comparison, and the conclusion word ("therefore" / "so" / explicit ">").
- Units on every calculated quantity in a rate or measurement context. Loss of units on a "show that" sub-part is a common reason for losing mark 1 in Calculations.
- ECF (error carried forward): a wrong answer from a previous part can still earn marks in later parts if the method is correct.

### What the mark scheme penalises / does not accept

- "Measures of central tendency" or "measures of dispersion" as substitutes for named statistics — DO NOT ACCEPT in M24 Q7d.
- "It is better" or "it is higher" without naming the metric and giving a value.
- Commenting only on the maximum or minimum when asked about dispersion — DO NOT ACCEPT in N22 Q6e and Q6f.
- "My results are accurate" or "I used the right formula" as a justification of accuracy — DO NOT ACCEPT in M24 Q7d.
- "Show that" answers that quote only the answer given in the question without showing how it was reached.
- Conclusions that do not follow from the student's own calculations (e.g., recommending Fisherface after calculating that LBPH has a higher success rate for the relevant domain).
- Skewness comments as a reason to prefer one printer over another — DO NOT ACCEPT in N22 Q6e.
- Decimals in fractional answers when the mark scheme specifies exact fractions (N22 Q1c).

---

## 4. Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Calculating the intersection point but not using it to make a recommendation | Always follow a calculation with a sentence stating what it means for the decision |
| Writing "the data shows Printer A is better" without naming the statistic | Name the statistic and give the value: "Printer A has a smaller IQR (1.6 vs 2.8)" |
| Omitting units on rate calculations ("2.987 per minute") | Always write the full unit: "2.987 mg/min" — especially on "show that" sub-parts |
| Treating the comment on accuracy as optional | The Justify/Accuracy strand is always worth 2 marks; skip it and you cap at 8/10 |
| Selecting the correct unit (N22 Q4e) but not naming it explicitly | Write: "I select the storage unit with height 220 cm" — the number alone is insufficient |
| Commenting only on the trend graph without quoting specific years (M24 Q7d) | Cite approximate years: "Capricorn was higher until around 1990–2000" |
| Using "average" instead of "mean" or "median" in a comparison | The mark scheme requires the specific term; "average" is not accepted as a substitute for either |
| Comparing only one statistic in the extended analysis task | Compare at least three statistics across both groups to earn C3/C4 marks |
| Not acknowledging sample size difference when comparing groups | "Capricorn has 11 countries, Cancer has 17 — the comparison is not between equal sample sizes" earns a Justification mark |
| Calculating the minimum file size for pigeons (N25 Q7d) but not showing the working | The mark scheme requires working to be shown for this calculation |

---

## 5. Revision Priorities

1. Memorise the four strands of the extended analysis rubric (Factors, Calculations, Decision/Comment, Justify/Accuracy) and practise writing one paragraph for each in timed conditions.
2. Practise the design task sequence: write the constraint → calculate for each candidate → state the explicit decision. Use N22 Q4 as a template.
3. Build a one-page reference of accepted phrasings for each statistic: "smaller IQR" (not "less spread"), "lower median" (not "smaller average"), "more consistent" (not "better").
4. Practise writing accuracy/limitation comments for each of the four recurring context types (financial, design, scientific, statistical). At least two different reasons per context.
5. When doing "show that" questions, always write: (a) the formula, (b) the substitution, (c) an intermediate step, (d) the stated result equal to the given value. Missing any step loses marks even when the answer is correct.
6. For rate and unit conversion questions (M24 Q6, N25 Q7), write every unit at every step — loss of units on intermediate lines is the most common reason for losing mark 1 in calculation chains.
7. Practise N22 Q7e and M24 Q7d as full 10-mark timed responses. These are the most reliable predictors of the extended analysis format in future papers.
