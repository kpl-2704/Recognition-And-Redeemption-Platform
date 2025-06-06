import { create } from "zustand";
import { Kudos, KudosTag, ActivityItem } from "@/types";
import { mockKudos, mockKudosTags, mockActivityFeed } from "@/data/mockData";

interface KudosState {
  kudos: Kudos[];
  tags: KudosTag[];
  activityFeed: ActivityItem[];
  isLoading: boolean;
  addKudos: (kudos: Omit<Kudos, "id" | "createdAt">) => void;
  getKudosForUser: (userId: string) => Kudos[];
  getKudosStats: () => { sent: number; received: number };
  refreshFeed: () => void;
}

export const useKudosStore = create<KudosState>((set, get) => ({
  kudos: mockKudos,
  tags: mockKudosTags,
  activityFeed: mockActivityFeed,
  isLoading: false,

  addKudos: (newKudos) => {
    const kudos: Kudos = {
      ...newKudos,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const activityItem: ActivityItem = {
      id: Date.now().toString(),
      type: "kudos",
      userId: kudos.fromUserId,
      targetUserId: kudos.toUserId,
      message: "gave kudos to",
      createdAt: new Date(),
      user: kudos.fromUser,
      targetUser: kudos.toUser,
      kudos,
    };

    set((state) => ({
      kudos: [kudos, ...state.kudos],
      activityFeed: [activityItem, ...state.activityFeed],
    }));
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
