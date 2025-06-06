export interface Vendor {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: string;
  isActive: boolean;
  website: string;
}

export interface Voucher {
  id: string;
  vendorId: string;
  vendor: Vendor;
  title: string;
  description: string;
  value: number;
  pointsCost: number;
  validUntil: Date;
  termsAndConditions: string[];
  isActive: boolean;
  image?: string;
}

export interface UserVoucher {
  id: string;
  userId: string;
  voucherId: string;
  voucher: Voucher;
  purchasedAt: Date;
  redeemedAt?: Date;
  code: string;
  status: "active" | "redeemed" | "expired";
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  earnedPoints: number;
  spentPoints: number;
  lastUpdated: Date;
}
