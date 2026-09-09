# Motion: trace the next attempt

Folio opening: desktop fine-pointer tilt reuses the bounded surface handler. Passive scroll moves it at most 45px over the hero's full scroll range, settling over 450ms. Focus flattens it. Explicit stage selection gets one 350ms entrance. Reduced motion and Effects off remove both. Mobile uses no perspective. No wheel interception or idle animation is added.

Planner refinement, 9 September 2026: never scroll the schedule after idle time or on a periodic clock update. “Jump to current time” is an explicit action. It uses immediate scrolling under reduced motion. Task entry and editing reuse the existing modal focus trap; native date/time controls remain available in both themes. Pressing Delete on a task does not mark it complete.

## Current implementation: fluid desk

Latest refinement: the dye field is 128 by 80 cells, with bounded curl confinement and at most eight interpolated splats per pointer event. Its blue palette changes with the actual light/dark theme; a four-pixel filter retains more detail. Existing 30fps and 2.4-second idle limits remain. Floating surfaces use at most two degrees of pointer tilt with a 400ms settle. Updates are animation-frame batched, never an idle loop. Clear tilt on focus, pointer leave, blur, resize, preference changes, hidden tabs, effects-off and unmount. Fine pointers and widths above 700px only; reduced motion, reduced transparency and forced colours turn pointer depth off. Active dock feedback is informational and remains with effects off. Tool detail changes use a finite 300ms entrance, with no autoplay, and inherit reduced-motion behaviour.

The expanded landing removes all grid masks and pointer-grid tracking. The wide desk starts at five degrees of X-axis perspective and settles towards flat over passive scroll depth, with at most 20px of translation. It becomes flat while keyboard focus is inside. New starting-point panels use the existing tabs and a finite 500ms example-sheet entrance. FAQ disclosures use native details. No added autoplay timer, revolving carousel or animation library. These details supersede the older narrow desk's Y-axis rotation below.

This section supersedes previous landing timing and cursor implementation notes. The cursor now uses a bounded 112 by 72 CPU dye grid with advection, pressure projection and dissipation. This is a small decorative simulation, not Inspira's GPU implementation or a scientific result. It updates at most about 30 times per second, stops after 2.4 idle seconds, and clears on blur, hidden tab, resize, preference change, effects-off and unmount. No WebGL dependency or background loop runs without pointer input. Touch, coarse pointers, forced colours, reduced transparency and reduced motion disable it.

Desktop desk perspective and passive scroll depth settle over 400ms, giving visual resistance while document scrolling remains native. Do not intercept wheel/touch input. The gallery's native horizontal scroll snap supplies the tactile stopping points. The glass section dock sticks below navigation. The headline arrives in 850ms, underline draws once, selected margin annotations settle in 400ms, highlights wipe once on entering view, and buttons shimmer on hover with a pressed-state ripple. No looping scramble/typewriter text. Modals enter over 350ms and preserve focus trapping, Escape, background inertness and return focus.

Effects-off and reduced motion remove animation and animated scrolling. Content is never dependent on an entrance animation to become visible. On mobile, remove the 3D desk transformation. Preserve the native pointer and text selection.

## User-requested ink effects, 8 September 2026

This explicit request supersedes the earlier no-cursor-effect and no-entrance rules on the landing only. A cobalt canvas ribbon follows fine-pointer movement with bounded interpolated points. It is a fluid-looking ink trail, not a physical fluid simulation. Keep the native cursor, pointer events and text selection. Stop drawing after one idle second, on blur, when hidden, on unmount and when effects are disabled. Cap device pixel ratio at 1.5 and points at 40. Do not run on touch, reduced-motion, reduced-transparency or forced-colour devices.

The visible Effects toggle disables all landing animation. Heading settles over 750ms, its underline draws once over 1000ms, and tab annotations move 14px over 450ms. Supported browsers introduce sections by 36px using view timelines; content never depends on animation to be visible. No scroll hijacking, random particles, flashing, autoplay carousel or endless animation. Study routes remain unaffected.

Motion explains movement between Attempt, Review and Retry. The topic and document frame stay in place. A blue line draws toward the selected stage and the answer sheet settles into position. This is the signature motion, derived from the retry workflow.

- Landing: the document is immediately readable. No entrance delay, endless animation, fake typing or random particles.
- Stage selection: the cobalt trace changes width over 220ms to follow the controlled active tab. Keep the document frame stable. Animate only the relationship, not the answer text.
- Buttons: 160ms color/border changes. No magnetic cursor, scroll hijacking, cursor replacement or hover-dependent content.
- Study tools: focus indication and state transitions only. Never move an answer while the student reads or types.
- Reduced motion: no line draw or paper translation. Content appears immediately. Reduced transparency: opaque surfaces. Keyboard users get the same content and state as pointer users.
- Do not communicate completion with motion alone. Tab labels and selected state remain available to assistive technology.

Landing refinement: the wide revision desk changes the selected tab underline and replaces the answer and margin together. The document frame remains still; no content arrival or idle animation. The anchor to the example respects the browser's normal scrolling. No scroll interception or parallax. The older compact trace may keep its 220ms line transition outside the landing.

## Apex motion extension, 9 September 2026

Apex, formerly Vee, is still by default. Hover or keyboard focus triggers one 460ms greeting, a lift of at most 7px with rotations bounded to 6 degrees. Opening his panel plays the same greeting once. Explicit Hop, Wiggle and Spin buttons add a 700ms hop with a 20px rise and soft landing, a 650ms alternating tilt bounded to 12 degrees, and an 800ms full spin with a small overshoot. Repeated presses replay the chosen action. These are transforms of the original raster, not generated pose frames. No perpetual idle animation, pointer following, wandering across answers, audio or timer.

Respect both operating-system reduced motion and the saved reduced-motion setting. Reduced motion stops active reactions, keeps the image still and disables the three play controls with a visible explanation. Simple Mode removes the character. The shortcut sheet remains static and keyboard-operable; Escape closes it and restores focus. Hiding Apex restores focus to his footer visibility control, because the floating launcher no longer exists.

## Apex direct manipulation, 9 September 2026

Apex follows pointer movement directly and does not add inertia, spring overshoot or a trailing effect. Clamp the complete launcher to an eight-pixel viewport gap. Store the final relative position only when a drag ends; do not write device storage on every pointer move. A five-pixel threshold separates a drag from opening the shortcut sheet. Arrow keys move by 16 pixels and Shift plus an arrow moves by 48 pixels. Resizing recalculates the saved relative point and keeps the launcher visible.

Blink lasts 420ms. Turn page lasts 820ms. Both swap to an appearance-matched raster frame, run once and return to the resting frame. Reduced motion disables all reaction controls and frame swaps, but never disables direct dragging or keyboard positioning.
