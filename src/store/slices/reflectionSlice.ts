import type { StateCreator } from 'zustand';
import type { Reflection } from '../../types';

export interface ReflectionSlice {
  reflections: Reflection[];
  saveReflection: (reflection: Omit<Reflection, 'id' | 'createdAt'>) => void;
  updateReflection: (id: string, updates: Partial<Pick<Reflection, 'date' | 'content'>>) => void;
  deleteReflection: (id: string) => void;
  getReflectionByDate: (date: string) => Reflection | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createReflectionSlice: StateCreator<ReflectionSlice> = (set, get) => ({
  reflections: [],

  saveReflection: (reflection) => {
    const existing = get().reflections.find((r) => r.date === reflection.date);
    if (existing) {
      set({
        reflections: get().reflections.map((r) =>
          r.id === existing.id
            ? { ...r, ...reflection, updatedAt: new Date().toISOString() }
            : r
        ),
      });
      return;
    }

    const newReflection: Reflection = {
      ...reflection,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set({ reflections: [...get().reflections, newReflection] });
  },

  updateReflection: (id, updates) => {
    set({
      reflections: get().reflections.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    });
  },

  deleteReflection: (id) => {
    set({ reflections: get().reflections.filter((r) => r.id !== id) });
  },

  getReflectionByDate: (date) => get().reflections.find((r) => r.date === date),
});
