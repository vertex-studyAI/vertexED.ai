import React from "react";

const Tabs = ({ selectedDate }: { selectedDate: Date }) => {
  const getNextDate = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + days);
    return nextDate.getDate();
  };

  const day0 = selectedDate.getDate();
  const day1 = getNextDate(selectedDate, 1);
  const day2 = getNextDate(selectedDate, 2);
  const day3 = getNextDate(selectedDate, 3);
  const day4 = getNextDate(selectedDate, 4);

  return (
    <div className="tabs-container">
      <div className="tabs">{day0}</div>
      <div className="tabs" style={{ left: '19.5%' }}>{day1}</div>
      <div className="tabs" style={{ left: '38%' }}>{day2}</div>
      <div className="tabs" style={{ left: '56.5%' }}>{day3}</div>
      <div className="tabs" style={{ left: '75%' }}>{day4}</div>
    </div>
  );
};

export default Tabs;
