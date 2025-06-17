import { ReactNode, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);
    console.log("ProtectedRoute - currentUser:", currentUser);

    if (!isAuthenticated) {
      console.log("ProtectedRoute - redirecting to login");
      navigate("/login");
    }
  }, [isAuthenticated, navigate, currentUser]);

  if (!isAuthenticated) {
    console.log("ProtectedRoute - not authenticated, returning null");
    return null;
  }

  console.log("ProtectedRoute - authenticated, rendering children");
  return <>{children}</>;
}
