import React, { useEffect, useMemo, useState } from "react";
import {
	fieldLabelStyle,
	ghostButtonStyle,
	inputFieldStyle,
	listItemStyle,
	listSurfaceStyle,
	primaryButtonStyle,
	selectFieldStyle,
	subtleTextStyle,
} from "../styles";

interface Habit {
	name: string;
	frequency: string;
	completed: boolean;
	streak: number;
	createdAt: string;
}

interface HabitTrackerProps {
	accent: string;
}

const formGridStyle: React.CSSProperties = {
	display: "grid",
	gap: "16px",
	gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const actionsRowStyle: React.CSSProperties = {
	display: "flex",
	flexWrap: "wrap",
	gap: "12px",
};

const progressTrackStyle: React.CSSProperties = {
	width: "100%",
	height: "14px",
	borderRadius: "999px",
	background: "hsla(216, 18%, 12%, 0.55)",
	border: "1px solid hsla(199, 45%, 36%, 0.22)",
	overflow: "hidden",
};

const HabitTracker: React.FC<HabitTrackerProps> = ({ accent }) => {
	const [habits, setHabits] = useState<Habit[]>([]);
	const [draftName, setDraftName] = useState("");
	const [frequency, setFrequency] = useState("Daily");
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (habits.length === 0) {
			setProgress(0);
			return;
		}
		const completed = habits.filter((habit) => habit.completed).length;
		setProgress(Math.round((completed / habits.length) * 100));
	}, [habits]);

	const clearForm = () => {
		setDraftName("");
		setFrequency("Daily");
		setEditingIndex(null);
	};

	const saveHabit = () => {
		const value = draftName.trim();
		if (!value) {
			return;
		}

		setHabits((prev) => {
			const next = [...prev];
			if (editingIndex !== null) {
				next[editingIndex] = {
					...next[editingIndex],
					name: value,
					frequency,
				};
				return next;
			}

			return [
				...prev,
				{
					name: value,
					frequency,
					completed: false,
					streak: 0,
					createdAt: new Date().toISOString(),
				},
			];
		});

		clearForm();
	};

	const toggleCompletion = (index: number) => {
		setHabits((prev) =>
			prev.map((habit, idx) =>
				idx === index
					? {
						...habit,
						completed: !habit.completed,
						streak: habit.completed ? Math.max(habit.streak - 1, 0) : habit.streak + 1,
					}
					: habit,
			),
		);
	};

	const editHabit = (index: number) => {
		const habit = habits[index];
		setDraftName(habit.name);
		setFrequency(habit.frequency);
		setEditingIndex(index);
	};

	const deleteHabit = (index: number) => {
		setHabits((prev) => prev.filter((_, idx) => idx !== index));
		if (editingIndex === index) {
			clearForm();
		}
	};

	const sortedHabits = useMemo(
		() => [...habits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
		[habits],
	);

	return (
		<div style={{ display: "grid", gap: "22px" }}>
			<div style={{ display: "grid", gap: "12px" }}>
				<div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
					<span style={{ ...subtleTextStyle, fontSize: "13px" }}>Completion</span>
					<span style={{ fontWeight: 600, color: accent }}>{progress}%</span>
				</div>
				<div style={progressTrackStyle}>
					<div
						style={{
							width: `${progress}%`,
							height: "100%",
							background: accent,
							transition: "width 0.3s ease",
						}}
					/>
				</div>
			</div>

			<div style={formGridStyle}>
				<label style={{ display: "grid", gap: "8px" }}>
					<span style={fieldLabelStyle}>Habit name</span>
					<input
						type="text"
						value={draftName}
						onChange={(event) => setDraftName(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								saveHabit();
							}
						}}
						placeholder="Read Chapter 5"
						style={inputFieldStyle}
					/>
				</label>
				<label style={{ display: "grid", gap: "8px" }}>
					<span style={fieldLabelStyle}>Frequency</span>
					<select value={frequency} onChange={(event) => setFrequency(event.target.value)} style={selectFieldStyle}>
						<option value="Daily">Daily</option>
						<option value="Weekly">Weekly</option>
						<option value="Monthly">Monthly</option>
					</select>
				</label>
			</div>

			<div style={actionsRowStyle}>
				<button type="button" onClick={saveHabit} style={primaryButtonStyle(accent)}>
					{editingIndex !== null ? "Update habit" : "Add habit"}
				</button>
				<button type="button" onClick={clearForm} style={ghostButtonStyle}>
					Clear
				</button>
			</div>

			{sortedHabits.length === 0 ? (
				<div style={{ ...listSurfaceStyle, textAlign: "center", color: "hsla(199, 45%, 72%, 0.7)" }}>
					No habits yet — add your first routine to start tracking.
				</div>
			) : (
				<div style={{ ...listSurfaceStyle, maxHeight: "340px", overflowY: "auto" }}>
					{sortedHabits.map((habit, index) => (
						<div key={`${habit.name}-${habit.createdAt}`} style={{ ...listItemStyle, alignItems: "flex-start" }}>
							<div style={{ display: "grid", gap: "6px", flex: 1 }}>
								<strong style={{ color: "hsl(var(--foreground))" }}>{habit.name}</strong>
								<span style={{ ...subtleTextStyle, fontSize: "13px" }}>Frequency: {habit.frequency}</span>
								<span style={{ ...subtleTextStyle, fontSize: "12px" }}>Streak: {habit.streak}</span>
							</div>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
								<button
									type="button"
									onClick={() => toggleCompletion(index)}
									style={{ ...primaryButtonStyle(accent), padding: "8px 16px" }}
								>
									{habit.completed ? "Completed" : "Mark complete"}
								</button>
								<button type="button" onClick={() => editHabit(index)} style={{ ...ghostButtonStyle, padding: "8px 14px" }}>
									Edit
								</button>
								<button type="button" onClick={() => deleteHabit(index)} style={{ ...ghostButtonStyle, padding: "8px 14px" }}>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default HabitTracker;
