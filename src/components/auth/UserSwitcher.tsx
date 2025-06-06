import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore } from "@/stores/useUIStore";
import { mockUsers } from "@/data/mockData";
import { Users, Crown, RefreshCw } from "lucide-react";

export function UserSwitcher() {
  const { login, currentUser } = useUserStore();
  const { addNotification } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitchUser = (user: any) => {
    login(user);
    addNotification({
      type: "success",
      message: `Switched to ${user.name}! 👋`,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2 justify-start w-full">
          <RefreshCw className="w-4 h-4" />
          Switch User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Switch User Account
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                currentUser?.id === user.id
                  ? "bg-blue-50 border-blue-200 ring-1 ring-blue-300"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleSwitchUser(user)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {user.name}
                    </h3>
                    {user.role === "admin" && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    {currentUser?.id === user.id && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{user.department}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.role === "admin" ? "Admin" : "Member"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
                <span>❤️ {user.totalKudosReceived} received</span>
                <span>💝 {user.totalKudosSent} given</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">💡 Demo Feature</p>
          <p>
            Switch between different user accounts to experience TeamPulse from
            various perspectives.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
