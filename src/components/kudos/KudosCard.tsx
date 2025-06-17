import { useState } from "react";
import { Kudos } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentModal } from "./CommentModal";
import { useCommentsStore } from "@/stores/useCommentsStore";
import { useUIStore } from "@/stores/useUIStore";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KudosCardProps {
  kudos: Kudos;
  showActions?: boolean;
}

export function KudosCard({ kudos, showActions = true }: KudosCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const { getCommentsForKudos } = useCommentsStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();

  const comments = getCommentsForKudos(kudos.id);
  const commentCount = comments.length;

  const handleComment = () => {
    setIsCommentModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "TeamPulse Kudos",
        text: `Check out this kudos: "${kudos.message}"`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      const recipients = Array.isArray(kudos.toUser)
        ? kudos.toUser.map((u) => u.name).join(", ")
        : kudos.toUser.name;
      navigator.clipboard.writeText(
        `Check out this kudos from ${kudos.fromUser.name} to ${recipients}: "${kudos.message}"`,
      );
      addNotification({
        type: "success",
        message: "Kudos copied to clipboard!",
      });
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const renderRecipients = () => {
    const recipients = Array.isArray(kudos.toUser)
      ? kudos.toUser
      : [kudos.toUser];
    if (recipients.length === 1) {
      return (
        <button
          onClick={() => handleUserClick(recipients[0].id)}
          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
        >
          {recipients[0].name}
        </button>
      );
    }
    return (
      <span>
        {recipients.slice(0, 2).map((user, index) => (
          <span key={user.id}>
            <button
              onClick={() => handleUserClick(user.id)}
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {user.name}
            </button>
            {index === 0 && recipients.length > 2 && ", "}
            {index === 0 && recipients.length === 2 && " and "}
            {index === 0 && recipients.length > 2 && (
              <span className="text-gray-900">
                {recipients.length - 1} other{recipients.length > 2 ? "s" : ""}
              </span>
            )}
          </span>
        ))}
      </span>
    );
  };

  return (
    <Card className="kudos-card card-hover animate-fade-in transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <button
            onClick={() => handleUserClick(kudos.fromUser.id)}
            className="flex-shrink-0"
          >
            <Avatar className="w-12 h-12 hover:ring-2 hover:ring-blue-200 transition-all">
              <AvatarImage
                src={kudos.fromUser.avatar}
                alt={kudos.fromUser.name}
              />
              <AvatarFallback>{kudos.fromUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => handleUserClick(kudos.fromUser.id)}
                className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {kudos.fromUser.name}
              </button>
              <span className="text-gray-500">gave kudos to</span>
              {renderRecipients()}
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              {kudos.monetaryAmount && kudos.monetaryAmount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 gap-1"
                >
                  <DollarSign className="w-3 h-3" />
                  {kudos.monetaryAmount.toFixed(2)}
                </Badge>
              )}
            </div>

            {/* Message */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              {kudos.message}
            </p>

            {/* Monetary Amount Display */}
            {kudos.monetaryAmount && kudos.monetaryAmount > 0 && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Monetary Kudos: ${kudos.monetaryAmount.toFixed(2)}{" "}
                    {kudos.currency}
                  </span>
                </div>
              </div>
            )}

            {/* Tags */}
            {kudos.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {kudos.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className={`${tag.color} border-0 gap-1`}
                  >
                    <span>{tag.emoji}</span>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>
                  {formatDistanceToNow(kudos.createdAt, { addSuffix: true })}
                </span>
                {kudos.isPublic && (
                  <Badge variant="outline" className="text-xs">
                    Public
                  </Badge>
                )}
              </div>

              {showActions && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleComment}
                    className="h-8 px-3 text-gray-500 hover:text-gray-700 gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {commentCount > 0 && (
                      <span className="text-xs">{commentCount}</span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="h-8 px-2 text-gray-500 hover:text-gray-700"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        kudos={kudos}
      />
    </Card>
  );
}
