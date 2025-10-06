import React, { useEffect, useMemo, useState } from "react";
import Calendar from "./components/Calendar";
import Schedule, { TaskItem } from "./components/Schedule";
import TimeLeftWidget from "./components/TimeLeftWidget";
import "./styles/planner.css";
import { textToTask } from "./ai/gemini";

function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Tags removed

const PlannerView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mode, setMode] = useState("Day");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [taskDate, setTaskDate] = useState(""); // yyyy-mm-dd from input[type=date]
  const [taskStartTime, setTaskStartTime] = useState(""); // HH:MM from input[type=time]
  const [taskDuration, setTaskDuration] = useState(""); // minutes string
  // Mobile calendar collapse
  const [mobileCalOpen, setMobileCalOpen] = useState(false);
  // tags removed

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState(""); // yyyy-mm-dd
  const [editStartTime, setEditStartTime] = useState(""); // HH:MM
  const [editDuration, setEditDuration] = useState(""); // minutes
  // tags removed

  // Load/save local state similar to Pulse
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("planner_tasks");
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      const savedMode = localStorage.getItem("planner_mode");
      if (savedMode) setMode(savedMode);
    } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("planner_tasks", JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem("planner_mode", mode); }, [mode]);

  const formattedHeaderDate = useMemo(() => {
    const day = selectedDate.getDate();
    const ordinalDay = `${day}${getOrdinalSuffix(day)}`;
    const weekday = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const month = selectedDate.toLocaleDateString('en-US', { month: 'short' });
    const year = selectedDate.getFullYear();
    return `${weekday}, ${month} ${ordinalDay}, ${year}`;
  }, [selectedDate]);

  const addQuickTask = () => {
    // Minimal quick demo task added at 10:00am for 60min
    const id = crypto.randomUUID?.() || String(Date.now());
    const date = selectedDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const task: TaskItem = {
      id,
      "task name": "Study Session",
      "start time": "10:00 AM",
      "task duration": 60,
      "end time": "11:00 AM",
      date,
  // tags removed
    };
    setTasks((prev) => [...prev, task]);
  };

  const handleTaskComplete = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const handleEditTask = (task: TaskItem) => {
    setEditTask(task);
    setEditName(String(task["task name"] || ""));
    // Convert MM/DD/YYYY -> yyyy-mm-dd
    const toInputDate = (d: string) => {
      if (!d) return "";
      const [mm, dd, yyyy] = d.split('/').map(Number);
      if (!mm || !dd || !yyyy) return "";
      return `${String(yyyy).padStart(4,'0')}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
    };
    // Convert 12h to 24h HH:MM
    const toInputTime = (t12: string) => {
      if (!t12) return "";
      const [time, mer] = t12.split(' ');
      let [h, m] = time.split(':').map(Number);
      const up = (mer||'').toUpperCase();
      if (up === 'PM' && h !== 12) h += 12; if (up === 'AM' && h === 12) h = 0;
      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
    };
    setEditDate(toInputDate(String(task.date || "")));
    setEditStartTime(toInputTime(String(task["start time"] || "")));
    setEditDuration(String(task["task duration"] ?? ""));
  // tags removed
    setEditOpen(true);
  };

  const toMinutes = (time12: string) => {
    const [time, mer] = time12.trim().split(' ');
    let [h, m] = time.split(':').map(Number);
    const up = (mer || '').toUpperCase();
    if (up === 'PM' && h !== 12) h += 12;
    if (up === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const toTime12 = (mins: number) => {
    mins = ((mins % (24*60)) + (24*60)) % (24*60);
    let h = Math.floor(mins / 60);
    const m = mins % 60;
    const mer = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} ${mer}`;
  };

  const usDate = (d: Date) => d.toLocaleDateString('en-US', { year:'numeric', month:'2-digit', day:'2-digit' });
  const fromInputDate = (value: string) => { // yyyy-mm-dd -> MM/DD/YYYY
    if (!value) return usDate(selectedDate);
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, (m||1)-1, d||1).toLocaleDateString('en-US', { year:'numeric', month:'2-digit', day:'2-digit' });
  };

  // Heuristic fallbacks when AI doesn't provide a time
  const roundUpToNextQuarter = (mins: number) => {
    const q = Math.ceil(mins / 15) * 15; return q;
  };
  const keywordFallbackStart = (text: string) => {
    const s = text.toLowerCase();
    if (/breakfast/.test(s)) return 8 * 60;
    if (/(lunch|lunchtime)/.test(s)) return 13 * 60;
    if (/(dinner|supper)/.test(s)) return 19 * 60;
    if (/(gym|workout|run|exercise)/.test(s)) return 18 * 60;
    if (/(study|revise|homework|revision)/.test(s)) return 18 * 60;
    if (/(sleep|bed|bedtime)/.test(s)) return 23 * 60;
    if (/(meeting|call|standup)/.test(s)) {
      const now = new Date();
      const minsNow = now.getHours() * 60 + now.getMinutes();
      return roundUpToNextQuarter(minsNow + 30);
    }
    return null;
  };
  const chooseFallbackStart = (text: string, targetDateStr: string) => {
    const kw = keywordFallbackStart(text);
    if (kw != null) return kw;
    // If target is today, choose next quarter hour; else 14:00 for general tasks
    const [mm, dd, yyyy] = targetDateStr.split('/').map(Number);
    const d = new Date((yyyy||2000), (mm||1)-1, dd||1);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    if (isToday) {
      const minsNow = today.getHours() * 60 + today.getMinutes();
      return roundUpToNextQuarter(minsNow + 15);
    }
    return 14 * 60;
  };

  const findNextFreeSlot = (dateStr: string, startMin: number, durationMin: number, excludeId?: string) => {
    const dayTasks = tasks.filter(t => t.date === dateStr && (!excludeId || t.id !== excludeId));
    const intervals = dayTasks.map(t => ({
      s: toMinutes(String(t["start time"] || t.startTime || '12:00 AM')),
      e: function(){ const dur = parseInt(String(t["task duration"] || t.taskDuration || 0), 10) || 0; return this.s + dur; }()
    })).sort((a,b)=>a.s-b.s);
    let s = startMin;
    const limit = (24*60) - durationMin;
    const step = 15; // minutes
    while (s <= limit) {
      const e = s + durationMin;
      const overlap = intervals.some(iv => Math.max(iv.s, s) < Math.min(iv.e, e));
      if (!overlap) return { s, e, date: dateStr };
      s += step;
    }
    // If no slot today, place next day at 08:00
  // new Date(dateStr) is unreliable; parse manually
    const [mm,dd,yy] = dateStr.split('/').map(Number);
    const base = new Date((yy||2000), (mm||1)-1, dd||1);
    base.setDate(base.getDate()+1);
    const dateNext = usDate(base);
    return { s: 8*60, e: 8*60 + durationMin, date: dateNext };
  };

  const addTaskFromAI = async () => {
    if (!aiInput.trim()) return;
    setAiBusy(true);
    try {
      const dateStr = usDate(selectedDate);
      const existing = tasks.map(t => ({
        "task name": t["task name"] || t.taskName,
        "start time": t["start time"] || t.startTime,
        "task duration": t["task duration"] || t.taskDuration,
        "end time": t["end time"] || t.endTime,
        "date": t.date,
        "tag": t.tag,
      }));
  const task = await textToTask(aiInput, [], existing);
      const id = crypto.randomUUID?.() || String(Date.now());
      // Apply optional user-provided constraints
      const overrideDate = taskDate ? fromInputDate(taskDate) : undefined;
      const overrideStart = taskStartTime ? toTime12((() => { const [H,M] = taskStartTime.split(':').map(Number); return (H*60+M); })()) : undefined;
      const overrideDur = taskDuration ? parseInt(taskDuration,10) : undefined;
  // tags removed

      const initialDate = overrideDate || task.date || dateStr;
      // Decide starting minutes smartly
      let startMin: number;
      if (overrideStart) startMin = toMinutes(overrideStart);
      else if (task["start time"]) startMin = toMinutes(String(task["start time"]));
      else startMin = chooseFallbackStart(aiInput, initialDate);

      const durationMin = Math.max(15, overrideDur ?? task["task duration"] ?? 60);
      // Avoid past times if target is today
      const [mm, dd, yyyy] = initialDate.split('/').map(Number);
      const target = new Date((yyyy||2000), (mm||1)-1, dd||1);
      const today = new Date();
      if (target.toDateString() === today.toDateString()) {
        const minsNow = today.getHours() * 60 + today.getMinutes();
        if (startMin < minsNow) startMin = roundUpToNextQuarter(minsNow + 15);
      }

      // Find a non-overlapping slot
      const placed = findNextFreeSlot(initialDate, startMin, durationMin);
      const normalized: TaskItem = {
        id,
        "task name": task["task name"] ?? aiInput.trim().slice(0, 64),
        "start time": toTime12(placed.s),
        "task duration": durationMin,
        "end time": toTime12(placed.e),
        date: placed.date,
        // tags removed
      };
      setTasks(prev => [...prev, normalized]);
      setAiInput(""); setTaskDate(""); setTaskStartTime(""); setTaskDuration(""); setShowMoreOptions(false); setAiOpen(false);
    } catch (e) {
      console.error("AI create failed", e);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="planner-root">
      <div className="planner-header">
        <h1 className="planner-title">{formattedHeaderDate}</h1>
        <div className="planner-controls">
          <select className="planner-select" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="Day">Day</option>
            <option value="Week">Week</option>
          </select>
          <button className="planner-today" onClick={() => setSelectedDate(new Date())}>Today</button>
        </div>
	<div className="planner-actions">
	  <button className="planner-new" onClick={() => { setAiOpen(true); setShowMoreOptions(false); }}>New Task</button>
	  <button
	    type="button"
	    className="mobile-cal-toggle planner-today"
	    onClick={() => setMobileCalOpen(o => !o)}
	    aria-expanded={mobileCalOpen}
	    aria-controls="planner-mobile-calendar"
	  >
	    {mobileCalOpen ? 'Hide calendar' : 'Show calendar'}
	  </button>
	</div>
      </div>
      <div id="planner-mobile-calendar" className={`mobile-calendar-wrapper ${mobileCalOpen ? 'open' : ''}`}>
        <Calendar onDateChange={setSelectedDate} selectedDate={selectedDate} mode={mode} />
      </div>
  <Schedule mode={mode} selectedDate={selectedDate} tasks={tasks} onTaskComplete={handleTaskComplete} onEditTask={handleEditTask} />
  <TimeLeftWidget />

      {aiOpen && (
        <div className="blur-background" aria-modal="true" role="dialog" aria-label="Add task with AI">
          <div
            className="popup"
            style={{
              width: 'min(520px, 92vw)',
              height: 'auto',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'center',
              padding: '1.1rem 1.2rem 1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Add task with AI</h3>
              <button
                className="complete-task-button"
                style={{ position: 'static', marginLeft: 'auto' }}
                aria-label="Close"
                onClick={() => setAiOpen(false)}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                className="neu-input-el"
                placeholder="Enter your task (natural language)"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                style={{ width: '100%', border: '1px solid hsl(var(--foreground)/0.2)', borderRadius: 10, padding: '0.7rem 0.9rem', fontSize: '.85rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setShowMoreOptions(v => !v)}
                  className="planner-today"
                  style={{ marginTop: 0 }}
                  aria-expanded={showMoreOptions}
                  aria-controls="ai-extra-options"
                >
                  {showMoreOptions ? 'Hide options' : 'View more options'}
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="planner-today" onClick={() => setAiOpen(false)}>Cancel</button>
                  <button className="planner-new" onClick={addTaskFromAI} disabled={aiBusy || !aiInput.trim()}>{aiBusy ? 'Adding…' : 'Add task'}</button>
                </div>
              </div>
              {showMoreOptions && (
                <div
                  id="ai-extra-options"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))',
                    gap: 14,
                    marginTop: 4,
                    alignItems: 'start'
                  }}
                >
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '.7rem' }}>
                    <span style={{ opacity: 0.8 }}>Date</span>
                    <input
                      type="date"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      className="neu-input-el"
                      style={{ border: '1px solid hsl(var(--foreground)/0.2)', borderRadius: 8, padding: '0.5rem', fontSize: '.75rem' }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '.7rem' }}>
                    <span style={{ opacity: 0.8 }}>Start time</span>
                    <input
                      type="time"
                      value={taskStartTime}
                      onChange={(e) => setTaskStartTime(e.target.value)}
                      className="neu-input-el"
                      style={{ border: '1px solid hsl(var(--foreground)/0.2)', borderRadius: 8, padding: '0.5rem', fontSize: '.75rem' }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '.7rem' }}>
                    <span style={{ opacity: 0.8 }}>Duration (min)</span>
                    <input
                      type="number"
                      min={0}
                      step={15}
                      value={taskDuration}
                      onChange={(e) => setTaskDuration(e.target.value)}
                      className="neu-input-el"
                      style={{ border: '1px solid hsl(var(--foreground)/0.2)', borderRadius: 8, padding: '0.5rem', fontSize: '.75rem' }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editOpen && editTask && (
        <div className="blur-background">
          <div className="popup task-popup" style={{ padding: '1rem' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit task</h3>
              <button className="complete-task-button" onClick={() => setEditOpen(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display:'grid', gap:12 }}>
              <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <span>Task name</span>
                <input type="text" className="neu-input-el" value={editName} onChange={(e)=>setEditName(e.target.value)} style={{ border:'1px solid hsl(var(--foreground)/0.2)', borderRadius:8, padding:'0.5rem' }} />
              </label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Date</span>
                  <input type="date" className="neu-input-el" value={editDate} onChange={(e)=>setEditDate(e.target.value)} style={{ border:'1px solid hsl(var(--foreground)/0.2)', borderRadius:8, padding:'0.5rem' }} />
                </label>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Start time</span>
                  <input type="time" className="neu-input-el" value={editStartTime} onChange={(e)=>setEditStartTime(e.target.value)} style={{ border:'1px solid hsl(var(--foreground)/0.2)', borderRadius:8, padding:'0.5rem' }} />
                </label>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Duration (min)</span>
                  <input type="number" min={0} step={15} className="neu-input-el" value={editDuration} onChange={(e)=>setEditDuration(e.target.value)} style={{ border:'1px solid hsl(var(--foreground)/0.2)', borderRadius:8, padding:'0.5rem' }} />
                </label>
                {/* tags removed */}
              </div>

              {/* AI reschedule removed as requested */}
            </div>
            <div className="modal-footer" style={{ display:'flex', gap:8, justifyContent:'space-between', marginTop:12 }}>
              <div style={{ display:'flex', gap:8 }}>
                <button className="planner-today" onClick={()=>{ if(editTask) { setTasks(prev=>prev.filter(t=>t.id!==editTask.id)); setEditOpen(false);} }}>Delete</button>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="planner-today" onClick={()=> setEditOpen(false)}>Cancel</button>
                <button className="planner-today" onClick={() => {
                  if (!editTask) return;
                  const to12 = (hhmm:string) => { if(!hhmm) return String(editTask["start time"]||"10:00 AM"); const [H,M] = hhmm.split(':').map(Number); return toTime12((H||10)*60+(M||0)); };
                  const newDate = editDate ? fromInputDate(editDate) : String(editTask.date);
                  const start12 = to12(editStartTime);
                  const dur = Math.max(15, parseInt(editDuration||"0",10) || Number(editTask["task duration"]) || 60);
                  const end12 = toTime12(toMinutes(start12) + dur);
                  const updated: TaskItem = { ...editTask, ["task name"]: editName || editTask["task name"], date: newDate, ["start time"]: start12, ["task duration"]: dur, ["end time"]: end12 };
                  setTasks(prev => prev.map(t => t.id === editTask.id ? updated : t));
                  setEditOpen(false);
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerView;
