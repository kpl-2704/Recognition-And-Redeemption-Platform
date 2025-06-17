import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
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
import { useBudgetStore } from "@/stores/useBudgetStore";
import { KudosTag, User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, DollarSign, AlertCircle } from "lucide-react";

const kudosSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters"),
  isPublic: z.boolean().default(true),
  monetaryAmount: z.number().min(0, "Amount must be positive").optional(),
  currency: z.string().default("USD"),
});

type KudosFormData = z.infer<typeof kudosSchema>;

export function KudosForm() {
  const { isKudosModalOpen, closeKudosModal, addNotification } = useUIStore();
  const { addKudos, tags, fetchKudosTags, isLoading } = useKudosStore();
  const { currentUser, users, fetchUsers } = useUserStore();
  const { myBudget, fetchMyBudget } = useBudgetStore();
  const [selectedTags, setSelectedTags] = useState<KudosTag[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // Fetch users, tags, and budget when component mounts
  useEffect(() => {
    if (isKudosModalOpen) {
      fetchUsers();
      fetchKudosTags();
      fetchMyBudget();
    }
  }, [isKudosModalOpen, fetchUsers, fetchKudosTags, fetchMyBudget]);

  const availableUsers = users.filter((user) => user.id !== currentUser?.id);

  const form = useForm<KudosFormData>({
    resolver: zodResolver(kudosSchema),
    defaultValues: {
      message: "",
      isPublic: true,
      monetaryAmount: 0,
      currency: "USD",
    },
  });

  const monetaryAmount = form.watch("monetaryAmount") || 0;
  const availableBudget = myBudget?.availableBudget || 0;
  const availableMonthlyBudget = myBudget?.availableMonthlyBudget || 0;

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

  const onSubmit = async (data: KudosFormData) => {
    if (!currentUser || selectedUsers.length === 0) {
      addNotification({
        type: "error",
        message: "Please select at least one recipient.",
      });
      return;
    }

    // Validate budget if monetary amount is provided
    if (data.monetaryAmount && data.monetaryAmount > 0) {
      if (!myBudget) {
        addNotification({
          type: "error",
          message: "No budget allocated. Please contact your manager.",
        });
        return;
      }

      if (availableBudget < data.monetaryAmount) {
        addNotification({
          type: "error",
          message: `Insufficient budget. Available: $${availableBudget.toFixed(2)}, Required: $${data.monetaryAmount.toFixed(2)}`,
        });
        return;
      }

      if (availableMonthlyBudget < data.monetaryAmount) {
        addNotification({
          type: "error",
          message: `Insufficient monthly budget. Available: $${availableMonthlyBudget.toFixed(2)}, Required: $${data.monetaryAmount.toFixed(2)}`,
        });
        return;
      }
    }

    try {
      // For now, we'll send kudos to the first selected user
      // In the future, we can extend the API to support multiple recipients
      const recipient = selectedUsers[0];

      await addKudos({
        toUserId: recipient.id,
        message: data.message,
        tagIds: selectedTags.map((tag) => tag.id),
        isPublic: data.isPublic,
        monetaryAmount: data.monetaryAmount,
        currency: data.currency,
      });

      const userNames = selectedUsers.map((u) => u.name).join(", ");
      const amountText = data.monetaryAmount
        ? ` worth $${data.monetaryAmount}`
        : "";
      addNotification({
        type: "success",
        message: `Kudos${amountText} sent to ${userNames}!`,
      });

      // Reset form
      form.reset();
      setSelectedTags([]);
      setSelectedUsers([]);
      closeKudosModal();
    } catch (error) {
      console.error("Failed to send kudos:", error);
      addNotification({
        type: "error",
        message: "Failed to send kudos. Please try again.",
      });
    }
  };

  return (
    <Dialog open={isKudosModalOpen} onOpenChange={closeKudosModal}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Give Kudos</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Budget Display */}
            {myBudget && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <Label className="text-sm font-medium text-blue-900">
                    Your Budget
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Available:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      ${availableBudget.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Available:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      ${availableMonthlyBudget.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

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

            {/* Monetary Amount */}
            <FormField
              control={form.control}
              name="monetaryAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monetary Amount (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-10"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {monetaryAmount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      {monetaryAmount > availableBudget ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Exceeds total budget</span>
                        </div>
                      ) : monetaryAmount > availableMonthlyBudget ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Exceeds monthly budget</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <span>✓ Budget available</span>
                        </div>
                      )}
                    </div>
                  )}
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
              <Button
                type="submit"
                className="flex-1"
                disabled={selectedUsers.length === 0 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    Send Kudos{" "}
                    {selectedUsers.length > 1 &&
                      `(${selectedUsers.length} people)`}
                    {monetaryAmount > 0 && ` - $${monetaryAmount.toFixed(2)}`}
                  </>
                )}
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
