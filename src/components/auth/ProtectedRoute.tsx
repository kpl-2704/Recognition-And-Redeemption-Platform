import { ReactNode } from "react";
import { useUserStore } from "@/stores/useUserStore";
import Login from "@/pages/Login";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useUserStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}
