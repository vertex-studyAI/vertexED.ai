import React, { useEffect, useState } from "react";

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

  return (
    <div className="time-left-widget">
      <div className="time-bar"><span>Hour:</span><div className="bar"><div className="fill" style={{ width: `${timeCompletedInHour}%` }}></div></div></div>
      <div className="time-bar"><span>Day:</span><div className="bar"><div className="fill" style={{ width: `${timeCompletedInDay}%` }}></div></div></div>
      <div className="time-bar"><span>Week:</span><div className="bar"><div className="fill" style={{ width: `${timeCompletedInWeek}%` }}></div></div></div>
    </div>
  );
};

export default TimeLeftWidget;
