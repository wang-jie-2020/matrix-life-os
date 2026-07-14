import type { PersistStorage, StorageValue } from 'zustand/middleware';

interface ElectronAPI {
  loadDataSync: () => Record<string, string> | null;
  saveData: (data: Record<string, string>) => Promise<boolean>;
  onBeforeQuit: (callback: () => void) => void;
}

const api: ElectronAPI | undefined = window.electronAPI;

const notifySaveFailed = () => {
  window.dispatchEvent(new CustomEvent('matrix-storage-save-failed'));
};

function createStorage(): PersistStorage<unknown> {
  if (api) {
    let cache: Record<string, string> | null = null;
    let dirty = false;
    let pendingFlush: ReturnType<typeof setTimeout> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    const FLUSH_DEBOUNCE_MS = 300;
    const RETRY_BASE_MS = 500;

    const loadCache = () => {
      if (cache === null) {
        cache = api.loadDataSync() ?? {};
      }
      return cache;
    };

    const doSave = async (): Promise<boolean> => {
      if (!dirty || cache === null) return true;
      const snapshot = { ...cache };
      try {
        const ok = await api.saveData(snapshot);
        if (ok) {
          dirty = false;
          retryCount = 0;
          return true;
        }
        return false;
      } catch (error) {
        console.error('[electronStorage] saveData threw:', error);
        return false;
      }
    };

    const flushImmediate = async (): Promise<boolean> => {
      if (pendingFlush !== null) {
        clearTimeout(pendingFlush);
        pendingFlush = null;
      }
      const ok = await doSave();
      if (!ok && dirty) {
        scheduleRetry();
      }
      return ok;
    };

    const scheduleRetry = () => {
      if (retryTimer !== null) clearTimeout(retryTimer);
      if (retryCount >= MAX_RETRIES) {
        console.error(`[electronStorage] Write failed ${MAX_RETRIES} times. Data may not continue saving.`);
        notifySaveFailed();
        return;
      }
      retryCount++;
      const delay = RETRY_BASE_MS * Math.pow(2, retryCount - 1);
      retryTimer = setTimeout(() => {
        flushImmediate();
      }, delay);
    };

    const flushDebounced = () => {
      if (pendingFlush !== null) clearTimeout(pendingFlush);
      pendingFlush = setTimeout(() => {
        pendingFlush = null;
        flushImmediate();
      }, FLUSH_DEBOUNCE_MS);
    };

    api.onBeforeQuit(() => {
      if (pendingFlush !== null) {
        clearTimeout(pendingFlush);
        pendingFlush = null;
      }
      flushImmediate().catch(() => notifySaveFailed());
    });

    return {
      getItem(name: string): StorageValue<unknown> | null {
        const data = loadCache();
        const raw = data[name];
        if (raw === undefined) return null;
        try {
          return JSON.parse(raw) as StorageValue<unknown>;
        } catch {
          return null;
        }
      },
      setItem(name: string, value: StorageValue<unknown>): void {
        loadCache();
        const serialized = JSON.stringify(value);
        if (cache![name] !== serialized) {
          cache![name] = serialized;
          dirty = true;
          flushDebounced();
        }
      },
      removeItem(name: string): void {
        loadCache();
        if (name in cache!) {
          delete cache![name];
          dirty = true;
          flushDebounced();
        }
      },
    };
  }

  return {
    getItem(name: string): StorageValue<unknown> | null {
      try {
        const raw = localStorage.getItem(name);
        if (raw === null) return null;
        return JSON.parse(raw) as StorageValue<unknown>;
      } catch {
        return null;
      }
    },
    setItem(name: string, value: StorageValue<unknown>): void {
      try {
        localStorage.setItem(name, JSON.stringify(value));
      } catch {
        notifySaveFailed();
      }
    },
    removeItem(name: string): void {
      try {
        localStorage.removeItem(name);
      } catch {
        notifySaveFailed();
      }
    },
  };
}

export const electronStorage = createStorage();
