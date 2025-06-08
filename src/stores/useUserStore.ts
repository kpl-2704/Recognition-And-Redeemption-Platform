import { create } from "zustand";
import { User } from "@/types";
import { mockUsers } from "@/data/mockData";

interface UserState {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  getCurrentUser: () => User | null;
}

// Load initial state from localStorage or use mock data
const loadInitialState = () => {
  try {
    const stored = localStorage.getItem("user-store");
    if (stored) {
      const { state, version } = JSON.parse(stored);
      if (version === 1) {
        // Current version
        return state;
      }
    }
  } catch (error) {
    console.error("Error loading user store:", error);
  }
  return {
    currentUser: null,
    users: mockUsers,
    isAuthenticated: false,
  };
};

export const useUserStore = create<UserState>((set, get) => {
  // Initialize with stored state or mock data
  const initialState = loadInitialState();

  return {
    ...initialState,

    login: (user: User) => {
      set((state) => {
        const newState = {
          ...state,
          currentUser: user,
          isAuthenticated: true,
        };
        // Save to localStorage
        localStorage.setItem(
          "user-store",
          JSON.stringify({ state: newState, version: 1 }),
        );
        return newState;
      });
    },

    logout: () => {
      set((state) => {
        const newState = {
          ...state,
          currentUser: null,
          isAuthenticated: false,
        };
        // Save to localStorage
        localStorage.setItem(
          "user-store",
          JSON.stringify({ state: newState, version: 1 }),
        );
        return newState;
      });
    },

    getCurrentUser: () => {
      return get().currentUser;
    },
  };
});
