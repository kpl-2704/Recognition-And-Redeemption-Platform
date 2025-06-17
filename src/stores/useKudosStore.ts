import { create } from "zustand";
import { Kudos, KudosTag, ActivityItem, User } from "@/types";
import { api } from "@/lib/api";
import { useUIStore } from "./useUIStore";
import { useUserStore } from "./useUserStore";

// Extended Kudos interface for approval system
interface PendingKudos extends Omit<Kudos, "toUser"> {
  toUser: User | User[]; // Can be single user or multiple users
  status: "pending" | "approved" | "rejected";
  approvalReason?: string;
}

interface KudosState {
  kudos: Kudos[];
  pendingKudos: PendingKudos[];
  tags: KudosTag[];
  activityFeed: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  addKudos: (kudosData: {
    toUserId: string;
    message: string;
    tagIds?: string[];
    isPublic?: boolean;
    monetaryAmount?: number;
    currency?: string;
  }) => Promise<void>;
  approveKudos: (kudosId: string) => Promise<void>;
  rejectKudos: (kudosId: string, reason?: string) => Promise<void>;
  getKudosForUser: (userId: string) => Kudos[];
  getKudosStats: () => { sent: number; received: number };
  refreshFeed: () => Promise<void>;
  fetchKudos: (params?: {
    page?: number;
    limit?: number;
    fromUserId?: string;
    toUserId?: string;
    status?: string;
    isPublic?: boolean;
  }) => Promise<void>;
  fetchKudosTags: () => Promise<void>;
  fetchActivities: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
  }) => Promise<void>;
  clearError: () => void;
}

// Helper function to check if kudos requires approval
const requiresApproval = (fromUser: User, toUsers: User | User[]): boolean => {
  // If sender is manager/admin giving kudos to regular user, require approval
  if (fromUser.role === "admin") {
    const recipients = Array.isArray(toUsers) ? toUsers : [toUsers];
    return recipients.some((user) => user.role === "user");
  }
  return false;
};

// Load initial state from localStorage or use mock data
const loadInitialState = () => {
  try {
    const stored = localStorage.getItem("kudos-store");
    if (stored) {
      const { state, version } = JSON.parse(stored);
      if (version === 1) {
        // Current version
        return state;
      }
    }
  } catch (error) {
    console.error("Error loading kudos store:", error);
  }
  return {
    kudos: [],
    pendingKudos: [],
    tags: [],
    activityFeed: [],
    isLoading: false,
    error: null,
  };
};

export const useKudosStore = create<KudosState>((set, get) => {
  // Initialize with stored state or mock data
  const initialState = loadInitialState();

  return {
    ...initialState,

    addKudos: async (kudosData) => {
      try {
        set({ isLoading: true, error: null });
        const { addNotification } = useUIStore.getState();

        const response = await api.createKudos(kudosData);

        // Add the new kudos to the list
        set((state) => ({
          kudos: [response.kudos, ...state.kudos],
          isLoading: false,
        }));

        // Notify recipient
        addNotification({
          type: "success",
          message: `Kudos sent successfully!`,
          recipientId: kudosData.toUserId,
        });

        // Refresh the feed
        get().refreshFeed();
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to send kudos",
          isLoading: false,
        });
        throw error;
      }
    },

    approveKudos: async (kudosId: string) => {
      try {
        set({ isLoading: true, error: null });
        const { addNotification } = useUIStore.getState();

        await api.approveKudos(kudosId);

        // Remove from pending and add to approved
        set((state) => {
          const pendingKudos = state.pendingKudos.find((k) => k.id === kudosId);
          if (!pendingKudos) return state;

          return {
            pendingKudos: state.pendingKudos.filter((k) => k.id !== kudosId),
            kudos: [pendingKudos as Kudos, ...state.kudos],
            isLoading: false,
          };
        });

        addNotification({
          type: "success",
          message: "Kudos approved successfully!",
          recipientId: "admin",
        });

        get().refreshFeed();
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to approve kudos",
          isLoading: false,
        });
        throw error;
      }
    },

    rejectKudos: async (kudosId: string, reason?: string) => {
      try {
        set({ isLoading: true, error: null });
        const { addNotification } = useUIStore.getState();

        await api.rejectKudos(kudosId, reason);

        // Remove from pending
        set((state) => ({
          pendingKudos: state.pendingKudos.filter((k) => k.id !== kudosId),
          isLoading: false,
        }));

        addNotification({
          type: "info",
          message: "Kudos rejected",
          recipientId: "admin",
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to reject kudos",
          isLoading: false,
        });
        throw error;
      }
    },

    getKudosForUser: (userId: string) => {
      return get().kudos.filter((k) => k.toUserId === userId);
    },

    getKudosStats: () => {
      const { kudos } = get();
      const currentUser = useUserStore.getState().currentUser;

      if (!currentUser) return { sent: 0, received: 0 };

      const sent = kudos.filter((k) => k.fromUserId === currentUser.id).length;
      const received = kudos.filter(
        (k) => k.toUserId === currentUser.id,
      ).length;

      return { sent, received };
    },

    refreshFeed: async () => {
      try {
        await get().fetchActivities();
      } catch (error) {
        console.error("Failed to refresh feed:", error);
      }
    },

    fetchKudos: async (params) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getKudos(params);

        set({
          kudos: response.kudos,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch kudos",
          isLoading: false,
        });
        throw error;
      }
    },

    fetchKudosTags: async () => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getKudosTags();

        set({
          tags: response.tags,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch kudos tags",
          isLoading: false,
        });
        throw error;
      }
    },

    fetchActivities: async (params) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getActivities(params);

        set({
          activityFeed: response.activities,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch activities",
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
