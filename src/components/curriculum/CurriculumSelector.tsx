import { useMemo } from 'react';
import type { CurriculumPreference, ExamBoard } from '@/types/curriculum';
import {
  BOARD_CONFIGS,
  EXAM_BOARDS,
  getGradesForBoard,
  getSubjectsForBoard,
} from '@/lib/curriculum';
import { cn } from '@/lib/utils';

type CurriculumSelectorProps = {
  value: CurriculumPreference;
  onChange: (next: CurriculumPreference) => void;
  showExamDate?: boolean;
  showSubjects?: boolean;
  multiSubject?: boolean;
  compact?: boolean;
  className?: string;
};

export default function CurriculumSelector({
  value,
  onChange,
  showExamDate = false,
  showSubjects = true,
  multiSubject = true,
  compact = false,
  className,
}: CurriculumSelectorProps) {
  const grades = useMemo(
    () => (value.board ? getGradesForBoard(value.board) : []),
    [value.board],
  );

  const subjects = useMemo(
    () => (value.board ? getSubjectsForBoard(value.board, value.grade) : []),
    [value.board, value.grade],
  );

  const handleBoardChange = (board: ExamBoard) => {
    onChange({
      ...value,
      board,
      grade: null,
      subjects: [],
      examTargets: [],
    });
  };

  const toggleSubject = (subject: string) => {
    if (multiSubject) {
      const next = value.subjects.includes(subject)
        ? value.subjects.filter((s) => s !== subject)
        : [...value.subjects, subject];
      onChange({ ...value, subjects: next, examTargets: value.examTargets?.filter((target) => next.includes(target.subject)) });
    } else {
      onChange({ ...value, subjects: [subject] });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className={compact ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
        <div>
          <label htmlFor="curriculum-board" className="form-label">
            Exam board
          </label>
          <select
            id="curriculum-board"
            className="form-control-select"
            value={value.board ?? ''}
            onChange={(e) => handleBoardChange(e.target.value as ExamBoard)}
          >
            <option value="">Select your board</option>
            {EXAM_BOARDS.map((id) => (
              <option key={id} value={id}>
                {BOARD_CONFIGS[id].label}
              </option>
            ))}
          </select>
        </div>

        {value.board && (
          <div>
            <label htmlFor="curriculum-grade" className="form-label">
              Grade / year
            </label>
            <select
              id="curriculum-grade"
              className="form-control-select"
              value={value.grade ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  grade: e.target.value ? parseInt(e.target.value, 10) : null,
                  subjects: [],
                  examTargets: [],
                })
              }
            >
              <option value="">Select grade</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {showExamDate && (
        <div>
          <label htmlFor="curriculum-exam-date" className="form-label">
            Exam date (optional)
          </label>
          <input
            id="curriculum-exam-date"
            type="date"
            className="form-control"
            value={value.examDate ?? ''}
            onChange={(e) => onChange({ ...value, examDate: e.target.value || null })}
          />
        </div>
      )}

      {showSubjects && value.board && subjects.length > 0 && (
        <div>
          <p className="form-label">
            Subjects {multiSubject ? '(select all that apply)' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => {
              const selected = value.subjects.includes(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'surface-chip text-muted-foreground hover:text-foreground hover:border-primary/25 hover:bg-foreground/[0.07]',
                  )}
                  aria-pressed={selected}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {showExamDate && value.subjects.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="form-label">Subject and paper dates</legend>
          <p className="text-sm text-muted-foreground">Add dates from your exam timetable. These take priority over your general exam date.</p>
          {(value.examTargets ?? []).map((target, index) => (
            <div key={target.id} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-2">
              <label className="form-label">Subject
                <select className="form-control-select" value={target.subject} onChange={(event) => onChange({ ...value, examTargets: value.examTargets?.map((item) => item.id === target.id ? { ...item, subject: event.target.value } : item) })}>
                  {value.subjects.map((subject) => <option key={subject}>{subject}</option>)}
                </select>
              </label>
              <label className="form-label">Paper (optional)
                <input className="form-control" maxLength={100} value={target.paper} placeholder="Paper 1" onChange={(event) => onChange({ ...value, examTargets: value.examTargets?.map((item) => item.id === target.id ? { ...item, paper: event.target.value } : item) })} />
              </label>
              <label className="form-label">Exam date
                <input className="form-control" type="date" required value={target.date} onChange={(event) => onChange({ ...value, examTargets: value.examTargets?.map((item) => item.id === target.id ? { ...item, date: event.target.value } : item) })} />
              </label>
              <button className="text-sm text-primary underline self-center" type="button" aria-label={`Remove exam date ${index + 1}`} onClick={() => onChange({ ...value, examTargets: value.examTargets?.filter((item) => item.id !== target.id) })}>Remove date</button>
            </div>
          ))}
          <button className="btn-secondary" type="button" disabled={(value.examTargets?.length ?? 0) >= 50} onClick={() => onChange({ ...value, examTargets: [...(value.examTargets ?? []), { id: crypto.randomUUID(), subject: value.subjects[0], paper: '', date: '' }] })}>Add exam date</button>
        </fieldset>
      )}
    </div>
  );
}
