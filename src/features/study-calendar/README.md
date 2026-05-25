# Study Planner (Pulse calendar port)

This feature brings the Pulse-style calendar (month grid + day/week schedule) and a time-left widget into Vertex, themed with Vertex colors.

AI task generation isn’t wired yet. If you want Gemini-based natural-language task creation like Pulse:
- Add @google/generative-ai as a dependency.
- Provide a Gemini API key via an environment variable and create an integration in this feature.

Files:
- components/Calendar.tsx — Month calendar grid
- components/Schedule.tsx — Day/Week time grid with tasks
- components/Tabs.tsx — Week tab markers
- components/TimeLeftWidget.tsx — Progress bars for hour/day/week
- styles/planner.css — Local styles using Vertex HSL tokens
- PlannerView.tsx — Composes the planner UI; used by pages/StudyPlanner.tsx

Styling depends on the design tokens in src/index.css (HSL variables). Adjust as needed.
