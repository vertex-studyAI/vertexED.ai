# VertexED Motion System

## Principle

VertexED should feel continuous, responsive, and liquid without looking soft or decorative. Motion exists to preserve context between study objects and explain change.

The landing page can be expressive. Focused product workflows should be quieter.

## Motion vocabulary

### Carry

An object keeps visual identity while moving into the next workflow state. Example: a weak topic from Answer Reviewer can carry into a new planner task.

### Trace

A thin blue trajectory reveals the relationship between Plan, Focus, Practise, Review, and Remember.

### Focus

Selecting an object increases its clarity while nearby context compresses or fades. Do not make the surrounding interface disappear completely.

### Flow

Containers may reshape, expand, and contract instead of being abruptly replaced. Use shared spatial origin whenever possible.

### Resolve

A completed action settles into a quieter state instead of celebrating with confetti or large decorative motion.

## Timing

Micro interaction: 90 to 180ms

- hover
- press
- focus
- checkbox
- compact toggle

Interface transition: 180 to 360ms

- tab
- drawer
- contextual panel
- selected study object
- compact navigation change

Expressive transition: 420 to 1000ms

- landing section transition
- major shared-layout transformation
- Vertex Field reveal
- narrative product demonstration

Longer motion needs a clear storytelling or spatial reason.

## Easing

Prefer curves with fast intent and controlled settling. Avoid spring motion as the universal default.

Suggested families:

- enter: cubic-bezier(0.16, 1, 0.3, 1)
- move: cubic-bezier(0.22, 1, 0.36, 1)
- exit: cubic-bezier(0.4, 0, 1, 1)

Tune per interaction after rendering. The values are a starting vocabulary, not a requirement to make every transition identical.

## Landing choreography

The landing experience should behave as one connected study trajectory.

Good uses:

- the hero trajectory continues into the next section
- study stages become interface fragments as the user scrolls
- selected stages cause related text and product objects to respond
- blue field geometry changes with section context
- interface previews retain spatial origin between states
- large typography may mask or reveal the field when readability remains strong

Do not create a collection of unrelated animation tricks.

## Liquid behavior

Liquid means continuity, not blobs.

Good:

- one panel becoming another state
- geometry stretching along the study path
- blue light following a real active connection
- a task chip becoming the header of its destination
- a context ribbon compressing during focus

Bad:

- gooey buttons
- random blobs
- cursor trails with no meaning
- floating particles
- constant ambient movement

## Scroll

Scroll-linked effects must remain usable with a trackpad, mouse wheel, touch, keyboard, and reduced-motion preferences.

Do not hijack scrolling.

Avoid locking the user into long animation sequences. Prefer progressive transformation based on normal document flow.

## Hover

Hover can reveal depth, relationship, or action. It must not be required to understand core content.

Prefer small translation, border response, field activation, and text contrast changes over scaling every card.

## Navigation

Navigation transitions should preserve location. The Context Ribbon or equivalent may carry subject and topic identity across related routes.

Do not delay route entry for a cinematic animation.

## Loading

Loading states should show structure, not generic pulsing rectangles everywhere. Skeletons should resemble the incoming content. When progress is knowable, expose it directly.

## Data motion

When charts or mastery views change range, preserve object identity and animate between states if the mapping is truthful. Do not animate fabricated intermediate values as if they were measurements.

## Reduced motion

`prefers-reduced-motion: reduce` is mandatory.

When reduced motion is enabled:

- remove parallax
- remove continuous field drift
- replace morphs with direct state changes or short fades
- remove scale-heavy transitions
- retain focus, selected, and progress state through static contrast

The product must remain fully understandable without motion.

## Performance rules

Prefer transform and opacity for frequent animation.

Avoid:

- layout thrashing on scroll
- unbounded requestAnimationFrame loops
- several simultaneous canvas effects
- large WebGL scenes for decorative value
- high-resolution video used as background texture

Heavy landing effects should lazy load, pause when offscreen where possible, and degrade cleanly on constrained devices.

## Motion test

For every visible effect ask:

1. What changed?
2. Why should the user notice?
3. Does the motion preserve or explain context?
4. Does it remain clear without motion?
5. Is it worth the performance cost?

If the effect has no good answer, remove it.