import React, { useEffect, useRef, useState } from 'react';
import { format, addDays } from 'date-fns';
import TaskColumn from './TaskColumn';
import AsciiButton from '../../components/AsciiButton';
import { useTranslation } from '../../i18n/react';
import { useAppStore } from '../../store/useAppStore';
import {
  getWeekStart,
  getWeekDates,
  getNextWeekStart,
  getPrevWeekStart,
  getDayColumnFromDate,
} from '../../utils/date';

const TaskBoard: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks);
  const config = useAppStore((s) => s.config);
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const boardRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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
        <AsciiButton
          onClick={() => setWeekStart(getPrevWeekStart(weekStart))}
          frame="tight"
          title={t('tasks.previousWeek')}
          ariaLabel={t('tasks.previousWeek')}
        >
          {'<'}
        </AsciiButton>
        <span className="font-h3" style={{ color: 'var(--accent-gold)' }}>
          {format(new Date(weekStart), 'yyyy-MM-dd')} {t('tasks.weekRangeSeparator')} {format(addDays(new Date(weekStart), 6), 'yyyy-MM-dd')}
        </span>
        <AsciiButton
          onClick={() => setWeekStart(getNextWeekStart(weekStart))}
          frame="tight"
          title={t('tasks.nextWeek')}
          ariaLabel={t('tasks.nextWeek')}
        >
          {'>'}
        </AsciiButton>
        {!isCurrentWeek && (
          <AsciiButton
            onClick={() => setWeekStart(getWeekStart())}
            frame="tight"
            title={t('tasks.currentWeek')}
            ariaLabel={t('tasks.currentWeek')}
          >
            *
          </AsciiButton>
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
              title={t(`weekday.${dayColumn}`)}
              dateLabel={format(new Date(date), 'MM/dd')}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;
