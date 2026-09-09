import React, { useState, useEffect } from "react";
import "../styles/calendar-native-controls.css";

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  mode: string; // "Day" | "Week"
}

const isSameCalendarDay = (left: Date, right: Date) => (
  left.getFullYear() === right.getFullYear()
  && left.getMonth() === right.getMonth()
  && left.getDate() === right.getDate()
);

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, mode }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const today = new Date();

  useEffect(() => {
    setCurrentDate(selectedDate);
  }, [selectedDate]);

  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const lastDayOfMonth = new Date(currentYear, currentMonth, daysInMonth).getDay();

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPreviousMonth = new Date(previousMonthYear, previousMonth + 1, 0).getDate();

  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const days: React.ReactNode[] = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPreviousMonth - i;
    const dayDate = new Date(previousMonthYear, previousMonth, day);
    days.push(
      <button
        key={"prev" + i}
        type="button"
        className="calendar-day previous-month"
        aria-current={isSameCalendarDay(dayDate, today) ? 'date' : undefined}
        aria-pressed={isSameCalendarDay(dayDate, currentDate)}
        aria-label={`Select ${dayDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}`}
        onClick={() => {
          setCurrentDate(dayDate);
          onDateChange(dayDate);
        }}
      >
        {day}
      </button>
    );
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const isHighlighted = mode === "Week" && i > currentDay && i <= currentDay + 4;
    const dayDate = new Date(currentYear, currentMonth, i);
    days.push(
      <button
        key={i}
        type="button"
        className={`calendar-day ${i === currentDay ? "accent" : ""} ${isHighlighted ? "highlight" : ""}`}
        aria-current={isSameCalendarDay(dayDate, today) ? 'date' : undefined}
        aria-pressed={isSameCalendarDay(dayDate, currentDate)}
        aria-label={`Select ${dayDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}`}
        onClick={() => {
          setCurrentDate(dayDate);
          onDateChange(dayDate);
        }}
      >
        {i}
      </button>
    );
  }
  for (let i = 1; i < 7 - lastDayOfMonth; i++) {
    const dayDate = new Date(nextMonthYear, nextMonth, i);
    days.push(
      <button
        key={"next" + i}
        type="button"
        className="calendar-day next-month"
        aria-current={isSameCalendarDay(dayDate, today) ? 'date' : undefined}
        aria-pressed={isSameCalendarDay(dayDate, currentDate)}
        aria-label={`Select ${dayDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}`}
        onClick={() => {
          setCurrentDate(dayDate);
          onDateChange(dayDate);
        }}
      >
        {i}
      </button>
    );
  }

  const handlePreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  return (
    <div>
      <div className="calendar" role="group" aria-label="Calendar date picker">
        <div className="calendar-header">
          <button onClick={handlePreviousMonth} className="calendar-arrow" aria-label="Previous month" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span role="heading" aria-level={2} aria-live="polite">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          <button onClick={handleNextMonth} className="calendar-arrow" aria-label="Next month" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="calendar-grid" role="group" aria-label="Choose a date">
          {days}
        </div>
      </div>
    </div>
  );
};

export default Calendar;