import type { AppState } from '../types';

export const CURRENT_APP_VERSION = '0.3.0';

const getReflectionContent = (reflection: unknown): string => {
  const record = reflection as Record<string, unknown>;
  if (typeof record.content === 'string') return record.content;
  if (record.answers && typeof record.answers === 'object') {
    return Object.values(record.answers as Record<string, unknown>)
      .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
      .map((value) => String(value))
      .join('\n\n');
  }
  return '';
};

export function migrateAppData(state: AppState, targetVersion: string): AppState {
  const today = new Date().toISOString().split('T')[0];

  return {
    ...state,
    tasks: (state.tasks || []).map((task) => ({
      ...task,
      date: task.date || today,
      source: task.source === 'capture' ? 'capture' : 'manual',
    })),
    captureNotes: state.captureNotes || [],
    goalNotes: state.goalNotes || [],
    reflections: ((state.reflections || []) as unknown[]).map((reflection) => {
      const record = reflection as Record<string, unknown>;
      return {
        id: String(record.id || Math.random().toString(36).substring(2, 9)),
        date: String(record.date || today),
        content: getReflectionContent(reflection),
        createdAt: String(record.createdAt || new Date().toISOString()),
        updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : undefined,
      };
    }),
    __version: targetVersion,
  };
}
