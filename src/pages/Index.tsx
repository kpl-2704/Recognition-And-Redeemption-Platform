import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const Index = () => {
  // This component now just redirects to the dashboard
  // since the main app content is handled by the Dashboard component
  return <Navigate to="/" replace />;
};

export default Index;
