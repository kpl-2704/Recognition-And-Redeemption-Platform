import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { mockUsers } from "@/data/mockData";

export function Leaderboard() {
  // Sort users by total kudos received
  const topPerformers = [...mockUsers]
    .sort((a, b) => b.totalKudosReceived - a.totalKudosReceived)
    .slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">
            #{rank}
          </div>
        );
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">1st</Badge>;
      case 2:
        return <Badge className="bg-gray-400 hover:bg-gray-500">2nd</Badge>;
      case 3:
        return <Badge className="bg-amber-600 hover:bg-amber-700">3rd</Badge>;
      default:
        return <Badge variant="outline">#{rank}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topPerformers.map((user, index) => {
            const rank = index + 1;
            return (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  rank <= 3
                    ? "bg-gradient-to-r from-gray-50 to-transparent border border-gray-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(rank)}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {user.name}
                    </h3>
                    {rank <= 3 && getRankBadge(rank)}
                  </div>
                  <p className="text-sm text-gray-500">{user.department}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {user.totalKudosReceived}
                      </p>
                      <p className="text-xs text-gray-500">Kudos received</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {user.totalKudosSent}
                      </p>
                      <p className="text-xs text-gray-500">Kudos given</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {topPerformers.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No rankings yet
            </h3>
            <p className="text-gray-500">
              Start giving kudos to build the leaderboard!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
