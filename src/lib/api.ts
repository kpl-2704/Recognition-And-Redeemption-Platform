const API_BASE_URL =
  "https://recognition-and-redeemption-platform.onrender.com/api";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth-token");
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      }
    } catch (parseError) {
      // If we can't parse the error response, use the status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }
  return response.json();
};

// API service class
class ApiService {
  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    department?: string;
    role?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  }

  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    // Store token
    if (data.token) {
      localStorage.setItem("auth-token", data.token);
    }
    return data;
  }

  async getCurrentUser() {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async updateProfile(profileData: {
    name?: string;
    department?: string;
    avatar?: string;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  }

  async logout() {
    const token = getAuthToken();
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    localStorage.removeItem("auth-token");
  }

  // User endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    role?: string;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await fetch(`${API_BASE_URL}/users?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async searchUsers(query: string, limit = 10) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(
      `${API_BASE_URL}/users/search/users?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return handleResponse(response);
  }

  async getUserById(id: string) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Kudos endpoints
  async getKudos(params?: {
    page?: number;
    limit?: number;
    fromUserId?: string;
    toUserId?: string;
    status?: string;
    isPublic?: boolean;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await fetch(`${API_BASE_URL}/kudos?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async createKudos(kudosData: {
    toUserId: string;
    message: string;
    tagIds?: string[];
    isPublic?: boolean;
    monetaryAmount?: number;
    currency?: string;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/kudos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(kudosData),
    });
    return handleResponse(response);
  }

  async getKudosById(id: string) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/kudos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async approveKudos(id: string, reason?: string) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/kudos/${id}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  }

  async rejectKudos(id: string, reason?: string) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/kudos/${id}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  }

  async getKudosTags() {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/kudos/tags/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Feedback endpoints
  async getFeedback(params?: {
    page?: number;
    limit?: number;
    fromUserId?: string;
    toUserId?: string;
    type?: string;
    status?: string;
    isPublic?: boolean;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await fetch(`${API_BASE_URL}/feedback?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async createFeedback(feedbackData: {
    toUserId?: string;
    message: string;
    type: "POSITIVE" | "CONSTRUCTIVE" | "GENERAL";
    isPublic?: boolean;
    isAnonymous?: boolean;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(feedbackData),
    });
    return handleResponse(response);
  }

  // Activity endpoints
  async getActivities(params?: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await fetch(`${API_BASE_URL}/activities?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Voucher endpoints
  async getVouchers(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    type?: string;
    isRedeemed?: boolean;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await fetch(`${API_BASE_URL}/vouchers?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async redeemVoucher(id: string) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/vouchers/${id}/redeem`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Comment endpoints
  async getComments(params: {
    kudosId?: string;
    feedbackId?: string;
    page?: number;
    limit?: number;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });

    const response = await fetch(`${API_BASE_URL}/comments?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async createComment(commentData: {
    message: string;
    kudosId?: string;
    feedbackId?: string;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    });
    return handleResponse(response);
  }

  // Notification endpoints
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/notifications?${searchParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return handleResponse(response);
  }

  async markNotificationAsRead(id: string) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async markAllNotificationsAsRead() {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  // Budget endpoints
  async getMyBudget() {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/budgets/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async updateMyBudget(budgetData: {
    totalBudget?: number;
    monthlyBudget?: number;
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/budgets/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(budgetData),
    });
    return handleResponse(response);
  }

  async getAllBudgets() {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/budgets/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async getUserBudget(userId: string) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/budgets/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }

  async allocateBudget(allocateData: {
    userId: string;
    amount: number;
    type: "total" | "monthly";
  }) {
    const token = getAuthToken();
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${API_BASE_URL}/budgets/allocate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(allocateData),
    });
    return handleResponse(response);
  }
}

export const api = new ApiService();
