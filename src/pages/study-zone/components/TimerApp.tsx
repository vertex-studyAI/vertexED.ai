import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	accentTextStyle,
	ghostButtonStyle,
	inputFieldStyle,
	pillButtonStyle,
	pillGroupStyle,
	primaryButtonStyle,
	sectionHeadingStyle,
	subtleBadgeStyle,
	subtleTextStyle,
} from "../styles";

type TimerTab = "timer" | "stopwatch" | "pomodoro";

interface TimerAppProps {
	accent: string;
}

const headingRowStyle: React.CSSProperties = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	flexWrap: "wrap",
	gap: "12px",
};

const controlRowStyle: React.CSSProperties = {
	display: "flex",
	gap: "12px",
	flexWrap: "wrap",
	justifyContent: "center",
};

const inputGroupStyle: React.CSSProperties = {
	display: "grid",
	gap: "18px",
	gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
};

const labelCapsStyle: React.CSSProperties = {
	...subtleTextStyle,
	textTransform: "uppercase",
	letterSpacing: "0.12em",
	fontSize: "12px",
};

const timeDisplayStyle: React.CSSProperties = {
	fontFamily: "'JetBrains Mono', monospace",
	fontSize: "48px",
	lineHeight: 1.2,
	letterSpacing: "0.08em",
	textAlign: "center",
	color: "#F5F7FF",
};

const circleTrackColor = "rgba(231, 234, 255, 0.18)";

const formatTimerDisplay = (valueMs: number) => {
	const safe = Math.max(0, Math.floor(valueMs / 1000));
	const seconds = safe % 60;
	const minutes = Math.floor(safe / 60) % 60;
	const hours = Math.floor(safe / 3600);
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatStopwatchDisplay = (valueMs: number) => {
	const safe = Math.max(0, valueMs);
	const hundredths = Math.floor((safe % 1000) / 10);
	const seconds = Math.floor(safe / 1000) % 60;
	const minutes = Math.floor(safe / 60000) % 60;
	const hours = Math.floor(safe / 3600000);
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
};

const formatSecondsDisplay = (valueSeconds: number) => {
	const safe = Math.max(0, valueSeconds);
	const seconds = safe % 60;
	const minutes = Math.floor(safe / 60) % 60;
	const hours = Math.floor(safe / 3600);
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const Timer: React.FC<{ accent: string }> = ({ accent }) => {
	const initialTotal = 25 * 60 * 1000;
	const [timeMs, setTimeMs] = useState(initialTotal);
	const [totalMs, setTotalMs] = useState(initialTotal);
	const [isRunning, setIsRunning] = useState(false);
	const [hours, setHours] = useState(0);
	const [minutes, setMinutes] = useState(25);
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		if (!isRunning) {
			return () => undefined;
		}
		const intervalId = window.setInterval(() => {
			setTimeMs((prev) => Math.max(prev - 10, 0));
		}, 10);
		return () => window.clearInterval(intervalId);
	}, [isRunning]);

	useEffect(() => {
		if (timeMs <= 0 && isRunning) {
			setIsRunning(false);
		}
	}, [timeMs, isRunning]);

	const computeTotal = () => (hours * 3600 + minutes * 60 + seconds) * 1000;

	useEffect(() => {
		if (isRunning) {
			return;
		}
		const nextTotal = computeTotal();
		setTotalMs(nextTotal);
		setTimeMs(nextTotal);
	}, [hours, minutes, seconds, isRunning]);

	const handleStartPause = () => {
		if (!isRunning) {
			if (timeMs <= 0) {
				const nextTotal = computeTotal();
				if (nextTotal <= 0) {
					return;
				}
				setTotalMs(nextTotal);
				setTimeMs(nextTotal);
			}
		}
		setIsRunning((prev) => !prev);
	};

	const handleReset = () => {
		setIsRunning(false);
		const nextTotal = computeTotal();
		setTotalMs(nextTotal);
		setTimeMs(nextTotal);
	};

	const applyPreset = (presetMinutes: number) => {
		const h = Math.floor(presetMinutes / 60);
		const m = presetMinutes % 60;
		setHours(h);
		setMinutes(m);
		setSeconds(0);
		const nextTotal = (h * 3600 + m * 60) * 1000;
		setIsRunning(false);
		setTotalMs(nextTotal);
		setTimeMs(nextTotal);
	};

	const progress = totalMs > 0 ? Math.min(1, Math.max(0, (totalMs - timeMs) / totalMs)) : 0;
	const radius = 110;
	const circumference = 2 * Math.PI * radius;

	const status = isRunning ? "Running" : timeMs === 0 ? "Complete" : timeMs === totalMs ? "Ready" : "Paused";

	return (
		<div style={{ display: "grid", gap: "24px" }}>
			<div style={headingRowStyle}>
				<h2 style={{ ...sectionHeadingStyle, ...accentTextStyle(accent) }}>Countdown Timer</h2>
				<span style={subtleBadgeStyle(accent)}>Focus block</span>
			</div>

			<div style={{ position: "relative", width: "240px", height: "240px", margin: "0 auto" }}>
				<svg width="240" height="240">
					<circle cx="120" cy="120" r={radius} stroke={circleTrackColor} strokeWidth="12" fill="none" />
					<circle
						cx="120"
						cy="120"
						r={radius}
						stroke={accent}
						strokeWidth="12"
						fill="none"
						strokeDasharray={circumference}
						strokeDashoffset={circumference * (1 - progress)}
						transform="rotate(-90 120 120)"
						strokeLinecap="round"
					/>
				</svg>
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: "6px",
					}}
				>
					<span style={timeDisplayStyle}>{formatTimerDisplay(timeMs)}</span>
					<span style={subtleTextStyle}>{status}</span>
				</div>
			</div>

			<div style={inputGroupStyle}>
				<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
					<span style={labelCapsStyle}>Hours</span>
					<input
						type="number"
						min={0}
						max={23}
						value={hours}
						onChange={(event) => setHours(Math.max(0, Number(event.target.value) || 0))}
						style={inputFieldStyle}
					/>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
					<span style={labelCapsStyle}>Minutes</span>
					<input
						type="number"
						min={0}
						max={59}
						value={minutes}
						onChange={(event) => setMinutes(Math.max(0, Number(event.target.value) || 0))}
						style={inputFieldStyle}
					/>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
					<span style={labelCapsStyle}>Seconds</span>
					<input
						type="number"
						min={0}
						max={59}
						value={seconds}
						onChange={(event) => setSeconds(Math.max(0, Number(event.target.value) || 0))}
						style={inputFieldStyle}
					/>
				</div>
			</div>

			<div style={controlRowStyle}>
				<button onClick={handleStartPause} style={primaryButtonStyle(accent)}>
					{isRunning ? "Pause" : "Start"}
				</button>
				<button onClick={handleReset} style={ghostButtonStyle}>
					Reset
				</button>
			</div>

			<div style={{ ...subtleTextStyle }}>
				Quick presets:
				{[15, 25, 50].map((preset) => (
					<button
						key={preset}
						type="button"
						style={{ ...ghostButtonStyle, padding: "8px 16px", marginLeft: "12px" }}
						onClick={() => applyPreset(preset)}
					>
						{preset} min
					</button>
				))}
			</div>
		</div>
	);
};

