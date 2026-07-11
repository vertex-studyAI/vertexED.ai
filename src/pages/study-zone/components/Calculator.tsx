import React, { useCallback, useEffect, useRef, useState } from "react";

const allowedPattern = /^[0-9+\-*/().^a-zA-Z]*$/;

const replaceFunctions = (expression: string) =>
	expression
		.replace(/log10\(/g, "__LOG10__")
		.replace(/sin\(/g, "Math.sin(")
		.replace(/cos\(/g, "Math.cos(")
		.replace(/tan\(/g, "Math.tan(")
		.replace(/sqrt\(/g, "Math.sqrt(")
		.replace(/abs\(/g, "Math.abs(")
		.replace(/ln\(/g, "Math.log(")
		.replace(/log\(/g, "Math.log10(")
		.replace(/__LOG10__/g, "Math.log10(");

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

const keyClass = (variant: "neutral" | "primary" | "danger") => {
	if (variant === "primary") return "zone-key-primary";
	if (variant === "danger") return "zone-key-danger";
	return "zone-key";
};

const Calculator: React.FC<CalculatorProps> = () => {
	const [input, setInput] = useState("");
	const [error, setError] = useState<string | null>(null);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const [keyboardActive, setKeyboardActive] = useState(false);

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
			if (!keyboardActive) return;

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
	}, [appendValue, backspace, calculate, keyboardActive]);

	return (
		<div
			ref={rootRef}
			tabIndex={0}
			onFocus={() => setKeyboardActive(true)}
			onBlur={(event) => {
				if (!rootRef.current?.contains(event.relatedTarget as Node)) {
					setKeyboardActive(false);
				}
			}}
			className="zone-stack outline-none"
		>
			<div>
				<h2 className="zone-heading">Scientific Calculator</h2>
				<p className="zone-subtle">Trig, logs, square roots, constants — the math you reach for most often.</p>
			</div>

			<div className="zone-calc-display">
				<div className="zone-calc-expression">{input || "0"}</div>
				<div className={`zone-calc-result${error ? " is-error" : ""}`}>
					{error ?? "Press Enter or = to evaluate"}
				</div>
			</div>

			<div className="zone-keypad">
				{["sin", "cos", "tan", "(", ")"].map((value) => (
					<button
						key={value}
						type="button"
						className={keyClass("neutral")}
						onClick={() => appendValue(`${value}${value.length === 3 ? "(" : ""}`)}
					>
						{value}
					</button>
				))}
				{["log10", "ln", "sqrt", "^", "Del"].map((value) => (
					<button
						key={value}
						type="button"
						className={keyClass(value === "Del" ? "danger" : "neutral")}
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
						{value === "sqrt" ? "√" : value === "log10" ? "log₁₀" : value}
					</button>
				))}
				{["7", "8", "9", "/", "C"].map((value) => (
					<button
						key={value}
						type="button"
						className={keyClass(value === "C" ? "danger" : "neutral")}
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
						className={keyClass("neutral")}
						onClick={() => appendValue(value === "*" ? "*" : value === "pi" ? "pi" : value)}
					>
						{value === "*" ? "×" : value === "pi" ? "π" : value}
					</button>
				))}
				{["1", "2", "3", "-", "e"].map((value) => (
					<button
						key={value}
						type="button"
						className={keyClass("neutral")}
						onClick={() => appendValue(value === "-" ? "-" : value)}
					>
						{value}
					</button>
				))}
				{["0", ".", "=", "+", "abs"].map((value) => (
					<button
						key={value}
						type="button"
						className={keyClass(value === "=" ? "primary" : "neutral")}
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
