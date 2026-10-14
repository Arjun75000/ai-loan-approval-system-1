const API_BASE = "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
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
  getLoanById: (id) => request(`/loans/${id}`),
  deleteLoan: (id) => request(`/loans/${id}`, { method: "DELETE" }),
  getReportDownloadUrl: (id, format = "json") => `${API_BASE}/reports/${id}?format=${format}`
};
