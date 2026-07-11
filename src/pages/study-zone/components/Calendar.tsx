import React, { useMemo, useState } from "react";

interface CalendarCell {
	key: string;
	label: number | null;
	isToday: boolean;
}

interface CalendarProps {
	accent: string;
}

const Calendar: React.FC<CalendarProps> = () => {
	const [currentDate, setCurrentDate] = useState(() => new Date());

	const monthInfo = useMemo(() => {
		const cursor = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		const startDay = cursor.getDay();
		const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
		const today = new Date();

		const cells: CalendarCell[] = [];

		for (let i = 0; i < startDay; i += 1) {
			cells.push({ key: `empty-${i}`, label: null, isToday: false });
		}

		for (let day = 1; day <= daysInMonth; day += 1) {
			const isToday =
				day === today.getDate() &&
				cursor.getMonth() === today.getMonth() &&
				cursor.getFullYear() === today.getFullYear();

			cells.push({ key: `day-${day}`, label: day, isToday });
		}

		return {
			monthName: cursor.toLocaleString(undefined, { month: "long", year: "numeric" }),
			cells,
		};
	}, [currentDate]);

	const changeMonth = (delta: number) => {
		setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
	};

	const weekdays = useMemo(
		() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		[],
	);

	return (
		<div className="zone-stack">
			<div className="flex items-center justify-between gap-3">
				<button type="button" onClick={() => changeMonth(-1)} className="zone-btn-ghost !px-3">
					Prev
				</button>
				<div>
					<h2 className="zone-heading">Calendar</h2>
					<p className="zone-subtle">{monthInfo.monthName}</p>
				</div>
				<button type="button" onClick={() => changeMonth(1)} className="zone-btn-ghost !px-3">
					Next
				</button>
			</div>

			<div className="zone-calendar-grid">
				{weekdays.map((weekday) => (
					<div key={weekday} className="zone-calendar-weekday">
						{weekday}
					</div>
				))}
				{monthInfo.cells.map((cell) => (
					<div
						key={cell.key}
						className={cell.isToday ? "zone-calendar-day zone-calendar-day-today" : "zone-calendar-day"}
					>
						{cell.label ?? ""}
					</div>
				))}
			</div>
		</div>
	);
};

export default Calendar;
