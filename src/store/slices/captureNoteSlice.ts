import type { StateCreator } from 'zustand';
import type { CaptureNote } from '../../types';

export interface CaptureNoteSlice {
  captureNotes: CaptureNote[];
  addCaptureNote: (content: string) => string;
  updateCaptureNote: (id: string, content: string) => void;
  deleteCaptureNote: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createCaptureNoteSlice: StateCreator<CaptureNoteSlice> = (set, get) => ({
  captureNotes: [],

  addCaptureNote: (content) => {
    const id = generateId();
    const now = new Date().toISOString();
    set({
      captureNotes: [
        ...get().captureNotes,
        { id, content, createdAt: now },
      ],
    });
    return id;
  },

  updateCaptureNote: (id, content) => {
    set({
      captureNotes: get().captureNotes.map((note) =>
        note.id === id ? { ...note, content, updatedAt: new Date().toISOString() } : note
      ),
    });
  },

  deleteCaptureNote: (id) => {
    set({ captureNotes: get().captureNotes.filter((note) => note.id !== id) });
  },
});
