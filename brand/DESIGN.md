# VertexED: the revision trace

## Planner task entry, 9 September 2026

Planner creation opens in manual mode. Date, start time and duration are first-class controls; AI suggestion is an optional entry method, not a prerequisite for scheduling. Reuse AccessibleModal and native inputs. The task form has an opaque reading surface, a cobalt primary action, 16px input text and 14px labels. Date and time pickers follow the active colour scheme. Mobile stacks the fields without hiding them. Existing notebook and planner recovery states continue to preserve damaged records instead of presenting them as an empty collection.

## Identity and evidence

VertexED is a private-beta study workspace. Its objects are a topic, a timed attempt, an answer, a review, a source, and a scheduled retry. Students use Plan, Focus, Practise, Review and Remember. Preserve Paper Maker, Answer Reviewer, Study Zone and Apex as product names.

Repository inspection covered the runtime inventory, route root, shared controls, landing content, styles, logo, artifact contract, retry and loop models, architecture, recovery contract, evaluation rubric, pilot protocol, and branch history. This is a repository-wide structural inspection, not a claim to have read every imported guide or unrelated research file. `VERTEXED_REPO_ISOLATION.md` excludes portfolio research from this product. The pilot is preregistered, not evidence of learning gains. Imported guides are not editorially approved.

The existing mark is an intersecting geometric network inside a circle. Keep the asset unchanged. Its line relationships inform our trace between study stages; do not invent a new logo or recolor the raster with a filter.

## Visual thesis

### Current landing: an open revision desk

The Inspira interaction refinement keeps this composition intact. Fine-pointer input adds at most two degrees of tilt to the desk and gallery previews, with a blue light confined to the shell. Keyboard focus immediately flattens the surface. The glass dock identifies the current reading section with both a blue surface and `aria-current`, without scrolling or focusing anything automatically. Tool details pair an enlarged, explicitly labelled example with actual tool information and bounded Previous/Next controls. Modals use the same light/dark tokens as the landing even though they render outside its DOM subtree. No globe, starfield, decorative grid or additional component library is introduced.

This section supersedes earlier landing compositions below. The user explicitly rejected the background grid. Do not reintroduce decorative grids, graph paper, crosshairs or flickering squares. Functional layout grids are fine. The opening is spacious and centred, followed by a wide answer desk that restores the topic rail, answer and feedback margin on desktop. An unpatterned blue light beneath the desk supplies depth. Light uses near-white paper and cobalt; dark uses deep blue ink and brighter annotations. The headline's blue second line uses Georgia italic, extending the existing margin-handwriting convention to the hero and closing invitation. Body copy and controls retain the system-first Inter stack.

A starting-point guide routes notes, practice topics and answers to existing tools using local Radix tabs. It never generates or saves learner work. The horizontally browsable tool index uses concrete, labelled study examples rather than repeated floating icons. A native details section answers account, paper-provenance and suggested-mark questions. The comparison and interactive session split remain. `src/styles/landing.css` owns this composition and `.site-landing` scopes its palette across chrome and footer, without restyling authenticated workspaces.

The comparison opens with both answers fully readable; the slider is optional. A dedicated cobalt Exam Prep section changes the page's rhythm and keeps its example plan on an opaque reading surface. In dark mode that section uses a deeper blue and retains a dark reading surface. Native duration controls wrap at enlarged text sizes. Mobile example sheets are flat, not tilted.

The home layout must not inherit the shared `bg-transparent overflow-x-hidden` utility pair. It owns its opaque background and `overflow-x: clip` rule. A hidden/auto wrapper can become an invisible horizontal scroll container when focus changes, shifting the entire page while the document width still appears correct. The browser suite checks the computed overflow mode and wrapper scroll position, not just document width.

The headline is “You’ve read it. Now try it.” Reading text stays opaque. Depth belongs to the desk boundary and controls. Use the existing AccessibleModal for tool detail, native range for comparison and native scroll-snap for the gallery. There is no fake testimonial, grade improvement, user count or invented product screenshot. Illustrative answers, timer faces and study blocks are explicitly labelled examples, not a live timer or saved schedule. Small icons describe tool categories; they are not analytical outputs.

An exam workbook with a visible revision trace. Blue annotation lines connect the answer a student wrote to the next thing they practise. This relationship, not an AI orb or decorative dashboard, is the signature.

