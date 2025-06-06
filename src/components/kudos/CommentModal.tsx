import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCommentsStore } from "@/stores/useCommentsStore";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore } from "@/stores/useUIStore";
import { Kudos } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageCircle } from "lucide-react";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  kudos: Kudos | null;
}

export function CommentModal({ isOpen, onClose, kudos }: CommentModalProps) {
  const [newComment, setNewComment] = useState("");
  const { addComment, getCommentsForKudos } = useCommentsStore();
  const { currentUser } = useUserStore();
  const { addNotification } = useUIStore();

  if (!kudos || !currentUser) return null;

  const comments = getCommentsForKudos(kudos.id);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    addComment(kudos.id, newComment.trim(), currentUser);
    addNotification({
      type: "success",
      message: "Comment added successfully!",
    });
    setNewComment("");
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Kudos Comments
          </DialogTitle>
        </DialogHeader>

        {/* Original Kudos */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={kudos.fromUser.avatar}
                alt={kudos.fromUser.name}
              />
              <AvatarFallback>{kudos.fromUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">
                  {kudos.fromUser.name}
                </span>
                <span className="text-gray-500 text-sm">gave kudos to</span>
                <span className="font-medium text-sm">{kudos.toUser.name}</span>
              </div>
              <p className="text-sm text-gray-700">{kudos.message}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-3 max-h-60">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={comment.user.avatar}
                    alt={comment.user.name}
                  />
                  <AvatarFallback className="text-xs">
                    {comment.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(comment.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="border-t pt-4 mt-4">
          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="text-xs">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Comment
                </Button>
                <Button onClick={handleShare} variant="outline" size="sm">
                  Share Kudos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
