# Binary numbers, finite precision and encoding

Subject: Computer Science · Unit: Data representation · Revision: 2026-10-21.3

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

Unsigned binary, fixed-width limits and introductory text/image encoding. Signed formats and floating-point standards require separate detailed lessons.

## Prerequisites

- Use place value in decimal numbers.

- Evaluate small powers of two.

## Objectives

- Convert small unsigned binary values.

- Calculate the capacity of a fixed number of bits.

- Distinguish represented information from its encoding and storage size.

## Binary is positional notation

Binary uses digits zero and one, with place values that are powers of two. From the right, these are 1, 2, 4, 8, 16 and so on. To convert an unsigned binary number to decimal, add the place values whose bits are one. Leading zeros do not change the value but may indicate a fixed storage width. The bit pattern alone does not identify its meaning: the same sequence might encode an integer, a character, a colour component or an instruction depending on the agreed interpretation. Representation and the thing represented are therefore distinct.

## Finite width and overflow

With n bits there are 2ⁿ distinct patterns. For an unsigned integer format these usually represent values from zero to 2ⁿ-1, inclusive. Eight bits provide 256 patterns but the maximum unsigned value is 255, not 256. If an arithmetic result exceeds the representable range, overflow occurs; the observed behaviour depends on the language and system rather than following one universal rule. Increasing the width expands the possible range but uses more storage. Signed representations allocate patterns differently, so do not use the unsigned maximum formula for a signed format without checking its specification.

## Encoding text and images

Text encoding maps characters or code points to sequences of storage units. A byte is eight bits, but a character is not universally one byte; the encoding and character determine the length. A simple uncompressed raster image stores colour information for a grid of pixels. If each pixel uses b bits and the image has width w and height h, the basic pixel payload is w×h×b bits. Divide by eight for bytes. This excludes metadata, headers, row padding and any compression. Compression size depends on the data and method, so a pixel-count formula cannot by itself predict a compressed file's final size. Lossless compression permits exact recovery; lossy compression intentionally discards some information according to a model of acceptable difference.

## Precision, units and representation choices

A storage format is a contract about interpretation. The same eight bits can represent an unsigned number, part of a signed number, a colour component or part of an encoded character. Without that contract, converting the pattern to a decimal integer may answer the wrong question. A larger representation can increase range, precision or both depending on how its bits are allocated; those are different properties.

Some decimal fractions have no finite binary expansion, just as one third has no finite decimal expansion. A finite machine representation therefore may approximate a value rather than store it exactly. Repeated arithmetic can expose rounding differences, so equality checks and displayed precision need to suit the problem. This does not mean every computer calculation is inaccurate: integers within an appropriate exact range and many binary fractions can be represented exactly. File-size questions must state units and conventions, including whether a prefix means a decimal or binary multiple. Keep raw data size, encoded payload and final file size separate, and do not add precision to an answer that the source measurements cannot support.

## Keeping image storage units and assumptions explicit

An uncompressed raster model assigns a fixed number of bits to each pixel. Multiplying width, height and colour depth gives bits, not bytes. Divide by eight before using a storage unit defined in bytes. State whether a kilobyte means 1,000 bytes or a kibibyte means 1,024 bytes. This simple model omits headers, metadata, row padding and compression, so its result is a payload estimate rather than a guaranteed file size. Increasing each image dimension by a factor of two quadruples pixel count; doubling colour depth then doubles the bits needed again. More representable colours do not guarantee a more accurate image if the source information was already poor.

## Interpret a bit pattern using an explicit encoding

A bit pattern has no unique meaning without its encoding. The same eight bits can represent an unsigned number, a signed number, part of a character or a colour component. In an eight-bit two's-complement integer, the most significant bit has weight -128 and the remaining weights are positive powers of two. Fixed width also limits which arithmetic results fit. Character count and byte count differ for variable-length encodings, so storage calculations need the actual encoding and assumptions about overhead rather than a universal one-byte-per-character rule.

## Diagram: Calculate a raster payload

Read the labelled relationships to follow this worked application. 48,000 bits; 6,000 bytes; 5.859375 KiB. This is an explanatory process diagram, not a scale drawing or a record of a learner attempt.

1. Count pixels: 80 × 50 = 4,000 pixels.
   Relationship to next step: multiply by bits per pixel

2. Apply colour depth: 4,000 × 12 = 48,000 bits.
   Relationship to next step: convert bits before byte units

3. Convert storage units: 48,000/8 = 6,000 bytes; divide by 1,024 for KiB.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Establish the idea

Explain “Binary is positional notation” in your own words. Work through the first example, then answer the linked questions before revealing their solutions.

Read: Binary is positional notation

Worked examples: 1

Practise: q1, q2

### Apply the method

Use the remaining teaching sections to explain each step of the worked examples. Compare your reasoning with the marking points and record the specific step you would change.

