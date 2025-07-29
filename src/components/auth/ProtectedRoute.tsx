import { ReactNode, useEffect, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser, isLoading } = useUserStore();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
    console.log("ProtectedRoute - currentUser:", currentUser);
    console.log("ProtectedRoute - isLoading:", isLoading);

    // Wait for authentication check to complete
    if (!isLoading) {
      setIsCheckingAuth(false);

      if (!isAuthenticated) {
        console.log("ProtectedRoute - redirecting to login");
        navigate("/login");
      }
    }
  }, [isAuthenticated, isLoading, navigate, currentUser]);

  // Show loading state while checking authentication
  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute - not authenticated, returning null");
    return null;
  }

  console.log("ProtectedRoute - authenticated, rendering children");
  return <>{children}</>;
}
