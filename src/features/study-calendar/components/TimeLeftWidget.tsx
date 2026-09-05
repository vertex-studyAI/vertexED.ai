import React, { useEffect, useState } from "react";

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const TimeLeftWidget = () => {
  const [timeCompletedInHour, setTimeCompletedInHour] = useState(0);
  const [timeCompletedInDay, setTimeCompletedInDay] = useState(0);
  const [timeCompletedInWeek, setTimeCompletedInWeek] = useState(0);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 0, 0, 0);

      const totalMillisecondsInHour = 60 * 60 * 1000;
      const totalMillisecondsInDay = 24 * 60 * 60 * 1000;
      const totalMillisecondsInWeek = 7 * 24 * 60 * 60 * 1000;

      setTimeCompletedInHour(((now.getTime() - startOfHour.getTime()) / totalMillisecondsInHour) * 100);
      setTimeCompletedInDay(((now.getTime() - startOfDay.getTime()) / totalMillisecondsInDay) * 100);
      setTimeCompletedInWeek(((now.getTime() - startOfWeek.getTime()) / totalMillisecondsInWeek) * 100);
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
