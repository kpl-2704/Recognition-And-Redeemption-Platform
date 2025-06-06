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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/stores/useUIStore";
import { useUserStore } from "@/stores/useUserStore";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { useKudosStore } from "@/stores/useKudosStore";
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
} from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";

export default function Admin() {
  const { setCurrentPage, addNotification } = useUIStore();
  const { currentUser } = useUserStore();
  const { feedback, updateFeedbackStatus, getPendingFeedback } =
    useFeedbackStore();
  const { kudos } = useKudosStore();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setCurrentPage("admin");
  }, [setCurrentPage]);

  // Check if user is admin
  if (!currentUser || currentUser.role !== "admin") {
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
  const totalUsers = mockUsers.length;
  const totalKudos = kudos.length;
  const totalFeedback = feedback.length;

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      </div>

      {/* Main Admin Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
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
                        Feedback pending review
                      </p>
                      <p className="text-xs text-gray-500">
                        {pendingFeedback.length} items awaiting moderation
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
                  {mockUsers.slice(0, 5).map((user, index) => (
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
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsers.map((user) => (
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
                          >
                            {user.role}
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
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem>Edit Permissions</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
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
    </div>
  );
}
