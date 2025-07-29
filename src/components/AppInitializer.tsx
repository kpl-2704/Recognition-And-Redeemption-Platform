import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useKudosStore } from "@/stores/useKudosStore";
import { useUIStore } from "@/stores/useUIStore";
import { api } from "@/lib/api";
import {
  mockUsers,
  mockKudos,
  mockKudosTags,
  mockActivityFeed,
} from "@/data/mockData";

export function AppInitializer() {
  const { isAuthenticated, currentUser } = useUserStore();
  const { fetchKudos, fetchKudosTags, fetchActivities } = useKudosStore();
  const { fetchNotifications } = useUIStore();

  useEffect(() => {
    const initializeApp = async () => {
      if (isAuthenticated && currentUser) {
        try {
          // Load initial data in parallel for authenticated users
          await Promise.all([
            fetchKudos(),
            fetchKudosTags(),
            fetchActivities(),
            fetchNotifications(),
          ]);
        } catch (error) {
          console.error("Failed to initialize app data:", error);
        }
      } else if (!isAuthenticated && !currentUser) {
        // For guest users, set up admin demo data
        try {
          const adminUser =
            mockUsers.find((user) => user.role === "admin") || mockUsers[1]; // Marcus Johnson is admin

          // Set the admin user as current user for demo purposes
          useUserStore.setState({
            currentUser: adminUser,
            isAuthenticated: false, // Keep as false to indicate guest mode
            isLoading: false,
            error: null,
          });

          // Load mock data for guest users
          useKudosStore.setState({
            kudos: mockKudos,
            tags: mockKudosTags,
            activityFeed: mockActivityFeed,
            isLoading: false,
          });

          console.log("Demo admin data loaded for guest user:", adminUser.name);
        } catch (error) {
          console.error("Failed to load demo data:", error);
        }
      }
    };

    initializeApp();
  }, [
    isAuthenticated,
    currentUser,
    fetchKudos,
    fetchKudosTags,
    fetchActivities,
    fetchNotifications,
  ]);

  // Check for existing auth token on app load (optional - for guest mode)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth-token");
      if (token && !isAuthenticated) {
        try {
          // Set loading state while checking authentication
          useUserStore.setState({ isLoading: true });
          const user = await api.getCurrentUser();
          // Set the user directly without trying to login again
          useUserStore.setState({
            currentUser: user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem("auth-token");
          useUserStore.setState({
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else if (!token) {
        // No token found, ensure loading state is false for guest mode
        useUserStore.setState({ isLoading: false });
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  return null; // This component doesn't render anything
}
