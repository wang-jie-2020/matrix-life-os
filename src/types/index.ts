export type DayColumn = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type TaskStatus = 'active' | 'completed';

export interface Task {
  id: string;
  content: string;
  column: DayColumn;
  date: string;
  status: TaskStatus;
  order: number;
  completedAt?: string;
  migratedFrom?: string;
  source?: 'manual' | 'capture';
}

export interface CaptureNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GoalNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Reflection {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AppConfig {
  currentWeekStart: string;
  lastVisitDate: string;
  theme: 'dark' | 'light';
  taskColumnWidth?: number;
}

export type ModuleId =
  | 'captureNotes'
  | 'weekBoard'
  | 'goalNotes'
  | 'reflections'
  | 'dataStatus';

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  description: string;
  defaultEnabled: boolean;
  core: boolean;
}

export interface DashboardLayout {
  main: string[];
  side: string[];
}

export interface TwoColumnLayout {
  left: string[];
  right: string[];
}

export interface AppState {
  tasks: Task[];
  captureNotes: CaptureNote[];
  goalNotes: GoalNote[];
  reflections: Reflection[];
  config: AppConfig;
  enabledModules: ModuleId[];
  dashboardLayout: DashboardLayout;
  reflectionLayout: TwoColumnLayout;
  systemLayout: TwoColumnLayout;
  __version: string;
}

declare global {
  interface Window {
    electronAPI?: {
      loadDataSync: () => Record<string, string> | null;
      saveData: (data: Record<string, string>) => Promise<boolean>;
      getAppVersion: () => string;
      onBeforeQuit: (callback: () => void) => void;
    };
  }
}
