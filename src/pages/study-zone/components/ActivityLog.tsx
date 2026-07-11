import React, { useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { recordStudySession } from "@/lib/studyStats";

interface ActivityLogEntry {
	id: string;
	message: string;
	createdAt: string;
}

interface ActivityLogProps {
	accent: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ accent }) => {
	const [entries, setEntries] = useLocalStorage<ActivityLogEntry[]>("studyzone_activity", []);
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
		recordStudySession();
	};

	const removeEntry = (id: string) => {
		setEntries((prev) => prev.filter((entry) => entry.id !== id));
	};

	const formattedEntries = useMemo(() => entries, [entries]);

	return (
		<div className="zone-stack">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="zone-heading">Activity Log</h2>
					<p className="zone-subtle">Log wins, rough notes, or anything worth remembering.</p>
				</div>
				<div className="flex items-center gap-2">
					<span
						className="h-2.5 w-2.5 rounded-full"
						style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
						aria-hidden
					/>
					<span className="text-xs text-muted-foreground">{formattedEntries.length} entries</span>
				</div>
			</div>

			<div className="flex flex-wrap gap-3">
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
					className="form-control min-w-[220px] flex-1"
				/>
				<button type="button" onClick={addEntry} className="zone-btn-primary">
					Add
				</button>
				<button
					type="button"
					onClick={() => setEntries([])}
					className="zone-btn-ghost !px-4"
					disabled={entries.length === 0}
				>
					Clear
				</button>
			</div>

			{formattedEntries.length === 0 ? (
				<div className="zone-list-surface zone-empty-hint items-center justify-center">
					Nothing logged yet. Start a session or jot a quick note.
				</div>
			) : (
				<div className="zone-list-surface max-h-[360px] overflow-y-auto">
					{formattedEntries.map((entry) => (
						<div key={entry.id} className="zone-list-item items-start">
							<div className="flex flex-1 flex-col gap-1.5">
								<span style={{ color: accent }} className="font-semibold">
									{entry.message}
								</span>
								<span className="text-xs text-muted-foreground">
									{new Date(entry.createdAt).toLocaleString()}
								</span>
							</div>
							<button type="button" onClick={() => removeEntry(entry.id)} className="zone-btn-ghost !px-3 !py-2 text-sm">
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
