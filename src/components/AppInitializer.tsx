import { useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useKudosStore } from "@/stores/useKudosStore";
import { useUIStore } from "@/stores/useUIStore";
import { api } from "@/lib/api";

export function AppInitializer() {
  const { isAuthenticated, currentUser } = useUserStore();
  const { fetchKudos, fetchKudosTags, fetchActivities } = useKudosStore();
  const { fetchNotifications } = useUIStore();

  useEffect(() => {
    const initializeApp = async () => {
      if (isAuthenticated && currentUser) {
        try {
          // Load initial data in parallel
          await Promise.all([
            fetchKudos(),
            fetchKudosTags(),
            fetchActivities(),
            fetchNotifications(),
          ]);
        } catch (error) {
          console.error("Failed to initialize app data:", error);
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

  // Check for existing auth token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth-token");
      if (token && !isAuthenticated) {
        try {
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
        }
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  return null; // This component doesn't render anything
}
