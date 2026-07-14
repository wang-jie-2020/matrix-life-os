import type { StateCreator } from 'zustand';
import type { Task } from '../../types';
import { getDayColumnFromDate } from '../../utils/date';

export interface TaskSlice {
  tasks: Task[];
  addTask: (content: string, date: string, source?: Task['source']) => string;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetDate: string, newOrder: number) => void;
  toggleTask: (id: string) => void;
  deleteCompletedTasks: () => void;
  migrateAllBeforeToday: (today: string) => void;
  migrateUnfinishedTasks: (fromDate: string, toDate: string) => void;
  reorderTasks: (date: string, taskIds: string[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createTaskSlice: StateCreator<TaskSlice> = (set, get) => ({
  tasks: [],

  addTask: (content, date, source) => {
    const tasks = get().tasks;
    const column = getDayColumnFromDate(new Date(date));
    const columnTasks = tasks.filter((t) => t.date === date);
    const id = generateId();
    const newTask: Task = {
      id,
      content,
      column,
      date,
      status: 'active',
      order: columnTasks.length,
      source: source || 'manual',
    };
    set({ tasks: [...tasks, newTask] });
    return id;
  },

  deleteTask: (id) => {
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },

  moveTask: (id, targetDate, newOrder) => {
    const tasks = get().tasks;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const targetColumn = getDayColumnFromDate(new Date(targetDate));

    const otherTasks = tasks.filter((t) => t.id !== id);
    const targetDateTasks = otherTasks
      .filter((t) => t.date === targetDate)
      .sort((a, b) => a.order - b.order);

    const updatedTargetTasks = [...targetDateTasks];
    const movedTask = { ...task, date: targetDate, column: targetColumn };
    updatedTargetTasks.splice(newOrder, 0, movedTask);

    const reorderedTarget = updatedTargetTasks.map((t, idx) => ({ ...t, order: idx }));
    const otherDates = otherTasks.filter((t) => t.date !== targetDate);

    set({ tasks: [...otherDates, ...reorderedTarget] });
  },

  toggleTask: (id) => {
    set({
      tasks: get().tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'active' ? 'completed' : 'active',
              completedAt: t.status === 'active' ? new Date().toISOString() : undefined,
            }
          : t
      ),
    });
  },

  deleteCompletedTasks: () => {
    set({ tasks: get().tasks.filter((t) => t.status !== 'completed') });
  },

  migrateAllBeforeToday: (today) => {
    const tasks = get().tasks;
    const todayColumn = getDayColumnFromDate(new Date(today));
    const activeOldTasks = tasks
      .filter((t) => t.status === 'active' && t.date < today)
      .sort((a, b) => a.order - b.order);

    if (activeOldTasks.length === 0) return;

    const existingTodayTasks = tasks
      .filter((t) => t.date === today)
      .sort((a, b) => a.order - b.order);

    const migrated = activeOldTasks.map((t, idx) => ({
      ...t,
      date: today,
      column: todayColumn,
      order: idx,
      migratedFrom: t.migratedFrom || t.date,
    }));

    const shiftedExisting = existingTodayTasks.map((t, idx) => ({
      ...t,
      order: activeOldTasks.length + idx,
    }));

    const others = tasks.filter(
      (t) =>
        t.status !== 'active' ||
        t.date > today
    );

    set({ tasks: [...others, ...migrated, ...shiftedExisting] });
  },

  migrateUnfinishedTasks: (fromDate, toDate) => {
    const tasks = get().tasks;
    const toColumn = getDayColumnFromDate(new Date(toDate));
    const toMigrate = tasks
      .filter((t) => t.date === fromDate && t.status === 'active')
      .sort((a, b) => a.order - b.order);

    const existingTarget = tasks
      .filter((t) => t.date === toDate)
      .sort((a, b) => a.order - b.order);

    const migrated = toMigrate.map((t, idx) => ({
      ...t,
      date: toDate,
      column: toColumn,
      order: idx,
      migratedFrom: fromDate,
    }));

    const shiftedExisting = existingTarget.map((t, idx) => ({
      ...t,
      order: toMigrate.length + idx,
    }));

    const others = tasks.filter(
      (t) => t.date !== fromDate && t.date !== toDate
    );

    set({ tasks: [...others, ...migrated, ...shiftedExisting] });
  },

  reorderTasks: (date, taskIds) => {
    const tasks = get().tasks;
    const otherTasks = tasks.filter((t) => t.date !== date);
    const dateTasks = tasks.filter((t) => t.date === date);

    const reordered = taskIds
      .map((id) => dateTasks.find((t) => t.id === id))
      .filter(Boolean) as Task[];

    const updated = reordered.map((t, idx) => ({ ...t, order: idx }));
    set({ tasks: [...otherTasks, ...updated] });
  },

  updateTask: (id, updates) => {
    set({
      tasks: get().tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  },
});
