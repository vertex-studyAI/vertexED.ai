import React, { useEffect, useState } from "react";

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const elapsedPercent = (now: Date, start: Date, end: Date) => {
  const span = end.getTime() - start.getTime();
  if (!Number.isFinite(span) || span <= 0) return 0;
  return ((now.getTime() - start.getTime()) / span) * 100;
};

const TimeLeftWidget = () => {
  const [timeCompletedInHour, setTimeCompletedInHour] = useState(0);
  const [timeCompletedInDay, setTimeCompletedInDay] = useState(0);
  const [timeCompletedInWeek, setTimeCompletedInWeek] = useState(0);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
      const endOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0, 0, 0);
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7, 0, 0, 0, 0);

      // Use real local calendar boundaries rather than fixed 24h/7d millisecond
      // constants. Local days and weeks can be 23/25 hours around daylight-saving
      // transitions, and the progress UI should reflect the actual current period.
      setTimeCompletedInHour(elapsedPercent(now, startOfHour, endOfHour));
      setTimeCompletedInDay(elapsedPercent(now, startOfDay, endOfDay));
      setTimeCompletedInWeek(elapsedPercent(now, startOfWeek, endOfWeek));
    };

    updateTimes();
    const interval = setInterval(updateTimes, 30000);
    return () => clearInterval(interval);
  }, []);

  const hourProgress = clampProgress(timeCompletedInHour);
  const dayProgress = clampProgress(timeCompletedInDay);
  const weekProgress = clampProgress(timeCompletedInWeek);

  return (
    <div className="time-left-widget" aria-label="Time elapsed">
      <div className="time-bar">
        <span>Hour:</span>
        <div
          className="bar"
          role="progressbar"
          aria-label="Time elapsed in current hour"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={hourProgress}
          aria-valuetext={`${hourProgress}% of the current hour elapsed`}
        >
          <div className="fill" aria-hidden="true" style={{ width: `${hourProgress}%` }}></div>
        </div>
      </div>
      <div className="time-bar">
        <span>Day:</span>
        <div
          className="bar"
          role="progressbar"
          aria-label="Time elapsed in current day"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={dayProgress}
          aria-valuetext={`${dayProgress}% of the current day elapsed`}
        >
          <div className="fill" aria-hidden="true" style={{ width: `${dayProgress}%` }}></div>
        </div>
      </div>
      <div className="time-bar">
        <span>Week:</span>
        <div
          className="bar"
          role="progressbar"
          aria-label="Time elapsed in current week"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={weekProgress}
          aria-valuetext={`${weekProgress}% of the current week elapsed`}
        >
          <div className="fill" aria-hidden="true" style={{ width: `${weekProgress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default TimeLeftWidget;
