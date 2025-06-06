import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KudosCard } from "@/components/kudos/KudosCard";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { useKudosStore } from "@/stores/useKudosStore";
import {
  Heart,
  MessageSquare,
  Calendar,
  MapPin,
  Mail,
  Edit,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Profile() {
  const { setCurrentPage } = useUIStore();
  const { currentUser } = useUserStore();
  const { kudos } = useKudosStore();

  useEffect(() => {
    setCurrentPage("profile");
  }, [setCurrentPage]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Profile not found
          </h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userKudosReceived = kudos.filter((k) => k.toUserId === currentUser.id);
  const userKudosSent = kudos.filter((k) => k.fromUserId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="text-2xl">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {currentUser.name}
                </h1>
                <Badge
                  variant={
                    currentUser.role === "admin" ? "default" : "secondary"
                  }
                >
                  {currentUser.role === "admin" ? "Admin" : "Team Member"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{currentUser.department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Joined{" "}
                    {formatDistanceToNow(currentUser.joinedAt, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <Button className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {currentUser.totalKudosReceived}
            </p>
            <p className="text-sm text-gray-600">Kudos Received</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-blue-500 mx-auto mb-2 fill-current" />
            <p className="text-2xl font-bold text-gray-900">
              {currentUser.totalKudosSent}
            </p>
            <p className="text-sm text-gray-600">Kudos Given</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-600">Feedback Shared</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold">%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">98%</p>
            <p className="text-sm text-gray-600">Positivity Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kudos Received */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Recent Kudos Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userKudosReceived.length > 0 ? (
                userKudosReceived
                  .slice(0, 3)
                  .map((kudos) => (
                    <KudosCard
                      key={kudos.id}
                      kudos={kudos}
                      showActions={false}
                    />
                  ))
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No kudos received yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kudos Given */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-500 fill-current" />
              Recent Kudos Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userKudosSent.length > 0 ? (
                userKudosSent
                  .slice(0, 3)
                  .map((kudos) => (
                    <KudosCard
                      key={kudos.id}
                      kudos={kudos}
                      showActions={false}
                    />
                  ))
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No kudos given yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recognition Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Recognition Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Most Used Tags When Giving Kudos
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800 gap-1">
                  🤝 <span>Teamwork</span>
                </Badge>
                <Badge className="bg-green-100 text-green-800 gap-1">
                  ⭐ <span>Quality</span>
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 gap-1">
                  💡 <span>Innovation</span>
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Most Received Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-red-100 text-red-800 gap-1">
                  🔥 <span>Grit</span>
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                  💡 <span>Innovation</span>
                </Badge>
                <Badge className="bg-indigo-100 text-indigo-800 gap-1">
                  🎯 <span>Mentorship</span>
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
