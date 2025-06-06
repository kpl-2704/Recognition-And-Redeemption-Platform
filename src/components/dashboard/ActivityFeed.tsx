import { ActivityItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Trophy } from "lucide-react";
import { useKudosStore } from "@/stores/useKudosStore";

export function ActivityFeed() {
  const { activityFeed, isLoading } = useKudosStore();

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "kudos":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "feedback":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "milestone":
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      default:
        return <Heart className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityText = (item: ActivityItem) => {
    switch (item.type) {
      case "kudos":
        return (
          <div>
            <span className="font-medium">{item.user.name}</span>
            <span className="text-gray-600"> gave kudos to </span>
            <span className="font-medium">{item.targetUser?.name}</span>
          </div>
        );
      case "feedback":
        return (
          <div>
            <span className="font-medium">{item.user.name}</span>
            <span className="text-gray-600"> shared feedback</span>
          </div>
        );
      case "milestone":
        return (
          <div>
            <span className="font-medium">{item.user.name}</span>
            <span className="text-gray-600"> {item.message}</span>
          </div>
        );
      default:
        return (
          <div>
            <span className="font-medium">{item.user.name}</span>
            <span className="text-gray-600"> {item.message}</span>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityFeed.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-gray-500">
                Start giving kudos to see activity here!
              </p>
            </div>
          ) : (
            activityFeed.map((item, index) => (
              <div
                key={item.id}
                className="activity-item flex items-start gap-3 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={item.user.avatar} alt={item.user.name} />
                  <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(item.type)}
                    {getActivityText(item)}
                  </div>

                  {item.kudos && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">
                        "{item.kudos.message}"
                      </p>
                      {item.kudos.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.kudos.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className={`${tag.color} text-xs border-0 gap-1`}
                            >
                              <span>{tag.emoji}</span>
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {item.feedback && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        "{item.feedback.message}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </span>
                    {item.type === "kudos" && item.kudos?.isPublic && (
                      <Badge variant="outline" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
