import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { useKudosStore } from "@/stores/useKudosStore";
import { BudgetManagement } from "@/components/admin/BudgetManagement";
import {
  Shield,
  Users,
  Flag,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Key,
  Crown,
  UserX,
  Clock,
  Award,
  DollarSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { User, Kudos } from "@/types";

export default function Admin() {
  const { setCurrentPage, addNotification } = useUIStore();
  const { currentUser, users, fetchUsers } = useUserStore();
  const { feedback, fetchFeedback } = useFeedbackStore();
  const { kudos, fetchKudos, approveKudos, rejectKudos } = useKudosStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentPage("admin");

    // Fetch data when component mounts
    if (currentUser?.role === "admin") {
      fetchUsers();
      fetchFeedback();
      fetchKudos();
    }
  }, [setCurrentPage, currentUser, fetchUsers, fetchFeedback, fetchKudos]);

  // Check if user is admin - with better error handling
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking user permissions...</p>
        </div>
      </div>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  const pendingFeedback = feedback.filter((f) => f.status === "pending");
  const totalUsers = users.length;
  const totalKudos = kudos.length;
  const totalFeedback = feedback.length;
  const pendingKudosCount = 0; // Kudos don't have status field

  const handleDeleteUser = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const confirmDeleteUser = () => {
    if (deleteConfirmUser) {
      addNotification({
        type: "success",
        message: `User ${deleteConfirmUser.name} deleted successfully`,
      });
      setDeleteConfirmUser(null);
    }
  };

  const handleRoleChange = (userId: string, newRole: "user" | "admin") => {
    const user = users.find((u) => u.id === userId);
    addNotification({
      type: "success",
      message: `${user?.name}'s role updated to ${newRole}`,
    });
  };

  const handlePasswordReset = (user: User) => {
    const newPassword = `temp${Math.random().toString(36).slice(-6)}`;
    addNotification({
      type: "info",
      message: `Password reset for ${user.name}. New password: ${newPassword}`,
    });
  };

  const handleFeedbackAction = (
    feedbackId: string,
    action: "approve" | "flag",
  ) => {
    addNotification({
      type: "success",
      message: `Feedback ${action === "approve" ? "approved" : "flagged"} successfully`,
    });
  };

  const handleKudosApproval = (
    kudosId: string,
    action: "approve" | "reject",
  ) => {
    if (action === "approve") {
      approveKudos(kudosId);
      addNotification({
        type: "success",
        message: "Kudos approved and published!",
      });
    } else {
      rejectKudos(kudosId);
      addNotification({
        type: "info",
        message: "Kudos rejected.",
      });
    }
  };

  const exportData = (type: "kudos" | "feedback" | "users") => {
    addNotification({
      type: "info",
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} data export started`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage users, moderate content, and oversee platform activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportData("users")}>
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" onClick={() => exportData("kudos")}>
            <Download className="w-4 h-4 mr-2" />
            Export Kudos
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Kudos</p>
                <p className="text-2xl font-bold text-gray-900">{totalKudos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Feedback
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalFeedback}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingKudosCount + pendingFeedback.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="kudos">Kudos</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    No recent activity to display.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New User
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Flag className="w-4 h-4 mr-2" />
                    Review Pending Content
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleChange(
                              user.id,
                              user.role === "admin" ? "user" : "admin",
                            )
                          }
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {user.role === "admin"
                            ? "Remove Admin"
                            : "Make Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePasswordReset(user)}
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map((feedbackItem) => (
                  <div
                    key={feedbackItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{feedbackItem.message}</p>
                      <p className="text-sm text-gray-600">
                        From: {feedbackItem.fromUserId} | Type:{" "}
                        {feedbackItem.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(feedbackItem.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {feedbackItem.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleFeedbackAction(feedbackItem.id, "approve")
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleFeedbackAction(feedbackItem.id, "flag")
                          }
                        >
                          <Flag className="w-4 h-4 mr-1" />
                          Flag
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kudos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kudos Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kudos.map((kudosItem) => (
                  <div
                    key={kudosItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{kudosItem.message}</p>
                      <p className="text-sm text-gray-600">
                        From: {kudosItem.fromUserId} | To: {kudosItem.toUserId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(kudosItem.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleKudosApproval(kudosItem.id, "approve")
                        }
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleKudosApproval(kudosItem.id, "reject")
                        }
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <BudgetManagement />
        </TabsContent>
      </Tabs>

      {/* Delete User Confirmation */}
      <AlertDialog
        open={!!deleteConfirmUser}
        onOpenChange={() => setDeleteConfirmUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirmUser?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
