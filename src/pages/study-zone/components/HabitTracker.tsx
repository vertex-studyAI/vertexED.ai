import React, { useEffect, useMemo, useState } from "react";
import { fieldLabelStyle } from "../styles";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { recordStudySession } from "@/lib/studyStats";

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

const formGridClass = "grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]";

const HabitTracker: React.FC<HabitTrackerProps> = ({ accent }) => {
	const [habits, setHabits] = useLocalStorage<Habit[]>("studyzone_habits", []);
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

	const habitIndex = (habit: Habit) =>
		habits.findIndex((item) => item.createdAt === habit.createdAt && item.name === habit.name);

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
		if (!habits[index]?.completed) recordStudySession();
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
		<div className="zone-stack-lg">
			<div className="grid gap-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<span className="zone-subtle text-[13px]">Completion</span>
					<span className="font-semibold" style={{ color: accent }}>{progress}%</span>
				</div>
				<div className="zone-progress-track">
					<div className="zone-progress-fill" style={{ width: `${progress}%` }} />
				</div>
			</div>

			<div className={formGridClass}>
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
						className="form-control"
					/>
				</label>
				<label style={{ display: "grid", gap: "8px" }}>
					<span style={fieldLabelStyle}>Frequency</span>
					<select value={frequency} onChange={(event) => setFrequency(event.target.value)} className="form-control-select">
						<option value="Daily">Daily</option>
						<option value="Weekly">Weekly</option>
						<option value="Monthly">Monthly</option>
					</select>
				</label>
			</div>

			<div className="flex flex-wrap gap-3">
				<button type="button" onClick={saveHabit} className="zone-btn-primary">
					{editingIndex !== null ? "Update habit" : "Add habit"}
				</button>
				<button type="button" onClick={clearForm} className="zone-btn-ghost">
					Clear
				</button>
			</div>

			{sortedHabits.length === 0 ? (
				<div className="zone-list-surface zone-empty-hint">
					No habits yet — add your first routine to start tracking.
				</div>
			) : (
				<div className="zone-list-surface max-h-[340px] overflow-y-auto">
					{sortedHabits.map((habit) => {
						const index = habitIndex(habit);
						return (
						<div key={`${habit.name}-${habit.createdAt}`} className="zone-list-item items-start">
							<div className="grid flex-1 gap-1.5">
								<strong className="text-foreground">{habit.name}</strong>
								<span className="text-[13px] text-muted-foreground">Frequency: {habit.frequency}</span>
								<span className="text-xs text-muted-foreground">Streak: {habit.streak}</span>
							</div>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
								<button
									type="button"
									onClick={() => toggleCompletion(index)}
									className="zone-btn-primary !px-4 !py-2"
								>
									{habit.completed ? "Completed" : "Mark complete"}
								</button>
								<button type="button" onClick={() => editHabit(index)} className="zone-btn-ghost !px-3.5 !py-2">
									Edit
								</button>
								<button type="button" onClick={() => deleteHabit(index)} className="zone-btn-ghost !px-3.5 !py-2">
									Delete
								</button>
							</div>
						</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default HabitTracker;
