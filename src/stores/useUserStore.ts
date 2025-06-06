import { create } from "zustand";
import { User } from "@/types";
import { currentUser } from "@/data/mockData";

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: currentUser, // Start with mock user for development
  isAuthenticated: true, // Start authenticated for development
  isLoading: false,

  login: (user: User) => {
    set({
      currentUser: user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  updateProfile: (updates: Partial<User>) => {
    const { currentUser } = get();
    if (currentUser) {
      set({
        currentUser: { ...currentUser, ...updates },
      });
    }
  },
}));
