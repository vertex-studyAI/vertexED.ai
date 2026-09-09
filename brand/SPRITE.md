# Apex, the VertexED workbook companion

Created 9 September 2026 at the user's request. Original raster artwork generated with the built-in image-generation tool in one request. No Codex artwork, external character, reference image or proprietary graphic was supplied or copied. This is an application companion, not a new product logo.

The user subsequently named him Apex. Vee was the working name in the original generation prompt below; that prompt is preserved for provenance. The original `/companions/vee.png` URL and internal `vee-` selectors are retained for compatibility, not used as interface copy. The active artwork is the original `apex-v2.png` vertex companion. Greeting, Hop, Wiggle and Spin use finite CSS transforms of that image, with reduced-motion controls and no animation library.

## Asset and implementation

- Active assets: `public/companions/apex-paper-v3.png` and `public/companions/apex-ink-v3.png`, each 1254 by 1254 pixels with genuine alpha transparency.
- Paper is the default. Ink is an alternate midnight reading surface. This choice is stored only in the existing device-preferences object.
- Previous assets: `public/companions/apex-v2.png` and `public/companions/vee.png`, retained for rollback and compatibility.
- Generated masters retained outside the checkout: `/Users/ryan/.codex/generated_images/01a075cb-d93d-7731-a7a1-cddfefafd58f/exec-56b32f2c-ec5f-40c6-b4ff-9a3ce0ecbb70.png` and `/Users/ryan/.codex/generated_images/01a075cb-d93d-7731-a7a1-cddfefafd58f/exec-b341627e-cd40-44eb-8084-9351d42086c5.png`.
- UI: `src/components/ApexCompanion.tsx` and `src/styles/vee.css`.
- Shared visibility preference: `studyCompanion` in the existing `vertex_a11y_settings` device preferences. This does not add database records, tracking, AI calls or learner-state writes.
- Existing tutor integration: `SiteLayout.tsx` and `GlobalChatPanel.tsx`.
- Browser coverage: `e2e/vee-companion.spec.ts` and the Vee handoff case in `e2e/auth-return.spec.ts`.

The active masters are 32-bit-style pixel illustrations, not literal 32px source sprites or multi-frame sheets. They use intentional square clusters and a restricted cobalt, sky-blue, navy and white palette. Paper and Ink preserve the same silhouette so an appearance change is not a character change. The greeting animates each image with a finite CSS transform. Blink and Turn page use generated pose frames and return to the resting asset.

## Animation frames, 9 September 2026

- `public/companions/apex-paper-blink-v4.png`, master `/Users/ryan/.codex/generated_images/01a075cb-d93d-7731-a7a1-cddfefafd58f/exec-3c35ca08-fdd0-431d-92bd-6ac55fa72974.png`
- `public/companions/apex-ink-blink-v4.png`, master `/Users/ryan/.codex/generated_images/01a075cb-d93d-7731-a7a1-cddfefafd58f/exec-b68f7964-5a49-45b4-b354-95e10cd0c386.png`
- `public/companions/apex-paper-page-turn-v4.png`, master `/Users/ryan/.codex/generated_images/01a075cb-d93d-7731-a7a1-cddfefafd58f/exec-bb42d933-e654-4517-9b2b-0044c6083dec.png`
- `public/companions/apex-ink-page-turn-v4.png`, master `/Users/ryan/.codex/generated_images/01a075cb-d93d-7731-a7a1-cddfefafd58f/exec-2fda01eb-db65-461f-87a8-d0d9df967b37.png`

All final files are 1254 by 1254 RGBA PNGs with verified alpha. The first Ink page-turn output painted a checkerboard and was rejected. The final Ink frame used the background-extraction correction below.

### Exact Paper blink prompt

```text
Use case: precise-object-edit
Asset type: transparent raster animation frame for the Apex web companion
Input image: the existing Paper Apex sprite is the edit target and identity reference.
Primary request: create a blink frame. Change only the expression so both eyes are gently closed as short dark-navy horizontal pixel lines, and lift the bookmark tail very slightly as if acknowledging the learner.
Style/medium: preserve the exact 32-bit pixel-art treatment, hard square pixel clusters, shading, silhouette, proportions, pose, and camera.
Composition/framing: preserve the exact square canvas, character size, centre, and transparent padding so it overlays the base frame without jumping.
Color palette: preserve the existing pure white, cobalt, sky blue, and deep navy only.
Constraints: genuine transparent alpha background; exactly one character; no text; no shadow; no new prop; no extra limbs; no sprite sheet. Keep the face, cover, pages, feet, triangular chest mark, and overall identity unchanged except the specified eyes and subtle tail lift.
Avoid: anti-aliased repainting, blur, gradients beyond the existing sprite, warm colours, black background, checkerboard, watermark.
```

### Exact Ink blink prompt

