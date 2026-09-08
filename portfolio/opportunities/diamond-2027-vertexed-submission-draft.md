# Diamond Challenge 2027 — VertexED submission draft

Status: first-round working draft, not submitted.
Track: Business Innovation.
Pitch-round default: Virtual / pre-recorded, subject to final team decision before submission.

## Written concept narrative

### VertexED: turning a marked practice attempt into the next study action

The week before an exam, a student can have more study tools than ever and still not know what to do next. A planner may tell them when to study. A video can explain a topic. A past-paper folder can provide questions. A flashcard app can help them memorize. An AI chatbot can answer almost anything. Yet the student still has to connect those systems manually: choose a task, decide whether it resembles the real assessment, judge where marks were lost, translate that failure into a revision priority, and remember to revisit it before the exam.

That coordination problem is the reason we are building VertexED.

VertexED is a revision operating loop for secondary-school students. Instead of treating planning, focus, practice, feedback, and memory as unrelated features, VertexED connects them into one sequence: **Plan → Focus → Practise → Review → Remember.** A student plans around a real deadline, works through a focused session, completes a board-shaped practice task, reviews where marks were earned and lost, and schedules retrieval of the weak concepts that matter next.

The most important part of the product is not that it uses AI. The important part is what happens after a student gets something wrong.

In a fragmented workflow, a weak answer may end as a score, a teacher comment, or a chat response. In VertexED, the goal is for that weak answer to become the next concrete study action. If a student loses marks because they misread a command term, omitted a required step, or failed to recall a concept under time pressure, the system should not merely explain the mistake. It should help turn the mistake into a targeted follow-up task and place that task back into the student’s revision loop.

### The customer and the problem

Our initial customer is a secondary-school student preparing for board-style assessments, particularly students in IB MYP/DP and other programs where the quality and structure of practice material can vary sharply by subject. These students already have access to large amounts of content. Their problem is not simply content access. It is deciding what deserves attention, practising it in a format that resembles the assessment, and converting feedback into an effective next step.

This problem becomes more visible during the 7–14 days before a mock or exam. Time is limited. The student may be balancing several subjects, school deadlines, activities, and sleep. Generic advice such as “revise chemistry” or “do more practice questions” is not useful enough. The student needs an executable sequence: which topic, which type of question, how long to spend, what evidence will show improvement, and when to retrieve the topic again.

VertexED is designed around that moment of urgency.

We are intentionally not claiming that every student studies in the same way, or that software can replace teachers. Teachers provide context, judgment, motivation, and subject expertise that a product cannot replicate. VertexED instead focuses on the operational layer between lessons and exams: helping a student carry evidence from one revision action into the next.

### The solution

VertexED currently presents six connected parts of the revision loop.

**Study Planner** maps tasks around real deadlines and the time a student actually has. The objective is not to create an impressive but unrealistic six-hour study schedule; it is to create a week the student can execute.

**Study Zone** provides a focused workspace for running the study block rather than merely planning it.

**Paper Maker** is built around assessment-shaped practice, including recognizable command words and mark-scheme structure. The goal is to make practice resemble the reasoning and constraints that matter in the exam rather than producing generic question lists.

**Answer Reviewer** focuses on marks earned, marks lost, weak command terms, and the next rewrite or reasoning step. Feedback should be specific enough to change behavior.

**Notes, Flashcards, and Quiz** convert material into retrieval rather than leaving it as passive notes. Weak concepts can return on a schedule instead of disappearing after one review session.

**Apex** is a discussion-first AI layer intended to stress-test reasoning rather than simply produce finished answers. When a student is stuck, the system should help them explain what they tried and identify the missing reasoning step.

The venture thesis is simple: these tools become more valuable when they share one revision state. The practice attempt should inform the review. The review should inform the next plan. The plan should determine what gets retrieved. The user should not have to rebuild that context in a different app every time.

### Why this is different

The study-technology market is crowded, and we do not believe “all-in-one AI study app” is a meaningful differentiator by itself. Existing products already combine scheduling, tutoring, flashcards, quizzes, analytics, and AI. Specialized IB platforms also offer tutoring, diagnostics, grading, and mock-exam tools.

Our differentiation is narrower and more testable: **VertexED is designed so that a board-shaped practice result changes the student’s next planning and retrieval action.**

That changes what we need to prove. We do not need to show that VertexED has more features than every competitor. We need to show that a student can complete one closed loop with less coordination overhead and clearer next actions than they would using disconnected tools.

