# Calendar interoperability

The planner imports `.ics` files as fixed commitments. A preview excludes
overlaps and duplicates before the learner adds anything. Calendar name, event
identity and account identity make repeated imports idempotent; changed events
are reported for review instead of overwriting an existing commitment.

Imports support timed UTC, floating local and IANA-zone events, including
bounded weekly repeats. Zone conversion preserves weekly wall time across DST.
Ambiguous or nonexistent local times, unbounded recurrence, recurrence
exceptions, all-day entries and entries crossing local midnight are rejected
with an explanation. Files are limited to 1 MB and 1,000 occurrences.

Only titles and times are retained. Descriptions, attendees, URLs and reminders
are excluded. Imports use the existing account-scoped planner persistence and
save status. Cancelling a pending read or switching accounts prevents a late
import; a plan changed since preview must be reviewed again. Removing a named
import removes only its commitments, after confirmation.

Calendar export retains the existing privacy controls and optional native
calendar reminders. The planner also catches up missed study tasks when the
app resumes, regains focus or reconnects. These features do not implement live
Google/Outlook synchronisation or a server scheduler while the app is closed.

## Verification

Unit coverage checks parsing, DST transitions, rejection paths, account-scoped
identity, conflicts, duplicates and cancelled events. Browser coverage checks
import, saved persistence, reimport, removal, cancellation, export privacy and
reminders at 1440, 1024 and 390 pixels, with keyboard and reduced motion.
The corrected offline/calendar suite passed all 11 cases on 14 October 2026.
