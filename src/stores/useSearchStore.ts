import { create } from "zustand";
import { useKudosStore } from "./useKudosStore";
import { useFeedbackStore } from "./useFeedbackStore";
import { useUserStore } from "./useUserStore";
import { useUserManagementStore } from "./useUserManagementStore";
import { User, Kudos, Feedback } from "@/types";

export interface SearchResult {
  id: string;
  type: "user" | "kudos" | "feedback";
  title: string;
  subtitle: string;
  data: User | Kudos | Feedback;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  isDropdownOpen: boolean;
  setQuery: (query: string) => void;
  performSearch: (query: string) => void;
  clearSearch: () => void;
  setDropdownOpen: (open: boolean) => void;
  navigateToResult: (result: SearchResult) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  isSearching: false,
  isDropdownOpen: false,

  setQuery: (query: string) => {
    set({ query });
    if (query.trim()) {
      get().performSearch(query.trim());
    } else {
      set({ results: [], isDropdownOpen: false });
    }
  },

  performSearch: (query: string) => {
    if (!query || query.length < 2) {
      set({ results: [], isDropdownOpen: false });
      return;
    }

    set({ isSearching: true });

    try {
      const lowerQuery = query.toLowerCase();
      const results: SearchResult[] = [];

      // Get current state from other stores
      const kudosStore = useKudosStore.getState();
      const feedbackStore = useFeedbackStore.getState();
      const userStore = useUserStore.getState();
      const userManagementStore = useUserManagementStore.getState();

      // Search users
      if (userStore.currentUser) {
        const user = userStore.currentUser;
        if (
          user.name.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery) ||
          user.department.toLowerCase().includes(lowerQuery) ||
          user.role.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: `user-${user.id}`,
            type: "user",
            title: user.name,
            subtitle: `${user.department} • ${user.role}`,
            data: user,
          });
        }
      }

      // Search kudos
      if (kudosStore.kudos) {
        kudosStore.kudos.forEach((kudos) => {
          const fromUser = userManagementStore.users.find(
            (u) => u.id === kudos.fromUserId,
          );
          const toUser = userManagementStore.users.find(
            (u) => u.id === kudos.toUserId,
          );

          if (
            kudos.message.toLowerCase().includes(lowerQuery) ||
            kudos.tags.some((tag) =>
              tag.name.toLowerCase().includes(lowerQuery),
            ) ||
            fromUser?.name.toLowerCase().includes(lowerQuery) ||
            toUser?.name.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: `kudos-${kudos.id}`,
              type: "kudos",
              title: `Kudos: ${kudos.message.substring(0, 50)}${kudos.message.length > 50 ? "..." : ""}`,
              subtitle: `From ${fromUser?.name || "Unknown"} to ${toUser?.name || "Unknown"}`,
              data: kudos,
            });
          }
        });
      }

      // Search feedback
      if (feedbackStore.feedback) {
        feedbackStore.feedback.forEach((feedback) => {
          const fromUser = userManagementStore.users.find(
            (u) => u.id === feedback.fromUserId,
          );
          const toUser = userManagementStore.users.find(
            (u) => u.id === feedback.toUserId,
          );

          if (
            feedback.message.toLowerCase().includes(lowerQuery) ||
            feedback.type.toLowerCase().includes(lowerQuery) ||
            fromUser?.name.toLowerCase().includes(lowerQuery) ||
            toUser?.name.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: `feedback-${feedback.id}`,
              type: "feedback",
              title: `${feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)} Feedback`,
              subtitle: `From ${fromUser?.name || "Anonymous"} to ${toUser?.name || "Unknown"}`,
              data: feedback,
            });
          }
        });
      }

      // Limit results to 10 for performance
      const limitedResults = results.slice(0, 10);

      set({
        results: limitedResults,
        isSearching: false,
        isDropdownOpen: limitedResults.length > 0,
      });
    } catch (error) {
      console.error("Search error:", error);
      set({ results: [], isSearching: false, isDropdownOpen: false });
    }
  },

  clearSearch: () => {
    set({ query: "", results: [], isDropdownOpen: false });
  },

  setDropdownOpen: (open: boolean) => {
    set({ isDropdownOpen: open });
  },

  navigateToResult: (result: SearchResult) => {
    switch (result.type) {
      case "user":
        // For now, navigate to profile page - you might want to show user details
        window.location.href = "/profile";
        break;
      case "kudos":
        window.location.href = "/kudos";
        break;
      case "feedback":
        window.location.href = "/feedback";
        break;
    }
    get().clearSearch();
  },
}));
