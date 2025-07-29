import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore } from "@/stores/useUIStore";
import { Zap, Users, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, register, isLoading, error, clearError, isAuthenticated } =
    useUserStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "user" as "user" | "admin",
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (isLoginMode) {
        console.log("Attempting login with:", { email: formData.email });
        await login(formData.email, formData.password);
        console.log("Login successful, navigating to /");
        addNotification({
          type: "success",
          message: "Welcome back! 👋",
        });
      } else {
        console.log("Attempting registration with:", {
          email: formData.email,
          name: formData.name,
        });
        await register(formData);
        console.log("Registration successful, navigating to /");
        addNotification({
          type: "success",
          message: "Account created successfully! Welcome to TeamPulse! 🎉",
        });
      }

      // Add a small delay to ensure state is updated
      setTimeout(() => {
        console.log("Navigating to dashboard...");
        navigate("/");
      }, 100);
    } catch (error) {
      // Log the full error for debugging
      console.error("Login/Register error details:", {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      });

      // Error is already handled by the store, but let's make sure we show a user-friendly message
      if (!error || typeof error === "object") {
        addNotification({
          type: "error",
          message: "Login failed. Please check your credentials and try again.",
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to TeamPulse
          </h1>
          <p className="text-xl text-gray-600">
            Real-time employee feedback and recognition platform
          </p>
        </div>

        {/* Login/Register Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              {isLoginMode ? "Sign In" : "Create Account"}
            </CardTitle>
            <p className="text-gray-600">
              {isLoginMode
                ? "Welcome back! Please sign in to your account"
                : "Join TeamPulse and start recognizing your team"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required={!isLoginMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      type="text"
                      placeholder="e.g., Engineering, Marketing, Sales"
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                    >
                      <option value="user">Team Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLoginMode ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : isLoginMode ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <Button
                variant="link"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    department: "",
                    role: "user",
                  });
                  clearError();
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                {isLoginMode
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Button>

              <div className="border-t pt-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full text-green-600 border-green-200 hover:bg-green-50"
                >
                  🚀 Access Dashboard Without Login
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  You can explore all features without creating an account
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="font-semibold">Important</div>
              <div className="text-sm text-gray-500">
                <div>Use This crediantials to login</div>
                <div className="text-sm">username: kapilm@gmail.com</div>
                <div className="text-sm">password: Qwerty@123</div>
              </div>
            </div>

            {/* Demo Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                🧪 Demo Mode
              </h4>
              <p className="text-xs text-blue-700">
                You can use any email/password combination to test the app. The
                backend will create a demo account for you.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
