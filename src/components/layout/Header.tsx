import { Bell, Plus, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { useSearchStore } from "@/stores/useSearchStore";
import { UserSwitcher } from "@/components/auth/UserSwitcher";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { SearchDropdown } from "../search/SearchDropdown";

export function Header() {
  const { openKudosModal, openFeedbackModal, getNotificationsForCurrentUser } =
    useUIStore();
  const { currentUser, logout, isAuthenticated } = useUserStore();
  const navigate = useNavigate();
  const {
    query,
    results,
    isDropdownOpen,
    setQuery,
    clearSearch,
    setDropdownOpen,
    navigateToResult,
  } = useSearchStore();

  const searchRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const notifications = getNotificationsForCurrentUser();
  const unreadCount = notifications.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setDropdownOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearchFocus = () => {
    setIsFocused(true);
    if (query && results.length > 0) {
      setDropdownOpen(true);
    }
  };

  const handleResultClick = (result: any) => {
    navigateToResult(result);
    setIsFocused(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              placeholder="Search people, kudos, or feedback..."
              className="pl-10"
            />
            <SearchDropdown
              isOpen={isDropdownOpen && isFocused}
              results={results}
              onResultClick={handleResultClick}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={
                isAuthenticated ? openKudosModal : () => navigate("/login")
              }
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Give Kudos
            </Button>
            <Button
              onClick={
                isAuthenticated ? openFeedbackModal : () => navigate("/login")
              }
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Share Feedback
            </Button>
          </div>

          {/* Notifications */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative p-2">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-3 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No new notifications
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="p-3 cursor-pointer"
                      >
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {currentUser?.name?.charAt(0) || "G"}
                </div>
                <span className="hidden sm:inline">
                  {currentUser?.name || "Guest User"}
                  {!isAuthenticated && currentUser && (
                    <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Demo Features</DropdownMenuLabel>
                  <UserSwitcher />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Guest Mode</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/login")}
                    className="text-blue-600 focus:text-blue-600"
                  >
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Demo Features</DropdownMenuLabel>
                  <UserSwitcher />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
