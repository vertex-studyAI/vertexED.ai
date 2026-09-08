# Blue UI release candidate — 8 September 2026

## Scope

This release packages the staged blue UI, navigation, feedback accessibility, activity-storage resilience and publishable-key compatibility changes from this task. It adds final secondary-button hover states and mobile hero button sizing. It does not package the unrelated unstaged backend, notebook, synchronization and evaluation changes in the working directory.

## Validation

- Full working-copy CI passed: lint, typecheck, content inventory, production dependency audit, application and offline evaluation tests, production build and bundle budgets. The dependency audit reported zero vulnerabilities.
- An isolated archive of the staged release passed lint, typecheck and all 525 canonical application tests. This distinguishes release evidence from tests that depend on unrelated working-copy changes.
- The study-guide inventory still has 245 files, zero editorial approvals and 53 review flags. This release does not certify educational accuracy or live service behavior.

## Publication boundary

At inspection, origin/main contained 110 commits absent from this branch, while this branch had three commits absent from main. Directly replacing main with this release is unsafe. Integrate against current main and resolve overlapping changes before a production promotion. The staged UI candidate preserves the existing release branch; it is not a replacement for main.

The available Vercel CLI account is build-the-future-11, with access to build-the-future-11s-projects. Neither VertexED project appears there. Existing successful GitHub deployment statuses point to vertex-ai under pratyush-vel-shankars-projects and vertex-ed-ai under ryan-gomezs-projects-5a5ab995. The custom domain request timed out during this pass. A branch push and any resulting preview do not prove the custom domain is updated.

Previously documented exam-prep recommendation, daily rollover and completion-identity issues remain unresolved. Do not describe this candidate as a completed or fully production-certified product.
