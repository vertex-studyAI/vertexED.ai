# A-Level proof: deduction, exhaustion, counterexample and contradiction

Subject: Mathematics · Unit: AQA A-Level 7357: Proof · Revision: 2026-10-21.5

**Review draft — not independently approved. Practice marks are editorial, not official exam marks.**

AQA A-Level Mathematics 7357 point A1: logical structure, deduction, exhaustion, disproof by counterexample and contradiction, including irrationality of √2 and infinitely many primes. This is the Proof unit, not the complete A-Level course; induction is not added as an A1 requirement. Original teaching and practice, not official exam questions. Tier labels describe intended specification scope, not predicted grades. Author-proposed coverage is recorded separately from independent review and publication approval.

## Prerequisites

- Manipulate algebraic expressions and factorise.

- Understand parity, primes and reduced rational fractions.

## Objectives

- Write proofs with a stated domain, justified steps and a conclusion.

- Choose between deduction, exhaustive cases and counterexample.

- Construct contradiction proofs and transfer their logic to unfamiliar statements.

## A-Level: logical structure and deduction

A proof establishes a claim for every case in its stated domain using accepted facts and valid implications. Define variables and assumptions before manipulating symbols. To prove that the square of an odd integer is odd, write n=2k+1 with k an integer, then n²=4k²+4k+1=2(2k²+2k)+1. The bracket is an integer, so the required form follows. Checking 3² and 5² alone cannot establish the universal result.

An implication P⇒Q does not automatically justify its converse Q⇒P. If n is divisible by 4, it is even, but 6 disproves the converse. An if-and-only-if statement needs both directions unless every step is explicitly reversible. Avoid circular reasoning: a desired conclusion cannot serve as an unexplained premise. If dividing by an expression, establish it is nonzero or handle the zero case separately.

## A-Level: exhaustion and counterexample

Proof by exhaustion divides the domain into a finite, complete set of cases and proves each. For any integer n, division by 3 leaves remainder 0, 1 or 2. Substituting n=3k, 3k+1 or 3k+2 shows n² has remainder 0 or 1, never 2. The proof covers infinitely many integers because the remainder classes are exhaustive, not because a few integers were tested.

To disprove a universal claim, one counterexample in its domain is enough. The claim n²+n+41 is prime for every nonnegative integer n fails at n=41, because the expression is 41(41+1+1)=41×43. A valid counterexample must satisfy the assumptions and fail the conclusion. It does not prove a replacement universal claim, and evidence supporting many cases does not outweigh one valid failure.

## A-Level: contradiction and the irrationality of root two

A contradiction proof assumes the negation of the target statement and derives an impossibility. To prove √2 is irrational, assume √2=a/b for integers a,b with b≠0 and gcd(a,b)=1. Then a²=2b², so a² is even. An odd integer has an odd square, so a must be even; write a=2k. Substituting gives 4k²=2b², hence b²=2k², making b even too.

Both numerator and denominator are now divisible by 2, contradicting the choice of a reduced fraction. Therefore the rationality assumption was false. The reduced-fraction premise is essential: two even integers alone are not contradictory unless they were assumed coprime. Likewise explain why an even square implies an even base; it is a lemma, not a visual observation about examples.

## A-Level: infinitely many primes and unfamiliar proofs

Suppose there are only finitely many primes p₁,…,pₖ. Form N=p₁p₂…pₖ+1. This integer is greater than 1, so it has a prime divisor q. Dividing N by any listed prime leaves remainder 1, so q is absent from the list. This contradicts the assumption that the list contained every prime. N need not itself be prime: the existence of an unlisted prime divisor is enough.

For an unfamiliar problem, first write the exact logical claim and domain. Try deduction when the algebra exposes a required form, exhaustion when a small set of residues or sign cases covers everything, or contradiction when a negated claim supplies a strong assumption. If the statement may be false, seek a small or boundary counterexample. A successful proof ends by connecting the final fact to the original claim, not merely by stopping after a calculation. Checking examples helps choose a strategy but is not a substitute for the proof.

## Guided teaching sequence

Suggested study route, not an official assessment or measured mastery.

### Build a general deduction

State the domain and every division assumption; distinguish implications from converses.

