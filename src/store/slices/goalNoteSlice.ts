import type { StateCreator } from 'zustand';
import type { GoalNote } from '../../types';

export interface GoalNoteSlice {
  goalNotes: GoalNote[];
  addGoalNote: (content: string) => string;
  updateGoalNote: (id: string, content: string) => void;
  deleteGoalNote: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createGoalNoteSlice: StateCreator<GoalNoteSlice> = (set, get) => ({
  goalNotes: [],

  addGoalNote: (content) => {
    const id = generateId();
    const now = new Date().toISOString();
    set({
      goalNotes: [
        ...get().goalNotes,
        { id, content, createdAt: now },
      ],
    });
    return id;
  },

  updateGoalNote: (id, content) => {
    set({
      goalNotes: get().goalNotes.map((note) =>
        note.id === id ? { ...note, content, updatedAt: new Date().toISOString() } : note
      ),
    });
  },

  deleteGoalNote: (id) => {
    set({ goalNotes: get().goalNotes.filter((note) => note.id !== id) });
  },
});
