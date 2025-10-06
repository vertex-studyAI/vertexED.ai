import React, { useState, useEffect } from "react";

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  mode: string; // "Day" | "Week"
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, mode }) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);

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
    days.push(
      <div
        key={"prev" + i}
        className="calendar-day previous-month"
        role="button"
        tabIndex={0}
        aria-label={`Previous month day ${daysInPreviousMonth - i}`}
        onClick={() => {
          const newDate = new Date(previousMonthYear, previousMonth, daysInPreviousMonth - i);
          setCurrentDate(newDate);
          onDateChange(newDate);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const newDate = new Date(previousMonthYear, previousMonth, daysInPreviousMonth - i); setCurrentDate(newDate); onDateChange(newDate);} }}
      >
        {daysInPreviousMonth - i}
      </div>
    );
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const isHighlighted = mode === "Week" && i > currentDay && i <= currentDay + 4;
    days.push(
      <div
        key={i}
        className={`calendar-day ${i === currentDay ? "accent" : ""} ${isHighlighted ? "highlight" : ""}`}
        role="button"
        tabIndex={0}
        aria-current={i === currentDay ? 'date' : undefined}
        aria-label={`Select ${new Date(currentYear, currentMonth, i).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric'})}`}
        onClick={() => {
          const newDate = new Date(currentYear, currentMonth, i);
          setCurrentDate(newDate);
          onDateChange(newDate);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const newDate = new Date(currentYear, currentMonth, i); setCurrentDate(newDate); onDateChange(newDate);} }}
      >
        {i}
      </div>
    );
  }
  for (let i = 1; i < 7 - lastDayOfMonth; i++) {
    days.push(
      <div
        key={"next" + i}
        className="calendar-day next-month"
        role="button"
        tabIndex={0}
        aria-label={`Next month day ${i}`}
        onClick={() => {
          const newDate = new Date(nextMonthYear, nextMonth, i);
          setCurrentDate(newDate);
          onDateChange(newDate);
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const newDate = new Date(nextMonthYear, nextMonth, i); setCurrentDate(newDate); onDateChange(newDate);} }}
      >
        {i}
      </div>
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
        <div className="calendar-header" role="heading" aria-level={2}>
          <button onClick={handlePreviousMonth} className="calendar-arrow" aria-label="Previous month" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span aria-live="polite">{currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          <button onClick={handleNextMonth} className="calendar-arrow" aria-label="Next month" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="calendar-grid" role="grid">
          {days}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
