import React, { useCallback, useEffect, useMemo, useState } from "react";
import { subtleTextStyle } from "../styles";

interface CalculatorProps {
	accent: string;
}

type Token =
	| { type: "number"; value: number }
	| { type: "identifier"; value: string }
	| { type: "operator"; value: "+" | "-" | "*" | "/" | "^" }
	| { type: "paren"; value: "(" | ")" }
	| { type: "comma" };

const FUNCTION_NAMES = new Set(["sin", "cos", "tan", "sqrt", "abs", "log", "ln"]);
const CONSTANTS: Record<string, number> = {
	pi: Math.PI,
	e: Math.E,
};

const allowedPattern = /^[0-9+\-*/().,^a-zA-Z\s]*$/;

function tokenize(raw: string): Token[] {
	const input = raw.replace(/\s+/g, "");
	if (!input || !allowedPattern.test(input)) {
		throw new Error("Invalid characters");
	}

	const tokens: Token[] = [];
	let i = 0;

	while (i < input.length) {
		const ch = input[i];

		if (/[0-9.]/.test(ch)) {
			let j = i + 1;
			while (j < input.length && /[0-9.]/.test(input[j])) j += 1;
			const value = Number.parseFloat(input.slice(i, j));
			if (!Number.isFinite(value)) throw new Error("Invalid number");
			tokens.push({ type: "number", value });
			i = j;
			continue;
		}

		if (/[a-zA-Z]/.test(ch)) {
			let j = i + 1;
			while (j < input.length && /[a-zA-Z]/.test(input[j])) j += 1;
			tokens.push({ type: "identifier", value: input.slice(i, j).toLowerCase() });
			i = j;
			continue;
		}

		if ("+-*/^".includes(ch)) {
			tokens.push({ type: "operator", value: ch as "+" | "-" | "*" | "/" | "^" });
			i += 1;
			continue;
		}

		if (ch === "(" || ch === ")") {
			tokens.push({ type: "paren", value: ch });
			i += 1;
			continue;
		}

		if (ch === ",") {
			tokens.push({ type: "comma" });
			i += 1;
			continue;
		}

		throw new Error(`Unexpected character: ${ch}`);
	}

	return tokens;
}

class Parser {
	private index = 0;

	constructor(private readonly tokens: Token[]) {}

	private peek(): Token | undefined {
		return this.tokens[this.index];
	}

	private consume(): Token {
		const token = this.tokens[this.index];
		if (!token) throw new Error("Unexpected end of expression");
		this.index += 1;
		return token;
	}

	private matchOperator(...ops: Array<"+" | "-" | "*" | "/" | "^">): boolean {
		const token = this.peek();
		if (!token || token.type !== "operator") return false;
		if (!ops.includes(token.value)) return false;
		this.index += 1;
		return true;
	}

	private matchParen(value: "(" | ")"): boolean {
		const token = this.peek();
		if (!token || token.type !== "paren" || token.value !== value) return false;
		this.index += 1;
		return true;
	}

	parse(): number {
		const value = this.parseExpression(0);
		if (this.index < this.tokens.length) {
			throw new Error("Unexpected trailing input");
		}
		if (!Number.isFinite(value)) throw new Error("Invalid result");
		return value;
	}

	private parseExpression(minPrecedence: number): number {
		let left = this.parseUnary();

		while (true) {
			const token = this.peek();
			if (!token || token.type !== "operator") break;
			const precedence = token.value === "^" ? 4 : token.value === "*" || token.value === "/" ? 3 : token.value === "+" || token.value === "-" ? 2 : 0;
			if (precedence < minPrecedence || precedence === 0) break;

			this.consume();
			const nextMin = token.value === "^" ? precedence : precedence + 1;
			const right = this.parseExpression(nextMin);

			switch (token.value) {
				case "+":
					left += right;
					break;
				case "-":
					left -= right;
					break;
				case "*":
					left *= right;
					break;
				case "/":
					left /= right;
					break;
				case "^":
					left = Math.pow(left, right);
					break;
			}
		}

		return left;
	}

	private parseUnary(): number {
		const token = this.peek();
		if (token?.type === "operator" && (token.value === "+" || token.value === "-")) {
			this.consume();
			const value = this.parseUnary();
			return token.value === "-" ? -value : value;
		}
		return this.parsePrimary();
	}

	private parsePrimary(): number {
		const token = this.consume();

		if (token.type === "number") return token.value;

		if (token.type === "identifier") {
			const name = token.value;
			if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) {
				return CONSTANTS[name];
			}
			if (!FUNCTION_NAMES.has(name)) {
				throw new Error(`Unknown identifier: ${name}`);
			}
			if (!this.matchParen("(")) {
				throw new Error(`Expected "(" after ${name}`);
			}
			const arg = this.parseExpression(0);
			if (!this.matchParen(")")) {
				throw new Error("Missing closing parenthesis");
			}
			switch (name) {
				case "sin":
					return Math.sin(arg);
				case "cos":
					return Math.cos(arg);
				case "tan":
					return Math.tan(arg);
				case "sqrt":
					return Math.sqrt(arg);
				case "abs":
					return Math.abs(arg);
				case "log":
					return Math.log10(arg);
				case "ln":
					return Math.log(arg);
				default:
					throw new Error(`Unsupported function: ${name}`);
			}
		}

		if (token.type === "paren" && token.value === "(") {
			const value = this.parseExpression(0);
			if (!this.matchParen(")")) {
				throw new Error("Missing closing parenthesis");
			}
			return value;
		}

		throw new Error("Invalid expression");
	}
}

const evaluateExpression = (raw: string) => {
	const tokens = tokenize(raw);
	const parser = new Parser(tokens);
	return parser.parse();
};

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
				return Number.isInteger(result) ? String(result) : String(Number(result.toFixed(10)));
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
			if (["+", "-", "*", "/", ".", "(", ")", "^"].includes(event.key)) {
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

	const functionKeys = useMemo(() => ["sin", "cos", "tan", "(", ")"], []);

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
				{functionKeys.map((value) => (
					<button
						key={value}
						type="button"
						style={buttonStyle(accent)}
						onClick={() => appendValue(`${value}${value.length === 3 ? "(" : ""}`)}
					>
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
					<button key={value} type="button" style={buttonStyle(accent)} onClick={() => appendValue(value)}>
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
								appendValue(value);
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
