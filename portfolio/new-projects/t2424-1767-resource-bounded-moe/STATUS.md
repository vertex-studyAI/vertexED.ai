# STATUS

Project: T2424-1767  
State: CHEAP_FALSIFICATION_SCREEN_REPRODUCED  
Claim boundary: synthetic benchmark only

Evidence before promotion:
- local test run: passed (4/4)
- 20-seed synthetic benchmark: retained in `RESULTS.md`
- negative control: retained; mean relative improvement -1.010%
- GitHub Actions reproduction: passed in run `31408111421` on branch head `7a3dd47c4d4b00c57254fc4d9e88cbd4e59b3e8d`
- dedicated reproduction job: checkout, Python setup, install, tests, and 20-seed benchmark all succeeded
- repository-wide CI: pending at the time this status was recorded
- independent QA beyond the dedicated runner: pending
- real-data follow-up: required before any scientific claim
