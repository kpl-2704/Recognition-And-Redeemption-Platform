import { create } from "zustand";
import { User } from "@/types";
import { api } from "@/lib/api";

interface UserState {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    department?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => User | null;
  fetchUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    role?: string;
  }) => Promise<void>;
  searchUsers: (query: string, limit?: number) => Promise<User[]>;
  updateProfile: (profileData: {
    name?: string;
    department?: string;
    avatar?: string;
  }) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => {
  return {
    currentUser: null,
    users: [],
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.login({ email, password });

        set({
          currentUser: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Login failed",
          isLoading: false,
        });
        throw error;
      }
    },

    register: async (userData) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.register(userData);

        set({
          currentUser: response.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "Registration failed",
          isLoading: false,
        });
        throw error;
      }
    },

    logout: async () => {
      try {
        await api.logout();
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        set({
          currentUser: null,
          isAuthenticated: false,
          users: [],
        });
      }
    },

    getCurrentUser: () => {
      return get().currentUser;
    },

    fetchUsers: async (params) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getUsers(params);

        set({
          users: response.users,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch users",
          isLoading: false,
        });
        throw error;
      }
    },

    searchUsers: async (query: string, limit = 10) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.searchUsers(query, limit);

        set({ isLoading: false });
        return response.users;
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to search users",
          isLoading: false,
        });
        throw error;
      }
    },

    updateProfile: async (profileData) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.updateProfile(profileData);

        set({
          currentUser: response.user,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to update profile",
          isLoading: false,
        });
        throw error;
      }
    },

    clearError: () => {
      set({ error: null });
    },
  };
});
