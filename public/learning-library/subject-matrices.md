# Matrix multiplication, composition and invertibility

Subject: Further Mathematics · Unit: Linear transformations · Revision: 2026-10-21.4

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Original shared study module on matrix multiplication, composition and invertibility. Numerical datasets and quoted passages are invented teaching examples. This is not a complete course, official examination material or verified board-specific alignment.

## Prerequisites

- Multiply and add signed numbers.

- Use two-dimensional column vectors.

## Objectives

- Multiply a matrix by a column vector.

- Compose transformations in the correct order.

- Use the determinant to test invertibility of a two-by-two matrix.

## A matrix acts on an input vector

A two-by-two matrix acts on a two-component column vector by taking a row-by-column dot product for each output coordinate. The first column of the matrix is the image of the first coordinate unit vector, and the second column is the image of the second. This interpretation lets a transformation be reconstructed from those two images. Check that the inner dimensions agree before multiplying. The result's dimensions are determined by the outer dimensions, so a valid matrix product need not have the same shape as either original factor.

## Composition has an order

With column vectors, applying transformation B and then A gives A(Bv)=(AB)v. The rightmost matrix therefore acts first. In general AB and BA differ: rotating a point and then stretching along a fixed horizontal axis does not usually match stretching first and then rotating. Matrix multiplication is associative, so brackets can be moved in a compatible triple product, but factors cannot generally be swapped. Use a test vector to expose an order mistake, and state whether the question uses column vectors before interpreting a composition geometrically.

## Invertibility and lost information

For a two-by-two matrix with rows (a,b) and (c,d), the determinant is ad-bc. A nonzero determinant permits an inverse; the inverse undoes the transformation. A zero determinant means the columns are linearly dependent and some distinct inputs have the same output, so unique recovery is impossible. The absolute determinant measures the area scale factor, while its sign records orientation in the chosen coordinates. A determinant of one preserves area but does not force lengths or angles to be preserved. Distinguish area preservation from being a rotation.

## Diagram: Reasoning route: Linear transformations

Use the sequence to organise an explanation of matrix multiplication, composition and invertibility; it is not a measured mastery score.

1. Input convention: Specify column vectors and compatible dimensions.
   Relationship to next step: Use this definition to choose the method

2. Ordered action: Multiply rows by columns; rightmost transformation acts first.
   Relationship to next step: Use the result to evaluate the conclusion

3. Recover or diagnose: Use the determinant and inverse, or explain information loss.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### A matrix acts on an input vector

Treat each row as a dot product with the input column; check both output coordinates.

Read: A matrix acts on an input vector

Worked examples: 1

Practise: product

### Composition has an order

Apply the same matrix-vector method twice, rightmost matrix first, and compare the reversed composition.

Read: Composition has an order

Worked examples: 1

Practise: order

### Invertibility and lost information

Calculate the determinant before using the inverse formula; check a proposed inverse by multiplication.

Read: Invertibility and lost information

Worked examples: 2

Practise: inverse, singular

## Worked example 1

Apply the matrix with rows (2,1) and (0,3) to the column vector (4,-1).

1. First coordinate: 2×4+1×(-1)=7.

2. Second coordinate: 0×4+3×(-1)=-3.

Answer: The output vector is (7,-3).

## Worked example 2

Is the matrix with rows (1,2) and (2,4) invertible?

1. Its determinant is 1×4-2×2=0.

2. The second row is twice the first, so the two output equations are dependent.

Answer: No; information is lost and no inverse exists.

## Misconceptions

- Matrix multiplication is commutative.
  Correction: Order generally matters; test AB and BA on a vector.

- Area preservation guarantees a rotation.
  Correction: Shears can preserve area without preserving angles or lengths.

## Flashcards

### Which matrix acts first in ABv?
B, under the column-vector convention.

### What is a matrix's first column?
The image of the first coordinate unit vector.

### What is the two-by-two determinant?
ad-bc for rows (a,b) and (c,d).

### When does a two-by-two inverse exist?
When its determinant is nonzero.

### What does the absolute determinant measure geometrically?
The area scale factor.

## Practice 1 — standard · 2 marks

Apply the matrix with rows (3,-1) and (2,0) to the vector (2,5).

Answer: The output is (1,4).

1. Compute 3×2-5 for the first coordinate.

2. Compute 2×2+0×5 for the second.

Marking points (one practice mark each):

- Find first coordinate 1.

- Find second coordinate 4.

## Practice 2 — extension · 2 marks

Let A have rows (2,0),(0,1), and let B have rows (0,-1),(1,0). For v=(1,0), compare ABv and BAv.

Answer: ABv=(0,1), while BAv=(0,2).

1. For ABv, rotate first to (0,1), then stretch the horizontal coordinate.

2. For BAv, stretch first to (2,0), then rotate to (0,2).

Marking points (one practice mark each):

- Find ABv.

- Find BAv and identify the difference.

## Practice 3 — standard · 2 marks

For A with rows (2,1),(1,1), give its determinant and inverse.

Answer: det A=1; A⁻¹ has rows (1,-1),(-1,2).

1. Compute 2×1-1×1.

2. Swap the diagonal entries, negate the off-diagonal entries, and divide by the determinant.

Marking points (one practice mark each):

- Find determinant 1.

- Give the inverse matrix.

## Practice 4 — extension · 2 marks

The matrix with rows (k,2),(3,6) depends on real k. Find when it has no inverse.

Answer: k=1.

1. Its determinant is 6k-6.

2. Set the determinant to zero and solve.

Marking points (one practice mark each):

- Form 6k-6.

- Find k=1.

## Revision checklist

- Check that you can multiply a matrix by a column vector without copying the worked solution.

- Check that you can compose transformations in the correct order without copying the worked solution.

- Check that you can use the determinant to test invertibility of a two-by-two matrix without copying the worked solution.

## Revision guide

Review matrix multiplication, composition and invertibility by connecting definitions, the two worked examples and the limits of each conclusion. These questions use editorial self-review points, not an official examination rubric.

### Key ideas

- Which matrix acts first in ABv? B, under the column-vector convention.

- What is a matrix's first column? The image of the first coordinate unit vector.

- What is the two-by-two determinant? ad-bc for rows (a,b) and (c,d).

### det A=ad−bc; A⁻¹=(1/(ad−bc))[[d,−b],[−c,a]]
Determinant and inverse for A with rows (a,b),(c,d).
Conditions: The inverse exists exactly when ad−bc is nonzero.

### (AB)v=A(Bv)
Apply B first, then A.
Conditions: Dimensions must be compatible; reversing order generally changes the result.

### Retrieve without looking

- Which matrix acts first in ABv?

- What is a matrix's first column?

- What is the two-by-two determinant?

Mixed practice: product, order, inverse, singular

Attempt the questions without the notes, compare your reasoning with the points, and retry any step you cannot yet explain. Self-review does not certify mastery.
