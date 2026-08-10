# STATUS

Project: T2424-1767  
State: CHEAP_FALSIFICATION_SCREEN_REPRODUCED  
Claim boundary: synthetic benchmark only

Evidence before promotion:
- local test run: passed (4/4)
- 20-seed synthetic benchmark: retained in `RESULTS.md`
- negative control: retained; mean relative improvement -1.010%
- dedicated GitHub reproduction: passed on the original package branch, including checkout, Python setup, install, tests, and 20-seed benchmark
- configured repository build/test and browser gates: passed on the recorded original branch head
- current-main recovery branch: must pass its own exact-head gates before merge
- independent scientific QA beyond the dedicated runner: pending
- real-data follow-up: required before any scientific claim
