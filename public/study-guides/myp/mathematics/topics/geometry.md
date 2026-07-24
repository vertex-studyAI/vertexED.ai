# Geometry

---

## 1. Key Concepts

### Circle Theorems

The three circle theorems tested at MYP Standard level are: (1) the angle in a semicircle is 90°, (2) a perpendicular from the centre to a chord bisects the chord, and (3) the radius to a tangent is perpendicular.

The angle-in-a-semicircle theorem states that if AB is a diameter, any point C on the circle satisfies angle ACB = 90°. The chord bisector theorem means that if OX is drawn perpendicular to chord PQ, then PX = XQ. The tangent-radius theorem means the angle between a radius and a tangent at the point of contact is exactly 90° — this is used in every tangent-line problem.

For angles in the same segment (used in M23 Q3a), two angles subtended by the same arc from the same side are equal. The mark scheme for M23 Q3a accepted "same segment as ADE" and "same segment as BCE" as sufficient reason.

**Worked example (M23 Q3a):** Points A, B, C, D lie on a circle. Chords AC and BD intersect at E. Angle BAE = 28°, angle AED = 82°, angle BCE = 70°. Find the remaining angles.

- Angle ABE = 28° (angles in the same segment as ADE — both subtend arc AD)
- Angle BEC = 82° (vertically opposite to AED)
- Angle ADE = 70° (angles in the same segment as BCE — both subtend arc BC)
- Check: 28° + 82° + 70° = 180° ✓

> **Mark scheme callout (M23 Q3a):** "Same segment" language is required. The mark scheme explicitly rejected "they share 3 angles", "corresponding angles", and "sides have ratio or factor of 4." Write angle names explicitly — e.g. "DAE = CBE (angles in same segment)" — not just "equal angles."

---

### Similar Triangles

Two triangles are similar if all corresponding angles are equal (AA condition). If all three sides are in the same ratio (SSS) or two sides in the same ratio with the included angle equal (SAS), they are also similar. At MYP, AA is the most frequently tested condition because angles are often given or deducible from circle theorems.

When triangles AED and BEC are similar (M23 Q3b), corresponding sides are in proportion. The scale factor k = ratio of any pair of corresponding sides. Areas scale by k². Perimeters scale by k.

Setting up the proportion correctly is critical. For similar triangles AED ~ BEC with sides AE = x − 1, ED = 1, BE, EC = x + 1, BC = x + 5:

**Worked example (M23 Q3c):** Use the similarity to show x = 3.

- Corresponding sides: ED/EC = AE/BE = AD/BC
- Take the pair with known expressions: 1/(x + 1) = (x − 1)/(x + 5)
- Cross multiply: (x + 5)(1) = (x − 1)(x + 1) = x² − 1
- Expand right side: x + 5 = x² − 1
- Rearrange: x² − x − 6 = 0
- Factorise: (x − 3)(x + 2) = 0, so x = 3 (rejecting x = −2 since lengths must be positive)

> **Mark scheme callout (M23 Q3c):** Four method marks. The mark scheme awarded a mark for correctly setting up the proportion, a mark for cross-multiplying, a mark for reaching x² − x − 6 = 0, and a mark for correct factorisation. Candidates who skipped any of the first three steps without showing work did not receive those marks.

---

### Pythagoras' Theorem

In a right-angled triangle with hypotenuse c: a² + b² = c². In 3D, apply Pythagoras twice — first to find a diagonal on one face, then use that diagonal as one leg of a second right triangle.

For "show that" questions (N24 Q4a, M16 Q4b), every step must be written out explicitly. Writing the final answer alone gains only partial credit.

**Worked example (N24 Q4a):** Triangle ABC has AC = 9, AB = 8, right angle at B. Show BC = 4 to the nearest unit.

- BC² = AC² − AB² = 9² − 8² = 81 − 64 = 17
- BC = √17 = 4.123…
- Rounded to nearest unit: BC = 4 ✓

**Worked example — 3D Pythagoras (N24 Q7e):** Circles of radius 40 cm packed in a triangular arrangement. Find the vertical distance between centres in adjacent rows.

- Two circle centres are 80 cm apart (touching circles).
- Horizontal offset = 40 cm (half of 80 cm).
- By Pythagoras: vertical distance² = 80² − 40² = 6400 − 1600 = 4800
- Vertical distance = √4800 = 69.28… cm

