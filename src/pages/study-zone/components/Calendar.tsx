import React, { useMemo, useState } from "react";
import { ghostButtonStyle, subtleTextStyle } from "../styles";

interface CalendarCell {
	key: string;
	label: number | null;
	isToday: boolean;
}

interface CalendarProps {
	accent: string;
}

const gridStyle: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
	gap: "10px",
};

const weekdayStyle: React.CSSProperties = {
	...subtleTextStyle,
	textAlign: "center",
	fontSize: "12px",
	letterSpacing: "0.12em",
	textTransform: "uppercase",
};

const baseDayStyle: React.CSSProperties = {
	padding: "14px 0",
	textAlign: "center",
	borderRadius: "14px",
	border: "1px solid rgba(255,255,255,0.05)",
	background: "rgba(12,14,22,0.6)",
	color: "#E7EAFF",
};

const todayDayStyle = (accent: string): React.CSSProperties => ({
	...baseDayStyle,
	background: accent,
	color: "#11131c",
	fontWeight: 600,
	boxShadow: `${accent}33 0 18px 24px`,
});

const Calendar: React.FC<CalendarProps> = ({ accent }) => {
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
		<div style={{ display: "grid", gap: "18px" }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
				<button type="button" onClick={() => changeMonth(-1)} style={{ ...ghostButtonStyle, paddingInline: "12px" }}>
					Prev
				</button>
				<div>
					<h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>Calendar</h2>
					<p style={subtleTextStyle}>{monthInfo.monthName}</p>
				</div>
				<button type="button" onClick={() => changeMonth(1)} style={{ ...ghostButtonStyle, paddingInline: "12px" }}>
					Next
				</button>
			</div>

			<div style={gridStyle}>
				{weekdays.map((weekday) => (
					<div key={weekday} style={weekdayStyle}>
						{weekday}
					</div>
				))}
				{monthInfo.cells.map((cell) => (
					<div key={cell.key} style={cell.isToday ? todayDayStyle(accent) : baseDayStyle}>
						{cell.label ?? ""}
					</div>
				))}
			</div>
		</div>
	);
};

export default Calendar;

