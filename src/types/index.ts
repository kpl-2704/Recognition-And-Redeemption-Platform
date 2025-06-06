export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  department?: string;
  joinedAt: Date;
  totalKudosReceived: number;
  totalKudosSent: number;
}

export interface KudosTag {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface Kudos {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  tags: KudosTag[];
  createdAt: Date;
  isPublic: boolean;
  fromUser: User;
  toUser: User;
}

export interface Feedback {
  id: string;
  fromUserId: string;
  toUserId?: string;
  message: string;
  type: "positive" | "constructive" | "general";
  isPublic: boolean;
  isAnonymous: boolean;
  createdAt: Date;
  status: "pending" | "reviewed" | "flagged";
  fromUser: User;
  toUser?: User;
}

export interface ActivityItem {
  id: string;
  type: "kudos" | "feedback" | "milestone";
  userId: string;
  targetUserId?: string;
  message: string;
  createdAt: Date;
  user: User;
  targetUser?: User;
  kudos?: Kudos;
  feedback?: Feedback;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  createdAt: Date;
}

export interface KudosStats {
  totalKudos: number;
  kudosThisMonth: number;
  topTags: Array<{ tag: KudosTag; count: number }>;
  trendData: Array<{ date: string; count: number }>;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  kudosGiven: number;
  feedbackCount: number;
  topPerformers: User[];
  engagementTrend: Array<{ date: string; kudos: number; feedback: number }>;
}

// Re-export voucher types
export * from "./vouchers";
