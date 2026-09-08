import { useState } from "react";

const stages = [
  {
    label: "Plan",
    detail: "Choose the work that deserves the next block.",
    x: "10%",
    y: "72%",
  },
  {
    label: "Focus",
    detail: "Run the session without rebuilding the setup.",
    x: "28%",
    y: "35%",
  },
  {
    label: "Practise",
    detail: "Work in the shape of the paper you will sit.",
    x: "51%",
    y: "58%",
  },
  {
    label: "Review",
    detail: "Find where the marks went and what caused the miss.",
    x: "70%",
    y: "25%",
  },
  {
    label: "Remember",
    detail: "Bring the weak topic back before it fades.",
    x: "87%",
    y: "62%",
  },
] as const;

export default function VertexLearningField() {
  const [active, setActive] = useState(2);
  const activeStage = stages[active];

  return (
    <div className="vertex-field" aria-label="VertexED study trajectory">
      <div className="vertex-field-aura" aria-hidden="true" />
      <svg
        className="vertex-field-lines"
        viewBox="0 0 800 500"
        role="img"
        aria-label="A connected path from planning through focus, practice, review, and retrieval"
      >
        <defs>
          <linearGradient id="vertex-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="0.48" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <path
          className="vertex-field-track"
          d="M70 360 C150 115 245 145 300 290 C355 430 455 365 510 180 C565 0 660 110 735 310"
        />
        <path
          className="vertex-field-flow"
          d="M70 360 C150 115 245 145 300 290 C355 430 455 365 510 180 C565 0 660 110 735 310"
          stroke="url(#vertex-flow)"
        />
      </svg>

      <div className="vertex-field-core" aria-live="polite">
        <span>Current stage</span>
        <strong>{activeStage.label}</strong>
        <p>{activeStage.detail}</p>
      </div>

      <ol className="vertex-field-stages">
        {stages.map((stage, index) => (
          <li
            key={stage.label}
            className="vertex-field-stage"
            style={{ left: stage.x, top: stage.y }}
          >
            <button
              type="button"
              className={index === active ? "is-active" : ""}
              aria-pressed={index === active}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <span className="vertex-stage-index">0{index + 1}</span>
              <span>{stage.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="vertex-field-caption" aria-hidden="true">
        <span>One study loop</span>
        <span>Evidence carries forward</span>
      </div>
    </div>
  );
}
