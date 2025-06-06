import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageSquare, Users, TrendingUp } from "lucide-react";
import { useKudosStore } from "@/stores/useKudosStore";
import { useFeedbackStore } from "@/stores/useFeedbackStore";
import { mockUsers } from "@/data/mockData";

export function StatsCards() {
  const { kudos } = useKudosStore();
  const { feedback } = useFeedbackStore();

  const thisMonth = new Date();
  thisMonth.setDate(1);

  const thisMonthKudos = kudos.filter((k) => k.createdAt >= thisMonth).length;
  const thisMonthFeedback = feedback.filter(
    (f) => f.createdAt >= thisMonth,
  ).length;

  const stats = [
    {
      title: "Total Kudos",
      value: kudos.length,
      change: `+${thisMonthKudos} this month`,
      icon: Heart,
      color: "text-red-600 bg-red-100",
    },
    {
      title: "Feedback Shared",
      value: feedback.length,
      change: `+${thisMonthFeedback} this month`,
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Team Members",
      value: mockUsers.length,
      change: "All active",
      icon: Users,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Engagement",
      value: "94%",
      change: "+2% from last month",
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="transition-all duration-200 hover:shadow-md"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
