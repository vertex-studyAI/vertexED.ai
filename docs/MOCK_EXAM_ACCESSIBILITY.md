# Mock Exam Accessibility Contract

## Scope

`MockExamMode` is a full-screen modal workflow. It must behave as a modal dialog for keyboard and assistive-technology users in its active, empty-paper, and submitted states.

## Shared dialog behavior

The mock exam uses the same `AccessibleModal` and `modalFocus.mjs` foundation as the planner dialogs. The shared modal:

- uses `role="dialog"` and `aria-modal="true"`;
- references visible title and description elements;
- moves focus to the title when opened;
- keeps `Tab` and `Shift+Tab` within the modal;
- closes on `Escape`;
- restores focus to the previously focused element after closing;
- includes a visible close or return control in every state.

`AccessibleModal` now accepts an optional `overlayClassName`. Planner dialogs retain the existing `blur-background` default, while mock exams provide self-contained Tailwind overlay classes and do not depend on planner-only CSS being loaded.

## Generated-content labels

- The timer has `role="timer"` and a complete accessible time-remaining label while the rapidly changing visual digits remain hidden from assistive technology.
- Each question-navigation button reports its question number, answered state, and current step.
- The answer textarea has a programmatic label and describes the mark value when one exists.
- The rubric disclosure reports `aria-expanded` and controls the rubric-note list.
- Decorative icons are hidden from assistive technology.

## Evidence

- Existing shared-modal unit and Playwright coverage verifies initial focus, Tab containment, Escape close, and return focus.
- `tests/mock-exam-dialog-accessibility.test.mjs` verifies that all three mock-exam states reuse the shared modal, that overlays are self-contained, and that generated content has the required labels.
- The canonical release gate verifies TypeScript, application tests, deterministic evaluations, production dependencies, and the production build.
- Live production browser certification remains required before merge.

## Standards basis

- W3C WAI-ARIA Authoring Practices Guide: Dialog (Modal) Pattern.
- W3C WAI-ARIA Authoring Practices Guide: Modal Dialog Example.