Read: Finite width and overflow; Encoding text and images; Precision, units and representation choices

Worked examples: 2, 3

Practise: q3, q4

### Keeping image storage units and assumptions explicit

Read the application diagram “Calculate a raster payload”, then close the explanation and attempt both the application and error-analysis questions. Explain the correction aloud before retrying the mixed practice.

Read: Keeping image storage units and assumptions explicit

Worked examples: 4

Practise: q5, application-check, error-analysis

### Apply and test the limits

Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.

Read: Interpret a bit pattern using an explicit encoding

Worked examples: 4

Practise: depth-signed-pattern, depth-overflow, depth-utf8-length

## Worked example 1

Convert unsigned binary 10110 to decimal.

1. Associate the bits with place values 16, 8, 4, 2 and 1.

2. Add the active places: 16+4+2.

3. Do not read the digits as a decimal numeral.

Answer: 22.

## Worked example 2

Find the raw pixel payload of a 20 by 10 image using 8 bits per pixel, ignoring metadata and compression.

1. There are 20×10=200 pixels.

2. Multiply by 8 to get 1600 bits.

3. Divide by 8 to get bytes.

Answer: 200 bytes of pixel data.

## Worked example 3

Explain why the decimal value 0.5 has a simple finite binary representation.

1. The first binary fractional position represents 1/2.

2. Placing a one there and zeros elsewhere gives 0.1 in base two.

3. The representation is exact because 0.5 equals that power-of-two fraction.

Answer: 0.5 in decimal equals 0.1 in binary exactly.

## Worked example 4

Estimate the raw pixel payload of an 80 by 50 image at 12 bits per pixel. Give bits, bytes and KiB, using 1 KiB = 1,024 bytes and ignoring overhead.

1. There are 80 × 50 = 4,000 pixels.

2. The payload is 4,000 × 12 = 48,000 bits, or 6,000 bytes.

3. Divide 6,000 by 1,024 to obtain 5.859375 KiB.

Answer: 48,000 bits; 6,000 bytes; 5.859375 KiB.

## Misconceptions

- Eight bits store an unsigned maximum of 256.
  Correction: They provide 256 patterns, numbered from 0 to 255.

- Every text character takes exactly one byte.
  Correction: Storage depends on encoding and character; some use multiple bytes.

## Flashcards

### How many distinct patterns are possible with n bits?
2ⁿ.

### What is the largest unsigned n-bit integer?
2ⁿ-1, when zero is included.

### How many bits are in one byte?
Eight.

### Does a bit pattern determine its own meaning?
No. The format and context specify how to interpret it.

### What distinguishes lossless from lossy compression?
Lossless permits exact recovery of the original data; lossy intentionally discards some information.

### How do range and precision differ in a number representation?
Range describes how large or small represented values can be; precision concerns how finely values can be distinguished.

### What unit results from pixels multiplied by bits per pixel?
Bits; divide by eight to convert to bytes.

### How does doubling both raster dimensions affect raw payload?
It quadruples the payload if colour depth remains fixed and overhead is ignored.

## Practice 1 — foundation · 2 marks

Convert unsigned binary 1101 to decimal.

Answer: 13.

1. Use place values 8,4,2,1.

2. Add 8+4+1=13.

Marking points (one practice mark each):

- Use correct place values.

- Obtain 13.

## Practice 2 — foundation · 1 marks

What is the maximum unsigned integer represented with 5 bits?

A. 16

B. 5

C. 31

D. 32

Answer: 31

1. Five bits give 2⁵=32 patterns.

2. Including zero makes the maximum 31.

Marking points (one practice mark each):

- Select 31.

## Practice 3 — standard · 2 marks

Ignoring headers and compression, how many bytes are needed for a 16 by 16 image at 24 bits per pixel?

Answer: 768 bytes.

1. Compute 16×16×24=6144 bits.

2. Divide by 8 to obtain 768 bytes.

Marking points (one practice mark each):

- Calculate the bit payload correctly.

- Convert to 768 bytes.

## Practice 4 — extension · 3 marks

Explain why two images with the same dimensions and nominal colour depth can have different file sizes.

Answer: Their pixel payloads may match before storage details, but compression can exploit different patterns; metadata, file headers and layout may also differ. Dimensions and depth alone do not determine compressed file size.

1. Identify what the raw payload formula covers.

2. Explain content-dependent compression.

3. Name another storage component such as metadata or padding.

Marking points (one practice mark each):

- Distinguish raw payload from file size.

- Explain the effect of content on compression.

- Identify an additional relevant storage factor.

## Practice 5 — extension · 3 marks

A program prints a long sequence of decimal digits for a measurement taken only to the nearest centimetre. Explain why the extra digits do not establish extra measurement accuracy.

Answer: The program's representation and formatting can display more digits than the measurement justifies. The original uncertainty remains; additional displayed digits do not create information about the measured object.

