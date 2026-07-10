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

const selectClass =
  'w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none focus:border-primary/40 transition';

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
    });
  };

  const toggleSubject = (subject: string) => {
    if (multiSubject) {
      const next = value.subjects.includes(subject)
        ? value.subjects.filter((s) => s !== subject)
        : [...value.subjects, subject];
      onChange({ ...value, subjects: next });
    } else {
      onChange({ ...value, subjects: [subject] });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className={compact ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
        <div>
          <label htmlFor="curriculum-board" className="mb-2 block text-sm text-white/75">
            Exam board
          </label>
          <select
            id="curriculum-board"
            className={selectClass}
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
            <label htmlFor="curriculum-grade" className="mb-2 block text-sm text-white/75">
              Grade / year
            </label>
            <select
              id="curriculum-grade"
              className={selectClass}
              value={value.grade ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  grade: e.target.value ? parseInt(e.target.value, 10) : null,
                  subjects: [],
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
          <label htmlFor="curriculum-exam-date" className="mb-2 block text-sm text-white/75">
            Exam date (optional)
          </label>
          <input
            id="curriculum-exam-date"
            type="date"
            className={selectClass}
            value={value.examDate ?? ''}
            onChange={(e) => onChange({ ...value, examDate: e.target.value || null })}
          />
        </div>
      )}

      {showSubjects && value.board && subjects.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-white/75">
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
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    selected
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-white/15 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10',
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
    </div>
  );
}
