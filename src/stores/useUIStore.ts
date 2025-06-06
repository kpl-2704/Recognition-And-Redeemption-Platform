import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  currentPage: string;
  isKudosModalOpen: boolean;
  isFeedbackModalOpen: boolean;
  isDarkMode: boolean;
  toggleSidebar: () => void;
  setCurrentPage: (page: string) => void;
  openKudosModal: () => void;
  closeKudosModal: () => void;
  openFeedbackModal: () => void;
  closeFeedbackModal: () => void;
  toggleDarkMode: () => void;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
    timestamp: Date;
  }>;
  addNotification: (notification: {
    type: "success" | "error" | "info" | "warning";
    message: string;
  }) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: true,
  currentPage: "dashboard",
  isKudosModalOpen: false,
  isFeedbackModalOpen: false,
  isDarkMode: false,
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

  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }));
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
}));
