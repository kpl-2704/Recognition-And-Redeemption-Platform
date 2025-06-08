import { StateCreator } from "zustand";

type Storage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

type StorageValue<T> = {
  state: T;
  version: number;
};

type PersistOptions<T> = {
  name: string;
  storage?: Storage;
  version?: number;
  onRehydrateStorage?: (state: T) => void;
};

export const persist = <T extends object>(
  f: StateCreator<T>,
  options: PersistOptions<T>,
) => {
  const {
    name,
    storage = localStorage,
    version = 0,
    onRehydrateStorage,
  } = options;

  return (set, get, api) => {
    const store = f(
      (state) => {
        set(state);
        const currentState = get();
        const storageValue: StorageValue<T> = {
          state: currentState,
          version,
        };
        storage.setItem(name, JSON.stringify(storageValue));
      },
      get,
      api,
    );

    // Load persisted state
    const loadPersistedState = () => {
      const stored = storage.getItem(name);
      if (!stored) return;

      try {
        const { state, version: storedVersion } = JSON.parse(
          stored,
        ) as StorageValue<T>;
        if (storedVersion !== version) {
          storage.removeItem(name);
          return;
        }
        set(state);
        onRehydrateStorage?.(state);
      } catch (error) {
        console.error("Error loading persisted state:", error);
        storage.removeItem(name);
      }
    };

    // Load state on mount
    loadPersistedState();

    return store;
  };
};
