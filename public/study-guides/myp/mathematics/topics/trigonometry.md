# Trigonometry

---

## 1. Key Concepts

### SOH-CAH-TOA (Right-Angled Triangles)

In any right-angled triangle, the three trigonometric ratios connect an acute angle to two of the three sides. The mnemonic SOH-CAH-TOA captures all three: sin θ = Opposite/Hypotenuse, cos θ = Adjacent/Hypotenuse, tan θ = Opposite/Adjacent. The hypotenuse is always the side opposite the right angle and is always the longest side. "Opposite" and "adjacent" are relative to the angle you are working with — they swap when you switch to the other acute angle.

The correct sequence when finding a side is: (1) label the triangle relative to the known angle, (2) identify which two sides are involved (known and unknown), (3) select the ratio that connects those two sides, (4) substitute and solve. When finding an angle, use the inverse function (sin⁻¹, cos⁻¹, tan⁻¹).

**Worked example — N24 Q4e (3 marks, "Find"):**

The diagram shows trapezium BCFD with BC = 4, BD = 6, and FD = 12. The point E lies on BD such that CE is horizontal and FE is vertical. The question asks for angle FCE.

- Step 1: FE = FD − ED = 12 − 4 = 8 (the mark scheme awards •¹ for this step: correctly subtracting 4 from FD = 12)
- Step 2: tan(FCE) = FE/CE = 8/6 (•² for correct substitution into the trig ratio)
- Step 3: angle FCE = tan⁻¹(8/6) = 53.13° (•³ for the correct value)

Mark scheme: tan(FCE) = their FE / their 6. Also accepts sin(FCE) = FE/hypotenuse if the hypotenuse is correctly calculated. The answer is 53.13° (accept 53.1°).

> Do NOT write "tan = 8/6" without specifying the angle — say "tan(FCE) = 8/6." Do NOT round intermediate values (e.g., FE = 8 is exact here, but in other problems keep full decimal precision until the final answer).

---

### Exact Values

For certain standard angles the trigonometric ratios produce exact (surd or fraction) values. These arise in proofs, "show that" questions, and any question where a rounded decimal would give an incorrect final answer.

| Angle | sin | cos | tan |
|-------|-----|-----|-----|
| 0° | 0 | 1 | 0 |
| 30° | 1/2 | √3/2 | 1/√3 = √3/3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |
| 90° | 1 | 0 | undefined |

**Where they appear in MYP papers:** M22 Q2a uses cos 30 = √3/2 (or sin 60) to find AF = 5√3 ≈ 8.66. The mark scheme accepts √75 and 5√3 as final answers (exact form), but rejects 8.67 (over-rounded) and 8.6 (under-rounded). This is one of the few places where leaving the answer in surd form is explicitly accepted.

M22 Q5c uses sin 60 = √3/2 to find the distance AC: the method is sin 60 = (AC/2)/100, giving AC = 200 sin 60 = 100√3 ≈ 173 m. The mark scheme accepts 87 for the half-distance and 173 for the full distance.

> Do NOT use a decimal approximation for sin 30, cos 60, etc., when the question explicitly asks you to "show that" — use the exact fraction. Do NOT write "sin 30 ≈ 0.5" in a show-that proof; write "sin 30 = 1/2."

---

### Sine Rule and Cosine Rule

The sine rule and cosine rule extend trigonometry to non-right-angled triangles.

**Sine rule:** a/sin A = b/sin B = c/sin C (use when you know an angle–side pair and one other piece)

**Cosine rule (finding a side):** a² = b² + c² − 2bc cos A (use when you know two sides and the included angle, or to find BH in M22 Q5b)

**Cosine rule (finding an angle):** cos A = (b² + c² − a²) / (2bc)

**Worked example — M22 Q5b (3 marks, "Calculate"):**

The yacht race problem establishes (via Q5a) that angle HAB = 90°. With HA = 100 m and AB = 250 m, find BH.

- AM1 (Pythagoras, since the angle is 90°): BH² = 100² + 250² = 72 500, so BH = 269 m (to nearest metre).
- AM2 (cosine rule): BH² = 100² + 250² − 2(100)(250) cos 90°. Since cos 90° = 0, the third term vanishes and the result is identical.

The mark scheme awards •¹ for correct substitution, •² for the unrounded value 269.258…, and •³ for correctly rounding to 269 m. "Their 269" is carried forward if a candidate used an incorrect angle in Q5a — the mark scheme explicitly notes to accept the cosine rule even when Pythagoras suffices, provided the substitution is correct.

