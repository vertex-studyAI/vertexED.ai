# Study Plan HTML — Generation Process

## How to invoke

Tell Claude: "Generate a study plan HTML from `Geography_Notes/<filename>.txt`"

Claude will read `study_plan_template.html` (small — CSS + JS only, no content) and the notes file, then write a new `wiki/study_plan/<topic-slug>.html`.

---

## What the template contains (do NOT re-read `natural-hazards.html`)

`study_plan_template.html` has:
- Full CSS — identical across all study plans, never changes
- Empty `<nav>` with placeholder comment
- Empty `<main>` with placeholder comment
- Full static sidebar HTML
- Full JS render functions (`buildList`, `selectQ`, `filterQ`, `toggle`, nav scroll)
- Empty `const QS = []` placeholder — this is the only JS that changes per topic

Only three things are topic-specific:
1. `<title>` and `<h1>`
2. `<nav>` links and `<main>` content sections
3. The `QS` array in `<script>`

---

## Section structure (adapt to the notes content)

| Section id | What goes in it |
|---|---|
| `#overview` | Card grid (2–4 topic cards) + alert explaining the core link between topics |
| `#<topic-a>` | Accordions + formula boxes for each key concept, drawn directly from notes |
| `#<topic-b>` | Comparison table or chain blocks for second topic |
| `#extraction` / `#tectonic` | `.chain` cause-effect blocks for impact questions |
| `#models` | `.model-answer` blocks — one per past paper question with mark breakdown chips |
| `#essay` | `.essay-para` blocks (ep-intro, ep-yes×2, ep-counter×2, ep-conc) + transition boxes |
| `#plan` | 5 `.day-card` blocks (D1–D5) with `.task-list` items |
| `#stats` | `.stat-grid` with one `.stat-item` per case study or statistic |
| `#tracker` | `.card` groups with `.progress-row` + `.cb` checkboxes |

---

## QS array — sidebar question bank rules

```js
{
  id: 'unique-string',          // e.g. 'dev1', 'glob2'
  session: 'Practice' | 'M24', // exam session or 'Practice' for notes questions
  ref: 'Dev Q1',                // display label in sidebar
  marks: '4',                   // mark value as string (use '—' for IA)
  size: 'short' | 'mid' | 'long',  // short=1–4m, mid=6–8m, long=16–24m
  cmd: 'Explain',               // command term
  q: 'Full question text',
  status: 'yes' | 'partial' | 'no',
  why: null,                    // if status='no': reason why source is needed
  partialNote: null,            // if status='partial': what's missing
  answer: `HTML string`,        // if status='yes' or 'partial'
  chips: ['Topic','Tag']
}
```

**Status rules:**
- `yes` — the notes contain a complete answer; write the full model answer in `answer`
- `partial` — notes cover part of it but an exam source (graph, map, specific data) is also needed; set `partialNote` and write what IS answerable in `answer`
- `no` — answer requires the specific exam paper source; set `why`, leave `answer: null`

---

## Naming convention

Output file: `wiki/study_plan/{topic-slug}.html`

Derive the slug from the dominant topic(s) in the notes:
- `notes-1.txt` → development + globalisation → `development-globalisation.html`
- `notes-2.txt` → urban environments → `urban-environments.html`
- `notes-3.txt` → climate + biomes → `climate-biomes.html`

---

## After generating

1. Update `wiki/CLAUDE.md` — add the new study plan to the list of available resources so future agents know it exists.
2. **Add the new plan to the Geography wiki sidebar.** Edit `wiki/index.html` and append a new `<div class="nav-item">` inside `<div class="nav-group" id="group-study-plans">` (around line 190). Pattern:
   ```html
   <div class="nav-item" onclick="window.open('study_plan/<topic-slug>.html','_blank')" style="cursor:pointer;"><Display Name></div>
   ```
   Without this step the plan exists on disk but is unreachable from the wiki UI.

---

## Existing study plans

| File | Topics | Source notes |
|---|---|---|
| `natural-hazards.html` | GIS in tectonic management + income disparity | Built from session files |
| `development-globalisation.html` | HDI/GNI, primary sector, globalisation, resource extraction, tectonic impacts | `Geography_Notes/notes-1.txt` |