A strong VertexED demonstration therefore looks like this: a student enters an exam date and a weak topic; completes a relevant timed task; receives assessment-aware feedback that identifies the exact marks or reasoning lost; converts the weakness into a follow-up retrieval task; and sees that task reappear in the revision plan. If that loop is not useful, adding more AI features will not rescue the product.

### Business model

VertexED is currently in private beta. At this stage, our priority is proving repeated student use before optimizing monetization.

Our planned model is freemium. A free tier should allow a student to complete a real revision loop with constrained AI or generation volume. A paid student tier can support higher paper-generation and feedback limits, deeper progress analytics, and longer learning history. Only after the student workflow proves repeat use would we expand toward school or tutor plans with cohort-management and assignment features.

We are deliberately treating pricing as a hypothesis rather than inventing a number for a competition application. Before fixing price points, we plan to interview students about what they currently pay for tutoring, study software, question banks, and exam preparation, and which part of the VertexED loop would actually justify payment.

This produces a healthier business test: first prove that the workflow solves a repeated problem, then determine which user segment values that solution enough to pay.

### Evidence and progress

VertexED is not only a slide-deck concept. A public product surface already exists and presents the revision loop, its major tools, and the current private-beta pathway. The product is being built by three student co-founders: Ryan Gomez, who focuses on AI product; Pratyush Vel Shankar, who focuses on product vision; and Ritayush Dey, who focuses on engineering.

The next evidence milestone is not a larger marketing number. It is a more rigorous product test.

Before final submission, we are running structured student interviews around exam-week behavior: what tools students actually use, how they choose what to revise, how they turn a marked practice attempt into the next study action, and where realistic board-specific practice is missing. We are also testing the complete revision loop with individual students rather than only isolated features.

The metrics we care about are behavioral. Can a tester reach a first practice attempt? Do they view the feedback? Does that feedback become a concrete follow-up task? Do they complete a second revision loop within the following week? Where do they abandon the workflow? We will preserve failures as evidence instead of hiding them, because the venture only becomes stronger if the product changes in response to real behavior.

### Why this team can build it

Our team has an unusual advantage: we are also the target users. We build VertexED during the same school years in which planning collapses before mocks, subject-specific practice is inconsistent, and generic AI answers can be more tempting than useful. That gives us rapid access to the problem, but it also creates a risk of assuming our own experience represents everyone else.

We address that risk by treating user interviews and observed behavior as constraints on the product rather than validation theatre. We are building a technical product, but our most important decisions should still be falsifiable: whether students complete the loop, whether feedback changes the next action, whether the system reduces coordination rather than adding another tab, and whether the product earns repeated use.

The long-term opportunity is broader than exam-week productivity. A connected revision state can eventually help students and educators understand which interventions actually change performance over time. But we are not starting with that large claim. We are starting with one narrow promise we can demonstrate: **when a student finishes a practice attempt, VertexED should make the next useful study action obvious.**

That is the behavior we intend to prove, improve, and build a business around.

---

## 60-second introductory video script

Approximate speaking length: 135 words.

Hi, we’re Ryan Gomez, Pratyush Vel Shankar, and Ritayush Dey, the team building VertexED.

Students already have planners, past papers, flashcards, videos, and AI tutors. The problem is that none of those tools reliably turns a mistake on today’s practice into tomorrow’s study action.

VertexED connects revision into one loop: plan, focus, practise, review, and remember. A student prepares around a real exam date, completes board-shaped practice, sees exactly where marks were lost, and turns those weak concepts into scheduled retrieval instead of another forgotten feedback page.

We are starting with secondary-school exam preparation, where time is limited and realistic practice is often fragmented across tools.

VertexED is in private beta. Our next test is simple: can one connected revision loop help students spend less time deciding what to do next and more time fixing the gaps that actually cost marks?

---

## Finalization checklist

- Confirm every participating student satisfies the 14–18/high-school rule on 2027-01-14.
- Select and record the adult advisor aged 21+.
- Confirm no additional material creator needs disclosure under the competition rules.
- Choose the final pitch-round format before submission.
- Add only sourced traction, revenue, partnership, or learning-outcome metrics.
- Complete at least 10 structured interviews and 5 end-to-end loop tests.
- Export this narrative to a 3–5 page, double-spaced, 12-point PDF with 1-inch margins.
- Keep school names out of the submission unless they become genuinely critical to the concept.
