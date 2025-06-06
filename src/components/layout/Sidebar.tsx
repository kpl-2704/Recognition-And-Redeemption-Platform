import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Heart,
  MessageSquare,
  BarChart3,
  User,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/kudos", icon: Heart, label: "Kudos" },
  { path: "/feedback", icon: MessageSquare, label: "Feedback" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/profile", icon: User, label: "Profile" },
];

const adminItems = [{ path: "/admin", icon: Shield, label: "Admin Panel" }];

export function Sidebar() {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { currentUser } = useUserStore();

  const isAdmin = currentUser?.role === "admin";

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50",
        isSidebarOpen ? "w-64" : "w-16",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div
          className={cn(
            "flex items-center gap-3",
            !isSidebarOpen && "justify-center",
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">TeamPulse</h1>
              <p className="text-xs text-gray-500">Recognition Platform</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-1 h-auto"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* User Profile */}
      {currentUser && (
        <div className="p-4 border-b border-gray-200">
          <div
            className={cn(
              "flex items-center gap-3",
              !isSidebarOpen && "justify-center",
            )}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.department}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-100",
                !isSidebarOpen && "justify-center px-2",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && item.label}
            </Link>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div
              className={cn(
                "pt-4 mt-4 border-t border-gray-200",
                !isSidebarOpen && "border-t-0 pt-2 mt-2",
              )}
            >
              {isSidebarOpen && (
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Admin
                </p>
              )}
              {adminItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-gray-700 hover:bg-gray-100",
                      !isSidebarOpen && "justify-center px-2",
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {isSidebarOpen && item.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors",
            !isSidebarOpen && "justify-center px-2",
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isSidebarOpen && "Settings"}
        </Link>
      </div>
    </div>
  );
}