> **Mark scheme callout (N24 Q4a):** This is a "show that" question — the mark scheme required seeing BC² = 9² − 8² (first bullet) AND the unrounded value 4.123… (second bullet) before the rounded answer 4. Writing only "BC = 4" gets 0 marks.

---

### Surface Area and Volume

| Shape | Volume | Surface area |
|-------|--------|--------------|
| Cylinder (radius r, height h) | πr²h | 2πr² + 2πrh |
| Cone (radius r, slant height l, height h) | (1/3)πr²h | πr² + πrl |
| Sphere (radius r) | (4/3)πr³ | 4πr² |
| Square pyramid (base b, height h) | (1/3)b²h | b² + 2bl (l = slant height of face) |
| Prism (cross-section area A, length L) | AL | 2A + perimeter × L |

A truncated cone (pot in N24 Q7a) is the difference between the large cone and the small cone removed from the top. Calculate each volume separately and subtract.

**Worked example (N24 Q7a):** Large cone: radius 15 cm, height 240 cm. Removed cone: volume 32 720 cm³. Find the volume of the pot to the nearest 10 cm³.

- Volume of large cone = (1/3) × π × 15² × 240 = (1/3) × π × 225 × 240 = 18 000π = 56 548.67 cm³
- Volume of pot = 56 548.67 − 32 720 = 23 828.67 cm³
- Rounded to nearest 10 cm³: 23 830 cm³

**Worked example — pyramid (M23 Q4c):** Square-based pyramid, base 24 cm × 24 cm, vertical height h = 12.18 cm (from Pythagoras applied to slant face). Calculate the volume to the nearest integer.

- V = (1/3) × 24² × 12.18 = (1/3) × 576 × 12.18 = 2338.56 cm³ ≈ 2339 cm³

> **Mark scheme callout (M23 Q4c, N24 Q7a):** Using diameter instead of radius is the most penalised error. For V = (1/3)πr²h, r is half the diameter — not the diameter itself. In N24 Q7a, the mark scheme explicitly accepted only answers that included 15 (the radius), not 30.

---

### Transformations

The four transformations are reflection, rotation, translation, and enlargement. Every description must include all required elements or marks are lost.

| Transformation | Required elements in a full description |
|---------------|----------------------------------------|
| Reflection | Line of reflection (equation) |
| Rotation | Angle, direction (clockwise / anticlockwise), centre (as coordinates) |
| Translation | Vector (column form preferred) |
| Enlargement | Scale factor, centre of enlargement |

**Worked example (M16 Q1c):** Describe the rotation that maps shape D to shape A.

- Angle: 180°
- Direction: clockwise or anticlockwise (both valid for 180°)
- Centre: (4, 0)
- Full answer: "180° rotation (clockwise or anticlockwise) about centre (4, 0)"

> **Mark scheme callout (M16 Q1c):** The mark scheme awarded one mark for angle (180°) and one mark for the centre (4, 0). "Centre 4" with no y-coordinate — no marks. "Left" or "right" instead of "clockwise" or "anticlockwise" — no marks. For rotations of 90°, the mark scheme required specification of direction.

---

### Coordinate Geometry

The key formulae for coordinate geometry are:

| Formula | Expression |
|---------|-----------|
| Midpoint of (x₁, y₁) and (x₂, y₂) | ((x₁ + x₂)/2, (y₁ + y₂)/2) |
| Distance between two points | √((x₂ − x₁)² + (y₂ − y₁)²) |
| Gradient of a line | m = (y₂ − y₁)/(x₂ − x₁) |
| Equation of a line | y = mx + c, or y − y₁ = m(x − x₁) |
| Parallel lines | Equal gradients (m₁ = m₂) |
| Perpendicular lines | m₁ × m₂ = −1 |

Implicit form ax + by = c must be rearranged to y = mx + c to read off gradient and intercept. In N24 Q1b–1c, matching equations to graphs required converting x − 2y = −3 to y = x/2 + 3/2 to confirm positive gradient and negative x-intercept.

**Worked example (M16 Q3b):** L₁: y = (2x + 1)/3; L₂: y = (x + 5)/2. Find the intersection.

- Equate: (2x + 1)/3 = (x + 5)/2
- Cross multiply: 2(2x + 1) = 3(x + 5)
- Expand: 4x + 2 = 3x + 15
- Solve: x = 13, then y = (13 + 5)/2 = 9
- Answer: (13, 9)

> **Mark scheme callout (M16 Q3b):** Five method marks. The mark scheme required equating the two expressions, a correct algebraic step, the x-value, substitution back, and the final coordinate pair. A correct final answer without working loses the intermediate marks.

