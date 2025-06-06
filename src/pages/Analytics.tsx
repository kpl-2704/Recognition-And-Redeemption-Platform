import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCards } from "@/components/analytics/StatsCards";
import { Leaderboard } from "@/components/analytics/Leaderboard";
import { useUIStore } from "@/stores/useUIStore";
import { useKudosStore } from "@/stores/useKudosStore";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { mockKudosStats } from "@/data/mockData";

export default function Analytics() {
  const { setCurrentPage } = useUIStore();
  const { tags } = useKudosStore();

  useEffect(() => {
    setCurrentPage("analytics");
  }, [setCurrentPage]);

  // Generate tag usage data
  const tagData = mockKudosStats.topTags.map((item) => ({
    name: item.tag.name,
    value: item.count,
    emoji: item.tag.emoji,
    color: item.tag.color,
  }));

  const COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  // Weekly trend data
  const weeklyData = [
    { week: "Week 1", kudos: 12, feedback: 4 },
    { week: "Week 2", kudos: 19, feedback: 7 },
    { week: "Week 3", kudos: 15, feedback: 3 },
    { week: "Week 4", kudos: 22, feedback: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Insights into team engagement and recognition patterns
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsCards />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kudos Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Recognition Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockKudosStats.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="kudos" fill="#ef4444" name="Kudos" />
                <Bar dataKey="feedback" fill="#3b82f6" name="Feedback" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tag Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Recognition Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={tagData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tagData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {tagData.map((tag, index) => (
                  <div
                    key={tag.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm">
                        {tag.emoji} {tag.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{tag.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Leaderboard />
        </div>
      </div>

      {/* Team Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Most Active Day
              </h3>
              <p className="text-3xl font-bold text-blue-600">Tuesday</p>
              <p className="text-sm text-gray-500">Average 18 kudos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Response Rate
              </h3>
              <p className="text-3xl font-bold text-green-600">94%</p>
              <p className="text-sm text-gray-500">Team engagement</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Average Response Time
              </h3>
              <p className="text-3xl font-bold text-purple-600">2.3h</p>
              <p className="text-sm text-gray-500">For feedback</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
