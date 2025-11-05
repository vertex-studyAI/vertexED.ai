import type { CSSProperties } from "react";

const panelBackground = "linear-gradient(140deg, hsla(216, 18%, 18%, 0.96), hsla(216, 18%, 12%, 0.98))";
const strongShadow = "rgba(5, 9, 18, 0.55)";
const borderColor = "hsla(199, 45%, 36%, 0.28)";
const hollowBorder = "hsla(199, 45%, 36%, 0.18)";
const softSurface = "hsla(216, 18%, 16%, 0.72)";
const denserSurface = "hsla(216, 18%, 12%, 0.78)";
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
	color: "hsla(199, 45%, 78%, 0.7)",
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
	background: "hsla(216, 18%, 11%, 0.82)",
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
	background: "hsla(199, 45%, 36%, 0.16)",
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
	background: active ? accent : "hsla(216, 18%, 16%, 0.62)",
	color: active ? "hsl(216, 18%, 12%)" : mutedText,
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
	color: "hsl(216, 18%, 12%)",
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
	background: "linear-gradient(140deg, hsla(216, 18%, 18%, 0.42), hsla(216, 18%, 12%, 0.48))",
	color: mutedText,
	fontWeight: 600,
	letterSpacing: "0.02em",
	cursor: "pointer",
	transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

export const dangerButtonStyle: CSSProperties = {
	...ghostButtonStyle,
	border: "1px solid hsla(352, 85%, 68%, 0.4)",
	background: "hsla(352, 85%, 38%, 0.18)",
	color: "hsla(352, 92%, 82%, 1)",
};

export const tertiaryButtonStyle: CSSProperties = {
	padding: "10px 16px",
	borderRadius: "12px",
	border: "none",
	background: "hsla(216, 18%, 18%, 0.46)",
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
	background: "hsla(216, 18%, 16%, 0.6)",
	color: accent,
	fontSize: "12px",
	fontWeight: 600,
});
