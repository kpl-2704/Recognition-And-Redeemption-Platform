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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useUserManagementStore } from "@/stores/useUserManagementStore";
import { useUIStore } from "@/stores/useUIStore";
import { User } from "@/types";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  role: z.enum(["user", "admin"]),
  password: z.string().min(1, "Password is required"),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: User | null;
  mode: "create" | "edit";
}

export function UserManagementModal({
  isOpen,
  onClose,
  editingUser,
  mode,
}: UserManagementModalProps) {
  const { addUser, updateUser } = useUserManagementStore();
  const { addNotification } = useUIStore();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      department: editingUser?.department || "",
      role: editingUser?.role || "user",
      password: "",
    },
  });

  const onSubmit = (data: UserFormData) => {
    try {
      if (mode === "create") {
        addUser(data);
        addNotification({
          type: "success",
          message: `User ${data.name} created successfully!`,
        });
      } else if (mode === "edit" && editingUser) {
        updateUser(editingUser.id, {
          name: data.name,
          email: data.email,
          department: data.department,
          role: data.role,
        });
        addNotification({
          type: "success",
          message: `User ${data.name} updated successfully!`,
        });
      }

      form.reset({
        name: "",
        email: "",
        department: "",
        role: "user",
        password: "",
      });
      onClose();
    } catch (error) {
      addNotification({
        type: "error",
        message: "An error occurred while saving the user.",
      });
    }
  };

  const departments = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
    "Operations",
    "HR",
    "Finance",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New User" : "Edit User"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department */}
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Team Member</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {mode === "create"
                      ? "Password"
                      : "New Password (leave blank to keep current)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        mode === "create"
                          ? "Enter password"
                          : "Enter new password"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {mode === "create" ? "Create User" : "Update User"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
