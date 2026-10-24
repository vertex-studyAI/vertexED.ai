# Binary representations, hexadecimal and fixed-width arithmetic

Subject: Computer Science · Unit: AQA GCSE 8525 / Cambridge IGCSE 0478: Number systems · Revision: 2026-10-22.1

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Both qualifications are untiered. The common work uses eight-bit positive values; sixteen-bit conversion, overflow and two’s complement are explicitly labelled IGCSE work here, not asserted to be requirements of AQA GCSE 8525. Original teaching and practice, not official examination material. Practice rubrics are for self-review. This topic does not establish whole-course coverage, independent subject review or publication approval.

## Prerequisites

- Use powers of two and integer division.

- Distinguish a value from the symbols used to represent it.

## Objectives

- Convert values without changing their meaning.

- Trace binary addition and logical shifts.

- Distinguish unsigned and signed interpretations of the same bits.

## Place value: GCSE/IGCSE untiered

An eight-bit unsigned pattern has weights 128, 64, 32, 16, 8, 4, 2 and 1 from left to right. Add the weights whose bits are 1. To encode 75, select 64, 8, 2 and 1, producing 01001011. The leading zero preserves the chosen width without changing the value. Eight bits give 256 distinct patterns, covering integers 0 through 255 when interpreted as unsigned; 256 is the count of patterns, not the largest value.

## Hexadecimal and arithmetic: GCSE/IGCSE untiered

Hexadecimal uses sixteen digits, with A through F representing ten through fifteen. One hexadecimal digit corresponds to four bits, so 0100 1011 becomes 4B. Hexadecimal is a compact human-readable notation for the same bits; converting to it does not compress the underlying data. In binary addition, 1 + 1 writes 0 and carries 1, while 1 + 1 + 1 writes 1 and carries 1. Work from the least significant column and track each carry.

## Logical shifts: GCSE/IGCSE untiered

A logical shift moves bits and inserts zeros. With sufficient width, shifting an unsigned integer left once multiplies it by two. In a fixed-width register, bits leaving an end are discarded, so that shortcut needs a condition. A right shift once divides an unsigned value by two and discards any fractional remainder. For 00001101, a right shift gives 00000110: 13 becomes 6, not 6.5. State both the pattern and its interpretation to show what was lost.

## Signed values and wider conversion: IGCSE untiered

Cambridge 0478 includes conversions up to sixteen bits and eight-bit two’s complement. In eight-bit two’s complement the leftmost weight is -128, followed by the ordinary positive weights 64 down to 1. Thus 11111011 represents -128 + 64 + 32 + 16 + 8 + 2 + 1 = -5, although the same bits represent 251 if unsigned. To encode a negative value, invert the bits of its positive eight-bit representation and add one. The signed range is -128 to 127. An unsigned sum greater than 255 overflows eight bits; truncating a carry does not make the mathematical result correct.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Build the explanation

Read the opening sections. Reconstruct the reasoning in worked example 1, then attempt the first two questions before looking at their answers.

Read: Place value: GCSE/IGCSE untiered; Hexadecimal and arithmetic: GCSE/IGCSE untiered

Worked examples: 1

Practise: binary-denary, denary-binary

### Apply and distinguish

Study the remaining sections and worked example 2. Explain why its reasoning fits this situation. Check the programme and tier labels before attempting the next questions.

Read: Logical shifts: GCSE/IGCSE untiered; Signed values and wider conversion: IGCSE untiered

Worked examples: 2

Practise: binary-add, right-shift

### Test and revise

Attempt the remaining questions from memory. Compare each claim with the practice marking points, correcting unsupported reasoning. These are self-review tasks, not automated exam grades.

Read: Place value: GCSE/IGCSE untiered; Hexadecimal and arithmetic: GCSE/IGCSE untiered; Logical shifts: GCSE/IGCSE untiered; Signed values and wider conversion: IGCSE untiered

Worked examples: 1, 2

Practise: overflow-eight, twos-complement

## Worked example 1

Convert 10100110 to denary and hexadecimal.

1. Add 128 + 32 + 4 + 2 = 166.

2. Group 1010 and 0110 to obtain A and 6.

Answer: 166 and A6.

## Worked example 2

IGCSE: encode -12 in eight-bit two’s complement.

