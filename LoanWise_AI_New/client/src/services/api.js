const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("loanwise_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const api = {
  getHealth: () => request("/health"),
  getMlStatus: () => request("/ml/status"),
  getMlMetrics: () => request("/ml/metrics"),
  getFeatureImportance: () => request("/ml/feature-importance"),
  getEvaluationReport: () => request("/ml/evaluation"),
  getDatasetHealth: () => request("/ml/dataset-health"),
  predictLoan: (data) => request("/loans/predict", { method: "POST", body: JSON.stringify(data) }),
  compareScenarios: (scenarios) => request("/loans/compare", { method: "POST", body: JSON.stringify({ scenarios }) }),
  calculateEmi: (data) => request("/loans/calculate-emi", { method: "POST", body: JSON.stringify(data) }),
  getHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/loans/history${query ? `?${query}` : ""}`);
  },
  getUserStats: () => request("/loans/user-stats"),
  getLoanById: (id) => request(`/loans/${id}`),
  deleteLoan: (id) => request(`/loans/${id}`, { method: "DELETE" }),
  getReportDownloadUrl: (id, format = "json") => `${API_BASE}/reports/${id}?format=${format}`,

  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  adminLogin: (data) => request("/auth/admin/login", { method: "POST", body: JSON.stringify(data) }),
  getProfile: () => request("/auth/profile"),
  updateProfile: (data) => request("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  forgotPassword: (email) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token, newPassword) => request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) }),

  getAdminStats: () => request("/admin/stats"),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ""}`);
  },
  updateUserStatus: (id, data) => request(`/admin/users/${id}/status`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  getAllAnalyses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/analyses${query ? `?${query}` : ""}`);
  }
};