const Stopwatch: React.FC<{ accent: string }> = ({ accent }) => {
	const [timeMs, setTimeMs] = useState(0);
	const [isRunning, setIsRunning] = useState(false);
	const lastTickRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isRunning) {
			return () => undefined;
		}
		const intervalId = window.setInterval(() => {
			const now = performance.now();
			const last = lastTickRef.current ?? now;
			lastTickRef.current = now;
			setTimeMs((prev) => prev + (now - last));
		}, 50);
		return () => window.clearInterval(intervalId);
	}, [isRunning]);

	const handleStartPause = () => {
		if (isRunning) {
			setIsRunning(false);
			return;
		}
		lastTickRef.current = performance.now();
		setIsRunning(true);
	};

	const handleReset = () => {
		setIsRunning(false);
		setTimeMs(0);
		lastTickRef.current = null;
	};

	return (
		<div style={{ display: "grid", gap: "24px" }}>
			<div style={headingRowStyle}>
				<h2 style={{ ...sectionHeadingStyle, ...accentTextStyle(accent) }}>Stopwatch</h2>
				<span style={subtleBadgeStyle(accent)}>Precision</span>
			</div>
			<div style={{ ...timeDisplayStyle, fontSize: "42px", margin: "0 auto" }}>{formatStopwatchDisplay(timeMs)}</div>
			<div style={controlRowStyle}>
				<button onClick={handleStartPause} style={primaryButtonStyle(accent)}>
					{isRunning ? "Pause" : "Start"}
				</button>
				<button onClick={handleReset} style={ghostButtonStyle}>
					Reset
				</button>
			</div>
		</div>
	);
};