1. Write +12 as 00001100, invert to 11110011 and add one.

2. Check using weights: -128 + 64 + 32 + 16 + 4 = -12.

Answer: 11110100.

## Misconceptions

- Hexadecimal stores fewer underlying bits than the same binary value.
  Correction: It abbreviates how humans write a bit pattern; the representation choice alone does not compress data.

- A binary pattern has one meaning regardless of context.
  Correction: Encoding and signedness determine its interpretation.

## Flashcards

### What is the maximum eight-bit unsigned integer?
255.

### How many bits match one hexadecimal digit?
Four.

### What is hexadecimal F?
Denary 15, binary 1111.

### What happens to the remainder in an unsigned right shift?
It is discarded.

### What is the eight-bit two’s-complement range?
-128 to 127; labelled IGCSE content here.

## Practice 1 — standard · 2 marks

[GCSE/IGCSE: untiered] Convert 01011010 to denary and hexadecimal.

Answer: 90 and 5A.

1. 64 + 16 + 8 + 2 = 90.

2. 0101 = 5 and 1010 = A.

Marking points (one practice mark each):

- 90.

- 5A.

## Practice 2 — standard · 2 marks

[GCSE/IGCSE: untiered] Encode denary 109 as eight-bit binary.

Answer: 01101101.

1. 109 = 64 + 32 + 8 + 4 + 1.

2. Place ones at those weights and preserve eight positions.

Marking points (one practice mark each):

- Correct decomposition.

- 01101101.

## Practice 3 — standard · 2 marks

[GCSE/IGCSE: untiered] Add 00101101 and 00010111, showing the eight-bit result.

Answer: 01000100.

1. The values are 45 and 23.

2. 45 + 23 = 68 = 64 + 4; check the carried columns.

Marking points (one practice mark each):

- Correct carry reasoning or trace.

- 01000100.

## Practice 4 — standard · 3 marks

[GCSE/IGCSE: untiered] Logically shift 00010111 right by one position and explain the denary result.

Answer: 00001011, which is 11.

1. 23 / 2 has integer quotient 11.

2. The least significant 1 is lost and zero enters at the left.

Marking points (one practice mark each):

- Correct pattern.

- 11.

- Lost remainder explained.

## Practice 5 — standard · 3 marks

[IGCSE: untiered] Add unsigned denary 200 and 100 in an eight-bit register. Explain why storing only the low eight bits is wrong.

Answer: The true sum is 300; the retained value is 44 because the 256 carry is lost.

1. Eight bits represent at most 255 unsigned.

2. 300 - 256 = 44 does not equal 300.

Marking points (one practice mark each):

- 300 exceeds range.

- Lost carry.

- 44 identified.

## Practice 6 — standard · 3 marks

[IGCSE: untiered] Interpret 11110110 as eight-bit two’s complement, then encode hexadecimal 12AF as sixteen-bit binary.

Answer: -10; 0001001010101111.

1. -128 + 64 + 32 + 16 + 4 + 2 = -10.

2. Translate digits 1,2,A,F into 0001,0010,1010,1111.

Marking points (one practice mark each):

- -10 with signed interpretation.

- Correct four groups.

- Sixteen-bit pattern.

## Revision checklist

- Convert values without changing their meaning.

- Trace binary addition and logical shifts.

- Distinguish unsigned and signed interpretations of the same bits.

## Revision guide

Keep the value, encoding and register width distinct. Board-specific material is explicitly labelled rather than invented as a higher tier.

### Key ideas

- What is the maximum eight-bit unsigned integer? 255.

- How many bits match one hexadecimal digit? Four.

- What is hexadecimal F? Denary 15, binary 1111.

- What happens to the remainder in an unsigned right shift? It is discarded.

- What is the eight-bit two’s-complement range? -128 to 127; labelled IGCSE content here.

### Retrieve without looking

- What is the maximum eight-bit unsigned integer?

- How many bits match one hexadecimal digit?

- What is hexadecimal F?

- What happens to the remainder in an unsigned right shift?

- What is the eight-bit two’s-complement range?

Mixed practice: binary-denary, denary-binary, binary-add, right-shift, overflow-eight, twos-complement

Explain your corrected answers without the notes. Revisit the specific section responsible for each error; completing these questions is not evidence of completing the qualification.
