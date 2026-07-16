import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import AsciiButton from '../../components/AsciiButton';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const updateTask = useAppStore((s) => s.updateTask);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const saveEdit = () => {
    const content = editContent.trim();
    if (content) updateTask(task.id, { content });
    setIsEditing(false);
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
    >
      {isEditing ? (
        <input
          autoFocus
          value={editContent}
          onChange={(event) => setEditContent(event.target.value)}
          onBlur={saveEdit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') saveEdit();
            if (event.key === 'Escape') {
              setEditContent(task.content);
              setIsEditing(false);
            }
          }}
          className="font-body"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--accent-gold)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            padding: '0 var(--space-1)',
            width: '100%',
            outline: 'none',
            caretColor: 'var(--accent-gold)',
          }}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              toggleTask(task.id);
            }}
            className="font-caption"
            style={{
              background: 'none',
              border: 'none',
              color: task.status === 'completed' ? 'var(--accent-success)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 0,
            }}
          >
            {task.status === 'completed' ? '☑' : '☐'}
          </button>
          <span
            className="font-body"
            style={{
              flex: 1,
              color: task.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
              lineHeight: '28px',
            }}
          >
            {task.content}
          </span>
          {task.migratedFrom && (
            <span className="font-caption" style={{ color: 'var(--accent-gold)' }}>
              [MOVED]
            </span>
          )}
          <AsciiButton
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setEditContent(task.content);
              setIsEditing(true);
            }}
            frame="tight"
            title="Edit task"
            ariaLabel="Edit task"
          >
            ✎
          </AsciiButton>
          <AsciiButton
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              deleteTask(task.id);
            }}
            variant="danger"
            frame="tight"
            title="Delete task"
            ariaLabel="Delete task"
          >
            x
          </AsciiButton>
        </div>
      )}
      <style>{`
        .task-card {
          padding: 0 var(--space-2);
          margin-bottom: var(--space-1);
          border: 1px solid var(--border-primary);
          background-color: var(--bg-tertiary);
          cursor: grab;
          transition: background-color var(--duration-instant) var(--ease-instant),
                      border-color var(--duration-instant) var(--ease-instant);
        }
        .task-card:hover {
          background-color: var(--bg-secondary);
          border-color: var(--border-hover);
        }
        .task-card:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default TaskCard;
