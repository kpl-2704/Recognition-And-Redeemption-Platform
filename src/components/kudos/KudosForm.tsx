import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUIStore } from "@/stores/useUIStore";
import { useKudosStore } from "@/stores/useKudosStore";
import { useUserStore } from "@/stores/useUserStore";
import { mockUsers, mockKudosTags } from "@/data/mockData";
import { KudosTag, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";

const kudosSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
  isPublic: z.boolean().default(true),
});

type KudosFormData = z.infer<typeof kudosSchema>;

export function KudosForm() {
  const { isKudosModalOpen, closeKudosModal, addNotification } = useUIStore();
  const { addKudos, tags } = useKudosStore();
  const { currentUser } = useUserStore();
  const [selectedTags, setSelectedTags] = useState<KudosTag[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const availableUsers = mockUsers.filter(
    (user) => user.id !== currentUser?.id,
  );

  const form = useForm<KudosFormData>({
    resolver: zodResolver(kudosSchema),
    defaultValues: {
      message: "",
      isPublic: true,
    },
  });

  const toggleTag = (tag: KudosTag) => {
    setSelectedTags((prev) => {
      const exists = prev.find((t) => t.id === tag.id);
      if (exists) {
        return prev.filter((t) => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const onSubmit = (data: KudosFormData) => {
    if (!currentUser || selectedUsers.length === 0) {
      addNotification({
        type: "error",
        message: "Please select at least one recipient.",
      });
      return;
    }

    addKudos({
      fromUserId: currentUser.id,
      toUserId: selectedUsers[0].id,
      message: data.message,
      tags: selectedTags,
      isPublic: data.isPublic,
      fromUser: currentUser,
      toUser: selectedUsers,
      requiresApproval:
        currentUser.role === "admin" &&
        selectedUsers.some((user) => user.role === "user"),
    });

    const userNames = selectedUsers.map((u) => u.name).join(", ");
    addNotification({
      type: "success",
      message: `Kudos sent to ${userNames}!`,
    });

    // Reset form
    form.reset();
    setSelectedTags([]);
    setSelectedUsers([]);
    closeKudosModal();
  };

  return (
    <Dialog open={isKudosModalOpen} onOpenChange={closeKudosModal}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Give Kudos</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Recipients Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Recipients (select multiple)
              </Label>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.name}</span>
                      <button
                        type="button"
                        onClick={() => removeUser(user.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Users */}
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {availableUsers.map((user) => {
                  const isSelected = selectedUsers.some(
                    (u) => u.id === user.id,
                  );
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isSelected
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleUser(user)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">
                          {user.department}
                        </div>
                      </div>
                      {user.role === "admin" && (
                        <Badge variant="outline" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share what you appreciate about their work..."
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium">Tags (optional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => {
                  const isSelected = selectedTags.some((t) => t.id === tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer gap-1 ${isSelected ? tag.color : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      <span>{tag.emoji}</span>
                      {tag.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Public/Private Toggle */}
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Make this public
                    </FormLabel>
                    <div className="text-sm text-gray-500">
                      Everyone on the team can see this kudos
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Approval Notice */}
            {currentUser?.role === "admin" &&
              selectedUsers.some((user) => user.role === "user") && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This kudos will require admin approval before being
                    published, as you're recognizing team members.
                  </p>
                </div>
              )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={selectedUsers.length === 0}
              >
                Send Kudos{" "}
                {selectedUsers.length > 1 && `(${selectedUsers.length} people)`}
              </Button>
              <Button type="button" variant="outline" onClick={closeKudosModal}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
