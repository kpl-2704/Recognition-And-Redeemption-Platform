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
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface KudosCardProps {
  kudos: Kudos;
  showActions?: boolean;
}

export function KudosCard({ kudos, showActions = true }: KudosCardProps) {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const { getCommentsForKudos } = useCommentsStore();
  const { addNotification } = useUIStore();

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
      navigator.clipboard.writeText(
        `Check out this kudos from ${kudos.fromUser.name} to ${kudos.toUser.name}: "${kudos.message}"`,
      );
      addNotification({
        type: "success",
        message: "Kudos copied to clipboard!",
      });
    }
  };

  return (
    <Card className="kudos-card card-hover animate-fade-in transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage
              src={kudos.fromUser.avatar}
              alt={kudos.fromUser.name}
            />
            <AvatarFallback>{kudos.fromUser.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900">
                {kudos.fromUser.name}
              </span>
              <span className="text-gray-500">gave kudos to</span>
              <span className="font-medium text-gray-900">
                {kudos.toUser.name}
              </span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </div>

            {/* Message */}
            <p className="text-gray-700 mb-4 leading-relaxed">
              {kudos.message}
            </p>

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