---

### Arc Length and Sector Area

For a sector with radius r and angle θ (in degrees):

- Arc length = (θ/360) × 2πr
- Sector area = (θ/360) × πr²

These are used in circle problems where a portion of the circle is shaded or measured. In M16 Q4, the segments (the regions between the square sides and the arc) were found by subtracting the square's area from the circle's area.

**Worked example (M16 Q4c):** A circle of radius 5 cm contains an inscribed square of side 5√2 cm. Find the total area of the four shaded segments.

- Area of circle = π × 5² = 25π
- Area of square = (5√2)² = 50
- Area of 4 segments = 25π − 50 = 28.54… ≈ 28.5 cm² (1 d.p.)

> **Mark scheme callout (M16 Q4c):** Three method marks. The mark scheme required the area of the square (50), the subtraction step, and the correct rounding to 1 d.p. Writing "28.5" without any working earned only 1 mark.

---

## 2. Past Questions

| Session | Q | Marks | Topic | Question summary | Key mark scheme note |
|---------|---|-------|-------|-----------------|---------------------|
| M16 | 4a | 1 | Circle area (show that) | Show area of circle = 25π | Substitute r = 5 into A = πr² — not r = 10 |
| M16 | 4b | 3 | Pythagoras | Find exact side length of inscribed square | Answer must be left as 5√2 (exact form) |
| M16 | 4c | 3 | Sector/segment area | Area of 4 segments outside square | 25π − 50; answer to 1 d.p. |
| M16 | 4d | 3 | Circumference | Circumference of outer circle (diameter 20) | Use C = 2πr with r = 10; not r = 20 |
| M16 | 1a | 1 | Reflection | Write equation of line of reflection | Accept "y-axis" or x = 0 |
| M16 | 1b | 3 | Translation + reflection | Translate by vector (8, −3) then reflect in y = 1 | Shapes within half a square tolerance; label both C and D |
| M16 | 1c | 2 | Rotation description | Describe rotation D → A | Must give angle, direction, centre as coordinate pair |
| M23 | 3a | 2 | Circle theorems / same segment | Find missing angles in intersecting chord diagram | Accept "same segment"; reject "corresponding" or "3 equal angles" |
| M23 | 3b | 1 | Similar triangles (AA) | State reason triangles AED and BEC are similar | Need any two of the three equal angle pairs |
| M23 | 3c | 4 | Similar triangles — quadratic | Use ratio to form and solve quadratic; show x = 3 | All four steps must be shown (set up ratio, cross multiply, rearrange, factorise) |
| M23 | 3d | 3 | Similar triangles — perimeter | Calculate perimeter of shaded shape given scale factor 4 | Scale factor must be stated; DO NOT ACCEPT 17.1 + x |
| M23 | 4a | 3 | Trigonometry | Show slant height a = 17.1 cm | Half-base (12) must be used; full unrounded value before 17.1 |
| M23 | 4b | 2 | Pythagoras (3D) | Find vertical height h of pyramid | h² = 17.1² − 12² |
| M23 | 4c | 3 | Volume of pyramid | Calculate volume of square pyramid | V = (1/3) × 24² × h; round to nearest integer |
| M23 | 4d | 3 | Volume scale factor | Find % increase when all lengths scaled by 1.1 | Volume factor = 1.1³ = 1.331; increase = 33.1% |
| N24 | 4a | 2 | Pythagoras (show that) | Show BC = 4 (nearest unit) | Both unrounded value AND rounding must be shown |
| N24 | 4b | 1 | Triangle area | Area of triangle ABC | (1/2) × 8 × 4 = 16 |
| N24 | 4d | 2 | Trapezium area — find length | Determine FD using area = 48 | Use A = ((a + b)/2) × h |
| N24 | 4e | 3 | Trigonometry | Find angle FCE | tan FCE = FE/6; answer 53.1° |
| N24 | 7a | 4 | Volume — truncated cone | Volume of pot (large cone − small cone) | Use r = 15 (not 30); round to nearest 10 cm³ |
| N24 | 7d | 1 | Coordinate geometry / packing | Length L₁ for square circle packing | L₁ = 4 × 40 = 160 |
| N24 | 7e | 3 | Pythagoras (2D — circle packing) | Length L₂ for triangular packing | Pythagoras: 80² − 40² = 4800; add 80 to vertical distance |

---

## 3. Mark Scheme Insights

### What the mark scheme rewards

