import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { createTaskSlice, type TaskSlice } from './slices/taskSlice';
import { createCaptureNoteSlice, type CaptureNoteSlice } from './slices/captureNoteSlice';
import { createGoalNoteSlice, type GoalNoteSlice } from './slices/goalNoteSlice';
import { createReflectionSlice, type ReflectionSlice } from './slices/reflectionSlice';
import { createConfigSlice, type ConfigSlice } from './slices/configSlice';
import { createModuleSlice, type ModuleSlice } from './slices/moduleSlice';
import {
  createLayoutSlice,
  type LayoutSlice,
  DEFAULT_DASHBOARD_LAYOUT,
  DEFAULT_REFLECTION_LAYOUT,
  DEFAULT_SYSTEM_LAYOUT,
} from './slices/layoutSlice';
import { migrateAppData, CURRENT_APP_VERSION } from '../utils/migrateAppData';
import { electronStorage } from '../utils/electronStorage';
import type { AppState } from '../types';

export type AppStore = TaskSlice &
  CaptureNoteSlice &
  GoalNoteSlice &
  ReflectionSlice &
  ConfigSlice &
  ModuleSlice &
  LayoutSlice & {
    __version: string;
    storageWarning: boolean;
    saveStatus: 'ok' | 'warning';
    setStorageWarning: (v: boolean) => void;
    setSaveStatus: (status: 'ok' | 'warning') => void;
  };

export const useAppStore = create<AppStore>()(
  persist<AppStore, [], [], AppState>(
    (...args) => ({
      ...createTaskSlice(...args),
      ...createCaptureNoteSlice(...args),
      ...createGoalNoteSlice(...args),
      ...createReflectionSlice(...args),
      ...createConfigSlice(...args),
      ...createModuleSlice(...args),
      ...createLayoutSlice(...args),
      __version: CURRENT_APP_VERSION,
      storageWarning: false,
      saveStatus: 'ok',
      setStorageWarning: (v: boolean) => args[0]({ storageWarning: v }),
      setSaveStatus: (status: 'ok' | 'warning') => args[0]({ saveStatus: status }),
    }),
    {
      name: 'alo-storage',
      storage: electronStorage as PersistStorage<AppState>,
      partialize: (state) => {
        const partial = {
          tasks: state.tasks,
          captureNotes: state.captureNotes,
          goalNotes: state.goalNotes,
          reflections: state.reflections,
          config: state.config,
          enabledModules: state.enabledModules,
          dashboardLayout: state.dashboardLayout,
          reflectionLayout: state.reflectionLayout,
          systemLayout: state.systemLayout,
          __version: state.__version,
        };

        const size = new Blob([JSON.stringify(partial)]).size;
        const MB = size / (1024 * 1024);
        if (MB > 4.5) {
          console.warn(`[storage] Data size ${MB.toFixed(2)}MB may prevent future saves.`);
          state.setStorageWarning(true);
          state.setSaveStatus('warning');
        } else if (MB > 4) {
          console.warn(`[storage] Data size ${MB.toFixed(2)}MB is approaching the local storage limit.`);
        }

        return partial;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        state.tasks = state.tasks || [];
        state.captureNotes = state.captureNotes || [];
        state.goalNotes = state.goalNotes || [];
        state.reflections = state.reflections || [];
        state.config = state.config || {
          currentWeekStart: new Date().toISOString().split('T')[0],
          lastVisitDate: new Date().toISOString().split('T')[0],
          theme: 'dark',
          taskColumnWidth: 260,
        };
        state.enabledModules = state.enabledModules || [];
        state.dashboardLayout = DEFAULT_DASHBOARD_LAYOUT;
        state.reflectionLayout = DEFAULT_REFLECTION_LAYOUT;
        state.systemLayout = DEFAULT_SYSTEM_LAYOUT;

        const migrated = migrateAppData(state, CURRENT_APP_VERSION);
        Object.assign(state, migrated);
      },
    }
  )
);
