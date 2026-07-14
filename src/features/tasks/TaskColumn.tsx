import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { DayColumn, Task } from '../../types';
import TaskCard from './TaskCard';
import { useAppStore } from '../../store/useAppStore';

interface TaskColumnProps {
  date: string;
  column: DayColumn;
  tasks: Task[];
  title: string;
  dateLabel?: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ date, column, tasks, title, dateLabel }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const addTask = useAppStore((s) => s.addTask);

  const today = new Date().toISOString().split('T')[0];
  const isToday = date === today;
  const droppableId = `column-${date}`;
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: droppableId });
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    const content = newContent.trim();
    if (!content) return;
    addTask(content, date);
    setNewContent('');
    setIsAdding(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleAdd();
    if (event.key === 'Escape') {
      setNewContent('');
      setIsAdding(false);
    }
  };

  return (
    <div
      className="task-column"
      style={{
        border: isToday ? '2px solid var(--accent-gold)' : '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)',
        minWidth: 'var(--task-column-width, 140px)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      data-column={column}
    >
      <div
        className="task-column-header"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: isToday ? 'rgba(160, 128, 64, 0.08)' : 'transparent',
          textAlign: 'center',
        }}
      >
        <div className="font-h3" style={{ color: 'var(--accent-gold)' }}>
          {title}
        </div>
        {dateLabel && (
          <div className="font-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            {dateLabel}
          </div>
        )}
        {isToday && (
          <div className="font-caption" style={{ color: 'var(--accent-gold)', marginTop: 'var(--space-1)' }}>
            Today
          </div>
        )}
      </div>

      <div
        className="task-column-content"
        ref={setDroppableRef}
        style={{
          flex: 1,
          padding: 'var(--space-2) var(--space-3)',
          minHeight: '200px',
          backgroundColor: isOver ? 'var(--bg-tertiary)' : 'transparent',
          transition: 'background-color var(--duration-instant)',
        }}
      >
        <SortableContext items={sortedTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      <div
        className="task-column-footer"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          borderTop: '1px solid var(--border-primary)',
        }}
      >
        {isAdding ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <input
              autoFocus
              value={newContent}
              onChange={(event) => setNewContent(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newContent.trim()) setIsAdding(false);
              }}
              placeholder="Add a task..."
              className="font-body"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--accent-gold)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                padding: 'var(--space-1) 0',
                width: '100%',
                outline: 'none',
                caretColor: 'var(--accent-gold)',
              }}
            />
            <button
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleAdd}
              className="font-caption"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--accent-gold)',
                color: 'var(--accent-gold)',
                fontFamily: 'var(--font-mono)',
                padding: 'var(--space-1) var(--space-2)',
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="font-caption"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              textAlign: 'center',
              padding: 'var(--space-1)',
            }}
          >
            [+]
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
