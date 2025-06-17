import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore } from "@/stores/useUIStore";
import { DollarSign, Plus, Users, TrendingUp } from "lucide-react";

export function BudgetManagement() {
  const { allBudgets, fetchAllBudgets, allocateBudget, isLoading } =
    useBudgetStore();
  const { users, fetchUsers } = useUserStore();
  const { addNotification } = useUIStore();
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [budgetType, setBudgetType] = useState<"total" | "monthly">("total");

  useEffect(() => {
    fetchAllBudgets();
    fetchUsers();
  }, [fetchAllBudgets, fetchUsers]);

  const handleAllocateBudget = async () => {
    if (!selectedUserId || !amount || parseFloat(amount) <= 0) {
      addNotification({
        type: "error",
        message: "Please select a user and enter a valid amount.",
      });
      return;
    }

    try {
      await allocateBudget(selectedUserId, parseFloat(amount), budgetType);
      addNotification({
        type: "success",
        message: `Budget allocated successfully!`,
      });
      setIsAllocateModalOpen(false);
      setSelectedUserId("");
      setAmount("");
      setBudgetType("total");
    } catch (error) {
      console.error("Failed to allocate budget:", error);
    }
  };

  const getTotalBudgetStats = () => {
    const totalBudget = allBudgets.reduce(
      (sum, budget) => sum + budget.totalBudget,
      0,
    );
    const totalUsed = allBudgets.reduce(
      (sum, budget) => sum + budget.usedBudget,
      0,
    );
    const totalAvailable = totalBudget - totalUsed;
    const totalMonthlyBudget = allBudgets.reduce(
      (sum, budget) => sum + budget.monthlyBudget,
      0,
    );

    return {
      totalBudget,
      totalUsed,
      totalAvailable,
      totalMonthlyBudget,
    };
  };

  const stats = getTotalBudgetStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Budget Management
          </h2>
          <p className="text-gray-600">
            Manage employee budgets for monetary kudos
          </p>
        </div>
        <Button onClick={() => setIsAllocateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Allocate Budget
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Budget
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalBudget.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalAvailable.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalUsed.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Monthly Budget
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalMonthlyBudget.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Employee
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Total Budget
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Used
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Available
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Monthly Budget
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {allBudgets.map((budget) => (
                  <tr key={budget.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {budget.user?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {budget.user?.email || "No email"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {budget.user?.department || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      ${budget.totalBudget.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      ${budget.usedBudget.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          budget.availableBudget > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${budget.availableBudget.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      ${budget.monthlyBudget.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          budget.availableBudget > 0 ? "default" : "destructive"
                        }
                        className={
                          budget.availableBudget > 0
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {budget.availableBudget > 0 ? "Active" : "Exhausted"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Allocate Budget Modal */}
      <Dialog open={isAllocateModalOpen} onOpenChange={setIsAllocateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user">Select Employee</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.department || "No Department"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type">Budget Type</Label>
              <Select
                value={budgetType}
                onValueChange={(value: "total" | "monthly") =>
                  setBudgetType(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total Budget</SelectItem>
                  <SelectItem value="monthly">Monthly Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAllocateBudget}
                disabled={!selectedUserId || !amount || isLoading}
                className="flex-1"
              >
                {isLoading ? "Allocating..." : "Allocate Budget"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAllocateModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
