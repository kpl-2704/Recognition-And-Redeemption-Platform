import {
  User,
  Kudos,
  Feedback,
  KudosTag,
  ActivityItem,
  KudosStats,
  TeamStats,
} from "@/types";

export const mockKudosTags: KudosTag[] = [
  { id: "1", name: "Grit", emoji: "🔥", color: "bg-red-100 text-red-800" },
  {
    id: "2",
    name: "Innovation",
    emoji: "💡",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "3",
    name: "Teamwork",
    emoji: "🤝",
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "4",
    name: "Leadership",
    emoji: "👑",
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "5",
    name: "Quality",
    emoji: "⭐",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "6",
    name: "Speed",
    emoji: "⚡",
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "7",
    name: "Mentorship",
    emoji: "🎯",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    id: "8",
    name: "Creativity",
    emoji: "🎨",
    color: "bg-pink-100 text-pink-800",
  },
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
    role: "user",
    department: "Engineering",
    joinedAt: new Date("2023-01-15"),
    totalKudosReceived: 24,
    totalKudosSent: 18,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.johnson@company.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    role: "admin",
    department: "Product",
    joinedAt: new Date("2022-08-20"),
    totalKudosReceived: 31,
    totalKudosSent: 42,
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma.rodriguez@company.com",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    role: "user",
    department: "Design",
    joinedAt: new Date("2023-03-10"),
    totalKudosReceived: 19,
    totalKudosSent: 15,
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@company.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    role: "user",
    department: "Engineering",
    joinedAt: new Date("2022-11-05"),
    totalKudosReceived: 28,
    totalKudosSent: 22,
  },
  {
    id: "5",
    name: "Lisa Park",
    email: "lisa.park@company.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    role: "user",
    department: "Marketing",
    joinedAt: new Date("2023-02-14"),
    totalKudosReceived: 16,
    totalKudosSent: 20,
  },
];

export const currentUser = mockUsers[0]; // Sarah Chen as the current user

export const mockKudos: Kudos[] = [
  {
    id: "1",
    fromUserId: "2",
    toUserId: "1",
    message:
      "Amazing work on the new dashboard! The user experience is incredibly smooth.",
    tags: [mockKudosTags[1], mockKudosTags[4]], // Innovation, Quality
    createdAt: new Date("2024-01-15T10:30:00Z"),
    isPublic: true,
    fromUser: mockUsers[1],
    toUser: mockUsers[0],
  },
  {
    id: "2",
    fromUserId: "3",
    toUserId: "4",
    message:
      "Thank you for helping me debug that complex issue. Your patience and expertise made all the difference!",
    tags: [mockKudosTags[6], mockKudosTags[2]], // Mentorship, Teamwork
    createdAt: new Date("2024-01-14T15:45:00Z"),
    isPublic: true,
    fromUser: mockUsers[2],
    toUser: mockUsers[3],
  },
  {
    id: "3",
    fromUserId: "1",
    toUserId: "5",
    message:
      "The marketing campaign exceeded all expectations! Great strategic thinking.",
    tags: [mockKudosTags[7], mockKudosTags[3]], // Creativity, Leadership
    createdAt: new Date("2024-01-14T09:20:00Z"),
    isPublic: true,
    fromUser: mockUsers[0],
    toUser: mockUsers[4],
  },
  {
    id: "4",
    fromUserId: "4",
    toUserId: "2",
    message:
      "Outstanding product vision and execution on the latest feature release.",
    tags: [mockKudosTags[3], mockKudosTags[1]], // Leadership, Innovation
    createdAt: new Date("2024-01-13T14:15:00Z"),
    isPublic: true,
    fromUser: mockUsers[3],
    toUser: mockUsers[1],
  },
  {
    id: "5",
    fromUserId: "5",
    toUserId: "3",
    message:
      "Love the new design system! It makes our brand so much more cohesive.",
    tags: [mockKudosTags[7], mockKudosTags[4]], // Creativity, Quality
    createdAt: new Date("2024-01-12T11:30:00Z"),
    isPublic: true,
    fromUser: mockUsers[4],
    toUser: mockUsers[2],
  },
];

export const mockFeedback: Feedback[] = [
  {
    id: "1",
    fromUserId: "2",
    toUserId: "1",
    message:
      "Consider adding more detailed documentation for the new API endpoints.",
    type: "constructive",
    isPublic: false,
    isAnonymous: false,
    createdAt: new Date("2024-01-15T16:00:00Z"),
    status: "reviewed",
    fromUser: mockUsers[1],
    toUser: mockUsers[0],
  },
  {
    id: "2",
    fromUserId: "3",
    message: "The team standup meetings could be more focused and time-boxed.",
    type: "general",
    isPublic: true,
    isAnonymous: true,
    createdAt: new Date("2024-01-14T08:30:00Z"),
    status: "pending",
    fromUser: mockUsers[2],
  },
];

export const mockActivityFeed: ActivityItem[] = [
  {
    id: "1",
    type: "kudos",
    userId: "2",
    targetUserId: "1",
    message: "gave kudos to",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    user: mockUsers[1],
    targetUser: mockUsers[0],
    kudos: mockKudos[0],
  },
  {
    id: "2",
    type: "kudos",
    userId: "3",
    targetUserId: "4",
    message: "gave kudos to",
    createdAt: new Date("2024-01-14T15:45:00Z"),
    user: mockUsers[2],
    targetUser: mockUsers[3],
    kudos: mockKudos[1],
  },
  {
    id: "3",
    type: "feedback",
    userId: "3",
    message: "shared team feedback",
    createdAt: new Date("2024-01-14T08:30:00Z"),
    user: mockUsers[2],
    feedback: mockFeedback[1],
  },
  {
    id: "4",
    type: "kudos",
    userId: "1",
    targetUserId: "5",
    message: "gave kudos to",
    createdAt: new Date("2024-01-14T09:20:00Z"),
    user: mockUsers[0],
    targetUser: mockUsers[4],
    kudos: mockKudos[2],
  },
];

export const mockKudosStats: KudosStats = {
  totalKudos: 156,
  kudosThisMonth: 42,
  topTags: [
    { tag: mockKudosTags[1], count: 24 }, // Innovation
    { tag: mockKudosTags[2], count: 19 }, // Teamwork
    { tag: mockKudosTags[4], count: 16 }, // Quality
  ],
  trendData: [
    { date: "2024-01-01", count: 8 },
    { date: "2024-01-02", count: 12 },
    { date: "2024-01-03", count: 6 },
    { date: "2024-01-04", count: 15 },
    { date: "2024-01-05", count: 9 },
    { date: "2024-01-06", count: 18 },
    { date: "2024-01-07", count: 14 },
  ],
};

export const mockTeamStats: TeamStats = {
  totalMembers: 5,
  activeMembers: 5,
  kudosGiven: 156,
  feedbackCount: 23,
  topPerformers: [mockUsers[1], mockUsers[0], mockUsers[3]],
  engagementTrend: [
    { date: "2024-01-01", kudos: 8, feedback: 3 },
    { date: "2024-01-02", kudos: 12, feedback: 2 },
    { date: "2024-01-03", kudos: 6, feedback: 5 },
    { date: "2024-01-04", kudos: 15, feedback: 1 },
    { date: "2024-01-05", kudos: 9, feedback: 4 },
    { date: "2024-01-06", kudos: 18, feedback: 2 },
    { date: "2024-01-07", kudos: 14, feedback: 6 },
  ],
};
