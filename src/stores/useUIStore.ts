import { create } from "zustand";
import { useUserStore } from "./useUserStore";

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: Date;
  recipientId?: string; // Optional recipient ID to target specific users
}

interface UIState {
  isSidebarOpen: boolean;
  currentPage: string;
  isKudosModalOpen: boolean;
  isFeedbackModalOpen: boolean;
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
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: true,
  currentPage: "dashboard",
  isKudosModalOpen: false,
  isFeedbackModalOpen: false,
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
    return notifications.filter(
      (n) => !n.recipientId || n.recipientId === currentUser.id,
    );
  },
}));
