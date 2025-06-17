import { create } from "zustand";
import { Feedback, User } from "@/types";
import { api } from "@/lib/api";
import { useUIStore } from "./useUIStore";
import { useUserStore } from "./useUserStore";

interface FeedbackState {
  feedback: Feedback[];
  isLoading: boolean;
  error: string | null;
  createFeedback: (feedbackData: {
    toUserId?: string;
    message: string;
    type: "POSITIVE" | "CONSTRUCTIVE" | "GENERAL";
    isPublic?: boolean;
    isAnonymous?: boolean;
  }) => Promise<void>;
  fetchFeedback: (params?: {
    page?: number;
    limit?: number;
    fromUserId?: string;
    toUserId?: string;
    type?: string;
    status?: string;
    isPublic?: boolean;
  }) => Promise<void>;
  getFeedbackForUser: (userId: string) => Feedback[];
  getFeedbackStats: () => { sent: number; received: number };
  clearError: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => {
  return {
    feedback: [],
    isLoading: false,
    error: null,

    createFeedback: async (feedbackData) => {
      try {
        set({ isLoading: true, error: null });
        const { addNotification } = useUIStore.getState();

        const response = await api.createFeedback(feedbackData);

        // Add the new feedback to the list
        set((state) => ({
          feedback: [response.feedback, ...state.feedback],
          isLoading: false,
        }));

        // Notify recipient if specified
        if (feedbackData.toUserId) {
          addNotification({
            type: "info",
            message: `You received new feedback!`,
            recipientId: feedbackData.toUserId,
          });
        }

        // Notify sender
        addNotification({
          type: "success",
          message: "Feedback submitted successfully!",
          recipientId: "current", // Will be handled by UI store
        });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to submit feedback",
          isLoading: false,
        });
        throw error;
      }
    },

    fetchFeedback: async (params) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getFeedback(params);

        set({
          feedback: response.feedback,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch feedback",
          isLoading: false,
        });
        throw error;
      }
    },

    getFeedbackForUser: (userId: string) => {
      return get().feedback.filter((f) => f.toUserId === userId);
    },

    getFeedbackStats: () => {
      const { feedback } = get();
      const currentUser = useUserStore.getState().currentUser;

      if (!currentUser) return { sent: 0, received: 0 };

      const sent = feedback.filter(
        (f) => f.fromUserId === currentUser.id,
      ).length;
      const received = feedback.filter(
        (f) => f.toUserId === currentUser.id,
      ).length;

      return { sent, received };
    },

    clearError: () => {
      set({ error: null });
    },
  };
});
