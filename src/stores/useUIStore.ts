import { create } from "zustand";
import { useUserStore } from "./useUserStore";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: Date;
  recipientId?: string; // Optional recipient ID to target specific users
  isRead?: boolean;
}

interface UIState {
  isSidebarOpen: boolean;
  currentPage: string;
  isKudosModalOpen: boolean;
  isFeedbackModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  openKudosModal: () => void;
  closeKudosModal: () => void;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  notifications: Notification[];
  addNotification: (notification: {
    type: "success" | "error" | "info" | "warning";
    message: string;
    recipientId?: string;
  }) => void;
  removeNotification: (id: string) => void;
  getNotificationsForCurrentUser: () => Notification[];
  fetchNotifications: (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: true,
  currentPage: "dashboard",
  isKudosModalOpen: false,
  isFeedbackModalOpen: false,
  isLoading: false,
  error: null,
  notifications: [],

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setCurrentPage: (page: string) => {
    set({ currentPage: page });
  },

  openKudosModal: () => {
    set({ isKudosModalOpen: true });
  },

  closeKudosModal: () => {
    set({ isKudosModalOpen: false });
  },

  openFeedbackModal: () => {
    set({ isFeedbackModalOpen: true });
  },

  closeFeedbackModal: () => {
    set({ isFeedbackModalOpen: false });
  },

  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications.slice(0, 4)], // Keep max 5
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(newNotification.id);
    }, 5000);
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  getNotificationsForCurrentUser: () => {
    const { notifications } = get();
    const { currentUser } = useUserStore.getState();

    if (!currentUser) return [];

    // Return notifications that are either:
    // 1. Not targeted to any specific user (recipientId is undefined)
    // 2. Targeted to the current user (recipientId matches current user's ID)
    // 3. Targeted to "current" (for current user)
    // 4. Targeted to "admin" (if current user is admin)
    return notifications.filter(
      (n) =>
        !n.recipientId ||
        n.recipientId === currentUser.id ||
        n.recipientId === "current" ||
        (n.recipientId === "admin" && currentUser.role === "admin"),
    );
  },

  fetchNotifications: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.getNotifications(params);

      set({
        notifications: response.notifications,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications",
        isLoading: false,
      });
      throw error;
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      await api.markNotificationAsRead(id);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read",
      });
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await api.markAllNotificationsAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark all notifications as read",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