1. Distinguish numerical display precision from measurement accuracy.

2. Identify the limitation imposed by the original measurement.

3. Explain why computation or formatting cannot remove that limitation alone.

Marking points (one practice mark each):

- Distinguish numerical display precision from measurement accuracy.

- Identify the limitation imposed by the original measurement.

- Explain why computation or formatting cannot remove that limitation alone.

## Practice 6 — standard · 3 marks

Estimate the raw pixel payload of an 80 by 50 image at 12 bits per pixel. Give bits, bytes and KiB, using 1 KiB = 1,024 bytes and ignoring overhead.

Answer: 48,000 bits; 6,000 bytes; 5.859375 KiB.

1. There are 80 × 50 = 4,000 pixels.

2. The payload is 4,000 × 12 = 48,000 bits, or 6,000 bytes.

3. Divide 6,000 by 1,024 to obtain 5.859375 KiB.

Marking points (one practice mark each):

- There are 80 × 50 = 4,000 pixels.

- The payload is 4,000 × 12 = 48,000 bits, or 6,000 bytes.

- Divide 6,000 by 1,024 to obtain 5.859375 KiB.

## Practice 7 — extension · 3 marks

Both dimensions of that image are doubled while colour depth stays fixed. A learner predicts twice the payload. Correct the scaling and give the new byte count.

Answer: Pixel count and payload quadruple; the new payload is 24,000 bytes.

1. Doubling width and height multiplies pixel count by 2 × 2 = 4.

2. The bits per pixel are unchanged.

3. Multiply the original 6,000-byte payload by 4 to obtain 24,000 bytes.

Marking points (one practice mark each):

- Doubling width and height multiplies pixel count by 2 × 2 = 4.

- The bits per pixel are unchanged.

- Multiply the original 6,000-byte payload by 4 to obtain 24,000 bytes.

## Practice 8 — standard · 3 marks

Interpret 11111101 as both an 8-bit unsigned integer and an 8-bit two's-complement integer.

Answer: 253 unsigned and -3 signed.

1. The unsigned weights sum to 253.

2. For two's complement, replace the leading 128 weight with -128, equivalently subtract 256.

Marking points (one practice mark each):

- Find unsigned 253.

- Use the signed leading-bit interpretation.

- Find signed -3.

## Practice 9 — standard · 3 marks

An 8-bit unsigned counter uses wraparound arithmetic. It contains 250 and is increased by 12. Give the mathematical sum and the stored value.

Answer: The mathematical sum is 262; the stored value is 6.

1. Eight bits represent values 0 through 255.

2. Reduce 262 modulo 256 under the stated wraparound rule.

Marking points (one practice mark each):

- Find sum 262.

- State the representable range.

- Find stored value 6.

## Practice 10 — extension · 3 marks

A fictional message contains 40 ASCII characters encoded in UTF-8 plus 10 other characters, each specified to take 3 bytes. Ignoring overhead, calculate bytes and explain why counting 50 characters is insufficient.

Answer: 70 bytes; variable byte lengths mean 50 characters need not mean 50 bytes.

1. ASCII characters take 40×1=40 bytes here.

2. Add 10×3=30 bytes, using the stated encoding lengths.

Marking points (one practice mark each):

- Compute 40 bytes.

- Compute and add 30 bytes.

- Explain character count versus byte count.

## Revision checklist

- State the representation before interpreting bits.

- Distinguish pattern count from the maximum value.

- Label bits and bytes and state file-size assumptions.

- Explain the reasoning in “Calculate a raster payload” and correct the linked error-analysis response without copying its solution.

## Revision guide

An uncompressed raster model assigns a fixed number of bits to each pixel. Multiplying width, height and colour depth gives bits, not bytes. Divide by eight before using a storage unit defined in bytes. State whether a kilobyte means 1,000 bytes or a kibibyte means 1,024 bytes. This simple model omits headers, metadata, row padding and compression, so its result is a payload estimate rather than a guaranteed file size. Increasing each image dimension by a factor of two quadruples pixel count; doubling colour depth then doubles the bits needed again. More representable colours do not guarantee a more accurate image if the source information was already poor.

### Key ideas

- 80 × 50 = 4,000 pixels.

- 4,000 × 12 = 48,000 bits.

- 48,000/8 = 6,000 bytes; divide by 1,024 for KiB.

- They provide 256 patterns, numbered from 0 to 255.

### Retrieve without looking

- What unit results from pixels multiplied by bits per pixel?

- How does doubling both raster dimensions affect raw payload?

- How many distinct patterns are possible with n bits?

Mixed practice: q1, application-check, error-analysis, depth-signed-pattern, depth-overflow, depth-utf8-length

After checking your answer, write the specific rule or assumption you missed. Retry the linked questions without the worked example in a later session. A checked answer or completed checklist is not a measurement of mastery.
