# STATUS

Project: T2424-1863
State: NEGATIVE_OR_INCONCLUSIVE_SCREEN_RECORDED
Claim boundary: synthetic one-step diffusion only

Evidence:
- original >75% effect-size gate: FAILED
- observed 20-seed mean improvement: 67.777%
- planted coefficient 0.18 recovered as 0.179689 mean
- zero-diffusion negative control: -0.029% mean improvement
- local regression suite: passed after preserving the failed gate as a regression
- dedicated GitHub reproduction: passed on the original package branch
- configured repository build/test and browser gates: passed on the recorded original branch head
- this clean current-main branch must pass its own exact-head gates before merge
- real-data PDE follow-up and independent scientific QA: required before scientific promotion