Read: A-Level: logical structure and deduction

Worked examples: 1

Practise: deduction, converse, audit-proof

### Partition or disprove

Explain why cases exhaust the domain; a counterexample instead must break the claim.

Read: A-Level: exhaustion and counterexample

Worked examples: 1

Practise: exhaustion, counterexample, unfamiliar

### Contradiction and transfer

State the negated assumption, identify the exact contradiction and reject the assumption.

Read: A-Level: contradiction and the irrationality of root two; A-Level: infinitely many primes and unfamiliar proofs

Worked examples: 2

Practise: root-two, infinite-primes, contradiction-transfer

## Worked example 1

Prove that the product of two consecutive integers is even.

1. Exhaust the parity cases: n=2k or n=2k+1 with k an integer.

2. In the first case n(n+1)=2[k(2k+1)]. In the second it is 2[(2k+1)(k+1)].

3. Each bracket is an integer, so both complete cases have an explicit factor 2.

Answer: For every integer n, n(n+1) is divisible by 2.

## Worked example 2

Prove by contradiction that no smallest positive real number exists.

1. Assume s is the smallest positive real number.

2. Then s/2 is positive because s>0, yet s/2<s, contradicting minimality.

3. Reject the assumption. The domain matters: positive integers do have a smallest element.

Answer: There is no least element among the positive real numbers.

## Misconceptions

- Many successful examples prove a universal statement.
  Correction: They suggest a pattern but leave untested cases. Use a general argument or genuinely exhaustive partition.

- The product of all listed primes plus one must be prime.
  Correction: It may be composite; its prime divisors, however, are not in the list.

## Flashcards

### What must a counterexample satisfy?
All premises and the domain, while failing the conclusion.

### What makes casework exhaustive?
Every possible member of the domain belongs to a covered case.

### Why take a/b in lowest terms in the √2 proof?
So deriving a common factor contradicts an explicit assumption.

### Does P⇒Q prove Q⇒P?
No; the converse needs its own argument.

### What is enough in the infinite-primes construction?
A prime divisor not in the alleged complete list; the constructed number need not be prime.

## Practice 1 — extension · 2 marks

[A-Level] Prove that the sum of any two odd integers is even, allowing the two integers to differ.

Answer: Write 2r+1 and 2s+1 for integers r,s. Their sum is 2(r+s+1), hence even.

1. Use independent integer parameters for the two odd numbers.

2. Factor out 2 and state that the remaining expression is an integer.

Marking points (one practice mark each):

- Represent both odd integers generally.

- Factor the sum and conclude evenness.

## Practice 2 — extension · 3 marks

[A-Level] Prove by exhaustion that the square of any integer has remainder 0 or 1 on division by 4.

Answer: For n=2k, n²=4k². For n=2k+1, n²=4(k²+k)+1. These parity cases exhaust all integers.

1. Partition all integers into even and odd cases.

2. Calculate the square in each case and identify the remainder modulo 4.

Marking points (one practice mark each):

- State an exhaustive partition.

- Prove the even case.

- Prove the odd case and conclude.

## Practice 3 — extension · 2 marks

[A-Level] Disprove: for all real x, x²>x. Explain why the example lies in the domain and fails the strict inequality.

Answer: For x=0, x²=0 is not greater than 0; 0 is real.

1. Choose a permitted real value.

2. Substitute and show the conclusion is false, not merely different in form.

Marking points (one practice mark each):

- Give a valid in-domain counterexample.

- Demonstrate the failed strict inequality.

## Practice 4 — extension · 2 marks

[A-Level] A learner proves that if an integer is divisible by 6 it is divisible by 3, then claims the converse. State and test the converse.

Answer: Converse: every integer divisible by 3 is divisible by 6. It is false; 3 (or 9) is a counterexample.

1. Reverse the implication explicitly.

2. Check the counterexample meets divisibility by 3 but fails divisibility by 6.

Marking points (one practice mark each):

- State the actual converse.

- Give a valid disproof.

## Practice 5 — extension · 4 marks

[A-Level] Give a complete contradiction proof that √2 is irrational. State where reduced form is used.

Answer: Assume √2=a/b in coprime integers with b≠0. Then a²=2b² implies a even; a=2k gives b²=2k² and b even, contradicting coprimality.

