import { create } from "zustand";
import { User } from "@/types";

export interface Comment {
  id: string;
  kudosId: string;
  userId: string;
  message: string;
  createdAt: Date;
  user: User;
}

interface CommentsState {
  comments: Comment[];
  isLoading: boolean;
  addComment: (kudosId: string, message: string, user: User) => void;
  getCommentsForKudos: (kudosId: string) => Comment[];
  deleteComment: (commentId: string) => void;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: [],
  isLoading: false,

  addComment: (kudosId: string, message: string, user: User) => {
    const comment: Comment = {
      id: Date.now().toString(),
      kudosId,
      userId: user.id,
      message,
      createdAt: new Date(),
      user,
    };

    set((state) => ({
      comments: [comment, ...state.comments],
    }));
  },

  getCommentsForKudos: (kudosId: string) => {
    const { comments } = get();
    return comments.filter((comment) => comment.kudosId === kudosId);
  },

  deleteComment: (commentId: string) => {
    set((state) => ({
      comments: state.comments.filter((comment) => comment.id !== commentId),
    }));
  },
}));
