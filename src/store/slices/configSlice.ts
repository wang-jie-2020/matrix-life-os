import type { StateCreator } from 'zustand';
import type { AppConfig, InterfaceLanguage } from '../../types';
import { detectInterfaceLanguage } from '../../i18n';

export interface ConfigSlice {
  config: AppConfig;
  updateConfig: (config: Partial<AppConfig>) => void;
  setInterfaceLanguage: (language: InterfaceLanguage) => void;
  toggleTheme: () => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const getBrowserLanguages = () => {
  if (typeof navigator === 'undefined') return [];
  if (navigator.languages?.length) return [...navigator.languages];
  return navigator.language ? [navigator.language] : [];
};

export const createDefaultConfig = (languages = getBrowserLanguages()): AppConfig => ({
  currentWeekStart: getWeekStart(),
  lastVisitDate: getTodayString(),
  theme: 'dark',
  taskColumnWidth: 260,
  interfaceLanguage: detectInterfaceLanguage(languages),
});

export const normalizeConfig = (
  config: Partial<AppConfig> | undefined,
  languages = getBrowserLanguages()
): AppConfig => ({
  ...createDefaultConfig(languages),
  ...config,
  interfaceLanguage: config?.interfaceLanguage ?? detectInterfaceLanguage(languages),
});

export const createConfigSlice: StateCreator<ConfigSlice> = (set) => ({
  config: createDefaultConfig(),

  updateConfig: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),

  setInterfaceLanguage: (language) =>
    set((state) => ({
      config: {
        ...state.config,
        interfaceLanguage: language,
      },
    })),

  toggleTheme: () =>
    set((state) => ({
      config: {
        ...state.config,
        theme: state.config.theme === 'dark' ? 'light' : 'dark',
      },
    })),
});
