import React, { useCallback, useEffect, useState } from "react";
import { subtleTextStyle } from "../styles";

const allowedPattern = /^[0-9+\-*/().^a-zA-Z]*$/;

const replaceFunctions = (expression: string) =>
	expression
		.replace(/sin\(/g, "Math.sin(")
		.replace(/cos\(/g, "Math.cos(")
		.replace(/tan\(/g, "Math.tan(")
		.replace(/sqrt\(/g, "Math.sqrt(")
		.replace(/abs\(/g, "Math.abs(")
		.replace(/log\(/g, "Math.log10(")
		.replace(/ln\(/g, "Math.log(");

const evaluateExpression = (raw: string) => {
	if (!raw || !allowedPattern.test(raw)) {
		throw new Error("Invalid characters");
	}

	const normalized = replaceFunctions(raw)
		.replace(/\bpi\b/gi, "Math.PI")
		.replace(/\be\b/g, "Math.E")
		.replace(/\^/g, "**");

	// eslint-disable-next-line no-new-func
	const fn = new Function(`return (${normalized})`);
	const result = fn();
	if (typeof result !== "number" || Number.isNaN(result) || !Number.isFinite(result)) {
		throw new Error("Invalid result");
	}
	return result;
};

interface CalculatorProps {
	accent: string;
}

const keypadGridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
	gap: "10px",
};

const buttonStyle = (accent: string, variant: "primary" | "neutral" | "danger" = "neutral"): React.CSSProperties => {
	if (variant === "primary") {
		return {
			padding: "14px",
			borderRadius: "14px",
			border: "none",
			background: accent,
			color: "#0b0d14",
			fontWeight: 600,
			fontSize: "16px",
			cursor: "pointer",
			boxShadow: "0 18px 38px rgba(0,0,0,0.45)",
			transition: "transform 0.18s ease, box-shadow 0.18s ease",
		};
	}
	if (variant === "danger") {
		return {
			padding: "14px",
			borderRadius: "14px",
			border: "1px solid rgba(255, 130, 130, 0.4)",
			background: "rgba(255, 130, 130, 0.18)",
			color: "#FFB3C6",
			fontWeight: 600,
			cursor: "pointer",
			transition: "transform 0.18s ease, box-shadow 0.18s ease",
		};
	}
	return {
		padding: "14px",
		borderRadius: "14px",
		border: "1px solid rgba(255,255,255,0.08)",
		background: "rgba(15,17,27,0.74)",
		color: "#E7EAFF",
		fontWeight: 600,
		fontSize: "15px",
		cursor: "pointer",
		transition: "transform 0.18s ease, box-shadow 0.18s ease",
	};
};

const displayStyle: React.CSSProperties = {
	background: "linear-gradient(135deg, rgba(8,10,18,0.82), rgba(18,20,32,0.88))",
	border: "1px solid rgba(255,255,255,0.08)",
	borderRadius: "18px",
	padding: "18px",
	minHeight: "80px",
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	wordBreak: "break-word",
};

const expressionStyle: React.CSSProperties = {
	color: "#F5F7FF",
	fontSize: "18px",
	fontFamily: "'JetBrains Mono', monospace",
};

const resultStyle: React.CSSProperties = {
	color: "rgba(231,234,255,0.6)",
	fontSize: "14px",
	marginTop: "6px",
	minHeight: "18px",
};

const Calculator: React.FC<CalculatorProps> = ({ accent }) => {
		const [input, setInput] = useState("");
		const [error, setError] = useState<string | null>(null);

		const appendValue = useCallback((value: string) => {
			setInput((prev) => prev + value);
			setError(null);
		}, []);

		const clear = useCallback(() => {
			setInput("");
			setError(null);
		}, []);

		const backspace = useCallback(() => {
			setInput((prev) => prev.slice(0, -1));
			setError(null);
		}, []);

			const calculate = useCallback(() => {
				setInput((prev) => {
					try {
						const result = evaluateExpression(prev);
						setError(null);
						return String(result);
					} catch (err) {
						console.error("Calculator error:", err);
						setError("Invalid expression");
						return prev;
					}
				});
			}, []);

		useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key.match(/[0-9]/)) {
					appendValue(event.key);
					return;
				}
				if (["+", "-", "*", "/", ".", "(", ")"].includes(event.key)) {
					appendValue(event.key);
					return;
				}
				if (event.key === "Enter") {
					event.preventDefault();
					calculate();
					return;
				}
				if (event.key === "Backspace") {
					event.preventDefault();
					backspace();
				}
			};

			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		}, [appendValue, backspace, calculate]);

	return (
		<div style={{ display: "grid", gap: "18px" }}>
			<div>
				<h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Scientific Calculator</h2>
				<p style={subtleTextStyle}>Includes trig, logarithms, square roots, constants, and more.</p>
			</div>

			<div style={displayStyle}>
				<div style={expressionStyle}>{input || "0"}</div>
						<div style={{ ...resultStyle, color: error ? "#FF7A85" : resultStyle.color }}>
							{error ?? "Press Enter or = to evaluate"}
						</div>
			</div>

			<div style={keypadGridStyle}>
						{["sin", "cos", "tan", "(", ")"].map((value) => (
					<button key={value} type="button" style={buttonStyle(accent)} onClick={() => appendValue(`${value}${value.length === 3 ? "(" : ""}`)}>
						{value}
					</button>
				))}
						{["log", "ln", "sqrt", "^", "Del"].map((value) => (
					<button
						key={value}
						type="button"
						style={value === "Del" ? buttonStyle(accent, "danger") : buttonStyle(accent)}
						onClick={() => {
							if (value === "Del") {
								backspace();
									} else if (value === "^") {
										appendValue("^");
									} else if (value === "sqrt") {
										appendValue("sqrt(");
									} else {
										appendValue(`${value}(`);
							}
						}}
					>
						{value === "sqrt" ? "√" : value}
					</button>
				))}
				{["7", "8", "9", "/", "C"].map((value) => (
					<button
						key={value}
						type="button"
						style={value === "C" ? buttonStyle(accent, "danger") : buttonStyle(accent)}
						onClick={() => {
							if (value === "C") {
								clear();
							} else {
								appendValue(value === "/" ? "/" : value);
							}
						}}
					>
						{value === "/" ? "÷" : value}
					</button>
				))}
				{["4", "5", "6", "*", "pi"].map((value) => (
					<button
						key={value}
						type="button"
						style={buttonStyle(accent)}
						onClick={() => appendValue(value === "*" ? "*" : value === "pi" ? "pi" : value)}
					>
						{value === "*" ? "×" : value === "pi" ? "π" : value}
					</button>
				))}
				{["1", "2", "3", "-", "e"].map((value) => (
					<button
						key={value}
						type="button"
						style={buttonStyle(accent)}
						onClick={() => appendValue(value === "-" ? "-" : value)}
					>
						{value}
					</button>
				))}
				{["0", ".", "=", "+", "abs"].map((value) => (
					<button
						key={value}
						type="button"
						style={value === "=" ? buttonStyle(accent, "primary") : buttonStyle(accent)}
						onClick={() => {
							if (value === "=") {
								calculate();
							} else if (value === "abs") {
								appendValue("abs(");
							} else {
								appendValue(value === "+" ? "+" : value);
							}
						}}
					>
						{value}
					</button>
				))}
			</div>
		</div>
	);
};

export default Calculator;

