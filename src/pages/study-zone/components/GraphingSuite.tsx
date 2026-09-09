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
				Plot functions, surfaces, and vectors without leaving your study session. Desmos controls whether a graph is retained, so export or copy anything you need to keep.
			</p>
		</div>
	);
};

export default GraphingSuite;
