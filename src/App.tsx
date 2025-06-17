import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { KudosForm } from "@/components/kudos/KudosForm";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { AppInitializer } from "@/components/AppInitializer";
import Dashboard from "./pages/Dashboard";
import Kudos from "./pages/Kudos";
import Feedback from "./pages/Feedback";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Redeem from "./pages/Redeem";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* <AppInitializer /> */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/kudos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Kudos />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Feedback />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Admin />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/redeem"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Redeem />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Modals - Only show when authenticated */}
        <ProtectedRoute>
          <KudosForm />
          <FeedbackForm />
        </ProtectedRoute>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
