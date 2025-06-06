import { create } from "zustand";
import { User } from "@/types";
import { mockUsers } from "@/data/mockData";

interface NewUser {
  name: string;
  email: string;
  department: string;
  role: "user" | "admin";
  password: string;
}

interface UserManagementState {
  users: User[];
  isLoading: boolean;
  addUser: (newUser: NewUser) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  updateUserRole: (userId: string, role: "user" | "admin") => void;
  resetUserPassword: (userId: string, newPassword: string) => void;
  getUserById: (userId: string) => User | undefined;
}

export const useUserManagementStore = create<UserManagementState>(
  (set, get) => ({
    users: mockUsers,
    isLoading: false,

    addUser: (newUser: NewUser) => {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
        joinedAt: new Date(),
        totalKudosReceived: 0,
        totalKudosSent: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=random`,
      };

      set((state) => ({
        users: [...state.users, user],
      }));
    },

    updateUser: (userId: string, updates: Partial<User>) => {
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, ...updates } : user,
        ),
      }));
    },

    deleteUser: (userId: string) => {
      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
      }));
    },

    updateUserRole: (userId: string, role: "user" | "admin") => {
      get().updateUser(userId, { role });
    },

    resetUserPassword: (userId: string, newPassword: string) => {
      // In a real app, this would hash the password and store it securely
      console.log(`Password reset for user ${userId} to: ${newPassword}`);
    },

    getUserById: (userId: string) => {
      const { users } = get();
      return users.find((user) => user.id === userId);
    },
  }),
);
