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
import { UserManagementModal } from "@/components/admin/UserManagementModal";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { useKudosStore } from "@/stores/useKudosStore";
import { useUserManagementStore } from "@/stores/useUserManagementStore";
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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { User, Kudos } from "@/types";
import { mockUsers } from "@/data/mockData";

export default function Admin() {
  const { setCurrentPage, addNotification } = useUIStore();
  const { currentUser } = useUserStore();
  const { feedback, updateFeedbackStatus, getPendingFeedback } =
    useFeedbackStore();
  const { kudos, pendingKudos, approveKudos, rejectKudos } = useKudosStore();
  const {
    users,
    updateUserRole,
    deleteUser,
    resetUserPassword,
    addUser,
    updateUser,
  } = useUserManagementStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userModalMode, setUserModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentPage("admin");
  }, [setCurrentPage]);

  // Ensure we have users from either store or mock data
  const allUsers = users.length > 0 ? users : mockUsers;

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

  const pendingFeedback = getPendingFeedback();
  const totalUsers = allUsers.length;
  const totalKudos = kudos.length;
  const totalFeedback = feedback.length;
  const pendingKudosCount = pendingKudos ? pendingKudos.length : 0;

  const handleCreateUser = () => {
    setUserModalMode("create");
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserModalMode("edit");
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteConfirmUser(user);
  };

  const confirmDeleteUser = () => {
    if (deleteConfirmUser) {
      deleteUser(deleteConfirmUser.id);
      addNotification({
        type: "success",
        message: `User ${deleteConfirmUser.name} deleted successfully`,
      });
      setDeleteConfirmUser(null);
    }
  };

  const handleRoleChange = (userId: string, newRole: "user" | "admin") => {
    updateUserRole(userId, newRole);
    const user = allUsers.find((u) => u.id === userId);
    addNotification({
      type: "success",
      message: `${user?.name}'s role updated to ${newRole}`,
    });
  };

  const handlePasswordReset = (user: User) => {
    const newPassword = `temp${Math.random().toString(36).slice(-6)}`;
    resetUserPassword(user.id, newPassword);
    addNotification({
      type: "info",
      message: `Password reset for ${user.name}. New password: ${newPassword}`,
    });
  };

  const handleFeedbackAction = (
    feedbackId: string,
    action: "approve" | "flag",
  ) => {
    const status = action === "approve" ? "reviewed" : "flagged";
    updateFeedbackStatus(feedbackId, status);
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
          <p className="text-gray-600 mt-2">
            Manage team settings and moderate content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => exportData("users")}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            <p className="text-sm text-gray-600">Team Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 font-bold">♥</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalKudos}</p>
            <p className="text-sm text-gray-600">Total Kudos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">💬</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalFeedback}</p>
            <p className="text-sm text-gray-600">Feedback Items</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Flag className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {pendingFeedback.length}
            </p>
            <p className="text-sm text-gray-600">Pending Reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {pendingKudosCount}
            </p>
            <p className="text-sm text-gray-600">Pending Kudos</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="kudos-approval">Kudos Approval</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        New kudos milestone reached
                      </p>
                      <p className="text-xs text-gray-500">
                        150+ kudos exchanged this month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        High team engagement
                      </p>
                      <p className="text-xs text-gray-500">
                        94% of team members active this week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Items pending review
                      </p>
                      <p className="text-xs text-gray-500">
                        {pendingFeedback.length + pendingKudosCount} items
                        awaiting moderation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Contributors This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allUsers.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 text-xs font-bold text-gray-500">
                        #{index + 1}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {user.totalKudosSent}
                        </p>
                        <p className="text-xs text-gray-500">kudos given</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button onClick={handleCreateUser} className="gap-2">
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                            className="gap-1"
                          >
                            {user.role === "admin" && (
                              <Crown className="w-3 h-3" />
                            )}
                            {user.role === "admin" ? "Admin" : "Member"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          {user.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium">
                          {user.totalKudosReceived} received
                        </p>
                        <p className="text-gray-500">
                          {user.totalKudosSent} given
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(
                                user.id,
                                user.role === "admin" ? "user" : "admin",
                              )
                            }
                            className="gap-2"
                          >
                            <Crown className="w-4 h-4" />
                            {user.role === "admin"
                              ? "Remove Admin"
                              : "Make Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePasswordReset(user)}
                            className="gap-2"
                          >
                            <Key className="w-4 h-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user)}
                            className="gap-2 text-red-600"
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kudos-approval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kudos Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingKudos && pendingKudos.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-500">No kudos pending approval</p>
                  </div>
                ) : (
                  pendingKudos?.map((kudosItem) => (
                    <div
                      key={kudosItem.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={kudosItem.fromUser.avatar}
                              alt={kudosItem.fromUser.name}
                            />
                            <AvatarFallback>
                              {kudosItem.fromUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {kudosItem.fromUser.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              wants to give kudos to{" "}
                              {Array.isArray(kudosItem.toUser)
                                ? kudosItem.toUser.map((u) => u.name).join(", ")
                                : kudosItem.toUser.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(kudosItem.createdAt, {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>

                      <p className="text-gray-700 mb-4">
                        "{kudosItem.message}"
                      </p>

                      {kudosItem.tags && kudosItem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {kudosItem.tags.map((tag) => (
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

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleKudosApproval(kudosItem.id, "approve")
                          }
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleKudosApproval(kudosItem.id, "reject")
                          }
                          className="gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  )) || []
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">
                      All clear!
                    </h3>
                    <p className="text-gray-500">No items pending moderation</p>
                  </div>
                ) : (
                  pendingFeedback.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={item.fromUser.avatar}
                              alt={item.fromUser.name}
                            />
                            <AvatarFallback>
                              {item.fromUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{item.fromUser.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(item.createdAt, {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{item.type}</Badge>
                      </div>

                      <p className="text-gray-700 mb-4">"{item.message}"</p>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleFeedbackAction(item.id, "approve")
                          }
                          className="gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedbackAction(item.id, "flag")}
                          className="gap-2"
                        >
                          <Flag className="w-4 h-4" />
                          Flag
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Download className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Kudos Report</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Export all kudos data with analytics
                  </p>
                  <Button
                    onClick={() => exportData("kudos")}
                    className="w-full"
                  >
                    Download CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Download className="w-8 h-8 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Feedback Report</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Export feedback data and trends
                  </p>
                  <Button
                    onClick={() => exportData("feedback")}
                    className="w-full"
                  >
                    Download CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Download className="w-8 h-8 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">User Report</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Export user engagement data
                  </p>
                  <Button
                    onClick={() => exportData("users")}
                    className="w-full"
                  >
                    Download CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        editingUser={editingUser}
        mode={userModalMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmUser}
        onOpenChange={() => setDeleteConfirmUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirmUser?.name}? This
              action cannot be undone. All their kudos and feedback will be
              preserved but attributed to a deleted user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
