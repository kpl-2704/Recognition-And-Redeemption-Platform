import { create } from "zustand";
import { Vendor, Voucher, UserVoucher, UserPoints } from "@/types/vouchers";

// Mock data for vendors
const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "Amazon",
    logo: "https://logo.clearbit.com/amazon.com",
    description: "World's largest online marketplace",
    category: "E-commerce",
    isActive: true,
    website: "amazon.com",
  },
  {
    id: "2",
    name: "Flipkart",
    logo: "https://logo.clearbit.com/flipkart.com",
    description: "India's leading e-commerce platform",
    category: "E-commerce",
    isActive: true,
    website: "flipkart.com",
  },
  {
    id: "3",
    name: "Myntra",
    logo: "https://logo.clearbit.com/myntra.com",
    description: "Fashion and lifestyle destination",
    category: "Fashion",
    isActive: true,
    website: "myntra.com",
  },
  {
    id: "4",
    name: "Swiggy",
    logo: "https://logo.clearbit.com/swiggy.com",
    description: "Food delivery and more",
    category: "Food & Dining",
    isActive: true,
    website: "swiggy.com",
  },
  {
    id: "5",
    name: "Zomato",
    logo: "https://logo.clearbit.com/zomato.com",
    description: "Discover great places to eat",
    category: "Food & Dining",
    isActive: true,
    website: "zomato.com",
  },
  {
    id: "6",
    name: "BookMyShow",
    logo: "https://logo.clearbit.com/bookmyshow.com",
    description: "Movie tickets and entertainment",
    category: "Entertainment",
    isActive: true,
    website: "bookmyshow.com",
  },
  {
    id: "7",
    name: "Uber",
    logo: "https://logo.clearbit.com/uber.com",
    description: "Ride sharing and delivery",
    category: "Travel",
    isActive: true,
    website: "uber.com",
  },
  {
    id: "8",
    name: "Starbucks",
    logo: "https://logo.clearbit.com/starbucks.com",
    description: "Coffee and beverages",
    category: "Food & Dining",
    isActive: true,
    website: "starbucks.com",
  },
];

// Mock vouchers
const generateVouchers = (): Voucher[] => {
  const vouchers: Voucher[] = [];

  mockVendors.forEach((vendor) => {
    // Create different value vouchers for each vendor
    [100, 250, 500, 1000].forEach((value) => {
      vouchers.push({
        id: `${vendor.id}-${value}`,
        vendorId: vendor.id,
        vendor,
        title: `₹${value} ${vendor.name} Gift Card`,
        description: `Get ₹${value} worth of credits for ${vendor.name}`,
        value,
        pointsCost: value * 2, // 2 points per rupee
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        termsAndConditions: [
          "Valid for 1 year from purchase date",
          "Cannot be refunded or exchanged for cash",
          "Can be used multiple times until balance is exhausted",
          "Valid only on the respective platform",
        ],
        isActive: true,
        image: vendor.logo,
      });
    });
  });

  return vouchers;
};

interface VoucherState {
  vendors: Vendor[];
  vouchers: Voucher[];
  userVouchers: UserVoucher[];
  userPoints: Record<string, UserPoints>;
  isLoading: boolean;
  getVouchersByVendor: (vendorId: string) => Voucher[];
  getUserPoints: (userId: string) => number;
  purchaseVoucher: (userId: string, voucherId: string) => Promise<boolean>;
  getUserVouchers: (userId: string) => UserVoucher[];
  redeemVoucher: (userVoucherId: string) => void;
  addPointsToUser: (userId: string, points: number, reason: string) => void;
}

export const useVoucherStore = create<VoucherState>((set, get) => ({
  vendors: mockVendors,
  vouchers: generateVouchers(),
  userVouchers: [],
  userPoints: {},
  isLoading: false,

  getVouchersByVendor: (vendorId: string) => {
    const { vouchers } = get();
    return vouchers.filter(
      (voucher) => voucher.vendorId === vendorId && voucher.isActive,
    );
  },

  getUserPoints: (userId: string) => {
    const { userPoints } = get();
    return userPoints[userId]?.totalPoints || 1000; // Default 1000 points for demo
  },

  purchaseVoucher: async (userId: string, voucherId: string) => {
    const { vouchers, userPoints, getUserPoints } = get();
    const voucher = vouchers.find((v) => v.id === voucherId);
    const currentPoints = getUserPoints(userId);

    if (!voucher || currentPoints < voucher.pointsCost) {
      return false;
    }

    // Generate voucher code
    const code = `TP${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(-4).toUpperCase()}`;

    const userVoucher: UserVoucher = {
      id: Date.now().toString(),
      userId,
      voucherId,
      voucher,
      purchasedAt: new Date(),
      code,
      status: "active",
    };

    set((state) => ({
      userVouchers: [userVoucher, ...state.userVouchers],
      userPoints: {
        ...state.userPoints,
        [userId]: {
          userId,
          totalPoints: currentPoints - voucher.pointsCost,
          earnedPoints: state.userPoints[userId]?.earnedPoints || 1000,
          spentPoints:
            (state.userPoints[userId]?.spentPoints || 0) + voucher.pointsCost,
          lastUpdated: new Date(),
        },
      },
    }));

    return true;
  },

  getUserVouchers: (userId: string) => {
    const { userVouchers } = get();
    return userVouchers.filter((uv) => uv.userId === userId);
  },

  redeemVoucher: (userVoucherId: string) => {
    set((state) => ({
      userVouchers: state.userVouchers.map((uv) =>
        uv.id === userVoucherId
          ? { ...uv, status: "redeemed" as const, redeemedAt: new Date() }
          : uv,
      ),
    }));
  },

  addPointsToUser: (userId: string, points: number, reason: string) => {
    set((state) => {
      const currentUserPoints = state.userPoints[userId] || {
        userId,
        totalPoints: 1000,
        earnedPoints: 1000,
        spentPoints: 0,
        lastUpdated: new Date(),
      };

      return {
        userPoints: {
          ...state.userPoints,
          [userId]: {
            ...currentUserPoints,
            totalPoints: currentUserPoints.totalPoints + points,
            earnedPoints: currentUserPoints.earnedPoints + points,
            lastUpdated: new Date(),
          },
        },
      };
    });
  },
}));