**Worked example — M22 Q5c (5 marks, "Find") — sine rule applied:**

After establishing that C and D are reflections of A and B in the vertical line through H, the question requires the distance AC. Triangle AHC has AH = HC = 100 m. The angle AHC = 120° (since bearing HA→A is 060°, reflected to 300°, giving an interior angle of 360° − 300° − (360° − 060°) … the key result is angle AHC = 120°).

Using the cosine rule: AC² = 100² + 100² − 2(100)(100) cos 120° = 20 000 − 20 000(−0.5) = 30 000, so AC = √30 000 = 100√3 ≈ 173 m.

Alternatively, the sine rule: AC/sin 120° = 100/sin 30°, giving AC = 100 × sin 120°/sin 30° = 100 × (√3/2)/(1/2) = 100√3.

The full race route H→B→A→C→D→H = 269 + 250 + 173 + 250 + 269 = 1211 m (the mark scheme accepts 1212 due to rounding of 269.258).

> Do NOT use the sine rule when you already know there is a right angle — Pythagoras is faster and carries fewer rounding errors. DO use the cosine rule when you know two sides and an included angle, or all three sides (to find an angle). The mark scheme for M22 Q5b explicitly accepts both methods and awards the same marks.

---

### Bearings Problems

Bearings are measured clockwise from North and always written as three digits (e.g., 060°, not 60°). When two bearings are given in sequence (as in M22 Q5), the angle between the two travel directions is NOT the same as the bearing values — you must sketch the North lines at each point and use alternate angles, co-interior angles, or angle-on-a-straight-line rules to find the interior triangle angles.

**Worked example — M22 Q5a (2 marks, "Show that"):**

The course goes from H on bearing 060° to A, then from A on bearing 150° to B. Show that angle HAB = 90°.

Method using co-interior (same-side interior) angles:
- The North direction at H has bearing 060° to A, so angle between North-at-H and HA = 60°.
- The North direction at A (parallel to North at H) makes angle NAH (measured from North to AH going back towards H) = 180° − 60° = 120° (co-interior angles, North lines parallel).
- The bearing from A to B is 150°, so angle NAB = 150°.
- Angle HAB = angle NAB − angle NAH = 150° − 120° = 30°... 

Wait — the mark scheme shows the intended result is 90°. The accepted method is: angle between the back-bearing of HA at A and AB = 180° − 60° = 120° for the supplementary bearing; then 360° − 120° − 150° = 90°. Alternatively: co-interior angle gives angle (North-at-A to AH direction, measured on the same side as the journey) = 60°; the bearing from A to B = 150°; angle HAB = 150° − 60° = 90°.

The mark scheme awards •¹ for correctly determining an intermediate angle (e.g., 120°, or 30°, or 60° — any one valid step) and •² for correctly applying it to reach 90°. Several routes are accepted; the mark scheme lists six distinct methods.

> Do NOT assume the bearing angle equals the interior triangle angle. Always draw a fresh North arrow at each point and work out interior angles step by step. Do NOT accept "150 − 60 = 90" without showing which angles are being subtracted and why — the mark scheme explicitly rejects this as insufficient reasoning.

---

### Angles of Elevation and Depression

The angle of elevation is the angle measured upward from the horizontal to a line of sight. The angle of depression is measured downward from the horizontal. Both angles are always measured from the horizontal, never from the vertical. The horizontal line of sight and the vertical height form a right angle, so SOH-CAH-TOA applies directly.

Standard setup: if you stand at ground level and look up at the top of a tower of height h at horizontal distance d, then tan(elevation angle) = h/d. Conversely, from the top of the tower looking down at the base of an adjacent object, tan(depression angle) = vertical drop/horizontal distance.

In MYP papers these appear in Criterion D contexts (real-life: ramps, towers, slopes). The method is always: (1) draw and label the right-angled triangle, (2) identify the horizontal and vertical components, (3) apply SOH-CAH-TOA or Pythagoras as appropriate.

> Do NOT confuse the angle of elevation (from horizontal upward) with the angle from the vertical (the complement). If a problem states "angle of elevation = 40°," the angle inside the triangle at the observer's position is 40°, not 50°.

---

### 3D Trigonometry

Three-dimensional trigonometry problems require finding a right-angled triangle within a 3D shape (cuboid, pyramid, etc.) and applying SOH-CAH-TOA or Pythagoras in two stages. The typical MYP approach is:

