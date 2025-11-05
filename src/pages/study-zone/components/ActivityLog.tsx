import React, { useMemo, useState } from "react";
import {
	fieldLabelStyle,
	ghostButtonStyle,
	inputFieldStyle,
	listItemStyle,
	listSurfaceStyle,
	primaryButtonStyle,
	subtleTextStyle,
} from "../styles";

interface ActivityLogEntry {
	id: string;
	message: string;
	createdAt: string;
}

interface ActivityLogProps {
	accent: string;
}

const sectionHeaderStyle: React.CSSProperties = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	gap: "12px",
	flexWrap: "wrap",
};

const accentDotStyle = (accent: string): React.CSSProperties => ({
	width: "10px",
	height: "10px",
	borderRadius: "999px",
	background: accent,
	boxShadow: `${accent} 0 0 14px 0`,
});

const metaTextStyle: React.CSSProperties = {
	...subtleTextStyle,
	fontSize: "12px",
};

const ActivityLog: React.FC<ActivityLogProps> = ({ accent }) => {
	const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
	const [draft, setDraft] = useState("");

	const addEntry = () => {
		const trimmed = draft.trim();
		if (!trimmed) {
			return;
		}
		const entry: ActivityLogEntry = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			message: trimmed,
			createdAt: new Date().toISOString(),
		};
		setEntries((prev) => [entry, ...prev]);
		setDraft("");
	};

	const removeEntry = (id: string) => {
		setEntries((prev) => prev.filter((entry) => entry.id !== id));
	};

	const formattedEntries = useMemo(() => entries, [entries]);

	return (
		<div style={{ display: "grid", gap: "18px" }}>
			<div style={sectionHeaderStyle}>
				<div>
					<h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Activity Log</h2>
					<p style={subtleTextStyle}>Capture quick wins, session notes, or reflections.</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span style={accentDotStyle(accent)} />
					<span style={metaTextStyle}>{formattedEntries.length} entries</span>
				</div>
			</div>

			<div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
				<input
					type="text"
					value={draft}
					placeholder="Jot down something notable..."
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							addEntry();
						}
					}}
					style={{ ...inputFieldStyle, flex: 1, minWidth: "220px" }}
				/>
				<button type="button" onClick={addEntry} style={primaryButtonStyle(accent)}>
					Add
				</button>
				<button
					type="button"
					onClick={() => setEntries([])}
					style={{ ...ghostButtonStyle, paddingInline: "18px" }}
					disabled={entries.length === 0}
				>
					Clear
				</button>
			</div>

			{formattedEntries.length === 0 ? (
				<div style={{ ...listSurfaceStyle, alignItems: "center", justifyContent: "center", color: "rgba(231,234,255,0.6)" }}>
					Nothing logged yet. Start a session or jot a quick note.
				</div>
			) : (
				<div style={{ ...listSurfaceStyle, maxHeight: "360px", overflowY: "auto" }}>
					{formattedEntries.map((entry) => (
						<div key={entry.id} style={{ ...listItemStyle, alignItems: "flex-start" }}>
							<div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
								<span style={{ color: accent, fontWeight: 600 }}>{entry.message}</span>
								<span style={metaTextStyle}>{new Date(entry.createdAt).toLocaleString()}</span>
							</div>
							<button
								type="button"
								onClick={() => removeEntry(entry.id)}
								style={{ ...ghostButtonStyle, padding: "6px 12px" }}
							>
								Remove
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ActivityLog;

