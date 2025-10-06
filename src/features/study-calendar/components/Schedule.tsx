import React, { useEffect, useState, useRef } from "react";
import Tabs from "./Tabs";

const generateTimeSlots = () => {
  const slots: { label: string; hour: number; period: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const period = hour < 12 ? 'am' : 'pm';
    slots.push({ label: `${hour12.toString().padStart(2,'0')}:00`, hour, period });
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
  const [isMobile, setIsMobile] = useState<boolean>(() => (typeof window !== 'undefined') ? window.matchMedia('(max-width: 900px)').matches : false);
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const n = new Date(); return n.getHours()*60 + n.getMinutes();
  });
  const currentTimeLineRef = useRef<HTMLDivElement>(null);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);

  const scrollToCurrentTime = () => {
    if (!scheduleContainerRef.current) return;
    const el = scheduleContainerRef.current;
    const hourHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hour-height')) || 88;
    const y = (currentMinutes / 60) * hourHeight - (el.clientHeight * 0.25);
    if (y > 0) el.scrollTo({ top: y, behavior: 'smooth' });
  };

  const handleTaskClick = (task: TaskItem) => {
    onEditTask(task);
  };

  useEffect(() => {
    const update = () => {
      const n = new Date();
      setCurrentMinutes(n.getHours()*60 + n.getMinutes());
    };
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { if (isMobile) scrollToCurrentTime(); }, [currentMinutes, mode, isMobile]);

  // Inactivity auto-scroll: after 5s without user scroll / mouse / key
  useEffect(() => {
    if (!scheduleContainerRef.current) return;
    let timer: any;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { scrollToCurrentTime(); }, 5000);
    };
    const el = scheduleContainerRef.current;
    ['scroll','wheel','touchstart','mousemove','keydown'].forEach(evt => window.addEventListener(evt, reset, { passive: true }));
    reset();
    return () => { clearTimeout(timer); ['scroll','wheel','touchstart','mousemove','keydown'].forEach(evt => window.removeEventListener(evt, reset)); };
  }, [isMobile, mode, currentMinutes]);

  // Media query listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 900px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const match = (e as MediaQueryList).matches;
      setIsMobile(match);
    };
    // Initial sync
    handler(mq);
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler as any);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler as any); };
  }, []);

  const containerHeight = mode === "Week" ? "80%" : undefined;
  const containerTop = mode === "Week" ? "17.5%" : undefined;

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
      <div className={`schedule-container ${mode === 'Day' ? (isMobile ? 'day-view mobile' : 'desktop-day') : 'week-view'}`} ref={scheduleContainerRef} style={{ height: containerHeight, top: containerTop }}>
        {/* Mobile timeline */}
        {mode === 'Day' && isMobile && (
          <div className="timeline" aria-hidden="true">
            {timeSlots.map(slot => (
              <div key={slot.hour} className="timeline-row">
                <span className="tl-label">{slot.label}<span className="period">{slot.period}</span></span>
                <span className="tl-line" />
              </div>
            ))}
          </div>
        )}
        {mode === 'Day' && isMobile && (
          <div className="now-marker" ref={currentTimeLineRef} style={{ top: `calc(${currentMinutes/60} * var(--hour-height))` }} aria-label="Current time" />
        )}

        {/* Mobile day tasks */}
  {mode === 'Day' && isMobile && filteredTasks.map((task, index) => {
          const startStr = task['start time']; if (!startStr) return null;
          const { hours, minutes } = parseTime(startStr);
          const duration = Math.max(15, parseInt(String(task['task duration']),10) || 0);
          const startMins = hours*60 + minutes;
          const top = `calc(${startMins/60} * var(--hour-height))`;
          const height = `calc(${duration/60} * var(--hour-height))`;
          const tagColor = '#6b7280';
          return (
            <div
              key={index}
              className="task task-day"
              style={{ top, height, borderColor: tagColor }}
              role="button"
              tabIndex={0}
              aria-label={`${task['task name'] || task.taskName} starting at ${task['start time']} for ${duration} minutes. Press Enter to edit or Delete to complete.`}
              onClick={() => handleTaskClick(task)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTaskClick(task); if (e.key === 'Delete') onTaskComplete(task.id); }}
            >
              <button onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }} className="complete-task-button" aria-label="Mark task complete" type="button">✔</button>
              {task['task name'] || task.taskName}
            </div>
          );
        })}

        {/* Desktop legacy day layout */}
        {mode === 'Day' && !isMobile && (
          <>
            {timeSlots.map((slot, index) => (
              <div key={index} className="time-slot">
                {slot.label}
                <span className="period">{slot.period}</span>
              </div>
            ))}
            <div className="current-time-line" ref={currentTimeLineRef} style={{ top: `calc(${(currentMinutes / (24 * 60)) * 100}% * 2.4)` }} />
            {filteredTasks.map((task, index) => {
              const startStr = task['start time']; if (!startStr) return null;
              const { hours, minutes } = parseTime(startStr);
              const duration = Math.max(15, parseInt(String(task['task duration']),10) || 0);
              const total = hours * 60 + minutes;
              const top = (total / (24 * 60)) * 100 * 2.4;
              const height = Math.max(1, (duration / (24 * 60)) * 100 * 2.4);
              const tagColor = '#6b7280';
              return (
                <div
                  key={`desk-${index}`}
                  className="task"
                  style={{
                    position: 'absolute',
                    top: `${top}%`,
                    height: `${height}%`,
                    boxSizing: 'border-box',
                    borderColor: tagColor,
                    background: 'repeating-linear-gradient(45deg, #6b728033 0 10px, transparent 10px 20px), linear-gradient(145deg,hsl(var(--primary) / 0.18),hsl(var(--accent) / 0.18))'
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${task['task name'] || task.taskName} starting at ${task['start time']} for ${duration} minutes. Press Enter to edit or Delete to complete.`}
                  onClick={() => onEditTask(task)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onEditTask(task); if (e.key === 'Delete') onTaskComplete(task.id); }}
                >
                  <button onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }} className="complete-task-button" aria-label="Mark task complete" type="button">✔</button>
                  {task['task name'] || task.taskName}
                </div>
              );
            })}
          </>
        )}

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
                  background: 'repeating-linear-gradient(45deg, #6b728033 0 10px, transparent 10px 20px), linear-gradient(145deg,hsl(var(--primary) / 0.18),hsl(var(--accent) / 0.18))'
                }}
                role="button"
                tabIndex={0}
                aria-label={`${task["task name"] || task.taskName} starting at ${task["start time"]} for ${duration} minutes. Press Enter to edit or Delete to complete.`}
                onClick={() => handleTaskClick(task)}
                onKeyDown={(e) => { if (e.key === 'Enter') { handleTaskClick(task);} if (e.key === 'Delete') { onTaskComplete(task.id);} }}
              >
                <button onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }} className="complete-task-button" aria-label="Mark task complete" type="button">✔</button>
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