const PomodoroTimer: React.FC<{ accent: string }> = ({ accent }) => {
	const [focusMinutes, setFocusMinutes] = useState(25);
	const [breakMinutes, setBreakMinutes] = useState(5);
	const [mode, setMode] = useState<"focus" | "break">("focus");
	const modeRef = useRef<"focus" | "break">("focus");
	const [timeSeconds, setTimeSeconds] = useState(focusMinutes * 60);
	const [isRunning, setIsRunning] = useState(false);

	useEffect(() => {
		modeRef.current = mode;
	}, [mode]);

	useEffect(() => {
		if (!isRunning) {
			setTimeSeconds((mode === "focus" ? focusMinutes : breakMinutes) * 60);
		}
	}, [focusMinutes, breakMinutes, mode, isRunning]);

	useEffect(() => {
		if (!isRunning) {
			return () => undefined;
		}
		const intervalId = window.setInterval(() => {
			setTimeSeconds((prev) => {
				if (prev <= 1) {
					const nextMode = modeRef.current === "focus" ? "break" : "focus";
					modeRef.current = nextMode;
					setMode(nextMode);
					return (nextMode === "focus" ? focusMinutes : breakMinutes) * 60;
				}
				return prev - 1;
			});
		}, 1000);
		return () => window.clearInterval(intervalId);
	}, [isRunning, focusMinutes, breakMinutes]);

	const handleStartPause = () => {
		if (!isRunning && timeSeconds <= 0) {
			setTimeSeconds((mode === "focus" ? focusMinutes : breakMinutes) * 60);
		}
		setIsRunning((prev) => !prev);
	};

	const handleReset = () => {
		setIsRunning(false);
		setMode("focus");
		modeRef.current = "focus";
		setTimeSeconds(focusMinutes * 60);
	};

	const applyPreset = (focus: number, rest: number) => {
		setFocusMinutes(focus);
		setBreakMinutes(rest);
		setIsRunning(false);
		setMode("focus");
		modeRef.current = "focus";
		setTimeSeconds(focus * 60);
	};

	const sessionLength = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
	const progress = sessionLength > 0 ? Math.min(1, Math.max(0, 1 - timeSeconds / sessionLength)) : 0;
	const radius = 110;
	const circumference = 2 * Math.PI * radius;
	const statusText = mode === "focus" ? "Focus" : "Break";

	return (
		<div style={{ display: "grid", gap: "24px" }}>
			<div style={headingRowStyle}>
				<h2 style={{ ...sectionHeadingStyle, ...accentTextStyle(accent) }}>Pomodoro</h2>
				<span style={subtleBadgeStyle(accent)}>{statusText}</span>
			</div>

			<div style={{ position: "relative", width: "240px", height: "240px", margin: "0 auto" }}>
				<svg width="240" height="240">
					<circle cx="120" cy="120" r={radius} stroke={circleTrackColor} strokeWidth="12" fill="none" />
					<circle
						cx="120"
						cy="120"
						r={radius}
						stroke={accent}
						strokeWidth="12"
						fill="none"
						strokeDasharray={circumference}
						strokeDashoffset={circumference * (1 - progress)}
						transform="rotate(-90 120 120)"
						strokeLinecap="round"
					/>
				</svg>
				<div
					style={{
						position: "absolute",
						inset: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: "6px",
					}}
				>
					<span style={timeDisplayStyle}>{formatSecondsDisplay(timeSeconds)}</span>
					<span style={subtleTextStyle}>{mode === "focus" ? "Deep work" : "Recharge"}</span>
				</div>
			</div>

			<div style={inputGroupStyle}>
				<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
					<span style={labelCapsStyle}>Focus (min)</span>
					<input
						type="number"
						min={5}
						max={180}
						value={focusMinutes}
						onChange={(event) => setFocusMinutes(Math.max(1, Number(event.target.value) || 1))}
						style={inputFieldStyle}
					/>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
					<span style={labelCapsStyle}>Break (min)</span>
					<input
						type="number"
						min={1}
						max={60}
						value={breakMinutes}
						onChange={(event) => setBreakMinutes(Math.max(1, Number(event.target.value) || 1))}
						style={inputFieldStyle}
					/>
				</div>
			</div>

			<div style={controlRowStyle}>
				<button onClick={handleStartPause} style={primaryButtonStyle(accent)}>
					{isRunning ? "Pause" : "Start"}
				</button>
				<button onClick={handleReset} style={ghostButtonStyle}>
					Reset
				</button>
			</div>

			<div style={{ ...subtleTextStyle }}>
				Quick presets:
				{[
					{ focus: 25, rest: 5 },
					{ focus: 45, rest: 15 },
				].map((preset) => (
					<button
						key={`${preset.focus}-${preset.rest}`}
						type="button"
						style={{ ...ghostButtonStyle, padding: "8px 16px", marginLeft: "12px" }}
						onClick={() => applyPreset(preset.focus, preset.rest)}
					>
						{preset.focus}/{preset.rest}
					</button>
				))}
			</div>
		</div>
	);
};

const TimerApp: React.FC<TimerAppProps> = ({ accent }) => {
	const [activeTab, setActiveTab] = useState<TimerTab>("timer");

	const tabConfig = useMemo(
		() => [
			{ id: "timer" as const, label: "Timer" },
			{ id: "stopwatch" as const, label: "Stopwatch" },
			{ id: "pomodoro" as const, label: "Pomodoro" },
		],
		[],
	);

	return (
		<div style={{ display: "grid", gap: "32px" }}>
			<div style={pillGroupStyle}>
				{tabConfig.map((tab) => (
					<button
						key={tab.id}
						type="button"
						style={pillButtonStyle(activeTab === tab.id, accent)}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div style={{ width: "100%", maxWidth: "720px", margin: "0 auto" }}>
				{activeTab === "timer" && <Timer accent={accent} />}
				{activeTab === "stopwatch" && <Stopwatch accent={accent} />}
				{activeTab === "pomodoro" && <PomodoroTimer accent={accent} />}
			</div>
		</div>
	);
};

export default TimerApp;

