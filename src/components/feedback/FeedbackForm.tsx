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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { useUserStore } from "@/stores/useUserStore";
import { mockUsers } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const feedbackSchema = z.object({
  toUserId: z.string().optional(),
  message: z.string().min(10, "Feedback must be at least 10 characters"),
  type: z.enum(["positive", "constructive", "general"]),
  isPublic: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export function FeedbackForm() {
  const { isFeedbackModalOpen, closeFeedbackModal, addNotification } =
    useUIStore();
  const { addFeedback } = useFeedbackStore();
  const { currentUser } = useUserStore();

  const availableUsers = mockUsers.filter(
    (user) => user.id !== currentUser?.id,
  );

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      toUserId: "",
      message: "",
      type: "general",
      isPublic: false,
      isAnonymous: false,
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    if (!currentUser) return;

    const recipient = data.toUserId
      ? availableUsers.find((user) => user.id === data.toUserId)
      : undefined;

    addFeedback({
      fromUserId: currentUser.id,
      toUserId: data.toUserId || undefined,
      message: data.message,
      type: data.type,
      isPublic: data.isPublic,
      isAnonymous: data.isAnonymous,
      fromUser: currentUser,
      toUser: recipient,
    });

    addNotification({
      type: "success",
      message: `Feedback ${recipient ? `sent to ${recipient.name}` : "shared with the team"}!`,
    });

    // Reset form
    form.reset();
    closeFeedbackModal();
  };

  const feedbackTypes = [
    {
      value: "positive",
      label: "Positive",
      description: "Celebrate great work",
    },
    {
      value: "constructive",
      label: "Constructive",
      description: "Share improvement ideas",
    },
    { value: "general", label: "General", description: "Team-wide feedback" },
  ];

  return (
    <Dialog open={isFeedbackModalOpen} onOpenChange={closeFeedbackModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Feedback</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Feedback Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-3"
                    >
                      {feedbackTypes.map((type) => (
                        <div
                          key={type.value}
                          className="flex items-center space-x-3"
                        >
                          <RadioGroupItem value={type.value} id={type.value} />
                          <Label
                            htmlFor={type.value}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-500">
                              {type.description}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipient Selection (Optional) */}
            <FormField
              control={form.control}
              name="toUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Leave blank for team-wide feedback" />
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
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts, suggestions, or appreciation..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Privacy Settings */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Submit anonymously
                      </FormLabel>
                      <div className="text-sm text-gray-500">
                        Your name won't be shown with this feedback
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
                        Everyone on the team can see this feedback
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
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Share Feedback
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={closeFeedbackModal}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