```text
Use case: precise-object-edit
Asset type: transparent raster animation frame for the Apex web companion
Input image: the existing Ink Apex sprite is the edit target and identity reference.
Primary request: create a blink frame. Change only the expression so both eyes are gently closed as short bright-blue horizontal pixel lines, and lift the bookmark tail very slightly as if acknowledging the learner.
Style/medium: preserve the exact 32-bit pixel-art treatment, hard square pixel clusters, shading, silhouette, proportions, pose, and camera.
Composition/framing: preserve the exact square canvas, character size, centre, and transparent padding so it overlays the base frame without jumping.
Color palette: preserve the existing midnight navy, cobalt, sky blue, and white only.
Constraints: genuine transparent alpha background; exactly one character; no text; no shadow; no new prop; no extra limbs; no sprite sheet. Keep the face, cover, pages, feet, triangular chest mark, and overall identity unchanged except the specified eyes and subtle tail lift.
Avoid: anti-aliased repainting, blur, warm colours, black background, checkerboard, watermark.
```

### Exact Paper page-turn prompt

```text
Use case: precise-object-edit
Asset type: transparent raster animation frame for the Apex web companion
Input image: the existing Paper Apex sprite is the edit target and identity reference.
Primary request: create a page-turn action frame. Raise one thin white page from the upper centre of the open workbook in a small curved pixel-art flip, angle the bookmark tail upward, and make the eyes look up toward the moving page. Keep the change restrained and readable at 72 pixels.
Style/medium: preserve the exact 32-bit pixel-art treatment, hard square pixel clusters, shading, silhouette, proportions, and camera.
Composition/framing: preserve the exact square canvas, character size, centre, feet position, and transparent padding so it overlays the base frame without jumping.
Color palette: preserve the existing pure white, cobalt, sky blue, and deep navy only.
Constraints: genuine transparent alpha background; exactly one character; one attached turning page only; no text; no shadow; no separate prop; no extra limbs; no sprite sheet. Keep the cover, face shape, feet, triangular chest mark, and identity unchanged.
Avoid: paper flying away, anti-aliased repainting, blur, warm colours, black background, checkerboard, watermark.
```

### Exact Ink page-turn prompt

```text
Use case: precise-object-edit
Asset type: transparent raster animation frame for the Apex web companion
Input image: the existing Ink Apex sprite is the edit target and identity reference.
Primary request: create a page-turn action frame. Raise one thin midnight-blue page with a bright sky-blue edge from the upper centre of the open workbook in a small curved pixel-art flip, angle the bookmark tail upward, and make the eyes look up toward the moving page. Keep the change restrained and readable at 72 pixels.
Style/medium: preserve the exact 32-bit pixel-art treatment, hard square pixel clusters, shading, silhouette, proportions, and camera.
Composition/framing: preserve the exact square canvas, character size, centre, feet position, and transparent padding so it overlays the base frame without jumping.
Color palette: preserve the existing midnight navy, cobalt, sky blue, and white only.
Constraints: genuine transparent alpha background; exactly one character; one attached turning page only; no text; no shadow; no separate prop; no extra limbs; no sprite sheet. Keep the cover, face shape, feet, triangular chest mark, and identity unchanged.
Avoid: paper flying away, anti-aliased repainting, blur, warm colours, black background, checkerboard, watermark.
```

### Exact Ink alpha correction prompt

```text
Use case: background-extraction
Asset type: corrected transparent raster animation frame for the Apex web companion
Primary request: remove the entire grey checkerboard background and replace it with genuine alpha transparency.
Constraints: change only the background. Preserve every character pixel, pose, dimensions, placement, page-turn shape, face, palette, pixel edges, and transparent padding exactly. Return one PNG with actual alpha transparency.
Avoid: checkerboard pixels, solid background, crop, repaint, smoothing, blur, shadow, text, watermark.
```

## Original generation prompt: Vee (archived)

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

## Exact generation prompt: Apex v2

```text
Use case: stylized-concept
Asset type: transparent PNG mascot sprite for the VertexED ed-tech web app
Primary request: Create Apex, an original compact study companion with a distinctive vertex / triangular prism silhouette. A friendly small floating creature, not human, not animal-derived, with a faceted blue-and-white body, a single subtle glowing cyan study-core at its center, small orbiting page-tab fins, and a calm focused expression. It should feel like a rigorous study partner rather than a gaming mascot.
Scene/backdrop: genuinely transparent background, no shadow plate
Style/medium: premium polished 3D-meets-illustration, clean vector-like silhouette and crisp material rendering, designed to read beautifully at 72-112px
Composition/framing: full character centered, square canvas, generous transparent margin
Lighting/mood: clear cool studio lighting, quietly energetic
Color palette: VertexED cobalt blue, royal blue, cyan accent, white, very small navy outlines only
Text: none
Constraints: make it an entirely new original character; no owl, no bird, no robot with a face screen, no resemblance to Codex, no logos, no lettering, no watermark
Avoid: generic AI mascot, corporate stock illustration, black background, grid background, overly cute childlike expression, hands, busy details
```
