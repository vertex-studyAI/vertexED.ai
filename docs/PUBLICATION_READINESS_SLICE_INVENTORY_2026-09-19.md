# Publication-readiness dirty tree — proposed PR slices

Branch: `codex/vertexed-publication-readiness` @ `47b73e6c`
Dirty paths: **79**

Do **not** merge this tree wholesale. Cut slices in dependency order A→G.

**2026-09-19 agent note:** Empty Apex “Agent network” tab removed from `AIChatbot.tsx` until PR #917 lands. Global search now supports `includeAccount` (signed-out hides account tools). Smoke readiness diagnostics aligned with Gate 1b tokens. Prefer PR #918 (route-error-boundary) as the next small merge from the parallel worktree.

## A_api_agents_health_routes (2 paths)

- ` M` api/_handlers/health.js
- ` M` api/_lib/routes.js

## B_apex_agent_ui (4 paths)

- ` M` src/components/chat/ApexCommandBar.tsx
- ` M` src/components/chat/LearningPanels.tsx
- ` M` src/lib/apexAppearance.ts
- `??` src/lib/apexRoute.mjs

## C_myp_content_practice (11 paths)

- ` M` e2e/myp-learning.spec.ts
- ` M` src/components/myp/MypPracticeWorkspace.tsx
- ` M` src/content/myp5.ts
- ` M` src/content/myp5LessonExpansion.ts
- ` M` src/content/myp5Lessons.ts
- ` M` src/pages/MYPHub.tsx
- ` M` src/pages/MYPSubject.tsx
- ` M` src/styles/myp5.css
- ` M` tests/myp5-lessons.test.mjs
- `??` src/lib/mypPracticeProgress.mjs
- `??` tests/myp-practice-progress.test.mjs

## D_study_ux_pages_libs (17 paths)

- ` M` src/components/RevisionStack.tsx
- ` M` src/components/landing/RevisionHero.tsx
- ` M` src/lib/appPreferencesStorage.mjs
- ` M` src/lib/learningPanels.mjs
- ` M` src/lib/userContentStorageScope.mjs
- ` M` src/pages/AIChatbot.tsx
- ` M` src/pages/Home.tsx
- ` M` src/pages/Login.tsx
- ` M` src/pages/Main.tsx
- ` M` src/pages/StudyGuides.tsx
- ` M` src/pages/UserSettings.tsx
- `??` src/components/GlobalStudySearch.tsx
- `??` src/lib/authUi.mjs
- `??` src/lib/globalSearchIndex.ts
- `??` src/lib/landingExampleRotation.mjs
- `??` src/lib/revisionStackScore.mjs
- `??` src/lib/studyGuidePublication.mjs

## E_layout_a11y_styles (12 paths)

- ` M` src/components/AccessibleModal.tsx
- ` M` src/components/ApexCompanion.tsx
- ` M` src/components/RouteErrorBoundary.tsx
- ` M` src/components/layout/SiteLayout.tsx
- ` M` src/styles/forms.css
- ` M` src/styles/landing.css
- ` M` src/styles/navigation.css
- ` M` src/styles/study-gallery.css
- ` M` src/styles/vee.css
- ` M` src/styles/vertex-home.css
- ` M` src/styles/vertex-landing.css
- ` M` src/styles/workbook.css

## F_tests_e2e (22 paths)

- ` M` e2e/auth-return.spec.ts
- ` M` e2e/authenticated-student-golden.spec.ts
- ` M` e2e/landing-immersion.spec.ts
- ` M` e2e/local-accessibility.spec.ts
- ` M` e2e/vee-companion.spec.ts
- ` M` tests/app-preferences-storage-resilience.test.mjs
- ` M` tests/health.test.mjs
- ` M` tests/learner-state-account-storage.test.mjs
- ` M` tests/learning-panels.test.mjs
- ` M` tests/planner-dialog-accessibility.test.mjs
- ` M` tests/production-smoke-readiness.test.mjs
- ` M` tests/study-guides-access-truth.test.mjs
- ` M` tests/study-notebook-source-preview-accessibility.test.mjs
- ` M` tests/user-settings-saved-work-request.test.mjs
- ` M` tests/vercelConfig.test.mjs
- `??` tests/apex-route.test.mjs
- `??` tests/auth-ui.test.mjs
- `??` tests/global-search-index.test.mjs
- `??` tests/landing-example-rotation.test.mjs
- `??` tests/revision-stack-score.test.mjs
- `??` tests/route-error-boundary.test.mjs
- `??` tests/study-guide-publication.test.mjs

## G_docs_ci_config (11 paths)

- ` M` EXECUTION_QUEUE.md
- ` M` PROJECT_STATUS.md
- ` M` ci-evidence/npm-audit/attempt-1.status.txt
- ` M` ci-evidence/npm-audit/attempt-1.stdout.json
- ` M` ci-evidence/npm-audit/result.txt
- ` M` docs/TRUE_READINESS_CHECKLIST_2026-09-14.md
- ` M` scripts/run-test-scope.mjs
- ` M` scripts/smoke-deploy.mjs
- ` M` vercel.json
- `??` docs/CUSTOM_DOMAIN_DNS_RECOVERY_2026-09-18.md
- `??` docs/SUPABASE_GATE_1B_READINESS_2026-09-18.md

