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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { KudosTag } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const kudosSchema = z.object({
  toUserId: z.string().min(1, "Please select a recipient"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  isPublic: z.boolean().default(true),
});

type KudosFormData = z.infer<typeof kudosSchema>;

export function KudosForm() {
  const { isKudosModalOpen, closeKudosModal, addNotification } = useUIStore();
  const { addKudos, tags } = useKudosStore();
  const { currentUser } = useUserStore();
  const [selectedTags, setSelectedTags] = useState<KudosTag[]>([]);

  const availableUsers = mockUsers.filter(
    (user) => user.id !== currentUser?.id,
  );

  const form = useForm<KudosFormData>({
    resolver: zodResolver(kudosSchema),
    defaultValues: {
      toUserId: "",
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

  const onSubmit = (data: KudosFormData) => {
    if (!currentUser) return;

    const recipient = availableUsers.find((user) => user.id === data.toUserId);
    if (!recipient) return;

    addKudos({
      fromUserId: currentUser.id,
      toUserId: data.toUserId,
      message: data.message,
      tags: selectedTags,
      isPublic: data.isPublic,
      fromUser: currentUser,
      toUser: recipient,
    });

    addNotification({
      type: "success",
      message: `Kudos sent to ${recipient.name}!`,
    });

    // Reset form
    form.reset();
    setSelectedTags([]);
    closeKudosModal();
  };

  return (
    <Dialog open={isKudosModalOpen} onOpenChange={closeKudosModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Give Kudos</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Recipient Selection */}
            <FormField
              control={form.control}
              name="toUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback className="text-xs">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-gray-500">
                                {user.department}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Send Kudos
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
