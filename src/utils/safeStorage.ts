// Fault-tolerant localStorage wrapper to prevent crashes in sandboxed iframe environments
// where localStorage is blocked or throws security errors.

const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) {
      return false;
    }
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (isStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`safeStorage: Access denied for getItem('${key}')`, e);
    }
    return Object.prototype.hasOwnProperty.call(memoryStorage, key) ? memoryStorage[key] : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (isStorageAvailable()) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`safeStorage: Access denied for setItem('${key}')`, e);
    }
    memoryStorage[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (isStorageAvailable()) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`safeStorage: Access denied for removeItem('${key}')`, e);
    }
    delete memoryStorage[key];
  },

  clear(): void {
    try {
      if (isStorageAvailable()) {
        window.localStorage.clear();
        return;
      }
    } catch (e) {
      console.warn("safeStorage: Access denied for clear()", e);
    }
    for (const key in memoryStorage) {
      if (Object.prototype.hasOwnProperty.call(memoryStorage, key)) {
        delete memoryStorage[key];
      }
    }
  }
};
