import { create } from "zustand";
import { Kudos, KudosTag, ActivityItem, User } from "@/types";
import { mockKudos, mockKudosTags, mockActivityFeed } from "@/data/mockData";
import { useUIStore } from "./useUIStore";

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
  addKudos: (
    kudos: Omit<Kudos, "id" | "createdAt"> & {
      toUser: User | User[];
      requiresApproval?: boolean;
    },
  ) => void;
  approveKudos: (kudosId: string) => void;
  rejectKudos: (kudosId: string, reason?: string) => void;
  getKudosForUser: (userId: string) => Kudos[];
  getKudosStats: () => { sent: number; received: number };
  refreshFeed: () => void;
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
    kudos: mockKudos,
    pendingKudos: [],
    tags: mockKudosTags,
    activityFeed: mockActivityFeed,
    isLoading: false,
  };
};

export const useKudosStore = create<KudosState>((set, get) => {
  // Initialize with stored state or mock data
  const initialState = loadInitialState();

  return {
    ...initialState,

    addKudos: (newKudos) => {
      const kudosId = Date.now().toString();
      const createdAt = new Date();
      const { addNotification } = useUIStore.getState();

      // Check if approval is required
      const needsApproval = requiresApproval(
        newKudos.fromUser,
        newKudos.toUser,
      );

      if (needsApproval) {
        // Add to pending kudos
        const pendingKudos: PendingKudos = {
          ...newKudos,
          id: kudosId,
          createdAt,
          status: "pending",
        };

        set((state) => {
          const newState = {
            ...state,
            pendingKudos: [pendingKudos, ...state.pendingKudos],
          };
          localStorage.setItem(
            "kudos-store",
            JSON.stringify({ state: newState, version: 1 }),
          );
          return newState;
        });

        // Notify admins about pending kudos
        addNotification({
          type: "info",
          message: "New kudos pending approval",
          recipientId: "admin", // This will be shown to all admin users
        });

        // Notify sender about pending status
        addNotification({
          type: "info",
          message: "Your kudos is pending approval",
          recipientId: newKudos.fromUserId,
        });
      } else {
        // Handle multiple recipients
        const recipients = Array.isArray(newKudos.toUser)
          ? newKudos.toUser
          : [newKudos.toUser];

        // Create individual kudos entries for each recipient
        const kudosEntries = recipients.map((recipient, index) => ({
          ...newKudos,
          toUser: recipient,
          toUserId: recipient.id,
          id: `${kudosId}-${index}`,
          createdAt,
        }));

        // Create a single activity feed entry for all recipients
        const activityItem: ActivityItem = {
          id: `${kudosId}-activity`,
          type: "kudos",
          userId: newKudos.fromUserId,
          targetUserId: recipients[0].id,
          message:
            recipients.length > 1
              ? `gave kudos to ${recipients[0].name} and ${recipients.length - 1} others`
              : "gave kudos to",
          createdAt,
          user: newKudos.fromUser,
          targetUser: recipients[0],
          kudos: kudosEntries[0],
          additionalRecipients:
            recipients.length > 1 ? recipients.slice(1) : undefined,
        };

        set((state) => {
          const newState = {
            ...state,
            kudos: [...kudosEntries, ...state.kudos],
            activityFeed: [activityItem, ...state.activityFeed],
          };
          localStorage.setItem(
            "kudos-store",
            JSON.stringify({ state: newState, version: 1 }),
          );
          return newState;
        });

        // Notify each recipient individually
        recipients.forEach((recipient) => {
          addNotification({
            type: "success",
            message: `You received kudos from ${newKudos.fromUser.name}!`,
            recipientId: recipient.id,
          });
        });

        // Notify sender about successful kudos
        addNotification({
          type: "success",
          message: `Kudos sent to ${recipients.map((r) => r.name).join(", ")}!`,
          recipientId: newKudos.fromUserId,
        });
      }
    },

    approveKudos: (kudosId: string) => {
      const { pendingKudos } = get();
      const { addNotification } = useUIStore.getState();
      const pendingKudos_item = pendingKudos.find((k) => k.id === kudosId);

      if (pendingKudos_item) {
        // Handle multiple recipients
        const recipients = Array.isArray(pendingKudos_item.toUser)
          ? pendingKudos_item.toUser
          : [pendingKudos_item.toUser];

        recipients.forEach((recipient, index) => {
          const kudos: Kudos = {
            ...pendingKudos_item,
            toUser: recipient,
            toUserId: recipient.id,
            id: `${kudosId}-approved-${index}`,
          };

          const activityItem: ActivityItem = {
            id: `${kudosId}-activity-approved-${index}`,
            type: "kudos",
            userId: kudos.fromUserId,
            targetUserId: kudos.toUserId,
            message: "gave kudos to",
            createdAt: kudos.createdAt,
            user: kudos.fromUser,
            targetUser: recipient,
            kudos,
          };

          set((state) => {
            const newState = {
              ...state,
              kudos: [kudos, ...state.kudos],
              activityFeed: [activityItem, ...state.activityFeed],
              pendingKudos: state.pendingKudos.filter((k) => k.id !== kudosId),
            };
            localStorage.setItem(
              "kudos-store",
              JSON.stringify({ state: newState, version: 1 }),
            );
            return newState;
          });

          // Notify recipient
          addNotification({
            type: "success",
            message: `You received kudos from ${kudos.fromUser.name}!`,
            recipientId: recipient.id,
          });
        });

        // Notify sender about approval
        addNotification({
          type: "success",
          message: "Your kudos has been approved!",
          recipientId: pendingKudos_item.fromUserId,
        });
      }
    },

    rejectKudos: (kudosId: string, reason?: string) => {
      const { addNotification } = useUIStore.getState();
      const pendingKudos_item = get().pendingKudos.find(
        (k) => k.id === kudosId,
      );

      if (pendingKudos_item) {
        set((state) => {
          const newState = {
            ...state,
            pendingKudos: state.pendingKudos.map((k) =>
              k.id === kudosId
                ? { ...k, status: "rejected" as const, approvalReason: reason }
                : k,
            ),
          };
          localStorage.setItem(
            "kudos-store",
            JSON.stringify({ state: newState, version: 1 }),
          );
          return newState;
        });

        // Notify sender about rejection
        addNotification({
          type: "error",
          message: reason || "Your kudos was not approved",
          recipientId: pendingKudos_item.fromUserId,
        });

        // Remove rejected kudos after a delay
        setTimeout(() => {
          set((state) => {
            const newState = {
              ...state,
              pendingKudos: state.pendingKudos.filter((k) => k.id !== kudosId),
            };
            localStorage.setItem(
              "kudos-store",
              JSON.stringify({ state: newState, version: 1 }),
            );
            return newState;
          });
        }, 5000);
      }
    },

    getKudosForUser: (userId: string) => {
      const { kudos } = get();
      return kudos.filter(
        (k) => k.toUserId === userId || k.fromUserId === userId,
      );
    },

    getKudosStats: () => {
      const { kudos } = get();
      const currentUserId = "1"; // Current user ID from mock data

      return {
        sent: kudos.filter((k) => k.fromUserId === currentUserId).length,
        received: kudos.filter((k) => k.toUserId === currentUserId).length,
      };
    },

    refreshFeed: () => {
      set({ isLoading: true });
      // Simulate API call
      setTimeout(() => {
        set({ isLoading: false });
      }, 500);
    },
  };
});
