import { create } from "zustand";
import { Voucher, UserVoucher } from "@/types/vouchers";
import { api } from "@/lib/api";
import { useUIStore } from "./useUIStore";
import { useUserStore } from "./useUserStore";

interface VoucherState {
  vouchers: Voucher[];
  userVouchers: UserVoucher[];
  isLoading: boolean;
  error: string | null;
  fetchVouchers: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    type?: string;
    isRedeemed?: boolean;
  }) => Promise<void>;
  redeemVoucher: (id: string) => Promise<void>;
  getVouchersForUser: (userId: string) => UserVoucher[];
  getVoucherStats: () => { total: number; redeemed: number; available: number };
  clearError: () => void;
}

export const useVoucherStore = create<VoucherState>((set, get) => {
  return {
    vouchers: [],
    userVouchers: [],
    isLoading: false,
    error: null,

    fetchVouchers: async (params) => {
      try {
        set({ isLoading: true, error: null });
        const response = await api.getVouchers(params);

        set({
          vouchers: response.vouchers,
          userVouchers: response.userVouchers || [],
          isLoading: false,
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to fetch vouchers",
          isLoading: false,
        });
        throw error;
      }
    },

    redeemVoucher: async (id: string) => {
      try {
        set({ isLoading: true, error: null });
        const { addNotification } = useUIStore.getState();

        const response = await api.redeemVoucher(id);

        // Update the user voucher in the list
        set((state) => ({
          userVouchers: state.userVouchers.map((uv) =>
            uv.id === id
              ? { ...uv, status: "redeemed", redeemedAt: new Date() }
              : uv,
          ),
          isLoading: false,
        }));

        addNotification({
          type: "success",
          message: `Voucher redeemed successfully!`,
          recipientId: "current",
        });
      } catch (error) {
        set({
          error:
            error instanceof Error ? error.message : "Failed to redeem voucher",
          isLoading: false,
        });
        throw error;
      }
    },

    getVouchersForUser: (userId: string) => {
      return get().userVouchers.filter((uv) => uv.userId === userId);
    },

    getVoucherStats: () => {
      const { userVouchers } = get();
      const currentUser = useUserStore.getState().currentUser;

      if (!currentUser) return { total: 0, redeemed: 0, available: 0 };

      const userVouchersForCurrentUser = userVouchers.filter(
        (uv) => uv.userId === currentUser.id,
      );
      const total = userVouchersForCurrentUser.length;
      const redeemed = userVouchersForCurrentUser.filter(
        (uv) => uv.status === "redeemed",
      ).length;
      const available = userVouchersForCurrentUser.filter(
        (uv) => uv.status === "active",
      ).length;

      return { total, redeemed, available };
    },

    clearError: () => {
      set({ error: null });
    },
  };
});
