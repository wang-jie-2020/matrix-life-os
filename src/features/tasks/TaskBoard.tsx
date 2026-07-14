import React, { useEffect, useRef, useState } from 'react';
import { format, addDays } from 'date-fns';
import TaskColumn from './TaskColumn';
import { useAppStore } from '../../store/useAppStore';
import {
  getWeekStart,
  getWeekDates,
  getNextWeekStart,
  getPrevWeekStart,
  getDayColumnFromDate,
} from '../../utils/date';

const DAY_LABELS: Record<string, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

const TaskBoard: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks);
  const config = useAppStore((s) => s.config);
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boardRef.current?.style.setProperty('--task-column-width', `${config.taskColumnWidth ?? 260}px`);
  }, [config.taskColumnWidth]);

  const weekDates = getWeekDates(weekStart);
  const isCurrentWeek = weekStart === getWeekStart();

  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-3)',
          flexWrap: 'wrap',
        }}
      >
        <button onClick={() => setWeekStart(getPrevWeekStart(weekStart))} className="font-caption">
          Previous Week
        </button>
        <span className="font-h3" style={{ color: 'var(--accent-gold)' }}>
          {format(new Date(weekStart), 'yyyy-MM-dd')} to {format(addDays(new Date(weekStart), 6), 'yyyy-MM-dd')}
        </span>
        <button onClick={() => setWeekStart(getNextWeekStart(weekStart))} className="font-caption">
          Next Week
        </button>
        {!isCurrentWeek && (
          <button onClick={() => setWeekStart(getWeekStart())} className="font-caption">
            Current Week
          </button>
        )}
      </div>

      <div
        ref={boardRef}
        className="task-board-scroll"
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          paddingBottom: 'var(--space-2)',
        }}
      >
        {weekDates.map((date) => {
          const dayColumn = getDayColumnFromDate(new Date(date));
          return (
            <TaskColumn
              key={date}
              date={date}
              column={dayColumn}
              tasks={tasks.filter((task) => task.date === date)}
              title={DAY_LABELS[dayColumn]}
              dateLabel={format(new Date(date), 'MM/dd')}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;
