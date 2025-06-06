import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, BarChart3, Users } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const { openKudosModal, openFeedbackModal } = useUIStore();
  const navigate = useNavigate();

  const actions = [
    {
      title: "Give Kudos",
      description: "Recognize a team member",
      icon: Heart,
      action: openKudosModal,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "Share Feedback",
      description: "Provide constructive input",
      icon: MessageSquare,
      action: openFeedbackModal,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Analytics",
      description: "Check team insights",
      icon: BarChart3,
      action: () => navigate("/analytics"),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Team Directory",
      description: "Browse team members",
      icon: Users,
      action: () => navigate("/team"),
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 text-left flex flex-col items-start gap-2 hover:shadow-md transition-all"
              onClick={action.action}
            >
              <div
                className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white`}
              >
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{action.title}</div>
                <div className="text-sm text-gray-500">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
