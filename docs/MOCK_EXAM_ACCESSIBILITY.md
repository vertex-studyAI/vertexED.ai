# Mock Exam Accessibility Contract

## Scope

`MockExamMode` is a full-screen modal workflow. It must behave as a modal dialog for keyboard and assistive-technology users in its active, empty-paper, and submitted states.

## Dialog behavior

The modal:

- uses `role="dialog"` and `aria-modal="true"`;
- references a visible title through `aria-labelledby`;
- moves focus to the title when opened;
- keeps `Tab` and `Shift+Tab` within the modal;
- closes on `Escape`;
- restores focus to the previously focused element after closing;
- prevents background page scrolling while open;
- includes a visible close or return control in every state.

The focus-management hook also keeps focus on the dialog container if a future modal state has no focusable descendants.

## Generated-content labels

- The timer has `role="timer"` and a complete accessible time-remaining label without announcing every visual tick.
- Each question-navigation button reports its question number, answered state, and current step.
- The answer textarea has a programmatic label and describes the mark value when one exists.
- The rubric disclosure reports `aria-expanded` and controls the rubric-note list.
- Decorative icons are hidden from assistive technology.

## Evidence

- `tests/mock-exam-dialog-accessibility.test.mjs` verifies focusable-element filtering, Tab wrapping, Escape handling, dialog semantics, generated-content labels, and focus restoration source contracts.
- The canonical release gate verifies TypeScript, application tests, deterministic evaluations, production dependencies, and the production build.
- Live production browser certification remains required before merge.

## Standards basis

- W3C WAI-ARIA Authoring Practices Guide: Dialog (Modal) Pattern.
- W3C WAI-ARIA Authoring Practices Guide: Modal Dialog Example.
