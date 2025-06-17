import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatsCards } from "@/components/analytics/StatsCards";
import { KudosCard } from "@/components/kudos/KudosCard";
import { useKudosStore } from "@/stores/useKudosStore";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { Heart, TrendingUp, Gift } from "lucide-react";

export default function Dashboard() {
  const { kudos, getKudosStats, fetchKudos, fetchActivities } = useKudosStore();
  const { setCurrentPage } = useUIStore();
  const { currentUser } = useUserStore();

  console.log("Dashboard - rendering with currentUser:", currentUser);

  useEffect(() => {
    console.log("Dashboard - useEffect running");
    setCurrentPage("dashboard");

    // Fetch kudos and activities when component mounts
    if (currentUser) {
      fetchKudos();
      fetchActivities();
    }
  }, [setCurrentPage, currentUser, fetchKudos, fetchActivities]);

  const stats = getKudosStats();
  const recentKudos = kudos.slice(0, 3);
  const userKudos = kudos
    .filter((k) => k.toUserId === currentUser?.id)
    .slice(0, 2);

  console.log("Dashboard - stats:", stats);
  console.log("Dashboard - recentKudos:", recentKudos);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {currentUser?.name}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Ready to spread some appreciation today? Your team is waiting for your
          recognition.
        </p>
      </div>

      {/* Stats Overview */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Right Column - Quick Actions & Personal Stats */}
        <div className="space-y-6">
          <QuickActions />

          {/* Personal Kudos Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Kudos Sent</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {stats.sent}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-blue-500 fill-current" />
                    <span className="font-medium">Kudos Received</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats.received}
                  </span>
                </div>
                <Button
                  onClick={() => (window.location.href = "/redeem")}
                  className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Gift className="w-4 h-4" />
                  Redeem Vouchers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Kudos in Team */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Team Kudos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentKudos.length > 0 ? (
                recentKudos.map((kudos) => (
                  <KudosCard key={kudos.id} kudos={kudos} showActions={false} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No recent kudos. Be the first to give some!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Recent Kudos */}
        <Card>
          <CardHeader>
            <CardTitle>Kudos You Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userKudos.length > 0 ? (
                userKudos.map((kudos) => (
                  <KudosCard key={kudos.id} kudos={kudos} showActions={false} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No kudos received yet. Keep up the great work!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