1. Use Pythagoras in a horizontal cross-section to find a diagonal or base distance.
2. Use that result as a side in a vertical triangle to find the required angle or height.

No direct 3D trig question appeared in M19, M22, or N24, but M19 Q7 (car park design) uses multi-step geometry in 2D in exactly this way — finding a turning radius using a trigonometric arc, then combining results. The M22 Q2 triangle-within-triangle problem (AFC similar to AED) is a 2D analogue of the same reasoning: find one length (AF via Pythagoras or trig), then use the similarity ratio to find another (AE). The principle extends directly to 3D: always look for the right-angled triangle hidden inside the shape.

> In 3D problems, do NOT try to apply SOH-CAH-TOA directly to a 3D edge — you must always reduce it to a 2D right-angled triangle first. Label your intermediate triangle clearly (e.g., "triangle ACG where G is directly below C") before applying any formula.

---

### When to Use Which Rule

| Situation | Rule to use |
|-----------|-------------|
| Right-angled triangle — find a side | SOH-CAH-TOA |
| Right-angled triangle — find an angle | Inverse SOH-CAH-TOA (sin⁻¹, cos⁻¹, tan⁻¹) |
| Right-angled triangle — find hypotenuse or a leg | Pythagoras (faster, no rounding error) |
| Non-right triangle — know angle + opposite side + one more side | Sine rule |
| Non-right triangle — know two sides + included angle | Cosine rule (side version) |
| Non-right triangle — know all three sides | Cosine rule (angle version) |
| Bearings — angles between compass directions | Draw North lines; use angle properties; then above rules |
| Exact answer required (surd or fraction) | Use exact values table above |

**Key MYP exam signals:**
- "Right angle at B" or angle = 90° → Pythagoras or SOH-CAH-TOA
- "Bearing … from … to …" + distances → sketch first, find interior angles, then sine/cosine rule
- "Show that angle = 90°" in bearings → use North-line angle relationships, not trigonometry
- Two sides + included angle → cosine rule (not sine rule)

---

## 2. Past Questions (flat scannable table)

| Session | Q | Marks | Topic | Question summary | Key mark scheme note |
|---------|---|-------|-------|-----------------|---------------------|
| M19 | 2a | 3 | SOH-CAH-TOA / Pythagoras | Triangle ABC (AB = 28, AC = 35, right angle at B): find BC | BC = 21; accept trig as AM2; DO NOT accept √441 as final answer |
| M22 | 2a | 2 | Pythagoras / trig | Triangle AFC (AD = DC = DF = FC = 5): find AF | AF = 8.66 (5√3); accept 8.7, 9, √75; DO NOT accept 8.67 or 8.6 |
| M22 | 2b | 2 | Similar triangles | Show AFC similar to AED | AA or SAS — must name both angles / sides with correct reasoning |
| M22 | 2c | 3 | Trig / similarity | Hence find AE | AE = 4.33 (√75/2); three methods accepted (ratio, Pythagoras, trig) |
| M22 | 5a | 2 | Bearings | Show angle HAB = 90° (bearings 060° and 150°) | Six accepted methods; DO NOT accept bare "150 − 60 = 90" |
| M22 | 5b | 3 | Pythagoras / cosine rule | Find BH (HA = 100, AB = 250, angle 90°) | BH = 269 m; both Pythagoras and cosine rule accepted |
| M22 | 5c | 5 | Sine rule / cosine rule | Find total yacht race distance (reflection adds C, D) | AC = 173 m via cosine or sine rule; total = 1211 m |
| N24 | 4a | 2 | Pythagoras | Show BC = 4 (AC = 9, AB = 8) | Show-that: must show both substitution AND unrounded value 4.12... |
| N24 | 4e | 3 | SOH-CAH-TOA | Find angle FCE in trapezium (FE = 8, CE = 6) | tan(FCE) = 8/6; angle = 53.13°; •¹ for FE = 12 − 4 = 8 |

---

## 3. Mark Scheme Insights

### What the mark scheme rewards