1. Assume a rational representation in lowest terms and square it.

2. Justify that an even square has an even base, since odd squares are odd.

3. Substitute a=2k, derive b even and name the contradiction.

Marking points (one practice mark each):

- State coprime integer assumptions with nonzero denominator.

- Derive and justify a even.

- Derive b even.

- Contradict coprimality and conclude irrationality.

## Practice 6 — extension · 4 marks

[A-Level] Prove that there are infinitely many primes. Address why the constructed number need not itself be prime.

Answer: Assume a complete finite prime list, form its product plus one, and take a prime divisor of that integer. None of the listed primes divides it, giving a contradiction.

1. A number greater than 1 has a prime divisor, whether prime or composite.

2. Each listed prime leaves remainder 1 on division of the constructed number.

3. An unlisted divisor contradicts completeness of the assumed list.

Marking points (one practice mark each):

- State the finite-list assumption and construct product plus one.

- Justify the existence of a prime divisor.

- Show no listed prime can be that divisor.

- Conclude the contradiction without asserting the constructed number is prime.

## Practice 7 — extension · 3 marks

[A-Level] Prove that for every integer n, n³−n is divisible by 6.

Answer: n³−n=n(n−1)(n+1), a product of three consecutive integers. One is divisible by 3 and at least one is even, so the product is divisible by 2×3=6.

1. Factor the expression as a product of consecutive integers.

2. Use exhaustive residue classes modulo 3 and parity to justify the factors 3 and 2.

3. Since 2 and 3 are coprime, divisibility by both gives divisibility by 6.

Marking points (one practice mark each):

- Factor correctly.

- Justify a factor of 3 and a factor of 2 for every integer.

- Use coprimality and conclude divisibility by 6.

## Practice 8 — extension · 2 marks

[A-Level] A proposed proof says: if x²=x then divide by x to get x=1. Identify the missing case and give the full real solution set.

Answer: x=0 was excluded by division. Factor x(x−1)=0 to obtain x=0 or x=1.

1. Division by x requires x≠0, which was not established.

2. Factor the original equation and apply the zero-product property.

Marking points (one practice mark each):

- Identify the invalid unqualified division.

- Recover both solutions and no others.

## Practice 9 — extension · 2 marks

[A-Level] Prove that the sum of a rational number and an irrational number is irrational, stating the assumptions.

Answer: Let r be rational and u irrational. If r+u=s were rational, then u=s−r would be rational, a contradiction.

1. Assume the negation: the sum is rational.

2. Rational numbers are closed under subtraction; this contradicts u being irrational.

Marking points (one practice mark each):

- Name the rational and irrational quantities and the contrary assumption.

- Use closure under subtraction to derive and state the contradiction.

## Revision checklist

- Write proofs with a stated domain, justified steps and a conclusion.

- Choose between deduction, exhaustive cases and counterexample.

- Construct contradiction proofs and transfer their logic to unfamiliar statements.

## Revision guide

Proof is a chain of justified implications over a stated domain. Choose a complete case split, a valid counterexample or a contradiction assumption deliberately. The √2 and infinite-primes arguments depend on precise premises, not memorised final phrases.

### Key ideas

- What must a counterexample satisfy? All premises and the domain, while failing the conclusion.

- What makes casework exhaustive? Every possible member of the domain belongs to a covered case.

- Why take a/b in lowest terms in the √2 proof? So deriving a common factor contradicts an explicit assumption.

- Does P⇒Q prove Q⇒P? No; the converse needs its own argument.

- What is enough in the infinite-primes construction? A prime divisor not in the alleged complete list; the constructed number need not be prime.

### Retrieve without looking

- What must a counterexample satisfy?

- What makes casework exhaustive?

- Why take a/b in lowest terms in the √2 proof?

- Does P⇒Q prove Q⇒P?

- What is enough in the infinite-primes construction?

Mixed practice: deduction, exhaustion, counterexample, converse, root-two, infinite-primes, unfamiliar, audit-proof, contradiction-transfer

Reattempt the questions without the notes. Use the worked reasoning to identify the first unsupported step, then explain that step in your own words. Editorial self-review marks do not certify exam readiness.
