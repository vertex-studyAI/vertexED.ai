import React, { useState } from "react";
import { pillButtonStyle, pillGroupStyle, subtleTextStyle } from "../styles";

type GraphMode = "calculator" | "threeD";

interface GraphingSuiteProps {
	accent: string;
}

const frameWrapperStyle: React.CSSProperties = {
	position: "relative",
	width: "100%",
	paddingTop: "62.5%",
	borderRadius: "20px",
	overflow: "hidden",
	border: "1px solid hsla(199, 45%, 36%, 0.18)",
	boxShadow: "0 28px 60px rgba(5, 9, 18, 0.55)",
};

const iframeStyle: React.CSSProperties = {
	position: "absolute",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	border: "0",
	background: "#0a0d16",
};

const descriptionStyle: React.CSSProperties = {
	...subtleTextStyle,
	fontSize: "13px",
	margin: 0,
};

const GraphingSuite: React.FC<GraphingSuiteProps> = ({ accent }) => {
	const [mode, setMode] = useState<GraphMode>("calculator");

	const src = mode === "calculator" ? "https://www.desmos.com/calculator?embed" : "https://www.desmos.com/3d?embed";
	const title = mode === "calculator" ? "Desmos Graphing Calculator" : "Desmos 3D Graphing";

	return (
		<div style={{ display: "grid", gap: "18px" }}>
			<div style={pillGroupStyle}>
				<button type="button" style={pillButtonStyle(mode === "calculator", accent)} onClick={() => setMode("calculator")}>
					Graphing Calculator
				</button>
				<button type="button" style={pillButtonStyle(mode === "threeD", accent)} onClick={() => setMode("threeD")}>
					3D Graphing
				</button>
			</div>

			<div style={frameWrapperStyle}>
				<iframe
					title={title}
					src={src}
					style={iframeStyle}
					allowFullScreen
					loading="lazy"
				></iframe>
			</div>

			<p style={descriptionStyle}>
				Start plotting instantly. Use the calculator tab for classics like parabolas and trig functions or switch to 3D to explore surfaces and vectors. Saved state lives locally in your browser.
			</p>
		</div>
	);
};

export default GraphingSuite;