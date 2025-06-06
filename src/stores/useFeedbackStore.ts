import { create } from "zustand";
import { Feedback } from "@/types";
import { mockFeedback } from "@/data/mockData";

interface FeedbackState {
  feedback: Feedback[];
  isLoading: boolean;
  addFeedback: (
    feedback: Omit<Feedback, "id" | "createdAt" | "status">,
  ) => void;
  getFeedbackForUser: (userId: string) => Feedback[];
  updateFeedbackStatus: (id: string, status: Feedback["status"]) => void;
  getPendingFeedback: () => Feedback[];
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  feedback: mockFeedback,
  isLoading: false,

  addFeedback: (newFeedback) => {
    const feedback: Feedback = {
      ...newFeedback,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: "pending",
    };

    set((state) => ({
      feedback: [feedback, ...state.feedback],
    }));
  },

  getFeedbackForUser: (userId: string) => {
    const { feedback } = get();
    return feedback.filter(
      (f) => f.toUserId === userId || f.fromUserId === userId,
    );
  },

  updateFeedbackStatus: (id: string, status: Feedback["status"]) => {
    set((state) => ({
      feedback: state.feedback.map((f) => (f.id === id ? { ...f, status } : f)),
    }));
  },

  getPendingFeedback: () => {
    const { feedback } = get();
    return feedback.filter((f) => f.status === "pending");
  },
}));
