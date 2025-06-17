import { create } from "zustand";
import { api } from "@/lib/api";

interface Budget {
  id: string;
  userId: string;
  totalBudget: number;
  usedBudget: number;
  monthlyBudget: number;
  availableBudget: number;
  availableMonthlyBudget: number;
  resetDate: Date;
  user?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    role: string;
  };
}

interface BudgetState {
  myBudget: Budget | null;
  allBudgets: Budget[];
  isLoading: boolean;
  error: string | null;
  fetchMyBudget: () => Promise<void>;
  updateMyBudget: (budgetData: {
    totalBudget?: number;
    monthlyBudget?: number;
  }) => Promise<void>;
  fetchAllBudgets: () => Promise<void>;
  allocateBudget: (
    userId: string,
    amount: number,
    type: "total" | "monthly",
  ) => Promise<void>;
  getUserBudget: (userId: string) => Promise<Budget | null>;
  clearError: () => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => {
  return {
    myBudget: null,
    allBudgets: [],
    isLoading: false,
    error: null,

    fetchMyBudget: async () => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getMyBudget();
        set({
          myBudget: response.budget,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch budget",
          isLoading: false,
        });
        throw error;
      }
    },

    updateMyBudget: async (budgetData) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.updateMyBudget(budgetData);
        set({
          myBudget: response.budget,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to update budget",
          isLoading: false,
        });
        throw error;
      }
    },

    fetchAllBudgets: async () => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getAllBudgets();
        set({
          allBudgets: response.budgets,
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch budgets",
          isLoading: false,
        });
        throw error;
      }
    },

    allocateBudget: async (userId, amount, type) => {
      try {
        set({ isLoading: true, error: null });
        await api.allocateBudget({ userId, amount, type });

        // Refresh all budgets
        await get().fetchAllBudgets();

        set({ isLoading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to allocate budget",
          isLoading: false,
        });
        throw error;
      }
    },

    getUserBudget: async (userId) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getUserBudget(userId);
        set({ isLoading: false });
        return response.budget;
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch user budget",
          isLoading: false,
        });
        return null;
      }
    },

    clearError: () => {
      set({ error: null });
    },
  };
});
