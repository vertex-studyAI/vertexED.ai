# VertexED Copy System

## Voice

VertexED copy is concrete, calm, specific, and academically literate. It should sound like a product that understands how students actually revise.

Prefer short sentences. Use specific nouns and verbs. Say what the tool does and what changes next.

## Product vocabulary

Preserve established terms when they are accurate:

- Study Planner
- Study Zone
- Paper Maker
- Answer Reviewer
- Notes
- Flashcards
- Quiz
- Apex
- plan
- focus
- practise
- review
- remember
- task
- topic
- subject
- attempt
- rubric
- mark
- retrieval
- study session

Do not rename product objects casually for style.

## Core copy rule

Describe the observable action or workflow.

Prefer:

- "Turn the weak topic into tomorrow's task."
- "Review where marks were lost."
- "Open the next study block."
- "Practise this topic again."

Avoid vague promises about intelligence, transformation, or potential.

## Banned marketing language

Do not use these phrases in product copy unless they appear inside a quoted source that must remain exact:

- unlock
- unleash
- reimagine
- revolutionize
- supercharge
- empower
- elevate
- seamless
- cutting-edge
- next-generation
- game-changing
- future of
- built for the future
- transform the way
- where X meets Y
- limitless possibilities
- everything you need to
- designed to help you
- not just X, but Y
- whether you're X, Y, or Z

## Punctuation

Do not use the Unicode em dash character in product copy.

Use a period, comma, colon, parentheses, or a short hyphenated construction when needed.

Avoid unnecessary exclamation marks.

## Headings

A good heading contains product meaning.

Good:

- "Know what to study. Practise what matters."
- "Practice should change the next plan."
- "See where the marks went."
- "Turn feedback into the next attempt."

Weak:

- "A better way to learn"
- "Study smarter"
- "Powerful tools"
- "Built for students"
- "The future of learning"

## Buttons

Buttons should name the action.

Prefer:

- Join the private beta
- Open Study Planner
- Review answer
- Start study session
- Create practice paper
- Save changes

Avoid:

- Get started today
- Learn more
- Discover
- Explore possibilities

Use "Learn more" only when there is genuinely no more specific action.

## AI copy

Do not describe Apex or other AI features as magic, a companion, a genius, or a replacement for student thinking.

Describe the exact useful behavior:

- explain a concept
- question an argument
- inspect an answer
- retrieve relevant course context
- generate bounded practice
- identify a gap

Never claim reasoning, confidence, accuracy, or personalization beyond what the implementation and retained evidence support.

## Claims policy

Never fabricate:

- users
- institutions
- customers
- schools
- grade improvements
- success rates
- accuracy metrics
- testimonials
- research results
- partner relationships

If a number or institutional claim cannot be traced to evidence in the repository, remove it or state a narrower supported fact.

## Empty states

Empty states should explain what is missing and name one useful next action.

Example:

"No review attempts yet. Submit an answer to keep the feedback with this topic."

## Errors

State what failed and what the user can do next. Do not blame the user. Do not use generic "Something went wrong" when a more useful message is available.

Example:

"The paper could not be saved. Your draft is still open. Try saving again."

## Copy lint

The automated copy lint should report at minimum:

- Unicode em dash characters in product-facing copy
- banned phrases in this file
- lorem ipsum or template filler
- suspicious placeholder testimonials
- suspicious placeholder metrics
- repeated generic headings

The linter must not silently rewrite factual claims. It should point to the file and line so a human can review the source.