- Primary identity: white paper, deep blue ink, cobalt action. Shared tokens remain in `src/styles/workbook.css`. Light primary is HSL 216 75% 40%; dark primary is HSL 213 88% 73%. Do not introduce purple, teal or rainbow brand gradients.
- Preserve dark mode and accessibility preferences. Semantic error/success colors may remain; they are not brand accents.
- System-first Inter stack. Body 16px minimum on new surfaces; controls 14px; metadata 12px. Monospace is limited to stage numbers and document metadata.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64px. Radius: controls 8px, paper 12px, glass shell 24px. No arbitrary mixture of pill-shaped cards.
- White reading surfaces inside translucent blue chrome. Use glass only when overlapping layers make its purpose visible. Solid fallback for unsupported/reduced-transparency/forced-color modes.
- Landing: deliberate asymmetry, oversized task-specific headline, interactive sample answer with a linked annotation rail. Study routes: compact headers and useful controls first.
- Use lines, margins, stage numbers and highlighted passages instead of enclosing every sentence in a card.

## Native interface ideas

Latest landing direction: left-aligned oversized typography, an edition rule, a cobalt ink underline and pointer-driven ink ribbon. This is an explicit user-requested extension of the revision-trace identity. Effects frame the answer sheet without obscuring its text or adding fictional metrics. Preserve the original logo and the real tool directory. The edition text is product copy, not a release/version claim.

1. Revision trace: one topic stays anchored while a tab moves from Attempt to Review to Retry. Never imply that clicking the demonstration records real progress.
2. Annotation rail: blue ruled commentary beside an opaque answer sheet. Sources and provisional status remain visible.
3. Evidence-first state: show saved/local-only/pending/confirmed explicitly. No fabricated readiness percentages or grade predictions.

4. Dashboard retry trace: display the actual retry record's score, measured-attempt count and due date together. Label a previous score as recorded, not predicted. Do not draw a relationship to a pending mock unless an explicit data link exists. Empty retry state offers practice without pretending the learner has completed work.

## Engineering and review

### Landing refinement, 8 September 2026

The landing now uses a centred two-line editorial opening above a wide revision desk. The same topic remains visible in a left context rail, an opaque answer sheet and a right feedback margin. On tablet the noninteractive topic rail is omitted; on mobile feedback follows the answer. Georgia italic is reserved for example margin annotations, never body copy or controls. The original logo is reused unchanged. A saturated cobalt invitation closes the page; the tool directory is a compact two-column index, not a wall of cards. Landing-specific composition lives in `src/styles/landing.css`; it must not restyle authenticated tools. Minimum metadata size remains 12px. Rendered approval is pending browser-policy access.

Reuse the repository Radix tabs, AccessibleModal, existing navigation and theme controls. No new component dependency or registry import is needed for this pass. No private registry manifest was found. Read COPY.md, MOTION.md and REFERENCES.md before subsequent interface changes. Validate 1440, 1024 and 390px, keyboard tabs, reduced motion and dark mode. Preserve active user work. New factual claims require evidence and human review, not linter autofixes.

## Apex companion extension, 9 September 2026

The user requested an original VertexED sprite, then named him Apex. Apex is a small pixel-art open-workbook creature, with white pages, cobalt folded corners, ink-blue eyes, little feet and a bookmark tail. He is a secondary character, never a replacement for the circular network logo or the revision trace. His complete generated artwork and prompt are documented in `brand/SPRITE.md`. The earlier working name Vee is retired from interface copy. Existing asset URLs and CSS selectors remain stable.

Apex sits in the lower-right corner at 96px on desktop and 72px on mobile. His current form is an original 32-bit-style open workbook with cobalt covers, a triangular chest mark and crisp square-pixel shading. Paper is the white reading-surface version; Ink is the midnight version with the same blue details. This is an illustration of the revision trace, not a replacement for the product mark. A labelled button opens an opaque study-shortcut sheet. Plan, Focus and Practise lead to existing tools. Asking the AI tutor opens the existing Apex panel when available; do not add a second chat system. Only one tutor/companion launcher is shown at once. Keep him out of authentication, onboarding, admin and legal screens. Simple Mode suppresses him. The footer and shortcut sheet expose a hide control, stored only as a device preference. Three small Hop, Wiggle and Spin controls play finite reactions without changing learner data. No automated nudges, streak pressure, invented progress or learner monitoring.
