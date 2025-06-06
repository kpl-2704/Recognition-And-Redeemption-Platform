import { create } from "zustand";
import { Kudos, KudosTag, ActivityItem, User } from "@/types";
import { mockKudos, mockKudosTags, mockActivityFeed } from "@/data/mockData";

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

export const useKudosStore = create<KudosState>((set, get) => ({
  kudos: mockKudos,
  pendingKudos: [],
  tags: mockKudosTags,
  activityFeed: mockActivityFeed,
  isLoading: false,

  addKudos: (newKudos) => {
    const kudosId = Date.now().toString();
    const createdAt = new Date();

    // Check if approval is required
    const needsApproval = requiresApproval(newKudos.fromUser, newKudos.toUser);

    if (needsApproval) {
      // Add to pending kudos
      const pendingKudos: PendingKudos = {
        ...newKudos,
        id: kudosId,
        createdAt,
        status: "pending",
      };

      set((state) => ({
        pendingKudos: [pendingKudos, ...state.pendingKudos],
      }));
    } else {
      // Handle multiple recipients
      const recipients = Array.isArray(newKudos.toUser)
        ? newKudos.toUser
        : [newKudos.toUser];

      recipients.forEach((recipient, index) => {
        const kudos: Kudos = {
          ...newKudos,
          toUser: recipient,
          id: `${kudosId}-${index}`,
          createdAt,
        };

        const activityItem: ActivityItem = {
          id: `${kudosId}-activity-${index}`,
          type: "kudos",
          userId: kudos.fromUserId,
          targetUserId: kudos.toUserId,
          message: "gave kudos to",
          createdAt,
          user: kudos.fromUser,
          targetUser: kudos.toUser,
          kudos,
        };

        set((state) => ({
          kudos: [kudos, ...state.kudos],
          activityFeed: [activityItem, ...state.activityFeed],
        }));
      });
    }
  },

  approveKudos: (kudosId: string) => {
    const { pendingKudos } = get();
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
          targetUser: kudos.toUser,
          kudos,
        };

        set((state) => ({
          kudos: [kudos, ...state.kudos],
          activityFeed: [activityItem, ...state.activityFeed],
        }));
      });

      // Remove from pending
      set((state) => ({
        pendingKudos: state.pendingKudos.filter((k) => k.id !== kudosId),
      }));
    }
  },

  rejectKudos: (kudosId: string, reason?: string) => {
    set((state) => ({
      pendingKudos: state.pendingKudos.map((k) =>
        k.id === kudosId
          ? { ...k, status: "rejected" as const, approvalReason: reason }
          : k,
      ),
    }));

    // Remove rejected kudos after a delay
    setTimeout(() => {
      set((state) => ({
        pendingKudos: state.pendingKudos.filter((k) => k.id !== kudosId),
      }));
    }, 5000);
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
}));
