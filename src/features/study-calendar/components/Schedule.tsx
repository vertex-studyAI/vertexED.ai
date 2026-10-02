import React from 'react';
import { plannerTimeToMinutes } from '@/lib/plannerTasks.mjs';

export interface TaskItem {
  id: string;
  [key: string]: any;
}

const taskName = (task: TaskItem) => String(task['task name'] || task.taskName || 'Study task');

// A normal-flow agenda keeps short tasks, long names and keyboard controls
// readable. Calendar hours no longer create a page-sized pointer overlay.
export default function Schedule({ mode, selectedDate, tasks, onTaskComplete, onEditTask }: {
  mode: string;
  selectedDate: Date;
  tasks: TaskItem[];
  onTaskComplete: (id: string) => void;
  onEditTask: (task: TaskItem) => void;
}) {
  const dates = Array.from({ length: mode === 'Week' ? 7 : 1 }, (_, index) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + index);
    return date;
  });
  const handleTaskClick = (task: TaskItem) => onEditTask(task);
  return <div className="planner-agenda" role="region" aria-label={`${mode} planner schedule for ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}>
    {dates.map(date => {
      const key = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const dayTasks = tasks.filter(task => !task.completed && task.date === key).sort((a, b) => plannerTimeToMinutes(a['start time']) - plannerTimeToMinutes(b['start time']));
      return <section key={key} className="planner-agenda-day" aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}>
        <h2>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
        {dayTasks.length === 0 ? <p className="text-muted-foreground">No tasks scheduled. Use New Task to reserve a study block or commitment.</p> : <ul>
          {dayTasks.map(task => {
            const name = taskName(task), duration = task['task duration'], startTime = task['start time'];
            return <li key={task.id} className="planner-agenda-task" role="group" aria-label={`${name} actions`}>
              <div><p className="planner-agenda-time">{startTime} to {task['end time']} · {duration} minutes</p>
                <h3>{name}</h3><p className="text-sm text-muted-foreground">{task.taskKind === 'commitment' ? 'Fixed commitment' : task.reschedule ? 'Flexible study block' : 'Fixed study block'}{task.dueDate ? ` · Due ${task.dueDate}` : ''}{task.priority === 3 ? ' · High priority' : ''}</p>
              </div>
              <div className="planner-agenda-actions">
                <button type="button" className="task-edit-button planner-today focus-visible:ring-2" aria-label={`Edit ${name}, starting at ${startTime} for ${duration} minutes`} onClick={() => handleTaskClick(task)}>Edit</button>
                <button type="button" className="planner-today" aria-label={`Mark ${name} complete`} onClick={() => onTaskComplete(task.id)}>Complete</button>
              </div>
            </li>;
          })}
        </ul>}
      </section>;
    })}
  </div>;
}
