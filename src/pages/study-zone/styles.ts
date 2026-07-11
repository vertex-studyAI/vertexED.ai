import type { CSSProperties } from "react";

const panelBackground = "var(--study-panel-bg, linear-gradient(140deg, hsla(216, 18%, 18%, 0.96), hsla(216, 18%, 12%, 0.98)))";
const strongShadow = "var(--study-shadow, rgba(5, 9, 18, 0.55))";
const borderColor = "hsl(var(--primary) / 0.28)";
const hollowBorder = "hsl(var(--primary) / 0.18)";
const softSurface = "hsl(var(--foreground) / 0.06)";
const denserSurface = "hsl(var(--foreground) / 0.04)";
const defaultText = "hsl(var(--foreground))";
const mutedText = "hsl(var(--muted-foreground))";

export const surfaceStyle: CSSProperties = {
	background: panelBackground,
	border: `1px solid ${borderColor}`,
	borderRadius: "24px",
	padding: "28px",
	display: "flex",
	flexDirection: "column",
	gap: "20px",
	color: defaultText,
	boxShadow: `0 32px 74px ${strongShadow}`,
};

export const sectionHeadingStyle: CSSProperties = {
	fontSize: "24px",
	fontWeight: 600,
	letterSpacing: "-0.01em",
	margin: 0,
	color: defaultText,
};

export const subtleTextStyle: CSSProperties = {
	color: mutedText,
	fontSize: "15px",
	lineHeight: 1.6,
};

export const fieldLabelStyle: CSSProperties = {
	fontSize: "12px",
	letterSpacing: "0.12em",
	textTransform: "uppercase",
	color: "hsl(var(--primary) / 0.7)",
};

export const inputFieldStyle: CSSProperties = {
	width: "100%",
	padding: "12px 16px",
	borderRadius: "14px",
	border: `1px solid ${hollowBorder}`,
	background: denserSurface,
	color: defaultText,
	fontSize: "15px",
	transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const textareaFieldStyle: CSSProperties = {
	...inputFieldStyle,
	minHeight: "180px",
	resize: "vertical",
};

export const selectFieldStyle: CSSProperties = {
	...inputFieldStyle,
	appearance: "none",
	cursor: "pointer",
};

export const scrollAreaStyle: CSSProperties = {
	overflowY: "auto",
	maxHeight: "360px",
	paddingRight: "4px",
};

export const listSurfaceStyle: CSSProperties = {
	background: softSurface,
	borderRadius: "18px",
	border: `1px solid ${hollowBorder}`,
	padding: "18px",
	display: "flex",
	flexDirection: "column",
	gap: "14px",
};

export const listItemStyle: CSSProperties = {
	background: "hsl(var(--foreground) / 0.04)",
	borderRadius: "16px",
	border: `1px solid ${hollowBorder}`,
	padding: "16px 18px",
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	gap: "12px",
};

export const tagStyle: CSSProperties = {
	padding: "4px 12px",
	borderRadius: "999px",
	background: "hsl(var(--primary) / 0.16)",
	color: mutedText,
	fontSize: "11px",
	fontWeight: 600,
	letterSpacing: "0.12em",
	textTransform: "uppercase",
};

export const dividerStyle: CSSProperties = {
	width: "100%",
	height: "1px",
	background: `linear-gradient(90deg, transparent, ${hollowBorder}, transparent)`
};

export const pillGroupStyle: CSSProperties = {
	display: "flex",
	gap: "12px",
	flexWrap: "wrap",
};

export const pillButtonStyle = (active: boolean, accent: string): CSSProperties => ({
	padding: "10px 18px",
	borderRadius: "999px",
	border: active ? `1px solid ${accent}` : `1px solid ${hollowBorder}`,
	background: active ? accent : "hsl(var(--foreground) / 0.06)",
	color: active ? "hsl(var(--primary-foreground))" : mutedText,
	fontSize: "14px",
	fontWeight: 600,
	cursor: "pointer",
	transition: "transform 0.2s ease, box-shadow 0.2s ease",
});

export const primaryButtonStyle = (accent: string): CSSProperties => ({
	padding: "12px 20px",
	borderRadius: "14px",
	border: "none",
	background: accent,
	color: "hsl(var(--primary-foreground))",
	fontWeight: 600,
	letterSpacing: "0.02em",
	cursor: "pointer",
	transition: "transform 0.2s ease, box-shadow 0.2s ease",
	boxShadow: `0 14px 28px ${strongShadow}`,
});

export const ghostButtonStyle: CSSProperties = {
	padding: "12px 18px",
	borderRadius: "14px",
	border: `1px solid ${hollowBorder}`,
	background: "hsl(var(--foreground) / 0.04)",
	color: mutedText,
	fontWeight: 600,
	letterSpacing: "0.02em",
	cursor: "pointer",
	transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

export const dangerButtonStyle: CSSProperties = {
	...ghostButtonStyle,
	border: "1px solid hsl(var(--destructive) / 0.4)",
	background: "hsl(var(--destructive) / 0.12)",
	color: "hsl(var(--destructive))",
};

export const tertiaryButtonStyle: CSSProperties = {
	padding: "10px 16px",
	borderRadius: "12px",
	border: "none",
	background: "hsl(var(--foreground) / 0.06)",
	color: mutedText,
	fontWeight: 600,
	cursor: "pointer",
};

export const metricBoxStyle: CSSProperties = {
	background: softSurface,
	borderRadius: "18px",
	border: `1px solid ${hollowBorder}`,
	padding: "20px",
};

export const accentTextStyle = (accent: string): CSSProperties => ({
	color: accent,
});

export const subtleBadgeStyle = (accent: string): CSSProperties => ({
	padding: "4px 10px",
	borderRadius: "999px",
	border: `1px solid ${accent}`,
	background: "hsl(var(--foreground) / 0.06)",
	color: accent,
	fontSize: "12px",
	fontWeight: 600,
});
