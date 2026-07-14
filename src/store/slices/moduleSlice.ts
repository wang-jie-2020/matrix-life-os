import type { StateCreator } from 'zustand';
import type { ModuleId } from '../../types';
import { DEFAULT_ENABLED_MODULES } from '../../features/modules/moduleRegistry';

export interface ModuleSlice {
  enabledModules: ModuleId[];
  toggleModule: (moduleId: ModuleId) => void;
  setEnabledModules: (modules: ModuleId[]) => void;
  isModuleEnabled: (moduleId: ModuleId) => boolean;
}

export const createModuleSlice: StateCreator<ModuleSlice> = (set, get) => ({
  enabledModules: DEFAULT_ENABLED_MODULES,

  toggleModule: (moduleId: ModuleId) =>
    set((state) => {
      const current = state.enabledModules.length === 0 ? DEFAULT_ENABLED_MODULES : state.enabledModules;
      const isEnabled = current.includes(moduleId);
      const next = isEnabled
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId];
      return { enabledModules: next };
    }),

  setEnabledModules: (modules: ModuleId[]) => set({ enabledModules: modules }),

  isModuleEnabled: (moduleId: ModuleId) => {
    const enabled = get().enabledModules;
    return enabled.length === 0 || enabled.includes(moduleId);
  },
});
