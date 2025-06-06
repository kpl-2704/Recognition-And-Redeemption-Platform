import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUIStore } from "@/stores/useUIStore";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { useUserStore } from "@/stores/useUserStore";
import { MessageSquare, Plus, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Feedback() {
  const { setCurrentPage, openFeedbackModal } = useUIStore();
  const { feedback } = useFeedbackStore();
  const { currentUser } = useUserStore();

  useEffect(() => {
    setCurrentPage("feedback");
  }, [setCurrentPage]);

  const userFeedbackReceived = feedback.filter(
    (f) => f.toUserId === currentUser?.id,
  );
  const userFeedbackSent = feedback.filter(
    (f) => f.fromUserId === currentUser?.id,
  );
  const publicFeedback = feedback.filter((f) => f.isPublic && !f.isAnonymous);

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "constructive":
        return "bg-blue-100 text-blue-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const FeedbackCard = ({ feedbackItem }: { feedbackItem: any }) => (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage
              src={
                feedbackItem.isAnonymous
                  ? undefined
                  : feedbackItem.fromUser.avatar
              }
              alt={
                feedbackItem.isAnonymous
                  ? "Anonymous"
                  : feedbackItem.fromUser.name
              }
            />
            <AvatarFallback>
              {feedbackItem.isAnonymous
                ? "?"
                : feedbackItem.fromUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900">
                {feedbackItem.isAnonymous
                  ? "Anonymous"
                  : feedbackItem.fromUser.name}
              </span>
              {feedbackItem.toUser && (
                <>
                  <span className="text-gray-500">gave feedback to</span>
                  <span className="font-medium text-gray-900">
                    {feedbackItem.toUser.name}
                  </span>
                </>
              )}
              {!feedbackItem.toUser && (
                <span className="text-gray-500">shared team feedback</span>
              )}
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">
              {feedbackItem.message}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <Badge className={getFeedbackTypeColor(feedbackItem.type)}>
                  {feedbackItem.type}
                </Badge>
                <span className="text-gray-500">
                  {formatDistanceToNow(feedbackItem.createdAt, {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {feedbackItem.isPublic ? (
                  <Badge variant="outline" className="gap-1">
                    <Eye className="w-3 h-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <EyeOff className="w-3 h-3" />
                    Private
                  </Badge>
                )}
                {feedbackItem.isAnonymous && (
                  <Badge variant="secondary">Anonymous</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Feedback</h1>
          <p className="text-gray-600 mt-2">
            Share insights and help each other grow
          </p>
        </div>
        <Button onClick={openFeedbackModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Share Feedback
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {feedback.length}
            </p>
            <p className="text-sm text-gray-600">Total Feedback</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {userFeedbackReceived.length}
            </p>
            <p className="text-sm text-gray-600">Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {userFeedbackSent.length}
            </p>
            <p className="text-sm text-gray-600">Given</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Eye className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {publicFeedback.length}
            </p>
            <p className="text-sm text-gray-600">Public</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Sections */}
      <Tabs defaultValue="received" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received">
            Received ({userFeedbackReceived.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({userFeedbackSent.length})
          </TabsTrigger>
          <TabsTrigger value="public">
            Public ({publicFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {userFeedbackReceived.length > 0 ? (
            userFeedbackReceived.map((feedbackItem) => (
              <FeedbackCard key={feedbackItem.id} feedbackItem={feedbackItem} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No feedback received yet
                </h3>
                <p className="text-gray-500">
                  Keep up the great work! Feedback will appear here when your
                  teammates share insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {userFeedbackSent.length > 0 ? (
            userFeedbackSent.map((feedbackItem) => (
              <FeedbackCard key={feedbackItem.id} feedbackItem={feedbackItem} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No feedback sent yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start helping your teammates grow by sharing constructive
                  feedback.
                </p>
                <Button onClick={openFeedbackModal} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Share First Feedback
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          {publicFeedback.length > 0 ? (
            publicFeedback.map((feedbackItem) => (
              <FeedbackCard key={feedbackItem.id} feedbackItem={feedbackItem} />
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No public feedback yet
                </h3>
                <p className="text-gray-500">
                  Public feedback and team insights will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
