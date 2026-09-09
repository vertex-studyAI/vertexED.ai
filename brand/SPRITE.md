# Apex, the VertexED workbook companion

Created 9 September 2026 at the user's request. Original raster artwork generated with the built-in image-generation tool in one request. No Codex artwork, external character, reference image or proprietary graphic was supplied or copied. This is an application companion, not a new product logo.

The user subsequently named him Apex. Vee was the working name in the original generation prompt below; that prompt is preserved verbatim for provenance. The `/companions/vee.png` URL and internal `vee-` selectors are retained for compatibility, not used as interface copy. The original artwork is unchanged. Greeting, Hop, Wiggle and Spin use finite CSS transforms of that image, with reduced-motion controls and no animation library.

## Asset and implementation

- Delivered asset: `public/companions/vee.png`, 1254 by 1254 pixels, genuine alpha transparency.
- Generated master retained outside the checkout: `/Users/ryan/.codex/generated_images/01a0841e-2aa3-7851-a9fb-09d1f8a29547/exec-1968c932-d209-4f97-a9bf-a2e6a6de43f5.png`.
- UI: `src/components/ApexCompanion.tsx` and `src/styles/vee.css`.
- Shared visibility preference: `studyCompanion` in the existing `vertex_a11y_settings` device preferences. This does not add database records, tracking, AI calls or learner-state writes.
- Existing tutor integration: `SiteLayout.tsx` and `GlobalChatPanel.tsx`.
- Browser coverage: `e2e/vee-companion.spec.ts` and the Vee handoff case in `e2e/auth-return.spec.ts`.

The master is a pixel-art-style rendering, not a literal 64px source or multi-frame sprite sheet. It uses intermediate blue shades as well as the requested palette. The face and upper corners have an owl-like reading; the folded pages and bookmark establish the workbook identity. The greeting animates this one image with a finite CSS transform, not an AI-generated multi-pose animation.

## Exact generation prompt

```text
Use case: stylized-concept
Asset type: pixel-art application companion for VertexED, an existing blue-and-white student revision workspace; intended display 72–112 CSS pixels on both light and dark web backgrounds.
Primary request: Create exactly ONE original character sprite called Vee; do not render the name or any text.
Scene/backdrop: genuinely transparent alpha background, fully empty beyond the character; preserve real transparency, never paint a checkerboard.
Subject: a charming compact folded-paper/book creature. Its distinct silhouette comes from a V-shaped open workbook: two cobalt pointed folded upper corners, clean WHITE paper face/body (white, not beige), two large deep ink-blue eyes with tiny white glints, tiny cobalt arms and feet, and a small folded bookmark tail to one side. Visible paper-fold planes define the body. Expressive, approachable and clever rather than babyish.
Style/medium: 64px-game-sprite aesthetic with crisp, deliberate, hard-edged square pixel clusters and a clean readable silhouette. Flat limited-palette pixel shading; no soft gradients or painterly texture.
Composition/framing: one single subject centred; neutral friendly front/three-quarter standing pose with slight asymmetry. Entire body and bookmark tail visible. Only 8–12% transparent padding around the character; no large empty margins.
Color palette: strictly cobalt #225dcc, deep navy #132d64, blue #82b5f5 and pure white #ffffff. No purple, rainbow, beige or warm tints.
Constraints: original design; recognizably a folded open-workbook creature, not a robot, orb, generic round ghost, owl or copy of the Codex character. No text, logo, badge, watermark, floor, ground shadow, background, separate prop, extra character, variants, or sprite-sheet layout. Exactly one transparent raster sprite.
```