- **Exact form when asked:** For "find the exact value," leave answers as √50 = 5√2, not 7.07. (M16 Q4b)
- **Full transformation descriptions:** All required elements (angle + direction + centre for rotation; equation for reflection). Part answers get part marks only.
- **Explicit steps in "show that" questions:** Every algebraic step must be written. A correct final answer without visible reasoning earns 0 for those steps. (N24 Q4a, M23 Q3c, M23 Q4a)
- **Using radius, not diameter:** Mark schemes check that r (not d) is substituted into πr², (1/3)πr²h, etc.
- **Linking scale factor to area/volume:** For similar figures, state the linear scale factor before computing area or volume ratios. k² for area, k³ for volume. (M23 Q4d)
- **Similarity reasoning with angle names:** Use angle names (e.g. "DAE = CBE, angles in same segment") not vague phrases. (M23 Q3b)
- **Sensible rounding at the correct step:** Round only at the final step unless instructed otherwise. Premature rounding causes ECF failures.

### What the mark scheme penalises / does not accept

- **"Centre 4" without y-coordinate for rotation** — no marks for centre. (M16 Q1c)
- **"Left" or "right" instead of "clockwise/anticlockwise"** for rotation direction. (M16 Q1c)
- **Using diameter in place of radius** in any circle formula — the most common zero-mark area. (M16 Q4a, N24 Q7a)
- **"They share 3 angles" or "corresponding angles"** as reason for similar triangles — rejected. (M23 Q3b)
- **17.1 + x for perimeter** — the mark scheme explicitly rejected leaving x unsimplified; must substitute x = 3. (M23 Q3d)
- **Decimal answers when exact form is required** — e.g. 7.07 instead of 5√2. (M16 Q4b)
- **Area of trapezium with wrong formula** — formula is A = ((a + b)/2) × h, not a × h. (N24 Q4d)
- **Volume of pyramid using base area × height without (1/3)** — always include the (1/3) factor. (M23 Q4c)

---

## 4. Common Mistakes

| Mistake | Correction |
|---------|-----------|
| Using diameter instead of radius in circle/cone/sphere formulas | Always halve the diameter first; r = d/2 |
| Writing "centre 4" or "centre at x = 4" for a rotation | Centre must be a coordinate pair, e.g. (4, 0) |
| Saying "left/right" for rotation direction | Use "clockwise" or "anticlockwise" only |
| Forgetting the (1/3) in volume of cone or pyramid | V = (1/3) × base area × height — the factor is non-negotiable |
| Skipping steps in "show that" questions | Every intermediate step is a mark; write them all out |
| Using the linear scale factor for area or volume comparisons | Area scales by k², volume scales by k³ |
| Setting up similar triangle ratios with wrong correspondence | Label vertices of both triangles; match corresponding (opposite) sides |
| Using "corresponding angles" as reason for similar triangles | The correct reason is "angles in same segment" or state which angles are equal and why |
| Leaving segment/shaded area as "25π − 50" without evaluating | Give a decimal to the requested precision unless exact form is asked for |
| Applying Pythagoras to the wrong sides (using slant height as vertical height) | For 3D pyramids, first find the slant face height, then apply Pythagoras again to get the vertical height |

---

## 5. Revision Priorities

1. Memorise the full transformation description checklist — angle + direction + centre for rotation; equation for reflection; column vector for translation; scale factor + centre for enlargement. Practise writing complete descriptions from diagrams.
2. Drill the radius-vs-diameter distinction before every circle calculation. Write "r = d/2 = …" as the first line of working in every circle question.
3. Practise "show that" questions with full working written at every step — the habit of showing each sub-step is what earns marks in M23 Q3c–style quadratic proofs and N24 Q4a–style Pythagoras proofs.
4. Learn the volume and surface area formulas for all five standard solids (cylinder, cone, sphere, pyramid, prism) without a formula sheet — MYP papers provide some, but knowing them prevents errors when reading the sheet under pressure.
5. Practise similar triangle problems by (a) writing AA/SSS/SAS condition explicitly, (b) listing corresponding vertex pairs, (c) setting up the ratio with correct correspondence, and (d) distinguishing linear scale factor (for perimeter) from k² (for area).
6. For 3D Pythagoras, practise two-step problems: find a base diagonal first, then use it in the second triangle. N24 Q7e (circle packing) and M23 Q4b (pyramid height) are good examples.
7. Review arc length and sector area as (θ/360) of the full circumference or area — easy marks that candidates lose by forgetting the fraction.
