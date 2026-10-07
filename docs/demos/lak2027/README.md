# LAK27 observation handling demonstration

This package contains a working local demonstration, a 200-word abstract in the
official companion template (DOCX and PDF), and a captioned movie of the executed
example. It is a proposal package for review. The pull request is unmerged, and
neither the project nor its conference submission is complete.

## Run the actual demonstration

From the repository root, serve files locally:

```bash
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/docs/demos/lak2027/index.html`. No account, credentials,
network provider, learner data or application build is needed. The page imports
the repository's real `src/lib/pilotAnalyticsCore.mjs`; it does not substitute a
second implementation. All six input records are constructed and visible in
`fixture.mjs`. Nothing is saved to a user account.

The example moves from three accepted and three rejected records to two accepted
and four rejected when a measured zero is replaced with a missing value. Restoring
the zero restores the record. Withdrawing example A removes both of its sessions,
leaving one accepted session and three rejected records. Reset restores the
fixture. The downloaded aggregate excludes participant and session rows. That
exclusion alone does not establish anonymity for a real small cohort.

## Review the conference assets

- [Proposal PDF](LAK27_Demo_Proposal.pdf) and [editable proposal](LAK27_Demo_Proposal.docx).
- [Exactly 200 abstract words](abstract.txt), excluding the title and `ABSTRACT` label.
- [Captioned walkthrough](walkthrough.mp4), 110 seconds, no audio.
- [Captions](captions.srt) and [executed verification](verification.json).

The movie is a captioned sequence of five screenshots from the executed browser
workflow, held long enough to read. It is not an unedited live recording.
The final review inspected 1440px light, 1024px dark, and 390px with reduced motion;
the mobile correction keeps the margin inside its paper and labels the scrolling
table. Space activates the missing-score control in both directions. The actual
download was parsed and checked for row/identifier exclusion.

To repeat the browser checks using the repository's existing Playwright dependency:

```bash
node docs/demos/lak2027/verify_demo.mjs /tmp/vertexed-lak-demo-new
python docs/demos/lak2027/build_movie.py /tmp/vertexed-lak-demo-new /tmp/lak-walkthrough.mp4
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an already installed Chromium
binary. The retained execution used the provided headless-shell binary because
the full browser's process-singleton socket was unavailable in this environment.
The local copy-lint invocation could not load TypeScript; this is recorded, not
reported as a passing lint. The final hosted repository check must be consulted.

## Venue requirements verified on 7 October 2026

The [LAK27 submission guidelines](https://www.solaresearch.org/events/lak/lak27/submission-guidelines/)
require a 200-word abstract, a movie link, the companion template and a movie no
longer than five minutes. Interactive demonstrations are not blinded. The
[general call](https://www.solaresearch.org/events/lak/lak27/general-call/)
sets 9 November 2026 at 23:59 AoE for posters/demos (10 November at 17:29 IST).
The call expects a meaningful connection to learners, learning processes and
stakeholder action. The proposal ties observation handling to reviewing an
incomplete retry and repairing absent observations; fit and novelty still need
the author's substantive review. It does not replace actual learner evidence
required by a practitioner or efficacy report.

The [official DOCX template](https://www.solaresearch.org/wp-content/uploads/2026/07/LAK27_Companion_Proceedings_Template.docx)
was downloaded as 176,478 bytes with SHA-256
`8db958ada6e96efd2c67d915354b0b8ba3865944bee7b8520cec7d9b16953a59`.
Its A4 layout, JLA styles, header and footer were retained. The proposal includes
an AI-use disclosure, as required by the call. No affiliation, email, institutional
partner, learner benefit, production readiness or acceptance is invented.

## Remaining work before submission

Review contribution/author attribution, confirm presenter details, assess venue
fit against the full call, integrate the reviewed GitHub change, and obtain the
final submission instruction. No EasyChair submission or registration was made.
The production-domain/provider issues and actual pilot protocol remain separate
from this local demonstration.
