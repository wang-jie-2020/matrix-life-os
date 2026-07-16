import React from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import CaptureNotesPanel from '../features/capture/CaptureNotesPanel';
import GoalNotesPanel from '../features/goals/GoalNotesPanel';
import TaskBoard from '../features/tasks/TaskBoard';
import { useTranslation } from '../i18n/react';
import { useAppStore } from '../store/useAppStore';

const ActionDesk: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks);
  const moveTask = useAppStore((s) => s.moveTask);
  const reorderTasks = useAppStore((s) => s.reorderTasks);
  const isModuleEnabled = useAppStore((s) => s.isModuleEnabled);
  const showCaptureNotes = isModuleEnabled('captureNotes');
  const showWeekBoard = isModuleEnabled('weekBoard');
  const showGoalNotes = isModuleEnabled('goalNotes');
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('column-')) {
      const targetDate = overId.replace('column-', '');
      const activeTask = tasks.find((task) => task.id === activeId);
      if (!activeTask || activeTask.date === targetDate) return;
      moveTask(activeId, targetDate, 0);
      return;
    }

    const activeTask = tasks.find((task) => task.id === activeId);
    const overTask = tasks.find((task) => task.id === overId);
    if (!activeTask || !overTask) return;

    if (activeTask.date === overTask.date) {
      const columnTasks = tasks
        .filter((task) => task.date === activeTask.date)
        .sort((a, b) => a.order - b.order);
      const oldIndex = columnTasks.findIndex((task) => task.id === activeId);
      const newIndex = columnTasks.findIndex((task) => task.id === overId);
      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      reorderTasks(activeTask.date, reordered.map((task) => task.id));
      return;
    }

    const targetColumnTasks = tasks
      .filter((task) => task.date === overTask.date)
      .sort((a, b) => a.order - b.order);
    const newOrder = targetColumnTasks.findIndex((task) => task.id === overId);
    moveTask(activeId, overTask.date, newOrder >= 0 ? newOrder : targetColumnTasks.length);
  };

  return (
    <div className="action-desk" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {showCaptureNotes && <CaptureNotesPanel />}
      {showWeekBoard && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <TaskBoard />
        </DndContext>
      )}
      {showGoalNotes && <GoalNotesPanel />}
      {!showCaptureNotes && !showWeekBoard && !showGoalNotes && (
        <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
          {t('action.hidden')}
        </div>
      )}
    </div>
  );
};

export default ActionDesk;
