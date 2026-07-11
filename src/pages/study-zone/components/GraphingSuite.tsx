import React, { useState } from "react";

type GraphMode = "calculator" | "threeD";

interface GraphingSuiteProps {
	accent: string;
}

const GraphingSuite: React.FC<GraphingSuiteProps> = () => {
	const [mode, setMode] = useState<GraphMode>("calculator");

	const src = mode === "calculator" ? "https://www.desmos.com/calculator?embed" : "https://www.desmos.com/3d?embed";
	const title = mode === "calculator" ? "Desmos Graphing Calculator" : "Desmos 3D Graphing";

	return (
		<div className="zone-stack">
			<div className="zone-pill-group">
				<button
					type="button"
					className="zone-pill"
					data-active={mode === "calculator"}
					onClick={() => setMode("calculator")}
				>
					Graphing Calculator
				</button>
				<button
					type="button"
					className="zone-pill"
					data-active={mode === "threeD"}
					onClick={() => setMode("threeD")}
				>
					3D Graphing
				</button>
			</div>

			<div className="zone-graph-frame">
				<iframe title={title} src={src} allowFullScreen loading="lazy" />
			</div>

			<p className="zone-subtle text-[13px] m-0">
				Start plotting right away — parabolas, trig, surfaces, vectors. Switch between 2D and 3D anytime. Your work saves locally in your browser.
			</p>
		</div>
	);
};

export default GraphingSuite;
