import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore } from "@/stores/useUIStore";
import { mockUsers } from "@/data/mockData";
import { Zap, Users, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useUserStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = (user: any) => {
    login(user);
    addNotification({
      type: "success",
      message: `Welcome back, ${user.name}! 👋`,
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to TeamPulse
          </h1>
          <p className="text-xl text-gray-600">
            Real-time employee feedback and recognition platform
          </p>
        </div>

        {/* User Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Choose Your Profile
            </CardTitle>
            <p className="text-gray-600">
              Select a team member to experience TeamPulse
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockUsers.map((user) => (
                <Card
                  key={user.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    selectedUser === user.id
                      ? "ring-2 ring-blue-500 shadow-lg scale-105"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <CardContent className="p-6 text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-2xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {user.name}
                        </h3>
                        {user.role === "admin" && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600">{user.department}</p>

                      <div className="flex items-center justify-center gap-2">
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role === "admin" ? "Admin" : "Team Member"}
                        </Badge>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t">
                        <span>{user.totalKudosReceived} received</span>
                        <span>{user.totalKudosSent} given</span>
                      </div>
                    </div>

                    <Button
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogin(user);
                      }}
                      variant={selectedUser === user.id ? "default" : "outline"}
                    >
                      {selectedUser === user.id
                        ? "Login as " + user.name.split(" ")[0]
                        : "Select"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Demo Info */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                👋 Demo Instructions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <p className="font-medium">
                    🧑‍💼 Regular Users (Sarah, Emma, David, Lisa):
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                    <li>Give and receive kudos</li>
                    <li>Share feedback with teammates</li>
                    <li>View personal analytics</li>
                    <li>Browse team activity</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">👑 Admin User (Marcus):</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                    <li>All regular user features</li>
                    <li>Access admin dashboard</li>
                    <li>Moderate content</li>
                    <li>Export team reports</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            Built with React 18, TypeScript, TailwindCSS, and Zustand
          </p>
        </div>
      </div>
    </div>
  );
}