- **Correct intermediate steps shown explicitly.** In "show that" questions (M22 Q5a, N24 Q4a), every bullet point must be visible. Writing only the final answer earns 0 marks, even if correct.
- **Correct identification of the right-angled triangle.** In N24 Q4e, the first mark goes to correctly deriving FE = 8 (via FD − 4 = 12 − 4), not to the trigonometry itself.
- **Follow-through (ecf) on earlier answers.** If a candidate uses an incorrect BC from Q4a in Q4e, they can still earn full marks on Q4e provided the trig is applied correctly to their values.
- **Multiple methods explicitly accepted.** M22 Q2a accepts Pythagoras or trig (three AMs); M19 Q2a accepts Pythagoras (AM1) or trigonometry (AM2); M22 Q5b accepts Pythagoras or cosine rule. Choose whichever you are most confident in.
- **Exact surd answers accepted where appropriate.** M22 Q2a: √75, 5√3, and 8.66 are all accepted; the mark scheme is explicit that 8.67 (over-rounded) is NOT accepted.
- **Degree of rounding stated.** When a question says "to the nearest metre" or "to the nearest unit," the final rounded value must appear. Not rounding loses the final mark.

### What the mark scheme penalises / does not accept

- **√441 or √(expression) left unsimplified as a final answer** — M19 Q2a explicitly states "DO NOT ACCEPT √441 for final answer."
- **Angles used without showing how they were derived** in bearings "show that" questions — M22 Q5a: "DO NOT ACCEPT 150 − 60 = 90" because the reasoning for the subtraction is not justified.
- **Using trig instead of Pythagoras in a show-that that requires a right angle** — M22 Q5a: "DO NOT ACCEPT calculating BH assuming HAB = 90 and then finding angles using trig."
- **Over-rounding at intermediate steps** — M22 Q2a rejects 8.67 (three significant figures is not sufficient precision for this value; 8.66 is required as it rounds correctly to 8.7 with an extra digit).
- **Writing the ratio without the angle label** — e.g., "tan = 8/6" rather than "tan(FCE) = 8/6" may cost a mark in formal questions.
- **Degrees vs. radians error** — all MYP standard questions use degrees. The calculator must be in degree mode. An answer of 0.927 (radians equivalent of 53.13°) earns 0 marks.

---

## 4. Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Using sin where tan is needed (e.g., sin(FCE) = 8/6 when CE is the adjacent, not the hypotenuse) | Identify all three sides first; use SOH-CAH-TOA mnemonic to pick the correct ratio |
| Rounding intermediate values (e.g., using BC = 4 instead of 4.123 in later parts) | Keep full decimal precision in working; only round at the final answer |
| Calculator left in radian mode | Always check: sin 30° should give 0.5, not −0.988 |
| In bearings problems, subtracting bearing angles directly without working out interior angles | Always draw North lines at each point; derive the interior angle of the triangle step by step |
| Treating "angle of depression" as measured from the vertical | Angle of depression is from the horizontal downward; the right angle is at the horizontal |
| Applying SOH-CAH-TOA to a non-right-angled triangle | Check for a right angle first; if none, use sine rule or cosine rule |
| Using the sine rule when two sides and the included angle are known | Two sides + included angle → cosine rule, not sine rule |
| Leaving √441 or √(exact perfect square) unsimplified as a final answer | Always evaluate the square root: √441 = 21 |
| In "show that" questions, writing only the final answer | Show every working step — each bullet point in the MS must be visible |
| Writing bearing angles without three digits (e.g., 60° instead of 060°) | Always use three-digit notation for bearings |

---

## 5. Revision Priorities

1. Practise labelling triangles (hypotenuse, opposite, adjacent) relative to a given angle before choosing any ratio — this single step prevents most SOH-CAH-TOA errors.
2. Memorise the exact values table (sin/cos/tan for 0°, 30°, 45°, 60°, 90°) — they appear in M22 Q2 and Q5 and are needed for any "show that" or surd-form answer.
3. Work through the M22 Q5 bearings question from scratch: drawing North arrows at H and A, deriving the interior angle, then applying Pythagoras and the cosine/sine rule. This is the most complex trigonometry question in the available sessions.
4. Practise the three-step flow for non-right-angled triangles: (a) decide whether you have angle + opposite/side pair (sine rule) or two sides + included angle (cosine rule); (b) substitute carefully; (c) round only at the end.
5. For every "show that" or "verify" question involving trig, write the substitution step and the unrounded intermediate value explicitly — the mark scheme requires both.
6. Check calculator mode before every exam: confirm sin 30° = 0.5 (degrees) not −0.988 (radians).
7. Review 3D problems by identifying the hidden 2D right-angled triangle — practise on cuboid and pyramid diagrams, working in two stages (horizontal base triangle first, then the vertical triangle using the result).
