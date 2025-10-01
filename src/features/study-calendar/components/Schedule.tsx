import React, { useEffect, useState, useRef } from "react";
import Tabs from "./Tabs";

const generateTimeSlots = () => {
  const slots = [] as { time: string; period: string }[];
  for (let hour = 0; hour <= 24; hour++) {
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? "am" : "pm";
    const time = `${hour12.toString().padStart(2, "0")}:00`;
    slots.push({ time, period });
  }
  return slots;
};

const parseTime = (timeString: string) => {
  const [time, modifier] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  const mod = (modifier || '').toUpperCase();
  if (mod === "PM" && hours !== 12) {
    hours += 12;
  }
  if (mod === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

export interface TaskItem {
  id: string;
  [key: string]: any;
}

const Schedule = ({
  mode,
  selectedDate,
  tasks,
  onTaskComplete,
  onEditTask,
}: {
  mode: string;
  selectedDate: Date;
  tasks: TaskItem[];
  onTaskComplete: (id: string) => void;
  onEditTask: (task: TaskItem) => void;
}) => {
  const timeSlots = generateTimeSlots();
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const currentTimeLineRef = useRef<HTMLDivElement>(null);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);

  const scrollToCurrentTime = () => {
    if (currentTimeLineRef.current && scheduleContainerRef.current) {
      const currentTimeLineElement = currentTimeLineRef.current;
      const scheduleContainerElement = scheduleContainerRef.current;
      const containerHeight = scheduleContainerElement.clientHeight;
      const linePosition = currentTimeLineElement.offsetTop;
      const scrollPosition = linePosition - containerHeight / 5;
      scheduleContainerElement.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }
  };

  const handleTaskClick = (task: TaskItem) => {
    onEditTask(task);
  };

  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;
      const position = (totalMinutes / (24 * 60)) * 100;
      setCurrentTimePosition(position);
    };

    updateCurrentTimePosition();
    const intervalId = setInterval(updateCurrentTimePosition, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    scrollToCurrentTime();
  }, [currentTimePosition, mode]);

  const containerHeight = mode === "Week" ? "80%" : "82.5%";
  const containerTop = mode === "Week" ? "17.5%" : "15%";

  const tasksDate = selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).toString();
  const filteredTasks = tasks.filter((t) => t.date === tasksDate);

  const getNextFiveDates = (date: Date) => {
    const dates: string[] = [];
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(date);
      currentDate.setDate(date.getDate() + i);
      dates.push(currentDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
    }
    return dates;
  };

  const weekDates = getNextFiveDates(selectedDate);

  return (
    <div className="schedule-wrapper">
      {mode === "Week" && <Tabs selectedDate={selectedDate} />}
      <div className="schedule-container" ref={scheduleContainerRef} style={{ height: containerHeight, top: containerTop }}>
        {timeSlots.map((slot, index) => (
          <div key={index} className="time-slot">
            {slot.time}
            <span className="period">{slot.period}</span>
          </div>
        ))}
        <div className="current-time-line" ref={currentTimeLineRef} style={{ top: `calc(${currentTimePosition}% * 2.4)` }} />

        {mode === "Day" && filteredTasks.map((task, index) => {
          if (!task["start time"]) return null;
          const { hours, minutes } = parseTime(task["start time"]);
          const duration = Math.max(15, parseInt(String(task["task duration"]), 10) || 0);
          const total = hours * 60 + minutes; // minutes since midnight
          // Scale to the scroll content height (approx 2.4x container due to 24h across 10 rows)
          const top = (total / (24 * 60)) * 100 * 2.4;
          const height = Math.max(1, (duration / (24 * 60)) * 100 * 2.4);
          const tagColor = '#6b7280';
          return (
            <div
              key={index}
              className="task"
              style={{
                position: 'absolute',
                top: `${top}%`,
                height: `${height}%`,
                boxSizing: 'border-box',
                borderColor: tagColor,
                background: `repeating-linear-gradient(45deg, ${tagColor}33, ${tagColor}33 10px, transparent 10px, transparent 20px)`
              }}
              onClick={() => handleTaskClick(task)}
            >
              <button onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }} className="complete-task-button">✔</button>
              {task["task name"] || task.taskName}
            </div>
          );
        })}

        {mode === "Week" && weekDates.map((date, dayIndex) => {
          const dayTasks = tasks.filter(task => task.date === date);
          const dayLeft = `${dayIndex * 18.74 + 7.85}%`;
          return dayTasks.map((task, index) => {
            if (!task["start time"]) return null;
            const { hours, minutes } = parseTime(task["start time"]);
            const duration = Math.max(15, parseInt(String(task["task duration"]), 10) || 0);
            const total = hours * 60 + minutes;
            const top = (total / (24 * 60)) * 100 * 2.4;
            const height = Math.max(1, (duration / (24 * 60)) * 100 * 2.4);
            const tagColor = '#6b7280';
            return (
              <div
                key={`${dayIndex}-${index}`}
                className="task"
                style={{
                  position: 'absolute',
                  top: `${top}%`,
                  height: `${height}%`,
                  left: dayLeft,
                  width: '17.28%',
                  boxSizing: 'border-box',
                  borderColor: tagColor,
                  background: `repeating-linear-gradient(45deg, ${tagColor}33, ${tagColor}33 10px, transparent 10px, transparent 20px)`
                }}
                onClick={() => handleTaskClick(task)}
              >
                <button onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }} className="complete-task-button">✔</button>
                {task["task name"] || task.taskName}
              </div>
            );
          });
        })}

        {mode === "Week" && (
          <>
            <div className="week-divider" style={{ left: '25.76%', height: "250%" }}></div>
            <div className="week-divider" style={{ left: '44.50%', height: "250%", width: "0.5px" }}></div>
            <div className="week-divider" style={{ left: '63.13%', height: "250%", width: "0.5px" }}></div>
            <div className="week-divider" style={{ left: '82.07%', height: "250%" }}></div>
          </>
        )}
      </div>
    </div>
  );
};

export default Schedule;
